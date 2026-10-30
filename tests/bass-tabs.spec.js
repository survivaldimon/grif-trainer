// Бас: строй и табы на 4/5/6 струн, плеер, переключатели инструмента, струн и техники, адреса (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const FIXED_NOW = new Date('2026-10-28T12:00:00');

async function openApp(page, hash = 'ru') {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}

test('строй: струны по инструменту, лишние струны — ошибка', async ({ page }) => {
  await openApp(page);
  const res = await page.evaluate(() => {
    const G = window.__grif;
    const errs = (sys, tu) => G.parseTab([sys], 4, tu)[0].errs.length;
    return {
      guitar: [errs('e12 B13 G14 D14 A12 E0 . . . . . . . . . .', 'guitar'), errs('C5 . . .', 'guitar')],
      bass4: [errs('G5 D7 A7 E0', 'bass4'), errs('B5 . . .', 'bass4'), errs('C5 . . .', 'bass4'), errs('e5 . . .', 'bass4')],
      bass5: [errs('G5 D7 A7 B0', 'bass5'), errs('C5 . . .', 'bass5')],
      bass6: [errs('C5 G5 E0 B0', 'bass6')],
      byDefault: errs('C5 . . .')
    };
  });
  expect(res.guitar).toEqual([0, 1]);
  expect(res.bass4).toEqual([0, 1, 1, 1]);
  expect(res.bass5).toEqual([0, 1]);
  expect(res.bass6).toEqual([0]);
  expect(res.byDefault).toBe(1);
});

test('мёртвая нота x: разбор и рисунок', async ({ page }) => {
  await openApp(page);
  const res = await page.evaluate(() => {
    const G = window.__grif;
    const s = G.parseTab(['E0 Ex Axm:2 A2+Ex . . . . . . . . . . .'], 4, 'bass4')[0];
    const box = document.createElement('div');
    box.innerHTML = G.renderTab(['E0 Ex Axm:2 . . . . . . . . . . . .'], 4, '4/4', 'bass4');
    return {
      errs: s.errs, len: s.len,
      xs: s.items.filter(it => it.notes && it.notes.some(n => n.x)).length,
      pm: s.items[2].pm,
      txt: [...box.querySelectorAll('text.nt')].map(t => t.textContent),
      bad: ['Exh', 'Ex5', 'x', 'Gx~'].map(t => G.parseTab([t + ' . . .'], 4, 'bass4')[0].errs.length)
    };
  });
  expect(res.errs).toEqual([]);
  expect(res.len).toBe(4);
  expect(res.xs).toBe(3);
  expect(res.pm).toBe(true);
  expect(res.txt).toEqual(['0', 'x', 'x']);
  expect(res.bad).toEqual([1, 1, 1, 1]);
});

test('рендер: столько линий, сколько струн у строя', async ({ page }) => {
  await openApp(page);
  const rows = await page.evaluate(() => {
    const G = window.__grif, out = {};
    for (const tu of ['guitar', 'bass4', 'bass5', 'bass6']) {
      const box = document.createElement('div');
      box.innerHTML = G.renderTab(['E0 E0 E0 E0'], 4, '4/4', tu);
      const svg = box.querySelector('svg');
      out[tu] = [[...svg.querySelectorAll('text.sl')].map(x => x.textContent).join(''), +svg.getAttribute('height'), /NaN|undefined/.test(svg.outerHTML)];
    }
    return out;
  });
  expect(rows.guitar[0]).toBe('eBGDAE');
  expect(rows.bass4[0]).toBe('GDAE');
  expect(rows.bass5[0]).toBe('GDAEB');
  expect(rows.bass6[0]).toBe('CGDAEB');
  expect(rows.bass4[1]).toBeLessThan(rows.bass5[1]);
  expect(rows.bass5[1]).toBeLessThan(rows.bass6[1]);
  expect(rows.bass6[1]).toBe(rows.guitar[1]);
  Object.values(rows).forEach(r => expect(r[2]).toBe(false));
});

test('плеер играет басовый таб без ошибок, пальцами и медиатором', async ({ page }) => {
  const errors = await openApp(page);
  for (const hand of ['fingers', 'pick']) {
    const res = await page.evaluate(async hand => {
      const G = window.__grif, body = document.getElementById('nowBody');
      G.Pl.hand = hand;
      const holder = document.createElement('div');
      holder.innerHTML = G.tabHtml('bass', ['B0 E0 Ex A7 D7b9 G5~ C3:2 Bxm . . . . . . .'], 4, '4/4', 'bass6');
      body.appendChild(holder);
      holder.querySelector('[data-play]').click();
      await new Promise(r => setTimeout(r, 400));
      const st = { on: G.Pl.on, tu: G.Pl.tu, voices: G.Pl.voices.length, bufs: Object.keys(G.Pl.bufs).filter(k => /^2\d/.test(k)).length };
      holder.querySelector('[data-play]').click();
      st.off = !G.Pl.on;
      holder.remove();
      return st;
    }, hand);
    expect(res.on).toBe(true);
    expect(res.tu).toBe('bass6');
    expect(res.voices).toBeGreaterThan(0);
    expect(res.bufs).toBeGreaterThan(0);
    expect(res.off).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('адрес и переключатель инструмента: #bass, #bass-en, запоминание', async ({ page }) => {
  const errors = await openApp(page, 'bass-en');
  let st = await page.evaluate(() => ({ inst: window.__grif.INST, title: document.title, hash: location.hash, bar: !document.getElementById('bassBar').hidden }));
  expect(st).toEqual({ inst: 'bass', title: 'Grif · bass', hash: '#bass-en', bar: true });
  // язык меняется — инструмент в адресе остаётся
  await page.click('.lang button[data-lang="ru"]');
  expect(await page.evaluate(() => location.hash)).toBe('#bass-ru');
  // гитара: адрес без bass, полоса баса скрыта, план строится из гитарных упражнений
  await page.click('#instSw button[data-inst="guitar"]');
  st = await page.evaluate(() => ({ inst: window.__grif.INST, hash: location.hash, bar: !document.getElementById('bassBar').hidden, ls: localStorage.getItem('grif.inst'), ex: window.__grif.EX === window.__grif.EX_GUITAR }));
  expect(st).toEqual({ inst: 'guitar', hash: '#ru', bar: false, ls: '"guitar"', ex: true });
  await page.click('#instSw button[data-inst="bass"]');
  // без адреса инструмент берётся из сохранённого
  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  expect(await page.evaluate(() => window.__grif.INST)).toBe('bass');
  // адрес главнее сохранённого, порядок слов не важен
  await page.goto(URL_BASE + '#en-guitar', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  expect(await page.evaluate(() => [window.__grif.INST, document.documentElement.lang])).toEqual(['guitar', 'en']);
  expect(errors).toEqual([]);
});

test('число струн и техника меняют таб и указания, не трогая таймер', async ({ page }) => {
  const errors = await openApp(page, 'bass-en');
  for (let k = 0; k < 5; k++) await page.click('#nextDay'); // день 0: пул вариантов 0, у B1 «Открытая E» есть t5
  await page.click('#timeChips button[data-t="60"]');
  const k = await page.evaluate(() => window.__grif.st.plan.segs.findIndex(s => s.id === 'B1'));
  await page.locator('#planList li').nth(k).click();
  await page.click('#playBtn');
  const rows = () => page.evaluate(() => [...document.querySelectorAll('#nowBody .tb')[0].querySelectorAll('text.sl')].map(x => x.textContent).join(''));
  expect(await rows()).toBe('GDAE');
  await expect(page.locator('#nowBody .tabhd')).toContainText('EADG');
  await expect(page.locator('#nowBody')).toContainText('Fingers:');
  const before = await page.evaluate(() => ({ cur: window.__grif.st.cur, running: window.__grif.st.running }));
  await page.click('#strChips button[data-str="5"]');
  expect(await rows()).toBe('GDAEB');
  await expect(page.locator('#nowBody .tabhd')).toContainText('BEADG');
  expect(await page.evaluate(() => [...document.querySelectorAll('#nowBody .tb text.nt')].length > 0 && /B0/.test(document.querySelector('#nowBody .tabbox').dataset.tab))).toBe(true);
  await page.click('#strChips button[data-str="6"]');
  expect(await rows()).toBe('CGDAEB');
  await page.click('#handChips button[data-hand="pick"]');
  await expect(page.locator('#nowBody')).toContainText('Pick:');
  const after = await page.evaluate(() => ({ cur: window.__grif.st.cur, running: window.__grif.st.running }));
  expect(after).toEqual(before);
  const ls = await page.evaluate(() => [localStorage.getItem('grif.strings'), localStorage.getItem('grif.hand'), window.__grif.Pl.hand]);
  expect(ls).toEqual(['6', '"pick"', 'pick']);
  expect(errors).toEqual([]);
});

test('версии на низкую B и высокую C есть во всех группах', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const G = window.__grif, by = {}, n = { t5: 0, t6: 0 };
    const grp = id => id[0] === 'W' ? 'W' : id[0];
    for (const [id, ex] of Object.entries(G.EX_BASS)) {
      const lv = (ex.v || []).flatMap(v => v.lv || []);
      const has5 = lv.some(x => x.t5), has6 = lv.some(x => x.t6);
      if (has5) n.t5++; if (has6) n.t6++;
      if (has5 || has6) by[grp(id)] = (by[grp(id)] || 0) + 1;
    }
    return { n, by };
  });
  expect(r.n.t5).toBeGreaterThanOrEqual(10);
  expect(r.n.t6).toBeGreaterThanOrEqual(5);
  for (const g of ['B', 'R', 'A', 'L', 'C']) expect(r.by[g] || 0, `группа ${g}`).toBeGreaterThan(0);
  expect(r.by.R).toBeGreaterThanOrEqual(5);
});

test('бас, EN: план 5 часов на 6 струнах с медиатором прокликан без кириллицы', async ({ page }) => {
  test.setTimeout(300000);
  const errors = await openApp(page, 'bass-en');
  await page.click('#strChips button[data-str="6"]');
  await page.click('#handChips button[data-hand="pick"]');
  await page.click('#timeChips button[data-t="300"]');
  const CYR = /[Ѐ-ӿ]+/g, bad = new Map();
  const scan = async where => {
    const found = await page.evaluate(() => {
      const parts = [document.body.innerText, document.title];
      document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el => ['aria-label', 'title', 'placeholder'].forEach(a => el.getAttribute(a) && parts.push(el.getAttribute(a))));
      return parts.join('\n');
    });
    (found.match(CYR) || []).forEach(w => { if (!bad.has(w)) bad.set(w, where); });
  };
  // −5…−1 вводная, 0…6 — все фокусы недели, 27 — день тестов; остальное покрыто тестом данных EN
  const days = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 27];
  let cur = -5;
  for (const day of days) {
    while (cur < day) { await page.click('#nextDay'); cur++; }
    const items = page.locator('#planList li'), n = await items.count();
    for (let k = 0; k < n; k++) { await items.nth(k).click(); await scan(`day ${day}, item ${k}`); }
    await page.click('#shareBtn');
    const share = await page.evaluate(() => { const t = document.getElementById('shareText'); return t ? t.value : ''; });
    (share.match(CYR) || []).forEach(w => { if (!bad.has(w)) bad.set(w, `day ${day}, share`); });
  }
  expect([...bad].map(([w, where]) => `${where}: ${w}`)).toEqual([]);
  expect(errors).toEqual([]);
});
