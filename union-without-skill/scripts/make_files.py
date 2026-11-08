"""Генерирует демонстрационные файлы документов (PDF, DOCX, XLSX) в src/files/.

Запуск: python3 scripts/make_files.py
"""
import json
import pathlib

from docx import Document
from openpyxl import Workbook
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "files"
DATA = json.loads((ROOT / "content" / "documents.json").read_text(encoding="utf-8"))
FONT = (ROOT / "node_modules/@fontsource-variable/golos-text/files/golos-text-cyrillic-wght-normal.woff2").as_uri()
CATS = {c["id"]: c["name"] for c in DATA["categories"]}
UNION = "Межрегиональная профсоюзная организация работников промышленности и транспорта «Сцепка»"

PARAGRAPHS = [
    "Настоящий документ размещён на сайте профсоюза в демонстрационных целях. Текст является условным и не порождает правовых последствий.",
    "1. Общие положения. Документ определяет порядок действий выборных органов профсоюза, первичных профсоюзных организаций и членов профсоюза в пределах предмета регулирования.",
    "2. Права и обязанности сторон. Стороны руководствуются Трудовым кодексом Российской Федерации, Федеральным законом «О профессиональных союзах, их правах и гарантиях деятельности» и Уставом профсоюза.",
    "3. Порядок взаимодействия. Обращения членов профсоюза рассматриваются профсоюзным комитетом в срок не более тридцати календарных дней со дня поступления.",
    "4. Контроль за исполнением. Контроль за исполнением настоящего документа возлагается на Президиум профсоюза и ревизионную комиссию.",
    "5. Заключительные положения. Документ вступает в силу со дня его утверждения и действует до принятия нового документа.",
]


def ru_date(iso):
    y, m, d = iso.split("-")
    return f"{d}.{m}.{y}"


def make_pdf(page, item):
    paras = "".join(f"<p>{p}</p>" for p in PARAGRAPHS * 3)
    html = f"""<!doctype html><html lang="ru"><meta charset="utf-8"><style>
    @font-face {{ font-family: G; src: url({FONT}); font-weight: 400 900; }}
    body {{ font-family: G, sans-serif; font-size: 12pt; line-height: 1.5; color: #111; margin: 0; }}
    .head {{ border-bottom: 2px solid #b8321a; padding-bottom: 8pt; margin-bottom: 18pt; font-size: 10pt; }}
    h1 {{ font-size: 16pt; line-height: 1.3; }}
    .meta {{ color: #444; }}
    </style><body>
    <div class="head">{UNION}</div>
    <p class="meta">№ {item['number']} от {ru_date(item['date'])} · {CATS[item['category']]}</p>
    <h1>{item['title']}</h1>{paras}</body></html>"""
    page.set_content(html, wait_until="load")
    page.pdf(path=str(OUT / item["file"]), format="A4", margin={"top": "20mm", "bottom": "20mm", "left": "25mm", "right": "15mm"})


def make_docx(item):
    doc = Document()
    doc.add_paragraph(UNION)
    doc.add_paragraph(f"№ {item['number']} от {ru_date(item['date'])}")
    doc.add_heading(item["title"], level=1)
    for p in PARAGRAPHS * 2:
        doc.add_paragraph(p)
    doc.save(OUT / item["file"])


def make_xlsx(item):
    wb = Workbook()
    ws = wb.active
    ws.title = "Смета 2026"
    ws.append([item["title"]])
    ws.append([])
    ws.append(["Статья", "План, тыс. руб.", "Доля, %"])
    rows = [
        ("Членские взносы (поступления)", 41250),
        ("Отчисления в фонд солидарности", -4125),
        ("Правовая помощь и юридическая приёмная", -6180),
        ("Обучение профактива", -5240),
        ("Охрана труда и общественный контроль", -3900),
        ("Культурно-массовая и спортивная работа", -4600),
        ("Информационная работа", -1850),
        ("Содержание аппарата", -12300),
        ("Резерв", -3055),
    ]
    for name, value in rows:
        ws.append([name, value, round(abs(value) / 41250 * 100, 1)])
    ws.column_dimensions["A"].width = 46
    ws.column_dimensions["B"].width = 18
    wb.save(OUT / item["file"])


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome")
        page = browser.new_page()
        for item in DATA["items"]:
            ext = item["file"].rsplit(".", 1)[1]
            if ext == "pdf":
                make_pdf(page, item)
            elif ext == "docx":
                make_docx(item)
            elif ext == "xlsx":
                make_xlsx(item)
            print("ok", item["file"])
        browser.close()


if __name__ == "__main__":
    main()
