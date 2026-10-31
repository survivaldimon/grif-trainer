// Строй (сдвиг вниз, drop), гитара на 7/8 струн, разметка нот в текстах (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const FIXED_NOW = new Date('2026-10-28T12:00:00');
const CYR = /[Ѐ-ӿ]/;

async function openApp(page, hash = 'ru') {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(URL_BASE + '#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}

test('строй: открытые струны, drop, 7/8 струн, название', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const G = window.__grif, T = tu => G.TUN(tu);
    return {
      std: [T('guitar').std, T('guitar').name, T('guitar7').name, T('guitar8').name, T('bass5').name],
      dropD: T('guitar@0d').open,
      bDrop: [T('guitar@-5d').name, T('guitar@-5d').key, G.tuneName('guitar@-5d')],
      b7: T('guitar7@-2').open.Y,
      errs: [G.parseTab(['Z1 Y2 E3 e0'], 4, 'guitar8')[0].errs.length, G.parseTab(['Z1 . . .'], 4, 'guitar7')[0].errs.length, G.parseTab(['Y1 . . .'], 4, 'guitar')[0].errs.length]
    };
  });
  expect(r.std).toEqual([true, 'EADGBE', 'BEADGBE', 'F# B E A D G B E', 'BEADG']);
  expect(r.dropD).toEqual({ E: 38, A: 45, D: 50, G: 55, B: 59, e: 64 });
  expect(r.bDrop).toEqual(['A E A D F# B', 'B', 'B drop A E A D F# B']);
  expect(r.b7).toBe(33);
  expect(r.errs).toEqual([0, 1, 1]);
});

test('drop: ноты нижней струны в табе на 2 лада выше, звучание как в стандарте того же тона', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const G = window.__grif, frets = tu => [...new DOMParser().parseFromString(G.renderTab(['E0 A2 E3b5 D0'], 4, '4/4', tu), 'image/svg+xml').querySelectorAll('text.nt')].map(t => t.textContent);
    const pitch = tu => { const T = G.TUN(tu); return G.parseTab(['E0 A2 E3'], 4, tu)[0].items.map(it => T.open[it.notes[0].s] + (T.drop && it.notes[0].s === T.low ? 2 : 0) + it.notes[0].f); };
    return { std: frets('guitar'), drop: frets('guitar@0d'), drop7: frets('guitar7@0d'), pStd: pitch('guitar@-2'), pDrop: pitch('guitar@-2d') };
  });
  expect(r.std).toEqual(['0', '2', '3', '0']);
  expect(r.drop).toEqual(['2', '2', '5', '0']);
  expect(r.drop7).toEqual(['0', '2', '3', '0']); // у 7 струн нижняя — Y, E не сдвигается
  expect(r.pDrop).toEqual(r.pStd);
});

test('разметка нот: нота, бемоль, струна, открытая струна в drop', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const G = window.__grif, out = [], s = '{E} фригийский, {A}m, {F#}, {Bb}, струна {s:E}, {s:e}, открытая {o:E}';
    for (const [o, d] of [[0, false], [-5, false], [-2, true], [-1, true]]) { G.setTuning(o, d); out.push(G.noteTxt(s)); }
    G.setTuning(0, false); G.setStrings(7); out.push(G.noteTxt('открытая {o:Y}, {o:E}')); G.setTuning(0, true); out.push(G.noteTxt('открытая {o:Y}'));
    G.setTuning(0, false); G.setStrings(6);
    return out;
  });
  expect(r).toEqual([
    'E фригийский, Am, F#, Bb, струна E, e, открытая E',
    'B фригийский, Em, C#, F, струна B, b, открытая B',
    'D фригийский, Gm, E, Ab, струна C, d, открытая D (2-й лад)',
    'D# фригийский, G#m, F, A, струна C#, d#, открытая D# (2-й лад)',
    'открытая B, E',
    'открытая B (2-й лад)'
  ]);
});

test('строй и число струн гитары: переключатели, localStorage, таб и заголовок, отдельно для инструментов', async ({ page }) => {
  const errors = await openApp(page);
  await page.selectOption('#tuneKey', '-5');
  await page.click('#dropChips button[data-drop="true"]');
  await page.click('#strChips button[data-str="7"]');
  let st = await page.evaluate(() => ({ tu: window.__grif.TU(), ls: localStorage.getItem('grif.tuning'), gs: localStorage.getItem('grif.gstrings'), hash: location.hash }));
  expect(st.tu).toBe('guitar7@-5d');
  expect(JSON.parse(st.ls).guitar).toEqual({ o: -5, d: true });
  expect(st.gs).toBe('7');
  expect(st.hash).not.toMatch(/-5|drop|7/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  st = await page.evaluate(() => ({ tu: window.__grif.TU(), key: document.getElementById('tuneKey').value }));
  expect(st).toEqual({ tu: 'guitar7@-5d', key: '-5' });
  // у баса свой строй
  await page.evaluate(() => window.__grif.setInst('bass'));
  st = await page.evaluate(() => window.__grif.TU());
  expect(st).toMatch(/^bass[456]$/);
  await page.evaluate(() => { window.__grif.setTuning(-2, false); window.__grif.setInst('guitar'); });
  st = await page.evaluate(() => ({ tu: window.__grif.TU(), tune: JSON.parse(localStorage.getItem('grif.tuning')) }));
  expect(st.tu).toBe('guitar7@-5d');
  expect(st.tune.bass).toEqual({ o: -2, d: false });
  // заголовок таба показывает строй
  const hd = await page.evaluate(() => window.__grif.tabHtml('', ['E0'], 1, '4/4', window.__grif.TU()));
  expect(hd).toContain('B drop');
  // кнопка «Настроиться» не падает
  await page.click('#tuneBtn');
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});

test('версия t7: выбирается на 7/8 струнах, подпись l7, в EN без кириллицы', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const G = window.__grif, d0 = G.dayInfo(0), out = {};
    const idx = G.EX.B2.v.findIndex(v => v.l7);
    for (const n of [6, 7, 8]) for (const lang of ['ru', 'en']) {
      G.setStrings(n); G.setLang(lang);
      const x = G.resolveEx({ id: 'B2', kind: 'base', pick: idx }, d0, 1);
      out[n + lang] = [x.v.l, x.v.t[0].split(' ')[0], x.tu];
    }
    G.setStrings(6); G.setLang('ru');
    return out;
  });
  expect(r['6ru']).toEqual(['Фригийский от открытой E', 'E0', 'guitar']);
  expect(r['7ru']).toEqual(['Фригийский от открытой B', 'Y0', 'guitar7']);
  expect(r['8en']).toEqual(['Phrygian from the open B', 'Y0', 'guitar8']);
});

test('разметка: струны {s:X}/{o:X} в подписях есть в табе показанной версии', async ({ page }) => {
  await openApp(page);
  const errs = await page.evaluate(() => {
    const G = window.__grif, errs = [];
    const strsOf = t => new Set(t.join(' ').split(/\s+/).flatMap(tok => tok.split('+')).map(p => (p.match(/^[A-Za-z]/) || [])[0]).filter(Boolean));
    for (const inst of ['guitar', 'bass']) {
      const EX = G[inst === 'bass' ? 'EX_BASS' : 'EX_GUITAR'], EN = G[inst === 'bass' ? 'EXEN_BASS' : 'EXEN_GUITAR'];
      for (const [id, ex] of Object.entries(EX)) (ex.v || []).forEach((v, k) => (v.lv || [v]).forEach((e, li) => {
        for (const ver of ['', '5', '6', '7', '8']) {
          const t = e['t' + ver]; if (!t) continue;
          const have = strsOf(t), en = EN[id].v && EN[id].v[k];
          const texts = [v['l' + ver] || v.l, v['note' + ver] || v.note];
          if (en && typeof en === 'object') texts.push(en['l' + ver] || en.l, en['note' + ver] || en.note);
          texts.forEach(x => { for (const m of String(x || '').matchAll(/\{[so]:([A-Za-z])\}/g)) if (!have.has(m[1])) errs.push(`${inst} ${id}.v${k} lv${li + 1} t${ver}: {${m[1]}} нет в табе`); });
        }
      }));
    }
    return errs;
  });
  expect(errs.slice(0, 30)).toEqual([]);
});

test('EN в нестандартном строе: план и данные без кириллицы и без плейсхолдеров', async ({ page }) => {
  const errors = await openApp(page, 'en');
  await page.evaluate(() => { window.__grif.setStrings(8); window.__grif.setTuning(-7, true); });
  const bad = [];
  const n = await page.locator('#planList li').count();
  for (let k = 0; k < n; k++) {
    await page.click(`#planList li:nth-child(${k + 1})`).catch(() => {});
    const txt = await page.evaluate(() => document.body.innerText);
    if (CYR.test(txt)) bad.push(`li ${k}: кириллица`);
    if (/\{[so]?:?[A-GYZe][#b]?\}/.test(txt)) bad.push(`li ${k}: плейсхолдер`);
  }
  expect(bad).toEqual([]);
  expect(errors).toEqual([]);
});
