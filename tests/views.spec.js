// Экраны и навигация после редизайна: вкладки, «Сегодня», шторка плана, ширина телефона, EN без кириллицы. Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const CYR = /[Ѐ-ӿ]/;
const VIEW_ID = { today: 'vToday', session: 'vSession', lib: 'lib', progress: 'vProgress', profile: 'settings', summary: 'vSummary' };

async function openApp(page, hash, theme) {
  await page.addInitScript(t => { try {
    if (localStorage.getItem('grif.time') == null) localStorage.setItem('grif.time', '60');
    if (t) localStorage.setItem('grif.theme', JSON.stringify(t));
  } catch (e) {} }, theme || null);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(new Date('2026-11-22T12:00:00')); // воскресенье, день 21 цикла 1
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}
// вход с небольшим журналом, чтобы «Прогресс» показал все блоки
const signIn = page => page.evaluate(() => {
  const G = window.__grif, S = window.__grifStore; S.user = 'u1';
  const rows = []; let n = 0;
  [14, 15, 17, 20].forEach(i => G.buildSession(i, 60).segs.forEach(s => { if (s.kind === 'pause') return; const ex = s.id && s.id !== 'TESTS' ? s.id : null;
    rows.push({ client_id: 'r' + (n++), day: 'x', day_index: i, genre: 'metal', inst: 'guitar', kind: s.kind, ex_id: ex, grp: ex ? ex.replace(/[0-9]+$/, '') : null, planned_sec: s.min * 60, played_sec: s.min * 60, bpm: 100, plan_min: 60, clean_bpm: s.kind === 'base' ? 100 + i : null }); }));
  S.fetchLog = async () => rows;
  localStorage.setItem('grif.tests', JSON.stringify({ T1: [{ bpm: 150, date: '2026-10-25' }, { bpm: 160, date: '2026-11-01' }] }));
});
const shown = page => page.evaluate(ids => Object.entries(ids).filter(([, id]) => !document.getElementById(id).hidden).map(([k]) => k), VIEW_ID);

test('вкладки: один экран за раз, «Упражнения» и «Профиль» повторным нажатием возвращают назад, Esc закрывает профиль', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  expect(await shown(page)).toEqual(['today']);
  for (const [btn, v] of [['#libBtn', 'lib'], ['#tabProgress', 'progress'], ['#setBtn', 'profile'], ['#tabToday', 'today']]) {
    await page.click(btn);
    expect(await shown(page), v).toEqual([v]);
    await expect(page.locator(btn)).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.body.dataset.view)).toBe(v);
  }
  await page.click('#tabProgress'); await page.click('#libBtn');
  expect(page.url()).toContain('library');
  await page.click('#libBtn');
  expect(await shown(page)).toEqual(['progress']);
  expect(page.url()).not.toContain('library');
  await page.click('#setBtn'); await page.keyboard.press('Escape');
  expect(await shown(page)).toEqual(['progress']);
  expect(errors).toEqual([]);
});

test('«Сегодня»: карточка цикла, план по видам на всё время, клик по виду и «Начать» открывают занятие', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await expect(page.locator('#cycleCard')).toContainText('День 21 из 28');
  await expect(page.locator('#cycleCard')).toContainText('Цикл 1');
  const r = await page.evaluate(() => {
    const G = window.__grif, segs = G.st.plan.segs, kinds = [...new Set(segs.map(s => s.kind))];
    const rows = [...document.querySelectorAll('#dayPlan button[data-grp]')];
    return { kinds: kinds.length, rows: rows.length, min: rows.reduce((a, b) => a + parseInt(b.querySelector('.v').textContent, 10), 0), T: G.st.T, first: rows.map(b => +b.dataset.grp) };
  });
  expect(r.rows).toBe(r.kinds);
  expect(r.min).toBe(r.T);
  // клик по второму виду — занятие на его первом сегменте, таймер не запущен
  await page.click(`#dayPlan button[data-grp="${r.first[1]}"]`);
  expect(await shown(page)).toEqual(['session']);
  expect(await page.evaluate(() => ({ cur: window.__grif.st.cur, run: window.__grif.st.running }))).toEqual({ cur: r.first[1], run: false });
  await expect(page.locator('#tabbar')).toBeHidden();
  await page.click('#exitBtn');
  await page.click('#startBtn');
  expect(await shown(page)).toEqual(['session']);
  expect(await page.evaluate(() => window.__grif.st.running)).toBe(true);
  await page.click('#exitBtn');
  await expect(page.locator('#startBtn')).toContainText('Вернуться к занятию');
  await page.evaluate(() => window.__grif.togglePlay());
  expect(errors).toEqual([]);
});

test('план в «Занятии»: на телефоне — шторка («План» открывает, выбор сегмента и Esc закрывают), на компьютере — всегда слева', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.setViewportSize({ width: 375, height: 800 });
  await page.evaluate(() => window.__grif.setView('session'));
  await page.click('#planBtn');
  await expect(page.locator('#planDrawer')).toBeVisible();
  expect(await page.evaluate(() => document.body.classList.contains('plan-open'))).toBe(true);
  await page.locator('#planList li').nth(2).click();
  expect(await page.evaluate(() => window.__grif.st.cur)).toBe(2);
  await expect(page.locator('#planDrawer')).toBeHidden();
  await page.click('#planBtn');
  await page.keyboard.press('Escape');
  await expect(page.locator('#planDrawer')).toBeHidden();
  await expect(page.locator('#planBtn')).toHaveAttribute('aria-expanded', 'false');
  // компьютер: колонка плана слева от занятия, кнопки «План» нет
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('#planDrawer')).toBeVisible();
  await expect(page.locator('#planBtn')).toBeHidden();
  const box = await page.locator('#planDrawer').boundingBox(), now = await page.locator('#now').boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(now.x + 1);
  await page.locator('#planList li').nth(4).click();
  expect(await page.evaluate(() => window.__grif.st.cur)).toBe(4);
  await expect(page.locator('#planDrawer')).toBeVisible();
  expect(errors).toEqual([]);
});

for (const theme of ['light', 'dark']) {
  test(`телефон 375 px (${theme}): ни один экран не шире окна`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const errors = await openApp(page, 'ru', theme);
    await signIn(page);
    for (const v of Object.keys(VIEW_ID)) {
      await page.evaluate(v => { const G = window.__grif; if (v === 'summary') G.openSummary(); else G.setView(v); }, v);
      await page.waitForTimeout(50);
      const w = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      expect(w, v).toBeLessThanOrEqual(375);
    }
    expect(errors).toEqual([]);
  });
}

test('EN: ни на одном экране нет кириллицы (текст, aria-label, title, placeholder)', async ({ page }) => {
  const errors = await openApp(page, 'en');
  await signIn(page);
  for (const v of Object.keys(VIEW_ID)) {
    await page.evaluate(v => { const G = window.__grif; if (v === 'summary') G.openSummary(); else G.setView(v); if (v === 'session') G.setPlanOpen(true); }, v);
    const bad = await page.evaluate(id => {
      const roots = [document.getElementById(id), document.getElementById('tabbar'), document.getElementById('planDrawer')].filter(e => e && !e.hidden);
      const out = [];
      roots.forEach(r => {
        if (/[Ѐ-ӿ]/.test(r.innerText)) out.push(r.innerText.split('\n').filter(l => /[Ѐ-ӿ]/.test(l)).slice(0, 3).join(' | '));
        r.querySelectorAll('*').forEach(e => ['aria-label', 'title', 'placeholder'].forEach(a => { const t = e.getAttribute(a); if (t && /[Ѐ-ӿ]/.test(t)) out.push(a + ': ' + t); }));
      });
      return out;
    }, VIEW_ID[v]);
    expect(bad, v).toEqual([]);
  }
  expect(CYR.test(await page.title())).toBe(false);
  expect(errors).toEqual([]);
});

test('«Мой инструмент»: чипы на обложке дня открывают шторку, выбор меняет чипы, Esc и «Готово» закрывают; строка в профиле', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await expect(page.locator('#instChips [data-ichip="genre"]')).toHaveText('Дэт-метал');
  await expect(page.locator('#instChips [data-ichip="inst"]')).toHaveText('Гитара · 6');
  await expect(page.locator('#instChips [data-ichip="tune"]')).toHaveText('E стандарт');
  await page.click('#instChips [data-ichip="inst"]');
  await expect(page.locator('#instSheet')).toBeVisible();
  await page.click('#instSw button[data-inst="bass"]');
  await page.click('#instDone');
  await expect(page.locator('#instSheet')).toBeHidden();
  await expect(page.locator('#instChips [data-ichip="inst"]')).toHaveText('Бас · 4');
  await page.click('#instChips [data-ichip="tune"]');
  await page.selectOption('#tuneKey', '-2');
  await page.keyboard.press('Escape');
  await expect(page.locator('#instSheet')).toBeHidden();
  await expect(page.locator('#instChips [data-ichip="tune"]')).toHaveText('D стандарт');
  await page.click('#setBtn');
  await expect(page.locator('#instRow')).toContainText('бас · 4 стр. · D стандарт');
  await page.click('#instRow');
  await expect(page.locator('#instSheet')).toBeVisible();
  await page.click('.isheet-bg', { position: { x: 10, y: 10 } });
  await expect(page.locator('#instSheet')).toBeHidden();
  await page.click('#instRow');
  await page.evaluate(() => window.__grif.setView('today'));
  await expect(page.locator('#instSheet')).toBeHidden();
  expect(errors).toEqual([]);
});
