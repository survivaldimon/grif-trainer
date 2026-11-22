// Учёт занятий и итог (редизайн, этап 5). Вход симулируется: window.__grifStore.user = id. Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const CYR = /[Ѐ-ӿ]/;

async function openApp(page, hash) {
  await page.addInitScript(() => { try { if (localStorage.getItem('grif.time') == null) localStorage.setItem('grif.time', '60'); } catch (e) {} });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(new Date('2026-11-04T12:00:00')); // среда 4 ноября: dayIndex 2, фокус — левая рука
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}
// «играем» sec секунд на сегменте k и уходим на следующий
const play = (page, k, sec) => page.evaluate(([k, sec]) => {
  const G = window.__grif, li = j => document.querySelectorAll('#planList li')[j];
  G.setView('session'); li(k).click(); G.st.running = true;
  for (let t = 0; t < sec; t += 1) G.prTick(1);
  li(k + 1).click();
}, [k, sec]);
const queue = page => page.evaluate(() => JSON.parse(localStorage.getItem('grif.logq') || 'null'));

test('без входа занятия не записываются', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await play(page, 1, 60);
  expect(await queue(page)).toBeNull();
  expect(errors).toEqual([]);
});

test('после входа: сегмент дольше 15 с — одна запись, короче — нет', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.evaluate(() => { window.__grifStore.user = 'u1'; });
  const k = await page.evaluate(() => window.__grif.st.plan.segs.findIndex(s => s.kind === 'focus'));
  await play(page, k, 42);
  await play(page, k + 1, 10);
  const q = await queue(page);
  expect(q.log.length).toBe(1);
  const r = q.log[0], s = await page.evaluate(k => window.__grif.st.plan.segs[k], k);
  expect(r).toMatchObject({ _u: 'u1', day: '2026-11-04', day_index: 2, genre: 'metal', inst: 'guitar', kind: 'focus', ex_id: s.id, grp: 'L', planned_sec: s.min * 60, played_sec: 42, bpm: 100 });
  expect(r.lvl).toBe(2);
  expect(typeof r.client_id).toBe('string');
  expect(q.ses).toEqual([]);
  expect(errors).toEqual([]);
});

test('пока таймер стоит, время не идёт в учёт (тренер ждёт «Готов» — таймер тоже стоит)', async ({ page }) => {
  await openApp(page, 'ru');
  const sec = await page.evaluate(() => {
    const G = window.__grif; window.__grifStore.user = 'u1';
    G.setView('session'); const k = G.st.plan.segs.findIndex(s => s.kind === 'base'); document.querySelectorAll('#planList li')[k].click();
    G.st.running = false; G.prTick(30); // таймер стоит — не считается
    return G.PR.sec[k] || 0;
  });
  expect(sec).toBe(0);
});

test('итог: «Завершить» останавливает таймер, сохраняет самочувствие и заметку', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.evaluate(() => { window.__grifStore.user = 'u1'; });
  await play(page, 1, 120);
  await page.evaluate(() => { const G = window.__grif; G.setView('session'); G.st.running = true; G.setPlanOpen(true); });
  await page.click('#finishBtn');
  await expect(page.locator('#vSummary')).toBeVisible();
  expect(await page.evaluate(() => window.__grif.st.running)).toBe(false);
  await expect(page.locator('#vSummary')).toContainText('2');
  await page.click('#vSummary [data-feel="4"]');
  await page.fill('#sumNote', 'ровно на 120');
  await page.click('#sumSave');
  await expect(page.locator('#vToday')).toBeVisible();
  const q = await queue(page);
  expect(q.ses.length).toBe(1);
  expect(q.ses[0]).toMatchObject({ _u: 'u1', day: '2026-11-04', genre: 'metal', inst: 'guitar', planned_min: 60, played_sec: 120, feel: 4, note: 'ровно на 120' });
  expect(errors).toEqual([]);
});

test('итог без входа: подсказка войти, ничего не пишется; EN без кириллицы', async ({ page }) => {
  const errors = await openApp(page, 'en');
  await play(page, 1, 30);
  await page.evaluate(() => window.__grif.openSummary());
  await expect(page.locator('#sumSignIn')).toBeVisible();
  expect(CYR.test(await page.locator('#vSummary').innerText())).toBe(false);
  await page.click('#sumSave');
  expect(await queue(page)).toBeNull();
  expect(errors).toEqual([]);
});
