// Онбординг первого входа (редизайн, этап 3): инструмент → жанр → время. Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const CYR = /[Ѐ-ӿ]/;

async function openFresh(page, hash) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00'));
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}

test('первый вход: три шага, выбор сохраняется, второй раз не показывается', async ({ page }) => {
  const errors = await openFresh(page, 'ru');
  await expect(page.locator('#onb')).toBeVisible();
  await expect(page.locator('#onbH')).toHaveText('На чём вы играете?');
  // шаг 1: бас
  await page.click('[data-onb="inst"][data-v="bass"]');
  await expect(page.locator('[data-onb="inst"][data-v="bass"]')).toHaveAttribute('aria-pressed', 'true');
  await page.click('#onbNext');
  // шаг 2: только жанры, где есть бас
  const genres = await page.locator('[data-onb="genre"]').evaluateAll(b => b.map(x => x.dataset.v));
  expect(genres).toEqual(['metal', 'blues', 'jazz', 'funk']);
  await page.click('[data-onb="genre"][data-v="funk"]');
  await page.click('#onbNext');
  // шаг 3: время; «Назад» возвращает на жанр с прежним выбором
  await page.click('#onbBack');
  await expect(page.locator('[data-onb="genre"][data-v="funk"]')).toHaveAttribute('aria-pressed', 'true');
  await page.click('#onbNext');
  await page.click('[data-onb="time"][data-v="30"]');
  await page.click('#onbNext');
  await expect(page.locator('#onb')).toBeHidden();
  await expect(page.locator('#vToday')).toBeVisible();
  const r = await page.evaluate(() => ({ inst: window.__grif.INST, genre: window.__grif.GENRE, T: window.__grif.st.T, ls: ['inst', 'genre', 'time'].map(k => localStorage.getItem('grif.' + k)) }));
  expect(r).toEqual({ inst: 'bass', genre: 'funk', T: 30, ls: ['"bass"', '"funk"', '30'] });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  await expect(page.locator('#onb')).toBeHidden();
  expect(await page.evaluate(() => window.__grif.GENRE)).toBe('funk');
  expect(errors).toEqual([]);
});

test('акустика: из жанров только блюз, джаз и фингерстайл', async ({ page }) => {
  await openFresh(page, 'ru');
  await page.click('[data-onb="inst"][data-v="acoustic"]');
  await page.click('#onbNext');
  expect(await page.locator('[data-onb="genre"]').evaluateAll(b => b.map(x => x.dataset.v))).toEqual(['blues', 'jazz', 'fingerstyle']);
  await expect(page.locator('[data-onb="genre"][data-v="blues"]')).toHaveAttribute('aria-pressed', 'true');
});

test('«Пропустить» сохраняет значения по умолчанию и больше не показывает онбординг', async ({ page }) => {
  const errors = await openFresh(page, 'en');
  await page.click('#onbSkip');
  await expect(page.locator('#onb')).toBeHidden();
  expect(await page.evaluate(() => ['inst', 'genre', 'time'].map(k => localStorage.getItem('grif.' + k)))).toEqual(['"guitar"', '"metal"', '60']);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  await expect(page.locator('#onb')).toBeHidden();
  expect(errors).toEqual([]);
});

test('адрес с жанром, инструментом или library открывает приложение без онбординга', async ({ page }) => {
  for (const h of ['blues-bass-ru', 'acoustic', 'library-en', 'jazz']) {
    await page.goto('about:blank');
    await openFresh(page, h);
    await expect(page.locator('#onb'), h).toBeHidden();
  }
});

test('EN: в онбординге нет кириллицы, переключатель языка работает', async ({ page }) => {
  const errors = await openFresh(page, 'en');
  const txt = () => page.locator('#onb').innerText();
  for (let k = 0; k < 3; k++) {
    expect(CYR.test(await txt()), `шаг ${k + 1}`).toBe(false);
    await page.click('#onbNext');
    if (k < 2) await expect(page.locator('#onb')).toBeVisible();
  }
  await page.evaluate(() => window.__grif.openOnb());
  await page.click('[data-onblang="ru"]');
  await expect(page.locator('#onbH')).toHaveText('На чём вы играете?');
  expect(await page.evaluate(() => localStorage.getItem('grif.lang'))).toBe('"ru"');
  expect(errors).toEqual([]);
});
