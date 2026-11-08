import { org, photoUrl, photos, stats, categories, documents, projects, statusLabels, news, steps, facts } from './data.mjs';

const longDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtLong = (iso) => longDate.format(new Date(iso));
const fmtShort = (iso) => shortDate.format(new Date(iso));
const byDateDesc = (a, b) => b.date.localeCompare(a.date);
const catTitle = Object.fromEntries(categories.map((c) => [c.id, c.title]));

const navItems = [
  ['home', 'index.html', 'Главная'],
  ['docs', 'documents.html', 'Нормативные документы'],
  ['projects', 'projects.html', 'Проекты'],
  ['news', 'news.html', 'Новости'],
  ['about', 'about.html', 'О профсоюзе'],
];

const logo = `<svg class="brand__mark" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><rect class="brand__mark-bg" width="40" height="40" rx="6"/><path class="brand__mark-fg" d="M8 9h24v7H8zM8 16h7v17H8zM25 16h7v17h-7z"/><path class="brand__mark-accent" d="M17.500 22h5v11h-5z"/></svg>`;

const img = (key, width, extra = '') =>
  `<img src="${photoUrl(key, width)}" alt="${photos[key].alt}" width="${width}" height="${Math.round((width * 2) / 3)}" ${extra}>`;

function layout({ root, current, title, description, body }) {
  const nav = navItems
    .map(([key, href, label]) => `<li><a class="site-nav__link" href="${root}${href}"${key === current ? ' aria-current="page"' : ''}>${label}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${root}assets/fonts/golos-text-cyrillic-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/style.css">
</head>
<body>
<a class="skip-link visually-hidden" href="#main">К содержимому</a>
<header class="site-header">
  <div class="wrap site-header__bar">
    <a class="brand" href="${root}index.html" aria-label="${org.short}: на главную">
      ${logo}
      <span class="brand__text"><span class="brand__name">${org.short}</span><span class="brand__tag">межрегиональный профсоюз</span></span>
    </a>
    <nav aria-label="Основная навигация"><ul class="site-nav">${nav}</ul></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap site-footer__cols">
    <div class="site-footer__col">
      <p class="site-footer__title">${org.full}</p>
      <p class="site-footer__muted">${org.slogan}.</p>
    </div>
    <div class="site-footer__col">
      <p class="site-footer__title">Контакты</p>
      <address class="site-footer__address">${org.address}<br>Тел. <a href="tel:+78005550112">${org.phone}</a><br><a href="mailto:${org.email}">${org.email}</a></address>
    </div>
    <div class="site-footer__col">
      <p class="site-footer__title">Разделы</p>
      <ul class="site-footer__list">${navItems.map(([, href, label]) => `<li><a href="${root}${href}">${label}</a></li>`).join('')}</ul>
    </div>
  </div>
  <p class="wrap site-footer__legal">Учебный проект: организация, документы и цифры вымышленные, совпадения случайны. Фотографии — Unsplash (Unsplash License).</p>
</footer>
</body>
</html>
`;
}

const badge = (status) => `<span class="app-badge app-badge--${status}">${statusLabels[status]}</span>`;

const sectionHead = (title, link) =>
  `<div class="section__head"><h2 class="section__title">${title}</h2>${link ? `<a class="section__more" href="${link[0]}">${link[1]}</a>` : ''}</div>`;

const newsCard = (n, root) => `<li class="card">
  ${img(n.photo, 800, 'class="card__media" loading="lazy"')}
  <div class="card__body">
    <p class="card__meta"><span class="app-badge">${n.tag}</span><time datetime="${n.date}">${fmtLong(n.date)}</time></p>
    <h3 class="card__title"><a class="card__link" href="${root}news/${n.slug}.html">${n.title}</a></h3>
    <p class="card__text">${n.lead}</p>
  </div>
</li>`;

const projectCard = (p) => `<li class="card">
  ${img(p.photo, 800, 'class="card__media" loading="lazy"')}
  <div class="card__body">
    <p class="card__meta">${badge(p.status)}</p>
    <h3 class="card__title">${p.title}</h3>
    <p class="card__text">${p.text}</p>
    <p class="card__facts">${p.facts}</p>
  </div>
</li>`;

const docItem = (d, root) => `<li class="doc" data-cat="${d.cat}">
  <div class="doc__id"><span class="doc__number">${d.number}</span><time datetime="${d.date}">от ${fmtShort(d.date)}</time></div>
  <div class="doc__main"><h2 class="doc__title">${d.title}</h2><span class="app-badge">${catTitle[d.cat]}</span></div>
  <div class="doc__file"><span class="doc__size">PDF · ${d.size}</span><a class="app-button" href="${root}files/${d.slug}.pdf" download>Скачать<span class="visually-hidden">: ${d.number}, ${d.title}</span></a></div>
</li>`;

const pageHead = (eyebrow, title, lead) =>
  `<div class="page-head"><div class="wrap stack"><p class="eyebrow">${eyebrow}</p><h1 class="page-head__title">${title}</h1><p class="page-head__lead">${lead}</p></div></div>`;

const sortedNews = [...news].sort(byDateDesc);
const sortedDocs = [...documents].sort(byDateDesc);

function home() {
  const root = '';
  return layout({
    root,
    current: 'home',
    title: 'Опора — межрегиональный профсоюз работников промышленности и строительства',
    description: 'Профсоюз «Опора»: защита трудовых прав, коллективные договоры, охрана труда, обучение и взаимопомощь для работников промышленности и строительства.',
    body: `<section class="hero">
  <div class="wrap hero__inner">
    <div class="hero__text stack">
      <p class="eyebrow">Профсоюз работников промышленности и строительства</p>
      <h1 class="hero__title">Надёжная опора для тех, кто работает</h1>
      <p class="hero__lead">Добиваемся достойной оплаты, безопасных условий и честных договоров. Консультируем бесплатно, а в споре с работодателем идём рядом.</p>
      <p class="hero__actions"><a class="app-button app-button--accent" href="about.html#join">Вступить в профсоюз</a><a class="app-button app-button--ghost" href="documents.html">Нормативные документы</a></p>
    </div>
    <div class="hero__media pile">
      ${img('workshop', 1200, 'class="hero__photo" fetchpriority="high"')}
      <p class="hero__badge"><strong>с 2009 года</strong> защищаем интересы работников</p>
    </div>
  </div>
</section>

<section class="section section--band">
  <div class="wrap">
    <ul class="stats">${stats.map((s) => `<li class="stats__item"><span class="stats__value">${s.value}</span><span class="stats__label">${s.label}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap stack">
    ${sectionHead('Последние новости', ['news.html', 'Все новости'])}
    <ul class="cards">${sortedNews.slice(0, 3).map((n) => newsCard(n, root)).join('')}</ul>
  </div>
</section>

<section class="section section--band">
  <div class="wrap stack">
    ${sectionHead('Свежие документы', ['documents.html', 'Весь реестр'])}
    <ul class="registry__list stack">${sortedDocs.slice(0, 4).map((d) => docItem(d, root)).join('')}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap stack">
    ${sectionHead('Проекты', ['projects.html', 'Все проекты'])}
    <ul class="cards">${projects.slice(0, 3).map(projectCard).join('')}</ul>
  </div>
</section>

<section class="section cta" id="join">
  <div class="wrap cta__inner">
    <div class="cta__text stack">
      <h2 class="cta__title">Вступить можно за пять минут</h2>
      <p>Взносы — один процент от заработка, а помощь юриста и участие в программах доступны с первого дня.</p>
    </div>
    <a class="app-button app-button--accent" href="about.html#join">Как вступить</a>
  </div>
</section>`,
  });
}

function documentsPage() {
  const root = '';
  const chips = [{ id: 'all', title: 'Все', count: documents.length }, ...categories.map((c) => ({ ...c, count: documents.filter((d) => d.cat === c.id).length }))]
    .map((c) => `<label class="chip"><input class="chip__input visually-hidden" type="radio" name="category" value="${c.id}"${c.id === 'all' ? ' checked' : ''}><span class="chip__label">${c.title}<span class="chip__count">${c.count}</span></span></label>`)
    .join('');
  return layout({
    root,
    current: 'docs',
    title: 'Нормативные документы — Опора',
    description: 'Реестр нормативных документов профсоюза «Опора»: уставные положения, коллективные договоры, охрана труда, оплата труда и решения Президиума.',
    body: `${pageHead('Реестр', 'Нормативные документы', 'Уставные положения, типовые договоры и решения Президиума. Выберите категорию, чтобы сузить список.')}
<section class="section">
  <div class="wrap registry stack">
    <fieldset class="registry__filters"><legend class="visually-hidden">Категория</legend>${chips}</fieldset>
    <ol class="registry__list stack">${sortedDocs.map((d) => docItem(d, root)).join('')}</ol>
    <p class="registry__note">Сайт учебный: файлы по ссылкам — демонстрационные заглушки, размеры указаны как у настоящих документов.</p>
  </div>
</section>`,
  });
}

function projectsPage() {
  return layout({
    root: '',
    current: 'projects',
    title: 'Проекты — Опора',
    description: 'Проекты профсоюза «Опора»: охрана труда, обучение профактива, жильё, оздоровление, взаимопомощь.',
    body: `${pageHead('Что мы делаем', 'Проекты', 'Программы, которые профсоюз ведёт вместе с первичными организациями. У каждой есть статус, чтобы было видно, на каком этапе работа.')}
<section class="section"><div class="wrap"><ul class="cards">${projects.map(projectCard).join('')}</ul></div></section>`,
  });
}

function newsPage() {
  return layout({
    root: '',
    current: 'news',
    title: 'Новости — Опора',
    description: 'Новости профсоюза «Опора»: соглашения, охрана труда, обучение, правовая защита и оздоровление.',
    body: `${pageHead('Лента', 'Новости', 'События профсоюза, итоги переговоров и разборы реальных случаев.')}
<section class="section"><div class="wrap"><ul class="cards">${sortedNews.map((n) => newsCard(n, '')).join('')}</ul></div></section>`,
  });
}

function articlePage(n) {
  const root = '../';
  const body = n.body
    .map((p) => (p.startsWith('## ') ? `<h2>${p.slice(3)}</h2>` : `<p>${p}</p>`))
    .join('\n');
  const related = sortedNews.filter((x) => x.slug !== n.slug).slice(0, 2);
  return layout({
    root,
    current: 'news',
    title: `${n.title} — Опора`,
    description: n.lead,
    body: `<article class="article">
  <div class="wrap article__wrap stack">
    <a class="article__back" href="${root}news.html">Все новости</a>
    <header class="article__head stack">
      <p class="card__meta"><span class="app-badge">${n.tag}</span><time datetime="${n.date}">${fmtLong(n.date)}</time></p>
      <h1 class="article__title">${n.title}</h1>
      <p class="article__lead">${n.lead}</p>
    </header>
    <figure class="article__figure">${img(n.photo, 1400, 'class="article__photo" fetchpriority="high"')}</figure>
    <div class="prose article__body">
${body}
    </div>
  </div>
</article>
<section class="section section--band">
  <div class="wrap stack">
    ${sectionHead('Читайте также')}
    <ul class="cards">${related.map((r) => newsCard(r, root)).join('')}</ul>
  </div>
</section>`,
  });
}

function aboutPage() {
  return layout({
    root: '',
    current: 'about',
    title: 'О профсоюзе и контакты — Опора',
    description: 'О профсоюзе «Опора»: миссия, структура, как вступить, адрес и контакты.',
    body: `${pageHead('О профсоюзе', 'Кто мы и как с нами связаться', 'Профсоюз «Опора» объединяет работников промышленности и строительства в четырнадцати регионах.')}
<section class="section">
  <div class="wrap about">
    <div class="about__col stack">
      <h2 class="about__title">Миссия</h2>
      <div class="prose">
        <p>Мы считаем, что безопасный труд и честная оплата — не бонус, а норма. Поэтому ведём переговоры с работодателями, проверяем рабочие места и помогаем в споре, если договорённости нарушены.</p>
        <p>Профсоюз строится снизу: решения принимают первичные организации, а Президиум и съезд отвечают перед ними.</p>
      </div>
      <dl class="facts">${facts.map(([k, v]) => `<div class="facts__row"><dt class="facts__term">${k}</dt><dd class="facts__desc">${v}</dd></div>`).join('')}</dl>
    </div>
    <div class="about__col stack">
      <h2 class="about__title">Контакты</h2>
      <address class="about__address">${org.address}<br>Тел. <a href="tel:+78005550112">${org.phone}</a> (бесплатно по России)<br><a href="mailto:${org.email}">${org.email}</a><br>Приём: ${org.hours}</address>
    </div>
  </div>
</section>
<section class="section section--band" id="join">
  <div class="wrap stack">
    ${sectionHead('Как вступить')}
    <ol class="steps">${steps.map((s) => `<li class="steps__item"><h3 class="steps__title">${s.title}</h3><p>${s.text}</p></li>`).join('')}</ol>
    <p><a class="app-button app-button--accent" href="mailto:${org.email}?subject=Вступление в профсоюз">Написать заявление на почту</a></p>
  </div>
</section>`,
  });
}

export function pages() {
  return {
    'index.html': home(),
    'documents.html': documentsPage(),
    'projects.html': projectsPage(),
    'news.html': newsPage(),
    'about.html': aboutPage(),
    ...Object.fromEntries(news.map((n) => [`news/${n.slug}.html`, articlePage(n)])),
  };
}
