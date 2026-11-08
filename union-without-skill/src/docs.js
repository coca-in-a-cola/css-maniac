(() => {
  const filters = document.getElementById('filters');
  if (!filters) return;
  filters.hidden = false;
  const rows = [...document.querySelectorAll('.registry tbody tr')];
  const q = document.getElementById('q');
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const pills = [...filters.querySelectorAll('.pill')];
  let cat = 'all';

  const apply = () => {
    const term = q.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach((tr) => {
      const ok = (cat === 'all' || tr.dataset.cat === cat) &&
        (!term || tr.textContent.toLowerCase().includes(term));
      tr.hidden = !ok;
      if (ok) shown += 1;
    });
    count.textContent = `Показано документов: ${shown} из ${rows.length}`;
    empty.hidden = shown !== 0;
  };

  pills.forEach((p) => p.addEventListener('click', () => {
    cat = p.dataset.cat;
    pills.forEach((x) => x.setAttribute('aria-pressed', String(x === p)));
    apply();
  }));
  q.addEventListener('input', apply);
})();
