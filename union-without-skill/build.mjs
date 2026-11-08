import { rm, mkdir, writeFile, copyFile, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  org, categories, documents, statuses, projects, news, figures, photo, photos,
} from './src/data.mjs';

const OUT = 'dist';
const fmtLong = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
const d = (s) => new Date(s + 'T12:00:00');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- shared pieces ---------- */
const nav = [
  ['home', 'Главная', 'index.html'],
  ['docs', 'Документы', 'documents/index.html'],
  ['projects', 'Проекты', 'projects/index.html'],
  ['news', 'Новости', 'news/index.html'],
  ['about', 'О профсоюзе', 'about/index.html'],
];

const logo = `<svg class="logo__mark" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false">
  <rect width="40" height="40" fill="currentColor"/>
  <rect x="8" y="9" width="24" height="7" fill="var(--c-accent)"/>
  <rect x="8" y="19" width="24" height="4" fill="#fff"/>
  <rect x="10" y="23" width="4" height="9" fill="#fff"/>
  <rect x="26" y="23" width="4" height="9" fill="#fff"/>
</svg>`;

function page({ depth, active, title, desc, body, script }) {
  const r = '../'.repeat(depth);
  const links = nav.map(([k, label, href]) =>
    `<li><a href="${r}${href}"${k === active ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${r}assets/styles.css">
</head>
<body>
<a class="skip" href="#main">Перейти к содержимому</a>
<header class="site-header">
  <div class="wrap site-header__in">
    <a class="logo" href="${r}index.html">${logo}<span class="logo__text"><b>${org.name}</b><small>профсоюз промышленности</small></span></a>
    <nav class="nav" aria-label="Основное меню"><ul>${links}</ul></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap site-footer__in">
    <div>
      <p class="site-footer__name">${org.full}</p>
      <p>Вымышленная организация. Сайт создан в демонстрационных целях.</p>
    </div>
    <address>
      <p>${org.address}</p>
      <p><a href="tel:${org.phone.replace(/[^+\d]/g, '')}">${org.phone}</a></p>
      <p><a href="mailto:${org.email}">${org.email}</a></p>
    </address>
    <p class="site-footer__credit">Фотографии: <a href="https://unsplash.com">Unsplash</a>, свободная лицензия.</p>
  </div>
</footer>
${script ? `<script src="${r}assets/${script}" defer></script>` : ''}
</body>
</html>
`;
}

const img = (key, { w = 900, sizes = '100vw', eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="${photo(key, w)}" srcset="${photo(key, 480)} 480w, ${photo(key, 900)} 900w, ${photo(key, 1600)} 1600w" sizes="${sizes}" alt="${esc(photos[key].alt)}" width="${w}" height="${Math.round(w * 2 / 3)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

const statusBadge = (s) =>
  `<span class="status status--${s}"><span aria-hidden="true">${statuses[s].mark}</span> ${statuses[s].label}</span>`;

const newsCard = (n, r, { big = false } = {}) => `
<article class="card news-card${big ? ' news-card--big' : ''}">
  <a class="card__pic" href="${r}news/${n.slug}/index.html" tabindex="-1" aria-hidden="true">${img(n.photo, { w: 900, sizes: big ? '(min-width: 60em) 50vw, 100vw' : '(min-width: 60em) 30vw, (min-width: 40em) 45vw, 100vw' })}</a>
  <div class="card__body">
    <p class="meta"><span class="tag">${n.tag}</span> <time datetime="${n.date}">${fmtLong.format(d(n.date))}</time></p>
    <h3 class="card__title"><a href="${r}news/${n.slug}/index.html">${n.title}</a></h3>
    <p>${n.lead}</p>
  </div>
</article>`;

const projectCard = (p) => `
<article class="card project-card">
  <div class="card__pic">${img(p.photo, { w: 900, sizes: '(min-width: 60em) 30vw, (min-width: 40em) 45vw, 100vw' })}</div>
  <div class="card__body">
    <p>${statusBadge(p.status)}</p>
    <h3 class="card__title">${p.title}</h3>
    <p>${p.text}</p>
    <ul class="chips">${p.meta.map((m) => `<li>${m}</li>`).join('')}</ul>
  </div>
</article>`;

const fileName = (x) => `doc-${String(documents.indexOf(x) + 1).padStart(2, '0')}.pdf`;
const sortedNews = [...news].sort((a, b) => b.date.localeCompare(a.date));
const sortedDocs = [...documents].sort((a, b) => b.date.localeCompare(a.date));

/* ---------- pages ---------- */
const pages = {};

pages['index.html'] = page({
  depth: 0, active: 'home',
  title: `${org.name} — профсоюз работников промышленности`,
  desc: org.tagline,
  body: `
<section class="hero">
  <div class="wrap hero__in">
    <div class="hero__text">
      <p class="eyebrow">Профсоюз работников промышленности</p>
      <h1>Работа должна быть безопасной, оплата — честной, договор — выполненным</h1>
      <p class="lead">«Верстак» объединяет 18 400 рабочих, инженеров и мастеров на заводах 23 городов. Мы ведём переговоры, проверяем условия труда и бесплатно защищаем в спорах с работодателем.</p>
      <p class="hero__actions">
        <a class="btn" href="about/index.html#join">Вступить в профсоюз</a>
        <a class="btn btn--ghost" href="documents/index.html">Нормативные документы</a>
      </p>
    </div>
    <figure class="hero__pic">${img('assembly', { w: 1200, sizes: '(min-width: 60em) 50vw, 100vw', eager: true })}
      <figcaption>Сборочная линия: от условий на таких участках зависит наша работа.</figcaption>
    </figure>
  </div>
</section>

<section class="figures" aria-label="Профсоюз в цифрах">
  <div class="wrap">
    <ul class="figures__list">${figures.map((f) => `<li><b>${f.n}</b><span>${f.t}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section__head">
      <h2>Свежие новости</h2>
      <a class="more" href="news/index.html">Все новости</a>
    </div>
    <div class="grid grid--news">
      ${newsCard(sortedNews[0], '', { big: true })}
      ${sortedNews.slice(1, 3).map((n) => newsCard(n, '')).join('')}
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <div class="section__head">
      <h2>Чем мы занимаемся</h2>
      <a class="more" href="projects/index.html">Все проекты</a>
    </div>
    <div class="grid grid--cards">
      ${projects.slice(0, 3).map(projectCard).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="split__pic">${img('crowd', { w: 900, sizes: '(min-width: 60em) 45vw, 100vw' })}</div>
    <div class="split__text">
      <h2>Сильнее, когда вместе</h2>
      <p>Коллективный договор — это не бумага для папки. Это обязательство работодателя перед каждым работником. Он действует, когда за ним следят: проверяют начисления, замеряют шум и освещение, обсуждают на собраниях.</p>
      <p>Присоединиться можно за пять минут: позвоните в приёмную или напишите нам. Взнос — 1 % от заработка, а юридическая помощь и обучение для членов профсоюза бесплатны.</p>
      <p><a class="btn" href="about/index.html#join">Как вступить</a></p>
    </div>
  </div>
</section>`,
});

/* documents */
const docRows = sortedDocs.map((x) => `
<tr data-cat="${x.cat}">
  <td data-label="Номер" class="doc-no">${x.no}</td>
  <td data-label="Дата"><time datetime="${x.date}">${fmtShort.format(d(x.date))}</time></td>
  <td data-label="Название" class="doc-title">${x.title}</td>
  <td data-label="Раздел">${categories[x.cat]}</td>
  <td data-label="Файл" class="doc-file">PDF, ${x.size}</td>
  <td data-label="" class="doc-dl"><a class="btn btn--small" href="../files/${fileName(x)}" download>Скачать<span class="sr"> документ ${x.no}</span></a></td>
</tr>`).join('');

pages['documents/index.html'] = page({
  depth: 1, active: 'docs', script: 'docs.js',
  title: `Нормативные документы — ${org.name}`,
  desc: 'Реестр документов профсоюза: коллективные договоры, охрана труда, устав, постановления, методические материалы.',
  body: `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">Реестр</p>
    <h1>Нормативные документы</h1>
    <p class="lead">Все действующие документы профсоюза в одном месте. Выберите раздел или найдите документ по номеру и названию.</p>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap">
    <div class="filters" id="filters" hidden>
      <div class="filters__search">
        <label for="q">Поиск по номеру или названию</label>
        <input id="q" type="search" autocomplete="off" placeholder="Например, «охрана труда» или ОТ-07">
      </div>
      <div class="filters__cats" role="group" aria-label="Раздел">
        <button type="button" class="pill" aria-pressed="true" data-cat="all">Все <span>${documents.length}</span></button>
        ${categories.map((c, i) => `<button type="button" class="pill" aria-pressed="false" data-cat="${i}">${c} <span>${documents.filter((x) => x.cat === i).length}</span></button>`).join('')}
      </div>
    </div>
    <p class="count" id="count" aria-live="polite">Документов: ${documents.length}</p>
    <div class="table-wrap">
    <table class="registry">
      <caption class="sr">Реестр нормативных документов</caption>
      <thead><tr><th scope="col">Номер</th><th scope="col">Дата</th><th scope="col">Название</th><th scope="col">Раздел</th><th scope="col">Файл</th><th scope="col"><span class="sr">Скачать</span></th></tr></thead>
      <tbody>${docRows}</tbody>
    </table>
    </div>
    <p class="empty" id="empty" hidden>Ничего не найдено. Измените запрос или выберите другой раздел.</p>
    <p class="note">В демонстрационной версии файлы — короткие заглушки; размеры указаны для примера.</p>
  </div>
</section>`,
});

pages['projects/index.html'] = page({
  depth: 1, active: 'projects',
  title: `Проекты — ${org.name}`,
  desc: 'Программы профсоюза: охрана труда, юридическая помощь, обучение, взаимопомощь.',
  body: `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">Что мы делаем</p>
    <h1>Проекты</h1>
    <p class="lead">Семь программ, которые делают работу безопаснее, а права — понятнее. Статус каждого проекта указан на карточке.</p>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap"><div class="grid grid--cards">${projects.map(projectCard).join('')}</div></div>
</section>`,
});

pages['news/index.html'] = page({
  depth: 1, active: 'news',
  title: `Новости — ${org.name}`,
  desc: 'Новости профсоюза «Верстак»: переговоры, охрана труда, исследования, проекты.',
  body: `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">Лента</p>
    <h1>Новости</h1>
    <p class="lead">Итоги переговоров, проверок и решений профсоюза.</p>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap"><div class="grid grid--cards">${sortedNews.map((n) => newsCard(n, '../')).join('')}</div></div>
</section>`,
});

sortedNews.forEach((n, i) => {
  const others = sortedNews.filter((x) => x !== n).slice(0, 2);
  pages[`news/${n.slug}/index.html`] = page({
    depth: 2, active: 'news',
    title: `${n.title} — ${org.name}`, desc: n.lead,
    body: `
<article class="article">
  <div class="wrap wrap--narrow">
    <p class="crumbs"><a href="../index.html">← Все новости</a></p>
    <p class="meta"><span class="tag">${n.tag}</span> <time datetime="${n.date}">${fmtLong.format(d(n.date))}</time></p>
    <h1>${n.title}</h1>
    <p class="lead">${n.lead}</p>
  </div>
  <div class="wrap wrap--mid"><figure class="article__pic">${img(n.photo, { w: 1600, sizes: '(min-width: 60em) 60rem, 100vw', eager: true })}<figcaption>${photos[n.photo].alt}.</figcaption></figure></div>
  <div class="wrap wrap--narrow prose">
    ${n.body.map((p) => `<p>${p}</p>`).join('\n    ')}
  </div>
</article>
<section class="section section--tint">
  <div class="wrap">
    <div class="section__head"><h2>Читайте также</h2></div>
    <div class="grid grid--cards">${others.map((o) => newsCard(o, '../../')).join('')}</div>
  </div>
</section>`,
  });
});

pages['about/index.html'] = page({
  depth: 1, active: 'about',
  title: `О профсоюзе и контакты — ${org.name}`,
  desc: 'Кто мы, как устроен профсоюз «Верстак», как вступить и как с нами связаться.',
  body: `
<section class="page-head">
  <div class="wrap">
    <p class="eyebrow">О нас</p>
    <h1>О профсоюзе и контакты</h1>
    <p class="lead">«Верстак» создан в 2019 году работниками нескольких уральских заводов. Сегодня это межрегиональная организация, в которой каждый член профсоюза влияет на решения.</p>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap split">
    <div class="split__text prose">
      <h2>Как мы устроены</h2>
      <p>Основа профсоюза — первичные организации на предприятиях. Они выбирают делегатов съезда, а съезд — президиум и председателя. Все решения о взносах и коллективных действиях принимаются голосованием.</p>
      <p>Мы действуем на основании устава и Трудового кодекса Российской Федерации. Отчёт о доходах и расходах публикуется раз в год и доступен любому члену профсоюза.</p>
      <h2>Наши принципы</h2>
      <ul>
        <li>Решаем вопросы переговорами и документами, а не громкими заявлениями.</li>
        <li>Показываем цифры: открытые отчёты и исследования.</li>
        <li>Поддерживаем каждого члена профсоюза, независимо от должности и стажа.</li>
      </ul>
    </div>
    <div class="split__pic">${img('group', { w: 900, sizes: '(min-width: 60em) 40vw, 100vw' })}</div>
  </div>
</section>
<section class="section section--tint" id="contacts">
  <div class="wrap contacts">
    <div>
      <h2>Контакты</h2>
      <dl class="dl">
        <dt>Адрес</dt><dd>${org.address}</dd>
        <dt>Телефон приёмной</dt><dd><a href="tel:${org.phone.replace(/[^+\d]/g, '')}">${org.phone}</a></dd>
        <dt>Электронная почта</dt><dd><a href="mailto:${org.email}">${org.email}</a></dd>
        <dt>Часы приёма</dt><dd>${org.hours}</dd>
      </dl>
    </div>
    <div id="join" class="join">
      <h2>Как вступить</h2>
      <ol>
        <li>Позвоните или напишите нам, назовите предприятие и должность.</li>
        <li>Заполните заявление, образец есть в разделе документов.</li>
        <li>Передайте его председателю первичной организации или отправьте на почту.</li>
      </ol>
      <p><a class="btn" href="mailto:${org.email}?subject=%D0%92%D1%81%D1%82%D1%83%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5">Написать нам</a></p>
    </div>
  </div>
</section>`,
});

/* ---------- PDFs (tiny valid placeholders) ---------- */
function pdf(text) {
  const stream = `BT /F1 18 Tf 60 760 Td (${text.replace(/[()\\]/g, '')}) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}

/* ---------- write ---------- */
await rm(OUT, { recursive: true, force: true });
for (const [path, html] of Object.entries(pages)) {
  const f = join(OUT, path);
  await mkdir(dirname(f), { recursive: true });
  await writeFile(f, html);
}
await mkdir(join(OUT, 'assets/fonts'), { recursive: true });
await mkdir(join(OUT, 'files'), { recursive: true });
await copyFile('src/styles.css', join(OUT, 'assets/styles.css'));
await copyFile('src/docs.js', join(OUT, 'assets/docs.js'));
await copyFile('src/favicon.svg', join(OUT, 'assets/favicon.svg'));
for (const [pkg, names] of [
  ['golos-text', ['cyrillic', 'cyrillic-ext', 'latin']],
  ['bitter', ['cyrillic', 'cyrillic-ext', 'latin']],
]) {
  for (const n of names) {
    const file = `${pkg}-${n}-wght-normal.woff2`;
    await copyFile(`node_modules/@fontsource-variable/${pkg}/files/${file}`, join(OUT, 'assets/fonts', file));
  }
}
for (const x of documents) {
  await writeFile(join(OUT, 'files', fileName(x)), pdf('Demo placeholder - union document ' + x.no.replace(/[^\x20-\x7e]/g, '?')));
}
console.log(`Built ${Object.keys(pages).length} pages, ${documents.length} files -> ${OUT}/`);
