// Инварианты «Грифа» (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const INDEX = path.join(__dirname, '..', 'index.html');
const URL_BASE = pathToFileURL(INDEX).href;
const LS_KEYS = ['time', 'lang', 'bpm', 'bpmEx', 'tests'];
// Среда, 28 октября 2026: dayIndex = −5, вводная неделя. Дата зафиксирована, чтобы тесты не зависели от сегодняшнего дня.
const FIXED_NOW = new Date('2026-10-28T12:00:00');

async function openApp(page, lang) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(URL_BASE + '#' + lang, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}

test('localStorage только через lsGet/lsSet и только разрешённые ключи', () => {
  const src = fs.readFileSync(INDEX, 'utf8');
  const lines = src.split(/\r?\n/).filter(l => l.includes('localStorage'));
  expect(lines.length).toBe(2);
  lines.forEach(l => expect(l).toMatch(/^function ls(Get|Set)\(k.*try\{.*\}catch/));
  const keys = [...src.matchAll(/ls(?:Get|Set)\('([^']+)'/g)].map(m => m[1]);
  expect(keys.length).toBeGreaterThan(0);
  keys.forEach(k => expect(LS_KEYS).toContain(k));
});

test('расписание: суммы, паузы, покрытие упражнений', async ({ page }) => {
  await openApp(page, 'ru');
  const res = await page.evaluate(() => {
    const G = window.__grif, errs = [], used = new Set();
    for (let i = -7; i <= 168; i++) {
      for (const T of G.TIMES) {
        const { segs } = G.buildSession(i, T);
        const where = `day ${i}, T=${T}`;
        const sum = segs.reduce((a, s) => a + s.min, 0);
        if (sum !== T) errs.push(`${where}: сумма ${sum}`);
        segs.forEach((s, k) => {
          if (!(s.min > 0)) errs.push(`${where}: сегмент ${k} (${s.kind}) = ${s.min} мин`);
          if (s.id && s.id !== 'TESTS' && !G.EX[s.id]) errs.push(`${where}: неизвестный id ${s.id}`);
          if (s.kind === 'pause' && (k === 0 || k === segs.length - 1)) errs.push(`${where}: пауза на краю`);
          if (s.kind === 'pause' && segs[k + 1] && segs[k + 1].kind === 'pause') errs.push(`${where}: паузы подряд`);
          if (k > 0 && s.start !== segs[k - 1].start + segs[k - 1].min) errs.push(`${where}: разрыв start в ${k}`);
          if (i >= 0 && i < 6 * 28 && s.id) used.add(s.id);
        });
      }
    }
    const missing = Object.keys(G.EX).filter(id => !used.has(id));
    return { errs: errs.slice(0, 30), missing };
  });
  expect(res.errs).toEqual([]);
  expect(res.missing, 'упражнения, ни разу не попавшие в план за 6 циклов').toEqual([]);
});

test('EXEN покрывает EX', async ({ page }) => {
  await openApp(page, 'ru');
  const errs = await page.evaluate(() => {
    const { EX, EXEN } = window.__grif, errs = [];
    for (const id of Object.keys(EX)) {
      const en = EXEN[id];
      if (!en) { errs.push(`${id}: нет EXEN`); continue; }
      for (const f of ['name', 'goal', 'how', 'tip']) if (!en[f]) errs.push(`${id}: нет EN ${f}`);
      const rv = EX[id].v || [], ev = en.v || [];
      if (rv.length !== ev.length) errs.push(`${id}: вариантов RU ${rv.length}, EN ${ev.length}`);
      rv.forEach((v, k) => {
        const e = ev[k];
        const l = typeof e === 'string' ? e : e && e.l;
        if (!l) errs.push(`${id}.v${k}: нет EN l`);
        if (v.note && !(e && typeof e === 'object' && e.note)) errs.push(`${id}.v${k}: нет EN note`);
      });
    }
    return errs;
  });
  expect(errs).toEqual([]);
});

test('табы: стандартный строй, 6 струн, корректные токены', async ({ page }) => {
  await openApp(page, 'ru');
  const errs = await page.evaluate(() => {
    const G = window.__grif, errs = [];
    const PART = /^([eBGDAE])[hpt]?(\d{1,2})(b\d{1,2}(r\d{1,2})?)?[~*]?$/;
    const checkSystems = (where, systems) => {
      systems.forEach(sys => sys.trim().split(/\s+/).forEach(tok => {
        if (tok === '.' || tok === '|') return;
        const strs = new Set();
        tok.split('+').forEach(p => {
          const m = p.match(PART);
          if (!m) { errs.push(`${where}: токен ${tok}`); return; }
          if (strs.has(m[1])) errs.push(`${where}: струна дважды в ${tok}`);
          strs.add(m[1]);
          if (+m[2] > 24) errs.push(`${where}: лад ${m[2]}`);
        });
      }));
      G.renderTab(systems).split('\n\n').forEach(block => {
        const rows = block.split('\n').map(r => r[0]).join('');
        if (rows !== 'eBGDAE') errs.push(`${where}: строки ${rows}`);
      });
    };
    for (const [id, ex] of Object.entries(G.EX)) (ex.v || []).forEach((v, k) => checkSystems(`${id}.v${k}`, v.t));
    G.TESTS.forEach(t => checkSystems(t.id, t.t));
    // gen-упражнения зависят от дня и лада: проходим все 6 ладов и все перестановки
    for (let i = -7; i <= 168; i++) {
      const d = G.dayInfo(i);
      for (const id of ['B4', 'A21', 'L24', 'L28']) {
        const r = G.resolveEx({ id }, d);
        if (!r || !r.v) { errs.push(`${id} day ${i}: нет варианта`); continue; }
        checkSystems(`${id} day ${i}`, r.v.t);
      }
    }
    return errs.slice(0, 30);
  });
  expect(errs).toEqual([]);
});

test('EN: данные без кириллицы', async ({ page }) => {
  await openApp(page, 'en');
  const errs = await page.evaluate(() => {
    const G = window.__grif, errs = [], CYR = /[Ѐ-ӿ]/;
    const chk = (where, s) => { if (s != null && CYR.test(String(s))) errs.push(`${where}: ${s}`); };
    G.setLang('en');
    for (let i = -7; i <= 168; i++) {
      for (const T of G.TIMES) {
        const { segs, d } = G.buildSession(i, T);
        segs.forEach(s => {
          if (!s.id || s.id === 'TESTS') return;
          for (const f of ['name', 'goal', 'how', 'tip']) chk(`${s.id}.${f}`, G.X(s.id, f));
          const r = G.resolveEx(s, d);
          if (r && r.v) { chk(`${s.id} day ${i} label`, r.v.l); chk(`${s.id} day ${i} note`, r.v.note); }
        });
      }
    }
    G.TESTS.forEach(t => t.en.forEach(x => chk(t.id, x)));
    return [...new Set(errs)].slice(0, 30);
  });
  expect(errs).toEqual([]);
});

test('EN: план 5 часов прокликан по дням цикла без кириллицы', async ({ page }) => {
  test.setTimeout(300000);
  const errors = await openApp(page, 'en');
  const CYR = /[Ѐ-ӿ]+/g;
  const scan = async where => {
    const found = await page.evaluate(() => {
      const parts = [document.body.innerText, document.title];
      document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el =>
        ['aria-label', 'title', 'placeholder'].forEach(a => el.getAttribute(a) && parts.push(el.getAttribute(a))));
      document.querySelectorAll('option').forEach(o => parts.push(o.textContent));
      return parts.join('\n');
    });
    (found.match(CYR) || []).forEach(w => { if (!bad.has(w)) bad.set(w, where); });
  };
  const bad = new Map(); // слово → где встретилось впервые
  await page.click('#timeChips button[data-t="300"]');
  // с вводной недели (−5) до первого дня 2-го цикла (29): все фокусы, все фазы, день тестов
  for (let day = -5; day <= 29; day++) {
    const items = page.locator('#planList li');
    const n = await items.count();
    for (let k = 0; k < n; k++) {
      await items.nth(k).click();
      await scan(`day ${day}, item ${k}`);
    }
    await page.click('#shareBtn');
    const share = await page.evaluate(() => { const t = document.getElementById('shareText'); return t ? t.value : ''; });
    (share.match(CYR) || []).forEach(w => { if (!bad.has(w)) bad.set(w, `day ${day}, share`); });
    await page.click('#nextDay');
  }
  expect([...bad].map(([w, where]) => `${where}: ${w}`)).toEqual([]);
  expect(errors).toEqual([]);
});

test('RU: страница грузится без ошибок JS', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.click('#timeChips button[data-t="300"]');
  const items = page.locator('#planList li');
  const n = await items.count();
  for (let k = 0; k < n; k++) await items.nth(k).click();
  expect(errors).toEqual([]);
});
