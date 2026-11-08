import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const data = JSON.parse(fs.readFileSync(path.join(root, "content/documents.json"), "utf8"));

function humanSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} МБ`;
}

const catName = Object.fromEntries(data.categories.map((c) => [c.id, c.name]));

const items = data.items
  .map((item) => {
    const file = path.join(root, "src/files", item.file);
    const bytes = fs.statSync(file).size;
    return {
      ...item,
      categoryName: catName[item.category],
      ext: item.file.split(".").pop().toUpperCase(),
      size: humanSize(bytes),
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

const groups = data.categories.map((c) => ({
  ...c,
  items: items.filter((i) => i.category === c.id),
}));

export default { categories: data.categories, items, groups };
