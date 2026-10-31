// Разовый отчёт: какие упражнения в drop играют нижнюю струну открытой или с растяжкой.
// node tests/drop-scan.mjs
import { chromium } from '@playwright/test';
import path from 'path';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.resolve('index.html'));
const out = await p.evaluate(() => {
  const g = window.__grif, res = [];
  for (const inst of ['guitar', 'bass']) {
    g.setInst(inst);
    const tu = g.TU(), low = g.TUN(tu).low;
    for (const id of Object.keys(g.EX)) {
      const ex = g.EX[id]; if (!ex.v || ex.gen) continue;
      ex.v.forEach((v, vi) => (v.lv || [v]).forEach((e, li) => {
        const sys = g.parseTab(e.t, e.sub || v.sub || 1, tu);
        let open = 0, low_ = 0, span = 0;
        sys.forEach(s => s.items.forEach(it => {
          if (!it.notes) return;
          it.notes.forEach(n => { if (n.s === low && !n.x) { low_++; if (n.f === 0) open++; } });
          // конфликт аппликатуры: бывшая открытая нижняя (теперь 2-й лад) рядом с 1–2 ладом на других струнах
          if (it.notes.some(n => n.s === low && n.f === 0) && it.notes.some(n => n.s !== low && !n.x && n.f >= 1 && n.f <= 2)) span++;
          if (it.notes.some(n => n.s === low && n.f === 0)) { const nx = s.items[s.items.indexOf(it) + 1]; if (nx && nx.notes && nx.notes.some(n => n.s !== low && !n.x && n.f === 1)) span++; }
        }));
        if (open || span) res.push({ inst, id, v: vi, lv: li + 1, open, low: low_, span, l: v.l });
      }));
    }
  }
  return res;
});
const agg = {};
out.forEach(r => { const k = r.inst + ' ' + r.id; (agg[k] ||= { open: 0, span: 0, lv: new Set(), l: new Set() }); agg[k].open += r.open; agg[k].span += r.span; agg[k].lv.add('v' + r.v + 'L' + r.lv); agg[k].l.add(r.l); });
for (const [k, a] of Object.entries(agg)) console.log(k, 'open:', a.open, 'fingering:', a.span, [...a.lv].length + ' уровней', [...a.l].slice(0, 3).join(' | '));
await b.close();
