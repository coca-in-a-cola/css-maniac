"""Render checks for dist/: screenshots, horizontal overflow, WCAG contrast, the no-JS filter.

    python3 tools/check.py [out_dir]

The sandbox cannot reach the photo hosts, so hotlinked photos are answered
with a local placeholder of the same role (layout stays real, pixels don't).
"""
import functools
import http.server
import io
import sys
import threading
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "tools/screens"
WIDTHS = [360, 768, 1024, 1440]
PAGES = ["index", "documents", "projects", "news", "news-indeksatsiya-2027", "about"]

CONTRAST_JS = """
() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const firstColor = (img) => (img.match(/(?:oklch|oklab|rgba?|color)\\([^()]*(?:\\([^()]*\\)[^()]*)*\\)/) || [])[0];
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      const c = rgba(s.backgroundColor);
      if (c[3] > 0.5) return c;
      if (s.backgroundImage !== 'none' && firstColor(s.backgroundImage)) return rgba(firstColor(s.backgroundImage));
    }
    return [255, 255, 255, 1];
  };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const n = walker.currentNode; const el = n.parentElement;
    if (!n.textContent.trim() || seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || el.closest('.visually-hidden, .skip-link')) continue;
    const s = getComputedStyle(el);
    const fg = rgba(s.color), bg = bgOf(el);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(s.fontSize), w = parseInt(s.fontWeight, 10);
    const large = px >= 24 || (px >= 18.66 && w >= 700);
    out.push({ text: n.textContent.trim().slice(0, 40), ratio: Math.round(ratio * 100) / 100, need: large ? 3 : 4.5, cls: el.className || el.tagName });
  }
  return out;
}
"""


def placeholder():
    im = Image.new("RGB", (1200, 800), (120, 110, 104))
    d = ImageDraw.Draw(im)
    for i in range(0, 1200, 60):
        d.line([(i, 0), (i - 400, 800)], fill=(135, 124, 118), width=24)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=70)
    return buf.getvalue()


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    handler = functools.partial(Quiet, directory=str(DIST))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    srv = serve()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    jpg = placeholder()
    problems = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome")
        for scheme in ["light", "dark"]:
            ctx = browser.new_context(color_scheme=scheme, java_script_enabled=True)
            ctx.route("https://images.unsplash.com/**", lambda r: r.fulfill(body=jpg, content_type="image/jpeg"))
            ctx.route("https://upload.wikimedia.org/**", lambda r: r.fulfill(body=jpg, content_type="image/jpeg"))
            page = ctx.new_page()
            errors = []
            page.on("console", lambda m: m.type == "error" and errors.append(m.text))
            page.on("requestfailed", lambda r: errors.append(f"failed: {r.url}"))
            for w in WIDTHS:
                page.set_viewport_size({"width": w, "height": 900})
                for name in PAGES:
                    page.goto(f"{base}/{name}.html", wait_until="networkidle")
                    page.evaluate("document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; })")
                    page.wait_for_load_state("networkidle")
                    page.evaluate("Promise.all([...document.images].map((i) => i.decode()))")
                    page.wait_for_timeout(100)
                    page.evaluate("document.fonts.ready")
                    sw = page.evaluate("document.documentElement.scrollWidth")
                    if sw > w:
                        problems.append(f"overflow {scheme} {w} {name}: scrollWidth {sw}")
                    for c in page.evaluate(CONTRAST_JS):
                        if c["ratio"] < c["need"]:
                            problems.append(f"contrast {scheme} {w} {name}: {c}")
                    page.screenshot(path=str(OUT / f"{name}-{w}-{scheme}.png"), full_page=True)
            # The category filter works without JS: check with JS off.
            nojs = browser.new_context(color_scheme=scheme, java_script_enabled=False)
            np_ = nojs.new_page()
            np_.goto(f"{base}/documents.html")
            total = np_.locator(".doc:visible").count()
            np_.get_by_text("Охрана труда", exact=False).first.click()
            ot = np_.locator(".doc:visible").count()
            cats = np_.locator(".doc:visible").evaluate_all("els => [...new Set(els.map(e => e.dataset.category))]")
            print(f"filter ({scheme}, JS off): all={total}, 'Охрана труда'={ot}, categories shown={cats}")
            if ot >= total or cats != ["ot"]:
                problems.append(f"filter broken: {total} {ot} {cats}")
            nojs.close()
            if errors:
                problems.extend(f"console {scheme}: {e}" for e in sorted(set(errors)))
            ctx.close()
        browser.close()
    srv.shutdown()
    print("\n".join(problems) if problems else "no problems")
    print(f"screens: {OUT}")


if __name__ == "__main__":
    main()
