// Табы и плеер для баса на 4/5/6 струн (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const FIXED_NOW = new Date('2026-10-28T12:00:00');

async function openApp(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(URL_BASE + '#ru', { waitUntil: 'domcontentloaded' });
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
