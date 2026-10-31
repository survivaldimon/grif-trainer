// Разовый отчёт: как упражнения переносятся в drop (node tests/drop-scan.mjs).
// key — в тональности drop; shift — +2 лада на нижней струне; bad — shift, хотя в табе есть открытая нижняя струна (нужна ручная версия tD).
import { chromium } from '@playwright/test';
import path from 'path';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.resolve('index.html'));
const out = await p.evaluate(() => {
  const g = window.__grif, res = {}, d0 = g.dayInfo(0);
  for (const [inst, ns] of [['guitar', [6, 7]], ['bass', [4, 5]]]) {
    g.setInst(inst);
    for (const n of ns) {
      g.setStrings(n); g.setTuning(0, true);
      const low = g.TUN(g.TU()).low;
      for (const [id, ex] of Object.entries(g.EX)) {
        const nv = ex.gen ? 1 : (ex.v || []).length, nl = (ex.lvl || []).length || 1;
        for (let k = 0; k < nv; k++) for (let lv = 1; lv <= nl; lv++) for (let day = 0; day < (ex.gen ? 168 : 1); day += 28) {
          const r = g.resolveEx({ id, kind: 'focus', pick: ex.gen ? undefined : k }, g.dayInfo(day), lv);
          if (!r || !r.v || !r.v.t) continue;
          const key = `${inst}${n} ${id}`; const a = res[key] ||= { key: 0, shift: 0, bad: [] };
          if (r.tu.endsWith('k')) a.key++;
          else if (new RegExp(`(^|[\\s+])${low}0(?!\\d)`).test(r.v.t.join(' '))) a.bad.push(`v${k}L${lv}`);
          else a.shift++;
        }
      }
      g.setTuning(0, false);
    }
  }
  return res;
});
for (const [k, a] of Object.entries(out)) if (a.key || a.bad.length) console.log(k, 'key', a.key, 'shift', a.shift, 'bad', a.bad.length, [...new Set(a.bad)].join(' '));
await b.close();
