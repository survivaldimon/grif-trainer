const { test, expect } = require('@playwright/test');
const path = require('path');
const URL = require('url').pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;

for (const inst of ['guitar', 'bass']) {
  test(`${inst}: вариант дня = номер недели mod числа вариантов, все варианты попадают в план`, async ({ page }) => {
    await page.goto(URL + '#' + inst + '-ru');
    const res = await page.evaluate(() => {
      const G = window.__grif, errs = [], seen = {};
      for (let i = -14; i < 6 * 28; i++) {
        const d = G.dayInfo(i), w = Math.floor(i / 7);
        if (d.pool !== ((w % 6) + 6) % 6) errs.push(`day ${i}: pool ${d.pool}`);
        if (i >= 0 && Math.floor((i - 1) / 7) === w && i % 7 && G.dayInfo(i - 1).pool !== d.pool) errs.push(`day ${i}: вариант сменился внутри недели`);
        if (i < 0) continue;
        for (const T of G.TIMES) G.buildSession(i, T).segs.forEach(s => {
          if (!s.id || s.id === 'TESTS' || G.EX[s.id].gen || /^W/.test(s.id)) return;
          const v = ((s.variant != null ? s.variant : d.pool) % G.EX[s.id].v.length);
          (seen[s.id] = seen[s.id] || new Set()).add(v);
        });
      }
      const miss = Object.entries(seen).filter(([id, s]) => s.size < G.EX[id].v.length).map(([id, s]) => `${id}: ${[...s].sort().join(',')}`);
      return { errs: errs.slice(0, 20), miss };
    });
    expect(res.errs).toEqual([]);
    expect(res.miss, 'упражнения, у которых за 6 циклов выпали не все варианты').toEqual([]);
  });
}
