// Меню на узких экранах
(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      toggle.focus();
    }
  });
})();

// Реестр документов: поиск и фильтр по категории
(() => {
  const root = document.querySelector("[data-registry]");
  if (!root) return;
  const form = root.querySelector("[data-registry-tools]");
  const search = form.querySelector('input[type="search"]');
  const status = root.querySelector("[data-registry-status]");
  const empty = root.querySelector("[data-registry-empty]");
  const groups = [...root.querySelectorAll("[data-group]")];
  form.hidden = false;

  const plural = (n) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return "документ";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "документа";
    return "документов";
  };

  const apply = () => {
    const q = search.value.trim().toLowerCase();
    const cat = form.querySelector('input[name="cat"]:checked').value;
    let total = 0;
    for (const g of groups) {
      let shown = 0;
      if (cat === "all" || g.dataset.group === cat) {
        for (const row of g.querySelectorAll("[data-doc]")) {
          const ok = !q || row.dataset.search.includes(q);
          row.hidden = !ok;
          if (ok) shown++;
        }
      }
      g.hidden = shown === 0;
      g.querySelector("[data-group-count]").textContent = shown;
      total += shown;
    }
    empty.hidden = total > 0;
    status.textContent = q || cat !== "all" ? `Показано: ${total} ${plural(total)}` : "";
  };

  form.addEventListener("input", apply);
})();
