// Отчёт: плотность нот при 100 bpm (node tests/density-scan.mjs [--all]).
// nps = ударов (не пауз) в секунду при пульсе 100 bpm; доля = пульс метронома (в x/8 — восьмая).
// Медиана по упражнениям — ориентир; выбросы — уровни с nps вне [0.6; 1.6] × медианы инструмента.
import { chromium } from '@playwright/test';
import path from 'path';
const ALL = process.argv.includes('--all');
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.resolve('index.html'));
const rows = await p.evaluate(() => {
  const g = window.__grif, out = [];
  for (const inst of ['guitar', 'bass']) {
    g.setInst(inst); g.setStrings(inst === 'bass' ? 4 : 6); g.setLang('ru');
    for (const [id, ex] of Object.entries(g.EX)) {
      const nv = ex.gen ? 1 : (ex.v || []).length, nl = (ex.lvl || []).length || 1;
      for (let k = 0; k < nv; k++) for (let lv = 1; lv <= nl; lv++) {
        const r = g.resolveEx({ id, kind: 'focus', pick: ex.gen ? undefined : k }, g.dayInfo(0), lv);
        if (!r || !r.v || !Array.isArray(r.v.t)) continue;
        const sys = g.parseTab(r.v.t, r.sub, r.tu);
        let on = 0, len = 0;
        sys.forEach(s => { len += s.len; s.items.forEach(it => { if (!it.bar && !it.rest) on++; }); });
        out.push({ inst, id, name: g.X(id, 'name'), v: k, lv, sub: r.sub, meter: r.meter, nps: +(on / len * 100 / 60).toFixed(2) });
      }
    }
  }
  return out;
});
await b.close();
for (const inst of ['guitar', 'bass']) {
  const rs = rows.filter(r => r.inst === inst), s = rs.map(r => r.nps).sort((a, b) => a - b), med = s[s.length >> 1];
  console.log(`\n== ${inst}: медиана ${med} нот/с при 100 bpm (${rs.length} уровней)`);
  const by = {};
  rs.forEach(r => (by[r.id] ||= []).push(r));
  for (const [id, a] of Object.entries(by)) {
    const avg = a.reduce((x, r) => x + r.nps, 0) / a.length, mn = Math.min(...a.map(r => r.nps)), mx = Math.max(...a.map(r => r.nps));
    const out = a.filter(r => r.nps < med * 0.6 || r.nps > med * 1.6);
    if (ALL || out.length) console.log(`${id.padEnd(4)} ${a[0].name.slice(0, 28).padEnd(28)} ср ${avg.toFixed(2)} [${mn}–${mx}] ` + out.map(r => `v${r.v}L${r.lv}=${r.nps}`).join(' '));
  }
}
