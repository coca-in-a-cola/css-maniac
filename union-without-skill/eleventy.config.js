import path from "node:path";

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

const STATUS = {
  active: "Реализуется",
  recruiting: "Идёт набор",
  planned: "Готовится",
  done: "Завершён",
};

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/files": "files" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/golos-text/files/golos-text-cyrillic-wght-normal.woff2": "assets/fonts/golos-cyrillic.woff2",
    "node_modules/@fontsource-variable/golos-text/files/golos-text-latin-wght-normal.woff2": "assets/fonts/golos-latin.woff2",
    "node_modules/@fontsource-variable/unbounded/files/unbounded-cyrillic-wght-normal.woff2": "assets/fonts/unbounded-cyrillic.woff2",
    "node_modules/@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2": "assets/fonts/unbounded-latin.woff2",
  });

  // Относительная ссылка от текущей страницы — сайт открывается прямо с диска (file://).
  eleventyConfig.addFilter("rel", (target, pageUrl) => {
    const from = path.posix.dirname(pageUrl.endsWith("/") ? pageUrl + "index.html" : pageUrl);
    return path.posix.relative(from, "/" + target) || target;
  });

  eleventyConfig.addFilter("ruDate", (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  });
  eleventyConfig.addFilter("numDate", (iso) => iso.split("-").reverse().join("."));
  eleventyConfig.addFilter("statusLabel", (s) => STATUS[s]);
  eleventyConfig.addFilter("docsByNumbers", (items, numbers) =>
    (numbers || []).map((n) => items.find((i) => i.number === n)).filter(Boolean),
  );
  eleventyConfig.addFilter("except", (arr, slug) => arr.filter((x) => x.slug !== slug));

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
