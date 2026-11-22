// Экран «Прогресс» (редизайн, этап 6). Вход симулируется: window.__grifStore.user = id, журнал — заглушка fetchLog. Запуск: npm test
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
  await page.clock.setFixedTime(new Date('2026-11-22T12:00:00')); // воскресенье, dayIndex 20, неделя «Скорость»
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}
// вход и журнал: src — тело функции (G) => строки журнала; fail — fetchLog с ошибкой сети
const signIn = (page, src, fail) => page.evaluate(([src, fail]) => {
  const G = window.__grif, S = window.__grifStore;
  S.user = 'u1';
  const rows = new Function('G', src)(G);
  S.fetchLog = async () => { if (fail) throw new Error('offline'); return rows; };
}, [src, !!fail]);
// дни [i, T], сыгранные ровно по плану (все сегменты, кроме пауз)
const PLAN_DAYS = `return (function(days){const out=[];let n=0;
  days.forEach(([i,T])=>G.buildSession(i,T).segs.forEach(s=>{if(s.kind==='pause')return;
    const ex=s.id&&s.id!=='TESTS'?s.id:null;
    out.push({client_id:'r'+(n++),day:'x',day_index:i,genre:'metal',inst:'guitar',kind:s.kind,ex_id:ex,grp:ex?ex.replace(/[0-9]+$/,''):null,planned_sec:s.min*60,played_sec:s.min*60,bpm:100,plan_min:T,clean_bpm:null});}));
  return out;})`;

test('без входа: подсказка войти, кнопка ведёт в профиль, тесты цикла видны', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.click('#tabProgress');
  await expect(page.locator('#pgSignIn')).toBeVisible();
  await expect(page.locator('#pgTests')).toContainText('Тесты цикла');
  await expect(page.locator('#pgTests')).toContainText('29 ноября'); // ближайшее воскресенье 4-й недели
  await expect(page.locator('#pgStatus')).toHaveCount(0);
  await page.click('#pgSignIn [data-pgsign]');
  await expect(page.locator('#settings')).toBeVisible();
  expect(errors).toEqual([]);
});

test('дни по плану — 100% по навыкам; статус, минуты; день короче 10 минут не засчитан', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  // 16, 17, 19, 20 — по плану 60 мин; 18 — 8 минут
  await signIn(page, PLAN_DAYS + `([[16,60],[17,60],[19,60],[20,60]]).concat([{client_id:'short',day:'x',day_index:18,genre:'metal',inst:'guitar',kind:'base',ex_id:'B1',grp:'B',planned_sec:600,played_sec:480,bpm:100,plan_min:60,clean_bpm:null}])`);
  await page.click('#tabProgress');
  await expect(page.locator('#pgStatus')).toBeVisible();
  const r = await page.evaluate(() => {
    const G = window.__grif, rad = G.pgRadar(G.pgDays(G.pgRows()), 0);
    return { n: rad.n, v: rad.v.filter(x => x != null).map(x => Math.round(x * 100)), st: document.querySelector('#pgStatus').dataset.st,
      nums: [...document.querySelectorAll('.pg-nums b')].map(b => b.textContent),
      cols: document.querySelectorAll('#pgCols rect.pg-col').length, ok: document.querySelectorAll('#pgCols rect.pg-col.ok').length };
  });
  expect(r.n).toBe(4);
  expect(r.v.length).toBeGreaterThanOrEqual(5);
  expect(r.v.every(x => x === 100)).toBe(true);
  expect(r.st).toBe('keep'); // 4 дня из 7; план дня без пауз 54 мин: 224 из 378
  expect(r.nums).toEqual(['4 из 7', '59%', '224 мин']);
  expect(r).toMatchObject({ cols: 5, ok: 4 });
  await expect(page.locator('#pgRadar')).toContainText('100%');
  expect(errors).toEqual([]);
});

test('чистый темп: история из журнала текущих жанра и инструмента, рост за неделю в статусе', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await signIn(page, `const r=(id,i,b,genre,inst)=>({client_id:id+i+(genre||'')+(inst||''),day:'x',day_index:i,genre:genre||'metal',inst:inst||'guitar',kind:'focus',ex_id:id,grp:id[0],planned_sec:600,played_sec:600,bpm:b-10,plan_min:60,clean_bpm:b});
    return [r('R6',3,120),r('R6',10,126),r('R6',19,134),r('A16',5,90),r('R7',19,200,'blues'),r('R8',19,180,'metal','bass')];`);
  await page.click('#tabProgress');
  expect(await page.locator('#pgClean [data-ex]').evaluateAll(b => b.map(x => x.dataset.ex))).toEqual(['R6', 'A16']);
  await expect(page.locator('#pgClean [data-ex="R6"]')).toContainText('134');
  await expect(page.locator('#pgClean [data-ex="R6"] .dl')).toHaveText('+14');
  await expect(page.locator('#pgStatus')).toContainText('Чистый темп вырос в 1 упражнении');
  expect(errors).toEqual([]);
});

test('журнал пишет время плана и чистый темп сегмента (даже короче 15 с); очередь сразу видна в «Прогрессе»', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.evaluate(() => { window.__grifStore.user = 'u1'; window.__grifStore.fetchLog = async () => []; });
  const id = await page.evaluate(() => {
    const G = window.__grif; G.setView('session');
    const k = G.st.plan.segs.findIndex(s => s.kind === 'base'); document.querySelectorAll('#planList li')[k].click();
    G.Mt.bpm = 132; document.querySelector('#nowBody button[data-clean]').click();
    document.querySelectorAll('#planList li')[k + 1].click();
    return G.st.plan.segs[k].id;
  });
  const q = await page.evaluate(() => JSON.parse(localStorage.getItem('grif.logq')));
  expect(q.log.length).toBe(1);
  expect(q.log[0]).toMatchObject({ ex_id: id, plan_min: 60, clean_bpm: 132, played_sec: 0 });
  expect(await page.evaluate(id => JSON.parse(localStorage.getItem('grif.bpmClean'))[id], id)).toEqual({ bpm: 132, date: '2026-11-22' });
  await page.click('#exitBtn');
  await page.click('#tabProgress');
  await expect(page.locator(`#pgClean [data-ex="${id}"]`)).toContainText('132');
  expect(errors).toEqual([]);
});

test('нет связи: записи с устройства и пометка', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await signIn(page, 'return [];', true);
  await page.evaluate(() => localStorage.setItem('grif.logq', JSON.stringify({ log: [{ _u: 'u1', client_id: 'q1', day: '2026-11-22', day_index: 20, genre: 'metal', inst: 'guitar', kind: 'base', ex_id: 'B1', grp: 'B', planned_sec: 900, played_sec: 900, bpm: 100, plan_min: 60, clean_bpm: null }], ses: [] })));
  await page.click('#tabProgress');
  await expect(page.locator('#pgNote')).toContainText('Нет связи');
  await expect(page.locator('.pg-nums b').nth(2)).toHaveText('15 мин');
  expect(errors).toEqual([]);
});

test('EN: на экране нет кириллицы (без входа и с данными)', async ({ page }) => {
  const errors = await openApp(page, 'en');
  await page.evaluate(() => localStorage.setItem('grif.tests', JSON.stringify({ T1: [{ bpm: 150, date: '2026-10-25' }, { bpm: 160, date: '2026-11-01' }] })));
  await page.click('#tabProgress');
  expect(CYR.test(await page.locator('#vProgress').innerText())).toBe(false);
  await signIn(page, PLAN_DAYS + `([[14,60],[15,30],[20,60]]).map((x,j)=>Object.assign(x,{clean_bpm:x.kind==='focus'?100+j:null}))`);
  await page.evaluate(() => window.__grif.renderProgress());
  await expect(page.locator('#pgStatus')).toBeVisible();
  await expect(page.locator('#pgClean [data-ex]').first()).toBeVisible();
  const txt = await page.locator('#vProgress').innerText();
  const attrs = await page.locator('#vProgress').evaluate(e => [...e.querySelectorAll('*')].map(x => (x.getAttribute('aria-label') || '') + (x.getAttribute('title') || '') + (x.tagName === 'title' ? x.textContent : '')).join(' '));
  expect(txt.match(CYR)).toBeNull();
  expect(attrs.match(CYR)).toBeNull();
  expect(errors).toEqual([]);
});
