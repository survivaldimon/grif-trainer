// Инварианты «Грифа» (см. CLAUDE.md). Запуск: npm test
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const INDEX = path.join(__dirname, '..', 'index.html');
const URL_BASE = pathToFileURL(INDEX).href;
const LS_KEYS = ['time', 'lang', 'bpm', 'bpmEx', 'tests', 'lvl'];
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

test('ротация: упражнения групп R, A, L попадают в план примерно поровну', async ({ page }) => {
  await openApp(page, 'ru');
  const errs = await page.evaluate(() => {
    const G = window.__grif, errs = [];
    for (const T of G.TIMES) {
      const cnt = {};
      for (let i = 0; i < 6 * 28; i++) G.buildSession(i, T).segs.forEach(s => { if (s.id) cnt[s.id] = (cnt[s.id] || 0) + 1; });
      for (const g of ['R', 'A', 'L']) {
        const c = G.GROUPS[g].map(id => cnt[id] || 0);
        if (Math.min(...c) < 0.6 * Math.max(...c)) errs.push(`T=${T}, ${g}: ${c.join(' ')}`);
      }
    }
    return errs;
  });
  expect(errs).toEqual([]);
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
        // уровни: у варианта столько же уровней, сколько у упражнения, у каждого свой таб
        const nl = EX[id].lvl ? EX[id].lvl.length : 0;
        if (v.lv && v.lv.length !== nl) errs.push(`${id}.v${k}: уровней ${v.lv.length}, у упражнения ${nl}`);
        if (v.lv) v.lv.forEach((x, j) => { if (!x || !x.t || !x.t.length) errs.push(`${id}.v${k}.lv${j + 1}: нет таба`); });
      });
      const rl = EX[id].lvl || [], el = en.lvl || [];
      if (rl.length !== el.length) errs.push(`${id}: уровней RU ${rl.length}, EN ${el.length}`);
      if (rl.length && (rl.length < 3 || rl.length > 5)) errs.push(`${id}: уровней ${rl.length}, нужно 3–5`);
      rl.forEach((x, j) => { if (!x || !el[j]) errs.push(`${id}.lvl${j + 1}: пустая подпись`); });
    }
    return errs;
  });
  expect(errs).toEqual([]);
});

test('табы: стандартный строй, 6 струн, корректные токены и ритм', async ({ page }) => {
  await openApp(page, 'ru');
  const errs = await page.evaluate(() => {
    const G = window.__grif, errs = [];
    // формат токена — см. CLAUDE.md; дублируем регэкспы здесь, чтобы тест ловил и изменения парсера
    const TOK = /^(\.|[^:]+?)(m?)(?::([1-9]\d*))?$/;
    const PART = /^([eBGDAE])[hpt]?(\d{1,2})(?:b(\d{1,2})(?:r(\d{1,2}))?)?\*?~?$/;
    const whole = x => Math.abs(x - Math.round(x)) < 1e-6;
    const checkSystems = (where, systems, sub, meter) => {
      systems.forEach(sys => sys.trim().split(/\s+/).forEach(tok => {
        if (tok === '|' || /^\/[1-8]$/.test(tok)) return;
        const t = tok.match(TOK);
        if (!t || (t[1] === '.' && t[2])) { errs.push(`${where}: токен ${tok}`); return; }
        if (t[1] === '.') return;
        const strs = new Set();
        t[1].split('+').forEach(p => {
          const m = p.match(PART);
          if (!m) { errs.push(`${where}: токен ${tok}`); return; }
          if (strs.has(m[1])) errs.push(`${where}: струна дважды в ${tok}`);
          strs.add(m[1]);
          [m[2], m[3], m[4]].forEach(f => { if (f != null && +f > 24) errs.push(`${where}: лад ${f}`); });
          if (m[3] != null && !(+m[3] > +m[2])) errs.push(`${where}: бенд вниз в ${tok}`);
          if (m[4] != null && !(+m[4] < +m[3])) errs.push(`${where}: возврат вверх в ${tok}`);
        });
      }));
      // ритм: система — целое число долей; в нечётном размере каждый такт = числителю
      const pulses = +String(meter || '4/4').split('/')[0];
      G.parseTab(systems, sub).forEach((s, si) => {
        s.errs.forEach(e => errs.push(`${where} s${si}: ${e}`));
        if (!whole(s.len)) errs.push(`${where} s${si}: длина ${s.len.toFixed(3)} долей`);
        if (meter && meter !== '4/4') {
          let from = 0;
          s.items.filter(it => it.bar).map(it => it.pos).concat(s.len).forEach(pos => {
            if (Math.abs(pos - from - pulses) > 1e-6) errs.push(`${where} s${si}: такт ${(pos - from).toFixed(2)} в ${meter}`);
            from = pos;
          });
        }
      });
      const box = document.createElement('div');
      box.innerHTML = G.renderTab(systems, sub, meter);
      const svgs = box.querySelectorAll('svg');
      if (svgs.length !== systems.length) errs.push(`${where}: систем ${svgs.length}`);
      svgs.forEach(svg => {
        const rows = [...svg.querySelectorAll('text.sl')].map(x => x.textContent).join('');
        if (rows !== 'eBGDAE') errs.push(`${where}: строки ${rows}`);
        if (/NaN|undefined|Infinity/.test(svg.outerHTML)) errs.push(`${where}: NaN в SVG`);
      });
    };
    for (const [id, ex] of Object.entries(G.EX)) (ex.v || []).forEach((v, k) => {
      if (v.t) checkSystems(`${id}.v${k}`, v.t, v.sub || ex.sub, v.meter);
      (v.lv || []).forEach((x, j) => checkSystems(`${id}.v${k}.lv${j + 1}`, x.t, x.sub || v.sub || ex.sub, x.meter || v.meter));
    });
    G.TESTS.forEach(t => checkSystems(t.id, t.t, t.sub));
    // gen-упражнения зависят от дня и лада: проходим все 6 ладов и все перестановки
    for (let i = -7; i <= 168; i++) {
      const d = G.dayInfo(i);
      for (const id of ['B4', 'A21', 'L24', 'L28']) for (let lv = 1; lv <= G.EX[id].lvl.length; lv++) {
        const r = G.resolveEx({ id }, d, lv);
        if (!r || !r.v) { errs.push(`${id} day ${i} lv${lv}: нет варианта`); continue; }
        checkSystems(`${id} day ${i} lv${lv}`, r.v.t, r.sub, r.meter);
      }
    }
    return errs.slice(0, 30);
  });
  expect(errs).toEqual([]);
});

test('ритм: разбор длительностей и деления', async ({ page }) => {
  await openApp(page, 'ru');
  const res = await page.evaluate(() => {
    const P = (s, sub) => window.__grif.parseTab([s], sub)[0];
    const durs = s => s.items.filter(it => !it.bar).map(it => +it.dur.toFixed(4));
    return {
      plain: durs(P('E0 E0 . E0', 4)),
      galop: durs(P('E0:2 E0 E0', 4)),
      grid: P('/3 E0 E0 E0 | /5 E0 E0 E0 E0 E0', 1).len,
      pm: P('A2+E0m:2', 4).items[0],
      offGrid: P('/3 E0 /4 E0', 1).errs.length,
      badRest: P('.m', 4).errs.length
    };
  });
  expect(res.plain).toEqual([0.25, 0.25, 0.25, 0.25]);
  expect(res.galop).toEqual([0.5, 0.25, 0.25]);
  expect(res.grid).toBeCloseTo(2, 6);
  expect(res.pm.pm).toBe(true);
  expect(res.pm.notes.map(n => n.s + n.f)).toEqual(['A2', 'E0']);
  expect(res.offGrid).toBeGreaterThan(0);
  expect(res.badRest).toBeGreaterThan(0);
});

test('плеер: кнопка запускает и останавливает, подсветка идёт', async ({ page }) => {
  const errors = await openApp(page, 'ru');
  await page.click('#planList li:nth-child(2)');
  const btn = page.locator('#nowBody button[data-play]').first();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.waitForFunction(() => !!document.querySelector('#nowBody .tb .on'), null, { timeout: 5000 });
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
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
          (G.X(s.id, 'lvl') || []).forEach((x, j) => chk(`${s.id}.lvl${j + 1}`, x));
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
