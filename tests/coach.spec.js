// Тренер: ведение по подходам внутри сегмента (см. раздел «тренер» в index.html). Запуск: npm test
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL_BASE = pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const FIXED_NOW = new Date('2026-10-28T12:00:00'); // dayIndex = −5

async function openApp(page, lang) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(URL_BASE + '#' + lang, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__grif);
  return errors;
}

test('тренер: подходы и отдых ровно укладываются в минуты сегмента', async ({ page }) => {
  test.setTimeout(120000);
  await openApp(page, 'ru');
  const res = await page.evaluate(() => {
    const G = window.__grif, errs = [], seen = new Set();
    const LED = ['base', 'focus', 'maint', 'combo', 'test'];
    const METERS = ['4/4', '3/4', '6/8', '5/8', '7/8', '9/8', '11/8', '13/16'];
    let plans = 0;
    for (let i = -7; i <= 168; i++) {
      for (const T of G.TIMES) {
        const { segs, d } = G.buildSession(i, T);
        segs.forEach(s => {
          // план тренера зависит только от этих полей: одинаковые сегменты проверяем один раз
          const key = [s.kind, s.id, s.variant, s.min, d.week, d.pool, d.i < 0].join('|');
          if (seen.has(key)) return;
          seen.add(key);
          const where = `day ${i}, T=${T}, ${s.kind} ${s.id || s.mid || ''} ${s.min}′`;
          const iv = G.coachPlan(s, d);
          const led = LED.includes(s.kind) || (s.kind === 'warm' && s.id !== 'W1');
          if (!led) { if (iv) errs.push(`${where}: ведение там, где его быть не должно`); return; }
          if (!iv || !iv.length) { errs.push(`${where}: нет ведения`); return; }
          plans++;
          const sum = iv.reduce((a, x) => a + x.sec, 0);
          if (sum !== s.min * 60) errs.push(`${where}: сумма ${sum} с вместо ${s.min * 60}`);
          if (!['prep', 'free'].includes(iv[0].type)) errs.push(`${where}: начинается с ${iv[0].type}`);
          if (!iv.some(x => x.type === 'set')) errs.push(`${where}: нет подходов`);
          iv.forEach((x, k) => {
            if (!(x.sec > 0) || x.sec % 5) errs.push(`${where}: интервал ${k} = ${x.sec} с`);
            if (!['prep', 'free', 'set', 'rest'].includes(x.type)) errs.push(`${where}: тип ${x.type}`);
            if (x.type === 'rest' && iv[k + 1] && iv[k + 1].type === 'rest') errs.push(`${where}: отдых подряд`);
            if (x.type === 'set') {
              if (iv[k + 1] && iv[k + 1].type === 'set') errs.push(`${where}: подходы без отдыха`);
              if (x.sec < 10) errs.push(`${where}: подход ${x.sec} с`);
              if (![1, 2, 3, 4, 6].includes(x.sub)) errs.push(`${where}: деление ${x.sub}`);
              if (![0, 1, 2, 4].includes(x.burst)) errs.push(`${where}: рывки ${x.burst}`);
              if (!METERS.includes(x.meter)) errs.push(`${where}: размер ${x.meter}`);
              if (!x.tempo || !x.tempo.length) errs.push(`${where}: нет подсказки темпа`);
              if (x.burst && !(d.week === 2 && ['base', 'focus', 'combo'].includes(s.kind))) errs.push(`${where}: рывки вне недели скорости`);
            }
          });
          // протокол: подходы не уходят далеко от диапазона фазы
          if (s.kind !== 'test' && s.kind !== 'warm') {
            const co = s.kind === 'maint' ? { set: [50, 75] } : [{ set: [60, 90] }, { set: [40, 60] }, { set: [30, 70] }, { set: [30, 45] }][d.week];
            iv.filter(x => x.type === 'set').forEach(x => {
              if (x.sec < co.set[0] - 15 || x.sec > co.set[1] + 15) errs.push(`${where}: подход ${x.sec} с вне ${co.set}`);
            });
          }
          if (s.kind === 'test' && new Set(iv.filter(x => x.test).map(x => x.test)).size !== 5) errs.push(`${where}: не все 5 тестов`);
        });
      }
    }
    return { errs: errs.slice(0, 30), plans };
  });
  expect(res.errs).toEqual([]);
  expect(res.plans).toBeGreaterThan(100);
});

test('тренер: указания упражнений и неделя скорости', async ({ page }) => {
  await openApp(page, 'ru');
  const r = await page.evaluate(() => {
    const G = window.__grif;
    const sets = (i, s) => G.coachPlan(s, G.dayInfo(i)).filter(x => x.type === 'set');
    return {
      b1: sets(0, { kind: 'base', id: 'B1', min: 8 }).map(x => x.sub + (x.tempo.includes('half') ? 'h' : '')),
      speed: sets(14, { kind: 'focus', id: 'R8', min: 8 }).map(x => x.burst),
      maint: sets(14, { kind: 'maint', id: 'R8', min: 4 }).map(x => x.burst),
      l31: sets(1, { kind: 'focus', id: 'L31', variant: 1, min: 6 }).map(x => x.sub)
    };
  });
  expect(r.b1.slice(0, 4)).toEqual(['4', '4', '6', '4h']);
  expect(r.speed.slice(0, 5)).toEqual([1, 2, 4, 0, 1]);
  expect(r.maint.every(b => b === 0)).toBe(true);
  expect(r.l31.slice(0, 3)).toEqual([2, 3, 4]);
});

test('тренер: метроном включается на подходе и выключается на отдыхе, bpm не меняется', async ({ page }) => {
  const errors = await openApp(page, 'en');
  await page.click('#nextDay'); await page.click('#nextDay'); await page.click('#nextDay'); await page.click('#nextDay'); await page.click('#nextDay'); // день 0
  await page.click('#timeChips button[data-t="60"]');
  await page.locator('#planList li').nth(1).click(); // база B1
  const bpm = await page.inputValue('#bpm');
  await page.click('#playBtn');
  await page.click('#coSkip'); // подготовка → подход 1
  await expect(page.locator('#mToggle')).toHaveText('Stop');
  await expect(page.locator('.cost')).toHaveClass(/t-set/);
  await page.click('#coSkip'); // подход → отдых
  await expect(page.locator('#mToggle')).toHaveText('Start');
  await expect(page.locator('.cost')).toHaveClass(/t-rest/);
  await page.click('#coSkip'); // отдых → подход 2
  await expect(page.locator('#mToggle')).toHaveText('Stop');
  await page.click('#playBtn'); // пауза останавливает метроном
  await expect(page.locator('#mToggle')).toHaveText('Start');
  await page.click('#playBtn');
  await expect(page.locator('#mToggle')).toHaveText('Stop');
  await page.click('#coToggle'); // ведение выкл: блок сворачивается, метроном не трогаем
  await expect(page.locator('#coSkip')).toHaveCount(0);
  await expect(page.locator('#coToggle')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.inputValue('#bpm')).toBe(bpm);
  expect(errors).toEqual([]);
});

test('EN: ведение прокликано по всем интервалам без кириллицы', async ({ page }) => {
  test.setTimeout(300000);
  const errors = await openApp(page, 'en');
  const CYR = /[Ѐ-ӿ]+/g;
  const bad = new Map();
  const scan = async where => {
    const text = await page.evaluate(() => document.getElementById('now').innerText);
    (text.match(CYR) || []).forEach(w => { if (!bad.has(w)) bad.set(w, where); });
  };
  // −5 разгрузка (вводная), 0 объём, 8 наращивание, 16 скорость, 27 разгрузка с тестами; W0 — на 15 минутах
  const days = [[-5, 15], [0, 60], [8, 60], [16, 120], [27, 60]];
  let cur = -5;
  for (const [day, T] of days) {
    while (cur < day) { await page.click('#nextDay'); cur++; }
    await page.click(`#timeChips button[data-t="${T}"]`);
    await page.click('#playBtn');
    const n = await page.locator('#planList li').count();
    for (let guard = 0; guard < 2000; guard++) {
      const k = await page.evaluate(() => [...document.querySelectorAll('#planList li')].findIndex(li => li.classList.contains('cur')));
      await scan(`day ${day}, T=${T}, item ${k}`);
      const done = await page.evaluate(() => document.querySelectorAll('#planList li.done').length);
      if (done >= n) break;
      if (await page.locator('#coSkipBlk').count() && guard % 2) await page.click('#coSkipBlk');
      else if (await page.locator('#coSkip').count()) await page.click('#coSkip');
      else await page.click('#nextSeg');
    }
    expect(await page.locator('#planList li.done').count(), `day ${day}: дошли до конца`).toBe(n);
    if (await page.locator('#playBtn').textContent() === 'Pause') await page.click('#playBtn');
  }
  await page.locator('#planList li').nth(1).click(); // сегмент с ведением
  await page.click('#coToggle');
  await scan('coaching off');
  expect([...bad].map(([w, where]) => `${where}: ${w}`)).toEqual([]);
  expect(errors).toEqual([]);
});
