// Раздел «Все упражнения»: строится из активных EX/GROUPS, каждое упражнение на месте, в EN нет кириллицы (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const FIXED_NOW = new Date('2026-10-28T12:00:00');
const CYR = /[А-Яа-яЁё]/;

async function openApp(page, hash) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}

// Раскрывает все упражнения, проходит каждый вариант и уровень; возвращает найденную кириллицу и ошибки табов.
async function walkLib(page) {
  return page.evaluate(() => {
    const G = window.__grif, lib = document.getElementById('lib'), bad = [], tabErr = [];
    const cyr = /[А-Яа-яЁё]/;
    const check = where => {
      if (cyr.test(lib.innerText)) bad.push(where + ': ' + lib.innerText.match(/.{0,30}[А-Яа-яЁё].{0,30}/)[0]);
      lib.querySelectorAll('[title],[aria-label]').forEach(el => ['title', 'aria-label'].forEach(a => { const v = el.getAttribute(a); if (v && cyr.test(v)) bad.push(where + ' @' + a + ': ' + v); }));
    };
    Object.keys(G.EX).forEach(id => {
      const det = () => lib.querySelector('details[data-lib="' + id + '"]');
      det().open = true; det().dispatchEvent(new Event('toggle'));
      const nv = det().querySelectorAll('[data-libvar]').length || 1, nl = det().querySelectorAll('[data-liblvl]').length || 1;
      for (let k = 0; k < nv; k++) for (let l = 1; l <= nl; l++) {
        const vb = det().querySelector('[data-libvar="' + k + '"]'); if (vb) vb.click();
        const lb = det().querySelector('[data-liblvl="' + l + '"]'); if (lb) lb.click();
        if (G.EX[id].v || G.EX[id].gen) { if (!det().querySelector('.tabbox')) tabErr.push(id + ' v' + k + ' l' + l + ': нет таба'); }
        det().querySelectorAll('.tabbox').forEach(b => { if (b.querySelector('.err')) tabErr.push(id + ' v' + k + ' l' + l); });
        check(id + ' v' + k + ' l' + l);
      }
    });
    return { bad: bad.slice(0, 10), tabErr };
  });
}

for (const inst of ['guitar', 'bass', 'blues-guitar', 'acoustic', 'blues-bass']) {
  test(`раздел: каждый id из EX на месте, по группам и номерам (${inst})`, async ({ page }) => {
    const errors = await openApp(page, inst + '-library-ru');
    const res = await page.evaluate(() => {
      const G = window.__grif;
      const shown = [...document.querySelectorAll('#lib details[data-lib]')].map(d => d.dataset.lib);
      const groups = [...document.querySelectorAll('#lib [data-libg]')].map(g => g.dataset.libg);
      return { shown, ids: Object.keys(G.EX), groups, R: G.GROUPS.R, visible: !document.getElementById('lib').hidden, nowHidden: getComputedStyle(document.querySelector('main.grid')).display === 'none' };
    });
    expect(res.visible).toBe(true);
    expect(res.nowHidden).toBe(true);
    expect(res.shown.slice().sort()).toEqual(res.ids.slice().sort());
    expect(new Set(res.shown).size).toBe(res.shown.length);
    expect(res.groups).toEqual(['W', 'B', 'R', 'A', 'L', 'C']);
    const num = id => +id.replace(/\D/g, '');
    expect(res.shown.filter(id => res.R.includes(id))).toEqual(res.R.slice().sort((a, b) => num(a) - num(b)));
    expect(errors).toEqual([]);
  });

  test(`раздел в EN: нет кириллицы на всех вариантах и уровнях (${inst})`, async ({ page }) => {
    const errors = await openApp(page, inst + '-library-en');
    if (inst.endsWith('bass')) await page.evaluate(() => { window.__grif.setStrings(6); window.__grif.setHand('pick'); });
    const res = await walkLib(page);
    expect(res.bad).toEqual([]);
    expect(res.tabErr).toEqual([]);
    expect(CYR.test(await page.title())).toBe(false);
    expect(CYR.test(await page.locator('header').innerText())).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('раздел: адрес, кнопка возврата, уровень не сохраняется, плеер', async ({ page }) => {
  const errors = await openApp(page, 'en');
  await expect(page.locator('#lib')).toBeHidden();
  await page.click('#libBtn');
  await expect(page.locator('#lib')).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#library-en');
  await page.evaluate(() => window.__grif.setInst('bass'));
  expect(await page.evaluate(() => location.hash)).toBe('#bass-library-en');
  await page.locator('#lib details[data-lib="B1"] > summary').click();
  const box = page.locator('#lib details[data-lib="B1"]');
  await box.locator('[data-liblvl="4"]').click();
  await expect(box.locator('[data-liblvl="4"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('grif.lvl'))).toBeNull();
  // число струн меняет таб в разделе
  const t4 = await box.locator('.tabbox').getAttribute('data-tab');
  await page.evaluate(() => window.__grif.setStrings(5));
  expect(await page.locator('#lib details[data-lib="B1"] .tabbox').getAttribute('data-tab')).not.toBe(t4);
  await page.locator('#lib details[data-lib="B1"] [data-play]').click();
  expect(await page.evaluate(() => window.__grif.Pl.on)).toBe(true);
  await page.click('#libBtn');
  expect(await page.evaluate(() => window.__grif.Pl.on)).toBe(false);
  await expect(page.locator('#lib')).toBeHidden();
  await expect(page.locator('#now')).toBeVisible();
  expect(await page.evaluate(() => location.hash)).toBe('#bass-en');
  // переход по адресу
  await page.evaluate(() => { location.hash = 'library-ru'; });
  await expect(page.locator('#lib')).toBeVisible();
  expect(errors).toEqual([]);
});

test('раздел: поиск и фильтр групп скрывают карточки, не перерисовывая раздел', async ({ page }) => {
  const errors = await openApp(page, 'library-ru');
  const visible = () => page.evaluate(() => [...document.querySelectorAll('#lib details[data-lib]')].filter(d => !d.closest('[hidden]')).map(d => d.dataset.lib));
  const all = await visible();
  await page.fill('#libQ', 'b1');
  expect(await visible()).toEqual(['B1']);
  await page.fill('#libQ', 'тремоло');
  const trem = await visible();
  expect(trem.length).toBeGreaterThan(1);
  expect(trem).toContain('B1');
  await page.click('#lib button[data-libf="R"]');
  expect((await visible()).every(id => id.startsWith('R'))).toBe(true);
  await page.fill('#libQ', 'zzzz');
  await expect(page.locator('#libEmpty')).toBeVisible();
  await page.fill('#libQ', '');
  await page.click('#lib button[data-libf="all"]');
  expect(await visible()).toEqual(all);
  expect(errors).toEqual([]);
});

// Нумерация: сквозной номер по порядку раздела, 1..N без пропусков, тот же в плане; id не меняются.
for (const inst of ['guitar', 'bass', 'blues-guitar', 'acoustic', 'blues-bass']) test('нумерация упражнений: ' + inst, async ({ page }) => {
  const errors = await openApp(page, inst + '-library');
  const r = await page.evaluate(() => {
    const nums = [...document.querySelectorAll('#lib details[data-lib] .lib-id')].map(e => +e.textContent);
    const ids = [...document.querySelectorAll('#lib details[data-lib]')].map(e => e.dataset.lib);
    return { nums, ids, n: Object.keys(window.__grif.EX).length };
  });
  expect(r.nums).toEqual(Array.from({ length: r.n }, (_, i) => i + 1));
  await page.click('#libBtn');
  const plan = await page.evaluate(() => [...document.querySelectorAll('#planList li b')].map(b => b.textContent));
  const segs = await page.evaluate(() => window.__grif.st.plan.segs.filter(s => s.id && window.__grif.EX[s.id]).map(s => s.id));
  segs.forEach(id => expect(plan.some(t => t.startsWith((r.ids.indexOf(id) + 1) + '. '))).toBe(true));
  expect(errors).toEqual([]);
});

// Память темпа (в будущем платная функция): рабочий темп подставляется при старте упражнения, чистый записывается кнопкой.
test('память рабочего и чистого темпа по упражнению', async ({ page }) => {
  const errors = await openApp(page, 'guitar');
  const r = await page.evaluate(() => {
    const G = window.__grif, segs = G.st.plan.segs;
    const ks = segs.map((s, k) => k).filter(k => segs[k].id && G.EX[segs[k].id] && segs[k].kind !== 'warm');
    const [a, b] = [ks[0], ks.find(k => segs[k].id !== segs[ks[0]].id)];
    const go = k => document.querySelectorAll('#planList li')[k].click();
    const bpm = document.getElementById('bpm');
    const set = v => { bpm.value = v; bpm.dispatchEvent(new Event('change')); };
    go(a); set(133); document.querySelector('[data-clean]').click(); set(120);
    go(b); set(90); go(a);
    return { bpm: +bpm.value, txt: document.getElementById('tempoMem').textContent, clean: JSON.parse(localStorage.getItem('grif.bpmClean')) };
  });
  expect(r.bpm).toBe(120);
  expect(r.txt).toContain('120');
  expect(r.txt).toContain('133');
  expect(Object.values(r.clean)[0].bpm).toBe(133);
  expect(errors).toEqual([]);
});
