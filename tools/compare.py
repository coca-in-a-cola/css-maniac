#!/usr/bin/env python3
"""A/B comparison of the union-* sites. Harness only, not part of the skill.

  cd tools && npm ci && cd ..
  python3 tools/compare.py <run-name> [--agents comparison/<run>/agents.json]

Builds every union-* site (npm ci && npm run build), then measures:
  - authored CSS/SCSS lines (src, not dist)
  - built CSS: hex colors, px (not 0/1/999), !important, @media, @container,
    vh, absolute positioning, max z-index, transition: all
  - substantive violations of the skill's Stylelint gate on authored CSS/SCSS
  - every page × 360/768/1280 × light/dark: horizontal overflow, WCAG text contrast
  - screenshots (home, documents) at 360 and 1440
Photos load as grey stand-ins of the size their URL asks for; other external requests are blocked.
agents.json: {"with-skill": {"model": "...", "tokens": 0, "tool_calls": 0, "minutes": 0}, ...}
Writes comparison/<run>/README.md and images.
"""
import argparse, json, pathlib, re, subprocess, sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
WIDTHS = (360, 768, 1280)
SHOTS = (("index", 1440), ("index", 360), ("documents", 360))
STYLE_ONLY = {
    'rule-empty-line-before', 'comment-empty-line-before', 'declaration-empty-line-before',
    'custom-property-empty-line-before', 'comment-whitespace-inside', 'selector-class-pattern',
    'no-descending-specificity', 'declaration-block-single-line-max-declarations',
    'at-rule-empty-line-before', 'value-keyword-case', 'font-family-name-quotes', 'import-notation',
    'alpha-value-notation', 'color-function-alias-notation', 'color-hex-length', 'length-zero-no-unit',
    'shorthand-property-no-redundant-values', 'number-max-precision', 'selector-not-notation',
    'media-feature-range-notation', 'hue-degree-notation', 'lightness-notation', 'property-no-vendor-prefix',
    'selector-pseudo-element-colon-notation', 'keyframes-name-pattern', 'comment-no-empty',
    'selector-attribute-quotes', 'font-family-no-missing-generic-family-keyword',
}

AUDIT = r"""
() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = c => { cx.clearRect(0,0,1,1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0,0,1,1);
    const [r,g,b,a] = cx.getImageData(0,0,1,1).data; return [r,g,b,a/255]; };
  const over = (t, u) => t.slice(0,3).map((v,i) => v*t[3] + u[i]*(1-t[3])).concat(1);
  const lin = v => { v /= 255; return v <= 0.04045 ? v/12.92 : ((v+0.055)/1.055)**2.4; };
  const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
  const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
  const probe = document.createElement('i'); probe.style.background = 'Canvas'; document.body.append(probe);
  const canvas = rgba(getComputedStyle(probe).backgroundColor); probe.remove();
  const bgOf = el => { const layers = [];
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e);
      if (cs.backgroundImage !== 'none') return null;
      const c = rgba(cs.backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] === 1) break; } }
    return layers.reverse().reduce((acc, l) => over(l, acc), canvas); };
  const seen = new Set(); let checked = 0; const fails = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode()) {
    const el = t.parentElement; if (!el || !t.textContent.trim() || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el), box = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || +cs.opacity === 0 || box.width < 2 || box.height < 2) continue;
    const bg = bgOf(el); if (!bg) continue;
    const fg = over(rgba(cs.color), bg); const size = parseFloat(cs.fontSize);
    const need = size >= 24 || (+cs.fontWeight >= 700 && size >= 18.66) ? 3 : 4.5;
    checked++; const r = ratio(fg, bg);
    if (r < need) fails.push({ text: t.textContent.trim().slice(0, 30), ratio: +r.toFixed(2) });
  }
  return { checked, fails, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
}
"""


def sh(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)


def authored_files(site):
    return [p for p in site.rglob("*") if p.suffix in (".css", ".scss")
            and not {"node_modules", "dist"} & set(p.parts)]


def authored_lines(site):
    files = authored_files(site)
    return sum(1 for f in files for line in f.read_text(errors="ignore").splitlines() if line.strip())


def css_metrics(css):
    z = [int(v) for v in re.findall(r"z-index:\s*(-?\d+)", css)]
    decl = re.sub(r"@media[^{]*\{", "{", re.sub(r"/\*.*?\*/", "", css, flags=re.S))
    return {
        "hex colors": len(re.findall(r"#[0-9a-fA-F]{3,8}\b", decl)),
        "px in declarations (not 0/1/999)": len([v for v in re.findall(r"(?<![\w.])(\d*\.?\d+)px", decl) if v not in ("0", "1", "999")]),
        "!important": css.count("!important"),
        "@media": css.count("@media"),
        "@container": css.count("@container"),
        "vh units": len(re.findall(r"\d(?:vh)\b", css)),
        "position: absolute": len(re.findall(r"position:\s*absolute", css)),
        "max z-index": max(z) if z else 0,
        "transition: all": len(re.findall(r"transition:[^;}]*\ball\b", css)),
    }


def lint(css_files):
    if not css_files:
        return {}
    cfg = ROOT / "css-maniac/templates/stylelint.config.mjs"
    r = sh(f'npx stylelint --config "{cfg}" -f json ' + " ".join(f'"{f}"' for f in css_files), ROOT / "tools")
    try:
        data = json.loads(r.stdout or r.stderr)
    except json.JSONDecodeError:
        return {"lint failed to run": 1}
    return Counter(w["rule"] for f in data for w in f["warnings"] if w["rule"] not in STYLE_ONLY)


_png_cache = {}


def photo_stand_in(route):
    """Photos 'load' as grey PNGs of the size the URL asks for; anything else external is blocked."""
    import io
    from PIL import Image
    req = route.request
    if req.resource_type != "image":
        return route.abort()
    url = req.url
    w = re.search(r"[?&]w=(\d+)", url) or re.search(r"/(\d+)px-", url)
    h = re.search(r"[?&]h=(\d+)", url)
    w = min(int(w.group(1)), 2400) if w else 1200
    h = min(int(h.group(1)), 2400) if h else round(w * 2 / 3)
    if (w, h) not in _png_cache:
        buf = io.BytesIO(); Image.new("RGB", (w, h), (150, 150, 150)).save(buf, "PNG")
        _png_cache[(w, h)] = buf.getvalue()
    route.fulfill(status=200, content_type="image/png", body=_png_cache[(w, h)])


def html_pages(dist):
    return sorted(p for p in dist.rglob("*.html") if "assets" not in p.parts)


def render(sites, out):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    res = {}
    with sync_playwright() as p:
        try:
            b = p.chromium.launch()
        except Exception:
            b = p.chromium.launch(channel="chrome")

        def context(w, scheme="light", photos=True):
            ctx = b.new_context(viewport={"width": w, "height": 900}, color_scheme=scheme)
            ctx.route(re.compile(r"^https?://"), photo_stand_in if photos else (lambda route: route.abort()))
            return ctx

        for name, dist in sites.items():
            pages = html_pages(dist)
            r = {"pages": len(pages), "overflow": [], "overflow no photos": [], "contrast fails": 0, "texts checked": 0}
            label = lambda f, w, s: f"{f.relative_to(dist).with_suffix('')}@{w}{'-dark' if s == 'dark' else ''}"
            for scheme in ("light", "dark"):
                for w in WIDTHS:
                    ctx = context(w, scheme); pg = ctx.new_page()
                    for f in pages:
                        pg.goto(f.as_uri(), wait_until="load")
                        a = pg.evaluate(AUDIT)
                        r["texts checked"] += a["checked"]
                        r["contrast fails"] += len(a["fails"])
                        if a["overflow"]:
                            r["overflow"].append(label(f, w, scheme))
                    ctx.close()
            for w in WIDTHS:
                ctx = context(w, photos=False); pg = ctx.new_page()
                for f in pages:
                    pg.goto(f.as_uri(), wait_until="load")
                    if pg.evaluate("document.documentElement.scrollWidth > innerWidth + 1"):
                        r["overflow no photos"].append(label(f, w, "light"))
                ctx.close()
            for page, w in SHOTS:
                f = dist / f"{page}.html"
                if not f.exists():
                    continue
                ctx = context(w)
                pg = ctx.new_page(); pg.goto(f.as_uri(), wait_until="load")
                path = out / f"{name}-{page}-{w}.png"
                pg.screenshot(path=path, full_page=True); ctx.close()
                im = Image.open(path)
                im.crop((0, 0, im.width, min(im.height, 2400 if w > 400 else 1800))).save(path)
            res[name] = r
        b.close()
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run")
    ap.add_argument("--agents")
    ap.add_argument("--no-build", action="store_true")
    a = ap.parse_args()
    out = ROOT / "comparison" / a.run
    out.mkdir(parents=True, exist_ok=True)
    sites = {d.name.removeprefix("union-"): d for d in sorted(ROOT.glob("union-*")) if d.is_dir()}
    agents = json.loads(pathlib.Path(a.agents).read_text()) if a.agents else {}

    rows, dists = {}, {}
    for name, d in sites.items():
        row = {}
        if not a.no_build:
            r = sh("npm ci && npm run build", d)
            row["build (npm ci && npm run build)"] = "ok" if r.returncode == 0 else "FAILED"
        dist = d / "dist"
        css = [f for f in dist.rglob("*.css")] if dist.exists() else []
        row["authored CSS/SCSS lines"] = authored_lines(d)
        built = "\n".join(f.read_text(errors="ignore") for f in css)
        row.update(css_metrics(built))
        violations = lint(authored_files(d))  # what the agent wrote, not compiler output
        row["skill-gate violations"] = sum(violations.values())
        row["  top rules"] = ", ".join(f"{k} {n}" for k, n in violations.most_common(4)) or "—"
        js = list(dist.rglob("*.js")) if dist.exists() else []
        row["shipped JS lines"] = sum(1 for f in js for l in f.read_text(errors="ignore").splitlines() if l.strip())
        rows[name] = row
        if dist.exists():
            dists[name] = dist

    for name, r in render(dists, out).items():
        rows[name]["pages"] = r["pages"]
        rows[name]["horizontal overflow (page@width)"] = ", ".join(r["overflow"]) or "none"
        rows[name]["overflow if photos fail to load"] = ", ".join(r["overflow no photos"]) or "none"
        rows[name]["contrast fails / texts checked"] = f'{r["contrast fails"]} / {r["texts checked"]}'

    for name, ag in agents.items():
        for k, v in ag.items():
            rows.setdefault(name, {})[f"agent {k}"] = f"{v:,}" if isinstance(v, int) else v

    names = list(rows)
    keys = list(dict.fromkeys(k for n in names for k in rows[n]))
    table = ["| | " + " | ".join(names) + " |", "|---|" + "---|" * len(names)]
    table += [f"| {k} | " + " | ".join(str(rows[n].get(k, "—")) for n in names) + " |" for k in keys]
    imgs = "\n".join(f"![{p.stem}]({p.name})" for p in sorted(out.glob("*.png")))
    (out / "README.md").write_text(
        f"# {a.run}\n\nGenerated by `tools/compare.py`. Photos load as grey stand-ins of their real size; "
        f"other external requests are blocked. Checks run on every page at {', '.join(map(str, WIDTHS))} px, "
        f"light and dark.\n\n" + "\n".join(table) + "\n\n" + imgs + "\n")
    (out / "metrics.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2))
    print("\n".join(table))


if __name__ == "__main__":
    main()
