// Static build: data + templates → dist/. No runtime JS on the site.
import { cpSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as sass from 'sass';
import { site, photos, facts, directions, projects, news, leaders, branches } from './src/data/content.mjs';
import { layout, sectionHead, pageHead, newsCard, projectCard, docItem, img, dateRu, typo, esc } from './src/templates.mjs';

const DIST = 'dist';
const t = (s) => typo(esc(s));

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'assets/fonts'), { recursive: true });

// Styles
const css = sass.compile('src/styles/main.scss', { style: 'expanded' }).css;
writeFileSync(join(DIST, 'assets/style.css'), css);

// Fonts: Cyrillic + Latin subsets only.
for (const [pkg, name] of [['onest', 'onest'], ['unbounded', 'unbounded']]) {
  for (const subset of ['cyrillic', 'latin']) {
    const file = `${name}-${subset}-wght-normal.woff2`;
    cpSync(`node_modules/@fontsource-variable/${pkg}/files/${file}`, join(DIST, 'assets/fonts', file));
  }
}
cpSync('src/favicon.svg', join(DIST, 'assets/favicon.svg'));
cpSync('src/files', join(DIST, 'files'), { recursive: true });

// Documents, newest first, with real file sizes.
const { categories: catList, documents: docsRaw } = JSON.parse(readFileSync('src/data/documents.json', 'utf8'));
const categories = Object.fromEntries(catList.map((c) => [c.id, c.label]));
const sizeRu = (bytes) => (bytes < 1024 * 1024
  ? `${Math.max(1, Math.round(bytes / 1024))} КБ`
  : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`);
const documents = docsRaw
  .map((d) => ({ ...d, size: sizeRu(statSync(`src/files/${d.file}.${d.ext}`).size) }))
  .sort((a, b) => b.date.localeCompare(a.date));

const page = (file, opts) => writeFileSync(join(DIST, file), layout(opts).replace(/[ \t]+$/gm, ''));

// Главная
page('index.html', {
  title: `${site.short} — защищаем права работников промышленности`,
  description: 'Межрегиональный профсоюз работников промышленности: коллективные договоры, охрана труда, бесплатная правовая помощь.',
  current: 'home',
  body: `
    <section class="hero">
      <div class="wrap hero__inner">
        <div class="hero__text stack">
          <p class="kicker">Межрегиональный профсоюз работников промышленности</p>
          <h1 class="hero__title">${t('Работа должна быть безопасной и честно оплаченной')}</h1>
          <p class="hero__lead">${t(`С ${site.founded} года объединяем работников машиностроения, металлургии и смежных производств Урала и Поволжья. Заключаем коллективные договоры, проверяем условия труда и защищаем в суде — бесплатно для членов профсоюза.`)}</p>
          <div class="hero__actions">
            <a class="button" href="about.html#join">Вступить в профсоюз</a>
            <a class="button button--ghost" href="documents.html">Документы</a>
          </div>
        </div>
        <figure class="hero__media pile">
          ${img('welding', { cls: 'hero__img', ratio: [4, 3], sizes: '(min-width: 1024px) 40vw, 100vw', eager: true })}
          <figcaption class="hero__badge">С ${site.founded} года на стороне работников</figcaption>
        </figure>
      </div>
    </section>

    <section class="wrap section stack" aria-labelledby="facts-title">
      <h2 class="visually-hidden" id="facts-title">Профсоюз в цифрах</h2>
      <ul class="facts">
        ${facts.map((f) => `<li class="facts__item"><span class="facts__value">${f.value}</span> <span class="facts__label">${t(f.label)}</span></li>`).join('\n        ')}
      </ul>
    </section>

    <section class="wrap section stack">
      ${sectionHead('Чем мы заняты')}
      <ol class="numbered">
        ${directions.map((d) => `<li class="numbered__item stack"><h3 class="numbered__title">${t(d.title)}</h3><p>${t(d.text)}</p></li>`).join('\n        ')}
      </ol>
    </section>

    <section class="wrap section stack">
      ${sectionHead('Новости', 'news.html', 'Все новости')}
      <div class="card-grid">${news.slice(0, 3).map((n) => newsCard(n)).join('')}
      </div>
    </section>

    <section class="wrap section stack">
      ${sectionHead('Новые документы', 'documents.html', 'Весь реестр')}
      <ol class="doc-list">${documents.slice(0, 4).map((d) => docItem(d, { categories })).join('')}
      </ol>
    </section>

    <section class="wrap section stack">
      ${sectionHead('Проекты', 'projects.html', 'Все проекты')}
      <div class="card-grid">${projects.slice(0, 3).map((p) => projectCard(p)).join('')}
      </div>
    </section>

    <section class="wrap section stack">
      <div class="join">
        <div class="join__text stack">
          <h2 class="join__title">${t('Вступить можно за один день')}</h2>
          <p>${t('Взнос — 1% от заработной платы. Юридическая помощь, проверки условий труда и материальная поддержка — с первого дня членства.')}</p>
        </div>
        <a class="button button--inverse" href="about.html#join">Как вступить</a>
      </div>
    </section>`,
});

// Нормативные документы
const counts = Object.fromEntries(catList.map((c) => [c.id, documents.filter((d) => d.category === c.id).length]));
const option = (value, label, count, checked = false) => `
            <label class="filter__option">
              <input class="filter__input visually-hidden" type="radio" name="category" value="${value}"${checked ? ' checked' : ''}>
              ${t(label)} <span class="filter__count">${count}</span>
            </label>`;
page('documents.html', {
  title: `Нормативные документы — ${site.short}`,
  description: 'Реестр документов профсоюза: устав, положения, коллективные договоры, охрана и оплата труда, решения органов.',
  current: 'documents',
  body: `${pageHead('Нормативные документы', 'Устав, положения, соглашения и решения органов профсоюза. Все документы можно скачать; новые — сверху.')}
    <div class="wrap registry">
      <fieldset class="filter">
        <legend class="filter__legend">Категория</legend>
        <div class="filter__options">${option('all', 'Все', documents.length, true)}${catList.map((c) => option(c.id, c.label, counts[c.id])).join('')}
        </div>
      </fieldset>
      <ol class="doc-list">${documents.map((d) => docItem(d, { level: 2, categories })).join('')}
      </ol>
    </div>`,
});

// Проекты
page('projects.html', {
  title: `Проекты — ${site.short}`,
  description: 'Проекты профсоюза: обучение актива, охрана труда, юридическая помощь, мониторинг зарплат.',
  current: 'projects',
  body: `${pageHead('Проекты', 'Долгосрочные программы профсоюза. Участвовать может любой член профсоюза — напишите председателю своей первичной организации или в приёмную.')}
    <div class="wrap section stack">
      <div class="card-grid">${projects.map((p) => projectCard(p, 2)).join('')}
      </div>
    </div>`,
});

// Новости
page('news.html', {
  title: `Новости — ${site.short}`,
  description: 'Новости профсоюза «Общий цех»: переговоры, коллективные договоры, охрана труда, правовая защита.',
  current: 'news',
  body: `${pageHead('Новости')}
    <div class="wrap section stack">
      ${newsCard(news[0], { level: 2, featured: true })}
      <div class="card-grid">${news.slice(1).map((n) => newsCard(n, { level: 2 })).join('')}
      </div>
    </div>`,
});

for (const n of news) {
  const others = news.filter((o) => o !== n).slice(0, 3);
  const p = photos[n.photo];
  page(`news-${n.slug}.html`, {
    title: `${n.title} — ${site.short}`,
    description: n.lead,
    current: 'news',
    body: `
    <article class="article">
      <header class="wrap article__head stack">
        <a class="article__back" href="news.html">Все новости</a>
        <p class="card__meta"><time datetime="${n.date}">${dateRu(n.date)}</time><span class="card__tag">${t(n.tag)}</span></p>
        <h1 class="article__title">${t(n.title)}</h1>
        <p class="article__lead">${t(n.lead)}</p>
      </header>
      <figure class="wrap article__figure">
        ${img(n.photo, { cls: 'article__img', ratio: [16, 9], sizes: '(min-width: 1216px) 76rem, 100vw', eager: true })}
        <figcaption class="article__caption">Фото: ${esc(p.source)}</figcaption>
      </figure>
      <div class="wrap">
        <div class="prose article__body">${typo(n.body)}
        </div>
      </div>
    </article>

    <section class="wrap section stack">
      ${sectionHead('Другие новости', 'news.html', 'Все новости')}
      <div class="card-grid">${others.map((o) => newsCard(o)).join('')}
      </div>
    </section>`,
  });
}

// О профсоюзе и контакты
const credits = Object.values(photos).map((p) => (p.kind === 'unsplash'
  ? `<li><a href="${p.src}">${esc(p.alt)}</a> — Unsplash, лицензия Unsplash</li>`
  : `<li><a href="${p.page}">${esc(p.alt)}</a> — ${esc(p.source)}</li>`));
page('about.html', {
  title: `О профсоюзе и контакты — ${site.short}`,
  description: 'История, руководство, приёмная и региональные отделения профсоюза «Общий цех». Как вступить в профсоюз.',
  current: 'about',
  body: `${pageHead('О профсоюзе', `${site.fullName}. Основан в ${site.founded} году работниками трёх уральских заводов, сегодня объединяет 63 первичные организации в пяти регионах.`)}
    <div class="wrap section about">
      <div class="about__text prose">
        <p>${t('Мы — независимый отраслевой профсоюз. Нас не финансируют работодатели: бюджет складывается из членских взносов, и тратим мы его на то, что решают сами члены профсоюза на конференции.')}</p>
        <p>${t('Высший орган — Конференция, она собирается раз в пять лет. Между конференциями работают Совет и Президиум, за расходованием средств следит Контрольно-ревизионная комиссия. Все решения органов публикуются в разделе')} <a href="documents.html">${t('«Нормативные документы»')}</a>.</p>
      </div>
      <figure class="about__figure">
        ${img('city', { cls: 'about__img' })}
        <figcaption class="article__caption">Екатеринбург, где находится аппарат профсоюза. Фото: <a href="${photos.city.page}">${esc(photos.city.source)}</a></figcaption>
      </figure>
    </div>

    <section class="wrap section stack">
      ${sectionHead('Руководство')}
      <ul class="people">
        ${leaders.map((l) => `<li class="people__item stack"><span class="people__name">${t(l.name)}</span> <span class="people__role">${t(l.role)}</span></li>`).join('\n        ')}
      </ul>
    </section>

    <section class="wrap section stack" id="contacts">
      ${sectionHead('Контакты')}
      <div class="contacts">
        <dl class="contacts__list">
          <div class="contacts__row"><dt>Приёмная</dt><dd><a href="tel:${site.phoneHref}">${site.phone}</a></dd></div>
          <div class="contacts__row"><dt>Горячая линия по охране труда</dt><dd><a href="tel:${site.hotlineHref}">${site.hotline}</a>, бесплатно</dd></div>
          <div class="contacts__row"><dt>Почта</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
          <div class="contacts__row"><dt>Адрес</dt><dd>${t(site.address)}</dd></div>
          <div class="contacts__row"><dt>Часы работы</dt><dd>${site.hours}</dd></div>
        </dl>
        <div class="contacts__aside stack">
          <h3 class="contacts__title">Региональные отделения</h3>
          <ul class="branches">
            ${branches.map((b) => `<li class="branches__item"><span>${b.city}</span> <a href="tel:${b.phone.replace(/[^\d+]/g, '')}">${b.phone}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </div>
    </section>

    <section class="wrap section stack" id="join">
      ${sectionHead('Как вступить в профсоюз')}
      <ol class="numbered">
        <li class="numbered__item stack"><h3 class="numbered__title">Напишите заявление</h3><p>${t('Бланк есть у председателя первичной организации на вашем предприятии. Если её нет, позвоните в приёмную — поможем создать.')}</p></li>
        <li class="numbered__item stack"><h3 class="numbered__title">Оформите удержание взноса</h3><p>${t('Взнос — 1% от зарплаты. Бухгалтерия удерживает его сама по вашему заявлению, отдельно платить не нужно.')}</p></li>
        <li class="numbered__item stack"><h3 class="numbered__title">Получите профбилет</h3><p>${t('С этого дня вам доступны консультации юристов, защита в споре с работодателем и все проекты профсоюза.')}</p></li>
      </ol>
    </section>

    <section class="wrap section stack" id="credits">
      ${sectionHead('Фотографии на сайте')}
      <ul class="credits stack">
        ${credits.join('\n        ')}
      </ul>
    </section>`,
});

console.log(`Built ${4 + news.length + 1} pages, ${documents.length} documents → ${DIST}/`);
