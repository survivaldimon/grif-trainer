// Жанры (джаз, фанк, фингерстайл), открытые строи, свинг метронома, размеры риффа дня по жанрам (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
// экраны (редизайн): выбор времени — на «Сегодня»; таймер, план и таб — в «Занятии» с открытым планом
const toToday = page => page.evaluate(() => window.__grif.setView('today'));
const toSession = page => page.evaluate(() => { window.__grif.setView('session'); window.__grif.setPlanOpen(true); });
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

test('жанры: адрес, инструменты, ключи упражнений', async ({ page }) => {
  for (const [hash, genre, inst] of [['fingerstyle-ru', 'fingerstyle', 'acoustic'], ['jazz-bass-en', 'jazz', 'bass'], ['funk-ru', 'funk', 'guitar'],
    ['acoustic-ru', 'blues', 'acoustic'], ['jazz-acoustic-ru', 'jazz', 'acoustic'], ['funk-acoustic-ru', 'blues', 'acoustic']]) {
    await page.goto('about:blank'); const errors = await openApp(page, hash);
    const r = await page.evaluate(() => ({ g: window.__grif.GENRE, i: window.__grif.INST, h: location.hash }));
    expect([hash, r.g, r.i]).toEqual([hash, genre, inst]);
    expect(errors).toEqual([]);
  }
  const r = await page.evaluate(() => {
    const G = window.__grif, out = [];
    G.setProf('funk-bass'); out.push(G.GENRE + ':' + G.INST + ':' + location.hash);
    G.setGenre('fingerstyle'); out.push(G.GENRE + ':' + G.INST + ':' + location.hash);
    G.setGenre('funk'); out.push(G.GENRE + ':' + G.INST + ':' + location.hash);
    G.setInst('acoustic'); out.push(G.GENRE + ':' + G.INST + ':' + location.hash);
    G.setProf('jazz-acoustic'); out.push(G.GENRE + ':' + G.INST + ':' + location.hash);
    const opts = [...document.querySelectorAll('#genreSel option')].map(o => o.value);
    const hidden = [...document.querySelectorAll('#instSw button')].filter(b => b.hidden).map(b => b.dataset.inst);
    return { out, opts, hidden };
  });
  expect(r.out).toEqual(['funk:bass:#funk-bass-ru', 'fingerstyle:acoustic:#fingerstyle-acoustic-ru', 'funk:guitar:#funk-ru',
    'blues:acoustic:#acoustic-ru', 'jazz:acoustic:#jazz-acoustic-ru']);
  expect(r.opts).toEqual(['metal', 'blues', 'jazz', 'funk', 'fingerstyle']);
  expect(r.hidden).toEqual([]);
  // уровень хранится с префиксом жанра: funk.bass.R6
  const lv = await page.evaluate(() => { const G = window.__grif; G.setProf('funk-bass'); localStorage.removeItem('grif.lvl');
    const s = G.st.plan.segs.findIndex(x => x.id && x.id[0] !== 'W'); G.st.cur = s; G.renderNow && 0;
    return Object.keys(G).includes('exKey') ? G.exKey('R6') : null; });
  expect(lv).toBe('funk.bass.R6');
});

test('размеры риффа дня: свои у жанра, по 8, в EN без кириллицы', async ({ page }) => {
  await openApp(page, 'en');
  const r = await page.evaluate(() => {
    const G = window.__grif, out = {};
    for (const g of Object.keys(G.GENRES)) {
      const m = (G.LIBS[g][G.GENRES[g][0]].METERS) || null;
      out[g] = m ? [m.ru.length, m.en.length, m.en.some(x => /[Ѐ-ӿ]/.test(x))] : null;
      G.setProf(g === 'fingerstyle' ? g : g + '-' + G.GENRES[g][0]);
      out[g + '.now'] = G.riffMeters().en[0];
    }
    return out;
  });
  expect(r.metal).toBe(null); expect(r.blues).toBe(null);
  for (const g of ['jazz', 'funk', 'fingerstyle']) expect(r[g]).toEqual([8, 8, false]);
  expect(r['metal.now']).toBe('4/4');
  expect(r['jazz.now']).toBe('4/4 swing');
});

test('свинг метронома: долгая-короткая 2:1', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const G = window.__grif; G.setSub('sw');
    const a = [G.Mt.sub, G.Mt.sw, G.subFrac(0), G.subFrac(1), document.getElementById('mSub').value];
    G.setSub(3); return a.concat([G.Mt.sw, G.subFrac(0)]);
  });
  expect(r[0]).toBe(2); expect(r[1]).toBe(true);
  expect(r[2]).toBeCloseTo(2 / 3); expect(r[3]).toBeCloseTo(1 / 3);
  expect(r[4]).toBe('sw'); expect(r[5]).toBe(false); expect(r[6]).toBeCloseTo(1 / 3);
});

test('открытые строи: ноты, подписи, сдвиг, вариант с tun', async ({ page }) => {
  await openApp(page, 'fingerstyle-ru');
  const r = await page.evaluate(() => {
    const G = window.__grif, T = G.TUN;
    const names = Object.fromEntries(G.OPEN_TUNINGS.map(k => [k, T(k).name]));
    const ex = G.EX, id = 'W1', save = ex[id];
    ex[id] = Object.assign({}, save, { v: [{ t: ['E0 A0 D0 G0 B0 e0 . .'], tun: 'dadgad', l: 'Струна {s:B}, открытая {o:E}' }] });
    const seg = { kind: 'warm', id, min: 2 }, d = G.dayInfo(0);
    const a = G.resolveEx(seg, d);
    G.setTuning(-2, true);
    const b = G.resolveEx(seg, d);
    G.setTuning(0, false);
    ex[id] = save;
    return {
      names, tu: a.tu, l: a.v.l, tub: b.tu, nameb: G.tuneName(b.tu), name: G.tuneName(a.tu),
      txt: G.noteTxt('{s:B} {s:G} {o:E} {E}', 'openg'), parse: G.parseTab(['E0 B2 . .'], 4, 'dadgad')[0].errs.length,
      bassOpen: G.OPEN_TUNINGS.some(k => G.TUNINGS[k].bass)
    };
  });
  expect(r.names).toEqual({ dadgad: 'DADGAD', opend: 'D A D F# A D', opendm: 'DADFAD', openg: 'DGDGBD', openc: 'CGCGCE', opene: 'E B E G# B E', opena: 'E A E A C# E', dropd: 'DADGBE', dgdgcd: 'DGDGCD', cgcgcd: 'CGCGCD' });
  expect(r.tu).toBe('dadgad');
  expect(r.l).toBe('Струна A, открытая D');
  expect(r.tub).toBe('dadgad@-2');
  expect(r.name).toBe('DADGAD');
  expect(r.nameb).toBe('DADGAD · CGCFGC');
  expect(r.txt).toBe('B G D E');
  expect(r.parse).toBe(0);
  expect(r.bassOpen).toBe(false);
});
