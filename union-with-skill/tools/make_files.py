"""Generate the sample files the document registry links to.

Run once (or after editing src/data/documents.json):
    python3 tools/make_files.py
PDF via headless Chrome (Playwright), DOCX via python-docx, XLSX via openpyxl.
"""
import json
from pathlib import Path

from docx import Document
from openpyxl import Workbook
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "files"
FONT = ROOT / "node_modules/@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2"
DATA = json.loads((ROOT / "src/data/documents.json").read_text(encoding="utf-8"))
CATS = {c["id"]: c["label"] for c in DATA["categories"]}
ORG = "Межрегиональный профессиональный союз работников промышленности «Общий цех»"
NOTE = "Образец для демонстрации сайта. Организация, документ и все реквизиты вымышлены."

PARAGRAPHS = [
    "Настоящий документ принят в соответствии с Уставом профсоюза и Федеральным законом "
    "«О профессиональных союзах, их правах и гарантиях деятельности».",
    "Первичным профсоюзным организациям рекомендуется довести положения документа до сведения "
    "членов профсоюза и учитывать их при ведении коллективных переговоров с работодателем.",
    "Контроль за исполнением возлагается на Президиум Совета профсоюза. Разъяснения по применению "
    "даёт правовая инспекция труда профсоюза.",
    "Документ вступает в силу со дня принятия и действует до принятия нового решения уполномоченным "
    "органом профсоюза.",
]


def date_ru(iso):
    y, m, d = iso.split("-")
    return f"{d}.{m}.{y}"


def body_for(doc):
    # Longer documents for the charter and agreements, so file sizes differ.
    n = 12 if doc["category"] in ("ustav", "kd") else 4
    return [f"{i + 1}. {PARAGRAPHS[i % len(PARAGRAPHS)]}" for i in range(n)]


def make_pdf(page, doc, path):
    paras = "".join(f"<p>{p}</p>" for p in body_for(doc))
    html = f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>
      @font-face {{ font-family: Onest; src: url('{FONT.as_uri()}'); font-weight: 100 900; }}
      body {{ font: 12pt/1.5 Onest, sans-serif; margin: 0; }}
      header {{ border-bottom: 2pt solid #000; padding-bottom: 8pt; margin-bottom: 24pt; font-size: 10pt; }}
      h1 {{ font-size: 16pt; line-height: 1.3; }}
      .note {{ margin-top: 32pt; font-size: 9pt; color: #555; }}
    </style></head><body>
      <header>{ORG}</header>
      <p>№ {doc["number"]} от {date_ru(doc["date"])} · {CATS[doc["category"]]}</p>
      <h1>{doc["title"]}</h1>{paras}
      <p class="note">{NOTE}</p>
    </body></html>"""
    page.set_content(html, wait_until="load")
    page.pdf(path=str(path), format="A4", margin={"top": "20mm", "bottom": "20mm", "left": "25mm", "right": "15mm"})


def make_docx(doc, path):
    d = Document()
    d.add_paragraph(ORG)
    d.add_paragraph(f"№ {doc['number']} от {date_ru(doc['date'])}")
    d.add_heading(doc["title"], level=1)
    for p in body_for(doc):
        d.add_paragraph(p)
    table = d.add_table(rows=4, cols=2)
    for row, label in zip(table.rows, ["Предприятие", "Подразделение", "Дата проверки", "Подпись"]):
        row.cells[0].text = label
    d.add_paragraph(NOTE)
    d.save(path)


def make_xlsx(doc, path):
    wb = Workbook()
    ws = wb.active
    ws.title = "Данные"
    ws.append([doc["title"]])
    ws.append([f"№ {doc['number']} от {date_ru(doc['date'])}"])
    ws.append([])
    ws.append(["Предприятие", "Город", "Средняя зарплата, ₽", "Изменение к 2025, %"])
    rows = [
        ("АО «Стальной контур»", "Екатеринбург", 78400, 9.1),
        ("ООО «Волжские редукторы»", "Самара", 71250, 7.4),
        ("АО «Тагильская опока»", "Нижний Тагил", 69900, 8.2),
        ("ООО «Камский станкозавод»", "Пермь", 74100, 6.8),
        ("АО «Тольяттинский прессовый цех»", "Тольятти", 72600, 7.9),
    ]
    for r in rows:
        ws.append(r)
    ws.append([])
    ws.append([NOTE])
    wb.save(path)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome")
        page = browser.new_page()
        for doc in DATA["documents"]:
            path = OUT / f"{doc['file']}.{doc['ext']}"
            {"pdf": lambda: make_pdf(page, doc, path), "docx": lambda: make_docx(doc, path),
             "xlsx": lambda: make_xlsx(doc, path)}[doc["ext"]]()
            print(path.name, path.stat().st_size)
        browser.close()


if __name__ == "__main__":
    main()
