import { site, photos, statuses } from './data/content.mjs';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export const dateRu = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

// Russian typesetting: glue 1–2 letter words to the next word, glue dashes to the previous one.
export const typo = (s) => s
  .replace(/(^|[\s(«>])([а-яёА-ЯЁ]{1,2}) /g, '$1$2 ')
  .replace(/(^|[\s(«>])([а-яёА-ЯЁ]{1,2}) /g, '$1$2 ')
  .replace(/ —/g, ' —');

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const t = (s) => typo(esc(s));

const NAV = [
  { href: 'index.html', label: 'Главная', id: 'home' },
  { href: 'documents.html', label: 'Документы', id: 'documents' },
  { href: 'projects.html', label: 'Проекты', id: 'projects' },
  { href: 'news.html', label: 'Новости', id: 'news' },
  { href: 'about.html', label: 'О профсоюзе', id: 'about' },
];

const unsplashUrl = (src, w, h) => `${src}?auto=format&amp;fit=crop&amp;w=${w}&amp;h=${h}&amp;q=70`;

// ratio: [w, h] of the crop. sizes: the slot width.
export const img = (key, { cls, ratio = [3, 2], sizes = '100vw', eager = false } = {}) => {
  const p = photos[key];
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  if (p.kind !== 'unsplash') {
    return `<img class="${cls}" src="${p.src}" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" ${loading} decoding="async">`;
  }
  const [rw, rh] = ratio;
  const widths = [480, 800, 1200, 1800];
  const srcset = widths.map((w) => `${unsplashUrl(p.src, w, Math.round((w * rh) / rw))} ${w}w`).join(', ');
  return `<img class="${cls}" src="${unsplashUrl(p.src, 1200, Math.round((1200 * rh) / rw))}" srcset="${srcset}" sizes="${sizes}" width="${rw * 400}" height="${rh * 400}" alt="${esc(p.alt)}" ${loading} decoding="async">`;
};

const logo = (cls = '') => `
  <a class="logo ${cls}" href="index.html">
    <svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M2 30V14l7-6v6l7-6v6l7-6v6l7-6v22zM7 19v6h4v-6zm7 0v6h4v-6zm7 0v6h4v-6z" fill="currentColor" fill-rule="evenodd"/></svg>
    <span class="logo__text">Общий цех<span class="logo__sub">профсоюз работников промышленности</span></span>
  </a>`;

export const layout = ({ title, description, current, body }) => `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <a class="skip-link" href="#main">Перейти к содержанию</a>
  <header class="site-header">
    <div class="wrap site-header__inner">
      ${logo()}
      <nav class="nav" aria-label="Основное меню">
        <ul class="nav__list">
          ${NAV.map((n) => `<li><a class="nav__link" href="${n.href}"${n.id === current ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}
        </ul>
      </nav>
    </div>
  </header>
  <main id="main">
${body}
  </main>
  <footer class="site-footer is-dark">
    <div class="wrap site-footer__inner">
      <div class="site-footer__about stack">
        ${logo('logo--inverse')}
        <p class="site-footer__text">${t(site.fullName)}. Защищаем трудовые права работников заводов Урала и Поволжья с ${site.founded} года.</p>
      </div>
      <nav class="site-footer__nav" aria-label="Разделы сайта">
        <ul class="site-footer__list stack">
          ${NAV.map((n) => `<li><a class="site-footer__link" href="${n.href}">${n.label}</a></li>`).join('')}
        </ul>
      </nav>
      <address class="site-footer__contacts stack">
        <a class="site-footer__link" href="tel:${site.phoneHref}">${site.phone}</a>
        <a class="site-footer__link" href="mailto:${site.email}">${site.email}</a>
        <span>${t(site.address)}</span>
      </address>
      <p class="site-footer__note">${t('Демонстрационный сайт. Профсоюз «Общий цех», его руководители, предприятия и документы вымышлены. Фотографии — Unsplash и Wikimedia Commons, подробности на странице «О профсоюзе».')}</p>
    </div>
  </footer>
</body>
</html>
`;

export const sectionHead = (title, link, linkText, level = 2) => `
      <div class="section-head">
        <h${level} class="section-head__title">${t(title)}</h${level}>
        ${link ? `<a class="section-head__link" href="${link}">${linkText}</a>` : ''}
      </div>`;

export const pageHead = (title, lead) => `
    <div class="wrap page-head stack">
      <h1 class="page-head__title">${t(title)}</h1>
      ${lead ? `<p class="page-head__lead">${t(lead)}</p>` : ''}
    </div>`;

const CARD_SIZES = '(min-width: 1216px) 24rem, (min-width: 768px) 45vw, 100vw';

export const newsCard = (n, { level = 3, featured = false } = {}) => `
        <article class="card${featured ? ' card--featured' : ''}">
          ${img(n.photo, { cls: 'card__img', sizes: featured ? '(min-width: 768px) 50vw, 100vw' : CARD_SIZES })}
          <div class="card__body stack">
            <p class="card__meta"><time datetime="${n.date}">${dateRu(n.date)}</time><span class="card__tag">${t(n.tag)}</span></p>
            <h${level} class="card__title"><a class="card__link" href="news-${n.slug}.html">${t(n.title)}</a></h${level}>
            <p class="card__text">${t(n.lead)}</p>
          </div>
        </article>`;

export const projectCard = (p, level = 3) => `
        <article class="card">
          ${img(p.photo, { cls: 'card__img', sizes: CARD_SIZES })}
          <div class="card__body stack">
            <p class="card__meta"><span class="status status--${p.status}">${statuses[p.status]}</span><span>${t(p.period)}</span></p>
            <h${level} class="card__title">${t(p.title)}</h${level}>
            <p class="card__text">${t(p.text)}</p>
          </div>
        </article>`;

export const docItem = (d, { level = 3, categories }) => `
        <li class="doc" data-category="${d.category}">
          <span class="doc__number">№&nbsp;${esc(d.number)}</span>
          <time class="doc__date" datetime="${d.date}">${dateRu(d.date)}</time>
          <div class="doc__main stack">
            <h${level} class="doc__title">${t(d.title)}</h${level}>
            <p class="doc__category">${t(categories[d.category])}</p>
          </div>
          <a class="doc__file" href="files/${d.file}.${d.ext}" download>
            <svg class="doc__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Скачать<span class="visually-hidden"> «${esc(d.title)}»</span></span>
            <span class="doc__size">${d.ext.toUpperCase()}, ${d.size}</span>
          </a>
        </li>`;
