// RiffGym — джаз, фанк, фингерстайл: библиотеки. Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= джаз, фанк, фингерстайл ================= */
// Части библиотек по схеме блюза: часть 1 — W, B, R, тесты цикла и RIFF; часть 2 — A, L, C. Пока часть пуста, id берётся из базы.
/*@NEW_GENRES_PARTS@*/
// ----- JZG1: джаз, гитара, часть 1 -----
const JZG1=(function(){
// Джаз, электрогитара, часть 1. Аккорды задаются символами ('Dm7', '{Bb}7' — без скобок), голосовки строятся помощниками:
// shell — «шелл» 1-7-3 (тоника на 6-й или 5-й струне), sh137 — 1-3-7, d2 — drop-2 на четырёх струнах (подбор по высоте).
// Сетка свинга — триоли (sub 3): «долгая-короткая» = 2+1 шага. Варианты меняют материал: прогрессию, голосовку, ритмическую ячейку, гамму.
const J=(...a)=>a.filter(x=>x!=null&&x!=='').join(' ');
const sh=(s,d)=>d?s.replace(/([A-Za-z])([hpt]?)(\d+)/g,(m,a,te,f)=>a+te+(+f+d)):s;
const lvs=a=>a.map(x=>Array.isArray(x)?{t:x}:x);
// события [токен, шагов] → системы с тактами по spb шагов, по bps тактов в системе; хвост добивается паузой
const lay=(ev,spb,bps)=>{bps=bps||2;const bars=[];let cur=[],acc=0;
  const push=(t,n)=>{cur.push(n>1?t+':'+n:t);acc+=n;if(acc===spb){bars.push(cur.join(' '));cur=[];acc=0;}};
  ev.forEach(([t,n])=>{if(acc+n>spb){if(t!=='.')throw new Error('JZG1: нота через такт '+t);while(n>0){const k=Math.min(n,spb-acc);push('.',k);n-=k;}return;}push(t,n);});
  if(acc)push('.',spb-acc);
  const sys=[];for(let i=0;i<bars.length;i+=bps)sys.push(bars.slice(i,i+bps).join(' | '));return sys;};
const swing=notes=>notes.map((t,i)=>[t,i%2?1:2]);           // свинговые восьмые
const pad8=a=>{a=a.slice();while(a.length%8)a.push('.');return a;};
// ---- аккорды ----
const RT={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const ROOT={F:['E',1],'F#':['E',2],Gb:['E',2],G:['E',3],Ab:['E',4],'G#':['E',4],A:['E',5],Bb:['E',6],'A#':['E',6],
  B:['A',2],C:['A',3],'C#':['A',4],Db:['A',4],D:['A',5],Eb:['A',6],'D#':['A',6],E:['A',7]};
const cp=s=>{const m=s.match(/^([A-G][b#]?)(.*)$/);return {r:m[1],q:m[2]};};
const isMin=q=>/^m(?!aj)/.test(q)||q==='dim7';
const shell=sym=>{const {r,q}=cp(sym),[s,f]=ROOT[r],mn=isMin(q),sev=q==='maj7'?f+1:/6/.test(q)?f-1:f;
  if(s==='E'){if(q==='m7b5')return 'E'+f+'+D'+f+'+G'+f+'+B'+(f-1);if(q==='dim7')return 'E'+f+'+D'+(f-1)+'+G'+f+'+B'+(f-1);
    return 'E'+f+'+D'+sev+'+G'+(mn?f:f+1);}
  if(q==='m7b5')return 'A'+f+'+D'+(f+1)+'+G'+f+'+B'+(f+1);if(q==='dim7')return 'A'+f+'+D'+(f+1)+'+G'+(f-1)+'+B'+(f+1);
  return 'A'+f+'+G'+sev+'+B'+(mn?f+1:f+2);};
const sh137=sym=>{const {r,q}=cp(sym),[s,f]=ROOT[r],mn=isMin(q),sev=q==='maj7'?f+1:f;
  return s==='E'?'E'+f+'+A'+(mn?f-2:f-1)+'+D'+sev:'A'+f+'+D'+(mn?f-2:f-1)+'+G'+sev;};
const guide=sym=>shell(sym).split('+').slice(1).join('+');   // без тоники: терция и септима
const root=sym=>{const [s,f]=ROOT[cp(sym).r];return s+f;};
const fifth=sym=>{const [s,f]=ROOT[cp(sym).r],b5=/b5|dim/.test(cp(sym).q)?-1:0;return s==='E'?'A'+(f+2+b5):'E'+(f+b5);};
const third=sym=>{const [s,f]=ROOT[cp(sym).r],mn=isMin(cp(sym).q);const t=s==='E'?['A',mn?f-2:f-1]:['D',mn?f-2:f-1];return t[1]>=0?t[0]+t[1]:s+(f+(mn?3:4));};
// ведущий тон к следующей тонике: полутоном снизу (или сверху у открытой струны)
const appr=sym=>{const [s,f]=ROOT[cp(sym).r];return s+(f>=1?f-1:f+1);};
// прогрессия: такты через |, в такте 1–2 аккорда; → [[символ, долей], …] по тактам
const prog=(p,bpb)=>p.split('|').map(b=>{const c=b.trim().split(/\s+/);return c.map(x=>[x,bpb/c.length]);});
const cn=s=>{const {r,q}=cp(s);return '{'+r+'}'+q;};
// ---- drop-2 ----
const OPEN={E:40,A:45,D:50,G:55,B:59,e:64};
const IVL={maj7:[0,4,7,11],'7':[0,4,7,10],m7:[0,3,7,10],m7b5:[0,3,6,10],dim7:[0,3,6,9],'6':[0,4,7,9],m6:[0,3,7,9]};
const d2c={};
const d2cands=(sym,set)=>{const key=sym+set;if(d2c[key])return d2c[key];
  const {r,q}=cp(sym),P=IVL[q].map(i=>(RT[r]+i)%12),S=set.split(''),out=[];
  for(let inv=0;inv<4;inv++){const t=[0,1,2,3].map(k=>P[(inv+k)%4]),ord=[t[2],t[0],t[1],t[3]];
    for(let f0=1;f0<=13;f0++){if((OPEN[S[0]]+f0)%12!==ord[0])continue;
      let prev=OPEN[S[0]]+f0,fr=[f0],ok=true;
      for(let k=1;k<4&&ok;k++){let f=-1;for(let g=Math.max(1,f0-4);g<=f0+5;g++){const p=OPEN[S[k]]+g;if(p%12===ord[k]&&p>prev){f=g;break;}}
        if(f<0)ok=false;else{fr.push(f);prev=OPEN[S[k]]+f;}}
      if(!ok||Math.max(...fr)-Math.min(...fr)>(set==='DGBe'?3:4)||Math.max(...fr)>15)continue;
      out.push({tok:S.map((s,k)=>s+fr[k]).join('+'),p:S.map((s,k)=>OPEN[s]+fr[k]),lo:Math.min(...fr)});}}
  return d2c[key]=out.sort((a,b)=>a.p[3]-b.p[3]);};
// по возрастанию: n голосовок, аккорды по кругу
const d2up=(chs,set,n)=>{const o=[];let top=-1;for(let i=0;i<n;i++){const C=d2cands(chs[i%chs.length],set),c=C.find(x=>x.p[3]>top&&x.lo>=2)||C.find(x=>x.p[3]>top)||C[0];o.push(c.tok);top=c.p[3];}return o;};
// ведение голосов: ближайшая голосовка к предыдущей; start — 'lo' или 'hi'
const d2lead=(syms,set,start)=>{let prev=null;return syms.map(s=>{const C=d2cands(s,set).filter(x=>Math.max(...x.p)<=OPEN[set.slice(-1)]+12);
  const c=prev?C.reduce((a,b)=>(dist(b,prev)<dist(a,prev)?b:a)):(start==='hi'?C[C.length-1]:C[0]);prev=c;return c.tok;});};
const dist=(a,b)=>a.p.reduce((s,x,k)=>s+Math.abs(x-b.p[k]),0);

// ---- гаммы (по 16 нот, от нижней струны) ----
const SC=[
  'E8 E10 A7 A8 A10 A11 D7 D9 D10 D12 G9 G10 G12 G13 B10 B12',   // {C} мажорная бибоп-гамма
  'E3 E5 A2 A3 A5 D2 D3 D4 D5 G2 G4 G5 G7 B5 B6 B7',             // {G} доминантовая бибоп-гамма
  'A5 A7 A8 D5 D7 D9 D10 G7 G9 G10 B8 B10 B12 e8 e10 e12',        // {D} дорийский
  'E5 E7 E8 A5 A7 A9 D6 D7 D9 D10 G7 G9 G11 B9 B10 B12',          // {A} мелодический минор
  'E3 E4 E6 A2 A4 A5 A7 A8 D5 D6 D8 G4 G6 G7 B5 B6',              // {G} полутон-тон
  'E1 E3 A0 A1 A3 D0 D2 D3 G0 G2 G3 B1 B3 e0 e1 e3'               // {F} мажор, 1-я позиция
].map(s=>s.split(' '));
const SC_RU=['{C}: мажорная бибоп-гамма','{G}: доминантовая бибоп-гамма','{D} дорийский','{A} мелодический минор','{G}: уменьшённая гамма полутон-тон','{F} мажор в первой позиции'];
const SC_EN=['{C} major bebop scale','{G} dominant bebop scale','{D} Dorian','{A} melodic minor','{G} half-whole diminished','{F} major in first position'];
const SW=n=>lay(swing(pad8(n)),12);
const rg=(a,b)=>{const o=[];if(a<=b)for(let i=a;i<=b;i++)o.push(i);else for(let i=a;i>=b;i--)o.push(i);return o;};
// ---- B1: бибоп-линии свинговыми восьмыми ----
const b1=n=>[
  SW([0,1,2,3,4,3,2,1].map(i=>n[i])),
  SW([...rg(0,7),...rg(8,1)].map(i=>n[i])),
  SW([...rg(0,15),...rg(14,0),0].map(i=>n[i])),
  SW([...rg(0,13).flatMap(i=>[n[i],n[i+2]]),n[15],n[14],n[13],n[12]]),
  SW([...rg(0,12).flatMap(i=>[n[i],n[i+1],n[i+2],n[i+3]]),...rg(15,3).filter((x,k)=>k%3===0).flatMap(i=>[n[i],n[i-1],n[i-2]])])
];
// ---- B2: шеллы ii–V–I ----
const B2P=[['Dm7','G7','Cmaj7',shell],['Gm7','C7','Fmaj7',shell],['Cm7','F7','Bbmaj7',shell],['Dm7b5','G7','Cm7',shell],['Am7','D7','Gmaj7',sh137],['Dm7','Db7','Cmaj7',shell]];
const b2=([a,b,c,V])=>{const x=[V(a),V(b),V(c)],up=k=>sh(x[(k+1)%3],1);
  return [
    {t:[J(x[0]+':4','|',x[1]+':4','|',x[2]+':4','|',x[2]+':4')],sub:1},
    {t:[J(x[0]+':2',x[0]+':2','|',x[1]+':2',x[1]+':2','|',x[2]+':2',x[2]+':2','|',x[2]+':4')],sub:1},
    {t:[[0,1,2,2].map(k=>J(x[k],x[k],x[k],x[k])).join(' | ')],sub:1},
    {t:[J(x[0],x[0],x[0],up(0),'|',x[1],x[1],x[1],up(1),'|',x[2],x[2],x[2],x[2],'|',x[2],x[2],x[2],sh(x[0],1))],sub:1},
    {t:lay([0,1,2,2].flatMap(k=>[[x[k],5],[x[k],1],['.',6]]),12,4),sub:3}
  ];};
// ---- B3: арпеджио септаккордов ----
const B3A=['E8 A7 A10 D9 D10 G9 G12 B12','A5 A8 D7 D10 G7 G10 B10 e8','E3 A2 A5 D3 D5 G4 G7 B6','A2 A5 D3 D7 G4 G7 B6 e5','E5 E8 A7 D6 D7 G5 G9 B9','A2 A5 D3 D6 G4 G7 B6 B9'].map(s=>s.split(' '));
const below=t=>{const m=t.match(/^([A-Za-z])(\d+)$/);return m[1]+(+m[2]-1);};
const b3=n=>[
  SW([0,1,2,3,2,1,0,'.'].map(i=>i==='.'?'.':n[i])),
  SW([...rg(0,7),...rg(6,1)].map(i=>n[i])),
  SW([...rg(1,7),...rg(6,0),...rg(2,7),...rg(6,1)].map(i=>n[i])),
  SW([...rg(0,4).flatMap(i=>[n[i],n[i+2],n[i+1],n[i+3]]),n[7],n[5],n[6],n[4]]),
  SW([...rg(0,7).flatMap(i=>[below(n[i]),n[i]]),...rg(6,0).map(i=>n[i]),'.'])
];
// ---- B4: энклоужеры ----
const fr=t=>{const m=t.match(/^([A-Za-z])(\d+)$/);return [m[1],+m[2]];};
const B4D=[
  {t:'E8 A7 A10 D9',e:[1,-1]},{t:'A5 A8 D7 D10',e:[2,-1]},{t:'E3 A2 A5 D3',e:[-1,1]},
  {t:'E5 A3 A7 D5',e:[-2,-1]},{t:'E6 A5 A8 D6',e:[2,1,-1]},{t:'A6 D5 D8 G7',e:[1,-1,-2]}
];
const b4=x=>{const T=x.t.split(' '),E=x.e;
  const enc=t=>{const [s,f]=fr(t);return E.map(d=>s+(f+d));};
  const unit=(t,beats)=>{const a=enc(t),n=beats*3-a.length;return [...a.map(z=>[z,1]),[t,n]];};
  const chain=(ts,b)=>ts.flatMap(t=>unit(t,b));
  const up2=T.map(t=>{const [s,f]=fr(t);return s+(f+2);});
  const L=(ts,b)=>lay(chain(ts,b),12);
  const fast=E.length===2?1:2;
  return [
    lay([...unit(T[0],2),['.',6],...unit(T[1],2),['.',6]],12),
    L(T,2),
    L([...T,...T.slice().reverse()],2),
    L([...T,...T.slice().reverse()],fast),
    L([...T,...up2,...up2.slice().reverse(),...T.slice().reverse()],fast)
  ];};
// ---- B5: ритмические ячейки фраз ----
const B5C=[[-2,1,-2,1,-2,1,-2,1],[2,2,2,2,2,2],[5,1,-6],[3,-2,1,3,-2,1],[5,4,3],[2,1,2,1,2,1,2,1,-12]];
const cell=(c,notes,bars)=>{const ev=[];let k=0;const len=c.reduce((a,b)=>a+Math.abs(b),0);
  for(let i=0;i<bars*12/len;i++)c.forEach(d=>{if(d<0)ev.push(['.',-d]);else ev.push([notes[k++%notes.length],d]);});return ev;};
const b5=(c,n)=>[
  lay(cell(c,[n[0]],2),12),
  lay(cell(c,[n[0],n[2],n[4],n[2]],2),12),
  lay(cell(c,rg(0,15).map(i=>n[i]),4),12),
  lay(cell(c,[...rg(0,13).flatMap(i=>[n[i],n[i+2]])],4),12),
  lay(cell(c,[...rg(0,15),...rg(14,1)].map(i=>n[i]),8),12)
];

// ---- прогрессии ----
const PR={
  iiVI:'Dm7 | G7 | Cmaj7 | Cmaj7',
  bluesF:'F7 | Bb7 | F7 | Cm7 F7 | Bb7 | Bdim7 | F7 | Am7 D7 | Gm7 | C7 | F7 D7 | Gm7 C7',
  rhythm:'Bbmaj7 G7 | Cm7 F7 | Dm7 G7 | Cm7 F7 | Fm7 Bb7 | Ebmaj7 Ab7 | Dm7 G7 | Cm7 F7',
  minor:'Dm7b5 | G7 | Cm7 | Cm7',
  cycle:'Em7 | A7 | Dm7 | G7 | Cmaj7 | Fmaj7 | Bm7b5 | E7',
  chrom:'Em7 A7 | Ebm7 Ab7 | Dm7 G7 | Cmaj7',
  bluesBb:'Bb7 | Eb7 | Bb7 | Fm7 Bb7 | Eb7 | Edim7 | Bb7 | Dm7 G7 | Cm7 | F7 | Bb7 G7 | Cm7 F7',
  mblues:'Cm7 | Fm7 | Cm7 | Cm7 | Fm7 | Fm7 | Cm7 | Cm7 | Ab7 | G7 | Cm7 | G7',
  bird:'Fmaj7 | Em7b5 A7 | Dm7 G7 | Cm7 F7 | Bb7 | Bbm7 Eb7 | Am7 D7 | Abm7 Db7 | Gm7 | C7 | F7 D7 | Gm7 C7',
  bluesG:'G7 | C7 | G7 | Dm7 G7 | C7 | C#dim7 | G7 | Bm7b5 E7 | Am7 | D7 | G7 E7 | Am7 D7',
  tritF:'F7 | Bb7 | F7 | Cm7 B7 | Bb7 | Bdim7 | F7 | Ab7 | Gm7 | Gb7 | F7 Ab7 | Gm7 Gb7'
};
const PRU={iiVI:'ii–V–I в {C}',bluesF:'джазовый блюз в {F}',rhythm:'«ритм-чейнджес» в {Bb}, часть A',minor:'минорная ii–V–i в {C}',cycle:'круг кварт в {C}',chrom:'хроматические ii–V в {C}',
  bluesBb:'джазовый блюз в {Bb}',mblues:'минорный блюз в {C}',bird:'«бёрд-блюз» в {F}',bluesG:'блюз в {G} с ii–V',tritF:'блюз в {F} с тритоновыми заменами'};
const PEN={iiVI:'ii–V–I in {C}',bluesF:'jazz blues in {F}',rhythm:'rhythm changes in {Bb}, A section',minor:'minor ii–V–i in {C}',cycle:'cycle of fourths in {C}',chrom:'chromatic ii–Vs in {C}',
  bluesBb:'jazz blues in {Bb}',mblues:'minor blues in {C}',bird:'"Bird blues" in {F}',bluesG:'blues in {G} with ii–Vs',tritF:'blues in {F} with tritone subs'};
// аккорд, звучащий на шаге pos такта (такт делится поровну между аккордами)
const at=(bar,pos,spb)=>bar[Math.min(bar.length-1,Math.floor(pos*bar.length/spb))][0];
// комп ячейкой: c — [[символ-роль, шагов]], роли: C — аккорд, N — следующий аккорд, A — подход полутоном сверху к следующему, G — без тоники, R — тоника, . — пауза
const comp=(bars,c,spb,V,loop)=>{V=V||shell;const ev=[];bars.forEach((bar,i)=>{const nb=bars[i+1]||(loop?bars[0]:bar);let pos=0;
  c.forEach(([r,n])=>{const s=at(bar,pos,spb),nx=r==='N'||r==='A'?(Math.floor((pos)*bar.length/spb)+1<bar.length?at(bar,pos+spb/bar.length,spb):nb[0][0]):null;
    ev.push([r==='.'?'.':r==='C'?V(s):r==='G'?guide(s):r==='R'?root(s):r==='N'?V(nx):sh(V(nx),1),n]);pos+=n;});});return ev;};
const loopTo=(bars,n)=>{const o=[];while(o.length<n)o.push(...bars);return o.slice(0,Math.max(n,bars.length));};
const full=b=>b.length>=8?b:loopTo(b,8);
// ---- R6: Фредди Грин ----
const R6P=['iiVI','bluesF','rhythm','minor','cycle','chrom'];
const r6=p=>{const B=prog(PR[p],4),Q=[['C',1],['C',1],['C',1],['C',1]],QA=[['C',1],['C',1],['C',1],['A',1]];
  const half=[['C',2],['C',2]];
  return [
    {t:lay(comp(B.slice(0,2),half,4),4),sub:1},
    {t:lay(comp(B.slice(0,4),Q,4),4,4),sub:1},
    {t:lay(comp(loopTo(B,8),Q,4),4,4),sub:1},
    {t:lay(comp(full(B),QA,4,shell,true),4,4),sub:1},
    {t:lay(full(B).flatMap((bar,i)=>{const s=k=>at(bar,k,4);return [[root(s(0)),1],[guide(s(1)),1],[fifth(s(2)),1],[guide(s(3)),1]];}),4,4),sub:1}
  ];};
// ---- R7: ячейки компа ----
const R7C=[
  [['C',5],['C',1],['.',6]],
  [['.',2],['C',4],['C',3],['.',3]],
  [['C',3],['.',8],['N',1]],
  [['.',3],['C',2],['.',4],['C',2],['.',1]],
  [['.',5],['C',1],['.',5],['C',1]],
  [['C',2],['C',1],['.',3],['C',2],['C',1],['.',3]]
];
const R7P=['iiVI','bluesF','rhythm','minor','cycle','chrom'];
const r7=k=>{const B=prog(PR[R7P[k]],4),c=R7C[k],alt=k?R7C[0]:R7C[1];
  const mixN=bars=>{const ev=[];bars.forEach((b,i)=>{const nb=bars[i+1]||bars[0];ev.push(...comp([b,nb],i%2?alt:c,12,shell).slice(0,(i%2?alt:c).length));});return ev;};
  return [
    lay(comp([B[0],B[0]],c,12),12),
    lay(comp(B.slice(0,4),c,12,shell,true),12,4),
    lay(comp(loopTo(B,8),c,12,shell,true),12,4),
    lay(comp(full(B),c,12,shell,true),12,4),
    lay(mixN(full(B)),12,4)
  ];};
// ---- R8: джаз-вальс 3/4 ----
const WZ=[
  {p:'Dm7 | Dm7 | G7 | G7 | Cmaj7 | Cmaj7 | Cmaj7 | Cmaj7',c:[['C',3],['.',6]]},
  {p:'Em7 | A7 | Dm7 | G7 | Cmaj7 | Fmaj7 | Bm7b5 | E7',c:[['R',3],['G',3],['G',3]]},
  {p:'Cm7 | Cm7 | Fm7 | Fm7 | Dm7b5 | G7 | Cm7 | G7',c:[['C',3],['.',2],['C',1],['.',3]]},
  {p:'F7 | Bb7 | F7 | F7 | Bb7 | Bb7 | F7 | D7 | Gm7 | C7 | F7 | C7',c:[['.',3],['C',3],['C',3]]},
  {p:'Em7 | A7 | Ebm7 | Ab7 | Dm7 | G7 | Cmaj7 | Cmaj7',c:[['C',2],['C',1],['C',2],['C',1],['.',3]]},
  {p:'Bbmaj7 | G7 | Cm7 | F7 | Dm7 | G7 | Cm7 | F7',c:[['C',5],['C',1],['C',3]]}
];
const r8=k=>{const x=WZ[k],B=prog(x.p,3),c=x.c,alt=k===1?WZ[0].c:WZ[1].c;
  const mix=bars=>bars.flatMap((b,i)=>comp([b],i%2?alt:c,9));
  return [
    lay(comp([B[0],B[0]],c,9),9),
    lay(comp(B.slice(0,4),c,9),9,4),
    lay(comp(B.slice(0,8),c,9),9,4),
    lay(comp(loopTo(B,16).slice(0,Math.max(12,B.length)),c,9),9,4),
    lay(mix(loopTo(B,16).slice(0,Math.max(12,B.length))),9,4)
  ].map(t=>({t,meter:'3/4'}));};
// ---- R9: босса-нова ----
const BOS=[
  {p:'Cmaj7 | Cmaj7 | Dm7 | G7',h:[0,3,6,10,13]},
  {p:'Gm7 | C7 | Fmaj7 | Fmaj7',h:[2,5,8,11,13]},
  {p:'Am7 | Am7 | Dm7 | E7',h:[1,3,6,9,11,14]},
  {p:'Dm7 | Db7 | Cmaj7 | Cmaj7',h:[0,3,6,8,11,14]},
  {p:'Fmaj7 | Gm7 C7 | Am7 | D7',h:[0,2,3,5,6,8,10,11,13,14]},
  {p:'Ebmaj7 | Cm7 | Fm7 | Bb7',h:[3,6,11,14]}
];
// два такта: бас на 1 и 3 (тоника, квинта), аккорд (без тоники) — на шагах h из 16
const bossa=(bars,h,bass,chord)=>{const ev=[];for(let i=0;i<bars.length;i+=2){const two=[bars[i],bars[i+1]||bars[i]];
  const on=[];for(let s=0;s<16;s++){const bar=two[s>>3],sym=at(bar,s%8,8),b=bass&&s%4===0?(s%8?fifth(sym):root(sym)):null,c=chord&&h.includes(s)?guide(sym):null;
    if(b||c)on.push([s,[b,c].filter(Boolean).join('+')]);}
  on.forEach(([s,t],j)=>{const end=j+1<on.length?on[j+1][0]:16;const cut=(s<8&&end>8)?8:end;ev.push([t,cut-s]);if(cut<end)ev.push(['.',end-cut]);});
  if(on[0][0]>0)ev.splice(ev.length-on.length,0,['.',on[0][0]]);}
  return ev;};
const r9=k=>{const x=BOS[k],B=prog(x.p,4),h2=x.h.map(s=>(s+8)%16).sort((a,b)=>a-b);
  return [
    lay(bossa(B.slice(0,2),x.h,true,false),8),
    lay(bossa([B[0],B[0]],x.h,true,true),8),
    lay(bossa(B,x.h,true,true),8,4),
    lay(bossa(B.concat(B),x.h,true,true),8,4),
    lay(bossa(B,x.h,true,true).concat(bossa(B,h2,true,true)),8,4)
  ];};
// ---- R10: уокинг-бас с аккордами ----
const walk=(bars,stab,loop)=>{const ev=[];const flat=[];bars.forEach(b=>b.forEach(([s,n])=>flat.push([s,n])));
  flat.forEach(([s,n],i)=>{const nx=(flat[i+1]||(loop?flat[0]:flat[i]))[0];
    const line=n>=4?[root(s),third(s),fifth(s),nx===s?third(s):appr(nx)]:[root(s),nx===s?fifth(s):appr(nx)];
    line.forEach((t,j)=>ev.push([stab&&j%2===1?mrg(t,guide(s)):t,1]));});
  return ev;};
const mrg=(a,b)=>{const u=a.split('+').map(x=>x[0]);return [a,...b.split('+').filter(x=>!u.includes(x[0]))].join('+');};
const twoFeel=bars=>bars.flatMap(b=>b.flatMap(([s,n])=>n>=4?[[root(s),2],[fifth(s),2]]:[[root(s),2]]));
const R10P=['iiVI','bluesF','rhythm','minor','cycle','chrom'];
const r10=p=>{const B=prog(PR[p],4);
  return [
    lay(twoFeel([B[0],B[0]]),4),
    lay(twoFeel(B.slice(0,4)),4,4),
    lay(walk(B.slice(0,4),false,true),4,4),
    lay(walk(B.slice(0,4),true,true),4,4),
    lay(walk(full(B),true,true),4,4)
  ].map(t=>({t,sub:1}));};
// ---- R11: октавы ----
const OCT={E:['D',2],A:['G',2],D:['B',3],G:['e',3]};
const oc=t=>{const [s,f]=fr(t),[u,d]=OCT[s];return s+f+'+'+u+(f+d);};
const R11N=['E8 E10 A7 A8 A10 D7 D9 D10','E3 A2 A5 D3 D5 G4 G7 G10','A5 A7 A8 D5 D7 D9 D10 G7','E1 E4 A1 A2 A3 A6 D3 D6','E6 E8 A5 A6 A8 D5 D7 D8','E5 E7 E8 A5 A7 A9 D6 D7'].map(s=>s.split(' ').map(oc));
const r11=n=>[
  lay([0,1,2,3,2,1,0,'.'].map(i=>[i==='.'?'.':n[i],3]),12),
  lay([...rg(0,7),...rg(6,0),'.'].map(i=>[i==='.'?'.':n[i],3]),12,4),
  lay(swing(pad8([...rg(0,7),...rg(6,1)].map(i=>n[i]))),12),
  lay(swing(pad8([...rg(0,5).flatMap(i=>[n[i],n[i+2]]),n[7],n[6],...rg(5,0).flatMap(i=>[n[i+2],n[i]])])),12),
  lay(swing(pad8([...rg(0,4).flatMap(i=>[n[i],n[i+1],n[i+2],n[i+3]]),...rg(7,3).flatMap(i=>[n[i],n[i-1],n[i-2],n[i-3]])])),12)
];
// ---- R12: кварты ----
const QV=[
  f=>'E'+f+'+A'+f+'+D'+f, f=>'A'+f+'+D'+f+'+G'+f, f=>'D'+f+'+G'+f+'+B'+(f+1),
  f=>'E'+f+'+A'+f+'+D'+f+'+G'+f+'+B'+f, f=>'G'+f+'+B'+(f+1)+'+e'+(f+1), f=>'D'+f+'+G'+f+'+B'+(f+1)+'+e'+(f+1)
];
const QF=[[5,7,8,10],[5,7,8,10],[7,9,10,12],[10,8,10,11],[7,9,10,12],[7,8,9,10]];
const r12=k=>{const V=QV[k],F=QF[k],ch=F.map(V),ud=[...ch,...ch.slice(0,3).reverse()];
  return [
    lay(ch.map(c=>[c,6]),12),
    lay([...ud,ch[0]].map(c=>[c,3]),12),
    lay(ch.flatMap(c=>[[c,5],[c,1],['.',6]]),12,4),
    lay(ud.concat([ch[0]]).flatMap(c=>[[c,2],[c,1],['.',3]]),12,4),
    lay([...ud,ch[0]].flatMap((c,i,a)=>[[c,5],[a[(i+1)%a.length],1],['.',6]]),12,4)
  ];};
// ---- R13: drop-2 ----
const D2=[
  {set:'DGBe',ch:['Cmaj7'],p:['Dm7','G7','Cmaj7','Cmaj7']},
  {set:'DGBe',ch:['Dm7','G7'],p:['Dm7','G7','Cmaj7','Am7']},
  {set:'ADGB',ch:['Cmaj7'],p:['Dm7','G7','Cmaj7','Cmaj7']},
  {set:'DGBe',ch:['C6','Bdim7'],p:['C6','Bdim7','Dm7','G7']},
  {set:'ADGB',ch:['Fmaj7'],p:['Gm7','C7','Fmaj7','D7']},
  {set:'DGBe',ch:['Cm6'],p:['Dm7b5','G7','Cm6','Cm6']}
];
const r13=x=>{x.ch.forEach(c=>{if(!d2cands(c,x.set).length)throw new Error('no d2 '+c+x.set);});const u5=d2up(x.ch,x.set,5),lo=d2lead(x.p,x.set,'lo'),hi=d2lead(x.p,x.set,'hi');
  return [
    lay(u5.slice(0,2).map(c=>[c,4]),4),
    lay(u5.slice(0,4).map(c=>[c,2]),4),
    lay([...u5,...u5.slice(1,4).reverse()].map(c=>[c,1]),4),
    lay(lo.map(c=>[c,4]),4,4),
    lay(hi.flatMap((c,i)=>[[c,2],[c,1],[sh(hi[(i+1)%4],1),1]]),4,4)
  ].map(t=>({t,sub:1}));};
// ---- R14: джазовые блюзы ----
const R14P=['bluesF','bluesBb','mblues','bird','bluesG','tritF'];
const r14=p=>{const B=prog(PR[p],4),H=[['C',6],['C',6]],Q=[['C',3],['C',3],['C',3],['C',3]],CH=[['C',5],['C',1],['.',6]],CA=[['C',5],['C',1],['.',3],['A',3]];
  return [
    lay(comp(B.slice(0,4),H,12),12,4),
    lay(comp(B,H,12),12,4),
    lay(comp(B,Q,12),12,4),
    lay(comp(B,CH,12),12,4),
    lay(comp(B,CA,12,shell,true),12,4)
  ];};
// ---- R15: тёрнэраунды ----
const TA=['Cmaj7 Am7 | Dm7 G7','Em7 A7 | Dm7 G7','Cmaj7 Eb7 | Ab7 Db7','Cmaj7 C#dim7 | Dm7 G7','Cmaj7 A7 | Dm7 Db7','Cm7 Ab7 | Dm7b5 G7'];
const r15=k=>{const B=prog(TA[k],4),B2=B.concat(B),I=B[0][0][0];
  const H=[['C',6],['C',6]],Q=[['C',3],['C',3],['C',3],['C',3]],C3=[['C',3],['.',2],['C',1],['C',3],['.',2],['C',1]],CA=[['C',3],['A',3],['C',3],['A',3]];
  return [
    lay(comp(B,H,12),12),
    lay(comp(B2,Q,12),12,4),
    lay(comp(B2,C3,12),12,4),
    lay(comp(B2,CA,12,shell,true),12,4),
    lay(comp(B2,C3,12).concat(comp(B,CA,12,shell,true),[[shell(I),3],['.',9]]),12,4)
  ];};
// ---- R37: линии направляющих тонов ----
const R37P=['cycle','bluesF','rhythm','minor','chrom','bird'];
const r37=p=>{const B=prog(PR[p],4),H=[['G',2],['G',2]];
  return [
    {t:lay(comp(B.slice(0,2),H,4),4),sub:1},
    {t:lay(comp(B.slice(0,4),H,4),4,4),sub:1},
    {t:lay(full(B).flatMap(bar=>{const s=k=>at(bar,k,4);return [[mrg(root(s(0)),guide(s(0))),1],[guide(s(1)),1],[guide(s(2)),1],[guide(s(3)),1]];}),4,4),sub:1},
    {t:lay(full(B).flatMap(bar=>{const s=k=>at(bar,k,12);return [[root(s(0)),3],['.',2],[guide(s(5)),1],['.',6]];}),12,4),sub:3},
    {t:lay(full(B).flatMap((bar,i,a)=>{const s=k=>at(bar,k,12),nx=(a[i+1]||a[0])[0][0];return [[root(s(0)),3],['.',2],[guide(s(5)),1],['.',3],[sh(guide(nx),1),3]];}),12,4),sub:3}
  ];};

const BV=(l,lv)=>({l,lv:lvs(lv)});
const W0T=['A3','A5','D2','D3','D5','G2','G4','G5'];
const EX={
W0:{name:'Разминка',goal:'Разогреть руки и включить слух.',how:'Без гитары минуту: потри ладони до тепла, медленные круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем на чистом звуке медленно мажорная гамма {C} от пятой струны вверх и вниз.',tip:'Мягкое касание, звук без перегруза. Пальцы стоят у ладовых пластин.',sub:2,v:[{l:'Гамма {C} мажор',t:[J(...W0T,...W0T.slice().reverse())]}]},
W1:{name:'Мобилизация без гитары',goal:'Разогнать кровь в кистях и предплечьях.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Потряси расслабленными кистями.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
W2:{name:'Шеллы четвертями',goal:'Разогреть левую руку на аккордах и вспомнить ii–V–I.',how:'Чистый звук, четверти, темп заведомо низкий. Шеллы ii–V–I в {C}: тоника, септима и терция, ровно по четыре удара на аккорд.',tip:'Аккорд короткий: после удара левая рука чуть отпускает струны.',sub:1,v:[{l:'ii–V–I в {C}',t:[[0,1,2,2].map(k=>R(shell(['Dm7','G7','Cmaj7'][Math.min(k,2)]),4)).join(' | ')]}]},
W3:{name:'Мягкое легато',goal:'Разогреть пальцы левой руки перед линиями.',how:'Чистый звук, восьмые, половина рабочего темпа. Хаммер и пулл в пределах тона по всем струнам: пальцы 1–2, потом 2–4.',tip:'Хаммер звучит так же громко, как удар медиатором. Не дави сильнее, чем нужно.',sub:2,v:[{l:'Хаммеры и пуллы',t:['A5 Ah7 D5 Dh7 G5 Gh7 B5 Bh7 | B7 Bp5 G7 Gp5 D7 Dp5 A7 Ap5','A6 Ah8 D6 Dh8 G6 Gh8 B6 Bh8 | B8 Bp6 G8 Gp6 D8 Dp6 A8 Ap6']}]},

B1:{n:1,name:'Бибоп-линии',goal:'Ровный альтернейт свинговыми восьмыми по джазовым гаммам.',how:'Свинговые восьмые: долгая и короткая. Медиатор строго вниз-вверх, гамма своя у каждой недели. Сильные доли попадают на тоны аккорда — для этого в бибоп-гамме восемь нот.',tip:'Короткую восьмую не глотай, но играй чуть тише: акцент — на слабой доле, как у духовых.',sub:3,lvl:['Пять нот вверх и вниз','Октава вверх и вниз','Две октавы','Терциями','Четвёрками вверх, тройками вниз'],v:SC.map((n,k)=>BV(SC_RU[k],b1(n)))},
B2:{n:2,name:'Шеллы ii–V–I',goal:'Аккорды из трёх нот и ведение голосов в ii–V–I.',how:'Тоника на басовой струне, сверху септима и терция. При смене аккорда верхние голоса сдвигаются на лад или стоят. На четвёртом уровне на четвёртую долю — подход аккордом на полтона выше следующего, на пятом — ритм «чарльстон».',tip:'Свободные пальцы глушат лишние струны: звучат ровно три ноты.',sub:1,lvl:['По такту на аккорд','Половинными','Четвертями','С подходом на полтона','Чарльстон'],v:[
  BV('ii–V–I в {C}',b2(B2P[0])),BV('ii–V–I в {F}',b2(B2P[1])),BV('ii–V–I в {Bb}, выше по грифу',b2(B2P[2])),
  BV('Минорная ii–V–i в {C}',b2(B2P[3])),BV('Шеллы 1-3-7: ii–V–I в {G}',b2(B2P[4])),BV('Тритоновая замена: {D}m7–{Db}7–{C}maj7',b2(B2P[5]))]},
B3:{n:3,name:'Арпеджио септаккордов',goal:'Тоны аккорда на грифе без пауз и поиска.',how:'Свинговые восьмые, две октавы четырёх тонов. Каждую неделю — другой аккорд и позиция. На пятом уровне к каждому тону — подход снизу на полтона.',tip:'Одна нота на струне подряд — перекатом пальца, а не отрыванием.',sub:3,lvl:['Одна октава','Две октавы','От терции','Ломаное арпеджио','С хроматическим подходом'],v:[
  BV('{C}maj7',b3(B3A[0])),BV('{D}m7',b3(B3A[1])),BV('{G}7',b3(B3A[2])),BV('{B}m7b5',b3(B3A[3])),BV('{A}m(maj7): мелодический минор',b3(B3A[4])),BV('{B}dim7',b3(B3A[5]))]},
B4:{n:4,name:'Энклоужеры',goal:'Попадать в тон аккорда через окружение сверху и снизу.',how:'Триоли. Перед целевой нотой — одна-две ноты сверху и снизу от неё, цель приходится на долю. Вид окружения меняется каждую неделю.',tip:'Цель — главная нота: она длиннее и громче окружения.',sub:3,lvl:['Две цели с паузами','Четыре цели','Вверх и вниз','На каждую долю','Две гармонии'],v:[
  BV('{C}maj7: полутон сверху, полутон снизу',b4(B4D[0])),BV('{D}m7: тон сверху, полутон снизу',b4(B4D[1])),BV('{G}7: полутон снизу, потом сверху',b4(B4D[2])),
  BV('{A}m7: два хроматических шага снизу',b4(B4D[3])),BV('{Bb}7: три ноты — тон и полутон сверху, полутон снизу',b4(B4D[4])),BV('{Eb}maj7: полутон сверху, два снизу',b4(B4D[5]))]},
B5:{n:5,name:'Свинг и паузы',goal:'Фраза держит свинговый ритм, паузы — часть фразы.',how:'Одна ритмическая ячейка на всю неделю, ноты идут по гамме. Точка в табе — пауза: обе руки глушат струны.',tip:'Считай вслух «раз-и-два-и» с упором на «и». Пауза звучит так же точно, как нота.',sub:3,lvl:['Одна нота','Четыре ноты','Гамма, четыре такта','Терциями','Восемь тактов'],v:[
  BV('Восьмые на «и»: {C} бибоп',b5(B5C[0],SC[0])),BV('Четвертные триоли: {G} бибоп',b5(B5C[1],SC[1])),BV('Чарльстон: {D} дорийский',b5(B5C[2],SC[2])),
  BV('Раз и «и» второй доли: {A} мелодический минор',b5(B5C[3],SC[3])),BV('Группы по три восьмые: {G} уменьшённая',b5(B5C[4],SC[4])),BV('Такт игры, такт паузы: {F} мажор',b5(B5C[5],SC[5]))]},

R6:{name:'Фредди Грин',goal:'Ровный комп четвертями в стиле биг-бэнда.',how:'Шеллы из трёх нот, удар на каждую долю, короткий и одинаковый. На четвёртом уровне последняя доля перед сменой — аккорд на полтона выше нового. На пятом — бас на 1 и 3, терция и септима на 2 и 4.',tip:'Звук короткий и сухой, громкость ровная. Слушай, как четверти складываются в шаг.',sub:1,lvl:['Половинными','Четыре такта','Восемь тактов','Вся форма с подходами','Бас и аккорд'],v:R6P.map(p=>BV(PRU[p][0].toUpperCase()+PRU[p].slice(1),r6(p)))},
R7:{name:'Ритмические ячейки компа',goal:'Комп свинговыми ячейками, а не на каждую долю.',how:'Шеллы, свинг. Ячейка своя у каждой недели, на пятом уровне она чередуется с «чарльстоном» через такт.',tip:'Ячейка должна качать: короткий аккорд на «и» — самый важный.',sub:3,lvl:['Один аккорд','Четыре такта','Восемь тактов','Вся форма','Чередование с чарльстоном'],v:[
  BV('Чарльстон: ii–V–I в {C}',r7(0)),BV('Обратный чарльстон: блюз в {F}',r7(1)),BV('Предъём на «и» четвёртой доли: ритм-чейнджес',r7(2)),
  BV('Удары на 2 и 4: минорная ii–V–i',r7(3)),BV('Только «и» второй и четвёртой: круг кварт',r7(4)),BV('Долгая-короткая на 1 и 3: хроматические ii–V',r7(5))]},
R8:{name:'Джаз-вальс',goal:'Свинг в размере 3/4.',how:'Размер 3/4, щелчок — четверть, восьмые свингуют. Ячейка своя у каждой недели, на пятом уровне чередуется с другой ячейкой через такт.',tip:'Сильная доля — только первая. Не превращай вальс в марш: удары на 2 и 3 легче.',sub:3,meter:'3/4',lvl:['Один аккорд','Четыре такта','Восемь тактов','Вся форма','Две ячейки'],v:[
  BV('Аккорд на раз: ii–V–I в {C}',r8(0)),BV('Бас на раз, аккорд на 2 и 3: круг кварт',r8(1)),BV('Раз и «и» второй: минор {C}',r8(2)),
  BV('Аккорды на 2 и 3: блюз в {F}',r8(3)),BV('Свинговые восьмые на раз и два: хроматические ii–V',r8(4)),BV('Раз, «и» второй и третья доля: ритм-чейнджес',r8(5))]},
R9:{name:'Босса-нова',goal:'Независимость баса и аккорда в босса-нове.',how:'Прямые восьмые, без свинга. Бас большим пальцем или медиатором на 1 и 3: тоника и квинта. Аккорд без тоники — пальцами на сетке из двух тактов, рисунок свой у каждой недели.',tip:'Бас ровный, как метроном, аккорд лёгкий и короткий. Сначала бас, потом добавляй аккорд.',sub:2,lvl:['Только бас','Бас и аккорд на одной гармонии','Четыре такта','Восемь тактов','Рисунок со сдвигом на такт'],v:[
  BV('Классический рисунок: {C}maj7–{D}m7–{G}7',r9(0)),BV('Рисунок со второй восьмой: ii–V–I в {F}',r9(1)),BV('Плотный рисунок: минор {A}',r9(2)),
  BV('Тритоновая замена: {D}m7–{Db}7–{C}maj7',r9(3)),BV('Рисунок самбы: {F}maj7, ii–V, {A}m7, {D}7',r9(4)),BV('Редкий рисунок: {Eb}maj7–{C}m7–{F}m7–{Bb}7',r9(5))]},
R10:{name:'Уокинг-бас с аккордами',goal:'Вести бас четвертями и вставлять аккорды.',how:'Бас на нижних струнах: тоника, терция, квинта и подход полутоном к следующей тонике. На четвёртом и пятом уровнях на 2 и 4 к басу добавляются терция и септима.',tip:'Подход на четвёртой доле тянет к новой тонике: не обрывай его.',sub:1,lvl:['Две доли, два такта','Две доли, четыре такта','Уокинг','Уокинг с аккордами','Вся форма'],v:R10P.map(p=>BV(PRU[p][0].toUpperCase()+PRU[p].slice(1),r10(p)))},
R11:{name:'Октавы',goal:'Мелодия октавами через струну.',how:'Нижняя нота и октава через струну; струна между ними заглушена пальцем, который держит нижнюю ноту. Бей вниз большим пальцем или медиатором. Материал свой у каждой недели.',tip:'Удар по всем трём струнам: средняя глухая, поэтому звучат только две.',sub:3,lvl:['Четыре ноты четвертями','Восемь нот четвертями','Свинговыми восьмыми','Терциями','Четвёрками'],v:[
  BV('Гамма {C} мажор',r11(R11N[0])),BV('Арпеджио {G}7',r11(R11N[1])),BV('{D} дорийский',r11(R11N[2])),BV('Блюзовая гамма {F}',r11(R11N[3])),BV('{Bb} мажор',r11(R11N[4])),BV('{A} мелодический минор',r11(R11N[5]))]},
R12:{name:'Кварты',goal:'Квартовые аккорды и параллельное движение.',how:'Аккорд из кварт держит одна форма, её сдвигают по ладам гаммы. Свинг. На пятом уровне на «и» второй доли — предъём следующего аккорда.',tip:'Форма не разваливается при сдвиге: пальцы двигаются вместе.',sub:3,lvl:['Половинными','Вверх и вниз четвертями','Чарльстон','Долгая-короткая','С предъёмом'],v:[
  BV('Три кварты на нижних струнах',r12(0)),BV('Три кварты на средних струнах',r12(1)),BV('Кварты с большой терцией сверху',r12(2)),
  BV('Аккорд «соу вот» (So What)',r12(3)),BV('Кварты на верхних струнах',r12(4)),BV('Четыре ноты, хроматический сдвиг',r12(5))]},
R13:{name:'Drop-2 аккорды',goal:'Четырёхзвучные аккорды во всех обращениях.',how:'Аккорд drop-2: второй сверху голос тесного расположения опущен на октаву. Обращения идут вверх по грифу, на четвёртом и пятом уровнях — последовательность с ближайшим ведением голосов.',tip:'Пальцы переставляются вместе, без глухого промежутка между аккордами.',sub:1,lvl:['Два обращения','Четыре обращения','Вверх и вниз','Последовательность','Сверху, с подходами'],v:[
  BV('{C}maj7, четыре верхние струны',r13(D2[0])),BV('{D}m7 и {G}7 по очереди',r13(D2[1])),BV('{C}maj7 на средних струнах',r13(D2[2])),
  BV('{C}6 и {B}dim7: шестая уменьшённая гамма',r13(D2[3])),BV('{F}maj7 на средних струнах',r13(D2[4])),BV('{C}m6 и минорная ii–V–i',r13(D2[5]))]},
R14:{name:'Джазовый блюз',goal:'Комп разных форм джазового блюза.',how:'Шеллы, свинг. Форма своя у каждой недели: от простого блюза до тритоновых замен. На пятом уровне на четвёртую долю — подход на полтона к следующему аккорду.',tip:'Знай, где ты в форме: считай такты по четыре.',sub:3,lvl:['Первые четыре такта','Половинными','Четвертями','Чарльстон','Чарльстон с подходом'],v:R14P.map(p=>BV(PRU[p][0].toUpperCase()+PRU[p].slice(1),r14(p)))},
R15:{name:'Тёрнэраунды',goal:'Двухтактные обороты к тонике.',how:'Два аккорда в такте. Оборот свой у каждой недели. На пятом уровне в конце — разрешение в тонику.',tip:'Слушай, как верхний голос ведёт оборот к тонике.',sub:3,lvl:['Половинными','Четвертями','Удар и «и»','С подходами','С разрешением'],v:[
  BV('I–vi–ii–V в {C}',r15(0)),BV('iii–VI–ii–V в {C}',r15(1)),BV('{C}maj7–{Eb}7–{Ab}7–{Db}7',r15(2)),
  BV('Проходящий уменьшённый: {C}maj7–{C#}dim7–{D}m7–{G}7',r15(3)),BV('Тритоновая замена: {C}maj7–{A}7–{D}m7–{Db}7',r15(4)),BV('Минорный: {C}m7–{Ab}7–{D}m7b5–{G}7',r15(5))]},
R37:{name:'Направляющие тоны',goal:'Терция и септима ведут гармонию.',how:'Две ноты — терция и септима — без тоники. При смене аккорда одна нота стоит, другая сдвигается на полтона или тон. На третьем уровне тоника звучит на первой доле.',tip:'Голоса двигаются на минимальное расстояние: если рука прыгает, проверь аккорд.',lvl:['Два такта','Четыре такта','С тоникой','Чарльстон с басом','С подходом'],v:R37P.map(p=>BV(PRU[p][0].toUpperCase()+PRU[p].slice(1),r37(p)))}
};
const up1=s=>s[0].toUpperCase()+s.slice(1);
const EXEN={
W0:{name:'Warm-up',goal:'Warm up the hands and wake up the ears.',how:'One minute without the guitar: rub your palms until warm, slow wrist and shoulder circles, open and close your fists 20 times. Then the {C} major scale from the fifth string up and down, slowly, on a clean tone.',tip:'Light touch, no gain. Fingers sit close to the frets.',v:['{C} major scale']},
W1:{name:'Mobility without the guitar',goal:'Get blood flowing in the hands and forearms.',how:'Rub your palms until warm. Wrist circles both ways, 10 each. Shoulders up, back, down. Open and close your fists 20 times. Shake out relaxed hands.',tip:'No stretching into pain: only warmth and mobility.'},
W2:{name:'Shells in quarters',goal:'Warm up the fretting hand on chords and recall the ii–V–I.',how:'Clean tone, quarter notes, deliberately slow. ii–V–I shells in {C}: root, seventh and third, four even strums per chord.',tip:'Keep each chord short: the fretting hand eases off right after the strum.',v:['ii–V–I in {C}']},
W3:{name:'Gentle legato',goal:'Warm up the fretting fingers before lines.',how:'Clean tone, eighths, half your working tempo. Hammer-on and pull-off within a whole step across all strings: fingers 1–2, then 2–4.',tip:'The hammer-on is as loud as a picked note. Do not press harder than needed.',v:['Hammer-ons and pull-offs']},
B1:{name:'Bebop lines',goal:'Even alternate picking in swing eighths through jazz scales.',how:'Swing eighths: long and short. Strict down-up picking, a new scale each week. The strong beats land on chord tones: that is why the bebop scale has eight notes.',tip:'Do not swallow the short eighth, just play it a bit softer: the accent sits on the off-beat, like a horn player.',lvl:['Five notes up and down','One octave up and down','Two octaves','In thirds','Fours up, threes down'],v:SC_EN},
B2:{name:'ii–V–I shells',goal:'Three-note chords and voice leading in the ii–V–I.',how:'Root on a bass string, the seventh and third on top. On each change the upper voices move by a fret or stay. Level 4 puts a chord a half step above the next one on beat four; level 5 uses the Charleston rhythm.',tip:'Spare fingers mute the other strings: exactly three notes ring.',lvl:['A bar per chord','Half notes','Quarter notes','With a half-step approach','Charleston'],v:['ii–V–I in {C}','ii–V–I in {F}','ii–V–I in {Bb}, higher up the neck','Minor ii–V–i in {C}','1-3-7 shells: ii–V–I in {G}','Tritone sub: {D}m7–{Db}7–{C}maj7']},
B3:{name:'Seventh-chord arpeggios',goal:'Chord tones on the neck without pauses or searching.',how:'Swing eighths, two octaves of the four chord tones. A new chord and position each week. On level 5 every tone gets a half-step approach from below.',tip:'Two notes in a row on the same fret: roll the finger instead of lifting it.',lvl:['One octave','Two octaves','From the third','Broken arpeggio','With chromatic approaches'],v:['{C}maj7','{D}m7','{G}7','{B}m7b5','{A}m(maj7): melodic minor','{B}dim7']},
B4:{name:'Enclosures',goal:'Land on a chord tone by surrounding it from above and below.',how:'Triplets. Before the target, one or two notes above and below it; the target falls on the beat. The type of enclosure changes each week.',tip:'The target is the main note: longer and louder than the enclosure.',lvl:['Two targets with rests','Four targets','Up and down','One per beat','Two harmonies'],v:['{C}maj7: half step above, half step below','{D}m7: whole step above, half step below','{G}7: half step below, then above','{A}m7: two chromatic steps from below','{Bb}7: three notes, whole and half step above, half step below','{Eb}maj7: half step above, two below']},
B5:{name:'Swing and rests',goal:'The phrase keeps the swing; rests are part of the phrase.',how:'One rhythmic cell for the whole week, the notes walk through a scale. A dot in the tab is a rest: both hands mute the strings.',tip:'Count "one-and-two-and" aloud, leaning on the "and". A rest is as precise as a note.',lvl:['One note','Four notes','Scale, four bars','In thirds','Eight bars'],v:['Off-beat eighths: {C} bebop','Quarter-note triplets: {G} bebop','Charleston: {D} Dorian','One and the "and" of two: {A} melodic minor','Groups of three eighths: {G} diminished','A bar on, a bar off: {F} major']},
R6:{name:'Freddie Green',goal:'Even big-band comping in quarter notes.',how:'Three-note shells, a strum on every beat, short and even. On level 4 the last beat before a change is a chord a half step above the new one. On level 5: bass on 1 and 3, third and seventh on 2 and 4.',tip:'Short, dry sound at an even volume. Listen to the quarters lock into a walk.',lvl:['Half notes','Four bars','Eight bars','Whole form with approaches','Bass and chord'],v:R6P.map(p=>up1(PEN[p]))},
R7:{name:'Comping cells',goal:'Comping in swing cells rather than on every beat.',how:'Shells, swing. Each week has its own cell; on level 5 it alternates bar by bar with the Charleston.',tip:'The cell has to bounce: the short chord on the "and" matters most.',lvl:['One chord','Four bars','Eight bars','Whole form','Alternating with the Charleston'],v:['Charleston: ii–V–I in {C}','Reverse Charleston: blues in {F}','Anticipation on the "and" of four: rhythm changes','Hits on 2 and 4: minor ii–V–i','Only the "and" of two and four: cycle of fourths','Long-short on 1 and 3: chromatic ii–Vs']},
R8:{name:'Jazz waltz',goal:'Swing in 3/4.',how:'3/4 time, the click is a quarter, the eighths swing. Each week has its own cell; on level 5 it alternates bar by bar with another cell.',tip:'Only beat one is strong. Do not turn the waltz into a march: beats 2 and 3 are lighter.',lvl:['One chord','Four bars','Eight bars','Whole form','Two cells'],v:['Chord on one: ii–V–I in {C}','Bass on one, chord on 2 and 3: cycle of fourths','One and the "and" of two: {C} minor','Chords on 2 and 3: blues in {F}','Swing eighths on one and two: chromatic ii–Vs','One, the "and" of two, and three: rhythm changes']},
R9:{name:'Bossa nova',goal:'Independent bass and chord in bossa nova.',how:'Straight eighths, no swing. Bass with the thumb or pick on 1 and 3: root and fifth. The rootless chord, plucked with the fingers, follows a two-bar grid with its own pattern each week.',tip:'The bass is steady as a metronome, the chord light and short. Get the bass going first, then add the chord.',lvl:['Bass only','Bass and chord on one harmony','Four bars','Eight bars','Pattern shifted by a bar'],v:['Classic pattern: {C}maj7–{D}m7–{G}7','Pattern from the second eighth: ii–V–I in {F}','Busy pattern: {A} minor','Tritone sub: {D}m7–{Db}7–{C}maj7','Samba pattern: {F}maj7, ii–V, {A}m7, {D}7','Sparse pattern: {Eb}maj7–{C}m7–{F}m7–{Bb}7']},
R10:{name:'Walking bass with chords',goal:'Walk a bass line in quarters and slot chords in.',how:'Bass on the low strings: root, third, fifth and a half-step approach to the next root. On levels 4 and 5 the third and seventh join the bass on 2 and 4.',tip:'The approach on beat four pulls to the new root: do not cut it short.',lvl:['Two-feel, two bars','Two-feel, four bars','Walking','Walking with chords','Whole form'],v:R10P.map(p=>up1(PEN[p]))},
R11:{name:'Octaves',goal:'A melody in octaves with a string skipped.',how:'The low note and its octave two strings up; the string between is muted by the finger holding the low note. Strike down with the thumb or pick. New material each week.',tip:'Strike all three strings: the middle one is dead, so only two ring.',lvl:['Four notes in quarters','Eight notes in quarters','Swing eighths','In thirds','In fours'],v:['{C} major scale','{G}7 arpeggio','{D} Dorian','{F} blues scale','{Bb} major','{A} melodic minor']},
R12:{name:'Fourths',goal:'Quartal chords and parallel motion.',how:'One shape built in fourths, moved along the frets of a scale. Swing. On level 5 the next chord is anticipated on the "and" of two.',tip:'The shape stays intact as it moves: the fingers travel together.',lvl:['Half notes','Up and down in quarters','Charleston','Long-short','With anticipation'],v:['Three fourths on the low strings','Three fourths on the middle strings','Fourths with a major third on top','The So What chord','Fourths on the top strings','Four notes, chromatic shift']},
R13:{name:'Drop-2 chords',goal:'Four-note chords in every inversion.',how:'A drop-2 chord: the second voice from the top of a close voicing is dropped an octave. The inversions climb the neck; on levels 4 and 5, a progression with the closest voice leading.',tip:'The fingers move together, with no dead gap between chords.',lvl:['Two inversions','Four inversions','Up and down','Progression','From the top, with approaches'],v:['{C}maj7, top four strings','{D}m7 and {G}7 in turn','{C}maj7 on the middle strings','{C}6 and {B}dim7: the sixth-diminished scale','{F}maj7 on the middle strings','{C}m6 and the minor ii–V–i']},
R14:{name:'Jazz blues',goal:'Comping through different jazz-blues forms.',how:'Shells, swing. A different form each week, from a plain blues to tritone subs. On level 5 beat four is a half-step approach to the next chord.',tip:'Know where you are in the form: count bars in fours.',lvl:['First four bars','Half notes','Quarter notes','Charleston','Charleston with approach'],v:R14P.map(p=>up1(PEN[p]))},
R15:{name:'Turnarounds',goal:'Two-bar progressions back to the tonic.',how:'Two chords per bar. A different turnaround each week. On level 5 it resolves to the tonic at the end.',tip:'Listen to the top voice leading the turnaround home.',lvl:['Half notes','Quarter notes','Hit and "and"','With approaches','With resolution'],v:['I–vi–ii–V in {C}','iii–VI–ii–V in {C}','{C}maj7–{Eb}7–{Ab}7–{Db}7','Passing diminished: {C}maj7–{C#}dim7–{D}m7–{G}7','Tritone sub: {C}maj7–{A}7–{D}m7–{Db}7','Minor: {C}m7–{Ab}7–{D}m7b5–{G}7']},
R37:{name:'Guide tones',goal:'The third and seventh carry the harmony.',how:'Two notes, the third and the seventh, without the root. On each change one note holds and the other moves by a half or whole step. On level 3 the root sounds on beat one.',tip:'The voices move the shortest distance: if your hand jumps, check the chord.',lvl:['Two bars','Four bars','With the root','Charleston with bass','With approach'],v:R37P.map(p=>up1(PEN[p]))}
};
const TESTS=[
  {id:'JGT1',ru:['Фредди Грин','ii–V–I в {C} шеллами, четверти, держать 30 секунд ровно.'],en:['Freddie Green','ii–V–I in {C} with shells, quarter notes, hold 30 seconds evenly.'],sub:1,t:r6('iiVI')[1].t},
  {id:'JGT2',ru:['Бибоп-гамма','{C} мажорная бибоп-гамма, две октавы вверх и вниз свинговыми восьмыми.'],en:['Bebop scale','{C} major bebop scale, two octaves up and down in swing eighths.'],sub:3,t:b1(SC[0])[2]},
  {id:'JGT3',ru:['Уокинг-бас','ii–V–I в {C}, бас четвертями, держать 60 секунд без сбоя.'],en:['Walking bass','ii–V–I in {C}, bass in quarters, hold 60 seconds without a slip.'],sub:1,t:r10('iiVI')[2].t},
  {id:'JGT4',ru:['Арпеджио','{C}maj7, две октавы вверх и вниз свинговыми восьмыми.'],en:['Arpeggio','{C}maj7, two octaves up and down in swing eighths.'],sub:3,t:b3(B3A[0])[1]},
  {id:'JGT5',ru:['Энклоужеры','{C}maj7, четыре цели вверх и вниз, триоли.'],en:['Enclosures','{C}maj7, four targets up and down, triplets.'],sub:3,t:b4(B4D[0])[2]}
];
const RIFF={
  ru:['рифф стоит на ii–V–I','хотя бы одна хроматическая проходящая нота','закончить на терции или септиме аккорда','хотя бы один энклоужер вокруг тона аккорда','фраза начинается с «и» доли','в риффе есть аккорд-шелл из трёх нот','на сильных долях — только тоны аккорда','хотя бы одна нота из мелодического минора','первый такт — вопрос, второй — ответ','хотя бы одна пауза длиной в целую долю','мелодия сыграна октавами','темп на 20% ниже рабочего, но с полным свингом'],
  en:['the riff sits on a ii–V–I','at least one chromatic passing note','end on the third or seventh of the chord','at least one enclosure around a chord tone','the phrase starts on an "and"','includes a three-note shell chord','only chord tones on the strong beats','at least one note from melodic minor','the first bar asks, the second answers','at least one rest a full beat long','the melody is played in octaves','tempo 20% below your working tempo, but fully swung']
};
const COACH={
  W0:{free:60},
  B1:{cyc:[{},{tag:['Акцент на короткую восьмую','Accent the short eighth']}]}
};
return {EX,EXEN,COACH,TESTS,RIFF};
})();
/*@JZG1_END@*/

// ----- JZG2: джаз, гитара, часть 2 -----
// Джаз, электрогитара, часть 2: A16–A23, A38, A39, L24–L31, L40, C32–C36.
// Табы считаются из высот (midi): аппликатура в позиции, шеллы и drop-2 с ведением голосов. Вариант = другой материал
// (тип аккорда, лад, гармония, рисунок), уровень = сложность внутри варианта. Свинг — триолями (долгая-короткая = :2 + 1).
const JZG2=(()=>{
  const OP={E:40,A:45,D:50,G:55,B:59,e:64},SS=['E','A','D','G','B','e'];
  const m12=x=>((x%12)+12)%12;
  const PN=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'],K=pc=>'{'+PN[m12(pc)]+'}';
  const Q={maj7:[0,4,7,11],m7:[0,3,7,10],d7:[0,4,7,10],hd:[0,3,6,10],dim:[0,3,6,9],m6:[0,3,7,9],'6':[0,4,7,9],mM7:[0,3,7,11]};
  const QN={maj7:'maj7',m7:'m7',d7:'7',hd:'m7b5',dim:'°7',m6:'m6','6':'6',mM7:'m(maj7)'};
  const CN=([pc,q])=>K(pc)+QN[q];
  const rs=(pc,s,lo)=>{let f=m12(pc-OP[s]);while(f<lo)f+=12;return OP[s]+f;};
  const sc=(r,ints,lo,hi)=>{const a=[];for(let p=lo;p<=hi;p++)if(ints.includes(m12(p-r)))a.push(p);return a;};
  // нота в позиции lo (окно lo…lo+4, затем шире); последний запасной ход — любая струна поближе к позиции
  const at=(p,lo)=>{
    for(const w of [[lo,lo+4],[lo-1,lo+5],[lo-2,lo+6]])for(let i=5;i>=0;i--){const s=SS[i],f=p-OP[s];if(f>=Math.max(0,w[0])&&f<=w[1])return s+f;}
    let b=null,bd=99;SS.forEach(s=>{const f=p-OP[s];if(f>=0&&f<=20&&Math.abs(f-lo-2)<bd){bd=Math.abs(f-lo-2);b=s+f;}});return b||'Q';};
  const pt=t=>({s:t[0],f:+t.slice(1)});
  const tok=(strs,fr)=>strs.map((s,i)=>s+fr[i]).join('+');
  const shf=(c,k)=>c.replace(/\d+/g,n=>+n+k);
  const dx=c=>c.split('+').map(p=>p[0]+'x').join('+');
  // ---------- ритм ----------
  const stp=t=>{const m=/:(\d+)$/.exec(t);return m?+m[1]:1;};
  const pad=(a,n)=>{a=a.slice();let s=a.reduce((x,t)=>x+stp(t),0);while(s%n){a.push('.');s++;}return a;};
  const sys=(a,n,b=2)=>{a=pad(a,n);const bars=[];let cur=[],s=0;a.forEach(t=>{if(s+stp(t)>n){while(s<n){cur.push('.');s++;}bars.push(cur.join(' '));cur=[];s=0;}cur.push(t);s+=stp(t);if(s>=n){bars.push(cur.join(' '));cur=[];s=0;}});
    if(cur.length){while(s%n){cur.push('.');s++;}bars.push(cur.join(' '));} // нота не перелетает через тактовую черту: такт добивается паузами
    const out=[];for(let i=0;i<bars.length;i+=b)out.push(bars.slice(i,i+b).join(' | '));return out;};
  const LV=(sub,a,n,b)=>({sub,t:sys(a,n||sub*4,b)});
  const swg=a=>{a=a.length%2?a.concat(['.']):a;const r=[];for(let i=0;i<a.length;i+=2)r.push(a[i]==='.'?'.:2':a[i]+':2',a[i+1]);return r;};
  const ud=x=>x.concat(x.slice(0,-1).reverse());
  const grp=(a,k)=>{const r=[];for(let i=0;i+k<=a.length;i++)r.push(...a.slice(i,i+k));return r;};
  const G4=a=>grp(a,4).concat(grp(a.slice().reverse(),4));
  // общие уровни линии: октава, весь материал, свинг, тройки, четвёрки 16-ми
  const LN=a=>[LV(2,ud(a.slice(0,Math.min(8,a.length)))),LV(2,ud(a)),LV(3,swg(ud(a))),LV(3,grp(a,3).concat([a[a.length-1]+':3'])),LV(4,G4(a))];
  // подходы: группа из g нот, цель — на долю
  const APL=(tg,orn,g)=>{const run=ts=>{const r=['.'];ts.forEach(t=>r.push(...orn(pt(t))));r[r.length-1]+=':'+g;return LV(g===4?4:g,r,g*4);};
    const o=tg.slice(0,5);return [run(tg.slice(0,3)),run(o),run(ud(o)),run(tg),run(ud(tg))];};
  // ---------- аккорды ----------
  const SHE={maj7:[11,16],d7:[10,16],m7:[10,15],m6:[9,15],'6':[9,16],mM7:[11,15],hd:[10,15,18],dim:[9,15,18]};
  const SHA={maj7:[4,11],d7:[4,10],m7:[3,10],m6:[3,9],'6':[4,9],mM7:[3,11],hd:[6,10,15],dim:[6,9,15]};
  const shellAt=(pc,q,s,f)=>{const p=OP[s]+f,iv=(s==='E'?SHE:SHA)[q],st=s==='E'?['E','D','G','B']:['A','D','G','B'];return [p,...iv.map(i=>p+i)].map((x,i)=>st[i]+(x-OP[st[i]])).join('+');};
  // шеллы с ведением: тоника на 6-й или 5-й струне, ближе к предыдущему аккорду
  const prog=(bars,f0=5)=>{let pf=f0;return bars.map(b=>b.map(([pc,q])=>{let best=null,bd=99;
    for(const s of ['E','A'])for(const f of [m12(pc-OP[s]),m12(pc-OP[s])+12])if(f>=2&&f<=13){const d=Math.abs(f-pf)+(s==='A'?0.1:0);if(d<bd){bd=d;best={s,f};}}
    pf=best.f;return {pc,q,t:shellAt(pc,q,best.s,best.f),p:OP[best.s]+best.f,f:best.f};}));};
  const tk=B=>B.map(b=>b.map(x=>x.t));
  const nextOf=(bars,i)=>bars[(i+1)%bars.length][0];
  const root=c=>c.split('+')[0];
  const appr=c=>{const {s,f}=pt(root(c));return s+(f>0?f-1:f+1);};
  const CW=b=>LV(2,b.flatMap(x=>x.length>1?x.map(c=>c+':4'):[x[0]+':8']));
  const CH=b=>LV(2,b.flatMap(x=>x.length>1?x.map(c=>c+':4'):[x[0]+':4',x[0]+':4']));
  const CQ=b=>LV(2,b.flatMap(x=>(x.length>1?[x[0],x[0],x[1],x[1]]:[x[0],x[0],x[0],x[0]]).map(c=>c+':2')));
  const CC=b=>LV(3,b.flatMap(x=>x.length>1?[x[0]+':2',dx(x[0]),x[0]+':3',x[1]+':2',dx(x[1]),x[1]+':3']:[x[0]+':5',x[0],'.:6']));
  const CA=b=>LV(3,b.flatMap((x,i)=>{const n=nextOf(b,i);return x.length>1?[x[0]+':5',x[1],'.:5',n]:[x[0]+':2',dx(x[0]),'.:2',x[0],'.:5',n];}));
  const CB=b=>LV(2,b.flatMap((x,i)=>x.length>1?[root(x[0])+':2',x[0]+':2',root(x[1])+':2',x[1]+':2']:[root(x[0])+':2',x[0]+':2',root(x[0])+':2',appr(nextOf(b,i))+':2']));
  // drop-2: обращение inv, вторая сверху нота вниз на октаву
  const dv=(pc,ints,inv)=>{const a=[];for(let i=0;i<4;i++){let p=36+pc+ints[(inv+i)%4];while(a.length&&p<=a[a.length-1])p+=12;a.push(p);}a[2]-=12;return a.sort((x,y)=>x-y);};
  const near=(ps,strs,prev)=>{let best=null,bd=1e9;for(let k=-60;k<=60;k+=12){const fr=ps.map((p,i)=>p+k-OP[strs[i]]);if(Math.min(...fr)<1||Math.max(...fr)>17)continue;const d=Math.abs(Math.min(...fr)-prev);if(d<bd){bd=d;best=fr;}}return best;};
  const d2set=(pc,q,set,lo)=>{let pv=lo;return [0,1,2,3].map(inv=>{const ps=dv(pc,Q[q],inv);let fr=null;for(let k=-60;k<=60;k+=12){const f=ps.map((p,i)=>p+k-OP[set[i]]);if(Math.min(...f)>=pv&&Math.max(...f)<=19){fr=f;break;}}
    // запасной путь: выше pv не помещается — берём самую высокую голосовку в ладах 0…19
    if(!fr)for(let k=60;k>=-60;k-=12){const f=ps.map((p,i)=>p+k-OP[set[i]]);if(Math.min(...f)>=0&&Math.max(...f)<=19){fr=f;break;}}pv=Math.min(...fr)+1;return tok(set,fr);});};
  const d2lead=(ch,set,lo)=>{let prev=null;return ch.map(([pc,q])=>{let best=null,bd=1e9;for(let inv=0;inv<4;inv++)for(let k=-60;k<=60;k+=12){const ps=dv(pc,Q[q],inv).map(p=>p+k),fr=ps.map((p,i)=>p-OP[set[i]]);if(Math.min(...fr)<1||Math.max(...fr)>16)continue;
      const d=prev?ps.reduce((s,p,i)=>s+Math.abs(p-prev[i]),0):Math.abs(Math.min(...fr)-lo)*3;if(d<bd){bd=d;best={ps,fr};}}prev=best.ps;return tok(set,best.fr);});};
  // уровни «аккорды по очереди»: целые, половинки, четверти туда-обратно, чарльстон
  const PL=cs=>[CW(cs.map(c=>[c])),LV(2,cs.map(c=>c+':4')),LV(2,ud(cs).concat([cs[0]]).map(c=>c+':2')),CC(cs.map(c=>[c]))];
  const planAp=cs=>{const u=ud(cs).concat([cs[0]]),r=[];for(let i=0;i<u.length-1;i++)r.push(u[i]+':2',shf(u[i+1],1));r.push(u[u.length-1]+':3');return LV(3,r);};
  // ---------- тексты и сборка ----------
  const EX={},EXEN={};
  const add=(id,ru,en,vars)=>{
    EX[id]=Object.assign({n:+id.slice(1)},ru,{sub:vars[0].lv[0].sub,v:vars.map(v=>{const o={l:v.l,lv:v.lv};if(v.meter)o.meter=v.meter;return o;})});
    EXEN[id]=Object.assign({},en,{v:vars.map(v=>v.le)});};
  const T=(name,goal,how,tip,lvl)=>({name,goal,how,tip,lvl});
  const STR=s=>({E:['тоника на 6-й струне','root on the 6th string'],A:['тоника на 5-й струне','root on the 5th string'],D:['тоника на 4-й струне','root on the 4th string']})[s];

  // ===== A16: арпеджио септаккордов — вариант = тип аккорда =====
  add('A16',T('Арпеджио септаккордов','Пять типов септаккордов и уменьшённый — нота за нотой, по всей позиции.','Тоника, терция, квинта, септима в одной позиции на две октавы. Дальше — обращения (от каждой ноты аккорда), нона и группы по четыре шестнадцатыми.','Пой терцию и септиму: именно они отличают maj7, m7 и доминанту.',['Одна октава','Две октавы','Обращения свингом','С ноной, триолями','Группы по четыре']),
    T('Seventh-chord arpeggios','Five seventh-chord types plus the diminished, note by note, across a position.','Root, third, fifth and seventh in one position over two octaves. Then inversions (starting from each chord tone), the ninth and groups of four in sixteenths.','Sing the third and the seventh: they are what tells maj7, m7 and the dominant apart.',['One octave','Two octaves','Inversions in swing','With the ninth, in triplets','Groups of four']),
    [['maj7',7,'E',2],['m7',9,'E',4],['d7',0,'A',2],['hd',11,'A',1],['dim',1,'A',3],['m6',2,'A',4]].map(([q,pc,s,lo])=>{
      const r=rs(pc,s,1),A=sc(r,Q[q],r,r+24).map(p=>at(p,lo)),A1=sc(r,Q[q],r,r+12).map(p=>at(p,lo)),A9=sc(r,Q[q].concat([2]),r,r+24).map(p=>at(p,lo));
      return {l:`${CN([pc,q])}, ${STR(s)[0]}`,le:`${CN([pc,q])}, ${STR(s)[1]}`,
        lv:[LV(2,ud(A1)),LV(2,ud(A)),LV(3,swg([0,1,2,3].flatMap(i=>A.slice(i,i+4)))),LV(3,ud(A9)),LV(4,G4(A))]};}));

  // ===== A17: комп шеллами — вариант = гармония =====
  const PR17=[
    [['ii–V–I в {C}','ii–V–I in {C}'],[[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[0,'maj7']]]],
    [['ii–V–I–VI в {F}','ii–V–I–VI in {F}'],[[[7,'m7']],[[0,'d7']],[[5,'maj7']],[[2,'d7']]]],
    [['минорный ii–V–i в {A}m','minor ii–V–i in {A}m'],[[[11,'hd']],[[4,'d7']],[[9,'m6']],[[9,'m6']]]],
    [['ритм-чейнджес, такты 1–4, {Bb}','rhythm changes, bars 1–4, {Bb}'],[[[10,'6'],[7,'d7']],[[0,'m7'],[5,'d7']],[[2,'m7'],[7,'d7']],[[0,'m7'],[5,'d7']]]],
    [['цепочка ii–V вниз к {D}maj7','chain of ii–Vs down to {D}maj7'],[[[6,'m7'],[11,'d7']],[[4,'m7'],[9,'d7']],[[2,'maj7']],[[2,'maj7']]]],
    [['доминанты по кругу: III7–VI7–II7–V7 в {C}','dominants round the cycle: III7–VI7–II7–V7 in {C}'],[[[4,'d7']],[[9,'d7']],[[2,'d7']],[[7,'d7']]]]];
  add('A17',T('Комп шеллами','Аккомпанемент в духе Freddie Green: три ноты — тоника, терция, септима.','Шеллы с тоникой на 6-й и 5-й струнах, переход к ближайшему аккорду. Ритмы: целые, четверти «чак-чак», чарльстон свингом, бас и аккорд по очереди, толчки на «и».','Короткие четверти: левая рука ослабляет хват сразу после удара. Тогда комп качает, а не гудит.',['Целыми нотами','Четверти, Freddie Green','Чарльстон свингом','Бас и аккорд по очереди','Толчки на «и»']),
    T('Shell comping','Comping in the style of Freddie Green: three notes, root, third and seventh.','Shells with the root on the 6th and 5th strings, moving to the nearest next chord. Rhythms: whole notes, quarter-note chops, the Charleston in swing, bass and chord in turn, pushes on the and.','Short quarters: release the left hand right after each hit. Then the comping swings instead of droning.',['Whole notes','Quarters, Freddie Green','Charleston in swing','Bass and chord in turn','Pushes on the and']),
    PR17.map(([[l,le],b])=>{const B=tk(prog(b));return {l,le,lv:[CW(B),CQ(B),CC(B),CB(B),CA(B)]};}));

  // ===== A18: drop-2 =====
  const V18=[['maj7',5,'DGBe',1],['m7',2,'DGBe',3],['d7',7,'DGBe',2],['hd',11,'DGBe',3],[[[2,'m7'],[7,'d7'],[0,'maj7'],[0,'maj7']],'C','DGBe',5],[[[0,'m7'],[5,'d7'],[10,'maj7'],[10,'maj7']],'Bb','ADGB',3]];
  add('A18',T('Аккорды drop-2','Четырёхзвучные аккорды по всему грифу: каждое обращение и ведение голосов.','Drop-2: вторая сверху нота аккорда опускается на октаву. Четыре обращения одного аккорда вверх по грифу, потом ii–V–I, где каждый голос идёт к ближайшей ноте.','Следи за верхней нотой: это мелодия аккомпанемента.',['Целыми нотами','Половинками','Четвертями туда и обратно','Чарльстон свингом','Подъезд на полтона сверху']),
    T('Drop-2 chords','Four-note chords all over the neck: every inversion and smooth voice leading.','Drop 2: the second-highest note of a close chord drops an octave. Four inversions of one chord up the neck, then ii–V–I where every voice moves to the nearest note.','Follow the top note: it is the melody of your comping.',['Whole notes','Half notes','Quarters up and back','Charleston in swing','Half-step approach from above']),
    V18.map(([q,pc,set,lo],i)=>{const st=set.split('');const cs=typeof q==='string'?d2set(pc,q,st,lo):d2lead(q,st,lo);
      const top=set==='DGBe'?['на верхних четырёх струнах','on the top four strings']:['на средних струнах','on the middle strings'];
      const nm=typeof q==='string'?[`${CN([pc,q])}: четыре обращения ${top[0]}`,`${CN([pc,q])}: four inversions ${top[1]}`]:[`ii–V–I в {${pc}} ${top[0]}`,`ii–V–I in {${pc}} ${top[1]}`];
      return {l:nm[0],le:nm[1],lv:PL(cs).concat([planAp(cs)])};}));

  // ===== A19: бибоп-гаммы =====
  const BB={dom:[0,2,4,5,7,9,10,11],maj:[0,2,4,5,7,8,9,11],dor:[0,2,3,4,5,7,9,10],mel:[0,2,3,5,7,8,9,11]};
  const BBN={dom:['бибоп-доминантовая','bebop dominant'],maj:['бибоп-мажорная','bebop major'],dor:['бибоп-дорийская','bebop Dorian'],mel:['бибоп-минорная (мелодический минор)','bebop melodic minor']};
  add('A19',T('Бибоп-гаммы','Восьминотные гаммы, в которых на сильные доли попадают тоны аккорда.','Лишняя хроматическая нота делает гамму восьминотной: если вести её вниз от тоники восьмыми, на каждой доле звучит нота аккорда. Сначала спуск, потом спуск от каждой ноты аккорда и фраза «арпеджио вверх — гамма вниз».','Проверь себя: остановись на любой доле — там должна быть нота аккорда.',['Октава вниз','Две октавы вниз и вверх','Свингом','Спуск от каждой ноты аккорда','Арпеджио вверх, гамма вниз']),
    T('Bebop scales','Eight-note scales that put chord tones on the strong beats.','One extra chromatic note makes the scale eight notes long: run it down from the root in eighths and every beat lands on a chord tone. First the descent, then descents from each chord tone and the phrase arpeggio up, scale down.','Check yourself: stop on any beat and you should be on a chord tone.',['One octave down','Two octaves down and up','In swing','Descent from each chord tone','Arpeggio up, scale down']),
    [['dom',7,'E',2],['maj',0,'A',2],['dor',2,'A',4],['dom',5,'E',0],['mel',9,'E',4],['dom',10,'E',5]].map(([k,pc,s,lo])=>{
      const r=rs(pc,s,s==='E'&&lo===0?1:1),a=sc(r,BB[k],r,r+24).map(p=>at(p,lo)),d=a.slice().reverse(),o=a.slice(0,9).reverse();
      const fr=[0,2,4,6].flatMap(i=>a.slice(i,i+9).reverse());
      return {l:`${K(pc)}, ${BBN[k][0]}, ${STR(s)[0]}`,le:`${K(pc)}, ${BBN[k][1]}, ${STR(s)[1]}`,
        lv:[LV(2,o.concat([o[o.length-1]])),LV(2,ud(d)),LV(3,swg(ud(d))),LV(3,swg(fr)),LV(3,swg([a[0],a[2],a[4],a[6],a[9]].concat(a.slice(0,10).reverse())))]};}));

  // ===== A20: хроматические подходы и энклоужеры =====
  const OR20=[[2,({s,f})=>[s+(f-1),s+f],['снизу полутоном','a half step from below']],[2,({s,f})=>[s+(f+1),s+f],['сверху полутоном','a half step from above']],
    [3,({s,f})=>[s+(f+1),s+(f-1),s+f],['энклоужер: сверху, снизу, цель','enclosure: above, below, target']],[3,({s,f})=>[s+(f-2),s+(f-1),s+f],['двойной хроматический снизу','double chromatic from below']],
    [3,({s,f})=>[s+(f-1),s+(f+1),s+f],['энклоужер: снизу, сверху, цель','enclosure: below, above, target']],[3,({s,f})=>[s+(f+2),s+(f-1),s+f],['тон сверху, полутон снизу','whole step above, half step below']]];
  add('A20',T('Хроматические подходы и энклоужеры','Попадать в ноты аккорда через соседние ноты, как в бибопе.','Цель — нота аккорда на доле, подход — перед ней. Подход полутоном снизу или сверху, двойной хроматический, энклоужер (окружение) с двух сторон. Цели идут по арпеджио аккорда.','Цель всегда на доле, подход — на слабой части. Если цель съехала с доли, фраза звучит фальшиво.',['Три цели','Октава арпеджио','Вверх и вниз','Две октавы','Две октавы вверх и вниз']),
    T('Chromatic approaches and enclosures','Land on chord tones through their neighbours, the bebop way.','The target is a chord tone on the beat; the approach comes just before it. A half step from below or above, a double chromatic approach, an enclosure from both sides. The targets follow the chord arpeggio.','The target is always on the beat, the approach on the weak part. If the target slips off the beat, the line sounds wrong.',['Three targets','One octave of the arpeggio','Up and down','Two octaves','Two octaves up and down']),
    [['maj7',5,'A',7],['m7',2,'A',4],['d7',7,'E',2],['m7',9,'E',4],['maj7',10,'E',5],['d7',0,'A',2]].map(([q,pc,s,lo],i)=>{
      const r=rs(pc,s,1),tg=sc(r,Q[q],r,r+24).map(p=>at(p,lo+1)),[g,orn,nm]=OR20[i];
      return {l:`${CN([pc,q])}: ${nm[0]}`,le:`${CN([pc,q])}: ${nm[1]}`,lv:APL(tg,orn,g)};}));

  // ===== A21: тритоновая замена =====
  const V21=[[0,[[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[0,'maj7']]],[[[2,'m7']],[[1,'d7']],[[0,'maj7']],[[0,'maj7']]],['ii–♭II7–I','ii–♭II7–I']],
    [5,[[[7,'m7']],[[0,'d7']],[[5,'maj7']],[[5,'maj7']]],[[[7,'m7']],[[6,'d7']],[[5,'maj7']],[[5,'maj7']]],['ii–♭II7–I, тоника внизу грифа','ii–♭II7–I, low on the neck']],
    [9,[[[11,'hd']],[[4,'d7']],[[9,'m6']],[[9,'m6']]],[[[11,'hd']],[[10,'d7']],[[9,'m6']],[[9,'m6']]],['минорный: iiø–♭II7–i','minor: iiø–♭II7–i']],
    [10,[[[10,'maj7']],[[7,'d7']],[[0,'m7']],[[5,'d7']]],[[[10,'maj7']],[[1,'d7']],[[0,'m7']],[[11,'d7']]],['I–♭III7–ii–♭II7 вместо I–VI7–ii–V7','I–♭III7–ii–♭II7 instead of I–VI7–ii–V7']],
    [7,[[[9,'m7']],[[2,'d7']],[[7,'maj7']],[[4,'d7']]],[[[9,'m7']],[[8,'d7']],[[7,'maj7']],[[10,'d7']]],['замена обеих доминант','both dominants substituted']],
    [3,[[[5,'m7']],[[10,'d7']],[[3,'maj7']],[[3,'maj7']]],[[[5,'m7']],[[11,'m7'],[4,'d7']],[[3,'maj7']],[[3,'maj7']]],['замена целого ii–V','the whole ii–V substituted']]];
  add('A21',T('Тритоновая замена','Доминанта заменяется септаккордом на тритон выше: бас идёт по полутонам.','У V7 и ♭II7 общие терция и септима (меняются местами), поэтому замена звучит естественно. Сначала исходная гармония и замена подряд, потом замена в разных ритмах, арпеджио аккордов и бас с аккордом.','Сравни на слух: в замене бас скользит вниз по полутонам к тонике.',['Исходная и замена','Замена четвертями','Чарльстон свингом','Арпеджио аккордов','Бас и аккорд']),
    T('Tritone substitution','The dominant is replaced by the seventh chord a tritone away, so the bass moves in half steps.','V7 and ♭II7 share the third and the seventh (they swap places), which is why the substitute sounds natural. First the original changes and the substitution back to back, then the substitution in different rhythms, chord arpeggios, and bass with chords.','Compare by ear: with the substitute, the bass slides down by half steps to the root.',['Original, then substitute','Substitute in quarters','Charleston in swing','Chord arpeggios','Bass and chord']),
    V21.map(([key,o,sb,nm])=>{const O=tk(prog(o)),S=prog(sb),B=tk(S);
      const arp=S.flatMap(b=>b.flatMap(x=>{const iv=Q[x.q],lo=x.f-1,ps=b.length>1?[0,iv[1],iv[2],iv[3]]:[0,iv[1],iv[2],iv[3],14,iv[3],iv[2],iv[1]];return ps.map(i=>at(x.p+i,lo));}));
      return {l:`${nm[0]}, {${PN[key]}}`,le:`${nm[1]}, {${PN[key]}}`,lv:[{sub:2,t:CW(O).t.concat(CW(B).t)},CQ(B),CC(B),LV(3,swg(arp)),CB(B)]};}));

  // ===== A22: мелодический минор и его лады =====
  const MM=[[[0,2,3,5,7,9,11],9,'E',4,['мелодический минор','melodic minor']],[[0,2,4,6,7,9,10],5,'A',7,['лидийская доминанта','Lydian dominant']],[[0,1,3,4,6,8,10],7,'E',2,['альтерированная (над {G}7)','altered (over {G}7)']],
    [[0,2,3,5,6,8,10],11,'A',1,['локрийская ♮2 (над {B}m7b5)','Locrian ♮2 (over {B}m7b5)']],[[0,2,3,5,7,9,11],2,'A',4,['мелодический минор, {D}m(maj7)','melodic minor, {D}m(maj7)']],[[0,2,4,6,8,9,11],0,'A',2,['лидийская увеличенная','Lydian augmented']]];
  add('A22',T('Мелодический минор и его лады','Звукоряды современного джаза: мелодический минор, лидийская доминанта, альтерированная.','Каждый вариант — свой лад мелодического минора в одной позиции. Октава, две октавы, свингом, тройками и группами по четыре.','Альтерированный лад — это мелодический минор на полтона выше доминанты: {G}7 alt = {Ab} мелодический минор.',['Октава','Две октавы','Свингом','Тройками','Группы по четыре']),
    T('Melodic minor and its modes','The scales of modern jazz: melodic minor, Lydian dominant, altered.','Each variant is one mode of melodic minor in one position. An octave, two octaves, in swing, in threes and in groups of four.','The altered scale is the melodic minor a half step above the dominant: {G}7 alt = {Ab} melodic minor.',['One octave','Two octaves','In swing','In threes','Groups of four']),
    MM.map(([iv,pc,s,lo,nm])=>{const r=rs(pc,s,1),a=sc(r,iv,r,r+24).map(p=>at(p,lo));return {l:`${K(pc)} ${nm[0]}, ${STR(s)[0]}`,le:`${K(pc)} ${nm[1]}, ${STR(s)[1]}`,lv:LN(a)};}));

  // ===== A23: уменьшённая гамма =====
  const HW=[0,1,3,4,6,7,9,10],WH=[0,2,3,5,6,8,9,11];
  add('A23',T('Уменьшённая гамма','Симметричная гамма: полутон-тон над доминантой 7♭9, тон-полутон над уменьшённым аккордом.','Гамма повторяется через малую терцию, поэтому любую фигуру можно сдвинуть на три лада. Гамма, ячейка из четырёх нот со сдвигом на терцию, два уменьшённых септаккорда внутри гаммы, терции.','Над доминантой начинай с полутона (полутон-тон), над уменьшённым аккордом — с тона.',['Октава','Две октавы свингом','Ячейка со сдвигом на терцию','Два уменьшённых аккорда','Терциями']),
    T('Diminished scale','A symmetrical scale: half-whole over a 7♭9 dominant, whole-half over a diminished chord.','The scale repeats every minor third, so any shape can move by three frets. The scale, a four-note cell shifted by a minor third, the two diminished seventh chords inside the scale, thirds.','Over a dominant start with a half step (half-whole); over a diminished chord, with a whole step.',['One octave','Two octaves in swing','Cell shifted by a minor third','Two diminished chords','In thirds']),
    [[HW,7,'E',2],[WH,0,'A',2],[HW,2,'A',4],[WH,5,'A',7],[HW,10,'E',5],[WH,4,'A',6]].map(([iv,pc,s,lo])=>{
      const r=rs(pc,s,1),a=sc(r,iv,r,r+24).map(p=>at(p,lo)),o=a.slice(0,9);
      const cell=[0,2,4,6,8,10,12].flatMap(i=>a.slice(i,i+4)),ev=a.filter((x,i)=>i%2===0),od=a.filter((x,i)=>i%2===1);
      const th=[];for(let i=0;i+2<a.length;i++)th.push(a[i],a[i+2]);
      const hw=iv===HW;return {l:`${K(pc)}${hw?'7♭9: полутон-тон':'°7: тон-полутон'}, ${STR(s)[0]}`,le:`${K(pc)}${hw?'7♭9: half-whole':'°7: whole-half'}, ${STR(s)[1]}`,
        lv:[LV(2,ud(o)),LV(3,swg(ud(a))),LV(4,cell),LV(3,ud(ev).concat(ud(od))),LV(4,th.concat(th.slice().reverse()))]};}));

  // ===== A38: кварты =====
  const scm=(pc,iv)=>sc(36+pc,iv,36+pc,36+pc+72);
  const quart=(pc,iv,degs,idx,set,lo)=>{const s=scm(pc,iv);let pv=lo;return degs.map(d=>{const ps=idx.map(k=>s[d+k]),fr=near(ps,set,pv);pv=Math.min(...fr);return tok(set,fr);});};
  const DOR=[0,2,3,5,7,9,10],ION=[0,2,4,5,7,9,11],MIX=[0,2,4,5,7,9,10];
  const V38=[[2,DOR,[0,1,2,3],[0,3,6],'DGB',5,['дорийский {D}, три голоса','{D} Dorian, three voices']],[2,DOR,[0,1,7,8],[0,3,6,9,11],'ADGBe',5,['«So What»: {D}m и {E}m, пять голосов','“So What”: {D}m and {E}m, five voices']],
    [0,ION,[2,3,4,5],[0,3,6],'GBe',7,['ионийский {C}, верхние голоса','{C} Ionian, top voices']],[7,MIX,[0,1,2,3],[0,3,6],'ADG',3,['миксолидийский {G}, нижние голоса','{G} Mixolydian, low voices']],
    [9,DOR,[0,1,2,3],[0,3,6,9],'DGBe',5,['дорийский {A}, четыре голоса','{A} Dorian, four voices']],[5,ION,[3,6,2,2],[0,3,6],'DGB',3,['ii–V–I в {F} квартами от терции','ii–V–I in {F}, fourths from the third']]];
  add('A38',T('Квартовые аккорды','Модальный комп в духе McCoy Tyner и Bill Evans: аккорды из кварт.','Аккорд собирается квартами по ладу и двигается по его ступеням (параллельно). «So What» — четыре кварты и терция сверху. Ритмы те же, что в компе, на последнем уровне — аккорд разложен шестнадцатыми.','Квартовые аккорды не тяготеют к тонике: держи лад в ушах, бас (тонику лада) пропой про себя.',['Целыми нотами','Половинками','Четвертями туда и обратно','Чарльстон свингом','Разложение шестнадцатыми']),
    T('Quartal chords','Modal comping in the style of McCoy Tyner and Bill Evans: chords built in fourths.','The chord is stacked in fourths from the mode and moves along its degrees in parallel. “So What” is four fourths with a third on top. The rhythms are the comping ones; on the last level the chord is broken into sixteenths.','Quartal chords do not pull towards the root: keep the mode in your ears and hum its root to yourself.',['Whole notes','Half notes','Quarters up and back','Charleston in swing','Broken in sixteenths']),
    V38.map(([pc,iv,degs,idx,set,lo,nm])=>{const cs=quart(pc,iv,degs,idx,set.split(''),lo);
      const br=ud(cs).concat([cs[0]]).flatMap(c=>{const n=c.split('+').slice(0,4);while(n.length<4)n.push('.');return n;});
      return {l:nm[0],le:nm[1],lv:PL(cs).concat([LV(4,br)])};}));

  // ===== A39: блюз в джазе =====
  const F12=[[[5,'d7']],[[10,'d7']],[[5,'d7']],[[0,'m7'],[5,'d7']],[[10,'d7']],[[11,'dim']],[[5,'d7']],[[2,'d7']],[[7,'m7']],[[0,'d7']],[[5,'d7'],[2,'d7']],[[7,'m7'],[0,'d7']]];
  const V39=[[F12,['джаз-блюз в {F}','jazz blues in {F}']],
    [[[[0,'m7']],[[5,'m7']],[[0,'m7']],[[0,'m7']],[[5,'m7']],[[5,'m7']],[[0,'m7']],[[0,'m7']],[[8,'d7']],[[7,'d7']],[[0,'m7']],[[7,'d7']]],['минорный блюз в {C}m','minor blues in {C}m']],
    [[[[5,'maj7']],[[4,'hd'],[9,'d7']],[[2,'m7'],[7,'d7']],[[0,'m7'],[5,'d7']],[[10,'d7']],[[10,'m7'],[3,'d7']],[[9,'m7'],[2,'d7']],[[8,'m7'],[1,'d7']],[[7,'m7']],[[0,'d7']],[[5,'maj7'],[2,'d7']],[[7,'m7'],[0,'d7']]],['«птичий» блюз в {F} (Parker)','“Bird” blues in {F} (Parker)']],
    [F12.map(b=>b.map(([pc,q])=>[m12(pc+5),q])),['джаз-блюз в {Bb}','jazz blues in {Bb}']],
    [[[[7,'d7']],[[0,'d7']],[[7,'d7']],[[2,'m7'],[1,'d7']],[[0,'d7']],[[1,'dim']],[[11,'m7'],[10,'d7']],[[9,'m7'],[8,'d7']],[[9,'m7']],[[8,'d7']],[[7,'d7'],[4,'d7']],[[9,'m7'],[8,'d7']]],['блюз в {G} с тритоновыми заменами','blues in {G} with tritone subs']],
    [[[[0,'d7']],[[5,'d7']],[[0,'d7']],[[0,'d7']],[[5,'d7']],[[5,'d7']],[[0,'d7']],[[9,'d7']],[[2,'m7']],[[7,'d7']],[[0,'d7'],[9,'d7']],[[2,'m7'],[7,'d7']]],['блюз в {C}: I7–IV7–V7 и ii–V в конце','blues in {C}: I7–IV7–V7 with ii–V at the end']]];
  add('A39',T('Джазовый блюз','Двенадцать тактов в джазовой гармонии: ii–V, уменьшённый аккорд, «птичий» блюз.','Квадрат блюза шеллами: сначала первые четыре такта, потом весь. Дальше ритмы компа: четверти, чарльстон, бас с аккордом.','Счёт тактов — вслух или про себя. Ошибка в форме хуже ошибки в аккорде.',['Такты 1–4','Весь квадрат','Четвертями','Чарльстон свингом','Бас и аккорд']),
    T('Jazz blues','Twelve bars with jazz harmony: ii–Vs, a diminished chord, the “Bird” blues.','The blues form in shells: the first four bars, then the whole form. Then the comping rhythms: quarters, the Charleston, bass with chord.','Count the bars, aloud or to yourself. Losing the form is worse than a wrong chord.',['Bars 1–4','The whole form','In quarters','Charleston in swing','Bass and chord']),
    V39.map(([b,nm])=>{const B=tk(prog(b));return {l:nm[0],le:nm[1],lv:[CW(B.slice(0,4)),CW(B),CQ(B),CC(B),CB(B)]};}));

  // ===== L24: октавы =====
  const PAIRS=[['E','D',2],['A','G',2],['D','B',3],['G','e',3]];
  // нота вне октавных пар переносится на октаву
  const octs=(ps,f0)=>{let pf=f0;return ps.map(p0=>{let b=null,bd=99;for(const p of [p0,p0+12,p0-12,p0+24,p0-24]){PAIRS.forEach(([s,s2,d])=>{const f=p-OP[s];if(f>=1&&f+d<=19&&Math.abs(f-pf)<bd){bd=Math.abs(f-pf);b=`${s}${f}+${s2}${f+d}`;}});if(b)break;}pf=+b.split('+')[0].slice(1);return b;});};
  const V24=[[sc(43,ION.map(x=>x),43,60),3,['мажорная гамма {G}','{G} major scale']],[sc(45,Q.m7,45,69),5,['арпеджио {A}m7','{A}m7 arpeggio']],[sc(48,BB.dom,48,60).reverse(),5,['бибоп-спуск над {C}7','bebop descent over {C}7']],
    [sc(53,[0,3,5,6,7,10],53,65),3,['блюзовая гамма {F}','{F} blues scale']],[[11,9,10,3,1,2,6,4,5,10,8,9].map(x=>46+x),6,['энклоужеры к тонам {Bb}','enclosures around {Bb} chord tones']],[sc(50,[0,3,5,7,10],50,74),5,['минорная пентатоника {D}','{D} minor pentatonic']]];
  add('L24',T('Октавы','Мелодия октавами в духе Wes Montgomery.','Две ноты через струну: нижняя — указательным, верхняя — безымянным или мизинцем, средняя струна заглушена указательным. Бей по всем трём струнам. Пары струн меняются вместе с мелодией.','Удар — большим пальцем или медиатором через все три струны, но звучат только две. Если звенит средняя — положи указательный площе.',['Четыре ноты половинками','Вверх четвертями','Вверх и вниз','Свингом','Триолями']),
    T('Octaves','A melody in octaves, Wes Montgomery style.','Two notes with a string between them: the lower one with the index finger, the upper one with the ring finger or pinky, the middle string muted by the index. Strike all three strings. The string pairs change with the melody.','Strike with the thumb or the pick across all three strings, but only two sound. If the middle one rings, lay the index flatter.',['Four notes in halves','Up in quarters','Up and down','In swing','In triplets']),
    V24.map(([ps,f0,nm])=>{const a=octs(ps,f0);return {l:nm[0],le:nm[1],lv:[LV(2,a.slice(0,4).map(c=>c+':4')),LV(2,a.map(c=>c+':2')),LV(2,ud(a).map(c=>c+':2')),LV(3,swg(ud(a))),LV(3,ud(a).concat([a[0]+':2']))]};}));

  // ===== L25: ведение голосов (гайд-тоны) =====
  const gts=bars=>{let pd=5,pg=5;return bars.map(b=>b.map(([pc,q])=>{const t3=pc+Q[q][1],t7=pc+Q[q][3];let best=null,bd=99;
    for(const [lo,hi] of [[t3,t7],[t7,t3]])for(let fd=1;fd<=12;fd++){const pl=50+fd;if(m12(pl-lo))continue;let ph=pl+1;while(m12(ph-hi))ph++;const fg=ph-55;if(fg<0||fg>13)continue;const d=Math.abs(fd-pd)+Math.abs(fg-pg);if(d<bd){bd=d;best=[fd,fg];}}
    [pd,pg]=best;return {d:'D'+best[0],g:'G'+best[1],t:'D'+best[0]+'+G'+best[1]};}));};
  const V25=[[[[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[9,'d7']],[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[0,'maj7']]],['ii–V–I–VI в {C}','ii–V–I–VI in {C}']],
    [[[[4,'hd']],[[9,'d7']],[[2,'m6']],[[2,'m6']],[[4,'hd']],[[9,'d7']],[[2,'m6']],[[9,'d7']]],['минорный ii–V–i в {D}m','minor ii–V–i in {D}m']],
    [[4,9,2,7,0,5,10,3].map(pc=>[[pc,'d7']]),['доминанты по квартовому кругу от {E}7','dominants round the cycle of fourths from {E}7']],
    [[[[2,'d7']],[[2,'d7']],[[7,'d7']],[[7,'d7']],[[0,'d7']],[[0,'d7']],[[5,'d7']],[[5,'d7']]],['бридж ритм-чейнджес в {Bb}','rhythm changes bridge in {Bb}']],
    [F12,['джаз-блюз в {F}','jazz blues in {F}']],
    [[[[4,'m7'],[9,'d7']],[[3,'m7'],[8,'d7']],[[2,'m7'],[7,'d7']],[[0,'maj7']]],['цепочка ii–V по полутонам вниз к {C}','ii–V chain down by half steps to {C}']]];
  add('L25',T('Ведение голосов: терции и септимы','Гайд-тоны — две ноты, которые определяют аккорд и плавно ведут к следующему.','Терция и септима на средних струнах. В ii–V–I септима одного аккорда уходит на полтона вниз в терцию следующего, вторая нота стоит на месте. Сначала аккордами, потом разложено, с хроматическим подходом к следующему аккорду.','Двигай руку как можно меньше: обычно меняется только один палец.',['Такты 1–4','Вся гармония','Четвертями','Чарльстон свингом','Разложено, подход к аккорду']),
    T('Voice leading: thirds and sevenths','Guide tones: the two notes that define a chord and lead smoothly to the next one.','Third and seventh on the middle strings. In ii–V–I the seventh of one chord falls a half step to the third of the next while the other note stays put. First as chords, then broken up with a chromatic approach to the next chord.','Move the hand as little as possible: usually only one finger changes.',['Bars 1–4','The whole progression','In quarters','Charleston in swing','Broken, approaching the next chord']),
    V25.map(([b,nm])=>{const G=gts(b),B=G.map(x=>x.map(y=>y.t)),fl=G.flat();
      const line=G.flatMap(x=>x.flatMap(y=>{const i=fl.indexOf(y),n=fl[(i+1)%fl.length],ap='D'+Math.max(0,+n.d.slice(1)-1);return x.length>1?[y.d,y.g,y.d,ap]:[y.d,y.g,y.d,y.g,y.d,y.g,y.d,ap];}));
      return {l:nm[0],le:nm[1],lv:[CW(B.slice(0,4)),CW(B),CQ(B),CC(B),LV(3,swg(line))]};}));

  // ===== L26: растяжки — арпеджио по две ноты на струне =====
  const two=(r,iv)=>{const ps=sc(r,iv,r,r+40).slice(0,12);return ps.map((p,k)=>{const s=SS[k>>1];return s+(p-OP[s]);});};
  add('L26',T('Растяжки: арпеджио по две ноты на струне','Широкие арпеджио септаккордов по диагонали грифа.','Две ноты аккорда на каждой струне, шесть струн — три октавы. Рука растягивается на 4–5 ладов и сдвигается вверх по диагонали. Сначала половина, потом целиком, свингом, тройками и четвёрками.','Большой палец — за грифом, напротив среднего. Растяжка идёт от кисти, а не от пальцев.',['Нижняя половина','Три октавы','Свингом','Тройками','Группы по четыре']),
    T('Stretches: two notes per string','Wide seventh-chord arpeggios along a diagonal of the neck.','Two chord tones on each string; six strings make three octaves. The hand stretches over 4–5 frets and shifts up diagonally. Half first, then the whole thing, in swing, in threes and in fours.','Thumb behind the neck, opposite the middle finger. The stretch comes from the wrist, not the fingers.',['Lower half','Three octaves','In swing','In threes','Groups of four']),
    [['maj7',7,3],['m7',9,5],['d7',5,1],['hd',1,9],['m6',0,8],['dim',10,6]].map(([q,pc,f])=>{const a=two(40+f,Q[q]);return {l:`${CN([pc,q])}, от {s:E} ${f}-го лада`,le:`${CN([pc,q])}, from fret ${f}`,lv:LN(a)};}));

  // ===== L27: легато — орнаменты =====
  const OR27=[[2,({s,f})=>[s+(f-1),s+'h'+f],['хаммер с полутона снизу','hammer-on from a half step below']],[2,({s,f})=>[s+(f+1),s+'p'+f],['пулл-офф с полутона сверху','pull-off from a half step above']],
    [3,({s,f})=>[s+f,s+'h'+(f+2),s+'p'+f],['мордент: хаммер и пулл-офф','mordent: hammer-on and pull-off']],[4,({s,f})=>[s+(f+1),s+'p'+f,s+'p'+(f-1),s+'h'+f],['группетто: сверху, цель, снизу, цель','turn: above, target, below, target']],
    [3,({s,f})=>[s+(f+1),s+(f-1),s+'h'+f],['энклоужер с хаммером в цель','enclosure with a hammer-on into the target']],[3,({s,f})=>[s+(f-2),s+'h'+(f-1),s+'h'+f],['два хаммера по полутонам','two half-step hammer-ons']]];
  add('L27',T('Легато: джазовые украшения','Хаммеры и пулл-оффы как у Pat Martino и Joe Pass: украшение ведёт в ноту аккорда.','Цели — ноты арпеджио, украшение играется легато на той же струне. Подъезд хаммером, пулл-офф сверху, мордент, группетто, энклоужер. Цель на доле.','Легато в джазе — это мягкость, а не скорость. Все ноты украшения одной громкости с целью.',['Три цели','Октава арпеджио','Вверх и вниз','Две октавы','Две октавы вверх и вниз']),
    T('Legato: jazz ornaments','Hammer-ons and pull-offs as Pat Martino and Joe Pass use them: the ornament leads into a chord tone.','The targets are arpeggio notes; the ornament is played legato on the same string. Hammer-on approach, pull-off from above, mordent, turn, enclosure. The target is on the beat.','Legato in jazz is about softness, not speed. Every ornament note is as loud as the target.',['Three targets','One octave of the arpeggio','Up and down','Two octaves','Two octaves up and down']),
    [['m7',2,'A',5],['maj7',7,'E',3],['d7',0,'A',4],['m7',9,'E',5],['maj7',5,'A',8],['d7',10,'E',7]].map(([q,pc,s,lo],i)=>{
      const r=rs(pc,s,2),tg=sc(r,Q[q],r,r+24).map(p=>at(p,lo)),[g,orn,nm]=OR27[i];
      return {l:`${CN([pc,q])}: ${nm[0]}`,le:`${CN([pc,q])}: ${nm[1]}`,lv:APL(tg,orn,g)};}));

  // ===== L28: смена позиций — три ноты на струне =====
  const nps=(r,iv)=>{const ps=sc(r,iv,r,r+40).slice(0,18);return ps.map((p,k)=>{const s=SS[Math.floor(k/3)];return s+(p-OP[s]);});};
  const V28=[[ION,7,3,['ионийский {G}','{G} Ionian']],[DOR,9,5,['дорийский {A}','{A} Dorian']],[MIX,2,10,['миксолидийский {D}','{D} Mixolydian']],[[0,2,4,6,7,9,11],5,1,['лидийский {F}','{F} Lydian']],[MM[0][0],0,8,['мелодический минор {C}','{C} melodic minor']],[MM[1][0],10,6,['лидийская доминанта {Bb}','{Bb} Lydian dominant']]];
  add('L28',T('Три ноты на струне: по грифу','Лады джаза по всему грифу: позиция сдвигается на каждой струне.','По три ноты лада на струне от тоники на 6-й струне, шесть струн. Рука сдвигается вверх на каждой новой струне. Половина, целиком, свингом, тройками, четвёрками.','Сдвигай руку на ноте, сыгранной указательным, — так переход не слышен.',['Нижняя половина','Весь лад','Свингом','Тройками','Группы по четыре']),
    T('Three notes per string up the neck','Jazz modes across the whole neck: the position shifts on every string.','Three notes of the mode per string from the root on the 6th string, six strings. The hand shifts up on each new string. Half, the whole thing, in swing, in threes, in fours.','Shift on a note played with the index finger and the change will not be heard.',['Lower half','The whole mode','In swing','In threes','Groups of four']),
    V28.map(([iv,pc,f,nm])=>({l:nm[0],le:nm[1],lv:LN(nps(40+f,iv))})));

  // ===== L29: шестой аккорд и уменьшённый (Barry Harris) =====
  const bh=(pc,minor,set,lo)=>{const T6=minor?[0,3,7,9]:[0,4,7,9],DM=[2,5,8,11],scl=minor?[0,2,3,5,7,8,9,11]:[0,2,4,5,7,8,9,11];
    const r=OP[set[set.length-1]]+m12(pc-OP[set[set.length-1]]);let pv=lo;
    return sc(r,scl,r,r+12).slice(0,8).map(m=>{const ch=T6.includes(m12(m-r))?T6:DM,v=[m];ch.filter(c=>c!==m12(m-r)).forEach(c=>{let p=m-1;while(m12(p-r-c))p--;v.push(p);});
      v.sort((a,b)=>b-a);v[1]-=12;v.sort((a,b)=>a-b);const fr=near(v,set,pv);pv=Math.min(...fr);return tok(set,fr);});};
  const V29=[[0,0,'DGBe',3,['{C}6 и уменьшённый, верхние струны','{C}6 and diminished, top strings']],[2,1,'DGBe',5,['{D}m6 и уменьшённый, верхние струны','{D}m6 and diminished, top strings']],[5,0,'ADGB',3,['{F}6 и уменьшённый, средние струны','{F}6 and diminished, middle strings']],
    [10,0,'DGBe',6,['{Bb}6 и уменьшённый, верхние струны','{Bb}6 and diminished, top strings']],[7,1,'ADGB',3,['{G}m6 и уменьшённый, средние струны','{G}m6 and diminished, middle strings']],[9,1,'DGBe',2,['{A}m6 и уменьшённый, верхние струны','{A}m6 and diminished, top strings']]];
  add('L29',T('Шестой аккорд и уменьшённый','Система Barry Harris: под каждой нотой гаммы — аккорд, шестой или уменьшённый по очереди.','Мелодия идёт вверх по бибоп-гамме, под каждой нотой — drop-2 аккорд: на нотах шестого аккорда — он сам, между ними — уменьшённый. Левая рука меняет форму на каждой ноте.','Уменьшённый аккорд — проходящий: он звучит как напряжение, которое тут же разрешается.',['Четыре аккорда половинками','Октава половинками','Вверх и вниз четвертями','Свинговыми восьмыми','Подъезд на полтона сверху']),
    T('Sixth chord and diminished','The Barry Harris system: a chord under every scale note, sixth and diminished in turn.','The melody climbs the bebop scale with a drop-2 chord under each note: the sixth chord on its own notes, the diminished chord in between. The fretting hand changes shape on every note.','The diminished chord is a passing chord: it sounds like tension that resolves right away.',['Four chords in halves','An octave in halves','Up and down in quarters','In swing eighths','Half-step approach from above']),
    V29.map(([pc,mi,set,lo,nm])=>{const cs=bh(pc,mi,set.split(''),lo),u=ud(cs);
      return {l:nm[0],le:nm[1],lv:[LV(2,cs.slice(0,4).map(c=>c+':4')),LV(2,cs.map(c=>c+':4')),LV(2,u.concat([cs[0]]).map(c=>c+':2')),LV(3,swg(u.concat([cs[0]]))),planAp(cs)]};}));

  // ===== L30: сайд-степпинг аккордов =====
  const XC={'9':['A','ADGB',[0,-1,0,0]],'7#9':['A','ADGB',[0,-1,0,1]],'7b9':['A','ADGB',[0,-1,0,-1]],m9:['A','ADGB',[0,-2,0,0]],maj9:['A','ADGB',[0,-1,1,0]],m11:['A','ADGB',[0,0,0,1]],'69':['A','ADGB',[0,-1,-1,0]],hd:['A','ADGB',[0,1,0,1]],'13':['E','EDGB',[0,0,1,2]],'13a':['A','ADGe',[0,-1,0,2]]};
  const xc=(pc,ty)=>{const [s,st,d]=XC[ty];let f=m12(pc-OP[s]);if(f<2)f+=12;return st.split('').map((x,i)=>x+(f+d[i])).join('+');};
  const XN={'9':'9','7#9':'7♯9','7b9':'7♭9',m9:'m9',maj9:'maj9',m11:'m11','69':'6/9',hd:'m7b5','13':'13','13a':'13'};
  const V30=[[xc(2,'m9'),xc(7,'13'),['{D}m9 → {G}13','{D}m9 → {G}13']],[xc(4,'7#9'),xc(9,'m9'),['{E}7♯9 → {A}m9','{E}7♯9 → {A}m9']],[...d2lead([[5,'maj7'],[2,'m7']],['D','G','B','e'],5),['drop-2: {F}maj7 → {D}m7','drop-2: {F}maj7 → {D}m7']],
    [...quart(2,DOR,[0,1],[0,3,6,9,11],['A','D','G','B','e'],5),['«So What»: {D}m → {E}m','“So What”: {D}m → {E}m']],[xc(9,'13'),xc(2,'13a'),['{A}13 → {D}13','{A}13 → {D}13']],[...tk(prog([[[0,'m7']],[[5,'d7']]],3)).map(x=>x[0]),['шеллы: {C}m7 → {F}7','shells: {C}m7 → {F}7']]];
  add('L30',T('Сайд-степпинг: аккорд на полтона','Подъезд к аккорду той же формой на лад выше или ниже — приём компа и соло.','Форма аккорда сдвигается целиком на лад вверх или вниз и возвращается на место. Сверху, снизу, с двух сторон, потом в ритме чарльстона на двух аккордах.','Пальцы не меняют форму — двигается вся рука. Сдвинутый аккорд короткий, целевой — длинный.',['Цель, сверху, цель','Подъезд сверху на каждую долю','Сверху и снизу','С двух сторон триолями','Два аккорда со сдвигом']),
    T('Side-stepping: a chord a half step away','Approach a chord with the same shape a fret above or below, for comping and soloing.','The whole chord shape moves one fret up or down and comes back. From above, from below, from both sides, then in a Charleston rhythm on two chords.','The fingers keep the shape: the whole hand moves. The shifted chord is short, the target long.',['Target, above, target','Approach from above on each beat','Above and below','From both sides in triplets','Two chords with side-steps']),
    V30.map(([c,c2,nm])=>{const u=shf(c,1),d=shf(c,-1),u2=shf(c2,1),d2=shf(c2,-1);
      return {l:nm[0],le:nm[1],lv:[LV(2,[c+':4',u+':4',c+':8']),LV(2,[u,c+':3',u,c+':3',u,c+':3',u,c+':3']),LV(2,[u,c+':3',d,c+':3',d,c+':3',u,c+':3']),LV(3,[u,d,c+':7',dx(c),'.:2',d,u,c+':7',dx(c),'.:2']),
        LV(3,[u,c+':4',c,'.:6',u2,c2+':4',c2,'.:6',d,c+':4',c,'.:6',d2,c2+':4',c2,'.:6'])]};}));

  // ===== L31: уокинг-бас с аккордами =====
  const bp=p=>{while(p>54)p-=12;while(p<40)p+=12;return p;};
  const bt=p=>{p=bp(p);for(const s of ['E','A','D']){const f=p-OP[s];if(f>=0&&f<=4)return s+f;}return 'Q';};
  const gtGB=(pc,q)=>{const a=pc+Q[q][1],b=pc+Q[q][3];let best=null,bd=99;for(const [x,y] of [[a,b],[b,a]])for(let fg=0;fg<=7;fg++){if(m12(55+fg-x))continue;for(let fb=0;fb<=7;fb++){if(m12(59+fb-y))continue;const d=Math.abs(fg-fb)+Math.abs(fg-3)/2;if(d<bd){bd=d;best='G'+fg+'+B'+fb;}}}return best;};
  const WP=[[0,1,2,-1],[0,'2',1,-1],[0,2,'6',-1],[0,1,2,1]];
  const walk=(bars,pat)=>{const fl=bars.flat(),out=[];let k=0;bars.forEach(b=>b.forEach(([pc,q])=>{const n=fl[(++k)%fl.length][0],r=bp(40+m12(pc-40)),nr=bp(40+m12(n-40)),iv=Q[q],g=gtGB(pc,q);
      const tone=x=>x===-1?bt(nr-1):x===1&&b.length>1?bt(nr-1):x==='2'?bt(r+2):x==='6'?bt(r+iv[3]-1):bt(r+iv[x]);
      const ps=b.length>1?[bt(r),bt(nr-1)]:pat.map((x,i)=>i===3&&x===1?bt(nr+1):tone(x));
      ps.forEach((t,i)=>out.push({t,g:i===0?g:null,gg:g,i,n:ps.length,r:bt(r),f:bt(r+iv[2]),e1:bt(nr+1),e2:bt(nr-1)}));}));return out;};
  const V31=[[[[[7,'m7']],[[0,'d7']],[[5,'maj7']],[[2,'d7']],[[7,'m7']],[[0,'d7']],[[5,'maj7']],[[5,'maj7']]],0,['{F}: ii–V–I–VI, 1-3-5 и подход снизу','{F}: ii–V–I–VI, 1-3-5 and approach from below']],
    [F12.map(b=>b.map(([pc,q])=>[m12(pc+5),q])),1,['блюз в {Bb}: гаммой 1-2-3','blues in {Bb}: scalewise 1-2-3']],
    [[[[9,'m7']],[[2,'m7']],[[9,'m7']],[[9,'m7']],[[2,'m7']],[[2,'m7']],[[9,'m7']],[[9,'m7']],[[5,'d7']],[[4,'d7']],[[9,'m7']],[[4,'d7']]],2,['минорный блюз в {A}m: 1-5 и хроматика','minor blues in {A}m: 1-5 and chromatics']],
    [[[[10,'6'],[7,'d7']],[[0,'m7'],[5,'d7']],[[2,'m7'],[7,'d7']],[[0,'m7'],[5,'d7']]],0,['ритм-чейнджес {Bb}: по два аккорда в такте','rhythm changes in {Bb}: two chords a bar']],
    [[[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[9,'d7']],[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[0,'maj7']]],2,['{C}: ii–V–I–VI, 1-5 и хроматика','{C}: ii–V–I–VI, 1-5 and chromatics']],
    [[[[9,'m7']],[[2,'d7']],[[7,'maj7']],[[4,'d7']],[[9,'m7']],[[2,'d7']],[[7,'maj7']],[[7,'maj7']]],3,['{G}: подход к тонике сверху','{G}: approaching the root from above']]];
  add('L31',T('Уокинг-бас с аккордами','Бас четвертями и аккорды поверх — гитара за весь ансамбль, как у Joe Pass.','Бас в первой позиции на нижних струнах: тоника на первую долю, на четвёртую — подход к следующей тонике. Аккорд — терция и септима на средних струнах. Сначала бас в две доли, потом уокинг, потом с аккордами в свинге.','Бас ровный и негромкий, аккорды короче баса. Пальцы левой руки не отрываются раньше времени.',['Две доли: тоника и квинта','Уокинг четвертями','Аккорд на первую долю','Свинг: аккорд на 1 и «и» 2','Аккорд на 2, энклоужер на 4']),
    T('Walking bass with chords','A walking bass in quarters with chords on top: the guitar as the whole band, like Joe Pass.','The bass in first position on the low strings: the root on beat one, an approach to the next root on beat four. The chord is the third and seventh on the middle strings. First a two-feel bass, then walking, then with chords in swing.','Keep the bass even and soft and the chords shorter than the bass. Do not lift the left-hand fingers too early.',['Two-feel: root and fifth','Walking quarters','Chord on beat one','Swing: chord on 1 and the and of 2','Chord on 2, enclosure on 4']),
    V31.map(([b,pi,nm])=>{const w=walk(b,WP[pi]);
      const l1=w.filter(x=>x.i===0).flatMap(x=>x.n>1?[x.r+':4']:[x.r+':4',x.f+':4']);
      const l2=w.map(x=>x.t+':2'),l3=w.map(x=>(x.g?x.t+'+'+x.g:x.t)+':2');
      const l4=w.flatMap(x=>x.g?[x.t+'+'+x.g+':3']:x.i===1&&x.n===4?[x.t+':2',x.gg]:[x.t+':3']);
      const l5=w.flatMap(x=>x.i===x.n-1?[x.e1+':2',x.e2]:x.i===1?[x.t+'+'+x.gg+':3']:[x.t+':3']);
      return {l:nm[0],le:nm[1],lv:[LV(2,l1),LV(2,l2),LV(2,l3),LV(3,l4),LV(3,l5)]};}));

  // ===== L40: расширенные аккорды =====
  const V40=[[[[2,'m9'],[7,'13'],[0,'maj9'],[0,'69']],['ii9–V13–Imaj9 в {C}','ii9–V13–Imaj9 in {C}']],[[[11,'hd'],[4,'7#9'],[9,'m9'],[9,'m11']],['минорный: iiø–V7♯9–im9 в {A}m','minor: iiø–V7♯9–im9 in {A}m']],
    [[[0,'9'],[0,'13a'],[0,'7b9'],[5,'maj9']],['доминанта {C}: 9 → 13 → 7♭9 → {F}maj9','{C} dominant: 9 → 13 → 7♭9 → {F}maj9']],[[[2,'m11'],[7,'13'],[2,'m11'],[7,'13']],['дорийский вамп {D}m11–{G}13','Dorian vamp {D}m11–{G}13']],
    [[[7,'maj9'],[4,'m9'],[9,'m9'],[2,'13']],['I–vi–ii–V в {G} с расширениями','I–vi–ii–V in {G} with extensions']],[[[2,'hd'],[7,'7b9'],[0,'m9'],[0,'m11']],['минорный ii–V–i в {C}m: 7♭9','minor ii–V–i in {C}m: 7♭9']]];
  add('L40',T('Расширенные аккорды: 9, 11, 13, ♯9, ♭9','Джазовые аккорды с ноной, ундецимой и терцдецимой: хват и смена.','Четырёхзвучные формы с тоникой на 5-й и 6-й струнах. Расширение стоит наверху и ведёт мелодию аккордов. Ритмы компа: целые, половинки, четверти, чарльстон, толчки.','Сначала поставь форму без звука, потом сыграй. Если хват не встаёт целиком — меняй порядок пальцев, а не форму.',['Целыми нотами','Половинками','Четвертями','Чарльстон свингом','Толчки на «и»']),
    T('Extended chords: 9, 11, 13, ♯9, ♭9','Jazz chords with ninths, elevenths and thirteenths: grips and changes.','Four-note shapes with the root on the 5th and 6th strings. The extension sits on top and carries the chord melody. Comping rhythms: whole notes, halves, quarters, the Charleston, pushes.','Set the shape silently first, then play it. If the grip will not land at once, change the finger order, not the shape.',['Whole notes','Half notes','In quarters','Charleston in swing','Pushes on the and']),
    V40.map(([cs,nm])=>{const B=cs.map(([pc,ty])=>[xc(pc,ty)]);return {l:nm[0],le:nm[1],lv:[CW(B),CH(B),CQ(B),CC(B),CA(B)]};}));

  // ===== C32: комп → соло =====
  const arpOf=(x,ap)=>{const iv=Q[x.q],ps=[0,iv[1],iv[2],iv[3],14,iv[3],iv[2],iv[1]].map(i=>at(x.p+i,x.f-1));if(ap!=null)ps[7]=at(ap,x.f-1);return ps;};
  const V32=[[[[[2,'m7']],[[7,'d7']],[[0,'maj7']],[[0,'maj7']]],['ii–V–I в {C}','ii–V–I in {C}']],[[[[9,'hd']],[[2,'d7']],[[7,'m6']],[[7,'m6']]],['минорный ii–V–i в {G}m','minor ii–V–i in {G}m']],
    [[[[10,'maj7']],[[7,'d7']],[[0,'m7']],[[5,'d7']]],['I–VI–ii–V в {Bb}','I–VI–ii–V in {Bb}']],[[[[5,'d7']],[[10,'d7']],[[5,'d7']],[[0,'d7']]],['блюз в {F}: I7–IV7–I7–V7','blues in {F}: I7–IV7–I7–V7']],
    [[[[4,'m7']],[[3,'d7']],[[2,'maj7']],[[2,'maj7']]],['ii–♭II7–I в {D}','ii–♭II7–I in {D}']],[[[[0,'d7']],[[5,'d7']],[[10,'d7']],[[3,'maj7']]],['доминанты по кругу к {Eb}','dominants round the cycle to {Eb}']]];
  add('C32',T('Комп → соло','Переход от аккомпанемента к линии и обратно без потери свинга.','Такт компа (шеллы, чарльстон), такт линии (арпеджио аккорда свингом). Дальше линия заканчивается подходом к следующему аккорду, потом комп и линия делят такт.','Правая рука качает одинаково и в компе, и в линии: меняется только левая.',['Такт компа, такт линии','Четыре такта по очереди','Линия с подходом','Комп и линия в одном такте','Два круга, роли меняются']),
    T('Comping → soloing','Move from comping to a line and back without losing the swing.','A bar of comping (shells, Charleston), a bar of line (the chord arpeggio in swing). Then the line ends with an approach to the next chord, then comping and line share a bar.','The picking hand swings the same way in comping and in the line: only the left hand changes.',['A bar of comping, a bar of line','Four bars in turn','Line with an approach','Comping and line in one bar','Two choruses, roles swap']),
    V32.map(([b,nm])=>{const P=prog(b).map(x=>x[0]),n=i=>P[(i+1)%P.length];
      const cmp=x=>[x.t+':5',x.t,'.:6'],ln=(x,i,ap)=>swg(arpOf(x,ap?n(i).p-1+12*Math.round((x.p+10-n(i).p)/12):null));
      const alt=(o,ap)=>P.flatMap((x,i)=>(i%2===o?cmp(x):ln(x,i,ap)));
      const half=P.flatMap((x,i)=>[x.t+':5',x.t].concat(swg(arpOf(x).slice(0,4))));
      return {l:nm[0],le:nm[1],lv:[LV(3,cmp(P[0]).concat(ln(P[1],1))),LV(3,alt(0)),LV(3,alt(0,1)),LV(3,half),LV(3,alt(0,1).concat(alt(1,1)))]};}));

  // ===== C33: фраза ii–V–I =====
  const V33=[[2,'A',4,'m7',[5,3,4,7,10,14,12,11],'maj','A',['{C}: арпеджио ii от тоники','{C}: ii arpeggio from the root']],[7,'E',2,'m7',[5,3,4,7,10,14,12,11],'maj','B',['{F}: арпеджио ii от терции','{F}: ii arpeggio from the third']],
    [4,'A',6,'hd',[5,3,4,7,10,13,12,11],'min','A',['{D}m: минорный ii–V–i, 7♭9','{D}m: minor ii–V–i, 7♭9']],[0,'A',2,'m7',[5,3,4,7,10,14,12,11],'maj','C',['{Bb}: спуск от ноны ii','{Bb}: descent from the ninth of ii']],
    [9,'E',4,'m7',[6,10,13,16,13,10,6,5],'maj','A',['{G}: ♭II7 над доминантой','{G}: ♭II7 over the dominant']],[11,'E',6,'m7',[10,8,6,4,3,1,0,-1],'maj','B',['{A}: альтерированная над доминантой','{A}: altered over the dominant']]];
  add('C33',T('Фраза ii–V–I','Связная линия через ii–V–I: арпеджио, энклоужер, бибоп-спуск, разрешение в терцию.','Такт ii — арпеджио, такт V — энклоужер в терцию и спуск по бибоп-гамме, такт I — терция тоники. Вариант меняет начало арпеджио, лад над доминантой и тональность.','Последняя нота — терция тоники на сильной доле. Услышь её заранее и веди фразу к ней.',['Такт ii восьмыми','ii и V восьмыми','ii–V–I свингом','С арпеджио тоники','Две позиции подряд']),
    T('ii–V–I phrase','A connected line through ii–V–I: arpeggio, enclosure, bebop descent, resolution to the third.','The ii bar is an arpeggio, the V bar an enclosure into the third and a bebop descent, the I bar the third of the tonic. The variant changes how the arpeggio starts, the scale over the dominant and the key.','The last note is the third of the tonic on a strong beat. Hear it in advance and steer the phrase towards it.',['ii bar in eighths','ii and V in eighths','ii–V–I in swing','With the tonic arpeggio','Two positions in a row']),
    V33.map(([pc,s,lo,q,vb,mo,st,nm])=>{const R=rs(pc,s,1),iv=Q[q];
      const ii={A:[0,iv[1],iv[2],iv[3],14,iv[3],iv[2],iv[1]],B:[iv[1],iv[2],iv[3],14,17,14,iv[3],iv[2]],C:[14,iv[3],iv[2],iv[1],0,iv[1],iv[2],iv[3]]}[st];
      const I=R+10,t3=mo==='maj'?4:3,ia=(mo==='maj'?[4,7,11,14,11,7,4,0]:[3,7,9,14,9,7,3,0]);
      const ph=(L,i5)=>{const f=p=>at(p,L);return {ii:ii.map(x=>f(R+x)),v:vb.map(x=>f(R+5+x)),i:f(I+t3),ia:ia.map(x=>f(I+x))};};
      const a=ph(lo),b=ph(lo+5),full=x=>swg(x.ii.concat(x.v,x.ia));
      return {l:nm[0],le:nm[1],lv:[LV(2,a.ii),LV(2,a.ii.concat(a.v)),LV(3,swg(a.ii.concat(a.v)).concat([a.i+':6','.:6'])),LV(3,full(a)),LV(3,full(a).concat(full(b)))]};}));

  // ===== C34: босса-нова =====
  const grid=(n,ev)=>{const ks=Object.keys(ev).map(Number).sort((a,b)=>a-b),r=[];if(ks[0]!==0)r.push(ks[0]>1?'.:'+ks[0]:'.');ks.forEach((k,i)=>{const e=(i+1<ks.length?ks[i+1]:n)-k;r.push(ev[k].join('+')+(e>1?':'+e:''));});return r;};
  const bossa=(chs)=>{const cs=d2lead(chs,['D','G','B','e'],5);return chs.map(([pc],i)=>{const mn=Math.min(...cs[i].match(/\d+/g).map(Number));let b=null,bd=99;
      for(const s of ['E','A'])for(const f of [m12(pc-OP[s]),m12(pc-OP[s])+12])if(f<=14&&Math.abs(f-mn)<bd){bd=Math.abs(f-mn);b={s,f};}
      const fifth=b.s==='A'?'E'+b.f:'A'+(b.f+2);return {c:cs[i],r:b.s+b.f,v:fifth};});};
  const bar=(x,cst,bas)=>{const ev={};bas.forEach(([k,w])=>{(ev[k]=ev[k]||[]).push(w==='v'?x.v:x.r);});cst.forEach(k=>{(ev[k]=ev[k]||[]).push(x.c);});return grid(8,ev);};
  const V34=[[[[2,'m7'],[7,'d7'],[0,'maj7'],[0,'maj7']],['ii–V–I в {C}','ii–V–I in {C}']],[[[9,'m7'],[2,'m7'],[4,'d7'],[9,'m7']],['минорная: i–iv–V7 в {A}m','minor: i–iv–V7 in {A}m']],
    [[[0,'maj7'],[1,'dim'],[2,'m7'],[7,'d7']],['I–♯I°–ii–V в {C}','I–♯I°–ii–V in {C}']],[[[5,'maj7'],[7,'m7'],[0,'d7'],[5,'maj7']],['I–ii–V–I в {F}','I–ii–V–I in {F}']],
    [[[2,'maj7'],[2,'d7'],[7,'maj7'],[7,'m6']],['I–I7–IV–iv в {D}','I–I7–IV–iv in {D}']],[[[7,'maj7'],[10,'d7'],[3,'maj7'],[2,'d7']],['{G}maj7–{Bb}7–{Eb}maj7–{D}7','{G}maj7–{Bb}7–{Eb}maj7–{D}7']]];
  add('C34',T('Босса-нова','Бразильский аккомпанемент: бас на 1 и 3, синкопированные аккорды сверху.','Бас большим пальцем (или медиатором) на нижних струнах, аккорд drop-2 пальцами на верхних. Ровные восьмые, без свинга. Сначала бас и аккорд на долю, потом рисунок на такт и двухтактовый «партидо алту», на последнем уровне бас тоника–квинта.','Бас — как метроном, ровно и одинаково. Синкопы играет только верх.',['Бас на 1 и 3, аккорд на 1','Аккорд четвертями','Рисунок на один такт','Двухтактовый рисунок','Бас тоника–квинта']),
    T('Bossa nova','Brazilian comping: bass on 1 and 3, syncopated chords on top.','Bass with the thumb (or the pick) on the low strings, a drop-2 chord with the fingers on the top strings. Straight eighths, no swing. First bass and chord on the beat, then a one-bar pattern and the two-bar partido alto; on the last level the bass alternates root and fifth.','The bass is a metronome: even and always the same. Only the top plays the syncopations.',['Bass on 1 and 3, chord on 1','Chords in quarters','One-bar pattern','Two-bar pattern','Root–fifth bass']),
    V34.map(([chs,nm])=>{const X=bossa(chs),B13=[[0,'r'],[4,'r']],B15=[[0,'r'],[4,'v']];
      return {l:nm[0],le:nm[1],lv:[LV(2,X.flatMap(x=>bar(x,[0],B13))),LV(2,X.flatMap(x=>bar(x,[0,2,4,6],B13))),LV(2,X.flatMap(x=>bar(x,[0,3,6],B13))),
        LV(2,X.flatMap(x=>bar(x,[0,3,6],B13).concat(bar(x,[2,5],B13)))),LV(2,X.flatMap(x=>bar(x,[0,3,6],B15).concat(bar(x,[2,5],B15))))]};}));

  // ===== C35: джаз-вальс =====
  const V35=[[[[7,'m7']],[[0,'d7']],[[5,'maj7']],[[5,'maj7']]],[[[6,'hd']],[[11,'d7']],[[4,'m6']],[[4,'m6']]],[[[10,'maj7']],[[7,'d7']],[[0,'m7']],[[5,'d7']]],
    [[[2,'maj7']],[[11,'m7']],[[4,'m7']],[[9,'d7']]],[[[9,'m7']],[[2,'d7']],[[9,'m7']],[[2,'d7']]],[[[0,'maj7']],[[1,'dim']],[[2,'m7']],[[7,'d7']]]];
  const N35=[['ii–V–I в {F}','ii–V–I in {F}'],['минорный ii–V–i в {E}m','minor ii–V–i in {E}m'],['I–VI–ii–V в {Bb}','I–VI–ii–V in {Bb}'],['I–vi–ii–V в {D}','I–vi–ii–V in {D}'],['дорийский вамп {A}m7–{D}7','Dorian vamp {A}m7–{D}7'],['I–♯I°–ii–V в {C}','I–♯I°–ii–V in {C}']];
  add('C35',T('Джаз-вальс','Комп и линия в 3/4, в духе Bill Evans.','Размер 3/4. Аккорд на первую долю, потом на каждую, «ум-па-па» (бас и два аккорда), свинговый толчок на «и» второй доли и чередование такта компа с тактом линии.','В вальсе сильная только первая доля. Вторую и третью играй легче.',['Аккорд на 1','Аккорд на каждую долю','Бас и два аккорда','Свинг: 1 и «и» 2','Такт компа, такт линии']),
    T('Jazz waltz','Comping and lines in 3/4, in the style of Bill Evans.','3/4 time. A chord on beat one, then on every beat, oom-pah-pah (bass and two chords), a swung push on the and of 2, and alternating a bar of comping with a bar of line.','In a waltz only beat one is strong. Play beats two and three lighter.',['Chord on 1','Chord on every beat','Bass and two chords','Swing: 1 and the and of 2','A bar of comping, a bar of line']),
    V35.map((b,i)=>{const P=prog(b).map(x=>x[0]);
      const ln=x=>swg(arpOf(x).slice(0,6));
      return {l:N35[i][0]+', 3/4',le:N35[i][1]+', 3/4',meter:'3/4',lv:[LV(2,P.map(x=>x.t+':6'),6),LV(2,P.flatMap(x=>[x.t+':2',x.t+':2',x.t+':2']),6),LV(2,P.flatMap(x=>[root(x.t)+':2',x.t+':2',x.t+':2']),6),
        LV(3,P.flatMap(x=>[x.t+':5',x.t,'.:3']),9),LV(3,P.flatMap((x,k)=>k%2?ln(x):[x.t+':5',x.t,'.:3']),9)]};}));

  // ===== C36: этюд — четыре фрагмента из упражнений этой части =====
  const ET=[[['A16',0],['A20',2],['L24',0],['A18',4],['арпеджио, энклоужеры, октавы, drop-2','arpeggios, enclosures, octaves, drop 2']],
    [['A19',0],['L27',2],['L40',0],['C33',0],['бибоп-гамма, мордент, расширенные аккорды, фраза ii–V–I','bebop scale, mordent, extended chords, ii–V–I phrase']],
    [['A22',2],['A23',0],['L25',0],['A17',0],['альтерированная, уменьшённая, гайд-тоны, шеллы','altered, diminished, guide tones, shells']],
    [['L28',0],['A38',1],['L30',0],['C32',0],['три ноты на струне, кварты, сайд-степпинг, комп и соло','three notes per string, fourths, side-stepping, comping and soloing']],
    [['L26',1],['L29',0],['A21',0],['L31',0],['растяжки, шестой и уменьшённый, тритоновая замена, уокинг','stretches, sixth and diminished, tritone sub, walking bass']],
    [['C34',0],['L24',3],['A20',0],['C33',2],['босса-нова, октавы, подходы, минорная фраза','bossa nova, octaves, approaches, minor phrase']]];
  add('C36',T('Джазовый этюд','Четыре приёма подряд, как в настоящем соло и аккомпанементе.','Четыре фрагмента подряд. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.','Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов.',['Короткие фрагменты','Фрагменты длиннее','Свинг и больше нот','Фрагменты сложнее','Длинные фрагменты']),
    T('Jazz étude','Four techniques in a row, like a real solo and comping part.','Four fragments in a row. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.','Record a full run on your phone. The weak spot is almost always at the joint between fragments.',['Short fragments','Longer fragments','Swing and more notes','Harder fragments','Long fragments']),
    ET.map((e,i)=>({l:`Этюд ${i+1}: ${e[4][0]}`,le:`Étude ${i+1}: ${e[4][1]}`,lv:[0,1,2,3,4].map(j=>({sub:2,t:e.slice(0,4).map(([id,k])=>{const x=EX[id].v[k].lv[j];return `/${x.sub} `+x.t.join(' | ');})}))})));

  return {EX,EXEN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@JZG2_END@*/

// ----- JZA1: джаз, акустика, часть 1 -----
const JZA1=(function(){
  // сетка такта как у блюзовой акустики: N шагов, события [позиция, токен]; совпавшие позиции — аккорд, пустые шаги продлевают ноту
  const strOf=t=>t.split('+').map(p=>p[0]);
  const merge=(a,b)=>{if(a==='.')return b;if(b==='.')return a;const s=strOf(a);const add=b.split('+').filter(p=>!s.includes(p[0]));return add.length?a+'+'+add.join('+'):a;};
  const bar=(N,ev)=>{const g=Array(N).fill(null);ev.forEach(([i,t])=>{if(t&&i<N)g[i]=g[i]==null?t:merge(g[i],t);});
    const out=[];let cur=null,len=0;const fl=()=>{if(cur!=null)out.push(len>1?cur+':'+len:cur);};
    g.forEach(x=>{if(x==null){if(cur==null){cur='.';len=1;}else len++;}else{fl();cur=x;len=1;}});fl();return out.join(' ');};
  const sys=bs=>bs.join(' | ');
  const by4=bs=>{const o=[];for(let i=0;i<bs.length;i+=4)o.push(sys(bs.slice(i,i+4)));return o.length>1?o:o[0];};
  const md=(a,n)=>((a%n)+n)%n;
  const OP={E:40,A:45,D:50,G:55,B:59,e:64};
  const PC={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,Bb:10,B:11};
  const QI={maj7:[0,4,7,11],'6':[0,4,7,9],m7:[0,3,7,10],m6:[0,3,7,9],'7':[0,4,7,10],m7b5:[0,3,6,10],dim7:[0,3,6,9]};
  const ch=(r,q)=>({p:PC[r],iv:QI[q],nm:'{'+r+'}'+q});
  const fr=t=>+t.replace(/^[A-Za-z][hp]?/,'');
  const tk=(s,f)=>s+f, mid=t=>OP[t[0]]+fr(t);
  // ближайший лад ноты pc на струне s к ладу c в окне [lo, hi]
  const nf=(s,pc,c,lo,hi)=>{let b=null;for(let f=Math.max(0,lo);f<=hi;f++)if(md(OP[s]+f-pc,12)===0&&(b==null||Math.abs(f-c)<Math.abs(b-c)))b=f;return b;};
  // аккорд по шаблону: тоника на струне rs, остальные струны — ступени аккорда (индексы iv) рядом с тоникой
  const TPL={S3:{E:[['D',3],['G',1]],A:[['D',1],['G',3]]},S4:{E:[['D',3],['G',1],['B',2]],A:[['D',2],['G',3],['B',1]]}};
  const vt=(c,rs,rf,kind)=>{const ps=[tk(rs,rf)];TPL[kind][rs].forEach(([s,i])=>{const f=nf(s,md(c.p+c.iv[i],12),rf,rf-4,rf+4);ps.push(tk(s,f));});
    const fs=rs==='E'?'A':'E',ff=nf(fs,md(c.p+c.iv[2],12),rf,rf-2,rf+3);
    return {c,r:ps[0],rf,full:ps.join('+'),up:ps.slice(1).join('+'),f:ff==null?ps[0]:tk(fs,ff)};};
  // голосоведение: из тоники на 6-й и на 5-й струне берётся та, что ближе к позиции pos
  const vp=(cs,pos,kind)=>cs.map(c=>{const fe=nf('E',c.p,pos,1,14),fa=nf('A',c.p,pos,1,14);
    return Math.abs(fe-pos)<=Math.abs(fa-pos)?vt(c,'E',fe,kind):vt(c,'A',fa,kind);});
  // сдвиг аккорда на k ладов (подход на полтона)
  const sh=(t,k)=>t.split('+').map(p=>p[0]+(fr(p)+k)).join('+');
  // drop-2 на четырёх верхних струнах: верхний голос T (midi) — тон аккорда
  const d2=(c,T)=>{const pcs=c.iv.map(i=>md(c.p+i,12));const n=[T];let m=T;for(let k=0;k<3;k++){do m--;while(!pcs.includes(md(m,12)));n.push(m);}
    const v=[n[1]-12,n[3],n[2],n[0]],ss=['D','G','B','e'];const f=v.map((x,i)=>x-OP[ss[i]]);
    return f.some(x=>x<0)?null:{full:ss.map((s,i)=>s+f[i]).join('+'),top:'e'+f[3],lo:Math.min(...f),hi:Math.max(...f)};};
  const tonesOn=(c,s,lo,hi)=>{const o=[];for(let f=Math.max(0,lo);f<=hi;f++)if(c.iv.some(i=>md(OP[s]+f-c.p-i,12)===0))o.push(tk(s,f));return o;};
  // позиция гаммы: ноты pcs на ладах lo…lo+4 от нижней струны к верхней
  const scl=(pcs,lo)=>{const o=[];let last=-1;['E','A','D','G','B','e'].forEach(s=>{for(let f=Math.max(0,lo);f<=lo+4;f++){const m=OP[s]+f;if(pcs.includes(md(m,12))&&m>last){o.push(tk(s,f));last=m;}}});return o;};
  const scale=(r,ivs)=>ivs.map(i=>md(PC[r]+i,12));
  const SW=[0,2,3,5,6,8,9,11], QU=[0,3,6,9];
  const lineBars=(ts,P,N)=>{const o=[];for(let i=0;i<ts.length;i+=P.length)o.push(bar(N,ts.slice(i,i+P.length).map((t,j)=>[P[j],t])));return o;};
  // легато внутри струны: восходящая — хаммер, нисходящая — пулл-офф
  const leg=ts=>ts.map((t,i)=>{const p=ts[i-1];if(!p||p[0]!==t[0]||/[hp]/.test(t[1]))return t;return t[0]+(fr(t)>fr(p)?'h':'p')+t.slice(1);});
  const ghost=t=>t[0]+'x';
  const hits=(N,ps,tok)=>{const ev=[];ps.forEach(p=>{ev.push([p,tok]);if(p+1<N&&!ps.includes(p+1))ev.push([p+1,'.']);});return ev;};
  // ступени: мажор, бибоп и др.
  const SC={maj:[0,2,4,5,7,9,11],bebM:[0,2,4,5,7,8,9,11],bebD:[0,2,4,5,7,9,10,11],dor:[0,2,3,5,7,9,10],mel:[0,2,3,5,7,9,11],dim:[0,1,3,4,6,7,9,10],lyd7:[0,2,4,6,7,9,10],mix:[0,2,4,5,7,9,10]};

  // ===== строители уровней: материал варианта m → 5 табов =====
  const LV={
    B1:m=>{const v3=vp(m.p,m.pos,'S3'),v4=vp(m.p,m.pos,'S4'),B=ev=>bar(8,ev);
      const q=v=>[0,2,4,6].map(i=>[i,v.full]);
      return [sys(v3.map(v=>B([[0,v.full],[4,v.full]]))),sys(v3.map(v=>B(q(v)))),sys(v4.map(v=>B(q(v)))),
        sys(v4.map(v=>B(hits(8,[0,3],v.full)))),
        sys(v4.map((v,i)=>{const n=v4[(i+1)%4];return B([[0,v.full],[2,v.full],[4,v.full],[6,n.full===v.full?v.full:sh(n.full,1)]]);}))];},
    B2:m=>{const P=scl(m.sc,m.lo),k=m.sc.length+1,oc=P.slice(0,k),dn=a=>a.slice().reverse();
      const ud=a=>a.concat(dn(a).slice(1));
      const th=[];for(let i=0;i+2<Math.min(P.length,k+2);i++)th.push(P[i],P[i+2]);
      const fo=[];for(let i=0;i+3<k+1&&i+3<P.length;i++)fo.push(P[i],P[i+1],P[i+2],P[i+3]);
      return [sys(lineBars(ud(oc),QU,12)),sys(lineBars(ud(oc),SW,12)),by4(lineBars(ud(P),SW,12)),
        by4(lineBars(th.concat(dn(oc)),SW,12)),by4(lineBars(leg(fo).concat(leg(dn(oc))),SW,12))];},
    B3:m=>{const pcs=m.c.iv.map(i=>md(m.c.p+i,12));const V=[];
      for(let T=OP.e+m.lo;V.length<5&&T<OP.e+22;T++)if(pcs.includes(md(T,12))){const x=d2(m.c,T);if(x&&(V.length||x.lo>=1))V.push(x.full);}
      const B=ev=>bar(8,ev);const[a,b,c,d,e]=V;
      const arp=v=>v.split('+');
      const ap=(x,y,k)=>[[0,x],[3,sh(y,k)],[4,y],[7,'.']];
      return [sys([B([[0,a],[4,b]]),B([[0,a],[4,b]])]),sys([B([[0,a],[4,b]]),B([[0,c],[4,d]])]),
        sys([B([[0,a],[2,b],[4,c],[6,d]]),B([[0,e],[2,d],[4,c],[6,b]]),B([[0,a]])]),
        sys([a,b,c,d].map(v=>B(arp(v).concat(arp(v).reverse()).map((t,i)=>[i,t])))),
        sys([B(ap(a,b,-1)),B(ap(c,d,-1)),B(ap(e,d,1)),B(ap(c,b,1)),B([[0,a]])])];},
    B4:m=>{const b=m.b||4,N=b,pos=m.pos;
      // мелодия по тонам аккорда на первой струне: шаг вверх (u), вниз (d), на месте (s); новый такт — ближайший тон
      const cand=c=>{const o=[];for(let f=Math.max(1,m.start-3);f<=m.start+5;f++){const T=OP.e+f,x=d2(c,T);if(x&&x.hi-x.lo<=5&&x.lo>=m.start-5&&c.iv.some(i=>md(T-c.p-i,12)===0))o.push({T,x});}return o;};
      let prev=OP.e+m.start;const bars=m.p.map(c=>{const C=cand(c);let j=C.reduce((bi,o,i)=>Math.abs(o.T-prev)<Math.abs(C[bi].T-prev)?i:bi,0);const notes=[C[j]];
        for(const d of m.dir){if(d==='u'&&j<C.length-1)j++;else if(d==='d'&&j>0)j--;notes.push(C[j]);}prev=notes[notes.length-1].T;
        const lo=notes[0].x.lo,hi=notes[0].x.hi;
        let bf=null,bs='A';for(const s of ['E','A']){const f=nf(s,c.p,(lo+hi)>>1,lo-2,hi+1);if(f!=null&&(bf==null||s==='A')){bf=f;bs=s;}}
        return {notes,bass:bf==null?null:tk(bs,bf)};});
      const mk=fn=>sys(bars.map(B=>bar(N,B.notes.map((n,i)=>[i,fn(n,i,B)]))));
      return [mk(n=>n.x.top),mk((n,i,B)=>i===0&&B.bass?n.x.top+'+'+B.bass:n.x.top),mk((n,i)=>i===0?n.x.full:n.x.top),
        mk((n,i)=>i%2===0?n.x.full:n.x.top),mk((n,i,B)=>i===0&&B.bass?n.x.full+'+'+B.bass:n.x.full)];},
    B5:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(12,ev);
      const cut=v=>[0,3,6,9].map(p=>[[p,v.full],[p+1,'.']]).flat();
      const pomp=v=>[[0,v.full],[1,'.'],[2,v.full],[3,v.full],[4,'.'],[6,v.full],[7,'.'],[8,v.full],[9,v.full],[10,'.']];
      const pa=(v,n)=>{const a=n.full===v.full?v.full:sh(n.full,m.ap||1);return [[0,v.full],[1,'.'],[2,v.full],[3,v.full],[4,'.'],[6,v.full],[7,'.'],[8,a],[9,a],[10,'.']];};
      return [sys([B(cut(V[0])),B(cut(V[1]))]),sys(V.map(v=>B(cut(v)))),sys([B(pomp(V[0])),B(pomp(V[1]))]),sys(V.map(v=>B(pomp(v)))),
        sys(V.map((v,i)=>B(pa(v,V[(i+1)%4]))))];},
    R6:m=>{const fl=m.p.flat(),V=vp(fl,m.pos,'S3');let k=0;const bs=m.p.map(x=>Array.isArray(x)?[V[k++],V[k++]]:[V[k],V[k++]]);
      const B=ev=>bar(8,ev);
      const half=([a,b])=>B([[0,a.full],[4,b.full]]),q=([a,b])=>B([[0,a.full],[2,a.full],[4,b.full],[6,b.full]]);
      const st=([a,b])=>B([[0,a.full],[1,'.'],[2,a.full],[3,'.'],[4,b.full],[5,'.'],[6,b.full],[7,'.']]);
      const ap=([a,b],i)=>{const n=bs[(i+1)%bs.length][0],t=n.full===b.full?b.full:sh(n.full,1);return B([[0,a.full],[1,'.'],[2,a.full],[3,'.'],[4,b.full],[5,'.'],[6,t],[7,'.']]);};
      return [sys(bs.slice(0,4).map(half)),sys(bs.slice(0,4).map(q)),by4(bs.map(q)),by4(bs.map(st)),by4(bs.map(ap))];},
    R7:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(12,ev);
      const P=(v,ps)=>B(hits(12,ps,v.full));
      return [sys([P(V[2],m.a),P(V[2],m.a)]),sys([P(V[0],m.a),P(V[1],m.a)]),sys(V.map(v=>P(v,m.a))),
        sys(V.map((v,i)=>P(v,i%2?m.b:m.a))),by4(V.concat(V).map((v,i)=>P(v,i%2?m.b:m.a)))];},
    R8:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(8,ev);
      const bass=v=>[[0,v.r],[4,v.f]];
      const pat=(v,ps)=>bass(v).concat(ps.map(p=>[p,v.up]));
      return [sys([B(bass(V[0])),B(bass(V[1]))]),sys([B(pat(V[0],[0])),B(pat(V[1],[0]))]),sys([B(pat(V[0],m.a)),B(pat(V[1],m.a))]),
        sys(V.map((v,i)=>B(pat(v,i%2?m.b:m.a)))),
        sys(V.map((v,i)=>{const n=V[(i+1)%4],ps=i%2?m.b:m.a;const ev=pat(v,ps);if(!ps.includes(7)&&n.up!==v.up)ev.push([7,sh(n.up,1)]);return B(ev);}))];},
    R9:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(9,ev);
      const ba=(v,i)=>i%2&&m.p[i]===m.p[i-1]?v.f:v.r;
      const w=(v,i)=>[[0,ba(v,i)],[3,v.up],[4,'.'],[6,v.up],[7,'.']];
      const p=(v,i)=>[[0,ba(v,i)]].concat(hits(9,m.a,v.up));
      const ap=(v,i)=>{const n=V[(i+1)%V.length];const e=p(v,i);if(n.r!==v.r)e.push([8,sh(n.r,-1)]);return e;};
      return [sys([B(w(V[0],0)),B(w(V[1],1))]),sys(V.slice(0,4).map((v,i)=>B(w(v,i)))),sys(V.slice(0,4).map((v,i)=>B(p(v,i)))),
        by4(V.map((v,i)=>B(p(v,i)))),by4(V.map((v,i)=>B(ap(v,i))))];},
    R10:m=>{const lo=Math.max(0,m.pos-2),hi=m.pos+4;
      const R=[];for(let f=lo;f<=hi;f++)R.push(OP.E+f,OP.A+f);
      const tok=x=>x-OP.A>=lo&&x-OP.A<=hi&&(x-OP.E>hi||Math.abs(x-OP.A-m.pos)<=Math.abs(x-OP.E-m.pos))?tk('A',x-OP.A):tk('E',x-OP.E);
      const near=(pcf,t)=>R.filter(pcf).reduce((b,x)=>b==null||Math.abs(x-t)<Math.abs(b-t)?x:b,null);
      let prev=OP.A+m.pos;const roots=m.p.map(c=>{const r=near(x=>md(x-c.p,12)===0,prev);prev=r;return r;});
      const walk=m.p.map((c,i)=>{const r=roots[i],nr=roots[(i+1)%roots.length],ct=x=>c.iv.slice(1).some(j=>md(x-c.p-j,12)===0);
        const b2=near(x=>ct(x)&&x!==r,r+3),b3=near(x=>ct(x)&&x!==b2&&x!==r,(b2+nr)>>1);
        const b4=R.includes(nr-1)&&nr-1!==b3?nr-1:R.includes(nr+1)?nr+1:b3;return [r,b2,b3,b4].map(tok);});
      // гайд-тоны: терция и септима на средних струнах около позиции
      const gt=(c,i)=>{const t3=md(c.p+c.iv[1],12),t7=md(c.p+c.iv[3],12),c0=Math.max(1,fr(walk[i][0])+1);
        let s=null,sc=99;for(let a=0;a<=c0+6;a++)for(let b=Math.max(0,a-2);b<=a+2;b++){const pa=md(OP.D+a,12),pb=md(OP.G+b,12);
          if((pa===t3&&pb===t7)||(pa===t7&&pb===t3)){const k=Math.abs(a-c0)+Math.abs(b-c0);if(k<sc){sc=k;s=[a,b];}}}
        return 'D'+s[0]+'+G'+s[1];};
      const B=ev=>bar(12,ev),wq=i=>walk[i].map((t,j)=>[3*j,t]);
      return [sys(walk.slice(0,4).map(w=>B([[0,w[0]],[6,w[2]]]))),sys([0,1,2,3].map(i=>B(wq(i)))),
        sys([0,1,2,3].map(i=>B(wq(i).concat([[0,gt(m.p[i],i)]])))),sys([0,1,2,3].map(i=>B(wq(i).concat([[3,gt(m.p[i],i)],[9,gt(m.p[i],i)]])))),
        by4(m.p.map((c,i)=>B(wq(i).concat([[0,gt(c,i)],[5,gt(c,i)]]))))];},
    R11:m=>{const P=scl(m.sc,m.lo),k=m.sc.length+1,oc=P.slice(0,k),dn=a=>a.slice().reverse(),ud=a=>a.concat(dn(a).slice(1));
      const c=m.arp,ar=P.filter(t=>c.includes(md(mid(t)-PC[m.r],12)));
      const g24=ts=>ts.map((t,i)=>i%4===2?ghost(t):t);
      const gl=ts=>{const o=[];ts.forEach((t,i)=>{o.push(t);if(i<ts.length-1)o.push(ghost(ts[i+1]));});return o;};
      const lin=ar.concat(dn(P).slice(1));
      return [sys(lineBars(ud(oc),QU,12)),sys(lineBars(gl(oc.slice(0,8)),SW,12)),sys(lineBars(g24(ud(oc)),SW,12)),
        by4(lineBars(g24(ud(P)),SW,12)),by4(lineBars(g24(leg(lin)),SW,12))];},
    R12:m=>{const V=vp(m.p,m.pos,'S4'),pts=v=>v.full.split('+');
      const pick=(v,N,alt)=>{const p=pts(v);let o=[];while(o.length<N)o=o.concat(m.o);o=o.slice(0,N);
        return o.map((x,i)=>[i,String(x).split('').map(d=>d==='0'&&alt&&i>=N/2?v.f:p[+d]).join('+')]);};
      return [sys([bar(8,[[0,V[0].full],[4,V[0].full]]),bar(8,[[0,V[1].full],[4,V[1].full]])]),
        sys([bar(8,pick(V[0],8)),bar(8,pick(V[1],8))]),sys(V.map(v=>bar(8,pick(v,8)))),sys(V.map(v=>bar(8,pick(v,8,1)))),
        {t:sys(V.map(v=>bar(12,pick(v,12,1)))),sub:3}];},
    R13:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(12,ev);
      const ans=(v,n)=>{const c=v.c,lo=v.rf-1,hi=v.rf+3,ts=['D','G','B','e'].flatMap(s=>tonesOn(c,s,lo,hi)).sort((a,b)=>mid(a)-mid(b));
        const u=[];ts.forEach(t=>{if(!u.length||mid(u[u.length-1])<mid(t))u.push(t);});return m.down?u.reverse():u;};
      const call=v=>B(hits(12,m.call,v.full));
      const a2=(v)=>{const a=ans(v);return B([[6,a[0]],[9,a[1]]]);},a4=v=>{const a=ans(v);return B(QU.map((p,j)=>[p,a[j]]));};
      const a8=v=>{const a=ans(v).slice(0,5);const s=a.concat(a.slice(0,-1).reverse()).slice(0,8);return B(SW.map((p,j)=>[p,s[j]]));};
      const enc=v=>{const a=ans(v).slice(0,4);const s=[];a.forEach(t=>{const f=fr(t);s.push(f>0?t[0]+(f-1):t,t);});return B(SW.map((p,j)=>[p,s[j]]));};
      return [sys([call(V[0]),a2(V[0])]),sys([call(V[0]),a4(V[0]),call(V[1]),a4(V[1])]),sys([call(V[0]),a8(V[0]),call(V[1]),a8(V[1])]),
        by4(V.flatMap(v=>[call(v),a8(v)])),by4(V.flatMap(v=>[call(v),enc(v)]))];},
    R14:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(12,ev);
      const st=v=>B(hits(12,m.stop,v.full)),fg=v=>B(QU.map(p=>[p,v.full]));
      const P=scl(m.sc,m.lo),q=P.slice(0,4),e8=P.slice(0,8),e16=P.slice(0,9).concat(P.slice(0,8).reverse()).slice(0,16);
      return [sys([st(V[0]),st(V[1])]),sys(V.map(st)),sys([st(V[0]),st(V[1]),B(QU.map((p,j)=>[p,q[j]])),fg(V[0])]),
        sys([st(V[0]),st(V[1]),B(SW.map((p,j)=>[p,e8[j]])),fg(V[0])]),
        [sys(V.map(st)),sys(lineBars(e16,SW,12).concat([fg(V[2]),fg(V[3])]))]];},
    R15:m=>{const V=vp(m.p,m.pos,'S3'),N=m.n,step=m.k;
      // поток ударов с шагом k через тактовые черты; line — тоны аккорда по кругу
      const stream=(vs)=>{let c=0,j=0;return vs.map(v=>{const ev=[];const ar=v.full.split('+');for(let p=md(-c,step);p<N;p+=step){ev.push([p,m.line?ar[j%ar.length]:v.full]);j++;}c=(c+N)%step;return bar(N,ev);});};
      const q=v=>bar(N,[0,1,2,3].map(i=>[i*N/4,v.full]));
      return [sys([q(V[0]),stream([V[0]])[0]]),sys(stream([V[0],V[0]])),sys(stream([V[0],V[0],V[1],V[1]])),sys(stream(V)),
        [sys(stream(V)),sys([q(V[0]),stream([V[1]])[0],q(V[2]),stream([V[3]])[0]])]];},
    R37:m=>{const V=vp(m.p,m.pos,'S4'),B=ev=>bar(12,ev);
      const two=v=>[[0,v.r],[3,v.up],[4,'.'],[6,v.f],[9,v.up],[10,'.']];
      const ap=(v,i)=>{const n=V[(i+1)%V.length];const e=two(v);if(n.r!==v.r)e.push([11,sh(n.r,-1)]);return e;};
      const pu=(v,i)=>ap(v,i).concat([[5,v.up]]);
      return [sys([B(two(V[0])),B(two(V[1]))]),sys(V.slice(0,4).map(v=>B(two(v)))),sys(V.slice(0,4).map((v,i)=>B(ap(v,i)))),
        by4(V.map((v,i)=>B(ap(v,i)))),by4(V.map((v,i)=>B(pu(v,i))))];}
  };

  // ===== материалы вариантов: 6 на упражнение, у каждого свой материал =====
  const c=ch;
  const M={
    B1:[
      {p:[c('D','m7'),c('G','7'),c('C','maj7'),c('C','6')],pos:9,ru:'ii–V–I в {C}, шеллы у 8–10 лада',en:'ii–V–I in {C}, shells at frets 8–10'},
      {p:[c('G','m7'),c('C','7'),c('F','maj7'),c('D','7')],pos:3,ru:'ii–V–I–VI в {F}, низкая позиция',en:'ii–V–I–VI in {F}, low position'},
      {p:[c('B','m7b5'),c('E','7'),c('A','m6'),c('A','m7')],pos:2,ru:'Минорный ii–V–i в {A}m',en:'Minor ii–V–i in {A}m'},
      {p:[c('Bb','maj7'),c('G','7'),c('C','m7'),c('F','7')],pos:3,ru:'I–VI–ii–V в {Bb}',en:'I–VI–ii–V in {Bb}'},
      {p:[c('B','m7'),c('E','7'),c('A','m7'),c('D','7')],pos:6,ru:'iii–VI–ii–V в {G}, цепочка доминант',en:'iii–VI–ii–V in {G}, a chain of dominants'},
      {p:[c('E','m7'),c('Bb','7'),c('D','maj7'),c('B','7')],pos:6,ru:'Тритоновая замена в {D}',en:'Tritone substitution in {D}'}
    ],
    B2:[
      {sc:scale('C',SC.bebM),lo:7,ru:'Мажорная бибоп-гамма {C}',en:'{C} major bebop scale'},
      {sc:scale('G',SC.bebD),lo:2,ru:'Доминантовая бибоп-гамма {G}7',en:'{G}7 dominant bebop scale'},
      {sc:scale('D',SC.dor),lo:4,ru:'Дорийский {D}m: линия над ii',en:'{D} Dorian: a line over ii'},
      {sc:scale('A',SC.mel),lo:4,ru:'Мелодический минор {A}',en:'{A} melodic minor'},
      {sc:scale('G',SC.dim),lo:2,ru:'Уменьшённая гамма полутон–тон над {G}7',en:'Half-whole diminished over {G}7'},
      {sc:scale('F',SC.lyd7),lo:0,ru:'Лидийский доминант {F}7#11, открытая позиция',en:'{F}7#11 Lydian dominant, open position'}
    ],
    B3:[
      {c:c('C','maj7'),lo:0,ru:'Обращения {C}maj7',en:'{C}maj7 inversions'},
      {c:c('G','7'),lo:1,ru:'Обращения {G}7',en:'{G}7 inversions'},
      {c:c('D','m7'),lo:1,ru:'Обращения {D}m7',en:'{D}m7 inversions'},
      {c:c('B','m7b5'),lo:1,ru:'Обращения {B}m7b5',en:'{B}m7b5 inversions'},
      {c:c('C#','dim7'),lo:0,ru:'{C#}dim7: одна форма через три лада',en:'{C#}dim7: one shape every three frets'},
      {c:c('A','m6'),lo:0,ru:'Обращения {A}m6, цыганский минор',en:'{A}m6 inversions, gypsy minor'}
    ],
    B4:[
      {p:[c('D','m7'),c('G','7'),c('C','maj7'),c('A','7')],start:5,dir:'udd',pos:7,ru:'ii–V–I–VI в {C}',en:'ii–V–I–VI in {C}'},
      {p:[c('F','maj7'),c('D','m7'),c('G','m7'),c('C','7')],start:5,dir:'uds',pos:6,ru:'I–vi–ii–V в {F}',en:'I–vi–ii–V in {F}'},
      {p:[c('B','m7b5'),c('E','7'),c('A','m6'),c('A','m6')],start:5,dir:'uud',pos:5,ru:'Минорный ii–V–i в {A}m',en:'Minor ii–V–i in {A}m'},
      {p:[c('Bb','maj7'),c('G','7'),c('C','m7'),c('F','7')],start:6,dir:'sud',pos:6,ru:'I–VI–ii–V в {Bb}, повторы в мелодии',en:'I–VI–ii–V in {Bb}, repeated melody notes'},
      {p:[c('G','maj7'),c('E','m7'),c('A','m7'),c('D','7')],start:7,dir:'ud',b:3,pos:6,meter:'3/4',ru:'Джаз-вальс в {G}',en:'Jazz waltz in {G}'},
      {p:[c('D','m6'),c('E','m7b5'),c('A','7'),c('D','m6')],start:10,dir:'ddu',pos:9,ru:'Минорная баллада в {D}m, высокая позиция',en:'Minor ballad in {D}m, high position'}
    ],
    B5:[
      {p:[c('A','m6'),c('D','m6'),c('E','7'),c('A','m6')],pos:5,ru:'Минорный свинг в {A}m',en:'Minor swing in {A}m'},
      {p:[c('G','6'),c('E','7'),c('A','m7'),c('D','7')],pos:3,ru:'I–VI–ii–V в {G}, мажорные шестые',en:'I–VI–ii–V in {G}, major sixths'},
      {p:[c('D','m6'),c('G','m6'),c('A','7'),c('D','m6')],pos:5,ru:'{D}m: im–ivm–V, подход снизу',en:'{D}m: im–ivm–V, approach from below',ap:-1},
      {p:[c('C','6'),c('C#','dim7'),c('D','m7'),c('G','7')],pos:3,ru:'{C}6 и проходящий уменьшённый',en:'{C}6 and a passing diminished chord'},
      {p:[c('E','m6'),c('A','m6'),c('B','7'),c('E','m6')],pos:7,ru:'{E}m на 7-м ладу',en:'{E}m at the 7th fret'},
      {p:[c('Bb','6'),c('G','7'),c('C','m7'),c('F','7')],pos:6,ru:'Ритм-чейнджес в {Bb}',en:'Rhythm changes in {Bb}'}
    ],
    R6:[
      {p:[c('F','7'),c('Bb','7'),c('F','7'),[c('C','m7'),c('F','7')],c('Bb','7'),c('B','dim7'),c('F','7'),c('D','7')],pos:3,ru:'Джазовый блюз в {F}',en:'Jazz blues in {F}'},
      {p:[[c('Bb','6'),c('G','7')],[c('C','m7'),c('F','7')],[c('Bb','6'),c('G','7')],[c('C','m7'),c('F','7')],[c('F','m7'),c('Bb','7')],[c('Eb','maj7'),c('E','dim7')],[c('Bb','6'),c('G','7')],[c('C','m7'),c('F','7')]],pos:6,ru:'Ритм-чейнджес в {Bb}, два аккорда в такте',en:'Rhythm changes in {Bb}, two chords a bar'},
      {p:[c('C','m7'),c('C','m7'),c('C','m7'),c('C','m7'),c('F','m7'),c('F','m7'),c('C','m7'),c('C','m7')],pos:8,ru:'Минорный блюз в {C}m',en:'Minor blues in {C}m'},
      {p:[[c('A','m7'),c('D','7')],c('G','maj7'),[c('G','m7'),c('C','7')],c('F','maj7'),[c('F','m7'),c('Bb','7')],c('Eb','maj7'),[c('A','m7'),c('D','7')],c('G','maj7')],pos:5,ru:'ii–V вниз по тонам от {G}',en:'ii–V moving down in whole steps from {G}'},
      {p:[c('A','m7'),c('D','7'),c('G','maj7'),c('C','maj7'),c('F#','m7b5'),c('B','7'),c('E','m7'),c('E','m6')],pos:5,ru:'Квинтовый круг в {E}m',en:'Cycle of fifths in {E}m'},
      {p:[c('C','maj7'),c('A','7'),c('D','m7'),c('G','7'),c('E','m7'),c('A','7'),c('D','m7'),c('G','7')],pos:7,ru:'I–VI–ii–V и iii–VI–ii–V в {C}',en:'I–VI–ii–V and iii–VI–ii–V in {C}'}
    ],
    R7:[
      {p:[c('D','m7'),c('G','7'),c('C','maj7'),c('C','6')],pos:8,a:[0,5],b:[3,9],ru:'Чарльстон: 1 и «и» второй доли, {C}',en:'Charleston: 1 and the “and” of 2, {C}'},
      {p:[c('G','m7'),c('C','7'),c('F','maj7'),c('F','6')],pos:3,a:[2,6],b:[0,5],ru:'Обратный чарльстон: «и» первой и 3, {F}',en:'Reverse Charleston: the “and” of 1 and 3, {F}'},
      {p:[c('E','m7b5'),c('A','7'),c('D','m6'),c('D','m7')],pos:5,a:[3,9],b:[5,11],ru:'На 2 и 4, минор {D}m',en:'On 2 and 4, minor {D}m'},
      {p:[c('C','m7'),c('F','7'),c('Bb','maj7'),c('Bb','6')],pos:6,a:[5,11],b:[0,6],ru:'«И» второй и «и» четвёртой, {Bb}',en:'The “and” of 2 and of 4, {Bb}'},
      {p:[c('A','m7'),c('D','7'),c('G','maj7'),c('E','7')],pos:4,a:[0,5,8],b:[2,6],ru:'1, «и» второй, «и» третьей, {G}',en:'1, the “and” of 2, the “and” of 3, {G}'},
      {p:[c('F#','m7b5'),c('B','7'),c('E','m7'),c('E','m6')],pos:7,a:[0,11],b:[3,8],ru:'1 и антиципация на «и» четвёртой, {E}m',en:'1 and an anticipation on the “and” of 4, {E}m'}
    ],
    R8:[
      {p:[c('A','m7'),c('D','7'),c('A','m7'),c('D','7')],pos:5,a:[0,3,6],b:[1,4],ru:'Классический рисунок, {A}m7–{D}7',en:'Classic pattern, {A}m7–{D}7'},
      {p:[c('C','maj7'),c('D','7'),c('D','m7'),c('G','7')],pos:3,a:[0,3,5],b:[2,4,7],ru:'Партидо-алто, {C}maj7–{D}7–{D}m7–{G}7',en:'Partido alto, {C}maj7–{D}7–{D}m7–{G}7'},
      {p:[c('D','m7'),c('G','7'),c('C','maj7'),c('A','7')],pos:6,a:[0,3,6],b:[2,4,6],ru:'Синкопы через такт, ii–V–I–VI в {C}',en:'Syncopation every other bar, ii–V–I–VI in {C}'},
      {p:[c('F','maj7'),c('Bb','7'),c('F','maj7'),c('C','7')],pos:2,a:[1,3,6],b:[0,3,5],ru:'Со смещением на восьмую, {F}',en:'Shifted by an eighth, {F}'},
      {p:[c('E','m7'),c('A','7'),c('D','maj7'),c('B','7')],pos:6,a:[0,2,5],b:[1,4,6],ru:'Самба-рисунок, {D}',en:'Samba pattern, {D}'},
      {p:[c('G','m6'),c('A','7'),c('D','m7'),c('D','m6')],pos:4,a:[0,3,6],b:[1,3,6],ru:'Минорная босса, {D}m',en:'Minor bossa, {D}m'}
    ],
    R9:[
      {p:[c('F','maj7'),c('F','maj7'),c('G','m7'),c('C','7'),c('A','m7'),c('D','7'),c('G','m7'),c('C','7')],pos:3,a:[3,6],ru:'Вальс на 2 и 3, {F}',en:'Waltz on 2 and 3, {F}'},
      {p:[c('D','m7'),c('D','m7'),c('E','m7b5'),c('A','7'),c('D','m6'),c('D','m6'),c('E','m7b5'),c('A','7')],pos:5,a:[5,6],ru:'«И» второй и 3, {D}m',en:'The “and” of 2 and 3, {D}m'},
      {p:[c('Bb','maj7'),c('Bb','maj7'),c('E','m7b5'),c('A','7'),c('D','m7'),c('G','7'),c('C','m7'),c('F','7')],pos:6,a:[3,8],ru:'2 и «и» третьей, {Bb}',en:'2 and the “and” of 3, {Bb}'},
      {p:[c('G','maj7'),c('G','maj7'),c('C','maj7'),c('C','maj7'),c('A','m7'),c('D','7'),c('G','maj7'),c('G','maj7')],pos:4,a:[5],ru:'Одна синкопа на «и» второй, {G}',en:'One push on the “and” of 2, {G}'},
      {p:[c('A','m6'),c('A','m6'),c('D','m6'),c('D','m6'),c('B','m7b5'),c('E','7'),c('A','m6'),c('E','7')],pos:5,a:[3,5,6],ru:'Цыганский вальс, {A}m',en:'Gypsy waltz, {A}m'},
      {p:[c('E','m7'),c('A','7'),c('D','maj7'),c('G','maj7'),c('C#','m7b5'),c('F#','7'),c('B','m7'),c('B','m7')],pos:6,a:[2,6],ru:'«И» первой и 3, круг в {B}m',en:'The “and” of 1 and 3, cycle in {B}m'}
    ],
    R10:[
      {p:[c('F','7'),c('Bb','7'),c('F','7'),c('F','7'),c('Bb','7'),c('Bb','7'),c('F','7'),c('D','7')],pos:3,ru:'Блюз в {F}',en:'Blues in {F}'},
      {p:[c('C','m7'),c('F','7'),c('Bb','maj7'),c('Bb','maj7'),c('C','m7'),c('F','7'),c('Bb','maj7'),c('G','7')],pos:3,ru:'ii–V–I в {Bb}',en:'ii–V–I in {Bb}'},
      {p:[c('A','m7'),c('A','m7'),c('D','m7'),c('D','m7'),c('B','m7b5'),c('E','7'),c('A','m7'),c('E','7')],pos:2,ru:'Минорный блюз в {A}m',en:'Minor blues in {A}m'},
      {p:[c('G','maj7'),c('E','7'),c('A','m7'),c('D','7'),c('B','m7'),c('E','7'),c('A','m7'),c('D','7')],pos:3,ru:'I–VI–ii–V в {G}',en:'I–VI–ii–V in {G}'},
      {p:[c('C','maj7'),c('C','maj7'),c('D','m7'),c('G','7'),c('E','m7'),c('A','7'),c('D','m7'),c('G','7')],pos:3,ru:'Квадрат в {C}',en:'Changes in {C}'},
      {p:[c('E','m7'),c('A','7'),c('D','m7'),c('G','7'),c('C','maj7'),c('F','7'),c('B','m7b5'),c('E','7')],pos:4,ru:'Цепочка ii–V к {A}m',en:'A chain of ii–Vs to {A}m'}
    ],
    R11:[
      {sc:scale('F',SC.maj),lo:0,r:'F',arp:[0,4,7,11],ru:'{F}maj7: арпеджио и гамма, открытая позиция',en:'{F}maj7: arpeggio and scale, open position'},
      {sc:scale('Bb',SC.mix),lo:5,r:'Bb',arp:[0,4,7,10],ru:'{Bb}7 миксолидийский',en:'{Bb}7 Mixolydian'},
      {sc:scale('E',SC.dor),lo:6,r:'E',arp:[0,3,7,10],ru:'{E}m7 дорийский',en:'{E}m7 Dorian'},
      {sc:scale('D',SC.bebD),lo:9,r:'D',arp:[0,4,7,10],ru:'{D}7 бибоп, высокая позиция',en:'{D}7 bebop, high position'},
      {sc:scale('C',SC.mel),lo:7,r:'C',arp:[0,3,7,11],ru:'{C}m(maj7), мелодический минор',en:'{C}m(maj7), melodic minor'},
      {sc:scale('Eb',SC.maj),lo:3,r:'Eb',arp:[0,4,7,11],ru:'{Eb}maj7 в третьей позиции',en:'{Eb}maj7 in third position'}
    ],
    R12:[
      {p:[c('C','maj7'),c('A','m7'),c('D','m7'),c('G','7')],pos:5,o:['0','1','2','3','2','1'],ru:'p-i-m-a-m-i, {C}',en:'p-i-m-a-m-i, {C}'},
      {p:[c('F','maj7'),c('D','7'),c('G','m7'),c('C','7')],pos:3,o:['0','3','2','1'],ru:'p-a-m-i вниз, {F}',en:'p-a-m-i downward, {F}'},
      {p:[c('E','m7'),c('A','7'),c('D','maj7'),c('D','6')],pos:6,o:['03','1','2','1'],ru:'Щипок с басом, {D}',en:'Pinch with the bass, {D}'},
      {p:[c('D','m7'),c('E','m7b5'),c('A','7'),c('D','m6')],pos:5,o:['0','2','1','3'],ru:'Через струну, {D}m',en:'Skipping strings, {D}m'},
      {p:[c('Bb','maj7'),c('G','m7'),c('C','m7'),c('F','7')],pos:6,o:['0','12','3','12'],ru:'Двойные ноты, {Bb}',en:'Double stops, {Bb}'},
      {p:[c('A','m7'),c('F','maj7'),c('B','m7b5'),c('E','7')],pos:5,o:['0','123','1','23'],ru:'Аккорд и перебор, {A}m',en:'Chord and picking, {A}m'}
    ],
    R13:[
      {p:[c('D','m7'),c('G','7'),c('C','maj7'),c('A','7')],pos:7,call:[0,5],ru:'Чарльстон и арпеджио вверх, {C}',en:'Charleston and an arpeggio up, {C}'},
      {p:[c('G','m7'),c('C','7'),c('F','maj7'),c('D','7')],pos:3,call:[3,9],down:1,ru:'Удары на 2 и 4, арпеджио вниз, {F}',en:'Hits on 2 and 4, arpeggio down, {F}'},
      {p:[c('E','m7b5'),c('A','7'),c('D','m6'),c('D','m6')],pos:5,call:[0,11],ru:'Антиципация, минор {D}m',en:'Anticipation, minor {D}m'},
      {p:[c('C','m7'),c('F','7'),c('Bb','maj7'),c('G','7')],pos:6,call:[2,6],down:1,ru:'Обратный чарльстон, ответ вниз, {Bb}',en:'Reverse Charleston, answer down, {Bb}'},
      {p:[c('A','m7'),c('D','7'),c('G','maj7'),c('E','7')],pos:3,call:[0,3,6],ru:'Три четверти и ответ, {G}',en:'Three quarters and an answer, {G}'},
      {p:[c('F#','m7b5'),c('B','7'),c('E','m7'),c('C','7')],pos:7,call:[5,8],down:1,ru:'Синкопы «и», минор {E}m',en:'Offbeat pushes, minor {E}m'}
    ],
    R14:[
      {p:[c('F','7'),c('Bb','7'),c('F','7'),c('C','7')],pos:5,stop:[0],sc:scale('F',SC.bebD),lo:5,ru:'Стоп на 1, блюз в {F}',en:'Stop on 1, blues in {F}'},
      {p:[c('Bb','6'),c('G','7'),c('C','m7'),c('F','7')],pos:6,stop:[0,5],sc:scale('Bb',SC.bebM),lo:5,ru:'Стоп на 1 и «и» второй, {Bb}',en:'Stop on 1 and the “and” of 2, {Bb}'},
      {p:[c('D','m6'),c('A','7'),c('D','m6'),c('A','7')],pos:5,stop:[3],sc:scale('D',SC.mel),lo:5,ru:'Стоп на 2, {D}m',en:'Stop on 2, {D}m'},
      {p:[c('C','6'),c('A','7'),c('D','m7'),c('G','7')],pos:7,stop:[0,9],sc:scale('C',SC.bebM),lo:7,ru:'Стопы на 1 и 4, {C}',en:'Stops on 1 and 4, {C}'},
      {p:[c('G','7'),c('C','7'),c('G','7'),c('D','7')],pos:3,stop:[2],sc:scale('G',SC.bebD),lo:2,ru:'Стоп на «и» первой, блюз в {G}',en:'Stop on the “and” of 1, blues in {G}'},
      {p:[c('A','m6'),c('E','7'),c('A','m6'),c('E','7')],pos:5,stop:[0,3,6],sc:scale('A',SC.mel),lo:4,ru:'Три стопа подряд, {A}m',en:'Three stops in a row, {A}m'}
    ],
    R15:[
      {p:[c('C','maj7'),c('A','m7'),c('D','m7'),c('G','7')],pos:8,n:12,k:2,ru:'Четвертные триоли, {C}',en:'Quarter-note triplets, {C}'},
      {p:[c('F','7'),c('Bb','7'),c('F','7'),c('C','7')],pos:3,n:8,k:3,sub:2,ru:'Пунктирные четверти, {F}',en:'Dotted quarters, {F}'},
      {p:[c('D','m7'),c('G','7'),c('C','maj7'),c('C','6')],pos:7,n:8,k:1,line:1,sub:2,ru:'Арпеджио по три восьмых, {C}',en:'Three-note arpeggios in eighths, {C}'},
      {p:[c('Bb','maj7'),c('G','7'),c('C','m7'),c('F','7')],pos:6,n:12,k:4,ru:'Половинные триоли, {Bb}',en:'Half-note triplets, {Bb}'},
      {p:[c('A','m7'),c('D','7'),c('G','maj7'),c('E','7')],pos:5,n:12,k:3,line:1,ru:'Три ноты на долю, {G}',en:'Three notes per beat, {G}'},
      {p:[c('E','m7'),c('A','7'),c('D','m7'),c('G','7')],pos:6,n:8,k:3,line:1,sub:2,ru:'Арпеджио пунктиром, {D}m–{G}7',en:'Dotted-quarter arpeggio, {D}m–{G}7'}
    ],
    R37:[
      {p:[c('F','7'),c('Bb','7'),c('F','7'),c('F','7'),c('Bb','7'),c('Bb','7'),c('F','7'),c('D','7')],pos:3,ru:'Блюз в {F}',en:'Blues in {F}'},
      {p:[c('Bb','6'),c('G','7'),c('C','m7'),c('F','7'),c('D','m7'),c('G','7'),c('C','m7'),c('F','7')],pos:5,ru:'Ритм-чейнджес в {Bb}',en:'Rhythm changes in {Bb}'},
      {p:[c('D','m6'),c('D','m6'),c('G','m6'),c('G','m6'),c('E','m7b5'),c('A','7'),c('D','m6'),c('A','7')],pos:5,ru:'Минорный блюз в {D}m',en:'Minor blues in {D}m'},
      {p:[c('G','maj7'),c('E','m7'),c('A','m7'),c('D','7'),c('B','m7'),c('E','7'),c('A','m7'),c('D','7')],pos:3,ru:'I–vi–ii–V в {G}',en:'I–vi–ii–V in {G}'},
      {p:[c('C','maj7'),c('C','6'),c('F','maj7'),c('F','m6'),c('E','m7'),c('A','7'),c('D','m7'),c('G','7')],pos:3,ru:'Баллада в {C} с минорной субдоминантой',en:'Ballad in {C} with a minor iv'},
      {p:[c('A','m7'),c('D','7'),c('G','maj7'),c('C','maj7'),c('F#','m7b5'),c('B','7'),c('E','m6'),c('E','m6')],pos:5,ru:'Квинтовый круг в {E}m',en:'Cycle of fifths in {E}m'}
    ]
  };

  // ===== тексты =====
  const T={
    B1:{sub:2,ru:{name:'Шеллы: ii–V–I',goal:'Главный джазовый оборот на трёх- и четырёхзвучных аккордах.',how:'Шелл — тоника, терция и септима, квинты нет. Тоника на шестой струне — порядок 1-7-3, на пятой — 1-3-7. Аккорды сменяются ближайшими формами, рука почти не ездит по грифу. С третьего уровня добавлена четвёртая нота сверху, на пятом — подход аккордом на полтона выше на четвёртой доле.',tip:'Слушай, как септима одного аккорда уходит на полтона в терцию следующего: это и есть голосоведение.',lvl:['Половинные, три струны','Четверти, три струны','Четыре струны','Чарльстон','Подход на полтона сверху']},
      en:{name:'Shells: ii–V–I',goal:'The core jazz progression on three- and four-note chords.',how:'A shell is root, third and seventh, no fifth. Root on the sixth string: 1-7-3; on the fifth: 1-3-7. Each chord moves to the nearest shape, so the hand barely travels. From level 3 a fourth note on top, on level 5 an approach chord a half step above on beat 4.',tip:'Listen to the seventh of one chord falling a half step into the third of the next: that is voice leading.',lvl:['Half notes, three strings','Quarters, three strings','Four strings','Charleston','Half-step approach from above']}},
    B2:{sub:3,ru:{name:'Свинговая восьмая',goal:'Линии джазовых гамм свинговыми восьмыми.',how:'Свинг записан триолями: долгая восьмая — две трети доли, короткая — треть. Пальцы i-m по очереди или большой палец и i. Бибоп-гаммы добавляют хроматическую ноту, чтобы тоны аккорда падали на доли.',tip:'Акцент — на короткую восьмую, долгая звучит мягче. Так свинг и качается.',lvl:['Четверти, октава','Свинг, октава','Свинг, вся позиция','Терции','Четвёрки с легато']},
      en:{name:'Swing eighths',goal:'Jazz scale lines in swung eighths.',how:'Swing is written in triplets: the long eighth is two thirds of the beat, the short one a third. Alternate i-m, or thumb and i. Bebop scales add a chromatic note so the chord tones land on the beats.',tip:'Accent the short eighth; the long one is softer. That is what makes it swing.',lvl:['Quarters, one octave','Swing, one octave','Swing, the whole position','Thirds','Fours with legato']}},
    B3:{sub:2,ru:{name:'Drop-2 обращения',goal:'Четыре обращения септаккорда на четырёх верхних струнах.',how:'Drop-2: в тесном расположении второй сверху голос опущен на октаву. Каждое следующее обращение — верхний голос на следующий тон аккорда. Большой палец, i, m, a — по струне на палец, все вместе щипком.',tip:'Перед сменой ищи палец, который остаётся на месте или сдвигается на лад: он ведёт руку.',lvl:['Два обращения','Четыре обращения','Вверх и вниз','Арпеджио обращений','Подходы на полтона']},
      en:{name:'Drop-2 inversions',goal:'Four inversions of a seventh chord on the top four strings.',how:'Drop 2: the second voice from the top of a close chord is dropped an octave. Each inversion moves the top voice to the next chord tone. Thumb, i, m, a, one finger per string, plucked together.',tip:'Before each change, find the finger that stays put or moves one fret: it guides the hand.',lvl:['Two inversions','Four inversions','Up and down','Arpeggiated inversions','Half-step approaches']}},
    B4:{sub:1,ru:{name:'Аккордовое соло',goal:'Мелодия сверху, аккорд под ней (chord melody).',how:'Мелодия — на первой струне, каждая нота — тон аккорда. Под ней — drop-2 аккорд, в котором эта нота верхняя. Сначала мелодия одна, потом бас на первую долю, потом аккорды под всё большим числом нот.',tip:'Мелодия громче аккорда: безымянный палец щиплет чуть сильнее остальных.',lvl:['Только мелодия','Мелодия и бас','Аккорд на первую долю','Аккорды через долю','Аккорд под каждой нотой']},
      en:{name:'Chord melody',goal:'Melody on top, the chord underneath.',how:'The melody is on the first string, every note a chord tone. Under it sits a drop-2 chord with that note on top. First the melody alone, then a bass note on beat one, then chords under more and more notes.',tip:'The melody is louder than the chord: the ring finger plucks a little harder than the rest.',lvl:['Melody only','Melody and bass','Chord on beat one','Chords on every other beat','A chord under every note']}},
    B5:{sub:3,ru:{name:'Ла пом',goal:'Ритм цыганского джаза: четыре удара в такт, акцент на 2 и 4.',how:'Медиатор или ноготь большого пальца. На 1 и 3 — короткий удар вниз, на 2 и 4 — быстрый взмах вверх перед долей и удар вниз точно на долю. Сразу после удара левая рука ослабляет нажим — точка в табе. Так играли Джанго Рейнхардт и его ритм-гитаристы.',tip:'Удар короткий, как щелчок. Звук гаснет сразу, иначе это просто бой.',lvl:['Короткие четверти','Четыре такта','Ла пом','Ла пом, четыре такта','Подход к следующему аккорду']},
      en:{name:'La pompe',goal:'The gypsy jazz rhythm: four strokes a bar, accent on 2 and 4.',how:'Pick or thumbnail. On 1 and 3 a short downstroke; on 2 and 4 a quick upstroke just before the beat and a downstroke right on it. Release the fretting hand right after each stroke: the dot in the tab. The style of Django Reinhardt and his rhythm players.',tip:'Each stroke is short, like a click. The sound dies at once, or it is just strumming.',lvl:['Short quarters','Four bars','La pompe','La pompe, four bars','Approach to the next chord']}},
    R6:{sub:2,ru:{name:'Фредди Грин',goal:'Четыре на такт: ровные четверти на трёхзвучных аккордах.',how:'Шеллы на средних струнах, удар вниз на каждую долю. Звук короткий и глухой, ближе к барабану, чем к аккорду. Так держал ритм Фредди Грин в оркестре Каунта Бэйси.',tip:'Не громко. Ритм-гитара слышна, когда её выключают.',lvl:['Половинные','Четверти','Восемь тактов','Стаккато','Подход на четвёртой доле']},
      en:{name:'Freddie Green',goal:'Four to the bar: even quarters on three-note chords.',how:'Shells on the middle strings, a downstroke on every beat. Short and dry, closer to a drum than a chord. This is how Freddie Green kept time in the Count Basie Orchestra.',tip:'Not loud. Good rhythm guitar is noticed when it stops.',lvl:['Half notes','Quarter notes','Eight bars','Staccato','Approach on beat 4']}},
    R7:{sub:3,ru:{name:'Ритмы компа',goal:'Аккомпанемент акцентами, как у пианиста.',how:'Короткий аккорд — и тишина до следующего удара. Рисунок задаёт вариант: чарльстон, удары на 2 и 4, синкопы. С четвёртого уровня рисунок чередуется со вторым.',tip:'Комп оставляет место солисту. Чем меньше ударов, тем точнее каждый.',lvl:['Один аккорд','ii–V','ii–V–I','Два рисунка','Восемь тактов']},
      en:{name:'Comping rhythms',goal:'Accompaniment in accents, like a pianist.',how:'A short chord, then silence until the next hit. The variant sets the pattern: Charleston, hits on 2 and 4, pushes. From level 4 it alternates with a second pattern.',tip:'Comping leaves room for the soloist. The fewer the hits, the more exact each one.',lvl:['One chord','ii–V','ii–V–I','Two patterns','Eight bars']}},
    R8:{sub:2,ru:{name:'Босса-нова',goal:'Бас большим пальцем и синкопы пальцами.',how:'Ровные восьмые без свинга. Большой палец — тоника на 1, квинта на 3, без остановки. Пальцы i-m-a щипком играют аккорд по рисунку варианта. Слушай Жуана Жилберту.',tip:'Бас — метроном. Синкопы звучат легко, почти тихо.',lvl:['Только бас','Аккорд на 1','Рисунок','Двухтактовый рисунок','С подходом']},
      en:{name:'Bossa nova',goal:'Thumb bass and fingerpicked syncopation.',how:'Straight eighths, no swing. The thumb plays the root on 1 and the fifth on 3 without stopping. Fingers i-m-a pinch the chord in the variant’s pattern. Listen to João Gilberto.',tip:'The bass is the metronome. The syncopations stay light, almost quiet.',lvl:['Bass only','Chord on 1','The pattern','Two-bar pattern','With an approach']}},
    R9:{sub:3,ru:{name:'Джаз-вальс',goal:'Свинг в 3/4: бас на раз, аккорды отвечают.',how:'Бас большим пальцем на первую долю, аккорд пальцами — по рисунку. Восьмые свингуют. Если аккорд повторяется, во втором такте бас — квинта. На пятом уровне на «и» третьей доли — бас на полтона ниже следующей тоники.',tip:'Считай «раз-два-три» с акцентом на раз: вальс должен кружиться, а не маршировать.',lvl:['Два такта','Четыре такта','Рисунок','Восемь тактов','С подходом в басу']},
      en:{name:'Jazz waltz',goal:'Swing in 3/4: bass on one, chords answer.',how:'The thumb plays the bass on beat one, the fingers play the chord in the pattern. The eighths swing. When a chord repeats, the bass takes the fifth in its second bar. On level 5 the “and” of 3 has a bass note a half step below the next root.',tip:'Count “one-two-three” with the weight on one: a waltz turns, it does not march.',lvl:['Two bars','Four bars','The pattern','Eight bars','With a bass approach']}},
    R10:{sub:3,ru:{name:'Уокинг с аккордами',goal:'Шагающий бас и аккорд сверху на одной гитаре.',how:'Бас большим пальцем на нижних струнах по четвертям: тоника, тон аккорда, ещё тон, затем подход на полтона к следующей тонике. Сверху — терция и септима (гайд-тоны) на средних струнах.',tip:'Бас ровный и связный, гайд-тоны короткие. Сначала уверенно сыграй один бас.',lvl:['Тоники','Уокинг','Гайд-тоны на 1','Гайд-тоны на 2 и 4','Восемь тактов, чарльстон']},
      en:{name:'Walking bass with chords',goal:'A walking bass and a chord on top on one guitar.',how:'The thumb walks quarter notes on the low strings: root, chord tone, another, then a half-step approach to the next root. On top, the third and seventh (guide tones) on the middle strings.',tip:'The bass is even and connected, the guide tones short. Get the bass alone solid first.',lvl:['Roots','Walking','Guide tones on 1','Guide tones on 2 and 4','Eight bars, Charleston']}},
    R11:{sub:3,ru:{name:'Призрачные ноты',goal:'Свинговая фразировка: тихие ноты на доле, акцент на слабой.',how:'Крестик в табе — призрачная нота: палец касается струны без нажима, звучит глухой щелчок. Сначала призрак между нотами, потом он заменяет ноты на 2 и 4. На пятом уровне — арпеджио вверх, гамма вниз, с легато.',tip:'Призрак тише всего остального. Акцент — на нотах после него.',lvl:['Четверти','Нота и призрак','Призраки на 2 и 4','Вся позиция','Арпеджио и легато']},
      en:{name:'Ghost notes',goal:'Swing phrasing: quiet notes on the beat, accents off it.',how:'An x in the tab is a ghost note: the finger touches the string without pressing, giving a dull click. First a ghost between notes, then ghosts replace the notes on 2 and 4. Level 5: arpeggio up, scale down, with legato.',tip:'The ghost is the quietest thing you play. Accent the note after it.',lvl:['Quarters','Note and ghost','Ghosts on 2 and 4','The whole position','Arpeggio and legato']}},
    R12:{sub:2,ru:{name:'Баллада: перебор',goal:'Медленный перебор пальцами по септаккордам.',how:'Большой палец — тоника, пальцы — верхние ноты аккорда в порядке варианта. Аккорд держи весь такт, пусть звучит. На четвёртом уровне во второй половине такта бас — квинта, на пятом — триоли.',tip:'Баллада — это длинные ноты. Не глуши аккорд раньше смены.',lvl:['Аккорд на 1 и 3','Перебор','Четыре аккорда','Переменный бас','Триоли']},
      en:{name:'Ballad picking',goal:'Slow fingerpicking through seventh chords.',how:'The thumb plays the root, the fingers the top of the chord in the variant’s order. Hold the chord for the whole bar and let it ring. Level 4 moves the bass to the fifth in the second half of the bar, level 5 is in triplets.',tip:'A ballad is long notes. Do not cut the chord before the change.',lvl:['Chord on 1 and 3','Picking','Four chords','Alternating bass','Triplets']}},
    R13:{sub:3,ru:{name:'Вызов и ответ',goal:'Такт аккордов, такт одиночных нот.',how:'Вызов — аккорд по рисунку варианта. Ответ — тоны того же аккорда в той же позиции. На пятом уровне к каждому тону — подход на полтона снизу.',tip:'Ответ отвечает на вызов: начни его так, будто договариваешь фразу.',lvl:['Две ноты','Четыре ноты','Свинговые восьмые','Восемь тактов','Подходы на полтона']},
      en:{name:'Call and response',goal:'A bar of chords, a bar of single notes.',how:'The call is the chord in the variant’s rhythm. The answer is the tones of the same chord in the same position. On level 5 each tone is approached from a half step below.',tip:'The answer answers: start it as if you were finishing the sentence.',lvl:['Two notes','Four notes','Swing eighths','Eight bars','Half-step approaches']}},
    R14:{sub:3,ru:{name:'Стоп-тайм и брейк',goal:'Тишина в форме и соло-брейк без аккомпанемента.',how:'Стоп — аккорд по рисунку варианта и тишина до конца такта. Брейк — такт или два одиночных нот, после него снова ритм четвертями. Точка в табе — пауза, глуши струны.',tip:'В тишине счёт не останавливается. Брейк должен вернуть тебя ровно на первую долю.',lvl:['Два стопа','Четыре стопа','Брейк четвертями','Брейк восьмыми','Восемь тактов']},
      en:{name:'Stop-time and break',goal:'Silence inside the form and a solo break with no backing.',how:'A stop is a chord in the variant’s rhythm, then silence to the end of the bar. A break is a bar or two of single notes, then quarter-note rhythm again. A dot in the tab is a rest: mute the strings.',tip:'The count goes on through the silence. The break must land you exactly on beat one.',lvl:['Two stops','Four stops','Break in quarters','Break in eighths','Eight bars']}},
    R15:{sub:3,ru:{name:'Смещения',goal:'Группы по три против четырёх долей.',how:'Удары идут с равным шагом через тактовую черту: четвертные или половинные триоли, пунктирные четверти, арпеджио по три ноты. Первый уровень сравнивает рисунок с ровными четвертями.',tip:'Метроном держит четыре, ты — три. Не подстраивай одно под другое.',lvl:['Против четвертей','Два такта','Смена аккорда','Четыре аккорда','Восемь тактов']},
      en:{name:'Displacement',goal:'Groups of three against four beats.',how:'Hits come at an even step across the bar line: quarter- or half-note triplets, dotted quarters, three-note arpeggios. Level 1 sets the pattern against plain quarters.',tip:'The metronome keeps four, you keep three. Do not bend one to the other.',lvl:['Against quarters','Two bars','A chord change','Four chords','Eight bars']}},
    R37:{sub:3,ru:{name:'В две доли',goal:'Бас на 1 и 3, аккорд на 2 и 4: гитара за пианиста-страйдера.',how:'Большой палец — тоника на 1 и квинта на 3. Пальцы — короткий аккорд на 2 и 4. С третьего уровня на «и» четвёртой — бас на полтона ниже следующей тоники, на пятом — ещё аккорд на «и» второй.',tip:'Бас длинный, аккорд короткий. Между ними и рождается качание.',lvl:['Два такта','Четыре такта','Подход в басу','Восемь тактов','Синкопа на «и» второй']},
      en:{name:'Two-feel',goal:'Bass on 1 and 3, chord on 2 and 4: the guitar plays stride piano.',how:'The thumb plays the root on 1 and the fifth on 3. The fingers play a short chord on 2 and 4. From level 3 the “and” of 4 has a bass note a half step below the next root; level 5 adds a chord on the “and” of 2.',tip:'Long bass, short chord. The swing lives between them.',lvl:['Two bars','Four bars','Bass approach','Eight bars','Push on the “and” of 2']}}
  };
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{const o=T[id];
    EX[id]=Object.assign({},o.ru,{sub:o.sub,v:M[id].map(m=>{const x={};if(m.meter)x.meter=m.meter;if(m.sub)x.sub=m.sub;return BV(m.ru,LV[id](m),x);})});
    EXEN[id]=Object.assign({},o.en,{v:M[id].map(m=>m.en)});
  });
  // разминка без уровней
  const WA=vp([c('C','maj7'),c('A','7'),c('D','m7'),c('G','7')],5,'S4');
  const W2t=sys(WA.map(v=>{const p=v.full.split('+');return bar(8,[p[0],p[1],p[2],p[3],p[2],p[1],p[0],p[1]].map((t,i)=>[i,t]));}));
  Object.assign(EX,{
    W0:{name:'Разминка',goal:'Разогреть руки и пальцы правой руки.',how:'Без гитары минуту: потри ладони до тепла, медленные круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем медленная хроматика в пятой позиции по всем струнам, пальцы правой руки чередуются: i-m.',tip:'На акустике подушечки нагружаются сильнее, чем на электрогитаре: первые минуты играй мягко.',sub:2,v:[{l:'Хроматика в пятой позиции',t:['E5 E6 E7 E8 A5 A6 A7 A8 D5 D6 D7 D8 G5 G6 G7 G8 B5 B6 B7 B8 e5 e6 e7 e8','e8 e7 e6 e5 B8 B7 B6 B5 G8 G7 G6 G5 D8 D7 D6 D5 A8 A7 A6 A5 E8 E7 E6 E5']}]},
    W1:{name:'Мобилизация без гитары',goal:'Разогнать кровь в кистях и предплечьях.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Пошевели каждым пальцем правой руки отдельно.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
    W2:{name:'Перебор септаккордов',goal:'Включить большой палец и пальцы, вспомнить формы аккордов.',how:'{C}maj7, {A}7, {D}m7, {G}7 — четырёхзвучные формы. Большой палец — тоника, i-m-a — верхние ноты. Восьмые, темп заведомо низкий.',tip:'Каждая нота звучит полную длительность, аккорд меняется без паузы.',sub:2,v:[{l:'I–VI–ii–V в {C}',t:[W2t]}]},
    W3:{name:'Хроматические подходы',goal:'Разогреть пальцы левой руки короткими подходами.',how:'Нота на полтона ниже, затем цель — хаммером. Восьмые, темп вполовину рабочего. Четыре пальца по очереди, вверх по струнам.',tip:'Хаммер — с высоты, точно у ладовой пластины.',sub:2,v:[{l:'Подходы снизу в пятой позиции',t:['G4 Gh5 G6 Gh7 B5 Bh6 B7 Bh8 | e4 eh5 e6 eh7 B5 Bh6 B7 Bh8 | G4 Gh5 G6 Gh7 D6 Dh7 D4 Dh5']}]}
  });
  Object.assign(EXEN,{
    W0:{name:'Warm-up',goal:'Warm up both hands and the plucking fingers.',how:'One minute without the guitar: rub your palms until warm, slow wrist and shoulder circles, open and close your fists 20 times. Then slow chromatics in fifth position across all strings, alternating i-m with the picking hand.',tip:'An acoustic is harder on the fingertips than an electric: play gently for the first minutes.',v:['Chromatics in fifth position']},
    W1:{name:'Mobility without the guitar',goal:'Get blood flowing in the hands and forearms.',how:'Rub your palms until warm. Wrist circles both ways, 10 each. Shoulders up, back, down. Open and close your fists 20 times. Move each picking-hand finger on its own.',tip:'No stretching into pain: only warmth and mobility.'},
    W2:{name:'Seventh-chord picking',goal:'Wake up the thumb and fingers and recall the chord shapes.',how:'{C}maj7, {A}7, {D}m7, {G}7 in four-note shapes. The thumb plays the root, i-m-a the top notes. Eighth notes, deliberately slow.',tip:'Every note rings its full length; change chords without a gap.',v:['I–VI–ii–V in {C}']},
    W3:{name:'Chromatic approaches',goal:'Warm up the fretting fingers with short approaches.',how:'A note a half step below, then the target with a hammer-on. Eighth notes at half your working tempo. All four fingers in turn, up across the strings.',tip:'Hammer from a height, right behind the fret.',v:['Approaches from below in fifth position']}
  });
  const tt=x=>Array.isArray(x)?x:typeof x==='string'?[x]:tt(x.t);
  const TESTS=[
    {id:'JAT1',ru:['Фредди Грин','ii–V–I в {C}, шеллы четвертями, держать 30 секунд без сбоя.'],en:['Freddie Green','ii–V–I in {C}, shells in quarter notes, hold 30 seconds without a slip.'],sub:2,t:tt(LV.R6({p:[c('D','m7'),c('G','7'),c('C','maj7'),c('C','maj7')],pos:9})[1])},
    {id:'JAT2',ru:['Бибоп-гамма','Мажорная бибоп-гамма {C}, вверх и вниз по позиции свинговыми восьмыми, два круга.'],en:['Bebop scale','{C} major bebop scale, up and down the position in swing eighths, two loops.'],sub:3,t:tt(LV.B2(M.B2[0])[2])},
    {id:'JAT3',ru:['Ла пом','Минорный свинг в {A}m, ла пом, держать 60 секунд.'],en:['La pompe','Minor swing in {A}m, la pompe, hold 60 seconds.'],sub:3,t:tt(LV.B5(M.B5[0])[3])},
    {id:'JAT4',ru:['Drop-2 обращения','{C}maj7, четыре обращения вверх и вниз, два круга подряд.'],en:['Drop-2 inversions','{C}maj7, four inversions up and down, two loops in a row.'],sub:2,t:tt(LV.B3(M.B3[0])[2])},
    {id:'JAT5',ru:['Уокинг с аккордами','Блюз в {F}: бас четвертями и гайд-тоны на 1, четыре такта подряд без сбоя.'],en:['Walking with chords','Blues in {F}: quarter-note bass and guide tones on 1, four bars in a row without a slip.'],sub:3,t:tt(LV.R10(M.R10[0])[2])}
  ];
  const RIFF={
    ru:['на сильные доли — только тоны аккорда','хотя бы один хроматический подход к тону аккорда','свинговые восьмые с акцентом на слабую','закончить на терции или септиме, не на тонике','одна энклоужер-фигура: нота сверху, нота снизу, цель','рифф строится на шеллах: тоника, терция, септима','хотя бы одна антиципация на «и» четвёртой доли','пауза на первую долю','одна триоль в середине фразы','фраза начинается с «и»','один и тот же аккорд в двух разных обращениях','темп на 20% ниже рабочего, мягкая атака пальцами'],
    en:['only chord tones on the strong beats','at least one chromatic approach to a chord tone','swing eighths with the accent off the beat','end on the third or the seventh, not the root','one enclosure: a note above, a note below, the target','build the riff on shells: root, third, seventh','at least one anticipation on the “and” of 4','a rest on beat one','one triplet in the middle of the phrase','the phrase starts on an “and”','the same chord in two different inversions','tempo 20% below your working tempo, a soft fingerstyle attack']
  };
  return {EX,EXEN,COACH:{W0:{free:60}},TESTS,RIFF};
})();
/*@JZA1_END@*/

// ----- JZA2: джаз, акустика, часть 2 -----
// Табы строятся от высоты (midi): нота ставится в позицию p (лады p…p+3, при нужде p-1…p+4), аккорды — шеллы и drop-2 по формулам.
const JZA2=(()=>{
const J=(...a)=>a.flat(Infinity).filter(x=>x!=null&&x!=='').join(' ');
const SS=['E','A','D','G','B','e'],OP={E:40,A:45,D:50,G:55,B:59,e:64};
const PC={C:0,'C#':1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,G:7,'G#':8,Ab:8,A:9,Bb:10,B:11};
const CT={maj7:[0,4,7,11],7:[0,4,7,10],m7:[0,3,7,10],m7b5:[0,3,6,10],dim7:[0,3,6,9],6:[0,4,7,9],m6:[0,3,7,9],mM7:[0,3,7,11]};
const SUF={mM7:'m(maj7)'};
const md=(n,k)=>((n%k)+k)%k;
// аккорд из строки 'Dm7', 'Bbmaj7', 'C#dim7'
const C=s=>{const m=/^([A-G](?:#|b)?)(maj7|m7b5|mM7|m6|m7|dim7|7|6)$/.exec(s);if(!m)throw Error('JZA2 chord '+s);
  return {r:PC[m[1]],t:m[2],name:'{'+m[1]+'}'+(SUF[m[2]]||m[2]),pcs:CT[m[2]].map(i=>md(PC[m[1]]+i,12))};};
const P=s=>s.split(' ').map(C);
const pn=a=>a.map(c=>c.name).join(' – ');
const W=[[0,3],[-1,4],[-2,5]];
const tryAt=(m,p,nw=3,strs=SS)=>{for(const [a,b] of W.slice(0,nw))for(const s of strs){const f=m-OP[s];if(f>=Math.max(0,p+a)&&f<=p+b)return s+f;}return null;};
const at=(m,p,strs)=>{const t=tryAt(m,p,3,strs);if(!t)throw Error('JZA2 at '+m+'@'+p);return t;};
const mid=t=>{const m=/^([EADGBe])[hp]?(\d+)/.exec(t);return OP[m[1]]+ +m[2];};
// ноты звукоряда pcs в позиции p, снизу вверх
const pos=(pcs,p)=>{const o=[];for(let m=40;m<=90;m++)if(pcs.includes(m%12)){const t=tryAt(m,p,2);if(t)o.push(t);}return o;};
const sc=(r,iv)=>iv.map(i=>md(r+i,12));
// ритм: q — четверти, e8 — восьмые (при sub 2), sw — свинговые восьмые триолями, tr — ровные триоли
const q=a=>a.map(x=>x+':2');
const e8=a=>{const o=a.slice();if(o.length%2)o[o.length-1]+=':2';return J('/2',o);};
const sw=a=>{const o=['/3'];for(let i=0;i<a.length;i+=2)o.push(a[i+1]!=null?a[i]+':2 '+a[i+1]:a[i]+':3');return o.join(' ');};
const tr3=a=>{const o=a.slice();while(o.length%3)o.push('.');return J('/3',o);};
// легато: соседние ноты на одной струне — хаммер вверх, пулл-офф вниз
const leg=a=>a.map((t,i)=>{if(!i||t.includes('+')||a[i-1].includes('+'))return t;const p=/^([EADGBe])[hp]?(\d+)/.exec(a[i-1]),c=/^([EADGBe])(\d+)(.*)$/.exec(t);
  if(!p||!c||p[1]!==c[1]||p[2]===c[2])return t;return c[1]+(+c[2]>+p[2]?'h':'p')+c[2]+c[3];});
const vib=a=>a.slice(0,-1).concat(a[a.length-1]+'~');
const ud=a=>a.concat(a.slice(0,-1).reverse());
const X=t=>t.replace(/\d+/g,'x');
// шелл: тоника на E или A, терция и септима на D и G; у m7b5 и dim7 — ещё квинта/терция на B
const SH={maj7:[4,11],7:[4,10],m7:[3,10],m7b5:[3,10],dim7:[3,9],6:[4,9],m6:[3,9],mM7:[3,11]};
function shellAt(c,f,r){const [t3,t7]=SH[c.t];let o;
  if(f==='E'){o=['E'+r,'D'+(r+t7-10),'G'+(r+t3-3)];if(c.t==='m7b5')o.push('B'+(r-1));if(c.t==='dim7')o=['E'+r,'D'+(r-1),'G'+r,'B'+(r-1)];}
  else{o=['A'+r,'D'+(r+t3-5),'G'+(r+t7-10)];if(c.t==='m7b5'||c.t==='dim7')o=['A'+r,'D'+(r+1),'G'+(r+t7-10),'B'+(r+1)];}
  const fr=o.map(x=>+x.slice(1));if(Math.min(...fr)<0||Math.max(...fr)>15)return null;
  return {b:o[0],top:o.slice(1),all:o.join('+'),f,r,s:o[0][0],fifth:f==='E'?'A'+(r+2):'E'+r};}
function shell(c,p){let best=null;for(const f of ['E','A'])for(const k of [0,12]){const r=md(c.r-(f==='E'?4:9),12)+k,x=shellAt(c,f,r);if(x&&(!best||Math.abs(r-p)<Math.abs(best.r-p)))best=x;}return best;}
// ход аккордов: каждый следующий шелл — ближайший к предыдущему
const comp=(cs,p)=>{let q0=p;return cs.map(c=>{const s=shell(c,q0);q0=Math.round((s.r+p)/2);return s;});};
// drop-2 на четырёх соседних струнах, верхний голос topM
function drop2(c,topM,strs){const cl=[topM];let m=topM;while(cl.length<4){m--;if(c.pcs.includes(md(m,12)))cl.push(m);}
  const v=[cl[1]-12,cl[3],cl[2],cl[0]],fr=v.map((x,i)=>x-OP[strs[i]]);
  if(Math.min(...fr)<1||Math.max(...fr)-Math.min(...fr)>4)return null;return v.map((x,i)=>strs[i]+fr[i]).join('+');}
function inversions(c,strs,lo){const top=OP[strs[3]],o=[];for(let m=top+lo;m<top+17&&o.length<4;m++)if(c.pcs.includes(md(m,12))){const v=drop2(c,m,strs);if(v)o.push(v);else if(o.length)break;}
  if(o.length<4)throw Error('JZA2 drop2 '+c.name);return o;}
// такт из клеток: строка — нота/аккорд, '.' — пауза, '' — продолжение
const cells=a=>{const o=[];a.forEach(x=>{if(x===''&&o.length)o[o.length-1][1]++;else o.push([x===''?'.':x,1]);});return o.map(([t,k])=>k>1?t+':'+k:t).join(' ');};
const plus=(...a)=>a.filter(Boolean).join('+');
const bars=a=>a.join(' | ');
// прямые восьмые → свинг: восьмая e переходит в триольную сетку (чётная — 3e/2, нечётная — на третью триоль доли)
const swc=s=>{let e=0;const T=x=>x%2?1.5*(x-1)+2:1.5*x;return J('/3',s.split(' ').map(t=>{if(t==='|')return t;if(t[0]==='/')return '';const m=/^(.*?)(?::(\d+))?$/.exec(t),k=+(m[2]||1),a=T(e),b=T(e+k);e+=k;return b-a>1?m[1]+':'+(b-a):m[1];}));};
const appr=s=>{const t=/^([EADGBe])(\d+)/.exec(s.b);return t[1]+Math.max(0,+t[2]-1);};

const EX={},EN={};
function add(id,n,sub,ru,en,vs){
  EX[id]=Object.assign({n},ru,{sub,v:vs.map(([l,,lv,x])=>Object.assign({l,lv:lv.map(t=>t&&t.t?Object.assign({},t,{t:[].concat(t.t)}):{t:[].concat(t)})},x||{}))});
  EN[id]=Object.assign({},en,{v:vs.map(x=>x[1])});
}
// уровни линии: 1 — начало четвертями, 2 — вверх-вниз восьмыми, 3 — свинг, 4 — секвенция, 5 — свинг легато
const g4=a=>{const o=[];for(let i=0;i+3<a.length;i++)o.push(a.slice(i,i+4));return o.flat();};
const g3=a=>{const o=[];for(let i=0;i+2<a.length;i++)o.push(a.slice(i,i+3));return o.flat();};
const lineLv=(T,o={})=>{const u=ud(T);return [
  J(q(T.slice(0,8))),e8(u),sw(u),
  o.l4?o.l4(T):(o.g===3?[tr3(g3(T)),tr3(g3(T.slice().reverse()))]:[sw(g4(T)),sw(g4(T.slice().reverse()))]),
  o.l5?o.l5(T):sw(vib(leg(u)))];};

/* A16 арпеджио септаккордов */
const A16V=[['C','maj7',7],['D','m7',4],['G','7',2],['B','m7b5',6],['C#','dim7',3],['A','mM7',4]];
add('A16',16,2,
 {name:'Арпеджио септаккордов',goal:'Знать каждый септаккорд в позиции: все его ноты от нижней струны до верхней.',how:'Только ноты аккорда, по одному пальцу на лад, рука в позиции. Щипок пальцами или медиатором с упором (rest stroke). На третьем уровне — свинговые восьмые: долгая-короткая.',tip:'Пропой аккорд, пока играешь: тоника, терция, квинта, септима. Ориентир — Джо Пасс: арпеджио у него звучит как мелодия.',lvl:['Тоника — октава вверх четвертями','Вся позиция вверх и вниз','Свинговые восьмые','Секвенция по четыре ноты','Свинг легато, вибрато на последней']},
 {name:'Seventh chord arpeggios',goal:'Know every seventh chord in position: all its notes from the low string to the top.',how:'Chord tones only, one finger per fret, the hand stays in position. Fingers or a pick with rest strokes. From level 3: swung eighths, long-short.',tip:'Sing the chord as you play: root, third, fifth, seventh. Think Joe Pass: his arpeggios sound like melodies.',lvl:['Root up an octave in quarters','The whole position up and down','Swung eighths','Four-note sequence','Swing legato, vibrato on the last note']},
 A16V.map(([r,t,p])=>{const c=C(r+t),T=pos(c.pcs,p),i=T.findIndex(x=>mid(x)%12===c.r);return [`${c.name}, позиция ${p}`,`${c.name}, position ${p}`,lineLv(T,{l4:t==='dim7'||t==='m7b5'?null:null}).map((x,k)=>k===0?J(q(T.slice(i,i+5).concat(T.slice(i+1,i+4).reverse()))):x)];}));

/* A17 ii–V–I арпеджио */
function bounce(L,i,dir,n){const o=[];let k=i,d=dir;for(let j=0;j<n;j++){o.push(L[k]);if(k+d<0||k+d>=L.length)d=-d;k+=d;}return o;}
const A17V=[
  {cs:'Dm7 G7 Cmaj7',p:7,m:'up',ru:'ii–V–I в {C}: от тоники вверх',en:'ii–V–I in {C}: up from the root'},
  {cs:'Gm7 C7 Fmaj7',p:5,m:'t3',ru:'ii–V–I в {F}: от терции (3-5-7-9)',en:'ii–V–I in {F}: from the third (3-5-7-9)'},
  {cs:'Em7b5 A7 Dm6',p:4,m:'up',ru:'Минорный ii–V–i в {D}',en:'Minor ii–V–i in {D}'},
  {cs:'Cm7 F7 Bbmaj7',p:5,m:'down',ru:'ii–V–I в {Bb}: от септимы вниз',en:'ii–V–I in {Bb}: down from the seventh'},
  {cs:'Am7 D7 Gmaj7',p:2,m:'near',ru:'ii–V–I в {G}: ближайшая нота, без скачков',en:'ii–V–I in {G}: nearest note, no leaps'},
  {cs:'Dm7 C#7 Cmaj7',p:7,m:'up',ru:'Тритоновая замена: {D}m7 – {C#}7 – {C}maj7',en:'Tritone sub: {D}m7 – {C#}7 – {C}maj7'}];
function a17line(cs,p,m,n){let last=null,dir=1;return cs.map((c,ci)=>{
  const pcs=m==='t3'?c.pcs.slice(1).concat(md(c.r+2,12)):c.pcs,L=pos(pcs,p);let i;
  if(m==='down'){const s7=md(c.r+CT[c.t][3],12);i=L.map(mid).lastIndexOf(L.map(mid).filter(x=>x%12===s7).pop());dir=-1;}
  else if(m==='near'&&last!=null){i=L.reduce((b,x,k)=>Math.abs(mid(x)-last)<Math.abs(mid(L[b])-last)?k:b,0);dir=ci%2?-1:1;if(i===0)dir=1;if(i===L.length-1)dir=-1;}
  else{const st=m==='t3'?md(c.r+CT[c.t][1],12):c.r;i=L.findIndex(x=>mid(x)%12===st);dir=1;}
  const o=bounce(L,i,dir,n);last=mid(o[o.length-1]);return o;});}
const encl=(t,p)=>[at(mid(t)+1,p),at(mid(t)-1,p)];
add('A17',17,2,
 {name:'Арпеджио ii–V–I',goal:'Провести арпеджио через смену аккордов: главный оборот джаза.',how:'По такту на аккорд: ii, V, I. Каждый такт — ноты своего аккорда, рука не уходит из позиции. Слушай, как септима одного аккорда переходит в терцию следующего.',tip:'Если смена рвётся, играй только последнюю ноту такта и первую ноту следующего. Чарли Паркер строил целые соло на этом обороте.',lvl:['Четыре ноты на аккорд четвертями','Восемь нот на аккорд','Свинг','Два аккорда в такте','Свинг, энклоужер в следующий аккорд']},
 {name:'ii–V–I arpeggios',goal:'Carry arpeggios through the changes of jazz’s main progression.',how:'One bar per chord: ii, V, I. Each bar uses its own chord tones and the hand stays in position. Listen to the seventh of one chord moving into the third of the next.',tip:'If the change breaks, play just the last note of the bar and the first note of the next. Charlie Parker built whole solos on this progression.',lvl:['Four notes per chord in quarters','Eight notes per chord','Swing','Two chords per bar','Swing, enclosure into the next chord']},
 A17V.map(v=>{const cs=P(v.cs),f4=a17line(cs,v.p,v.m,4),f8=a17line(cs,v.p,v.m,8),
   l5=f8.map((b,i)=>{const nx=f8[i+1];return nx?b.slice(0,6).concat(encl(nx[0],v.p)):b.slice(0,7).concat(b[7]+'~');});
   return [v.ru,v.en,[J(q(f4.flat())),e8(f8.flat()),sw(f8.flat()),[sw(f4[0].concat(f4[1],f8[2])),sw(f8[2].slice().reverse().concat(f4[0]).concat(f4[1].slice().reverse()))],sw(l5.flat())]];}));

/* A18 шеллы: четыре четверти (Фредди Грин) */
const A18V=[
  ['Dm7 G7 Cmaj7 Cmaj7',5,'ii–V–I в {C}','ii–V–I in {C}'],
  ['Fmaj7 D7 Gm7 C7',3,'I–VI–ii–V в {F}','I–VI–ii–V in {F}'],
  ['Dm7 G7 Cm7 F7',8,'iii–VI–ii–V в {Bb}','iii–VI–ii–V in {Bb}'],
  ['Bm7b5 E7 Am6 Am6',5,'Минорный ii–V–i в {A}','Minor ii–V–i in {A}'],
  ['D7 G7 C7 F7',5,'Доминанты по квартам (бридж «ритм-ченджес»)','Dominants in fourths (rhythm changes bridge)'],
  ['F7 Bb7 Bdim7 F7',3,'Начало джаз-блюза в {F}','Opening of a jazz blues in {F}']];
const fg=s=>[s.all+':2',s.all+':2',s.all+':2',s.all+':2'].join(' ');
add('A18',18,2,
 {name:'Шеллы',goal:'Аккомпанемент в три ноты: тоника, терция, септима — скелет джазовой гармонии.',how:'Тоника на нижней струне, терция и септима на средних. Удар вниз на каждую долю, струна под пальцем глохнет сразу после доли. Квинты нет: она ничего не говорит об аккорде.',tip:'Аккорды короткие и ровные, как шаги контрабаса. Это ритм-гитара Фредди Грина в оркестре Каунта Бэйси.',lvl:['Половинные','Четыре четверти','Чарльстон: раз и «и» второй доли','Два аккорда в такте','Бас на 1 и 3, верх на 2 и 4, подход к следующему басу']},
 {name:'Shell voicings',goal:'Three-note comping: root, third, seventh, the skeleton of jazz harmony.',how:'Root on a low string, third and seventh on the middle strings. A downstroke on every beat, the notes are cut right after the beat. No fifth: it says nothing about the chord.',tip:'Short, even chords, like the steps of an upright bass. This is Freddie Green’s rhythm guitar in the Count Basie band.',lvl:['Half notes','Four quarters','Charleston: one and the “and” of two','Two chords per bar','Bass on 1 and 3, top on 2 and 4, approach to the next bass']},
 A18V.map(([ps,p,ru,en])=>{const cs=P(ps),S=comp(cs,p),nx=i=>S[(i+1)%S.length];
   return [ru+': '+pn(cs.filter((c,i)=>!i||c.name!==cs[i-1].name)),en+': '+pn(cs.filter((c,i)=>!i||c.name!==cs[i-1].name)),[
   bars(S.map(s=>`${s.all}:4 ${s.all}:4`)),bars(S.map(fg)),bars(S.map(s=>`${s.all}:3 ${s.all} .:4`)),
   [J(S[0].all+':2',S[0].all+':2',S[1].all+':2',S[1].all+':2','|',S[2].all+':2',S[2].all+':2',S[3].all+':2',S[3].all+':2'),J(S[2].all+':2',S[2].all+':2',S[1].all+':2',S[1].all+':2','|',S[0].all+':2',S[0].all+':2',S[0].all+':4')],
   bars(S.map((s,i)=>`${s.b}:2 ${s.top.join('+')}:2 ${appr(nx(i))}:2 ${s.top.join('+')}:2`))]];}));

/* A19 drop-2 */
const A19V=[['Cmaj7','DGBe',3,'{C}maj7: четыре обращения на верхних струнах','{C}maj7: four inversions on the top strings'],
  ['Dm7','DGBe',1,'{D}m7: обращения на верхних струнах','{D}m7: inversions on the top strings'],
  ['G7','ADGB',1,'{G}7: обращения на средних струнах','{G}7: inversions on the middle strings'],
  ['Bm7b5','DGBe',1,'{B}m7b5: полууменьшённый','{B}m7b5: half-diminished'],
  ['F6','ADGB',1,'{F}6: секстаккорд на средних струнах','{F}6: sixth chord on the middle strings'],
  ['C#dim7','DGBe',1,'{C#}dim7: одна форма через три лада','{C#}dim7: one shape every three frets']];
add('A19',19,2,
 {name:'Drop-2 аккорды',goal:'Четыре голоса на соседних струнах и все обращения аккорда по грифу.',how:'Аккорд в тесном расположении, второй сверху голос опущен на октаву — получается удобная форма на четырёх соседних струнах. Обращения идут вверх по грифу: верхняя нота — следующая нота аккорда.',tip:'Ставь форму целиком, а не по пальцу. Верхний голос — мелодия: слушай его отдельно. Так играют Уэс Монтгомери и Джим Холл.',lvl:['Два обращения половинными','Четыре обращения вверх','Вверх и вниз четвертями','Каждое обращение арпеджио, потом аккорд','Подход к каждому обращению с лада ниже']},
 {name:'Drop-2 voicings',goal:'Four voices on adjacent strings and every inversion up the neck.',how:'A close-position chord with the second voice from the top dropped an octave: a playable shape on four adjacent strings. Inversions move up the neck, each top note the next chord tone.',tip:'Place the whole shape at once, not finger by finger. The top voice is the melody: listen to it on its own. Wes Montgomery and Jim Hall play like this.',lvl:['Two inversions in half notes','Four inversions up','Up and down in quarters','Each inversion arpeggiated, then the chord','Approach every inversion from a fret below']},
 A19V.map(([cn,strs,lo,ru,en])=>{const c=C(cn),I=inversions(c,strs.replace('e','e').split(''),lo),dn=x=>x.replace(/\d+/g,d=>d-1);
   return [ru,en,[J(I[0]+':4',I[1]+':4','|',I[1]+':4',I[0]+':4'),J(I.map(x=>x+':4')),J(q(ud(I)),I[0]+':2'),
   I.map(x=>J(x.split('+'),x+':4')),J(I.map(x=>`${dn(x)} ${x}:3`))]];}));

/* A20 босса-нова пальцами */
const BP=[[[2,5],[1,4,6]],[[1,3,6],[1,4,7]],[[0,3,6],[2,5]]];
const A20V=[['Am7 D7',0,'{A}m7 – {D}7, рисунок 1','{A}m7 – {D}7, pattern 1'],['Dm7 G7 Cmaj7 Cmaj7',1,'ii–V–I в {C}, рисунок 2','ii–V–I in {C}, pattern 2'],
  ['Fmaj7 Gm7 Am7 Gm7',2,'{F}maj7 – {G}m7 – {A}m7, рисунок 3','{F}maj7 – {G}m7 – {A}m7, pattern 3'],['Cmaj7 C#dim7 Dm7 G7',0,'Уменьшённый проходящий, рисунок 1','Passing diminished, pattern 1'],
  ['Am6 E7',1,'Минорная босса: {A}m6 – {E}7, рисунок 2','Minor bossa: {A}m6 – {E}7, pattern 2'],['Ebmaj7 Ab7 Dm7 G7',2,'{Eb}maj7 – {Ab}7 – {D}m7 – {G}7, рисунок 3','{Eb}maj7 – {Ab}7 – {D}m7 – {G}7, pattern 3']];
function bossa(S,pt,mode){return S.map((s,i)=>{const a=Array(8).fill(''),top=s.top.join('+'),nx=S[(i+1)%S.length];
  const ch=mode==='24'?[2,6]:pt[i%2];
  a[0]=s.b;if(mode!=='bass1')a[4]=s.fifth;
  ch.forEach(k=>{a[k]=plus(k===0?s.b:k===4?s.fifth:'',top);});
  if(mode==='walk'){a[7]=plus(appr(nx),ch.includes(7)?top:'');}
  return cells(a);});}
add('A20',20,2,
 {name:'Босса-нова пальцами',goal:'Бас большим пальцем на 1 и 3, аккорд пальцами в синкопах.',how:'Большой палец играет тонику на раз и квинту на три, ровно, как сурдо. Указательный, средний и безымянный щиплют верх аккорда одновременно, в рисунке из двух тактов. Рисунок варианта — свой порядок синкоп.',tip:'Бас не подстраивается под аккорды: он — метроном. Сначала проговори рисунок слогами. Ориентир — Жуан Жилберту.',lvl:['Только бас: тоника и квинта','Бас и аккорд на 2 и 4','Рисунок на одном аккорде','Рисунок по всей гармонии','Хроматический подход басом в следующий аккорд']},
 {name:'Bossa nova fingerstyle',goal:'Thumb bass on 1 and 3, chord with the fingers in syncopation.',how:'The thumb plays the root on one and the fifth on three, steady like a surdo. Index, middle and ring pluck the top of the chord together in a two-bar pattern. Each variant has its own order of syncopations.',tip:'The bass never adjusts to the chords: it is the metronome. Say the pattern in syllables first. Think João Gilberto.',lvl:['Bass only: root and fifth','Bass and chord on 2 and 4','The pattern on one chord','The pattern through the changes','Chromatic bass approach into the next chord']},
 A20V.map(([ps,pi,ru,en])=>{const cs=P(ps),S=comp(cs,5),pt=BP[pi];return [ru,en,[
   bars(S.map(s=>`${s.b}:4 ${s.fifth}:4`)),bars(bossa(S,pt,'24')),bars(bossa([S[0],S[0]],pt)),bars(bossa(S,pt)),bars(bossa(S,pt,'walk'))]];}));

/* A21 джаз-вальс пальцами */
const WF=[[[0,'b'],[2,'c'],[4,'c']],[[0,'b'],[3,'c'],[5,'c']],[[0,'b'],[2,'t0'],[3,'t1'],[4,'t0'],[5,'t1']],[[0,'b'],[2,'c'],[4,'f']],[[0,'bc'],[4,'c']],[[0,'b'],[1,'t1'],[2,'c'],[5,'c']]];
const A21V=[['Cmaj7 Am7 Dm7 G7',0,'{C}: бас и аккорд на 2 и 3','{C}: bass, chord on 2 and 3'],['Fmaj7 Dm7 Gm7 C7',1,'{F}: аккорд на «и» второй и третьей доли','{F}: chord on the “and” of 2 and 3'],
  ['Em7b5 A7 Dm6 Dm6',2,'{D}m: арпеджио по верхним голосам','{D}m: arpeggio on the top voices'],['Cm7 F7 Bbmaj7 Gm7',3,'{Bb}: бас на 1 и 3','{Bb}: bass on 1 and 3'],
  ['Gmaj7 E7 Am7 D7',4,'{G}: щипок на раз, аккорд на 3','{G}: pinch on one, chord on 3'],['Am6 Bm7b5 E7 Am6',5,'{A}m: подхват верхнего голоса','{A}m: top-voice pickup']];
function waltz(S,f,mode){return S.map((s,i)=>{const a=Array(6).fill(''),top=s.top.join('+'),nx=S[(i+1)%S.length],bb=mode==='5'&&i%2?s.fifth:s.b;
  WF[f].forEach(([k,w])=>{a[k]=w==='b'?bb:w==='c'?top:w==='bc'?plus(bb,top):w==='f'?plus(s.fifth,top):s.top[w==='t0'?0:1];});
  if(mode==='walk')a[5]=plus(appr(nx),a[5]);
  return cells(a);});}
add('A21',21,2,
 {name:'Джаз-вальс пальцами',goal:'Счёт на три: бас на раз, аккорд отвечает.',how:'Размер 3/4. Большой палец — тоника на первую долю, пальцы — верх шелла по рисунку варианта. Сильная доля одна, вальс не должен превращаться в марш.',tip:'Считай «раз-два-три» с ударением на раз. Послушай джаз-вальсы Билла Эванса.',lvl:['Только бас на раз','Рисунок на двух аккордах','Рисунок по всей гармонии','Квинта в басу каждого второго такта','Хроматический подход басом']},
 {name:'Jazz waltz fingerstyle',goal:'Counting in three: bass on one, the chord answers.',how:'3/4 time. The thumb plays the root on beat one, the fingers play the top of the shell in the variant’s pattern. There is one strong beat: a waltz must not turn into a march.',tip:'Count “one-two-three” with the stress on one. Listen to Bill Evans’ jazz waltzes.',lvl:['Bass only on one','The pattern on two chords','The pattern through the changes','Fifth in the bass every other bar','Chromatic bass approach']},
 A21V.map(([ps,f,ru,en])=>{const cs=P(ps),S=comp(cs,5);return [ru,en,[bars(S.map(s=>s.b+':6')),bars(waltz(S.slice(0,2),f)),bars(waltz(S,f)),bars(waltz(S,f,'5')),bars(waltz(S,f,'walk'))],{meter:'3/4'}];}));

/* A22 ла помп */
const A22V=[['Am6 Am6 Dm6 E7','Минорный свинг: {A}m6 – {D}m6 – {E}7','Minor swing: {A}m6 – {D}m6 – {E}7'],['G6 E7 A7 D7','{G}6 – {E}7 – {A}7 – {D}7','{G}6 – {E}7 – {A}7 – {D}7'],
  ['Dm6 Dm6 A7 A7','{D}m6 – {A}7','{D}m6 – {A}7'],['C6 C#dim7 Dm7 G7','Уменьшённый проходящий в {C}','Passing diminished in {C}'],
  ['Gm6 Gm6 D7 D7','{G}m6 – {D}7','{G}m6 – {D}7'],['Bm7b5 E7 Am6 Am6','Минорный ii–V–i в {A}','Minor ii–V–i in {A}']];
const pmp=(s,g,beats)=>{const o=[];for(let b=0;b<beats;b++)o.push(b%2?[s.all,'','.']:[s.all,'.',g?X(s.all):'']);return o.flat();};
add('A22',22,2,
 {name:'Ла помп',goal:'Цыганский аккомпанемент: короткий удар на 1 и 3, акцент на 2 и 4.',how:'Все удары вниз. На 1 и 3 аккорд сразу глушится, на 2 и 4 — звучит дольше и громче. С третьего уровня перед 2 и 4 — быстрый глухой удар вверх, левая рука ослабляет нажим.',tip:'Кисть свободная, акцент — весом руки, а не силой. Ориентир — ритм-гитара в квинтете Джанго Рейнхардта.',lvl:['Четыре удара вниз','Ла помп: коротко-долго','Глухой удар перед 2 и 4','Два аккорда в такте','Басовый подход на четвёртой доле']},
 {name:'La pompe',goal:'Gypsy jazz comping: a short hit on 1 and 3, an accent on 2 and 4.',how:'All downstrokes. On 1 and 3 the chord is cut at once, on 2 and 4 it rings longer and louder. From level 3 a quick muted upstroke comes before 2 and 4 while the fretting hand eases off.',tip:'Keep the wrist loose: the accent comes from the weight of the arm, not force. Think the rhythm guitar in Django Reinhardt’s quintet.',lvl:['Four downstrokes','La pompe: short-long','Muted stroke before 2 and 4','Two chords per bar','Bass approach on beat four']},
 A22V.map(([ps,ru,en])=>{const cs=P(ps),S=comp(cs,5);return [ru,en,[
   bars(S.map(s=>J(Array(4).fill(s.all+':3')))),J('/3',bars(S.map(s=>cells(pmp(s,0,4))))),J('/3',bars(S.map(s=>cells(pmp(s,1,4))))),
   J('/3',cells(pmp(S[0],1,2).concat(pmp(S[1],1,2))),'|',cells(pmp(S[2],1,2).concat(pmp(S[3],1,2)))),
   J('/3',bars(S.map((s,i)=>cells(pmp(s,1,3).concat([appr(S[(i+1)%4]),'','.'])))))]];}));

/* A23 цыганские арпеджио */
const A23V=[['Am6',4,'m6','{A}m6 в позиции 4','{A}m6 in position 4'],['C#dim7',2,'shift','{C#}dim7: форма сдвигается на три лада','{C#}dim7: the shape moves by three frets'],
  ['Dm6',9,'appr','{D}m6 с подходом снизу','{D}m6 with an approach from below'],['G#dim7',4,'e7','{E}7(b9): уменьшённый от терции','{E}7(b9): diminished from the third'],
  ['Gm6',2,'two','{G}m6 через две позиции','{G}m6 across two positions'],['Dm6',4,'pair','{D}m6 – {C#}dim7 – {D}m6','{D}m6 – {C#}dim7 – {D}m6']];
add('A23',23,2,
 {name:'Цыганские арпеджио',goal:'Минорный секстаккорд и уменьшённый: словарь цыганского джаза.',how:'Арпеджио m6 и dim7 медиатором с упором или пальцами. В цыганском джазе вместо m7 играют m6, а над доминантой — уменьшённый от её терции. Вариант задаёт фигуру: позиция, сдвиг, подход, пара аккордов.',tip:'Каждая нота — отдельный удар, громко и коротко. Джанго играл двумя пальцами, поэтому его арпеджио идут по две ноты на струну.',lvl:['Тоника — октава вверх четвертями','Вверх и вниз','Свинг','Тройки триолями','Свинг легато, вибрато в конце']},
 {name:'Gypsy arpeggios',goal:'The minor sixth and diminished chords: the vocabulary of gypsy jazz.',how:'m6 and dim7 arpeggios with rest strokes or fingers. Gypsy jazz uses m6 instead of m7 and, over a dominant, the diminished chord from its third. The variant sets the figure: position, shift, approach, a pair of chords.',tip:'Every note is its own stroke, loud and short. Django played with two fingers, so his arpeggios go two notes per string.',lvl:['Root up an octave in quarters','Up and down','Swing','Groups of three in triplets','Swing legato, vibrato at the end']},
 A23V.map(([cn,p,m,ru,en])=>{const c=C(cn);let T;
   if(m==='shift'){const b=pos(c.pcs,p).slice(0,4);T=[0,3,6,9].flatMap(k=>b.map(x=>x[0]+(+x.slice(1)+k)));}
   else if(m==='two'){const a=pos(c.pcs,p),hi=mid(a[a.length-1]);T=a.concat(pos(c.pcs,p+7).filter(x=>mid(x)>hi));}
   else if(m==='pair'){const d=C('C#dim7');T=pos(c.pcs,p).slice(2,6).concat(pos(d.pcs,p).slice(3,7),pos(c.pcs,p).slice(4,8));}
   else if(m==='appr'){T=pos(c.pcs,p).flatMap(x=>[at(mid(x)-1,p),x]);}
   else T=pos(c.pcs,p);
   const i=Math.max(0,T.findIndex(x=>mid(x)%12===c.r));
   return [ru,en,lineLv(T,{g:3}).map((x,k)=>k===0?J(q(T.slice(i,i+8))):x)];}));

/* A38 энклоужеры */
const A38V=[['Cmaj7',7,[2,-1],'Сверху по гамме, снизу хроматически: {C}maj7','Scale step above, chromatic below: {C}maj7'],
  ['Fmaj7',5,[-1,2],'Снизу хроматически, сверху по гамме: {F}maj7','Chromatic below, scale step above: {F}maj7'],
  ['G7',2,[2,1],'Два хроматических сверху: {G}7','Two chromatic notes from above: {G}7'],
  ['Dm7',4,[1,-1],'Полутон сверху и снизу: {D}m7','Half step above and below: {D}m7'],
  ['Am7',4,[2,1,-1],'Три ноты: сверху, хроматика, снизу: {A}m7','Three notes: above, chromatic, below: {A}m7'],
  ['Bbmaj7',5,[-2,-1],'Два хроматических снизу: {Bb}maj7','Two chromatic notes from below: {Bb}maj7']];
add('A38',38,2,
 {name:'Энклоужеры',goal:'Окружить ноту аккорда соседями и попасть в неё точно на долю.',how:'Перед целевой нотой — одна-три ноты вокруг неё: сверху, снизу, хроматически. Цель — нота аккорда, она всегда на сильной доле. Вариант задаёт тип окружения.',tip:'Целевая нота громче окружения. Это главный приём бибопа: послушай Чарли Паркера и Бадди Де Франко, на гитаре — Пэта Мартино.',lvl:['Подход снизу и цель','Полное окружение и цель','Свинг: окружение, цель, следующая нота','Цели вверх и вниз','Свинг легато, вибрато на последней цели']},
 {name:'Enclosures',goal:'Surround a chord tone with its neighbours and land on it right on the beat.',how:'Before the target note come one to three notes around it: above, below, chromatic. The target is a chord tone and always falls on a strong beat. The variant sets the kind of enclosure.',tip:'The target is louder than the notes around it. The core bebop device: listen to Charlie Parker and Buddy DeFranco, on guitar to Pat Martino.',lvl:['Approach from below and target','Full enclosure and target','Swing: enclosure, target, next note','Targets up and down','Swing legato, vibrato on the last target']},
 A38V.map(([cn,p,e,ru,en])=>{const c=C(cn),L=pos(c.pcs,p),i=L.findIndex(x=>mid(x)%12===c.r),tg=L.slice(i,i+4),tgd=L.slice(i,i+5).reverse(),
   en1=t=>e.map(d=>at(mid(t)+d,p)),g=(ts,nx)=>ts.flatMap((t,k)=>{const o=en1(t).concat(t);return nx&&e.length===2?o.concat(L[L.indexOf(t)+1]||t):o;});
   return [ru,en,[J(tg.map(t=>`${at(mid(t)-1,p)} ${t}:3`)),J('/2',tg.map(t=>J(en1(t),t+':'+(e.length===2?2:1)))),sw(g(tg,1)),sw(g(tg.concat(tgd.slice(1)))),sw(vib(leg(g(tg.concat(tgd.slice(1))))))]];}));

/* A39 аккордовое соло */
const A39V=[['Dm7 G7 Cmaj7 A7','bass','Мелодия и бас: ii–V–I в {C}','Melody and bass: ii–V–I in {C}'],
  ['Gm7 C7 Fmaj7 D7','shell','Шелл под мелодией: ii–V–I в {F}','Shell under the melody: ii–V–I in {F}'],
  ['Cm7 F7 Bbmaj7 G7','fill','Аккорд на раз, мелодия между: {Bb}','Chord on one, melody in between: {Bb}'],
  ['Am7 D7 Gmaj7 E7','every','Аккорд под каждой нотой: {G}','A chord under every note: {G}'],
  ['Em7b5 A7 Dm6 Dm6','24','Мелодия и бас на 2 и 4: {D}m','Melody, bass on 2 and 4: {D}m'],
  ['Fmaj7 Fm6 Cmaj7 A7','walk','Мелодия над ходом баса: {C}','Melody over a bass line: {C}']];
const mel=(c,s,n)=>{const r=mel0(c,s,n);if(r.length<n||r.includes(undefined))throw Error('JZA2 mel '+c.name);return r;};
const mel0=(c,s,n)=>{const o=[];for(let m=59;m<=84;m++)if(c.pcs.concat(md(c.r+2,12)).includes(m%12)){const t=tryAt(m,s.r+1,2,['B','e']);if(t)o.push(t);}return o.slice(-n-1).slice(0,n).reverse();};
function a39bar(c,s,ty,lv){const M=mel(c,s,4),top=s.top.slice(0,2).join('+'),b=s.b;
  if(lv===1)return `${plus(b,M[0])}:4 ${plus(b,M[1])}:4`;
  if(ty==='bass')return lv===2?`${plus(b,M[0])}:4 ${M[1]}:2 ${M[2]}:2`:`${plus(b,M[0])}:2 ${M[1]} ${M[2]} ${plus(s.fifth,M[3])}:2 ${M[2]}:2`;
  if(ty==='shell'||ty==='fill')return lv===2?`${plus(s.all,M[0])}:4 ${M[1]}:2 ${M[2]}:2`:ty==='shell'?`${plus(s.all,M[0])}:2 ${M[1]}:2 ${plus(top,M[2])}:2 ${M[3]}:2`:`${plus(s.all,M[0])}:2 ${M[1]} ${M[2]} ${M[3]} ${M[2]} ${M[1]}:2`;
  if(ty==='every')return lv===2?`${plus(s.all,M[0])}:4 ${plus(top,M[1])}:4`:`${plus(s.all,M[0])}:2 ${plus(top,M[1])}:2 ${plus(top,M[2])}:2 ${plus(top,M[3])}:2`;
  if(ty==='24')return lv===2?`${plus(b,M[0])}:2 ${top}:2 ${M[1]}:2 ${top}:2`:`${plus(b,M[0])}:2 ${plus(top,M[1])}:2 ${plus(s.fifth,M[2])}:2 ${plus(top,M[3])}:2`;
  return lv===2?`${plus(b,M[0])}:2 ${s.fifth}:2 ${plus(b,M[1])}:2 ${s.fifth}:2`:`${plus(b,M[0])}:2 ${plus(s.fifth,M[1])}:2 ${plus(b,M[2])}:2 ${M[3]}:2`;}
add('A39',39,2,
 {name:'Аккордовое соло',goal:'Мелодия сверху и гармония под ней одной гитарой (chord melody).',how:'Мелодия на верхних струнах, под ней — бас или шелл. Мелодия всегда громче. Вариант задаёт фактуру: бас, шелл, заполнение, аккорд под каждой нотой, бас на слабые доли, ход баса.',tip:'Сначала сыграй одну мелодию и спой её, потом добавь низ. Так играют Джо Пасс, Тед Гринн и Ленни Бро.',lvl:['Мелодия и бас половинными','Мелодия и гармония на раз','Фактура варианта четвертями','Свинговые восьмые','Свинг, последний аккорд с вибрато']},
 {name:'Chord melody',goal:'Melody on top and harmony under it on one guitar.',how:'The melody on the top strings, a bass note or a shell under it. The melody is always louder. The variant sets the texture: bass, shell, fill, a chord under every note, bass on the weak beats, a bass line.',tip:'Play and sing the melody alone first, then add the low part. Joe Pass, Ted Greene and Lenny Breau play like this.',lvl:['Melody and bass in half notes','Melody and harmony on one','The variant’s texture in quarters','Swung eighths','Swing, vibrato on the last chord']},
 A39V.map(([ps,ty,ru,en])=>{const cs=P(ps),S=comp(cs,5),B=lv=>bars(cs.map((c,i)=>a39bar(c,S[i],ty,lv)));
   const swg=swc;
   return [ru,en,[B(1),B(2),B(3),swg(B(3)),J(swg(B(3)).replace(/(\S+):(\d+)$/,'$1~:$2'))]];}));

/* L24 бибоп-гаммы */
const L24V=[['G',[0,2,4,5,7,9,10,11],2,'Доминантовая бибоп-гамма {G}7','Dominant bebop scale {G}7'],['C',[0,2,4,5,7,8,9,11],7,'Мажорная бибоп-гамма {C}','Major bebop scale {C}'],
  ['D',[0,2,3,4,5,7,9,10],4,'Дорийская бибоп-гамма {D}m7','Dorian bebop scale {D}m7'],['Bb',[0,2,4,5,7,9,10,11],5,'{Bb}7: арпеджио вверх, гамма вниз','{Bb}7: arpeggio up, scale down'],
  ['A',[0,2,3,5,7,8,9,11],4,'Мелодический минор с проходящей: {A}m(maj7)','Melodic minor with a passing note: {A}m(maj7)'],['E',[0,2,3,4,5,7,9,10],7,'Дорийская бибоп-гамма {E}m7','Dorian bebop scale {E}m7']];
add('L24',24,2,
 {name:'Бибоп-гаммы',goal:'Восемь нот в октаве: ноты аккорда попадают на сильные доли.',how:'Гамма с одной хроматической проходящей. Сверху вниз от тоники ноты аккорда ложатся на доли — так звучит бибоп. Рука в позиции, по пальцу на лад.',tip:'Начинай фразу сверху и иди вниз. Ориентир — Барри Харрис: его система построена на этих гаммах.',lvl:['Первые восемь нот четвертями','Позиция вверх и вниз','Свинг','Секвенция по четыре','Свинг легато']},
 {name:'Bebop scales',goal:'Eight notes per octave: chord tones land on the strong beats.',how:'A scale with one chromatic passing note. Going down from the root, the chord tones fall on the beats: that is the bebop sound. The hand stays in position, one finger per fret.',tip:'Start the phrase at the top and go down. Think Barry Harris: his whole system is built on these scales.',lvl:['First eight notes in quarters','The position up and down','Swing','Four-note sequence','Swing legato']},
 L24V.map(([r,iv,p,ru,en],vi)=>{const R=PC[r],T=pos(sc(R,iv),p),i=T.findIndex(x=>mid(x)%12===R),top=T.slice(i),dn=top.slice().reverse();let lv=lineLv(T);
   if(vi===3){const ar=pos(C('Bb7').pcs,p),k=ar.findIndex(x=>mid(x)%12===R),a=ar.slice(k,k+4),hi=T.indexOf(T.find(x=>mid(x)>mid(a[3]))),s=T.slice(Math.max(0,hi-3),hi+1).reverse();
     const ph=a.concat(T[hi]||[],s).slice(0,8);lv=[lv[0],lv[1],sw(ph.concat(ph)),sw(dn),sw(vib(leg(ph.concat(dn.slice(0,8)))))];}
   else lv[2]=sw(dn.concat(dn.slice(0,-1).reverse()));
   return [ru,en,lv];}));

/* L25 хроматические подходы */
const L25V=[['Cmaj7',7,[-1],'Подход снизу к каждой ноте {C}maj7','Approach from below to every note of {C}maj7'],
  ['G7',2,[1],'Подход сверху: {G}7','Approach from above: {G}7'],['Dm7',4,[-2,-1],'Два полутона снизу: {D}m7','Two half steps from below: {D}m7'],
  ['Fmaj7',7,[2,1],'Два полутона сверху: {F}maj7','Two half steps from above: {F}maj7'],['A7',4,[-3,-2,-1],'Хроматический разбег в три ноты: {A}7','Three-note chromatic run-up: {A}7'],
  ['Em7',6,[-1,1],'Снизу, потом сверху: {E}m7','From below, then above: {E}m7']];
add('L25',25,2,
 {name:'Хроматические подходы',goal:'Пальцы левой руки по одному на лад: хроматика ведёт в ноту аккорда.',how:'Перед каждой нотой аккорда — хроматические ноты с соседних ладов. Рука в позиции, каждый палец на своём ладу. Нота аккорда — на долю. С пятого уровня ноты на одной струне связываются легато.',tip:'Хроматика — это движение, на ней не стоят. Лучше медленнее, но каждый лад звучит чисто.',lvl:['Подход и цель четвертями','Подход и цель восьмыми','Свинг','Цели вверх и вниз','Свинг легато']},
 {name:'Chromatic approaches',goal:'One fretting finger per fret: chromatic notes lead into a chord tone.',how:'Before each chord tone come chromatic notes from the neighbouring frets. The hand stays in position, each finger on its own fret. The chord tone lands on the beat. On level 5 notes on one string are joined with legato.',tip:'Chromatic notes are motion: never stop on them. Slower is fine, as long as every fret sounds clean.',lvl:['Approach and target in quarters','Approach and target in eighths','Swing','Targets up and down','Swing legato']},
 L25V.map(([cn,p,e,ru,en])=>{const c=C(cn),L=pos(c.pcs,p),i=L.findIndex(x=>mid(x)%12===c.r),tg=L.slice(i,i+5),G=ts=>ts.flatMap(t=>e.map(d=>at(mid(t)+d,p)).concat(t));
   const all=tg.concat(tg.slice(0,-1).reverse());
   return [ru,en,[J(q(G(tg.slice(0,4)))),e8(G(tg)),sw(G(tg)),sw(G(all)),sw(vib(leg(G(all))))]];}));

/* L26 октавы */
const OCT={ED:['E','D',2],AG:['A','G',2],DB:['D','B',3],Ge:['G','e',3]};
const L26V=[['ED','G',[0,2,4,5,7,9,11],'Октавы на {s:E} и {s:D}: мелодия в {G}','Octaves on {s:E} and {s:D}: melody in {G}'],
  ['AG','C',[0,2,4,5,7,9,11],'Октавы на {s:A} и {s:G}: мелодия в {C}','Octaves on {s:A} and {s:G}: melody in {C}'],
  ['DB','F',[0,2,4,5,7,9,10],'Октавы на {s:D} и {s:B}: миксолидийская {F}','Octaves on {s:D} and {s:B}: {F} Mixolydian'],
  ['Ge','Bb',[0,2,4,5,7,9,11],'Октавы на {s:G} и {s:e}: мелодия в {Bb}','Octaves on {s:G} and {s:e}: melody in {Bb}'],
  ['ED/AG','D',[0,2,3,5,7,9,10],'Смена пар струн: дорийская {D}','Switching string pairs: {D} Dorian'],
  ['AG','A',[0,2,3,5,7,8,10],'Октавы с подходом: {A}m','Octaves with approaches: {A}m']];
add('L26',26,2,
 {name:'Октавы',goal:'Гитарные октавы: две ноты через струну, звучат как одна толстая.',how:'Нижний палец — указательный, верхний — безымянный или мизинец. Струна между ними заглушена мякотью указательного. Щипок большим пальцем или двумя пальцами одновременно.',tip:'Глушение середины важнее скорости. Уэс Монтгомери играл октавы большим пальцем — мягко и тепло.',lvl:['Четвертями','Гамма вверх и вниз','Мелодия в свинге','Подход с лада ниже','Длинная фраза, вибрато']},
 {name:'Octaves',goal:'Guitar octaves: two notes with a string between them, sounding like one fat note.',how:'The lower note with the index finger, the upper with the ring finger or pinky. The string between them is muted by the flesh of the index finger. Pluck with the thumb or two fingers at once.',tip:'Muting the middle string matters more than speed. Wes Montgomery played octaves with his thumb: soft and warm.',lvl:['Quarters','Scale up and down','Melody in swing','Approach from a fret below','Long phrase, vibrato']},
 L26V.map(([pr,r,iv,ru,en])=>{const R=PC[r],prs=pr.split('/').map(k=>OCT[k]);
   const o=(m,k)=>{const [a,b,d]=prs[k%prs.length];let f=m-OP[a];while(f>13)f-=12;while(f<1)f+=12;return `${a}${f}+${b}${f+d}`;};
   const deg=[0,1,2,3,4,5,6,7].map(k=>(R+iv[k%7]+(k>6?12:0))),scl=deg.map((m,k)=>o(OP[prs[0][0]]+md(m-OP[prs[0][0]],12)+(k>6?12:0),Math.floor(k/4)));
   const melo=[0,2,4,3,2,1,0,4,5,4,2,1,0,1,2,0].map((d,k)=>o(OP[prs[0][0]]+md(deg[d]-OP[prs[0][0]],12),Math.floor(k/8)));
   const dn=x=>x.replace(/\d+/g,d=>d-1);
   return [ru,en,[J(q(scl)),e8(ud(scl)),sw(melo),sw(melo.slice(0,8).flatMap(x=>[dn(x),x])),sw(vib(melo.concat(melo.slice(0,8).reverse())))]];}));

/* L27 кварты */
const L27V=[['D',[0,2,3,5,7,9,10],'EAD',5,'Кварты на трёх нижних: дорийская {D}','Fourths on the low three strings: {D} Dorian'],
  ['G',[0,2,3,5,7,9,10],'ADG',3,'Кварты на средних: дорийская {G}','Fourths on the middle strings: {G} Dorian'],
  ['C',[0,2,4,5,7,9,11],'DGB',5,'Кварты на {s:D}, {s:G}, {s:B}: мажор {C}','Fourths on {s:D}, {s:G}, {s:B}: {C} major'],
  ['E',[0,2,3,5,7,9,10],'EADGB',5,'Аккорд «So What»: {E}m','The “So What” chord: {E}m'],
  ['F',[0,2,4,6,7,9,11],'GBe',5,'Кварты на верхних: лидийская {F}','Fourths on the top strings: {F} Lydian'],
  ['A',[0,2,3,5,7,8,10],'ADG',5,'Квартовая линия по одной ноте: {A}m','A fourths line, one note at a time: {A}m']];
add('L27',27,2,
 {name:'Кварты',goal:'Квартовые аккорды и линии: звук модального джаза.',how:'Ноты, сложенные квартами, ходят по ладу вверх и вниз. Форма меняется: кварта бывает чистой и увеличенной, а между {s:G} и {s:B} — свой интервал строя, поэтому палец на {s:B} сдвигается.',tip:'Аккорд без терции не мажорный и не минорный, его окраску задаёт бас. Послушай «So What» Майлза Дэвиса и Маккой Тайнера.',lvl:['Два аккорда половинными','По ладу вверх четвертями','Вверх и вниз','Чарльстон','Подход с лада ниже']},
 {name:'Fourths',goal:'Quartal chords and lines: the sound of modal jazz.',how:'Notes stacked in fourths move up and down the mode. The shape changes: a fourth can be perfect or augmented, and between {s:G} and {s:B} the tuning has its own interval, so the finger on {s:B} shifts.',tip:'A chord with no third is neither major nor minor: the bass gives it colour. Listen to Miles Davis’ “So What” and McCoy Tyner.',lvl:['Two chords in half notes','Up the mode in quarters','Up and down','Charleston','Approach from a fret below']},
 L27V.map(([r,iv,strs,p,ru,en],vi)=>{const R=PC[r],ss=strs.split(''),sca=k=>{const o=Math.floor(k/7);return R+iv[md(k,7)]+12*o;};
   const base=OP[ss[0]]+md(R-OP[ss[0]]-1,12)+1;
   const W0=k=>base+iv[md(k,7)]+12*Math.floor(k/7)-iv[0];
   const chord=k=>vi===3?ss.map((s,j)=>s+(W0(k)-OP[ss[0]]-(j===4?1:0))).join('+'):ss.map((s,j)=>s+(W0(k+3*j)-OP[s])).join('+');
   let k0=0;while(W0(k0)-OP[ss[0]]>4)k0--;const K=[0,1,2,3].map(k=>chord(k+k0)),dn=x=>x.replace(/\d+/g,d=>d-1);
   if(vi===5){const ln=[0,3,6,9,1,4,7,10].map(k=>at(base+iv[md(k,7)]+12*Math.floor(k/7),p));return [ru,en,[J(q(ln.slice(0,4))),J(q(ln)),e8(ud(ln)),sw(ud(ln)),sw(vib(leg(ud(ln))))]];}
   return [ru,en,[J(K[0]+':4',K[1]+':4'),J(q(K.slice(0,4))),J(q(ud(K))),J(K.slice(0,4).map(x=>`${x}:3 ${x} .:4`)),J(K.slice(0,4).map(x=>`${dn(x)} ${x}:3`))]];}));

/* L28 ведение голосов: терции и септимы */
const L28V=[['Dm7 G7 Cmaj7 Cmaj7','ii–V–I в {C}','ii–V–I in {C}'],['E7 A7 D7 G7','Цепочка доминант: {E}7 – {A}7 – {D}7 – {G}7','Chain of dominants: {E}7 – {A}7 – {D}7 – {G}7'],
  ['Em7b5 A7 Dm6 Dm6','Минорный ii–V–i в {D}','Minor ii–V–i in {D}'],['Fmaj7 D7 Gm7 C7','I–VI–ii–V в {F}','I–VI–ii–V in {F}'],
  ['Bb7 Eb7 Bb7 F7','Блюз в {Bb}: I–IV–I–V','Blues in {Bb}: I–IV–I–V'],['Bm7 E7 Am7 D7','iii–VI–ii–V в {G}','iii–VI–ii–V in {G}']];
function guide(cs){let lo=null;return cs.map((c,i)=>{const t3=md(c.r+CT[c.t][1],12),t7=md(c.r+CT[c.t][3],12);
  const opts=[];for(let m=52;m<=63;m++)for(const [a,b] of [[t3,t7],[t7,t3]])if(m%12===a){let h=m+1;while(h%12!==b)h++;if(h-m<=7&&h>=56&&Math.abs((m-50)-(h-55))<=3)opts.push([m,h]);}
  const pk=lo==null?opts.reduce((x,y)=>Math.abs(y[0]-56)<Math.abs(x[0]-56)?y:x):opts.reduce((x,y)=>Math.abs(y[0]-lo)<Math.abs(x[0]-lo)?y:x);lo=pk[0];return pk;});}
add('L28',28,2,
 {name:'Ведение голосов',goal:'Терция и септима через всю гармонию: голоса двигаются на ступень или стоят.',how:'Две ноты — терция и септима аккорда — на соседних средних струнах. Септима одного аккорда уходит на полтона вниз в терцию следующего, общая нота остаётся. Пальцы почти не прыгают.',tip:'Пропевай верхний голос: он сам складывается в мелодию. Так думают аранжировщики и пианисты, например Билл Эванс.',lvl:['Пары половинными','С тоникой в басу','Голоса по очереди восьмыми','Свинг: тоника, пара, верхний голос','Подход к каждой паре с лада ниже']},
 {name:'Voice leading',goal:'Third and seventh through the changes: the voices step or hold.',how:'Two notes, the chord’s third and seventh, on adjacent middle strings. The seventh of one chord falls a half step into the third of the next, the common note holds. The fingers hardly jump.',tip:'Sing the top voice: it turns into a melody by itself. This is how arrangers and pianists like Bill Evans think.',lvl:['Pairs in half notes','With the root in the bass','The voices in turn in eighths','Swing: root, pair, top voice','Approach each pair from a fret below']},
 L28V.map(([ps,ru,en])=>{const cs=P(ps),G=guide(cs),S=comp(cs,5),pr=([l,h])=>{const a='D'+(l-50),b='G'+(h-55);return {a,b,both:a+'+'+b};},X2=G.map(pr);
   const lowB=(s,x)=>s.b[0]==='E'||s.b[0]==='A'?s.b:null,dn=x=>x.replace(/\d+/g,d=>d-1);
   return [ru,en,[J(X2.map(x=>x.both+':4')),bars(X2.map((x,i)=>`${plus(S[i].b,x.both)}:4 ${x.both}:4`)),J('/2',bars(X2.map(x=>`${x.a} ${x.b} ${x.a} ${x.b}:5`))),
   sw(X2.flatMap((x,i)=>[S[i].b,x.both,x.b,x.a])),J(X2.map(x=>`${dn(x.both)} ${x.both}:3 ${x.both}:4`))]];}));

/* L29 мелодический минор и его лады */
const MM=[0,2,3,5,7,9,11];
const L29V=[['A','A',4,'{A}: мелодический минор','{A} melodic minor'],['G','D',2,'{G}7: лидийская доминанта','{G}7: Lydian dominant'],
  ['E','F',7,'{E}7alt: альтерированная гамма','{E}7alt: altered scale'],['B','D',6,'{B}m7b5: локрийский с большой секундой','{B}m7b5: Locrian natural 2'],
  ['C','C',7,'{C}m(maj7): терциями','{C}m(maj7): in thirds'],['F','D',0,'{F}maj7#5: лидийская увеличенная','{F}maj7#5: Lydian augmented']];
add('L29',29,2,
 {name:'Мелодический минор',goal:'Звукоряд современного джаза и его лады в позиции.',how:'Мелодический минор (джазовый: одинаковый вверх и вниз) и лады от его ступеней. Тоника варианта — нота аккорда, над которым звучит лад. Рука в позиции, растяжка на один лад.',tip:'Слушай, на каких нотах звук «острый» — это и есть краска лада. Альтерированная гамма над доминантой — язык Джо Пасса и Пэта Мартино.',lvl:['Первые восемь нот четвертями','Позиция вверх и вниз','Свинг','Секвенция','Свинг легато']},
 {name:'Melodic minor',goal:'The scale of modern jazz and its modes in position.',how:'Melodic minor (the jazz form, the same up and down) and the modes on its degrees. The variant’s root is the chord the mode is played over. The hand stays in position with a one-fret stretch.',tip:'Listen for the notes that sound “sharp”: that is the mode’s colour. The altered scale over a dominant is the language of Joe Pass and Pat Martino.',lvl:['First eight notes in quarters','The position up and down','Swing','Sequence','Swing legato']},
 L29V.map(([r,par,p,ru,en],vi)=>{const R=PC[r],T=pos(sc(PC[par],MM),p),i=T.findIndex(x=>mid(x)%12===R),lv=lineLv(T,{g:vi%2?3:4});
   if(vi===4){const th=[];for(let k=0;k+2<T.length;k++)th.push(T[k],T[k+2]);lv[3]=sw(th);}
   lv[0]=J(q(T.slice(i,i+8)));return [ru,en,lv];}));

/* L30 уменьшённая гамма */
const HW=[0,1,3,4,6,7,9,10],WH=[0,2,3,5,6,8,9,11];
const L30V=[['hw','G',2,'Полутон–тон от {G}: над {G}7(b9)','Half-whole from {G}: over {G}7(b9)'],['wh','C',7,'Тон–полутон от {C}: над {C}dim7','Whole-half from {C}: over {C}dim7'],
  ['cell','A',4,'Ячейка из четырёх нот через малую терцию: {A}','A four-note cell moved by minor thirds: {A}'],['tri','D',4,'Трезвучия по уменьшённой: {D}, {F}, {G#}, {B}','Triads over the diminished: {D}, {F}, {G#}, {B}'],
  ['g4','E',6,'Полутон–тон от {E}: по четыре','Half-whole from {E}: groups of four'],['nb','Bb',5,'Уменьшённое арпеджио с соседями: {Bb}','Diminished arpeggio with neighbours: {Bb}']];
add('L30',30,2,
 {name:'Уменьшённая гамма',goal:'Симметричная гамма: тон и полутон по очереди, форма повторяется через три лада.',how:'Над доминантой — от тоники полутон–тон, над уменьшённым — тон–полутон. Любая фигура сдвигается на малую терцию (три лада) и остаётся в гамме. Вариант задаёт фигуру.',tip:'Не играй гамму подряд долго — звучит как упражнение. Бери из неё ячейки. Ориентир — Майкл Брекер и, на гитаре, Джордж Бенсон.',lvl:['Первые восемь нот четвертями','Вверх и вниз','Свинг','Секвенция','Свинг легато']},
 {name:'Diminished scale',goal:'A symmetrical scale: whole and half steps in turn, the shape repeats every three frets.',how:'Over a dominant, half-whole from the root; over a diminished chord, whole-half. Any figure moved up a minor third (three frets) stays in the scale. The variant sets the figure.',tip:'Do not run the scale for long: it sounds like an exercise. Take cells from it. Think Michael Brecker and, on guitar, George Benson.',lvl:['First eight notes in quarters','Up and down','Swing','Sequence','Swing legato']},
 L30V.map(([ty,r,p,ru,en])=>{const R=PC[r];let T;
   if(ty==='cell'){const m0=OP.G+md(R-OP.G,12);T=[0,3,6,9].flatMap(k=>[0,1,3,4].map(d=>at(m0+k+d,m0-OP.G+k)));}
   else if(ty==='tri'){const m0=OP.A+md(R-OP.A,12);T=[0,3,6,9].flatMap(k=>[0,4,7].map(d=>at(m0+k+d,p)));}
   else if(ty==='nb'){const L=pos(sc(R,[0,3,6,9]),p);T=L.flatMap(x=>[at(mid(x)-1,p),x]);}
   else T=pos(sc(R,ty==='wh'?WH:HW),p);
   const lv=lineLv(T,{g:ty==='tri'?3:4});return [ru,en,lv];}));

/* L31 три ноты на струну */
const L31V=[['C',[0,2,4,5,7,9,11],'E',8,'{C} ионийский от тоники','{C} Ionian from the root'],['D',[0,2,3,5,7,9,10],'A',5,'{D} дорийский от тоники','{D} Dorian from the root'],
  ['G',[0,2,4,5,7,9,10],'E',3,'{G} миксолидийский от тоники','{G} Mixolydian from the root'],['A',[0,2,3,5,7,9,11],'A',0,'{A} мелодический минор','{A} melodic minor'],
  ['F',[0,2,4,6,7,9,11],'E',1,'{F} лидийский','{F} Lydian'],['B',[0,1,3,5,6,8,10],'E',7,'{B} локрийский: над {B}m7b5','{B} Locrian: over {B}m7b5']];
add('L31',31,3,
 {name:'Три ноты на струну',goal:'Гамма по диагонали грифа: позиция меняется сама, без рывков.',how:'По три ноты гаммы на каждой струне, на следующей струне рука сдвигается. Триоли сами ложатся на струны: одна доля — одна струна. С пятого уровня — легато, щипок только первой ноты на струне.',tip:'Сдвиг руки — во время последней ноты струны. Так длинные линии играет Фрэнк Гамбале, а в акустическом джазе — Бирели Лагрен.',lvl:['Две струны вверх и вниз','Четыре струны','Шесть струн вверх','Вверх и вниз','Легато']},
 {name:'Three notes per string',goal:'A scale along the neck diagonally: the position changes by itself, smoothly.',how:'Three scale notes on each string, the hand shifts on the next string. Triplets fall naturally on the strings: one beat, one string. From level 5: legato, pick only the first note on each string.',tip:'Shift the hand during the last note on a string. Frank Gambale plays long lines like this, in acoustic jazz Biréli Lagrène.',lvl:['Two strings up and down','Four strings','Six strings up','Up and down','Legato']},
 L31V.map(([r,iv,s0,f0,ru,en])=>{const R=PC[r],m0=OP[s0]+f0,ss=SS.slice(SS.indexOf(s0)),ms=[];let k=0;
   for(const s of ss)for(let j=0;j<3;j++){const m=R+iv[md(k,7)]+12*Math.floor(k/7)+(m0-R-0);ms.push(s+(m-OP[s]));k++;}
   const T=ms,U=n=>T.slice(0,n*3);return [ru,en,[J('/3',ud(U(2)),'.'),J('/3',ud(U(4)),'.'),J('/3',T),J('/3',ud(T),'.'),J('/3',leg(ud(T)),'.')]];}));

/* L40 аккорды с расширениями */
const EXT={'9':['A',[0,-1,0,0,0],'7',[0,-1,0,2]],'13':['E',[0,0,1,2],'7',[0,0,1,0]],'7#9':['A',[0,-1,0,1],'7',[0,-1,0,2]],'7b9':['A',[0,-1,0,-1],'7',[0,-1,0,2]],'m9':['A',[0,-2,0,0],'m7',[0,-2,0,1]],'maj9':['A',[0,-1,1,0],'maj7',[0,-1,1,2]]};
const L40V=[['9',[3,8,10,3],'{C}9, {F}9, {G}9','{C}9, {F}9, {G}9'],['13',[3,8,10,3],'{G}13, {C}13, {D}13','{G}13, {C}13, {D}13'],['7#9',[7,5,2,7],'{E}7#9, {D}7#9, {B}7#9','{E}7#9, {D}7#9, {B}7#9'],
  ['7b9',[5,12,10,5],'{D}7b9, {A}7b9, {G}7b9','{D}7b9, {A}7b9, {G}7b9'],['m9',[5,10,3,5],'{D}m9, {G}m9, {C}m9','{D}m9, {G}m9, {C}m9'],['maj9',[3,8,5,3],'{C}maj9, {F}maj9, {D}maj9','{C}maj9, {F}maj9, {D}maj9']];
add('L40',40,2,
 {name:'Аккорды с расширениями',goal:'Нона, тринадцатая, альтерации: один палец меняет краску аккорда.',how:'Подвижная форма с тоникой на нижней струне. Расширение добавляется к септаккорду одним пальцем на верхних струнах, остальные пальцы стоят. Вариант задаёт расширение.',tip:'Сравни на слух септаккорд и его расширение — запомни звук, а не форму. Этими аккордами комповал Джим Холл.',lvl:['Форма половинными','Четыре четверти по корням','Чарльстон','Подход с лада ниже','Септаккорд и расширение по очереди']},
 {name:'Extended chords',goal:'Ninths, thirteenths, alterations: one finger changes the colour of the chord.',how:'A movable shape with the root on a low string. The extension is added to the seventh chord with one finger on the top strings while the rest stay put. The variant sets the extension.',tip:'Compare the seventh chord and its extension by ear: remember the sound, not the shape. Jim Hall comped with these chords.',lvl:['The shape in half notes','Four quarters through the roots','Charleston','Approach from a fret below','Seventh chord and extension in turn']},
 L40V.map(([k,rs,ru,en])=>{const [s0,d,,d7]=EXT[k],strs=s0==='E'?['E','D','G','B']:['A','D','G','B','e'].slice(0,d.length),mk=(r,dd)=>dd.map((x,i)=>strs[i]+(r+x)).join('+');
   const Ch=rs.map(r=>mk(r,d)),C7=rs.map(r=>mk(r,d7)),dn=x=>x.replace(/\d+/g,v=>v-1);
   return [ru,en,[J(Ch.map(x=>x+':4')),bars(Ch.map(x=>J(q([x,x,x,x])))),J(Ch.map(x=>`${x}:3 ${x} .:4`)),J(Ch.map(x=>`${dn(x)} ${x}:3 ${x}:2 ${x}:2`)),J(Ch.map((x,i)=>`${C7[i]}:2 ${x}:2 ${C7[i]}:2 ${x}:2`))]];}));

/* C32 шеллы → линия */
const C32V=[['Dm7 G7 Cmaj7 A7',5,'ii–V–I–VI в {C}','ii–V–I–VI in {C}'],['Gm7 C7 Fmaj7 D7',3,'ii–V–I–VI в {F}','ii–V–I–VI in {F}'],['Em7b5 A7 Dm6 Dm6',5,'Минорный ii–V–i в {D}','Minor ii–V–i in {D}'],
  ['Cm7 F7 Bbmaj7 Bbmaj7',6,'ii–V–I в {Bb}','ii–V–I in {Bb}'],['F7 Bb7 F7 C7',5,'Джаз-блюз в {F}: I–IV–I–V','Jazz blues in {F}: I–IV–I–V'],['Am7 D7 Gmaj7 E7',3,'ii–V–I–VI в {G}','ii–V–I–VI in {G}']];
add('C32',32,2,
 {name:'Шеллы → линия',goal:'Из аккомпанемента в соло и обратно, не теряя гармонию.',how:'Такт шеллов четвертями, потом такт арпеджио следующего аккорда. Линия начинается на долю, рука переезжает во время последнего аккорда.',tip:'Линия должна звучать над тем же аккордом, что и аккомпанемент. Если стык рвётся, сыграй последний аккорд и первую ноту линии.',lvl:['Такт аккордов, такт линии четвертями','Линия восьмыми','Свинг','Стык внутри такта','Вся гармония: аккорд и линия по очереди']},
 {name:'Shells → line',goal:'From comping into a solo and back without losing the harmony.',how:'A bar of shells in quarters, then a bar of arpeggio over the next chord. The line starts on the beat, the hand moves during the last chord.',tip:'The line must sound over the same chord as the comping. If the joint breaks, play the last chord and the first note of the line.',lvl:['A bar of chords, a bar of line in quarters','Line in eighths','Swing','Joint mid-bar','Through the changes: chord and line in turn']},
 C32V.map(([ps,p,ru,en])=>{const cs=P(ps),S=comp(cs,p),ln=cs.map(c=>{const L=pos(c.pcs,p),i=L.findIndex(x=>mid(x)%12===c.r);return bounce(L,i,1,8);});
   const ch=(s,n)=>'/2 '+Array(n).fill(s.all+':2').join(' ');
   return [ru,en,[J(ch(S[0],4),'|',q(ln[1].slice(0,4))),J(ch(S[0],4),'|',e8(ln[1])),J(ch(S[0],4),'|',sw(ln[1])),
   J(ch(S[0],2),sw(ln[1].slice(0,4)),'|',ch(S[2],2),sw(ln[3].slice(0,4))),J(ch(S[0],4),'|',sw(ln[1]),'|',ch(S[2],4),'|',sw(ln[3]))]];}));

/* C33 ла помп → соло */
const C33V=[['Am6 E7',4,'{A}m6 – {E}7','{A}m6 – {E}7'],['Dm6 A7',9,'{D}m6 – {A}7','{D}m6 – {A}7'],['G6 D7',2,'{G}6 – {D}7','{G}6 – {D}7'],
  ['Gm6 D7',2,'{G}m6 – {D}7','{G}m6 – {D}7'],['C6 G7',7,'{C}6 – {G}7','{C}6 – {G}7'],['Em6 B7',6,'{E}m6 – {B}7','{E}m6 – {B}7']];
add('C33',33,2,
 {name:'Ла помп → соло',goal:'Из ритм-гитары в соло, как в цыганском квинтете.',how:'Такт ла помп на первом аккорде, потом такт арпеджио второго. Над доминантой — уменьшённое арпеджио от её терции. Правая рука из размаха собирается для удара с упором.',tip:'Метроном не ждёт: последний удар помпа и первая нота соло — соседние доли. В квинтете Джанго соло и ритм менялись прямо так.',lvl:['Такт аккорда, такт четвертями','Арпеджио восьмыми','Свинг','Обратно в помп','Помп с глухим ударом, соло легато']},
 {name:'La pompe → solo',goal:'From rhythm guitar into a solo, like in a gypsy quintet.',how:'A bar of la pompe on the first chord, then a bar of arpeggio over the second. Over the dominant, the diminished arpeggio from its third. The picking hand gathers from the strum into a rest stroke.',tip:'The metronome does not wait: the last pompe stroke and the first solo note are neighbouring beats. In Django’s quintet solo and rhythm swapped just like this.',lvl:['A bar of chord, a bar in quarters','Arpeggio in eighths','Swing','Back into the pompe','Pompe with the muted stroke, legato solo']},
 C33V.map(([ps,p,ru,en])=>{const cs=P(ps),S=comp(cs,5),d=cs[1],dim={pcs:CT.dim7.map(i=>md(d.r+4+i,12))},L=pos(dim.pcs,p),
   i=L.findIndex(x=>mid(x)%12===md(d.r+4,12)),ln=bounce(L,i,1,8),pm=g=>J('/3',cells(pmp(S[0],g,4)));
   return [ru,en,[J(S[0].all+':2',S[0].all+':2',S[0].all+':2',S[0].all+':2','|',q(ln.slice(0,4))),J(pm(0),'|',e8(ln)),J(pm(0),'|',sw(ln)),J(pm(0),'|',sw(ln),'|',pm(0)),J(pm(1),'|',sw(leg(ln)),'|',pm(1))]];}));

/* C34 уокинг и аккорды */
const C34V=[['Dm7 G7 Cmaj7 Cmaj7','ii–V–I в {C}','ii–V–I in {C}'],['Fmaj7 D7 Gm7 C7','I–VI–ii–V в {F}','I–VI–ii–V in {F}'],['Em7b5 A7 Dm6 Dm6','Минорный ii–V–i в {D}','Minor ii–V–i in {D}'],
  ['Bb7 Eb7 Bb7 F7','Блюз в {Bb}','Blues in {Bb}'],['Cmaj7 A7 Dm7 G7','I–VI–ii–V в {C}','I–VI–ii–V in {C}'],['Gm7 C7 Am7 D7','ii–V в {F}, ii–V в {G}','ii–V in {F}, ii–V in {G}']];
const atL=(m,r)=>{let best=null;for(const s of ['E','A'])for(const o of [0,12,-12]){const f=m+o-OP[s];if(f>=0&&f<=12&&(!best||Math.abs(f-r)<Math.abs(best[1]-r)))best=[s,f];}return best[0]+best[1];};
function walk(cs,S){return cs.map((c,i)=>{const s=S[i],nx=cs[(i+1)%cs.length],r=s.r,rm=mid(s.b),t3=rm+CT[c.t][1],t5=rm+CT[c.t][2],nr=mid(S[(i+1)%cs.length].b);
  return [s.b,atL(t3,r),atL(t5,r),atL(nr-1,r)];});}
add('C34',34,2,
 {name:'Уокинг и аккорды',goal:'Бас ходит четвертями, аккорд отвечает на 2 и 4: целый оркестр на одной гитаре.',how:'Большой палец ведёт уокинг на нижних струнах: тоника, терция, квинта, подход к следующей тонике. Пальцы берут верх шелла вместе с басом на 2 и 4.',tip:'Бас ровный и связный, аккорд короткий. Если не успевает левая рука — сначала только бас. Так играли Джо Пасс и Ленни Бро.',lvl:['Только тоники четвертями','Уокинг без аккордов','Уокинг, аккорд на раз','Уокинг, аккорд на 2 и 4','Уокинг в свинге с подхватом аккорда']},
 {name:'Walking bass and chords',goal:'The bass walks in quarters, the chord answers on 2 and 4: a whole band on one guitar.',how:'The thumb walks on the low strings: root, third, fifth, approach to the next root. The fingers take the top of the shell together with the bass on 2 and 4.',tip:'Even, connected bass, short chord. If the fretting hand cannot keep up, play the bass alone first. Joe Pass and Lenny Breau played like this.',lvl:['Roots only in quarters','Walking without chords','Walking, chord on one','Walking, chord on 2 and 4','Walking in swing with a chord pickup']},
 C34V.map(([ps,ru,en])=>{const cs=P(ps),S=comp(cs,4),Wk=walk(cs,S);
   const okT=(b,s)=>b[0]==='E'||b[0]==='A'?plus(b,s.top.join('+')):b;
   return [ru,en,[bars(S.map(s=>J(q([s.b,s.b,s.b,s.b])))),bars(Wk.map(w=>J(q(w)))),bars(Wk.map((w,i)=>J(q([plus(w[0],S[i].top.join('+')),w[1],w[2],w[3]])))),
   bars(Wk.map((w,i)=>J(q([w[0],okT(w[1],S[i]),w[2],okT(w[3],S[i])])))),
   J('/3',bars(Wk.map((w,i)=>`${w[0]}:3 ${okT(w[1],S[i])}:2 ${S[i].top.join('+')} ${w[2]}:3 ${okT(w[3],S[i])}:3`)))]];}));

/* C35 джаз-блюз */
const C35V=[['F7 Bb7 F7 F7 Bb7 Bb7 F7 D7 Gm7 C7 F7 C7','Джаз-блюз в {F}','Jazz blues in {F}'],
  ['Bb7 Eb7 Bb7 Fm7 Eb7 Edim7 Bb7 G7 Cm7 F7 Bb7 F7','Джаз-блюз в {Bb} с ii–V в IV','Jazz blues in {Bb} with ii–V to IV'],
  ['Cm7 Cm7 Cm7 Cm7 Fm7 Fm7 Cm7 Cm7 Ab7 G7 Cm7 G7','Минорный блюз в {C}','Minor blues in {C}'],
  ['Fmaj7 Em7b5 Dm7 Cm7 Bb7 Bbm7 Am7 Abm7 Gm7 C7 Fmaj7 C7','«Птичий» блюз в {F}: нисходящие ii–V','“Bird” blues in {F}: descending ii–Vs'],
  ['G7 C7 G7 G7 C7 C#dim7 G7 E7 Am7 D7 G7 D7','Блюз в {G} с уменьшённым','Blues in {G} with a diminished chord'],
  ['Am6 Am6 Am6 Am6 Dm6 Dm6 Am6 Am6 E7 E7 Am6 E7','Минорный блюз в {A}, ла помп','Minor blues in {A}, la pompe']];
add('C35',35,2,
 {name:'Джаз-блюз',goal:'Двенадцать тактов джазового блюза шеллами без остановки.',how:'Блюз с джазовыми заменами: ii–V, уменьшённый, VI ступень перед ii. Шеллы с ближайшим ходом, рука почти не прыгает. Вариант — свой вид блюза.',tip:'Считай такты. Потеряться в квадрате хуже, чем ошибиться в аккорде. Послушай блюзы Чарли Паркера и Кенни Баррелла.',lvl:['Первые четыре такта половинными','Весь квадрат половинными','Весь квадрат четвертями','Чарльстон','Ла помп с глухим ударом']},
 {name:'Jazz blues',goal:'Twelve bars of jazz blues in shells without stopping.',how:'A blues with jazz substitutions: ii–V, diminished, the VI chord before ii. Shells with the nearest move, the hand hardly jumps. Each variant is its own kind of blues.',tip:'Count the bars. Getting lost in the form is worse than a wrong chord. Listen to blues by Charlie Parker and Kenny Burrell.',lvl:['First four bars in half notes','The whole form in half notes','The whole form in quarters','Charleston','La pompe with the muted stroke']},
 C35V.map(([ps,ru,en])=>{const cs=P(ps),S=comp(cs,5),rows=f=>[0,1,2].map(i=>bars(S.slice(i*4,i*4+4).map(f)));
   return [ru,en,[bars(S.slice(0,4).map(s=>`${s.all}:4 ${s.all}:4`)),rows(s=>`${s.all}:4 ${s.all}:4`),rows(fg),rows(s=>`${s.all}:3 ${s.all} .:4`),rows(s=>J('/3',cells(pmp(s,1,4))))]];}));

/* C36 этюд: шеллы, линия, аккордовое соло, ритм (босса или помп) — по системе на фрагмент */
const C36V=[['Dm7 G7 Cmaj7 A7',7,'b','ii–V–I в {C}, финал — босса','ii–V–I in {C}, bossa ending'],['Gm7 C7 Fmaj7 D7',5,'p','ii–V–I в {F}, финал — ла помп','ii–V–I in {F}, la pompe ending'],
  ['Em7b5 A7 Dm6 Dm6',4,'p','Минорный в {D}, финал — ла помп','Minor in {D}, la pompe ending'],['Cm7 F7 Bbmaj7 G7',5,'b','ii–V–I в {Bb}, финал — босса','ii–V–I in {Bb}, bossa ending'],
  ['Am7 D7 Gmaj7 E7',2,'w','ii–V–I в {G}, финал — уокинг','ii–V–I in {G}, walking ending'],['Bm7b5 E7 Am6 Am6',4,'w','Минорный в {A}, финал — уокинг','Minor in {A}, walking ending']];
add('C36',36,2,
 {name:'Этюд',goal:'Четыре приёма джазовой акустики подряд, как в настоящей пьесе.',how:'Четыре фрагмента на одной гармонии: шеллы, линия арпеджио, аккордовое соло, ритм (босса, ла помп или уокинг — по варианту). Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов: правая рука меняет роль.',lvl:['По такту на фрагмент, четверти','Восьмые','Свинг, два такта','Вся гармония в каждом фрагменте','Подходы и энклоужеры, длинные фрагменты']},
 {name:'Étude',goal:'Four acoustic jazz techniques in a row, like a real piece.',how:'Four fragments over the same changes: shells, an arpeggio line, chord melody, rhythm (bossa, la pompe or walking, depending on the variant). Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a full run on your phone. The weak spot is almost always the joint between fragments, where the right hand changes its role.',lvl:['A bar per fragment, quarters','Eighths','Swing, two bars','All the changes in each fragment','Approaches and enclosures, longer fragments']},
 C36V.map(([ps,p,ty,ru,en])=>{const cs=P(ps),S=comp(cs,5),f8=a17line(cs,p,'near',8),f4=a17line(cs,p,'near',4),cm=lv=>bars(cs.map((c,i)=>a39bar(c,S[i],'shell',lv)));
   const rh=(n,g)=>ty==='b'?bars(bossa(S.slice(0,n),BP[0],n>2?'walk':undefined)):ty==='p'?J('/3',bars(S.slice(0,n).map(s=>cells(pmp(s,g,4))))):bars(walk(cs,S).slice(0,n).map(w=>J(q(w))));
   const sh=n=>bars(S.slice(0,n).map(fg)),l5=f8.map((b,i)=>{const nx=f8[i+1];return nx?b.slice(0,6).concat(encl(nx[0],p)):b;}).flat();
   return [ru,en,[
   [sh(1),J(q(f4[0])),bars(cs.slice(0,1).map((c,i)=>a39bar(c,S[i],'shell',2))),rh(1,0)],
   [sh(1),e8(f8[0]),bars(cs.slice(0,1).map((c,i)=>a39bar(c,S[i],'shell',3))),rh(1,0)],
   [sh(2),sw(f8[0].concat(f8[1])),swc(bars(cs.slice(0,2).map((c,i)=>a39bar(c,S[i],'shell',3)))),rh(2,1)],
   [sh(4),sw(f8.flat()),swc(cm(3)),rh(4,1)],
   [bars(S.map((s,i)=>`${s.b}:2 ${s.top.join('+')}:2 ${appr(S[(i+1)%4])}:2 ${s.top.join('+')}:2`)),sw(l5),swc(cm(3)),rh(4,1)]]];}));

return {EX,EXEN:EN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@JZA2_END@*/

// ----- JZB1: джаз, бас, часть 1 -----
// Табы строятся из прогрессии: аккорд = [сдвиг тоники от тональности, тип]; фигура такта — ступени аккорда.
// Вариант = гармония (прогрессия), тональность и позиция грифа; уровень = длина фразы и фигура.
const JZB1=(function(){
const SN='EADG';
const Q={maj7:[4,7,11],'7':[4,7,10],m7:[3,7,10],m7b5:[3,6,10],dim7:[3,6,9],m6:[3,7,9]};
// прогрессии: такты, в такте один или два аккорда [сдвиг, тип]
const PR={
  iiVI:[[2,'m7'],[7,'7'],[0,'maj7'],[0,'maj7']],
  min:[[2,'m7b5'],[7,'7'],[0,'m6'],[0,'m6']],
  turn:[[0,'maj7'],[9,'7'],[2,'m7'],[7,'7']],
  tri:[[0,'maj7'],[9,'7'],[2,'m7'],[1,'7']],
  dimp:[[0,'maj7'],[1,'dim7'],[2,'m7'],[7,'7']],
  cyc:[[2,'m7'],[7,'7'],[0,'maj7'],[5,'maj7'],[11,'m7b5'],[4,'7'],[9,'m7'],[9,'m7']],
  long:[[2,'m7'],[2,'m7'],[7,'7'],[7,'7'],[0,'maj7'],[0,'maj7'],[9,'7'],[9,'7']],
  blues:[[0,'7'],[5,'7'],[0,'7'],[0,'7'],[5,'7'],[5,'7'],[0,'7'],[9,'7'],[2,'m7'],[7,'7'],[[0,'7'],[9,'7']],[[2,'m7'],[7,'7']]],
  mblues:[[0,'m7'],[0,'m7'],[0,'m7'],[0,'m7'],[5,'m7'],[5,'m7'],[0,'m7'],[0,'m7'],[8,'7'],[7,'7'],[0,'m7'],[7,'7']],
  rhy:[[[0,'maj7'],[9,'m7']],[[2,'m7'],[7,'7']],[[4,'m7'],[9,'7']],[[2,'m7'],[7,'7']],[[0,'maj7'],[0,'7']],[[5,'maj7'],[5,'m6']],[[4,'m7'],[9,'7']],[[2,'m7'],[7,'7']]],
  bridge:[[4,'7'],[4,'7'],[9,'7'],[9,'7'],[2,'7'],[2,'7'],[7,'7'],[7,'7']],
  modal:[[0,'m7'],[0,'m7'],[0,'m7'],[0,'m7'],[1,'m7'],[1,'m7'],[0,'m7'],[0,'m7']],
  bossa:[[0,'m7'],[0,'m7'],[5,'m7'],[5,'m7'],[2,'m7b5'],[7,'7'],[0,'m7'],[0,'m7']],
  bossaM:[[0,'maj7'],[0,'maj7'],[2,'7'],[2,'7'],[2,'m7'],[7,'7'],[0,'maj7'],[0,'maj7']]
};
const PN={iiVI:['ii–V–I','ii–V–I'],min:['минорный ii–V–i','minor ii–V–i'],turn:['оборот I–VI–ii–V','I–VI–ii–V turnaround'],tri:['оборот с тритоновой заменой','turnaround with a tritone sub'],
  dimp:['оборот через уменьшённый','turnaround through a diminished chord'],cyc:['ход по квартам','cycle of fourths'],long:['ii–V–I по два такта','ii–V–I, two bars each'],blues:['джазовый блюз','jazz blues'],
  mblues:['минорный блюз','minor blues'],rhy:['ритм-ченджи, часть A','rhythm changes, A section'],bridge:['ритм-ченджи, бридж','rhythm changes, bridge'],modal:['модальный вэмп','modal vamp'],
  bossa:['минорная босса','minor bossa'],bossaM:['мажорная босса','major bossa']};
const KN={0:'{E}',1:'{F}',3:'{G}',5:'{A}',6:'{Bb}',8:'{C}',10:'{D}',11:'{Eb}'};
const POS=a=>a<=3?['у порожка','near the nut']:a<=5?['пятая позиция','fifth position']:a<=7?['седьмая позиция','seventh position']:['высокая позиция','high position'];
// выбор струны: лад ближе к позиции a; h/p — на струне предыдущей ноты
function place(p,a,prev,leg){
  while(p>29)p-=12;while(p<0)p+=12;
  if(leg&&prev!=null){const f=p-5*prev;if(f>=0&&f<=17)return [prev,f];}
  let b=null;for(let s=0;s<4;s++){const f=p-5*s;if(f<0||f>17)continue;const c=Math.abs(f-a)+(f===0?1:0);if(!b||c<b[2])b=[s,f,c];}
  return b;
}
// ступени: r t f s o (октава) T (децима), +k/-k — полутона от тоники; A/A2/B/N — подходы к тонике следующего аккорда
function deg(w,ch,rp,np){
  const q=Q[ch[1]];
  switch(w){case 'r':return rp;case 't':return rp+q[0];case 'f':return rp+q[1];case 's':return rp+q[2];case 'o':return rp+12;case 'T':return rp+12+q[0];
    case 'N':return np;case 'A':return np>0?np-1:np+1;case 'A2':return np>1?np-2:np+2;case 'B':return np+1;}
  if(/^[+-]\d+$/.test(w))return rp+(+w);throw Error('JZB1 deg '+w);
}
// fig: (доли, аккорд, номер аккорда) → строка; vr: {pr,k,lo,a,meter}; nb — число тактов
function build(vr,fig,nb,sub){
  const pr=PR[vr.pr].slice(0,nb||99),beats=vr.meter==='3/4'?3:4,rp=c=>vr.lo+mod(vr.k+c[0]-vr.lo,12);
  const slots=[];pr.forEach((b,i)=>{const cs=Array.isArray(b[0])?b:[b];cs.forEach(c=>slots.push({c,bar:i,b:beats/cs.length}));});
  let prev=null;const bars=pr.map(()=>[]);
  slots.forEach((sl,j)=>{
    const nx=slots[(j+1)%slots.length].c,r=rp(sl.c),np=rp(nx),str=fig(sl.b,sl.c,j);let sum=0;
    str.trim().split(/\s+/).forEach(w=>{
      const m=/^([xhp]?)([A-Za-z0-9+.-]+?)(~?)(m?)(?::(\d+))?$/.exec(w);if(!m)throw Error('JZB1 tok '+w);
      const k=m[5]?+m[5]:1;sum+=k;
      if(m[2]==='.'){bars[sl.bar].push('.'+(m[5]?':'+k:''));return;}
      const [s,f]=place(deg(m[2],sl.c,r,np),vr.a,prev,m[1]==='h'||m[1]==='p');prev=s;
      bars[sl.bar].push((m[1]==='x'?SN[s]+'x':(m[1]==='h'||m[1]==='p'?SN[s]+m[1]+f:SN[s]+f)+m[3])+m[4]+(m[5]?':'+k:''));
    });
    if(sum!==sl.b*sub)throw Error('JZB1 sum '+str+' '+sum);
  });
  const out=[];for(let i=0;i<bars.length;i+=4)out.push(bars.slice(i,i+4).map(b=>b.join(' ')).join(' | '));
  return out;
}
// fb({4:…,3:…,2:…}) — фигура по числу долей аккорда; alt — чётные и нечётные аккорды
const fb=m=>(b)=>{if(m[b]==null)throw Error('JZB1 beats '+b);return m[b];};
const alt=(x,y)=>(b,c,j)=>(j%2?y:x)(b,c,j);
// упражнение: vs — 6 вариантов [прогрессия, тональность (лад на E), нижняя тоника, позиция, размер?], lvs — 5 уровней [тактов, фигура, sub?]
function ex(o,vs,lvs,sub){
  o.sub=sub;
  o.v=vs.map(([pr,k,lo,a,meter])=>{const vr={pr,k,lo,a,meter},v={l:PN[pr][0]+' в '+KN[k]+', '+POS(a)[0],lv:lvs.map(([nb,fig])=>({t:build(vr,fig,nb,sub)}))};if(meter)v.meter=meter;return v;});
  return o;
}
const en=(vs)=>vs.map(([pr,k,lo,a])=>PN[pr][1]+' in '+KN[k]+', '+POS(a)[1]);

const VS={
  B1:[['iiVI',1,0,3],['min',8,3,5],['turn',6,4,6],['cyc',3,0,5],['blues',1,0,3],['dimp',11,6,8]],
  B2:[['blues',6,4,6],['iiVI',8,3,5],['tri',1,0,3],['mblues',5,2,5],['cyc',11,5,8],['min',10,5,7]],
  B3:[['iiVI',3,2,5],['turn',1,0,3],['min',5,4,7],['long',6,4,6],['dimp',8,3,5],['blues',11,6,8]],
  B4:[['long',1,0,3],['blues',6,4,5],['bridge',6,0,5],['mblues',8,3,5],['turn',10,5,7],['cyc',5,4,7]],
  B5:[['modal',10,5,7],['iiVI',6,4,6],['min',3,2,5],['turn',8,3,5],['blues',1,0,3],['cyc',1,0,3]],
  R6:[['blues',1,0,3],['iiVI',11,6,8],['long',8,3,5],['tri',3,2,5],['mblues',10,5,7],['turn',6,4,6]],
  R7:[['turn',1,0,3],['cyc',6,4,6],['blues',8,3,5],['min',1,0,3],['iiVI',10,5,7],['bridge',1,0,5]],
  R8:[['iiVI',6,4,6,'3/4'],['min',10,5,7,'3/4'],['long',3,2,5,'3/4'],['cyc',8,3,5,'3/4'],['turn',11,6,8,'3/4'],['dimp',1,0,3,'3/4']],
  R9:[['bossa',5,4,5],['bossaM',1,0,3],['bossa',10,5,7],['bossaM',8,3,5],['min',3,2,5],['iiVI',6,4,6]],
  R10:[['turn',1,0,3],['tri',6,4,6],['dimp',3,2,5],['turn',8,3,5],['tri',11,6,8],['dimp',10,5,7]],
  R11:[['rhy',6,4,6],['bridge',6,0,5],['rhy',1,0,3],['bridge',1,0,3],['rhy',11,6,8],['rhy',8,3,5]],
  R12:[['blues',1,0,3],['blues',6,4,6],['mblues',8,3,5],['blues',8,3,5],['mblues',5,2,5],['blues',3,2,5]],
  R13:[['modal',10,5,7],['modal',5,4,5],['modal',3,2,5],['bossa',8,3,5],['mblues',10,5,7],['modal',8,3,8]],
  R14:[['iiVI',1,0,3],['blues',6,4,6],['turn',3,2,5],['min',8,3,5],['cyc',10,5,7],['rhy',6,4,6]],
  R15:[['blues',1,0,3],['long',6,4,6],['turn',11,6,8],['mblues',3,2,5],['iiVI',8,3,5],['min',5,4,7]]
};

const EX={
W0:{name:'Разминка',goal:'Разогреть руки и включить слух на свинг.',how:'Без баса минуту: потри ладони до тепла, круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем медленная хроматика в пятой позиции свинговыми восьмыми: долгая нота и короткая.',hf:'Указательный и средний по очереди, мягкий опорный удар.',hp:'Вниз на долгую ноту, вверх на короткую, медиатор неглубоко.',tip:'Только мягкие движения. Свинг здесь важнее точности: «ду-ба, ду-ба».',sub:3,v:[{l:'Хроматика свингом',t:['E5:2 E6 E7:2 E8 A5:2 A6 A7:2 A8 | D5:2 D6 D7:2 D8 G5:2 G6 G7:2 G8','G8:2 G7 G6:2 G5 D8:2 D7 D6:2 D5 | A8:2 A7 A6:2 A5 E8:2 E7 E6:2 E5']}]},
W1:{name:'Мобилизация без баса',goal:'Разогнать кровь в кистях, предплечьях и плечах.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Разведи пальцы левой руки веером и сведи 10 раз: уокинг требует растяжки на четыре лада.',hf:'Отдельно разомни подушечки указательного и среднего: на них весь уокинг.',hp:'Покрути запястьем правой руки, как будто играешь медиатором в воздухе, — свободно, без зажима.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
W2:{name:'Медленный уокинг',goal:'Синхронизировать руки на четвертях.',how:'Чистый звук, темп заведомо низкий. ii–V–I в {F} четвертями: вверх по аккорду, последняя доля — подход к следующему. Каждая нота звучит до следующей.',hf:'Чередуй указательный и средний, опорный удар.',hp:'Только вниз, ровная атака.',tip:'Между нотами не должно быть дыр: уокинг — одна непрерывная линия.',sub:3,v:[{l:'ii–V–I в {F} четвертями',t:build({pr:'iiVI',k:1,lo:0,a:3},fb({4:'r:3 t:3 f:3 A:3'}),4,3)}]},
W3:{name:'Децимы и октавы',goal:'Подготовить левую руку к растяжке, правую — к перескокам.',how:'Чистый звук, половина рабочего темпа. Тоника, квинта, октава, децима аккорда — для каждого аккорда ii–V–I в {Bb}.',hf:'Пальцы правой руки перешагивают через струну, не задевая соседние.',hp:'Альтернейт, медиатор перелетает через струну коротким движением.',tip:'Цель — тёплые руки, а не скорость.',sub:3,v:[{l:'Децимы ii–V–I в {Bb}',t:build({pr:'iiVI',k:6,lo:4,a:6},fb({4:'r:3 f:3 o:3 T:3'}),4,3)}]},

B1:{n:1,name:'Уокинг по тонам аккорда',goal:'Тоника на сильной доле, тоны аккорда между ними.',how:'Четыре ноты на такт по аккорду: тоника, терция, квинта, септима. На старших уровнях линия идёт вниз с октавы и ведёт к следующему аккорду.',hf:'Указательный и средний строго по очереди, опорный удар: палец ложится на соседнюю струну.',hp:'Только вниз, медиатор у грифа — звук круглее, ближе к контрабасу.',tip:'Тоника на первой доле — опора всего ансамбля. Остальные ноты чуть тише.',lvl:['Два такта: тоника, терция, квинта','Четыре такта: арпеджио с септимой','Вся форма: вверх и вниз с октавы','Последняя доля — подход к следующему аккорду','Скип-триоль с мёртвой нотой на третьей доле']},
B2:{n:2,name:'Хроматические подходы',goal:'Приходить в тонику следующего аккорда на полтона снизу или сверху.',how:'Последняя доля такта — нота на полтона ниже или выше следующей тоники. На старших уровнях — двойной хроматический подход.',hf:'Подход тем же движением пальцев, что и вся линия: без акцента.',hp:'Подход вниз, как и остальные ноты.',tip:'Подход звучит «неправильно» сам по себе и правильно — только когда приходит в цель.',lvl:['Два такта: тоника три доли и подход','Четыре такта: тоника, квинта, подход','Вся форма: тоника, терция, квинта, подход','Подход сверху и снизу','Двойной подход снизу']},
B3:{n:3,name:'Энклоужеры',goal:'Окружить цель: нота выше, нота ниже, потом сама цель.',how:'Перед тоникой следующего аккорда — нота на полтона выше, затем на полтона ниже. На старших уровнях окружение ложится свинговыми восьмыми.',hf:'На двух нотах окружения пальцы чередуются особенно строго.',hp:'Окружение восьмыми — вниз-вверх.',tip:'Цель — на первую долю. Окружение без цели звучит как ошибка.',lvl:['Два такта: тоника, квинта, окружение','Четыре такта','Вся форма: тоника, терция, окружение','Окружение свинговыми восьмыми','Мёртвая нота в начале такта']},
B4:{n:4,name:'Две доли (two-feel)',goal:'Половинные ноты: спокойный бас для темы и баллады.',how:'Две ноты на такт: тоника и квинта. Дальше на четвёртой доле — подход к следующему аккорду, затем мёртвая нота перед квинтой.',hf:'Каждая половинная держится до следующей: не отпускай раньше.',hp:'Вниз, медиатор у грифа, нота держится полностью.',tip:'Two-feel — ощущение двух широких шагов. Метроном на 2 и 4 помогает.',lvl:['Два такта: тоника и квинта','Четыре такта','Вся форма','Квинта и подход на четвёртой доле','Скип с мёртвой нотой']},
B5:{n:5,name:'Свинговые восьмые',goal:'Линия восьмыми в свинге: долгая и короткая.',how:'Каждая доля — две ноты, долгая на две трети, короткая на треть. По аккорду и с проходящими нотами, в конце такта — подход.',hf:'Указательный на долгую, средний на короткую. Короткая тише, но звучит.',hp:'Вниз на долгую, вверх на короткую.',tip:'Свинг держится на короткой ноте: она мягче и чуть позже ровной восьмой.',lvl:['Два такта: пары на тонах аккорда','Четыре такта с проходящими','Вся форма с подходом','Через аккорд — вниз с октавы','Триоль в начале такта']},

R6:{name:'Чарльстон',goal:'Ритм чарльстона: удар на раз и на «и» второй доли.',how:'Две ноты на такт: на первую долю и на свинговое «и» второй. Дальше добавляется подход на четвёртую долю.',hf:'Вторая нота — короткий акцент, не глуши её раньше времени.',hp:'Вниз на первую, вверх на «и».',tip:'Считай вслух «раз — и-два-И»: вторая нота на последнюю треть второй доли.',lvl:['Два такта: тоника и квинта','Четыре такта','Вся форма','Подход на четвёртую долю','Мёртвая нота перед «и»']},
R7:{name:'Предвосхищение',goal:'Следующий аккорд на «и» четвёртой доли.',how:'Последняя короткая нота такта — уже тоника следующего аккорда. Так бас толкает форму вперёд.',hf:'Предвосхищение и следующая доля — разными пальцами.',hp:'Предвосхищение — апстрок, первая доля — вниз.',tip:'Нота предвосхищения длится через тактовую черту: первую долю не повторяй громче.',lvl:['Два такта: тоника и предвосхищение','Четыре такта: тоника, квинта','Вся форма','Арпеджио и предвосхищение','Мёртвая нота и подход перед предвосхищением']},
R8:{name:'Джаз-вальс',goal:'Уокинг в 3/4: три доли, тяжёлая первая.',how:'Три ноты на такт: тоника, дальше по аккорду. На старших уровнях — подход на третьей доле и свинговые восьмые внутри такта.',hf:'Опорный удар на первую долю, две другие мягче.',hp:'Вниз на каждую долю, первая громче.',tip:'Вальс качается «РАЗ-два-три»: не превращай его в 4/4 без доли.',lvl:['Два такта: тоника и квинта','Четыре такта','Вся форма: тоны аккорда','Подход на третьей доле','Свинговая восьмая на второй доле']},
R9:{name:'Босса-нова',goal:'Ровные восьмые: тоника и квинта с предвосхищением.',how:'Прямые восьмые, не свинг. Тоника на долю с точкой, квинта на «и» второй и на третью долю. Дальше предвосхищение следующего аккорда.',hf:'Большой палец или указательный, мягко у грифа — звук как у контрабаса.',hp:'Медиатор у грифа, ладонь слегка глушит у бриджа.',tip:'Босса не свингует: восьмые ровные, долгая нота ровно три восьмых.',lvl:['Два такта: тоника и квинта половинными','Четыре такта: квинта на «и» второй доли','Вся форма: классическая фигура','Предвосхищение следующего аккорда','Октава в фигуре']},
R10:{name:'Обороты',goal:'Последние такты темы, которые возвращают к началу.',how:'Четыре аккорда по такту: обычный оборот, с тритоновой заменой или через уменьшённый. Уокинг ведёт от аккорда к аккорду.',hf:'Чередуй пальцы и на смене струны, и на одной струне.',hp:'Только вниз, ровно.',tip:'В тритоновой замене тоника аккорда — на полтона выше цели: подход получается сам.',lvl:['Два такта: тоники и квинты','Четыре такта: арпеджио','Уокинг с подходом','Окружение цели','Скип-триоль с мёртвой нотой']},
R11:{name:'Ритм-ченджи',goal:'Два аккорда в такте: тоника на каждую смену.',how:'В части A аккорды меняются через две доли: тоника и подход. В бридже — доминанты по два такта, уокинг по аккорду.',hf:'Быстрая смена аккордов — пальцы правой руки не останавливаются.',hp:'Только вниз, атака одинаковая.',tip:'На двух долях на аккорд главное — тоника на смене. Лишнее не нужно.',lvl:['Тоники на каждую долю','Тоника и квинта','Тоника и подход','Свинговая восьмая перед подходом','Триоль по аккорду и подход']},
R12:{name:'Джазовый блюз',goal:'12 тактов с джазовой гармонией.',how:'Квадрат блюза, но с ii–V в девятом-десятом тактах и оборотом в конце. Сначала two-feel, потом уокинг четвертями.',hf:'Чередуй пальцы, опорный удар на первую долю.',hp:'Вниз, медиатор у грифа.',tip:'В джазовом блюзе две формы — two-feel на первом квадрате, уокинг на втором. Привыкай к обеим.',lvl:['Четыре такта two-feel','Восемь тактов: тоника и подход половинными','Весь квадрат уокингом','Окружение цели','Мёртвая нота и подход']},
R13:{name:'Модальный вэмп',goal:'Долгий минорный аккорд: линия по дорийскому ладу.',how:'Восемь тактов минорных аккордов. Линия идёт по ладу: тоника, нона, терция, кварта, квинта; в конце такта — подход к следующему.',hf:'Указательный и средний, опорный удар; не заваливай темп на долгих аккордах.',hp:'Только вниз.',tip:'На долгом аккорде легко потеряться: считай такты вслух.',lvl:['Тоника, квинта, септима','Гамма вверх','Гамма и подход','Кварты по ладу','Октава и восьмые']},
R14:{name:'Триоли',goal:'Триоль на долю внутри уокинга.',how:'Уокинг четвертями, одна доля такта — триоль по аккорду. Дальше триоли на разных долях.',hf:'Триоль: указательный — средний — указательный, без рывка.',hp:'Альтернейт на триоли: вниз-вверх-вниз.',tip:'Триоль ровно на долю: не ускоряйся и не опаздывай на следующую.',lvl:['Два такта: триоль на первую долю','Четыре такта','Вся форма: триоль на третью долю','Две триоли в такте','Триоль, восьмые и подход']},
R15:{name:'Мёртвые ноты в уокинге',goal:'Перкуссия в линии: глухой щелчок на короткой восьмой.',how:'Уокинг, но короткая свинговая восьмая — мёртвая нота (x). Дальше мёртвые ноты на разных долях.',hf:'Мёртвая нота — тот же удар, левая рука ослабляет нажим.',hp:'Мёртвая нота — апстрок по приглушённой струне.',tip:'Мёртвая нота тише настоящей, но ритмически такая же чёткая.',lvl:['Два такта: тоника и щелчок','Четыре такта','Вся форма','Щелчок перед подходом','Щелчки на каждой доле']}
};
const LV={
  B1:[[2,fb({4:'r:3 t:3 f:3 t:3',2:'r:3 f:3'})],[4,fb({4:'r:3 t:3 f:3 s:3',2:'r:3 t:3'})],[99,alt(fb({4:'r:3 t:3 f:3 s:3',2:'r:3 t:3'}),fb({4:'o:3 s:3 f:3 t:3',2:'o:3 f:3'}))],
   [99,alt(fb({4:'r:3 t:3 f:3 A:3',2:'r:3 A:3'}),fb({4:'o:3 s:3 f:3 A:3',2:'o:3 A:3'}))],[99,alt(fb({4:'r:3 t:3 f:2 xf A:3',2:'r:2 xr A:3'}),fb({4:'o:3 s:3 f:2 xf A:3',2:'o:2 xo A:3'}))]],
  B2:[[2,fb({4:'r:3 r:3 r:3 A:3',2:'r:3 A:3'})],[4,fb({4:'r:3 r:3 f:3 A:3',2:'r:3 A:3'})],[99,fb({4:'r:3 t:3 f:3 A:3',2:'r:3 A:3'})],
   [99,alt(fb({4:'r:3 t:3 f:3 A:3',2:'r:3 A:3'}),fb({4:'r:3 f:3 t:3 B:3',2:'r:3 B:3'}))],[99,fb({4:'r:3 t:3 A2:3 A:3',2:'A2:3 A:3'})]],
  B3:[[2,fb({4:'r:3 f:3 B:3 A:3',2:'B:3 A:3'})],[4,fb({4:'r:3 f:3 B:3 A:3',2:'B:3 A:3'})],[99,fb({4:'r:3 t:3 B:3 A:3',2:'B:3 A:3'})],
   [99,fb({4:'r:3 t:3 f:3 B:2 A',2:'r:3 B:2 A'})],[99,fb({4:'r:2 xr t:3 B:3 A:3',2:'B:2 xB A:3'})]],
  B4:[[2,fb({4:'r:6 f:6',2:'r:6'})],[4,fb({4:'r:6 f:6',2:'r:6'})],[99,fb({4:'r:6 f:6',2:'r:6'})],
   [99,fb({4:'r:6 f:3 A:3',2:'r:3 A:3'})],[99,fb({4:'r:5 xr f:3 A:3',2:'r:2 xr A:3'})]],
  B5:[[2,fb({4:'r:2 r t:2 t f:2 f t:2 t',2:'r:2 r t:2 t'})],[4,fb({4:'r:2 +2 t:2 f s:2 f t:2 +2',2:'r:2 +2 t:2 f'})],[99,fb({4:'r:2 +2 t:2 f s:2 f t:2 A',2:'r:2 t f:2 A'})],
   [99,alt(fb({4:'r:2 +2 t:2 f s:2 f t:2 A',2:'r:2 t f:2 A'}),fb({4:'o:2 s f:2 t r:2 +2 t:2 A',2:'o:2 s f:2 A'}))],[99,fb({4:'r +2 t f:2 s o:2 s f:2 A',2:'r t f s:2 A'})]],
  R6:[[2,fb({4:'r:5 f:7',2:'r:6'})],[4,fb({4:'r:5 f:7',2:'r:6'})],[99,fb({4:'r:5 f:7',2:'r:5 f'})],
   [99,fb({4:'r:5 f:4 A:3',2:'r:5 A'})],[99,fb({4:'r:2 xr:3 f:4 A:3',2:'r:2 xr:3 A'})]],
  R7:[[2,fb({4:'r:9 .:2 N',2:'r:3 .:2 N'})],[4,fb({4:'r:6 f:3 .:2 N',2:'r:3 .:2 N'})],[99,fb({4:'r:6 f:3 .:2 N',2:'r:3 .:2 N'})],
   [99,fb({4:'r:3 t:3 f:3 .:2 N',2:'r:3 .:2 N'})],[99,fb({4:'r:3 t:2 xt f:3 A:2 N',2:'r:2 xr A:2 N'})]],
  R8:[[2,fb({3:'r:6 f:3'})],[4,fb({3:'r:6 f:3'})],[99,fb({3:'r:3 t:3 f:3'})],[99,fb({3:'r:3 f:3 A:3'})],[99,fb({3:'r:3 t:2 f A:3'})]],
  R9:[[2,fb({4:'r:4 f:4'})],[4,fb({4:'r:3 f:5'})],[99,fb({4:'r:3 f f:3 r'})],[99,fb({4:'r:3 f f:3 N'})],[99,fb({4:'r:3 f o:2 f N'})]],
  R10:[[2,fb({4:'r:6 f:6'})],[4,fb({4:'r:3 t:3 f:3 s:3'})],[99,fb({4:'r:3 t:3 f:3 A:3'})],[99,fb({4:'r:3 f:3 B:3 A:3'})],[99,fb({4:'r:3 t:2 xt B:3 A:3'})]],
  R11:[[99,fb({2:'r:3 r:3',4:'r:3 r:3 r:3 r:3'})],[99,fb({2:'r:3 f:3',4:'r:3 f:3 r:3 f:3'})],[99,fb({2:'r:3 A:3',4:'r:3 t:3 f:3 A:3'})],
   [99,fb({2:'r:2 t A:3',4:'r:3 t:3 f:2 s A:3'})],[99,fb({2:'r t f A:3',4:'r t f s:3 f:3 A:3'})]],
  R12:[[4,fb({4:'r:6 f:6',2:'r:6'})],[8,fb({4:'r:6 A:6',2:'r:3 A:3'})],[99,fb({4:'r:3 t:3 f:3 A:3',2:'r:3 A:3'})],[99,fb({4:'r:3 t:3 B:3 A:3',2:'B:3 A:3'})],[99,fb({4:'r:2 xr t:3 f:3 A:3',2:'r:2 xr A:3'})]],
  R13:[[99,fb({4:'r:3 f:3 s:3 f:3'})],[99,fb({4:'r:3 +2:3 t:3 +5:3'})],[99,fb({4:'r:3 +2:3 t:3 A:3'})],[99,fb({4:'r:3 +5:3 s:3 A:3'})],[99,fb({4:'r:3 f:3 o:2 s A:3'})]],
  R14:[[2,fb({4:'r t f t:3 f:3 A:3',2:'r t f A:3'})],[4,fb({4:'r t f t:3 f:3 A:3',2:'r t f A:3'})],[99,fb({4:'r:3 t:3 f s o A:3',2:'r t f A:3'})],
   [99,fb({4:'r t f f:3 s f t A:3',2:'r t f A:3'})],[99,fb({4:'r t f s:2 f t:2 r A:3',2:'r t f A:3'})]],
  R15:[[2,fb({4:'r:2 xr r:2 xr r:2 xr r:2 xr',2:'r:2 xr r:2 xr'})],[4,fb({4:'r:2 xr t:3 f:2 xf t:3',2:'r:2 xr f:3'})],[99,fb({4:'r:2 xr t:3 f:2 xf A:3',2:'r:2 xr A:3'})],
   [99,fb({4:'r:3 t:3 f:2 xf A:3',2:'r:2 xA A:3'})],[99,fb({4:'r:2 xr t:2 xt f:2 xf A:2 xA',2:'r:2 xr A:2 xA'})]]
};
Object.keys(LV).forEach(id=>ex(EX[id],VS[id],LV[id],id==='R9'?2:3));

const EXEN={
W0:{name:'Warm-up',goal:'Warm up the hands and get the ears into swing.',how:'One minute without the bass: rub your palms until warm, circle your wrists and shoulders, clench and open your fists 20 times. Then slow chromatics in fifth position in swing eighths: a long note and a short one.',hf:'Alternate index and middle, soft rest strokes.',hp:'Down on the long note, up on the short one, keep the pick shallow.',tip:'Gentle movements only. Here the swing matters more than precision: “doo-ba, doo-ba”.',v:['Swing chromatics']},
W1:{name:'Mobility without the bass',goal:'Get blood flowing in the hands, forearms and shoulders.',how:'Rub your palms until warm. Circle your wrists both ways 10 times. Shoulders up, back, down. Clench and open your fists 20 times. Spread the fretting-hand fingers like a fan and close them 10 times: walking lines need a four-fret stretch.',hf:'Work the pads of the index and middle fingers: every walking line sits on them.',hp:'Roll the picking wrist as if picking in the air: loose, no tension.',tip:'No stretching into pain: just warmth and mobility.'},
W2:{name:'Slow walking',goal:'Sync the hands on quarter notes.',how:'Clean tone, deliberately slow tempo. A ii–V–I in {F} in quarter notes: up the chord, the last beat approaches the next one. Every note lasts until the next.',hf:'Alternate index and middle, rest strokes.',hp:'Downstrokes only, even attack.',tip:'No gaps between notes: a walking line is one continuous line.',v:['ii–V–I in {F} in quarter notes']},
W3:{name:'Tenths and octaves',goal:'Prepare the fretting hand for the stretch and the plucking hand for string skips.',how:'Clean tone, half your working tempo. Root, fifth, octave and tenth of the chord, for every chord of a ii–V–I in {Bb}.',hf:'The plucking fingers step over a string without touching the neighbours.',hp:'Alternate picking, the pick hops over the string with a short motion.',tip:'The goal is warm hands, not speed.',v:['Tenths through a ii–V–I in {Bb}']},
B1:{name:'Walking on chord tones',goal:'The root on the strong beat, chord tones in between.',how:'Four notes a bar through the chord: root, third, fifth, seventh. On the higher levels the line comes down from the octave and leads into the next chord.',hf:'Index and middle strictly alternating, rest strokes: the finger comes to rest on the next string.',hp:'Downstrokes only, pick near the neck for a rounder, upright-like sound.',tip:'The root on beat one anchors the whole band. The other notes a little softer.',lvl:['Two bars: root, third, fifth','Four bars: arpeggio with the seventh','The whole form: up, and down from the octave','The last beat approaches the next chord','A skip triplet with a dead note on beat three'],v:en(VS.B1)},
B2:{name:'Chromatic approaches',goal:'Land on the next root from a half step below or above.',how:'The last beat of the bar is a half step below or above the next root. On the higher levels, a double chromatic approach.',hf:'Pluck the approach with the same finger motion as the rest of the line: no accent.',hp:'The approach is a downstroke like every other note.',tip:'An approach sounds “wrong” on its own and right only when it lands on the target.',lvl:['Two bars: root for three beats and an approach','Four bars: root, fifth, approach','The whole form: root, third, fifth, approach','Approach from above and below','Double approach from below'],v:en(VS.B2)},
B3:{name:'Enclosures',goal:'Surround the target: a note above, a note below, then the target.',how:'Before the next root: a half step above, then a half step below. On the higher levels the enclosure falls on swing eighths.',hf:'Alternate fingers especially strictly on the two enclosure notes.',hp:'An eighth-note enclosure: down-up.',tip:'The target lands on beat one. An enclosure without its target sounds like a mistake.',lvl:['Two bars: root, fifth, enclosure','Four bars','The whole form: root, third, enclosure','Enclosure in swing eighths','A dead note at the top of the bar'],v:en(VS.B3)},
B4:{name:'Two-feel',goal:'Half notes: a calm bass for the head and for ballads.',how:'Two notes a bar: root and fifth. Then an approach to the next chord on beat four, then a dead note before the fifth.',hf:'Hold every half note until the next: do not let go early.',hp:'Downstrokes, pick near the neck, let the note ring fully.',tip:'Two-feel feels like two wide steps. A metronome on 2 and 4 helps.',lvl:['Two bars: root and fifth','Four bars','The whole form','Fifth and an approach on beat four','A skip with a dead note'],v:en(VS.B4)},
B5:{name:'Swing eighths',goal:'An eighth-note line in swing: long and short.',how:'Every beat is two notes, the long one two thirds, the short one a third. Through the chord and with passing notes, an approach at the end of the bar.',hf:'Index on the long note, middle on the short one. The short note is softer but still sounds.',hp:'Down on the long note, up on the short one.',tip:'Swing lives in the short note: softer and a touch later than a straight eighth.',lvl:['Two bars: pairs on chord tones','Four bars with passing notes','The whole form with an approach','Every other chord down from the octave','A triplet at the top of the bar'],v:en(VS.B5)},
R6:{name:'Charleston',goal:'The Charleston rhythm: on one and on the “and” of two.',how:'Two notes a bar: on beat one and on the swung “and” of two. Then an approach on beat four is added.',hf:'The second note is a short accent: do not cut it off early.',hp:'Down on one, up on the “and”.',tip:'Count out loud “one — and-two-AND”: the second note is the last third of beat two.',lvl:['Two bars: root and fifth','Four bars','The whole form','Approach on beat four','A dead note before the “and”'],v:en(VS.R6)},
R7:{name:'Anticipation',goal:'The next chord on the “and” of four.',how:'The last short note of the bar is already the root of the next chord. That is how the bass pushes the form forward.',hf:'Anticipation and the next beat with different fingers.',hp:'The anticipation is an upstroke, beat one a downstroke.',tip:'The anticipated note rings across the bar line: do not hit beat one louder again.',lvl:['Two bars: root and anticipation','Four bars: root, fifth','The whole form','Arpeggio and anticipation','A dead note and an approach before the anticipation'],v:en(VS.R7)},
R8:{name:'Jazz waltz',goal:'Walking in 3/4: three beats, a heavy one.',how:'Three notes a bar: the root, then through the chord. On the higher levels, an approach on beat three and swing eighths inside the bar.',hf:'Rest stroke on beat one, the other two softer.',hp:'Downstroke on every beat, the first one louder.',tip:'A waltz sways “ONE-two-three”: do not turn it into 4/4 with a beat missing.',lvl:['Two bars: root and fifth','Four bars','The whole form: chord tones','Approach on beat three','A swing eighth on beat two'],v:en(VS.R8)},
R9:{name:'Bossa nova',goal:'Straight eighths: root and fifth with an anticipation.',how:'Straight eighths, no swing. The root on a dotted beat, the fifth on the “and” of two and on beat three. Then the next chord is anticipated.',hf:'Thumb or index, softly near the neck: it sounds like an upright.',hp:'Pick near the neck, the palm lightly mutes at the bridge.',tip:'Bossa does not swing: the eighths are even, the long note exactly three eighths.',lvl:['Two bars: root and fifth in half notes','Four bars: fifth on the “and” of two','The whole form: the classic figure','Anticipating the next chord','An octave in the figure'],v:en(VS.R9)},
R10:{name:'Turnarounds',goal:'The last bars of a tune that bring you back to the top.',how:'Four chords, one per bar: a plain turnaround, one with a tritone sub, or one through a diminished chord. The walking line leads from chord to chord.',hf:'Alternate fingers both on string changes and on one string.',hp:'Downstrokes only, even.',tip:'In a tritone sub the chord root is a half step above the target: the approach comes for free.',lvl:['Two bars: roots and fifths','Four bars: arpeggios','Walking with an approach','Enclosing the target','A skip triplet with a dead note'],v:en(VS.R10)},
R11:{name:'Rhythm changes',goal:'Two chords a bar: the root on every change.',how:'In the A section the chords change every two beats: root and approach. In the bridge, dominants two bars each, walking through the chord.',hf:'Fast changes: the plucking fingers never stop.',hp:'Downstrokes only, the same attack.',tip:'With two beats per chord the root on the change is what matters. Nothing extra.',lvl:['Roots on every beat','Root and fifth','Root and approach','A swing eighth before the approach','A triplet through the chord and an approach'],v:en(VS.R11)},
R12:{name:'Jazz blues',goal:'Twelve bars with jazz harmony.',how:'A blues form, but with a ii–V in bars nine and ten and a turnaround at the end. Two-feel first, then quarter-note walking.',hf:'Alternate fingers, rest stroke on beat one.',hp:'Downstrokes, pick near the neck.',tip:'A jazz blues has two feels: two-feel on the first chorus, walking on the second. Get used to both.',lvl:['Four bars of two-feel','Eight bars: root and approach in half notes','The whole form walking','Enclosing the target','A dead note and an approach'],v:en(VS.R12)},
R13:{name:'Modal vamp',goal:'One long minor chord: a line through the Dorian mode.',how:'Eight bars of minor chords. The line runs through the mode: root, ninth, third, fourth, fifth; an approach into the next bar at the end.',hf:'Index and middle, rest strokes; do not let the tempo sag on long chords.',hp:'Downstrokes only.',tip:'It is easy to get lost on a long chord: count the bars out loud.',lvl:['Root, fifth, seventh','Scale going up','Scale and approach','Fourths through the mode','Octave and eighths'],v:en(VS.R13)},
R14:{name:'Triplets',goal:'A triplet on one beat inside a walking line.',how:'Quarter-note walking, one beat of the bar is a triplet through the chord. Then triplets on different beats.',hf:'Triplet: index, middle, index, without a jerk.',hp:'Alternate picking on the triplet: down-up-down.',tip:'The triplet fills exactly one beat: do not rush or drag into the next.',lvl:['Two bars: a triplet on beat one','Four bars','The whole form: a triplet on beat three','Two triplets a bar','Triplet, eighths and an approach'],v:en(VS.R14)},
R15:{name:'Dead notes in walking',goal:'Percussion in the line: a dull click on the short eighth.',how:'Walking, but the short swing eighth is a dead note (x). Then dead notes on different beats.',hf:'A dead note is the same stroke, the fretting hand eases off.',hp:'A dead note is an upstroke on a muted string.',tip:'A dead note is softer than a real one but rhythmically just as sharp.',lvl:['Two bars: root and click','Four bars','The whole form','A click before the approach','Clicks on every beat'],v:en(VS.R15)}
};

const TESTS=[
  {id:'JBT1',ru:['Уокинг по ii–V–I','ii–V–I в {F} четвертями с подходами, держать 30 секунд без сбоя.'],en:['Walking a ii–V–I','A ii–V–I in {F} in quarter notes with approaches, hold 30 seconds without a slip.'],sub:3,t:build({pr:'iiVI',k:1,lo:0,a:3},fb({4:'r:3 t:3 f:3 A:3'}),4,3)},
  {id:'JBT2',ru:['Ритм-ченджи','Часть A ритм-ченджей в {Bb}: тоника и подход на каждый аккорд, два круга.'],en:['Rhythm changes','The A section of rhythm changes in {Bb}: root and approach on every chord, twice through.'],sub:3,t:build({pr:'rhy',k:6,lo:4,a:6},fb({2:'r:3 A:3'}),8,3)},
  {id:'JBT3',ru:['Уокинг на выносливость','Джазовый блюз в {F} уокингом, держать 60 секунд.'],en:['Walking endurance','A jazz blues in {F} walking, hold 60 seconds.'],sub:3,t:build({pr:'blues',k:1,lo:0,a:3},fb({4:'r:3 t:3 f:3 A:3',2:'r:3 A:3'}),12,3)},
  {id:'JBT4',ru:['Свинговые восьмые','ii–V–I в {C} свинговыми восьмыми, четыре круга подряд.'],en:['Swing eighths','A ii–V–I in {C} in swing eighths, four times in a row.'],sub:3,t:build({pr:'iiVI',k:8,lo:3,a:5},fb({4:'r:2 +2 t:2 f s:2 f t:2 A'}),4,3)},
  {id:'JBT5',ru:['Оборот с триолями','Оборот I–VI–ii–V в {G}: триоль на первую долю, четыре раза подряд без сбоя.'],en:['Turnaround with triplets','An I–VI–ii–V turnaround in {G}: a triplet on beat one, four times in a row without a slip.'],sub:3,t:build({pr:'turn',k:3,lo:2,a:5},fb({4:'r t f t:3 f:3 A:3'}),4,3)}
];
const RIFF={
  ru:['хотя бы одна пауза длиной в целую долю','тоника следующего аккорда приходит через окружение','только две нижние струны','хотя бы одна триоль на одной доле','второй раз линия отвечает сама себе: другой конец','тоника аккорда звучит на каждой первой доле','не больше шести разных нот','линия начинается с затакта: хроматический подход','половина в two-feel, половина уокингом','в линии есть мёртвая нота','одно место с двойными нотами: децима','медленно, как баллада, но линия качает'],
  en:['at least one rest a full beat long','the next root arrives through an enclosure','only the two lowest strings','at least one triplet on a single beat','the second time through, the line answers itself: a different ending','the chord root lands on every beat one','no more than six different notes','the line starts with a pickup: a chromatic approach','half in two-feel, half walking','includes a dead note','one spot with double stops: a tenth','slow, like a ballad, but the line swings']
};
return {EX,EXEN,COACH:{W0:{free:60}},TESTS,RIFF};
})();
/*@JZB1_END@*/

// ----- JZB2: джаз, бас, часть 2 -----
// Генератор: вариант = гармония (прогрессия, форма) + позиция на грифе, уровень = фигура и длина формы.
// Высоты — полутоны от открытой нижней E (0); раскладка по струнам — в окне позиции варианта.
const JZB2=(()=>{
  const S='EADG',NN=['E','F','F#','G','G#','A','A#','B','C','C#','D','D#'];
  const Q={maj7:[0,4,7,11],'6':[0,4,7,9],m7:[0,3,7,10],m6:[0,3,7,9],'7':[0,4,7,10],'7b9':[0,4,7,10],m7b5:[0,3,6,10],dim7:[0,3,6,9]};
  const SC={maj7:[0,2,4,5,7,9,11],'6':[0,2,4,5,7,9,11],m7:[0,2,3,5,7,9,10],m6:[0,2,3,5,7,9,11],'7':[0,2,4,5,7,9,10],'7b9':[0,1,4,5,7,8,10],m7b5:[0,1,3,5,6,8,10],dim7:[0,2,3,5,6,8,9]};
  // лады мелодического минора: лидийский доминант, альтерированный, мелодический минор, локрийский #2, лидийский
  const MM={'7':[0,2,4,6,7,9,10],'7b9':[0,1,3,4,6,8,10],m7:[0,2,3,5,7,9,11],m6:[0,2,3,5,7,9,11],m7b5:[0,2,3,5,6,8,10],maj7:[0,2,4,6,7,9,11],'6':[0,2,4,6,7,9,11],dim7:[0,2,3,5,6,8,9]};
  // уменьшённая: полутон-тон на доминанте, тон-полутон на dim7 и m7b5; на остальных — гамма аккорда с октавой
  const DM=q=>q==='7'||q==='7b9'?[0,1,3,4,6,7,9,10]:q==='dim7'||q==='m7b5'?[0,2,3,5,6,8,9,11]:SC[q].concat(12);
  const md=(a,b)=>((a%b)+b)%b;
  const pc=nm=>NN.indexOf(nm);
  // нота → [струна, лад] в окне p…p+4 (p−1 — растяжка), иначе ближайший лад
  const pl=(n,p)=>{while(n<0)n+=12;while(n>34)n-=12;let b=null,bs=1e9;for(let s=0;s<4;s++){const f=n-5*s;if(f<0||f>21)continue;
    const sc=f>=p&&f<=p+4?0:f===p-1?1:5+Math.min(Math.abs(f-p),Math.abs(f-p-4))+s*0.01;if(sc<bs){bs=sc;b=[s,f];}}
    if(!b)throw new Error('JZB2: нота вне грифа '+n);return b;};
  // такт: доли — число/нота {n,t,x,v}, пара [a,b] (свинг 2+1 или две восьмые), триоль [a,b,c], {h} — половинная, {w} — весь такт, {seq:[[нота,шаги]]}, null — пауза
  const bar=(beats,p,sub,nb)=>{const o=[];let st=0,ls=-1;
    const nt=(e,d)=>{st+=d;const k=d>1?':'+d:'';if(e==null){o.push('.'+k);ls=-1;return;}
      const x=typeof e==='number'?{n:e}:e,[s,f]=pl(x.n,p);
      o.push(S[s]+(x.t&&s===ls?x.t:'')+(x.x?'x':f)+(x.v?'~':'')+k);ls=s;};
    beats.forEach(b=>{if(Array.isArray(b)){if(b.length===3&&sub===3)b.forEach(y=>nt(y,1));else if(b.length===2){if(sub===3){nt(b[0],2);nt(b[1],1);}else{nt(b[0],1);nt(b[1],1);}}else throw new Error('JZB2: доля');}
      else if(b&&typeof b==='object'&&'h' in b)nt(b.h,2*sub);else if(b&&typeof b==='object'&&'w' in b)nt(b.w,nb*sub);
      else if(b&&typeof b==='object'&&b.seq)b.seq.forEach(([e,d])=>nt(e,d));else nt(b,sub);});
    if(st!==nb*sub)throw new Error('JZB2: длина такта '+st);return o.join(' ');};
  // гармонии: такт = аккорд 'нота:качество'
  const HM={
    C:{b:['D:m7','G:7','C:maj7','C:maj7'],ru:'ii–V–I в {C}',en:'ii–V–I in {C}'},
    Am:{b:['B:m7b5','E:7b9','A:m6','A:m6'],ru:'минорный ii–V–i в {A}m',en:'minor ii–V–i in {A}m'},
    Bb:{b:['C:m7','F:7','A#:maj7','G:7b9'],ru:'ii–V–I–VI в {A#}',en:'ii–V–I–VI in {A#}'},
    Fbl:{b:['F:7','A#:7','F:7','F:7','A#:7','B:dim7','F:7','D:7b9','G:m7','C:7','F:7','C:7'],ru:'джазовый блюз в {F}',en:'jazz blues in {F}'},
    Gm:{b:['C:m7','F:7','A#:maj7','D#:maj7','A:m7b5','D:7b9','G:m6','G:m6'],ru:'квартовый цикл в {G}m',en:'cycle of fourths in {G}m'},
    Eb:{b:['D#:6','C:7b9','F:m7','A#:7'],ru:'I–VI–ii–V в {D#}',en:'I–VI–ii–V in {D#}'},
    Br:{b:['D:7','D:7','G:7','G:7','C:7','C:7','F:7','F:7'],ru:'бридж ритм-чейнджес: цепочка доминант',en:'rhythm-changes bridge: a chain of dominants'},
    Tt:{b:['D:m7','C#:7','C:maj7','A:7b9'],ru:'ii–♭II7–I–VI в {C} (тритоновая замена)',en:'ii–♭II7–I–VI in {C} (tritone substitution)'},
    G:{b:['A:m7','D:7','G:maj7','E:7b9'],ru:'ii–V–I–VI в {G}',en:'ii–V–I–VI in {G}'},
    Dm:{b:['E:m7b5','A:7b9','D:m6','D:m6'],ru:'минорный ii–V–i в {D}m',en:'minor ii–V–i in {D}m'},
    RA:{b:['A#:6','G:7b9','C:m7','F:7','D:m7','G:7b9','C:m7','F:7'],ru:'ритм-чейнджес, часть A в {A#}',en:'rhythm changes, A section in {A#}'},
    Ab:{b:['G#:maj7','C#:7','C:m7','F:7b9','A#:m7','D#:7','G#:6','G#:6'],ru:'ii–V к III и I в {G#}',en:'ii–V to III and I in {G#}'}
  };
  const chords=(arr,lo)=>arr.map(s=>{const [nm,q]=s.split(':'),p=pc(nm);return {r:lo+md(p-lo,12),q};});
  const ct=(c,k)=>c.r+Q[c.q][md(k,4)]+12*Math.floor(k/4);
  const sc=(c,k)=>c.r+SC[c.q][md(k,7)]+12*Math.floor(k/7);
  const mm=(c,k)=>c.r+MM[c.q][md(k,7)]+12*Math.floor(k/7);
  const dm=(c,k)=>{const a=DM(c.q);return c.r+a[md(k,a.length)]+12*Math.floor(k/a.length);};
  const X=n=>({n,x:1}),H=n=>({n,t:'h'}),P=n=>({n,t:'p'}),V=n=>({n,v:1});
  const dom=c=>c.q==='7'||c.q==='7b9';
  // бибоп-гамма вниз от октавы: 8 нот, тоны аккорда на доли
  const BB={'7':[12,11,10,9,7,5,4,2],'7b9':[12,10,8,7,5,4,1,0],m7:[12,11,10,9,7,5,3,2],m6:[12,11,9,8,7,5,3,2],maj7:[12,11,9,8,7,5,4,2],'6':[12,11,9,8,7,5,4,2],m7b5:[12,10,8,6,5,3,1,0],dim7:[12,11,9,8,6,5,3,2]};
  // контекст фигуры: r(k) — тон аккорда, s(k) — ступень гаммы, a(d) — тоника следующего аккорда + d
  const cx=(c,n)=>({r:k=>ct(c,k),s:k=>sc(c,k),a:d=>n.r+d,m:k=>mm(c,k),d:k=>dm(c,k),b:k=>c.r+BB[c.q][k]});
  // формы по уровням: 2 такта, 4, 4, 8, вся форма (4-тактовая — дважды)
  const FORM=(b,lv)=>lv===1?b.slice(0,2):lv<4?b.slice(0,4):lv===4?(b.length>4?b.slice(0,8):b.concat(b)):(b.length>4?b:b.concat(b));
  // общие фигуры уокинга (C32, C33, C36)
  const WALK=[
    (c,n,i,{r})=>[{h:r(0)},{h:r(2)}],
    (c,n,i,{r,a})=>[r(0),r(1),r(2),a(-1)],
    (c,n,i,{r,s,a})=>i%2?[r(0),r(3),r(2),a(1)]:[r(0),s(1),s(2),a(-1)],
    (c,n,i,{r,s,a})=>i%2?[r(0),r(2),a(2),a(-1)]:[r(0),s(1),r(1),a(i%4?1:-1)],
    (c,n,i,{r,a})=>i%2?[r(0),[r(1),X(r(1))],[a(2),a(1)],a(-1)]:[r(0),r(2),[X(r(2)),X(r(2)),a(-2)],a(-1)]
  ];
  // упражнения: f — пять фигур (по уровню), v — [гармония, нижняя тоника, позиция], meter/sub — у вариантов, form — свои формы, pw — окно позиции по аккорду
  const E={
    A16:{f:[(c,n,i,{r})=>[r(0),r(1),r(2),r(3)],
            (c,n,i,{r})=>i%2?[r(4),r(3),r(2),r(1)]:[r(0),r(1),r(2),r(3)],
            (c,n,i,{r})=>[[r(0),r(1)],[r(2),r(3)],[r(4),r(3)],[r(2),r(1)]],
            (c,n,i,{r,a})=>[[r(0),r(1)],[r(2),r(3)],[r(4),r(3)],[r(2),a(-1)]],
            (c,n,i,{r,a})=>[[r(0),r(1),r(2)],[r(3),r(4),r(5)],[r(4),r(3),r(2)],[r(1),r(0),a(-1)]]],
         v:[['C',3,2],['Am',5,5],['Fbl',1,1],['Gm',5,7],['Eb',6,5],['RA',5,3]]},
    A17:{f:[(c,n,i,{r,s})=>[r(0),r(2),r(3),s(8)],
            (c,n,i,{r,s})=>i%2?[s(8),r(3),r(2),r(1)]:[r(0),r(1),r(2),r(3)],
            (c,n,i,{r,s})=>[[r(0),r(1)],[r(2),r(3)],[s(8),r(3)],[r(2),r(1)]],
            (c,n,i,{r,s,a})=>[[r(0),r(1),r(2)],[r(3),s(8),r(3)],[r(2),r(1),r(0)],[r(1),r(2),a(-1)]],
            (c,n,i,{r,s,a})=>[[r(0),r(1),r(2)],[r(3),s(8),s(12)],[s(8),r(3),r(2)],[r(1),s(1),a(-1)]]],
         v:[['C',1,2],['G',1,2],['Bb',2,5],['Dm',1,5],['Ab',2,4],['Tt',1,7]]},
    A18:{f:[(c,n,i,{r})=>[{h:r(0)},r(1),r(3)],
            (c,n,i,{r})=>[r(0),r(1),r(3),r(1)],
            (c,n,i,{r,a})=>[r(0),r(3),r(1),a(-1)],
            (c,n,i,{r,a})=>[[r(0),r(1)],[r(3),r(4)],[r(3),r(1)],[r(2),a(-1)]],
            (c,n,i,{r,a})=>[[r(0),r(1)-1,r(1)],[r(2),r(3)+1,r(3)],[r(4),r(3),r(1)],[r(2),a(1),a(-1)]]],
         v:[['C',3,2],['Bb',3,5],['Gm',5,5],['Fbl',1,3],['G',3,4],['Am',3,2]]},
    A19:{f:[(c,n,i,{b})=>[b(0),b(2),b(4),b(6)],
            (c,n,i,{b,r})=>i%2?[b(0),b(1),b(2),b(3)]:[r(0),r(1),r(2),r(3)],
            (c,n,i,{b})=>[[b(0),b(1)],[b(2),b(3)],[b(4),b(5)],[b(6),b(7)]],
            (c,n,i,{b,a})=>[[b(0),b(1)],[b(2),b(3)],[b(4),b(5)],[b(6),a(-1)]],
            (c,n,i,{b,r,a})=>[[b(0),b(1),b(2)],[b(3),b(4),b(5)],[b(6),b(7),r(0)],[r(1),r(2),a(-1)]]],
         v:[['Br',1,3],['C',1,5],['Fbl',1,5],['RA',3,3],['G',1,2],['Gm',3,5]]},
    A20:{f:[(c,n,i,{r,a})=>[r(0),r(2),a(1),a(-1)],
            (c,n,i,{r,a})=>[r(0),r(3),a(2),a(-1)],
            (c,n,i,{r,a})=>[[r(0),r(1)],[r(2),r(3)],[a(2),a(1)],[a(-2),a(-1)]],
            (c,n,i,{r,a})=>[[r(0),r(1)+1,r(1)-1],[r(1),r(2),r(3)],[r(4),r(3),r(2)],[a(2),a(1),a(-1)]],
            (c,n,i,{r,a})=>[[r(1)+1,r(1)-1,r(1)],[r(2)+1,r(2)-1,r(2)],[r(3)+1,r(3)-1,r(3)],[a(2),a(1),a(-1)]]],
         v:[['C',3,4],['Fbl',3,1],['Am',5,4],['Eb',3,3],['Br',3,5],['Ab',4,4]]},
    A21:{f:[(c,n,i,{m})=>[m(0),m(1),m(2),m(3)],
            (c,n,i,{m})=>i%2?[m(7),m(6),m(5),m(4)]:[m(0),m(2),m(4),m(6)],
            (c,n,i,{m})=>[[m(0),m(1)],[m(2),m(3)],[m(4),m(5)],[m(6),m(7)]],
            (c,n,i,{m,a})=>[[m(7),m(6)],[m(5),m(4)],[m(3),m(2)],[m(1),a(-1)]],
            (c,n,i,{m,a})=>[[m(0),m(2),m(1)],[m(3),m(2),m(4)],[m(3),m(5),m(4)],[m(6),m(5),a(-1)]]],
         v:[['Am',5,5],['Dm',1,5],['Br',3,3],['Tt',1,2],['Gm',3,5],['Eb',3,3]]},
    A22:{f:[(c,n,i,{d})=>[d(0),d(1),d(2),d(3)],
            (c,n,i,{d})=>[d(0),d(2),d(4),d(6)],
            (c,n,i,{d})=>[[d(0),d(1)],[d(2),d(3)],[d(4),d(5)],[d(6),d(7)]],
            (c,n,i,{d,a})=>[[d(1),d(0)],[d(3),d(2)],[d(5),d(4)],[d(6),a(-1)]],
            (c,n,i,{d,a})=>[[d(0),d(1),d(2)],[d(2),d(3),d(4)],[d(4),d(5),d(6)],[d(6),d(7),a(-1)]]],
         v:[['Br',3,3],['Fbl',1,3],['Am',3,4],['Gm',3,5],['Eb',3,5],['RA',4,4]]},
    A23:{f:[(c,n,i,{r},t)=>dom(c)?[{h:r(0)},{h:t}]:[r(0),r(1),r(2),r(3)],
            (c,n,i,{r},t)=>dom(c)?[t,t+4,t+7,t+10]:[r(0),r(1),r(2),r(3)],
            (c,n,i,{r},t)=>dom(c)?[[t,t+4],[t+7,t+10],[t+12,t+10],[t+7,t+4]]:[[r(0),r(1)],[r(2),r(3)],[r(4),r(3)],[r(2),r(1)]],
            (c,n,i,{r,a},t)=>dom(c)?[[t+12,t+10],[t+9,t+7],[t+5,t+4],[t+2,a(1)]]:[[r(0),r(1)],[r(2),r(3)],[r(4),r(3)],[r(2),a(-1)]],
            (c,n,i,{r,a},t)=>dom(c)?[[t,t+4,t+7],[t+10,t+12,t+10],[t+7,t+4,t+2],[t+1,a(2),a(1)]]:[[r(0),r(1),r(2)],[r(3),r(4),r(3)],[r(2),r(1),r(0)],[r(1),a(1),a(-1)]]],
         v:[['C',3,3],['Fbl',3,3],['Br',3,4],['Gm',3,5],['Eb',3,3],['G',3,2]]},
    A37:{f:[(c,n,i,{r})=>[r(0),r(1),r(2)],
            (c,n,i,{r})=>i%2?[r(3),r(2),r(1)]:[r(0),r(1),r(2)],
            (c,n,i,{r})=>[[r(0),r(1)],[r(2),r(3)],[r(4),r(3)]],
            (c,n,i,{r,a})=>[[r(0),r(1)],[r(2),r(3)],[r(2),a(-1)]],
            (c,n,i,{r,a})=>[[r(0),r(1),r(2)],[r(3),r(4),r(3)],[r(2),r(1),a(-1)]]],
         meter:'3/4',v:[['C',3,2],['Dm',1,5],['Bb',3,5],['Gm',5,5],['Eb',3,3],['Ab',4,4]]},
    L24:{f:[(c,n,i,{r,a})=>[r(0),r(1),r(2),a(-1)],
            (c,n,i,{r,a})=>[r(0),r(1),r(2),a(1)],
            (c,n,i,{r,a})=>i%2?[r(0),r(2),r(1),a(1)]:[r(0),r(1),r(2),a(-1)],
            (c,n,i,{r,a})=>i%2?[r(0),r(2),a(2),a(1)]:[r(0),r(1),a(-2),a(-1)],
            (c,n,i,{r,a})=>i%2?[r(0),r(2),[a(2),a(1)],a(-1)]:[r(0),r(2),r(1),[X(r(1)),a(-1)]]],
         v:[['C',3,2],['Fbl',1,1],['Br',3,3],['Gm',3,5],['Eb',3,3],['RA',3,3]]},
    L25:{f:[(c,n,i,{r,s})=>[r(0),s(1),s(2),s(4)],
            (c,n,i,{r,s,a})=>[r(0),s(1),s(2),a(-1)],
            (c,n,i,{r,s,a})=>i%2?[r(4),r(3),r(2),a(-1)]:[r(0),s(1),s(2),a(-1)],
            (c,n,i,{r,s,a})=>i%2?[r(4),s(6),r(2),a(1)]:[r(0),r(2),r(4),a(-1)],
            (c,n,i,{r,s,a})=>i%2?[r(4),s(6),r(2),[X(r(2)),X(r(2)),a(1)]]:[r(0),s(1),s(2),[X(s(2)),X(s(2)),a(-1)]]],
         v:[['Fbl',1,1],['RA',3,3],['Gm',3,5],['Ab',4,4],['G',3,2],['Br',3,3]]},
    L26:{f:[(c,n,i,{r})=>[{h:r(0)},{h:r(2)}],
            (c,n,i,{r,a})=>[{h:r(0)},r(2),a(-1)],
            (c,n,i,{r,a})=>[{h:r(0)},[r(2),X(r(2))],a(-1)],
            (c,n,i,{r,a})=>i%2?[r(0),r(1),r(2),a(-1)]:[{h:r(0)},r(2),a(1)],
            (c,n,i,{r,a})=>[{h:r(0)},[r(2),X(r(2))],[a(1),a(-1)]]],
         v:[['RA',3,3],['Fbl',1,1],['C',3,2],['Gm',3,5],['Ab',4,4],['Eb',3,3]]},
    L27:{f:[(c,n,i,{r})=>[r(0),r(4),r(0),r(4)],
            (c,n,i,{r})=>[r(0),r(4),r(2),r(5)],
            (c,n,i,{r,a})=>[r(0),r(5),r(2),a(-1)],
            (c,n,i,{r,a})=>[[r(0),r(4)],[r(5),r(4)],[r(2),r(5)],[r(3),a(-1)]],
            (c,n,i,{r,a})=>[[r(0),r(2),r(4)],[r(5),r(4),r(2)],[r(3),r(5),r(4)],[r(2),r(1),a(-1)]]],
         v:[['C',3,3],['Bb',1,1],['Fbl',1,1],['Eb',1,3],['G',3,3],['Am',3,4]]},
    L28:{f:[(c,n,i,{r,s})=>[[r(0),H(s(1))],s(2),{h:r(2)}],
            (c,n,i,{r,s})=>[[r(0),H(s(1))],[s(2),P(s(1))],[r(0),H(s(1))],s(2)],
            (c,n,i,{r,s,a})=>[[r(0),H(s(1))],[s(2),H(s(3))],[s(4),P(s(3))],[s(2),a(-1)]],
            (c,n,i,{r,s,a})=>[[r(0),H(s(1)),H(s(2))],[s(4),P(s(3)),P(s(2))],[r(0),H(s(1)),s(2)],[s(1),r(0),a(-1)]],
            (c,n,i,{r,s,a})=>[[s(4),P(s(3)),P(s(2))],[s(1),H(s(2)),P(s(1))],[r(0),H(s(1)),H(s(2))],[s(4),s(2),a(-1)]]],
         v:[['Dm',1,5],['C',3,2],['G',3,2],['Gm',3,5],['Bb',3,3],['Am',3,4]]},
    L29:{f:[(c,n,i,{r})=>[r(0),r(1),r(2),r(3)],
            (c,n,i,{r,a})=>[r(0),r(1),r(2),a(-1)],
            (c,n,i,{r,a})=>[[r(0),r(1)],[r(2),r(3)],[r(4),r(3)],[r(2),a(-1)]],
            (c,n,i,{s,a})=>[[s(0),s(1)],[s(2),s(3)],[s(4),s(5)],[s(6),a(-1)]],
            (c,n,i,{r,s,a})=>[[s(0),s(1),s(2)],[r(2),s(5),r(3)],[r(4),r(3),r(2)],[r(1),r(0),a(-1)]]],
         pw:(c,v)=>Math.max(0,c.r-5*v[3]),v:[['C',3,0,0],['Fbl',5,0,1],['Gm',5,0,1],['Ab',4,0,0],['RA',5,0,1],['Br',5,0,0]]},
    L30:{f:[(c,n,i,{r})=>[r(0),r(2),[r(4),r(3),r(2)],r(1)],
            (c,n,i,{r,a})=>[r(0),[r(1),r(2),r(3)],r(4),a(-1)],
            (c,n,i,{r,a})=>[[r(0),r(1),r(2)],r(3),[r(4),r(3),r(2)],a(-1)],
            (c,n,i,{s,r,a})=>[[s(0),s(1),s(2)],[s(3),s(4),s(5)],[s(6),r(4),s(6)],[s(5),s(4),a(-1)]],
            (c,n,i,{r,a})=>[[r(0),X(r(0)),r(1)],[r(2),X(r(2)),r(3)],[r(4),r(3),r(2)],[r(1),X(r(1)),a(-1)]]],
         v:[['G',3,2],['Fbl',1,3],['Gm',3,5],['C',3,4],['RA',3,3],['Am',5,5]]},
    L31:{f:[(c,n,i,{r})=>[{w:V(r(0))}],
            (c,n,i,{r})=>[{h:V(r(0))},{h:V(r(2))}],
            (c,n,i,{r,a})=>[{h:V(r(0))},r(2),a(-1)],
            (c,n,i,{r,a})=>[{h:V(r(0))},[r(2),r(3)],[r(4),a(-1)]],
            (c,n,i,{r,a})=>[V(r(0)),[r(1),r(2)],{h:V(r(3))}]],
         v:[['Eb',3,3],['C',3,5],['Ab',4,4],['Gm',3,5],['Dm',1,5],['Tt',3,3]]},
    // босса-нова: прямые восьмые, деление 2
    L38:{f:[(c,n,i,{r})=>[{h:r(0)},{h:r(2)}],
            (c,n,i,{r})=>[{seq:[[r(0),3],[r(2),1],[r(2),3],[r(0),1]]}],
            (c,n,i,{r,a})=>[{seq:[[r(0),3],[r(2),1],[r(2),3],[a(-1),1]]}],
            (c,n,i,{r,a})=>[{seq:[[r(0),3],[r(2),1],[r(2),2],[r(4),1],[a(-1),1]]}],
            (c,n,i,{r,a})=>[{seq:[[r(0),1],[X(r(0)),1],[r(0),1],[r(2),1],[r(4),1],[r(2),1],[X(r(2)),1],[a(-1),1]]}]],
         sub:2,v:[['C',3,2],['Am',3,4],['Dm',1,5],['Eb',3,3],['Gm',3,5],['Tt',3,3]]},
    C32:{f:WALK,form:(b,lv)=>b.slice(0,[4,4,8,12,12][lv-1]),
         v:[['k:C,F,A#',3,3],['k:D#,G#,C#',3,3],['k:F#,B,E',3,4],['k:A,D,G',3,3],['m:D,G,C',3,5],['k:C,A#,G#',3,3]]},
    C33:{f:WALK,form:(b,lv)=>b.slice(0,[4,4,8,12,12][lv-1]),
         v:[['Fbl',1,1],['Bbl',3,3],['Cmb',3,5],['Gbl',3,3],['Ebl',3,3],['Amb',5,5]]},
    C34:{f:[(c,n,i,{r})=>[{w:r(0)}],
            (c,n,i,{r})=>[{h:r(0)},r(2)],
            (c,n,i,{r,a})=>[r(0),r(2),a(-1)],
            (c,n,i,{r,a})=>[r(0),[r(2),r(3)],a(-1)],
            (c,n,i,{r,a})=>[r(0),[X(r(0)),r(2)],[a(1),a(-1)]]],
         meter:'3/4',v:[['G',3,2],['Gm',3,5],['Fbl',1,1],['Ab',4,4],['Am',5,5],['RA',3,3]]},
    C35:{f:[(c,n,i,{r,s})=>[r(0),s(2),r(2),null],
            (c,n,i,{r,s})=>[[r(0),s(1)],[s(2),r(2)],r(3),null],
            (c,n,i,{r,s,a})=>[[r(0),s(1)],[s(2),r(2)],[r(4),r(3),r(2)],a(-1)],
            (c,n,i,{r,s,a})=>i%2?[null,null,[r(4),r(3),r(2)],a(-1)]:[[r(0),s(1)],[s(2),s(3)],r(2),null],
            (c,n,i,{r,s,a})=>i%2?[null,[r(4),P(s(5)),r(2)],[s(3),s(2),s(1)],a(-1)]:[[r(0),H(s(1)),s(2)],[s(3),s(4),H(s(5))],r(4),null]],
         v:[['C',3,4],['Gm',3,5],['Fbl',1,3],['Am',5,5],['Eb',3,3],['G',3,2]]}
  };
  // формы блюза для C33
  Object.assign(HM,{
    Bbl:{b:['A#:7','D#:7','A#:7','A#:7','D#:7','E:dim7','A#:7','G:7b9','C:m7','F:7','A#:7','F:7'],ru:'джазовый блюз в {A#}',en:'jazz blues in {A#}'},
    Cmb:{b:['C:m7','C:m7','C:m7','C:m7','F:m7','F:m7','C:m7','C:m7','G#:7','G:7b9','C:m7','G:7b9'],ru:'минорный блюз в {C}m',en:'minor blues in {C}m'},
    Gbl:{b:['G:7','C:7','G:7','D:m7','C:7','C#:dim7','G:7','E:7b9','A:m7','D:7','G:7','D:7'],ru:'блюз в {G} с ii–V к IV',en:'blues in {G} with a ii–V into IV'},
    Ebl:{b:['D#:7','G#:7','D#:7','D#:7','G#:7','A:dim7','D#:7','C:7b9','F:m7','A#:7','D#:7','A#:7'],ru:'джазовый блюз в {D#}',en:'jazz blues in {D#}'},
    Amb:{b:['A:m6','A:m6','A:m6','A:m6','D:m7','D:m7','A:m6','A:m6','F:7','E:7b9','A:m6','E:7b9'],ru:'минорный блюз в {A}m с ♭VI7',en:'minor blues in {A}m with ♭VI7'}
  });
  // ii–V–I по тональностям (C32): 'k:C,F,A#' — мажор, 'm:D,G,C' — минор
  const keyH=h=>{const [t,ks]=h.split(':'),K=ks.split(','),mj=t==='k';
    const nm=(k,d)=>NN[md(pc(k)+d,12)];
    return {b:K.flatMap(k=>mj?[nm(k,2)+':m7',nm(k,7)+':7',k+':maj7',k+':maj7']:[nm(k,2)+':m7b5',nm(k,7)+':7b9',k+':m6',k+':m6']),
      ru:(mj?'ii–V–I в ':'минорный ii–V–i в ')+K.map(k=>'{'+k+'}'+(mj?'':'m')).join(', '),en:(mj?'ii–V–I in ':'minor ii–V–i in ')+K.map(k=>'{'+k+'}'+(mj?'':'m')).join(', ')};};
  const harm=h=>h.includes(':')?keyH(h):HM[h];
  const posRu=p=>p?p+'-я позиция':'открытая позиция',posEn=p=>p?'position '+p:'open position';
  // уровень варианта: системы по 4 такта
  const lvTab=(id,v,lv)=>{const e=E[id],h=harm(v[0]),sub=e.sub||3,nb=e.meter?+e.meter[0]:4;
    const cs=chords((e.form||FORM)(h.b,lv),v[1]);
    const bars=cs.map((c,i)=>{const n=cs[(i+1)%cs.length],t=c.r+6>v[1]+11?c.r-6:c.r+6;
      return bar(e.f[lv-1](c,n,i,cx(c,n),t),e.pw?e.pw(c,v):v[2],sub,nb);});
    const o=[];for(let i=0;i<bars.length;i+=4)o.push(bars.slice(i,i+4).join(' | '));return o;};
  // C36: этюд из 4 фрагментов; фрагмент — фигура упражнения на двух аккордах гармонии (уровни 1–2 — такт, 3–5 — два)
  const FRG={walk:['L25','уокинг','walking'],two:['L26','две доли','two-feel'],arp:['A16','арпеджио','arpeggios'],bop:['A19','бибоп','bebop'],
    enc:['A20','энклоужеры','enclosures'],sol:['C35','соло','solo'],ten:['L27','десятые','tenths'],tri:['L30','триоли','triplets']};
  const ETU=[[['walk','two','arp','enc'],'C',3,3],[['two','bop','walk','sol'],'Fbl',1,3],[['arp','tri','enc','walk'],'Gm',3,5],
    [['sol','walk','ten','bop'],'Eb',3,3],[['two','enc','tri','walk'],'RA',3,3],[['bop','arp','sol','two'],'Am',5,5]];
  const c36=(k,lv)=>{const [fr,hk,lo,p]=ETU[k],b=HM[hk].b;
    return fr.map((f,j)=>{const e=E[FRG[f][0]],cs=chords([b[(2*j)%b.length],b[(2*j+1)%b.length]],lo).slice(0,lv<3?1:2);
      return cs.map((c,i)=>{const n=cs[i+1]||chords([b[(2*j+cs.length)%b.length]],lo)[0];return bar(e.f[lv-1](c,n,i,cx(c,n),c.r+6),p,3,4);}).join(' | ');});};
  // тексты [RU, EN]: name, goal, how, tip, hf, hp, lvl
  const T={
    A16:[{name:'Арпеджио септаккордов',goal:'Тоны аккорда — основа любой джазовой басовой линии.',how:'Тоника, терция, квинта, септима каждого аккорда формы. Аппликатура остаётся в позиции варианта, меняются аккорды. Свинг: первая нота пары длиннее.',tip:'Назови вслух каждый аккорд, прежде чем играть. Арпеджио должно звучать как этот аккорд, а не как гамма.',hf:'Чередуй i-m; на смене струны палец ложится на нижнюю струну и глушит её.',hp:'Медиатор у грифа, мягкий штрих: звук ближе к контрабасу. На свинге вниз на долгую, вверх на короткую.',lvl:['Вверх четвертями, два такта','Вверх и вниз, четыре такта','Свинговые восьмые с октавой','С хроматическим подходом к следующему аккорду','Триоли с децимой, вся форма']},
         {name:'Seventh-chord arpeggios',goal:'Chord tones are the base of every jazz bass line.',how:'Root, third, fifth and seventh of every chord in the form. The fingering stays in the variant’s position; the chords change. Swing: the first note of each pair is longer.',tip:'Name each chord out loud before you play it. The arpeggio should sound like that chord, not like a scale.',hf:'Alternate i-m; on a string change the finger lands on the lower string and mutes it.',hp:'Pick near the neck with a soft stroke for an upright-like tone. On swing: down on the long note, up on the short one.',lvl:['Up in quarters, two bars','Up and down, four bars','Swung eighths with the octave','With a chromatic approach to the next chord','Triplets with the tenth, the whole form']}],
    A17:[{name:'Нона и расширения',goal:'Девятая, одиннадцатая и тринадцатая ступени над септаккордом.',how:'К тонам аккорда добавляется нона — ступень гаммы аккорда на октаву выше второй. На 5-м уровне — ещё тринадцатая. Над минорным ii–V нона бывает малой: слушай, как она меняет краску.',tip:'Расширение — краска, а не опора. Тоника и терция остаются на сильных долях.',hf:'Нона далеко от тоники: переставь руку заранее, не тянись.',hp:'Триоли — альтернейт; акцент ходит по долям, слушай его.',lvl:['Тоника, квинта, септима, нона','Вверх и вниз через нону','Свинг с ноной','Триоли с подходом','Триоли с тринадцатой, вся форма']},
         {name:'Ninths and extensions',goal:'The ninth, eleventh and thirteenth over a seventh chord.',how:'The ninth joins the chord tones: the second scale step an octave up. Level 5 adds the thirteenth. Over a minor ii–V the ninth can be flat: listen to how it changes the colour.',tip:'An extension is a colour, not a landing point. Root and third stay on the strong beats.',hf:'The ninth is far from the root: shift your hand early, do not stretch.',hp:'Alternate picking on triplets; the accent moves across the beats, listen to it.',lvl:['Root, fifth, seventh, ninth','Up and down through the ninth','Swing with the ninth','Triplets with an approach','Triplets with the thirteenth, the whole form']}],
    A18:[{name:'Гайд-тоны',goal:'Терция и септима — ноты, которые определяют аккорд. Слышать, как они ведут к следующему аккорду.',how:'Тоника, терция, септима. Септима одного аккорда обычно в полутоне или тоне от терции следующего — линия идёт сама. На 5-м уровне к гайд-тонам подходишь хроматически снизу и сверху.',tip:'Пой гайд-тоны вместе с басом. Когда слышишь их, линия получается без расчёта.',hf:'Терция и септима — разные пальцы, рука в позиции.',hp:'Гайд-тоны чуть громче остальных нот: штрих вниз.',lvl:['Тоника, терция, септима','Гайд-тоны на долях','С подходом к следующей тонике','Свинг с октавой','Хроматика к гайд-тонам, триоли']},
         {name:'Guide tones',goal:'The third and seventh define the chord. Hear how they lead into the next chord.',how:'Root, third, seventh. One chord’s seventh is usually a half or whole step from the next chord’s third, so the line moves by itself. On level 5 you approach the guide tones chromatically from below and above.',tip:'Sing the guide tones along with the bass. Once you hear them, the line needs no calculation.',hf:'Third and seventh on different fingers, the hand stays in position.',hp:'Guide tones slightly louder than the rest: downstrokes.',lvl:['Root, third, seventh','Guide tones on the beats','With an approach to the next root','Swing with the octave','Chromatics into the guide tones, triplets']}],
    A19:[{name:'Бибоп-гамма',goal:'Гамма с проходящей нотой: тоны аккорда сами встают на доли.',how:'Вниз от октавы восьмью нотами: на доминанте между тоникой и малой септимой — большая септима, на миноре и мажоре — своя проходящая. Восемь восьмых — тоны аккорда на каждой доле.',tip:'Проверь: на каждой доле — тон аккорда. Если нет, ты сбился на проходящей.',hf:'Проходящая — свободный палец рядом, рука не прыгает.',hp:'Альтернейт, вниз на долю.',lvl:['Через ступень, четвертями','Аккорд и гамма по тактам','Свинг: вся бибоп-гамма','С подходом к следующему аккорду','Триоли: гамма и арпеджио, вся форма']},
         {name:'Bebop scale',goal:'A scale with a passing note: the chord tones fall on the beats by themselves.',how:'Down from the octave in eight notes: on a dominant the major seventh sits between the root and the flat seventh; minor and major chords have their own passing note. Eight eighths put a chord tone on every beat.',tip:'Check that every beat is a chord tone. If not, you slipped on the passing note.',hf:'The passing note uses a free finger next to it; the hand does not jump.',hp:'Alternate picking, down on the beat.',lvl:['Every other note, quarters','Chord and scale by bars','Swing: the whole bebop scale','With an approach to the next chord','Triplets: scale and arpeggio, the whole form']}],
    A20:[{name:'Энклоужеры',goal:'Обойти целевую ноту сверху и снизу и попасть на неё точно в долю.',how:'Целевая нота — тоника следующего аккорда или тон текущего. Перед ней — нота сверху (ступень гаммы или полутон) и полутон снизу. На 5-м уровне окружён каждый тон аккорда.',tip:'Энклоужер слышен только тогда, когда цель стоит на доле. Считай.',hf:'Три ноты энклоужера — три соседних пальца, рука не едет.',hp:'Альтернейт, цель — штрих вниз.',lvl:['Сверху и снизу к следующей тонике','Ступень сверху, полутон снизу','Двойной энклоужер свингом','Окружить терцию, триоли','Окружить каждый тон аккорда']},
         {name:'Enclosures',goal:'Surround a target note from above and below and land on it exactly on the beat.',how:'The target is the next chord’s root or a tone of the current chord. Before it: a note above (a scale step or a half step) and a half step below. On level 5 every chord tone is enclosed.',tip:'An enclosure is heard only when the target is on the beat. Count.',hf:'The three enclosure notes are three neighbouring fingers; the hand does not move.',hp:'Alternate picking, the target on a downstroke.',lvl:['Above and below the next root','Scale step above, half step below','Double enclosure, swung','Enclose the third, triplets','Enclose every chord tone']}],
    A21:[{name:'Лады мелодического минора',goal:'Звук современного джаза: лидийский доминант, альтерированная гамма, минор с большой септимой.',how:'На каждом аккорде — свой лад мелодического минора: на доминанте лидийский доминант, на доминанте перед минором — альтерированная, на минорной тонике — мелодический минор, на m7b5 — локрийский с большой секундой.',tip:'Не учи лады отдельно — это одна гамма с разных нот. Найди её на грифе.',hf:'Позиция в пять ладов: на растяжке — указательный тянется назад, а не мизинец вперёд.',hp:'Альтернейт, вниз на долю.',lvl:['Четыре ступени','Через ступень вверх, подряд вниз','Свинг: семь ступеней и октава','Свинг вниз с подходом','Терции триолями']},
         {name:'Melodic minor modes',goal:'The sound of modern jazz: lydian dominant, the altered scale, minor with a major seventh.',how:'Each chord gets its own melodic-minor mode: lydian dominant on a dominant, altered on a dominant resolving to minor, melodic minor on a minor tonic, locrian with a natural second on m7b5.',tip:'Do not learn the modes separately: it is one scale from different notes. Find it on the neck.',hf:'A five-fret position: on a stretch the index reaches back rather than the pinky forward.',hp:'Alternate picking, down on the beat.',lvl:['Four steps','Skipping up, stepwise down','Swing: seven steps and the octave','Swing down with an approach','Thirds in triplets']}],
    A22:[{name:'Уменьшённая гамма',goal:'Симметричная гамма на доминанте и уменьшённом аккорде.',how:'На доминанте — полутон-тон, на dim7 и m7b5 — тон-полутон. Гамма повторяется через малую терцию, поэтому одна аппликатура работает в четырёх тональностях. На остальных аккордах — их гамма.',tip:'Слушай малые терции внутри гаммы: через ступень она даёт уменьшённый аккорд.',hf:'Две ноты на струне через полутон, потом через тон — пальцы 1-2, 1-3 по очереди.',hp:'Альтернейт; на смене струны не размахивайся.',lvl:['Четыре ноты гаммы','Через ступень: уменьшённый аккорд','Свинг: восемь нот','Свинг парами наоборот','Триоли с подходом']},
         {name:'Diminished scale',goal:'A symmetrical scale for dominant and diminished chords.',how:'Half-whole on a dominant, whole-half on dim7 and m7b5. The scale repeats every minor third, so one fingering covers four keys. Other chords use their own scale.',tip:'Listen to the minor thirds inside the scale: skipping a step gives a diminished chord.',hf:'Two notes per string a half step apart, then a whole step: fingers 1-2 and 1-3 in turn.',hp:'Alternate picking; keep the motion small on string changes.',lvl:['Four scale notes','Skipping a step: the diminished chord','Swing: eight notes','Swung pairs reversed','Triplets with an approach']}],
    A23:[{name:'Тритоновая замена',goal:'Доминанта, заменённая аккордом на тритон выше: линия идёт к тонике полутоном сверху.',how:'На каждом доминантсептаккорде играешь арпеджио аккорда на тритон выше (вместо G7 — C#7). Остальные аккорды — обычным арпеджио. Тоника замены на полутон выше цели.',tip:'Сыграй такт обычной доминантой, потом заменой. Сравни, как приходишь на следующий аккорд.',hf:'Замена в той же позиции, что и аккорд: тритон — это шесть ладов, ищи ноту на соседней струне.',hp:'Вниз на тонику замены — это главная нота такта.',lvl:['Тоника и тоника замены','Арпеджио замены','Свинг: вверх и вниз','Гамма замены с подходом сверху','Триоли, вся форма']},
         {name:'Tritone substitution',goal:'A dominant replaced by the chord a tritone away: the line falls into the root from a half step above.',how:'On every dominant seventh you arpeggiate the chord a tritone away (C#7 instead of G7). Other chords get their normal arpeggio. The substitute root sits a half step above the target.',tip:'Play a bar with the plain dominant, then with the substitute. Compare how you arrive at the next chord.',hf:'Keep the substitute in the same position as the chord: a tritone is six frets, find it on the next string.',hp:'Downstroke on the substitute root: it is the main note of the bar.',lvl:['Root and substitute root','Substitute arpeggio','Swing: up and down','Substitute scale with an approach from above','Triplets, the whole form']}],
    A37:[{name:'Арпеджио в джаз-вальсе',goal:'Тоны аккорда в размере 3/4: сильная доля одна на такт.',how:'Три доли в такте. Тоника на первую долю, остальное — тоны аккорда. На 3–5 уровне — свинговые восьмые и триоли.',tip:'Вальс качает на первой доле. Две другие — легче.',hf:'Чередуй i-m; в 3/4 первая доля каждый такт начинается с другого пальца — это нормально.',hp:'Первая доля вниз, остальные альтернейтом.',lvl:['Тоника, терция, квинта','Вверх и вниз через такт','Свинг с септимой и октавой','С подходом к следующему аккорду','Триоли с подходом, вся форма']},
         {name:'Jazz-waltz arpeggios',goal:'Chord tones in 3/4: one strong beat per bar.',how:'Three beats per bar. The root on beat one, the rest are chord tones. Swung eighths and triplets on levels 3–5.',tip:'A waltz leans on beat one. The other two are lighter.',hf:'Alternate i-m; in 3/4 each bar starts with a different finger, and that is fine.',hp:'Beat one down, the rest alternate.',lvl:['Root, third, fifth','Up and down every other bar','Swing with the seventh and octave','With an approach to the next chord','Triplets with an approach, the whole form']}],
    L24:[{name:'Хроматические подходы',goal:'Приходить на тонику следующего аккорда полутоном снизу или сверху.',how:'Три тона аккорда и на четвёртую долю — подход к следующей тонике. На 4-м уровне — двойной хроматический подход, на 5-м — с мёртвой нотой свингом.',tip:'Подход работает, только если следующая тоника точно на долю.',hf:'Подход — свободный палец рядом с целью.',hp:'Подход — тот же штрих, без акцента.',lvl:['Подход снизу','Подход сверху','Снизу и сверху по очереди','Двойной подход','Подходы с мёртвой нотой, вся форма']},
         {name:'Chromatic approaches',goal:'Arrive on the next chord’s root from a half step below or above.',how:'Three chord tones and, on beat four, an approach to the next root. Level 4 has a double chromatic approach, level 5 a swung dead note.',tip:'An approach works only if the next root lands exactly on the beat.',hf:'The approach uses a free finger next to the target.',hp:'The approach gets the same stroke, no accent.',lvl:['Approach from below','Approach from above','Below and above in turn','Double approach','Approaches with a dead note, the whole form']}],
    L25:[{name:'Уокинг по ступеням',goal:'Шагающая линия по гамме аккорда: каждая доля — нота, на 4-й — ход к следующему аккорду.',how:'Тоника, ступени гаммы вверх, на 4-ю долю — подход. На 3–4 уровне чередуются такты вверх и вниз. На 5-м на четвёртой доле — триоль с двумя мёртвыми нотами («скип»).',tip:'Уокинг держит время за всю группу. Ровность важнее нот.',hf:'Чередуй i-m строго, даже на одной струне.',hp:'Все вниз, медиатор у грифа — звук как у контрабаса.',lvl:['1-2-3-5','1-2-3 и подход','Вверх и вниз по тактам','Шире: через октаву','Со «скипом» на четвёртой доле']},
         {name:'Stepwise walking',goal:'A walking line along the chord’s scale: a note on every beat, beat four moves to the next chord.',how:'Root, scale steps up, an approach on beat four. Levels 3–4 alternate bars up and down. On level 5 beat four is a triplet with two dead notes (a “skip”).',tip:'A walking line keeps time for the whole band. Evenness matters more than the notes.',hf:'Alternate i-m strictly, even on one string.',hp:'All downstrokes, pick near the neck: a sound close to an upright bass.',lvl:['1-2-3-5','1-2-3 and an approach','Up and down by bars','Wider: across the octave','With a skip on beat four']}],
    L26:[{name:'Две доли (two-feel)',goal:'Половинными нотами под тему: простор и качание перед уокингом.',how:'Тоника и квинта половинными. Дальше подход на четвёртую долю и мёртвая нота свингом. На 4-м уровне такты two-feel и уокинга чередуются.',tip:'Половинная нота должна звучать до самого конца. Не глуши раньше.',hf:'Тяни ноту пальцем левой руки до следующей; правая готовит следующий щипок.',hp:'Штрих вниз, медиатор мягко, ноту держи.',lvl:['Тоника и квинта','С подходом','Мёртвая нота свингом','Two-feel и уокинг по очереди','Подход двумя восьмыми, вся форма']},
         {name:'Two-feel',goal:'Half notes under the melody: space and swing before the walking line.',how:'Root and fifth in half notes. Then an approach on beat four and a swung dead note. On level 4 two-feel and walking bars alternate.',tip:'A half note has to ring to its very end. Do not mute it early.',hf:'Hold the note with the fretting finger until the next one; the plucking hand prepares the next pluck.',hp:'Downstrokes, soft pick, hold the note.',lvl:['Root and fifth','With an approach','A swung dead note','Two-feel and walking in turn','Two-eighth approach, the whole form']}],
    L27:[{name:'Октавы и децимы',goal:'Широкие скачки: октава и децима (терция через октаву) — звук сольного баса.',how:'Тоника, октава, квинта, децима. Децима — терция аккорда на октаву выше, на две струны выше тоники. Струну между ними глуши.',tip:'Децима — самый певучий интервал на басу. Дай ей прозвучать.',hf:'Указательный на тонике, мизинец на дециме; струна между ними заглушена.',hp:'Перескок через струну без лишнего размаха; медиатор остаётся близко.',lvl:['Тоника и октава','Октава, квинта, децима','Децима и подход','Свинг','Триоли через три октавы аккорда']},
         {name:'Octaves and tenths',goal:'Wide leaps: the octave and the tenth (a third plus an octave), the sound of solo bass.',how:'Root, octave, fifth, tenth. The tenth is the chord’s third an octave up, two strings above the root. Mute the string in between.',tip:'The tenth is the most singing interval on bass. Let it ring.',hf:'Index on the root, pinky on the tenth; the string in between stays muted.',hp:'Skip the string without a wide swing; keep the pick close.',lvl:['Root and octave','Octave, fifth, tenth','The tenth and an approach','Swing','Triplets across the chord’s range']}],
    L28:[{name:'Легато в соло',goal:'Хаммеры и пулл-оффы в свинге: короткая нота пары — от левой руки.',how:'h — хаммер, p — пулл-офф. Бьёшь первую ноту, вторая звучит от левой руки. На 4–5 уровне — триоли из трёх нот на одной струне.',tip:'Нота легато громкостью равна ноте с ударом. Записывай и проверяй.',hf:'Хаммер — с высоты, кончиком пальца; пулл-офф — палец срывает струну вниз.',hp:'Медиатор бьёт первую ноту группы и отдыхает.',lvl:['Один хаммер','Хаммер и пулл-офф','Свинг: легато в каждой паре','Триоли: два хаммера, два пулл-оффа','Триоли: трель и легато, вся форма']},
         {name:'Legato in solos',goal:'Hammer-ons and pull-offs in swing: the short note of the pair comes from the fretting hand.',how:'h is a hammer-on, p a pull-off. Pluck the first note; the second sounds from the fretting hand. Levels 4–5 have three-note triplets on one string.',tip:'A legato note is as loud as a plucked one. Record yourself and check.',hf:'Hammer from a height with the fingertip; on a pull-off the finger snaps the string downwards.',hp:'The pick strikes the first note of the group and rests.',lvl:['One hammer-on','Hammer-on and pull-off','Swing: legato in every pair','Triplets: two hammer-ons, two pull-offs','Triplets: trill and legato, the whole form']}],
    L29:[{name:'Позиция от каждой тоники',goal:'Каждый аккорд в своей позиции: рука переезжает на тонику нового аккорда.',how:'Тоника каждого аккорда — под указательным, вся фигура в позиции от неё. На смене аккорда — переезд. Вариант задаёт, от какой струны строятся позиции: от самой низкой или от следующей.',tip:'Переезд — на последней ноте такта, а не на первой нового.',hf:'Большой палец за грифом едет вместе с рукой.',hp:'Медиатор не ждёт левую руку: штрих по времени, переезд успевает.',lvl:['Арпеджио','Арпеджио и подход','Свинг с октавой','Свинг по гамме','Триоли, вся форма']},
         {name:'A position from every root',goal:'Each chord in its own position: the hand moves to the new chord’s root.',how:'Every chord’s root is under the index finger and the whole figure sits in the position from it. On a chord change the hand shifts. The variant sets which string the positions are built from: the lowest or the next one.',tip:'Shift on the last note of the bar, not on the first note of the next.',hf:'The thumb behind the neck travels with the hand.',hp:'The pick does not wait for the fretting hand: stroke on time, the shift catches up.',lvl:['Arpeggio','Arpeggio and approach','Swing with the octave','Swing along the scale','Triplets, the whole form']}],
    L30:[{name:'Триоли в соло',goal:'Триольные фигуры в свинговой линии и точный возврат в четверти.',how:'Четверти и триоли вперемешку. Чем выше уровень, тем больше триолей; на 5-м — с мёртвой нотой в середине.',tip:'Триоль кончается на сильной доле — туда и слушай.',hf:'Триоли — i-m-i, следующая доля начинается с m: не сбивайся.',hp:'Альтернейт на триолях, следи, где оказывается штрих вниз.',lvl:['Одна триоль в такте','Триоль на вторую долю','Две триоли','Триоли по гамме','Триоли с мёртвой нотой']},
         {name:'Triplets in solos',goal:'Triplet figures in a swing line and an exact return to quarters.',how:'Quarters and triplets mixed. The higher the level, the more triplets; on level 5 with a dead note in the middle.',tip:'A triplet ends on a strong beat: listen there.',hf:'Triplets are i-m-i, the next beat starts with m: keep the pattern.',hp:'Alternate picking on triplets; watch where the downstroke falls.',lvl:['One triplet per bar','A triplet on beat two','Two triplets','Triplets along the scale','Triplets with a dead note']}],
    L31:[{name:'Баллада и вибрато',goal:'Долгая певучая нота в медленном темпе: вибрато и длительность.',how:'~ — вибрато. Целые и половинные ноты с вибрато, между ними — подходы. Медленный темп — ровно то, что нужно.',tip:'В балладе нот мало, поэтому слышна каждая. Держи ноту до самого конца.',hf:'Вибрато — от кисти, палец не сползает с лада.',hp:'Медиатор у грифа, штрих мягкий; можно играть пальцами.',lvl:['Целые с вибрато','Половинные с вибрато','Половинная и подход','С восьмыми свингом','Вибрато на септиме']},
         {name:'Ballad and vibrato',goal:'A long singing note at a slow tempo: vibrato and length.',how:'~ is vibrato. Whole and half notes with vibrato, approaches between them. A slow tempo is exactly right.',tip:'A ballad has few notes, so each one is heard. Hold every note to its very end.',hf:'Vibrato comes from the wrist; the finger does not slide off the fret.',hp:'Pick near the neck with a soft stroke; fingers are fine too.',lvl:['Whole notes with vibrato','Half notes with vibrato','A half note and an approach','With swung eighths','Vibrato on the seventh']}],
    L38:[{name:'Босса-нова',goal:'Прямые восьмые и главная фигура босса-новы: тоника, квинта, квинта.',how:'Восьмые ровные, без свинга. Тоника — пунктирная четверть, квинта — восьмая и пунктирная четверть. Дальше подходы, октава и мёртвые ноты.',tip:'Босса-нова тихая. Играй мягко, а метроном считай как вторую и четвёртую доли.',hf:'Большой палец или i-m, звук мягкий, ближе к грифу.',hp:'Все вниз, ладонь слегка приглушает струны у подставки.',lvl:['Тоника и квинта половинными','Фигура босса-новы','С подходом к следующему аккорду','С октавой','Восьмые с мёртвыми нотами']},
         {name:'Bossa nova',goal:'Straight eighths and the core bossa figure: root, fifth, fifth.',how:'Even eighths, no swing. The root is a dotted quarter; the fifth an eighth and a dotted quarter. Then approaches, the octave and dead notes.',tip:'Bossa nova is quiet. Play softly and hear the metronome as beats two and four.',hf:'Thumb or i-m, a soft sound closer to the neck.',hp:'All downstrokes, the palm lightly mutes the strings at the bridge.',lvl:['Root and fifth in half notes','The bossa figure','With an approach to the next chord','With the octave','Eighths with dead notes']}],
    C32:[{name:'ii–V–I по тональностям',goal:'Уокинг по ii–V–I в трёх тональностях подряд.',how:'По четыре такта на тональность: ii, V, I, I. Первые уровни — одна тональность, дальше две и три. Перед каждой новой тональностью — подход к её ii.',tip:'Назови тональность заранее, за такт до неё.',hf:'Чередуй i-m, на смене тональности не останавливайся.',hp:'Все вниз, медиатор у грифа.',lvl:['Две доли, одна тональность','Уокинг, одна тональность','Две тональности','Три тональности','Три тональности со «скипами»']},
         {name:'ii–V–I through the keys',goal:'A walking line over ii–V–I in three keys in a row.',how:'Four bars per key: ii, V, I, I. The first levels use one key, then two and three. An approach leads into each new key’s ii.',tip:'Name the key a bar before it arrives.',hf:'Alternate i-m; do not stop at the key change.',hp:'All downstrokes, pick near the neck.',lvl:['Two-feel, one key','Walking, one key','Two keys','Three keys','Three keys with skips']}],
    C33:[{name:'Джазовый блюз',goal:'Уокинг через джазовые формы 12-тактового блюза.',how:'Двенадцать тактов с джазовой гармонией: ii–V, уменьшённый аккорд, VI перед ii. Варианты — разные формы блюза: мажорный, минорный, с ii–V к IV. Сначала первые четыре такта, потом восемь и вся форма.',tip:'Следи за тактами 4, 6, 8 и 9–10: там джазовый блюз расходится с обычным.',hf:'Чередуй i-m строго.',hp:'Все вниз, медиатор у грифа.',lvl:['Две доли, такты 1–4','Уокинг, такты 1–4','Такты 1–8','Вся форма','Вся форма со «скипами»']},
         {name:'Jazz blues',goal:'A walking line through jazz forms of the 12-bar blues.',how:'Twelve bars with jazz harmony: ii–V, a diminished chord, VI before ii. The variants are different blues forms: major, minor, with a ii–V into IV. First bars 1–4, then eight bars and the whole form.',tip:'Watch bars 4, 6, 8 and 9–10: that is where a jazz blues differs from a plain one.',hf:'Alternate i-m strictly.',hp:'All downstrokes, pick near the neck.',lvl:['Two-feel, bars 1–4','Walking, bars 1–4','Bars 1–8','The whole form','The whole form with skips']}],
    C34:[{name:'Джаз-вальс',goal:'Бас в 3/4: от долгой ноты на такт к шагающей линии.',how:'Три доли в такте. Сначала одна нота на такт, потом половинная и квинта, потом шаг на каждую долю с подходом.',tip:'Вальс не должен звучать как марш. Первая доля длинная, остальные легче.',hf:'Чередуй i-m; долгую ноту держи левой рукой.',hp:'Первая доля вниз, медиатор мягко.',lvl:['Нота на такт','Половинная и квинта','Шаг на каждую долю','С восьмыми свингом','Мёртвая нота и двойной подход']},
         {name:'Jazz waltz',goal:'Bass in 3/4: from one long note per bar to a walking line.',how:'Three beats per bar. First one note per bar, then a half note and the fifth, then a step on every beat with an approach.',tip:'A waltz must not sound like a march. Beat one is long, the others lighter.',hf:'Alternate i-m; hold the long note with the fretting hand.',hp:'Beat one down, soft pick.',lvl:['One note per bar','Half note and fifth','A step on every beat','With swung eighths','A dead note and a double approach']}],
    C35:[{name:'Соло на басу',goal:'Фраза с паузой: соло на басу, которое дышит.',how:'Фраза по аккорду и гамме, в конце такта пауза. На 4–5 уровне — вопрос и ответ: такт фразы, такт с паузой и триольным ответом.',tip:'Пауза — часть соло. Пой фразу, прежде чем играть.',hf:'В паузе гаси струны свободными пальцами.',hp:'Пауза — ладонь на струнах; фраза начинается вниз.',lvl:['Короткая фраза и пауза','Свинг и пауза','Триольный конец фразы','Вопрос и ответ','Вопрос и ответ с легато']},
         {name:'Bass solo',goal:'A phrase with a rest: a bass solo that breathes.',how:'A phrase on the chord and scale, a rest at the end of the bar. Levels 4–5 are question and answer: a bar of phrase, a bar with a rest and a triplet answer.',tip:'The rest is part of the solo. Sing the phrase before you play it.',hf:'Mute the strings with free fingers during the rest.',hp:'During the rest, palm on the strings; the phrase starts with a downstroke.',lvl:['A short phrase and a rest','Swing and a rest','A triplet phrase ending','Question and answer','Question and answer with legato']}],
    C36:[{name:'Джазовый этюд',goal:'Четыре приёма джазового баса подряд на одной гармонии.',how:'Четыре фрагмента подряд. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов.',hf:'На стыке фрагментов не меняй чередование пальцев.',hp:'Стыки — самые опасные места для штриха. Реши заранее, вниз или вверх.',lvl:['Такт на фрагмент, простые фигуры','Подходы и свинг','Два такта во фрагменте','Триоли и энклоужеры','Вся техника: скипы, легато, расширения']},
         {name:'Jazz étude',goal:'Four jazz bass techniques in a row over one progression.',how:'Four fragments in a row. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a full run on your phone. The weak spot is almost always at the joint between fragments.',hf:'At a joint between fragments, keep the finger alternation going.',hp:'Joints are the riskiest spots for picking. Decide in advance: down or up.',lvl:['A bar per fragment, simple figures','Approaches and swing','Two bars per fragment','Triplets and enclosures','Everything: skips, legato, extensions']}]
  };
  const NUM={A16:16,A17:17,A18:18,A19:19,A20:20,A21:21,A22:22,A23:23,A37:37,L24:24,L25:25,L26:26,L27:27,L28:28,L29:29,L30:30,L31:31,L38:38,C32:32,C33:33,C34:34,C35:35,C36:36};
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{
    const [ru,en]=T[id],e=E[id];
    let lr,le,tabs;
    if(id==='C36'){lr=ETU.map(([fr,hk],k)=>'Этюд '+(k+1)+', '+HM[hk].ru+': '+fr.map(f=>FRG[f][1]).join(', '));
      le=ETU.map(([fr,hk],k)=>'Étude '+(k+1)+', '+HM[hk].en+': '+fr.map(f=>FRG[f][2]).join(', '));
      tabs=ETU.map((x,k)=>[1,2,3,4,5].map(lv=>c36(k,lv)));}
    else{lr=e.v.map(v=>harm(v[0]).ru+', '+(id==='L29'?(v[3]?'позиции от второй снизу струны':'позиции от нижней струны'):posRu(v[2])));
      le=e.v.map(v=>harm(v[0]).en+', '+(id==='L29'?(v[3]?'positions from the second-lowest string':'positions from the lowest string'):posEn(v[2])));
      tabs=e.v.map(v=>[1,2,3,4,5].map(lv=>lvTab(id,v,lv)));}
    const x=e&&(e.meter||e.sub)?Object.assign({},e.meter?{meter:e.meter}:{},e.sub?{sub:e.sub}:{}):undefined;
    EX[id]=Object.assign({n:NUM[id]},ru,{sub:3,v:tabs.map((t,i)=>BV(lr[i],t,x))});
    EXEN[id]=Object.assign({},en,{v:le});
  });
  return {EX,EXEN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@JZB2_END@*/

// ----- FKG1: фанк, гитара, часть 1 -----
const FKG1=(function(){
// Фанк, электрогитара, часть 1. Вариант = другой аккорд (или линия) и другая ритмическая ячейка, а не только тональность.
// Ячейка — 16 знаков на такт (шестнадцатые): C — аккорд, H — второй аккорд или второе обращение, x — глухой удар (скретч),
// . — рука проходит мимо струн, - — продление предыдущего. В линиях цифра 1–6 — нота из списка варианта.
const sh=(s,d)=>d?s.replace(/([A-Za-z])([hpt]?)(\d+)/g,(m,a,te,f)=>a+te+(+f+d)):s;
const mx=c=>c.split('+').map(p=>p[0]+'x').join('+');
const cell=(p,map)=>{const o=[];for(const ch of p){if(ch==='-')o[o.length-1].k++;else o.push({t:ch==='.'?'.':map(ch,o),k:1});}
  return o.map(z=>z.k>1?z.t+':'+z.k:z.t).join(' ');};
const sys2=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push(a.slice(i,i+2).join(' | '));return o;};
const dry=p=>p.replace(/x/g,'.');                       // уровень 1: только удары
const stac=p=>p.replace(/-/g,'.');                      // короткие удары
const alt=p=>{let i=0;return p.replace(/C/g,()=>(i++%2)?'H':'C');}; // каждый второй удар — второй аккорд
const swing=p=>{let o='';for(let i=0;i<p.length;i+=2)o+=p[i]+'-'+p[i+1];return o;}; // пара шестнадцатых → долгая-короткая (24 шага)
const fill=q=>q.slice(0,12)+'xCxC';
// ---- аккорды (лады в стандартном строе) ----
const K={
  E9:['A7+D6+G7+B7','{E}9'],E13:['A7+D6+G7+B9','{E}13'],E7s9:['A7+D6+G7+B8','{E}7#9'],
  A13:['E5+D5+G6+B7','{A}13'],A9:['A12+D11+G12+B12','{A}9'],A913:['A12+D11+G12+B14','{A}13'],A7s9:['A12+D11+G12+B13','{A}7#9'],
  Am7:['D5+G5+B5+e5','{A}m7'],Em7:['A7+D9+G7+B8','{E}m7'],Em9:['A7+D5+G7+B7','{E}m9'],
  D9:['A5+D4+G5+B5','{D}9'],D13:['A5+D4+G5+B7','{D}13'],D7s9:['A5+D4+G5+B6','{D}7#9'],
  G13:['E3+D3+G4+B5','{G}13'],G9:['A10+D9+G10+B10','{G}9'],G913:['A10+D9+G10+B12','{G}13'],
  C9:['A3+D2+G3+B3','{C}9'],C13:['A3+D2+G3+B5','{C}13'],F9:['A8+D7+G8+B8','{F}9'],F13:['A8+D7+G8+B10','{F}13'],
  Bm7:['A2+D4+G2+B3','{B}m7'],Fsm7:['E2+D2+G2+B2','{F#}m7'],Cm7:['A3+D5+G3+B4','{C}m7'],Gm7:['E3+D3+G3+B3','{G}m7'],
  // три верхние струны
  tE:['G9+B9+e7','{E}'],tAE:['G9+B10+e9','{A}/{E}'],tDE:['G7+B7+e5','{D}/{E}'],tAm:['G5+B5+e5','{A}m'],tDm:['G7+B6+e5','{D}m'],
  tG:['G4+B3+e3','{G}'],tCG:['G5+B5+e3','{C}/{G}'],tEm:['G9+B8+e7','{E}m'],tAmE:['G9+B10+e8','{A}m/{E}'],
  tE9:['D6+G7+B7','{E}9'],tE13:['D6+G7+B9','{E}13'],uE9:['G7+B7+e7','{E}9'],uAm7:['G9+B8+e8','{A}m7'],uD9:['G5+B5+e5','{D}9'],
  uG2:['G7+B8+e7','{G}'],uFs1:['G6+B5+e5','{F#}m7'],uFs2:['G2+B2+e2','{F#}m7'],uC1:['G5+B5+e7','{C}maj7'],uC2:['G9+B8+e7','{C}maj7'],
  uD9b:['A5+D4+G5','{D}9']
};
// ---- ритмические ячейки: P — основной такт, Q — ответ ----
const CL={
  A:{P:'xxC-xxC-xxC-xxCx',Q:'xxC-xxC-xxCxC-xx',ru:'акцент на «и»',en:'accent on the "and"'},
  B:{P:'C-xCxxC-xCxxC-xC',Q:'xCxxC-xCxxC-C-xx',ru:'акцент на последнюю шестнадцатую',en:'accent on the last sixteenth'},
  C:{P:'xC-xxC-xxC-xxCxx',Q:'xC-xxCxCxC-xxCxx',ru:'удар на вторую шестнадцатую',en:'hits on the second sixteenth'},
  D:{P:'C---xxCxx.Cx.xCx',Q:'C---x.Cx.xC-x.xx',ru:'долгий удар на раз',en:'a long hit on the one'},
  E:{P:'C-.xC.xCx.C-xCx.',Q:'xC.xC.x.C-.xCxCx',ru:'короткие удары',en:'short stabs'},
  F:{P:'CxCxCxCxCxCxCxCx',Q:'CxxCCxxCCxCxCxxC',ru:'ровные шестнадцатые',en:'straight sixteenths'},
  G:{P:'C--C--C--C--C-x-',Q:'x--C--x--C--Cx-x',ru:'пунктир 3+3+3+3+2+2',en:'dotted 3+3+3+3+2+2'},
  H:{P:'.xC-.xCx.xC-.xCx',Q:'.xCx.xC-.CxC.xCx',ru:'пауза на сильной доле',en:'a rest on the downbeat'}
};
// грув: c1, c2 — аккорды, cl — ячейка, f — преобразование ячейки, xs — чем бьётся x
const groove=(c1,c2,cl,f,xs)=>{f=f||(p=>p);xs=xs||mx;
  const m=(a,b)=>ch=>ch==='C'?a:ch==='H'?b:xs(a);
  const P=f(CL[cl].P),Q=f(CL[cl].Q),bar=(p,a,b)=>cell(p,m(a,b));
  return [
    [bar(dry(P),c1,c2),bar(dry(P),c1,c2)].join(' | '),
    [bar(P,c1,c2),bar(P,c1,c2)].join(' | '),
    [bar(P,c1,c2),bar(Q,c1,c2)].join(' | '),
    sys2([bar(P,c1,c2),bar(Q,c1,c2),bar(P,c2,c1),bar(Q,c2,c1)]),
    sys2([bar(P,c1,c2),bar(Q,c1,c2),bar(P,c2,c1),bar(f(fill(CL[cl].Q)),c1,c2)])
  ].map(t=>({t:Array.isArray(t)?t:[t]}));};
// варианты грув-упражнения: [аккорд1, аккорд2, ячейка]
const gV=(list,f,xs,sep)=>list.map(([a,b,cl])=>({l:K[a][1]+(sep||' и ')+K[b][1]+', '+CL[cl].ru,lv:groove(K[a][0],K[b][0],cl,f,xs)}));
const gEN=(list,sep)=>list.map(([a,b,cl])=>K[a][1]+(sep||' and ')+K[b][1]+', '+CL[cl].en);
const gV1=(list,f)=>list.map(([a,b,cl])=>({l:K[a][1]+': два обращения, '+CL[cl].ru,lv:groove(K[a][0],K[b][0],cl,f)}));
const gEN1=list=>list.map(([a,b,cl])=>K[a][1]+': two voicings, '+CL[cl].en);
// линия: n — ноты (1…6), A, B — такты; x — глухая нота на струне предыдущей ноты
const lineMap=n=>(ch,o)=>{if(ch!=='x')return n[+ch-1];for(let i=o.length-1;i>=0;i--)if(o[i].t!=='.')return mx(o[i].t);return mx(n[0]);};
const lmin=n=>Math.min(...n.join('+').match(/\d+/g).map(Number));
const line=(n,A,B)=>{const b=p=>cell(p,lineMap(n)),lo=lmin(n)>=7,s4=lo?-7:5,s5=lo?-5:7;
  return [
    [b(dry(A)),b(dry(A))].join(' | '),
    [b(A),b(A)].join(' | '),
    [b(A),b(B)].join(' | '),
    sys2([b(A),b(B),sh(b(A),s4),sh(b(B),s4)]),
    sys2([b(A),b(B),sh(b(A),s4),sh(b(B),s5)])
  ].map(t=>({t:Array.isArray(t)?t:[t]}));};
const lV=list=>list.map(x=>({l:x.l,lv:line(x.n,x.A,x.B)}));
const oc=(s,f)=>s==='E'?'E'+f+'+D'+(f+2):s==='A'?'A'+f+'+G'+(f+2):'D'+f+'+B'+(f+3);

// ---- данные упражнений ----
const B1L=[['E9','A13','A'],['Em7','Am7','C'],['G13','C9','F'],['Bm7','Em9','B'],['D9','G13','G'],['Fsm7','Bm7','H']];
const B3L=[['Am7','D9','E'],['Cm7','F9','D'],['E7s9','D7s9','B'],['Gm7','C9','H'],['Em9','A13','A'],['tDm','tG','C']];
const B4L=[['tE','tAE','F'],['tDE','tE','A'],['tAm','tDm','E'],['tG','tCG','B'],['tEm','tAmE','H'],['tE9','tE13','C']];
const R6L=[['E9','A13','A'],['Am7','D9','C'],['Em7','A13','G'],['G13','C9','H'],['D7s9','G13','B'],['Bm7','E9','E']];
const R7L=[['E7s9','A13','D'],['D7s9','G13','E'],['A7s9','D9','G'],['E7s9','E9','B'],['D7s9','D9','H'],['A7s9','A9','A']];
const R8L=[['E9','E13','F'],['D9','D13','A'],['A9','A913','C'],['C9','C13','E'],['G9','G913','H'],['F9','F13','B']];
const R13L=[['Em7','Am7','D'],['E9','A13','H'],['Am7','D9','E'],['G13','C9','G'],['Bm7','Em7','B'],['Cm7','F9','A']];
const R14L=[['E9','A13','G'],['Am7','D9','A'],['Em9','A13','C'],['G13','C9','D'],['Bm7','E9','E'],['F9','C9','H']];
const R37L=[['uE9','tE9','F'],['tAm','uAm7','A'],['uD9','uD9b','B'],['tG','uG2','C'],['uFs1','uFs2','E'],['uC1','uC2','H']];
// кварты: три ноты через кварту на струнах D G B (или A D G)
const Q3=f=>'D'+f+'+G'+f+'+B'+(f+1),QA=f=>'A'+f+'+D'+f+'+G'+f;
const R10D=[[Q3(7),Q3(9),'G','лады 7 и 9, D–G–B','frets 7 and 9, D–G–B'],[Q3(5),Q3(7),'H','лады 5 и 7, D–G–B','frets 5 and 7, D–G–B'],
  [QA(5),QA(7),'D','лады 5 и 7, A–D–G','frets 5 and 7, A–D–G'],[Q3(10),Q3(12),'A','лады 10 и 12, D–G–B','frets 10 and 12, D–G–B'],
  [QA(7),QA(5),'C','сверху вниз: лады 7 и 5, A–D–G','downward: frets 7 and 5, A–D–G'],[Q3(2),Q3(4),'E','лады 2 и 4, D–G–B','frets 2 and 4, D–G–B']];
const B2D=[
  {l:'{E}m, верхние струны, 12-я позиция',n:['G14','G12','B12','B15','e12'],A:'1x1x2x1x3x2x1xx2',B:'x1x2x3x4x3x2x1-x'},
  {l:'{A} дорийский, 5-я позиция',n:['G7','G5','B5','B7','D7'],A:'5x1x2x1x5x1-3x2x',B:'1x2x3x4-3x1x2x5x'},
  {l:'{D}m, 10-я позиция, через струну',n:['B10','B13','G10','G12','e10'],A:'x1x2x1x3x4x3x1x5',B:'x5x1x2x1x3-4x3x.'},
  {l:'{E} миксолидийский, открытая позиция',n:['D2','D0','G1','G2','A2'],A:'5x1x2x3x4x3x1x2x',B:'5-1x2x5x1x3-4x3x'},
  {l:'{G}, мажорная пентатоника, 2-я позиция',n:['D5','D2','G2','G4','B3'],A:'2x1x3x4x5x4x3x1x',B:'1x5-4x3x1x2-3x4x'},
  {l:'{B}m, 7-я позиция, двойные ноты',n:['G7+B7','G9+B10','G7+B10','e7','B7'],A:'1x1x2x1x3x1x4x5x',B:'x1x2-1x3x4-5x1x.'}
];
const B5D=[
  {l:'Октавы {s:A}–{s:G}, {E}m',n:[oc('A',7),oc('A',10),oc('A',12),oc('A',5),oc('A',9)],A:'1x1x2x1x3x2x1x4x',B:'1x2x3x5x3x2x1-x.'},
  {l:'Октавы {s:D}–{s:B}, {A}m',n:[oc('D',7),oc('D',10),oc('D',12),oc('D',5),oc('D',9)],A:'1-x1x2x3x2x1x4x1',B:'x1x4x1x2x3-2x1x.'},
  {l:'Октавы {s:E}–{s:D}, {G}',n:[oc('E',3),oc('E',5),oc('E',8),oc('E',10),oc('E',7)],A:'1x2x1x3x4x3x1x2x',B:'1xx1x2x3x5-3x2x1'},
  {l:'Октавы {s:A}–{s:G}, {D}m',n:[oc('A',5),oc('A',8),oc('A',10),oc('A',3),oc('E',5)],A:'x1x1x2x3x2x1x4x5',B:'x1x2-3x2x1x4-5x.'},
  {l:'Октавы {s:D}–{s:B}, {B}m',n:[oc('D',9),oc('D',12),oc('D',14),oc('D',7),oc('D',4)],A:'1x2x1x3x2x1x4x5x',B:'1-2x3-2x1x4x5-x.'},
  {l:'Октавы по двум парам струн, {C}',n:[oc('E',8),oc('E',10),oc('A',8),oc('A',10),oc('E',11)],A:'1x2x3x4x3x2x1x5x',B:'1x1x3x4x5x4-3x2x'}
];
// сексты и терции с подходом на полтона снизу: 1 — подход, 2 — цель, 3 — сосед сверху, 4 — бас
const sixG=r=>['G'+r+'+e'+(r-1),'G'+(r+1)+'+e'+r,'G'+(r+2)+'+e'+(r+2)],sixD=r=>['D'+r+'+B'+(r-1),'D'+(r+1)+'+B'+r,'D'+(r+2)+'+B'+(r+2)];
const R9D=[
  {l:'Сексты {s:G}–{s:e}, {A}',n:sixG(5).concat(['A0']),A:'4x12x3x2x12-x3x2',B:'4-x12x3-2x12x3x2'},
  {l:'Сексты {s:G}–{s:e}, {E}, 12-я позиция',n:sixG(12).concat(['G9']),A:'12x3x2-x12x3x4x.',B:'x12-3x2x4x12x3-2'},
  {l:'Сексты {s:D}–{s:B}, {D}',n:sixD(3).concat(['A5']),A:'4x12x3x2x4x12x3x',B:'12x3-2x12x4-x3x2'},
  {l:'Сексты {s:D}–{s:B}, {G}',n:sixD(8).concat(['E3']),A:'12-3x2x4x12x3x2x',B:'4x12x3x2-12x3x4x'},
  {l:'Сексты {s:G}–{s:e}, {C}',n:sixG(8).concat(['A3']),A:'x12x3x2x12x4x3x2',B:'12x3x2-4-12x3x2x'},
  {l:'Терции {s:G}–{s:B}, {E}',n:['G8+B8','G9+B9','G11+B10','E0'],A:'4x12x3x2x4x12x3x',B:'12x3-2x4x12-3x2x'}
];
const R11D=[
  {l:'{A}: малая терция → большая',n:['G5+B5+e5','Gh6','B5','e5','A0'],A:'1x2x3x4x1x2x5x2x',B:'1-2x4x3x1x2-5x2x'},
  {l:'{D}: кварта и назад',n:['G7+B7+e5','Bh8','Bp7','e5','D7'],A:'1x2x3x4x5x1x2x3x',B:'1x2-3x5x1x2x3-4x'},
  {l:'{E}, открытая позиция: квинта → секста',n:['G1+B0+e0','D2','Dh4','D2','E0'],A:'5x1x2x3x4x1x2x5x',B:'5-1x2x3-4x1x5x.x'},
  {l:'{G}: терция → кварта',n:['G4+B3+e3','Gh5','Gp4','e3','E3'],A:'1x2x3x4x5x1x2x3x',B:'5x1x2-3x1x4x5-x.'},
  {l:'{C}, 8-я позиция: секста → септима',n:['G9+B8+e8','Bh10','Bp8','e8','A3'],A:'1x2x3x1x5x2x3x4x',B:'5x1x2-3x1x2x4-x.'},
  {l:'{F#}m: двойная нота и хаммер',n:['G4+B7','Gh6','e5','B7+e5','E2'],A:'1x2x3x4x5x1x2x4x',B:'5-1x2x4x3x1x2-4x'}
];
const R12D=[
  {l:'{E} дорийский, низкие струны',n:['E0','E3','A2','A4','D2','E5'],A:'1x1x2x3x1x4x5x6x',B:'1-x1x2x3x4x2-1x.'},
  {l:'{A}m, от открытой {o:A}',n:['A0','A3','A5','D2','D5','E3'],A:'1x2x1x3x4x5x3x6x',B:'1x1-2x3x1x4-x5x.'},
  {l:'{D} дорийский, от открытой {o:D}',n:['D0','D3','D5','G2','A5','A3'],A:'1x2x3x4x3x2x5x6x',B:'1-x1x2x3-4x3x6x.'},
  {l:'{G}, мажорная пентатоника',n:['E3','E5','A2','A3','A5','D5'],A:'1x2x3x4x5x6x5x4x',B:'1x1x2-3x5x4x6-x.'},
  {l:'{E} миксолидийский, по трём струнам',n:['E0','A2','A4','A5','D2','E2'],A:'1x2x3x4x5x4x3x6x',B:'1x6x1x2-3x4x5-x.'},
  {l:'{C}m, 3-я позиция',n:['A3','A6','D3','D5','E8','E6'],A:'1x2x3x4x3x2x5x6x',B:'1-x2x3x4-5x6x1x.'}
];
const R15D=[
  {c:'E9',cl:'A',n:['G9','G7','B7','B9'],A:'1x2x3x4x3x2x1-x.'},
  {c:'Am7',cl:'C',n:['D7','D5','G5','G7'],A:'1x2x3x4-3x2x1x.x'},
  {c:'G13',cl:'B',n:['A5','A2','D2','D5'],A:'x1x2x3x4x3x2x1-.'},
  {c:'D9',cl:'D',n:['G7','G5','B5','B7'],A:'1-2x3x4x3x2-1x.x'},
  {c:'Em7',cl:'H',n:['A7','A5','D5','D7'],A:'1x2x3-4x3x2x1x.x'},
  {c:'C9',cl:'E',n:['G5','G3','B3','B5'],A:'1x2x3x4x3-2x1x.x'}
];
const r15=x=>{const c=K[x.c][0],gb=p=>cell(p,ch=>ch==='C'?c:mx(c)),lb=p=>cell(p,lineMap(x.n)),P=CL[x.cl].P,Q=CL[x.cl].Q,B=x.A.split('').reverse().join('').replace(/^([.x]*)/,'$1');
  const B2=x.A.slice(8)+x.A.slice(0,8);
  return [[gb(dry(P)),lb(dry(x.A))].join(' | '),[gb(P),lb(x.A)].join(' | '),sys2([gb(P),lb(x.A),gb(Q),lb(B2)]),
    sys2([gb(P),lb(x.A),gb(Q),lb(B2),gb(P),lb(x.A),gb(fill(Q)),lb(B2)]),
    sys2([gb(P),lb(x.A),gb(Q),lb(B2),gb(P),sh(lb(x.A),5),gb(fill(Q)),sh(lb(B2),5)])].map(t=>({t:Array.isArray(t)?t:[t]}));};

const EX={
W0:{name:'Разминка',goal:'Разогреть руки и включить шестнадцатую.',how:'Минуту без гитары: потри ладони до тепла, медленные круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем на чистом звуке: рука медиатором движется вниз-вверх без остановки, по заглушённым струнам, аккорд {E}9 — на каждую долю.',tip:'Кисть свободная, движение от запястья. Громкость не нужна.',sub:2,v:[{l:'{E}9 и глухие удары',t:[cell('CxCxCxCx',ch=>ch==='C'?K.E9[0]:mx(K.E9[0]))]}]},
W1:{name:'Мобилизация без гитары',goal:'Разогнать кровь в кистях и предплечьях.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Потряси расслабленными кистями.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
W2:{name:'Маятник шестнадцатыми',goal:'Запустить непрерывное движение правой руки.',how:'Левая рука глушит три верхние струны, правая играет ровные шестнадцатые вниз-вверх. Во втором такте на первую и третью доли звучит аккорд {E}9 на верхних струнах, рука не останавливается.',tip:'Удар вниз — на долю и на «и», вверх — между ними. Рука ходит так же и там, где звука нет.',sub:4,v:[{l:'Глухие удары и {E}9',t:[cell('xxxxxxxxxxxxxxxx',()=>'Gx+Bx+ex')+' | '+cell('CxxxxxxxCxxxxxxx',ch=>ch==='C'?K.uE9[0]:'Gx+Bx+ex')]}]},
W3:{name:'Девятые и тринадцатые',goal:'Вспомнить главные фанковые аккорды.',how:'Чистый звук, восьмые, медленно. {E}9 → {E}13 → {E}7#9: меняется только нота на {s:B}. Каждый аккорд — короткий, левая рука отпускает сразу после удара.',tip:'Аккорд с тоникой на {s:A}: большой палец или край указательного глушат {s:E}.',sub:2,v:[{l:'{E}9, {E}13, {E}7#9',t:[cell('C.C.H.H.',ch=>ch==='C'?K.E9[0]:K.E13[0])+' | '+cell('C.C.H.C-',ch=>ch==='C'?K.E7s9[0]:K.E9[0])]}]},

B1:{n:1,name:'Непрерывная рука',goal:'Правая рука ходит шестнадцатыми без остановки, аккорд звучит только там, где нужно.',how:'Шестнадцатые: вниз на доли и на «и», вверх между ними. На x левая рука ослабляет аккорд и медиатор бьёт по заглушённым струнам. На первом уровне вместо x рука проходит мимо струн.',tip:'Удар не ускоряет руку и не останавливает её: меняется только то, касается ли медиатор струн.',sub:4,lvl:['Только удары, рука ходит в воздухе','Удары и глухие','Двухтактная фраза','Смена аккорда','Четыре такта с концовкой'],v:gV(B1L)},
B2:{n:2,name:'Чикен-скретч',goal:'Одиночные ноты на верхних струнах между глухими ударами.',how:'Шестнадцатые, рука не останавливается. Нота звучит коротко, следующий x — та же струна под ослабленным пальцем. На четвёртом и пятом уровнях фраза переносится на другие ступени.',tip:'Звук — сухой щелчок. Пальцы левой руки не отрываются от струн, только ослабляют нажим.',sub:4,lvl:['Только ноты','Ноты и глухие','Двухтактная фраза','Смена ступени','Четыре ступени: I, IV и V'],v:lV(B2D)},
B3:{n:3,name:'Стаккато левой рукой',goal:'Короткий аккорд и тишина сразу после него.',how:'Каждый удар — шестнадцатая, затем левая рука ослабляет нажим и аккорд замолкает. Точка в табе — тишина, правая рука при этом продолжает движение.',tip:'Глушит левая рука, а не ладонь правой: правая свободна для шестнадцатых.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Смена аккорда','Четыре такта с концовкой'],v:gV(B3L,stac)},
B4:{n:4,name:'Малые аккорды на верхних струнах',goal:'Быстрая смена трезвучий на трёх верхних струнах.',how:'Удары по очереди: первое обращение, второе. Звучат только три верхние струны, остальные под левой рукой. На четвёртом уровне аккорды меняются ролями.',tip:'Пальцы переходят коротким движением, общая нота остаётся на месте.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Аккорды меняются ролями','Четыре такта с концовкой'],v:gV(B4L,alt,null,' → ')},
B5:{n:5,name:'Октавы',goal:'Однонотная линия октавами без лишних струн.',how:'Октава через струну: нижний палец — указательный, верхний — мизинец или безымянный. Струна между ними заглушена мякотью указательного. Шестнадцатые, на x — глухой удар по той же октаве.',tip:'Можно бить по всем струнам: звучат только две ноты октавы, остальное заглушено.',sub:4,lvl:['Только ноты','Ноты и глухие','Двухтактная фраза','Смена ступени','Четыре ступени: I, IV и V'],v:lV(B5D)},

R6:{name:'Синкопы',goal:'Удар между долями, а не на них.',how:'Акценты сдвинуты с доли на «и» или на шестнадцатую. Считай вслух «раз-и-два-и», рука продолжает шестнадцатые.',tip:'Синкопа точнее, когда метроном слышен: удар не прилипает к щелчку.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Смена аккорда','Четыре такта с концовкой'],v:gV(R6L)},
R7:{name:'Аккорд 7#9',goal:'Жёсткий удар доминанты с повышенной ноной.',how:'Аккорд 7#9 — короткими ударами, между ними глухие. Во второй половине — разрешение в соседний аккорд.',tip:'7#9 звучит резко: удар короткий, без звона.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Смена аккорда','Четыре такта с концовкой'],v:gV(R7L,stac,null,' → ')},
R8:{name:'Девятая и тринадцатая',goal:'Ход 9 → 13 внутри одного аккорда.',how:'Удары по очереди: девятый аккорд, тринадцатый. Меняется одна нота на {s:B}, остальные пальцы стоят.',tip:'Мизинец ставится на ноту заранее и не давит, пока не нужен.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Аккорды меняются ролями','Четыре такта с концовкой'],v:gV(R8L,alt,null,' → ')},
R9:{name:'Ду-дакс',goal:'Двойные ноты с подходом на полтона.',how:'Двойная нота съезжает в цель с полутона ниже: подход и цель — соседние шестнадцатые. Между ними глухие удары и бас на низкой струне.',tip:'Подход тише цели. Слайда нет: пальцы переставляются, рука движется одним целым.',sub:4,lvl:['Только ноты','Ноты и глухие','Двухтактная фраза','Смена ступени','Четыре ступени: I, IV и V'],v:lV(R9D)},
R10:{name:'Кварты',goal:'Квартовые аккорды и движение по ним.',how:'Три ноты через кварту одним барре или двумя пальцами. Удары по очереди: нижнее и верхнее положение.',tip:'Кварты звучат открыто: не дави, чтобы не уходил строй.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Положения меняются ролями','Четыре такта с концовкой'],v:R10D.map(x=>({l:'Кварты: '+x[3]+', '+CL[x[2]].ru,lv:groove(x[0],x[1],x[2],alt)}))},
R11:{name:'Хаммеры в аккордах',goal:'Мелодия внутри аккорда: хаммер и пулл-офф с аккордового положения.',how:'Аккорд держится, один палец добавляет хаммер или снимает пулл-оффом. Бас на низкой струне — большим пальцем или медиатором.',tip:'Аккорд не перехватывается: двигается только один палец.',sub:4,lvl:['Только ноты','Ноты и глухие','Двухтактная фраза','Смена ступени','Четыре ступени: I, IV и V'],v:lV(R11D)},
R12:{name:'Однонотный рифф',goal:'Рифф на низких струнах с глухими нотами.',how:'Шестнадцатые: нота, глухая, нота. Глухая — на той же струне, палец лежит без нажима.',tip:'Глухая нота — часть ритма, не шум: она такая же ровная, как звучащая.',sub:4,lvl:['Только ноты','Ноты и глухие','Двухтактная фраза','Смена ступени','Четыре ступени: I, IV и V'],v:lV(R12D)},
R13:{name:'Ладонь в кармане',goal:'Удары под ладонью вместо глухих.',how:'Где в табе m — аккорд под ладонью правой руки у подставки, коротко и тихо. Открытые удары — громкие. Разница громкости и есть грув.',tip:'Ладонь не давит: она касается струн и сразу отходит.',sub:4,lvl:['Только открытые удары','Открытые и под ладонью','Двухтактная фраза','Смена аккорда','Четыре такта с концовкой'],v:gV(R13L,null,c=>c+'m')},
R14:{name:'Шестнадцатые со свингом',goal:'Свинговая шестнадцатая: долгая-короткая.',how:'Каждая пара шестнадцатых — долгая и короткая (2:1), метроном — секстоли. Рука движется так же, вниз-вверх.',tip:'Свинг — в правой руке: удар вверх чуть позже. Не превращай его в триоли.',sub:6,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Смена аккорда','Четыре такта с концовкой'],v:gV(R14L,swing)},
R15:{name:'Аккорд и линия',goal:'Одна партия: такт аккордов, такт однонотной линии.',how:'Первый такт — грув аккордом, второй — короткая линия на средних струнах. Рука не останавливается на стыке.',tip:'Линия продолжает грув: тот же ритм, та же громкость.',sub:4,lvl:['Только удары и ноты','Удары, ноты и глухие','Четыре такта','Восемь тактов','Линия на другой ступени'],v:R15D.map(x=>({l:K[x.c][1]+' и линия, '+CL[x.cl].ru,lv:r15(x)}))},
R37:{name:'Вамп одного аккорда',goal:'Один аккорд по кругу, два обращения на верхних струнах.',how:'Аккорд не меняется, меняется голос: удары по очереди в двух положениях на трёх верхних струнах. Глухие между ними.',tip:'Такт повторяется много раз: держи его одинаковым, без украшений.',sub:4,lvl:['Только удары','Удары и глухие','Двухтактная фраза','Положения меняются ролями','Четыре такта с концовкой'],v:gV1(R37L,alt)}
};
const GL=['Hits only, the hand moves in the air','Hits and scratches','A two-bar phrase','Chord change','Four bars with an ending'];
const LL=['Notes only','Notes and dead notes','A two-bar phrase','Move to another degree','Four degrees: I, IV and V'];
const ROLE=['Hits only','Hits and scratches','A two-bar phrase','The voicings swap roles','Four bars with an ending'];
const EN_B2=['{E} minor, top strings, position 12','{A} Dorian, position 5','{D} minor, position 10, string skips','{E} Mixolydian, open position','{G} major pentatonic, position 2','{B} minor, position 7, double stops'];
const EN_B5=['Octaves on {s:A}–{s:G}, {E} minor','Octaves on {s:D}–{s:B}, {A} minor','Octaves on {s:E}–{s:D}, {G}','Octaves on {s:A}–{s:G}, {D} minor','Octaves on {s:D}–{s:B}, {B} minor','Octaves on two string pairs, {C}'];
const EN_R9=['Sixths on {s:G}–{s:e}, {A}','Sixths on {s:G}–{s:e}, {E}, position 12','Sixths on {s:D}–{s:B}, {D}','Sixths on {s:D}–{s:B}, {G}','Sixths on {s:G}–{s:e}, {C}','Thirds on {s:G}–{s:B}, {E}'];
const EN_R11=['{A}: minor third to major','{D}: the fourth and back','{E}, open position: fifth to sixth','{G}: third to fourth','{C}, position 8: sixth to seventh','{F#} minor: double stop and hammer-on'];
const EN_R12=['{E} Dorian, low strings','{A} minor from the open {o:A}','{D} Dorian from the open {o:D}','{G} major pentatonic','{E} Mixolydian across three strings','{C} minor, position 3'];
const EXEN={
W0:{name:'Warm-up',goal:'Warm up the hands and lock into the sixteenth.',how:'One minute without the guitar: rub your palms until warm, slow wrist and shoulder circles, open and close your fists 20 times. Then on a clean tone: the picking hand moves down and up without stopping over muted strings, with an {E}9 chord on every beat.',tip:'Loose wrist, the motion comes from it. No need for volume.',v:['{E}9 and scratches']},
W1:{name:'Mobility without the guitar',goal:'Get blood flowing in the hands and forearms.',how:'Rub your palms until warm. Wrist circles both ways, 10 each. Shoulders up, back, down. Open and close your fists 20 times. Shake out relaxed hands.',tip:'No stretching into pain: only warmth and mobility.'},
W2:{name:'Sixteenth-note pendulum',goal:'Start the non-stop motion of the picking hand.',how:'The fretting hand mutes the top three strings; the picking hand plays even sixteenths down and up. In the second bar an {E}9 on the top strings sounds on beats one and three; the hand does not stop.',tip:'Down on the beat and the "and", up in between. The hand moves the same where there is no sound.',v:['Scratches and {E}9']},
W3:{name:'Ninths and thirteenths',goal:'Recall the core funk chords.',how:'Clean tone, eighths, slowly. {E}9 → {E}13 → {E}7#9: only the note on the {s:B} string changes. Every chord is short; the fretting hand lets go right after the strum.',tip:'With the root on the {s:A} string, the thumb or the edge of the index finger mutes the {s:E} string.',v:['{E}9, {E}13, {E}7#9']},
B1:{name:'The non-stop hand',goal:'The picking hand keeps moving in sixteenths; the chord sounds only where it should.',how:'Sixteenths: down on the beats and the "and", up in between. On x the fretting hand eases off and the pick hits the muted strings. On level 1 the hand passes over the strings instead of the x.',tip:'A hit neither speeds the hand up nor stops it: the only change is whether the pick touches the strings.',lvl:GL,v:gEN(B1L)},
B2:{name:'Chicken scratch',goal:'Single notes on the top strings between muted scratches.',how:'Sixteenths, the hand never stops. The note is short; the next x is the same string under a relaxed finger. On levels 4 and 5 the phrase moves to other degrees.',tip:'The sound is a dry click. The fretting fingers stay on the strings and only ease the pressure.',lvl:LL,v:EN_B2},
B3:{name:'Fretting-hand staccato',goal:'A short chord and silence right after it.',how:'Every hit is a sixteenth; then the fretting hand eases off and the chord stops. A dot in the tab is silence while the picking hand keeps moving.',tip:'The fretting hand mutes, not the picking-hand palm: the picking hand stays free for sixteenths.',lvl:GL,v:gEN(B3L)},
B4:{name:'Small chords on the top strings',goal:'Quick triad changes on the top three strings.',how:'Hits alternate: the first voicing, then the second. Only the top three strings ring, the rest are under the fretting hand. On level 4 the chords swap roles.',tip:'The fingers move a short way and the common note stays put.',lvl:ROLE,v:gEN(B4L,' → ')},
B5:{name:'Octaves',goal:'A single-note line in octaves with no extra strings.',how:'An octave with one string between: the index finger takes the low note, the little or ring finger the high one. The flesh of the index finger mutes the string between them. Sixteenths; on x a muted hit on the same octave.',tip:'You can strike all the strings: only the two octave notes sound, everything else is muted.',lvl:LL,v:EN_B5},
R6:{name:'Syncopation',goal:'Hits between the beats, not on them.',how:'The accents move off the beat onto the "and" or onto a sixteenth. Count "one-and-two-and" out loud; the hand keeps up the sixteenths.',tip:'Syncopation gets tighter when you hear the metronome: the hit does not stick to the click.',lvl:GL,v:gEN(R6L)},
R7:{name:'The 7#9 chord',goal:'A hard dominant hit with a sharp nine.',how:'The 7#9 chord in short stabs with scratches between. In the second half it resolves to a neighbouring chord.',tip:'7#9 sounds harsh: keep the stab short with no ring.',lvl:GL,v:gEN(R7L,' → ')},
R8:{name:'Nine and thirteen',goal:'The 9 → 13 move inside one chord.',how:'Hits alternate: the ninth chord, then the thirteenth. One note on the {s:B} string changes; the other fingers stay.',tip:'Hover the little finger over its note and do not press until it is needed.',lvl:ROLE,v:gEN(R8L,' → ')},
R9:{name:'Doo-dacks',goal:'Double stops with a half-step approach.',how:'The double stop slips into its target from a half step below: approach and target are neighbouring sixteenths. Scratches and a bass note on a low string in between.',tip:'The approach is quieter than the target. There is no slide: the fingers shift, the hand moves as one.',lvl:LL,v:EN_R9},
R10:{name:'Fourths',goal:'Quartal chords and moving between them.',how:'Three notes a fourth apart, with one barre or two fingers. Hits alternate between the lower and the upper position.',tip:'Fourths sound open: do not press hard or they go out of tune.',lvl:['Hits only','Hits and scratches','A two-bar phrase','The positions swap roles','Four bars with an ending'],v:R10D.map(x=>'Fourths: '+x[4]+', '+CL[x[2]].en)},
R11:{name:'Hammer-ons in chords',goal:'A melody inside a chord: hammer-ons and pull-offs from a chord shape.',how:'Hold the chord; one finger adds a hammer-on or takes a note away with a pull-off. The bass note on a low string with the thumb or the pick.',tip:'Do not re-grip the chord: only one finger moves.',lvl:LL,v:EN_R11},
R12:{name:'Single-note riff',goal:'A riff on the low strings with dead notes.',how:'Sixteenths: note, dead note, note. The dead note is on the same string with the finger resting on it without pressure.',tip:'A dead note is part of the rhythm, not noise: it is as even as a sounding one.',lvl:LL,v:EN_R12},
R13:{name:'Palm in the pocket',goal:'Palm-muted strums instead of scratches.',how:'Where the tab says m, the chord sits under the picking-hand palm by the bridge, short and quiet. The open hits are loud. The difference in volume is the groove.',tip:'The palm does not press: it touches the strings and lifts right away.',lvl:['Open hits only','Open and palm-muted','A two-bar phrase','Chord change','Four bars with an ending'],v:gEN(R13L)},
R14:{name:'Swung sixteenths',goal:'The swung sixteenth: long-short.',how:'Every pair of sixteenths is long and short (2:1); the metronome plays sextuplets. The hand moves the same way, down and up.',tip:'The swing lives in the picking hand: the upstroke comes a little later. Do not turn it into triplets.',lvl:GL,v:gEN(R14L)},
R15:{name:'Chord and line',goal:'One part: a bar of chords, a bar of single-note line.',how:'The first bar is a chord groove, the second a short line on the middle strings. The hand does not stop at the joint.',tip:'The line continues the groove: same rhythm, same volume.',lvl:['Hits and notes only','Hits, notes and scratches','Four bars','Eight bars','The line on another degree'],v:R15D.map(x=>K[x.c][1]+' and a line, '+CL[x.cl].en)},
R37:{name:'One-chord vamp',goal:'One chord in a loop, two voicings on the top strings.',how:'The chord stays, the voice changes: hits alternate between two positions on the top three strings, with scratches between them.',tip:'The bar repeats many times: keep it the same, no embellishments.',lvl:ROLE,v:gEN1(R37L)}
};
const TESTS=[
  {id:'FGT1',ru:['Глухие шестнадцатые','Три верхние струны под левой рукой, держать 30 секунд без сбоя.'],en:['Muted sixteenths','The top three strings under the fretting hand, hold 30 seconds without a slip.'],sub:4,t:[R('Gx+Bx+ex',16)]},
  {id:'FGT2',ru:['Грув {E}9','Акцент на «и», два такта подряд без сбоя.'],en:['{E}9 groove','Accent on the "and", two bars in a row without a slip.'],sub:4,t:[groove(K.E9[0],K.A13[0],'A')[1].t[0]]},
  {id:'FGT3',ru:['Непрерывная рука','{E}9 на каждую долю, между ними глухие, держать 60 секунд.'],en:['The non-stop hand','{E}9 on every beat with scratches between, hold 60 seconds.'],sub:4,t:[cell('CxxxCxxxCxxxCxxx',ch=>ch==='C'?K.E9[0]:mx(K.E9[0]))]},
  {id:'FGT4',ru:['Октавы','{E}m, октавы {s:A}–{s:G}, шестнадцатые с глухими, два такта.'],en:['Octaves','{E} minor, octaves on {s:A}–{s:G}, sixteenths with dead notes, two bars.'],sub:4,t:[line(B5D[0].n,B5D[0].A,B5D[0].B)[2].t[0]]},
  {id:'FGT5',ru:['Однонотный рифф','{E} дорийский на низких струнах, два такта подряд без сбоя.'],en:['Single-note riff','{E} Dorian on the low strings, two bars in a row without a slip.'],sub:4,t:[line(R12D[0].n,R12D[0].A,R12D[0].B)[2].t[0]]}
];
const RIFF={
  ru:['рифф держится на одном аккорде','первая доля такта — долгий удар, дальше только синкопы','только три верхние струны','в риффе есть аккорд 7#9 или 13','второй раз рифф повторяется с изменённой последней долей','через весь рифф проходят глухие шестнадцатые','не больше четырёх разных нот','рифф начинается со второй шестнадцатой','одна доля — полная тишина, рука при этом движется','в риффе есть октавы или ду-дакс','первый такт — аккорды, второй — однонотная линия','темп на 20% ниже рабочего, но грув не проседает'],
  en:['the riff stays on one chord','beat one is a long hit, then syncopation only','only the top three strings','includes a 7#9 or a 13 chord','the second time through, the last beat changes','muted sixteenths run through the whole riff','no more than four different notes','the riff starts on the second sixteenth','one beat of full silence while the hand keeps moving','includes octaves or a doo-dack','the first bar is chords, the second a single-note line','tempo 20% below your working tempo, but the groove does not sag']
};
const COACH={
  W0:{free:60}
};
return {EX,EXEN,COACH,TESTS,RIFF};
})();
/*@FKG1_END@*/

// ----- FKG2: фанк, гитара, часть 2 -----
// Фанк, электрогитара, часть 2: A16–A23, A38, A39, L24–L31, L40, C32–C36.
// Вариант = свой материал (аккорд и его форма, позиция, гармония, ритмическая ячейка), уровни — сложность внутри варианта.
// Такт записан ячейкой из 16 шестнадцатых: X — удар (следующий аккорд или нота из списка, по кругу),
// x — мёртвый удар (по струнам последнего аккорда), M — удар с палм-мьютом, - — продление, . — пауза.
const FKG2=(()=>{
  const dz=c=>c.split('+').map(p=>p[0]+'x').join('+');
  const R=(cell,seq)=>{
    const o=[];let i=0,last=null,lastC=null;
    for(const ch of cell){
      if(ch==='-'){o[o.length-1].k++;continue;}
      let t;
      if(ch==='X'||ch==='M'){last=seq[i++%seq.length];if(last.includes('+'))lastC=last;t=ch==='M'?last+'m':last;}
      else if(ch==='x')t=dz(lastC||last||seq[0]);
      else t='.';
      o.push({t,k:1});
    }
    return o.map(x=>x.k>1?x.t+':'+x.k:x.t).join(' ');
  };
  // ритмические ячейки (16 шестнадцатых)
  const K={
    q:'X---X---X---X---',  e8:'X-x-X-x-X-x-X-x-', s24:'....X-.x....X-.x', scr:'XxxxXxxxXxxxXxxx',
    off:'xxXxxxXxxxXxxxXx', one:'X--xx-X-x-Xxx-X-', and:'.xXx.xXx.xXx.xXx', b3:'X-xX-xX-xX-xX-xx',
    syn:'X-xxX-xxx-X-x-xx', e2:'xX-xxX-xxX-xxX-x', d33:'X--X--X---X--X--', bz:'XxXxxXxXXxXxxXxX',
    pk:'X---.--xX-x.X-.x', h1:'X-X-x-x-X-X-x-x-', h2:'XX..xxXX..xxXX..', h3:'X-Xx.xX-Xx.xX-X-',
    st1:'X.....X...X.....', st2:'..X...X.x.X..X..', st3:'X..X..X.....X.X.', st4:'.X..X.....X.XX..',
    a8:'X-X-X-X-X-X-X-X-', a16:'XXXXXXXXXXXXXXXX', ag:'XxXXxXXxXXxXXxXX', ag2:'XXxXXXxXXXxXXXxX',
    md:'MxMMxMMxMMxMMxMx', mo:'M-xM-xM-xM-xMMxM', rl:'Xx..Xx..Xx..Xx..', rl2:'Xx.XXx..Xx.XXx.x', rl3:'.XxXx.Xx.XxXx.Xx',
    sn:'X.X.XxX.X.XxXxXx', sn2:'XxXx.xXxXxXx.xXx', sl:'X-X.XxX.X-X.XxXx'
  };
  // формы аккордов (стандартный строй, r — лад основы формы)
  const n94=r=>`D${r-1}+G${r}+B${r}+e${r}`,n9t=r=>`G${r}+B${r}+e${r}`,n9f=r=>`A${r}+D${r-1}+G${r}+B${r}+e${r}`;
  const s79=r=>`A${r}+D${r-1}+G${r}+B${r+1}`,d7a=r=>`A${r}+D${r-1}+G${r}+B${r+2}`;
  const d13=r=>`E${r}+D${r}+G${r+1}+B${r+2}`,d9e=r=>`E${r}+D${r}+G${r-1}+B${r}`,t13=r=>`D${r}+G${r+1}+B${r+2}`,t9=r=>`D${r}+G${r-1}+B${r}`;
  const m7e=r=>`D${r}+G${r}+B${r}+e${r}`,m9=r=>`A${r}+D${r-2}+G${r}+B${r}`,m7a=r=>`A${r}+D${r+2}+G${r}+B${r+1}`;
  const Ma1=a=>`G${a}+B${a}+e${a-2}`,Ma2=a=>`G${a-1}+B${a}+e${a-1}`,Ma3=a=>`G${a+1}+B${a}+e${a}`,mi3=a=>`G${a}+B${a}+e${a}`;
  const hm1=a=>[`G${a}+B${a-1}+e${a-2}`,`Bh${a}`],hm2=a=>[`G${a-1}+B${a}+e${a-2}`,`eh${a-1}`],hm3=a=>[`G${a}+B${a}+e${a}`,`Gh${a+1}`];
  const q3=a=>`D${a}+G${a}+B${a+1}`,qL=a=>`A${a}+D${a}+G${a}`,q2=a=>`B${a}+e${a}`;
  const ap=(a,t)=>[a].concat(Array(15).fill(t));
  // вариант: A, B, C, D — списки для тактов; c — ячейки уровней 1, 2–3, 4–5; cb — ячейки для тактов B и D (если другие)
  const V=(l,le,A,B,C,D,c,cb)=>({l,le,A,B,C,D,c:c.map(k=>K[k]),cb:(cb||c).map(k=>K[k])});
  const lvOf=v=>{const [c1,c2,c3]=v.c,[b1,b2,b3]=v.cb;return [
    R(c1,v.A),
    R(c2,v.A),
    R(c2,v.A)+' | '+R(b2,v.B),
    R(c3,v.A)+' | '+R(b3,v.B),
    R(c3,v.A)+' | '+R(b3,v.B)+' | '+R(c2,v.C)+' | '+R(b3,v.D)].map(t=>({t:[t]}));};
  const CH=['Один аккорд, простой ритм','Шестнадцатые: рука не останавливается','Два аккорда','Синкопы','Четыре такта с подъездом'];
  const CHE=['One chord, simple rhythm','Sixteenths: the hand never stops','Two chords','Syncopation','Four bars with an approach chord'];
  const pth=p=>({A:[p[0],p[1],p[2],p[3],p[2],p[1]],B:[p[3],p[4],p[5],p[6],p[5],p[4]],C:[p[6],p[5],p[4],p[3],p[2],p[1]],D:[p[1],p[2],p[1],p[0]]});
  const PV=(l,le,p,c,cb)=>{const q=pth(p);return V(l,le,q.A,q.B,q.C,q.D,c,cb);};
  const pent=s=>{const a=s.split(' ');return {A:[a[4],a[5],a[6],a[5],a[4],a[3]],B:[a[6],a[7],a[8],a[9],a[8],a[7]],C:[a[9],a[8],a[7],a[6],a[5],a[4]],D:[a[3],a[4],a[5],a[2]]};};
  const scl=s=>{const a=s.split(' '),d=a.slice().reverse(),th=[];for(let i=0;i<6;i++)th.push(a[i],a[i+2]);return {A:a.concat(d),B:th,C:a,D:d};};
  const D={
    A16:[V('{E}9 → {D}9 на трёх верхних струнах, скретч','{E}9 → {D}9 on the top three strings, scratch',[n9t(7)],[n9t(5)],[n9t(7)],ap(n9t(6),n9t(7)),['e8','scr','bz']),
         V('{D}9 → {G}9 пятиструнные, удары на 2 и 4','{D}9 → {G}9 five-string shapes, hits on 2 and 4',[n9f(5)],[n9f(10)],[n9f(5)],ap(n9f(4),n9f(5)),['q','s24','pk']),
         V('{E}9 → {A}9, подъезд с {F}9 сверху','{E}9 → {A}9, approach from {F}9 above',[n94(7)],[n94(12)],[n94(7)],ap(n94(8),n94(7)),['e8','scr','one']),
         V('{C}9 → {F}9 в 3-й позиции, акценты на «и»','{C}9 → {F}9 in 3rd position, accents on the “and”',[n9f(3)],[n9f(8)],[n9f(3)],ap(n9f(2),n9f(3)),['q','and','d33']),
         V('{B}9 → {E}9, акцент на вторую шестнадцатую','{B}9 → {E}9, accent on the second sixteenth',[n94(2)],[n94(7)],[n94(2)],ap(n94(1),n94(2)),['e8','e2','off']),
         V('{D}9 – {D#}9 – {E}9: хроматическая лестница','{D}9 – {D#}9 – {E}9: chromatic ladder',[n94(5),n94(6),n94(7)],[n94(7),n94(6),n94(5)],[n94(5)],ap(n94(6),n94(7)),['q','scr','b3'])],
    A17:[V('{E}7#9: удары на долю, потом шестнадцатые','{E}7#9: hits on the beat, then sixteenths',[s79(7)],[s79(12)],[s79(7)],ap(s79(6),s79(7)),['q','scr','syn']),
         V('{D}7#9 → {G}7#9, мёртвые на «и»','{D}7#9 → {G}7#9, dead strums on the “and”',[s79(5)],[s79(10)],[s79(5)],ap(s79(4),s79(5)),['e8','and','bz']),
         V('{B}7#9 → {E}7#9 с низкой тоникой','{B}7#9 → {E}7#9 with a low root',['A2',s79(2),s79(2)],['A7',s79(7),s79(7)],[s79(2)],ap(s79(1),s79(2)),['e8','one','d33']),
         V('{C}7#9 → {F}7#9, подъезд снизу','{C}7#9 → {F}7#9, approach from below',[s79(3)],[s79(8)],[s79(3)],ap(s79(2),s79(3)),['q','e2','pk']),
         V('7#9 ↔ 7: один палец меняет цвет ({E} и {D})','7#9 ↔ 7: one finger changes the colour ({E} and {D})',[s79(7),d7a(7)],[s79(5),d7a(5)],[s79(7)],ap(s79(6),s79(7)),['e8','scr','b3']),
         V('{A}7#9 высоко, короткие стабы','{A}7#9 up high, short stabs',[s79(12)],[s79(10)],[s79(12)],ap(s79(11),s79(12)),['s24','pk','d33'])],
    A18:[V('{A}13 ↔ {A}9 на 5-м ладу','{A}13 ↔ {A}9 at the 5th fret',[d13(5),d9e(5)],[d13(10),d9e(10)],[d13(5)],ap(d13(4),d13(5)),['q','scr','bz']),
         V('{G}13 → {C}13, акценты на «и»','{G}13 → {C}13, accents on the “and”',[d13(3),d9e(3)],[d13(8),d9e(8)],[d13(3)],ap(d13(2),d13(3)),['e8','and','d33']),
         V('{B}13 → {E}13, вступление со второй шестнадцатой','{B}13 → {E}13, entry on the second sixteenth',[d13(7)],[d13(12)],[d13(7),d9e(7)],ap(d13(6),d13(7)),['s24','e2','syn']),
         V('{A}13 → {D}13 без баса, три струны','{A}13 → {D}13 without the bass, three strings',[t13(5),t9(5)],[t13(10),t9(10)],[t13(5)],ap(t13(4),t13(5)),['e8','off','one']),
         V('{E}13 → {A}13: мелодия в верхнем голосе','{E}13 → {A}13: a melody in the top voice',[d13(12),d9e(12)],[d13(5),d9e(5)],[d13(12)],ap(d13(11),d13(12)),['q','bz','b3']),
         V('{F#}13 → {B}13, ритм 3+3+2','{F#}13 → {B}13, 3+3+2 rhythm',[d13(2),d9e(2)],[d13(7),d9e(7)],[d13(2)],ap(d13(1),d13(2)),['e8','b3','d33'])],
    A19:[V('{D} → {A}: обращения рядом','{D} → {A}: inversions close together',[Ma1(7)],[Ma3(5)],[Ma2(10)],ap(Ma1(6),Ma1(7)),['e8','scr','bz']),
         V('{E}m → {A}: дорийский ход','{E}m → {A}: Dorian move',[`G9+B8+e7`],[Ma2(10)],[mi3(12)],ap(`G8+B7+e6`,`G9+B8+e7`),['q','and','b3']),
         V('{G} – {C} – {D}: три аккорда','{G} – {C} – {D}: three chords',[Ma3(3)],[Ma2(13)],[Ma1(7)],ap(Ma1(6),Ma1(7)),['e8','e2','off']),
         V('{A}m → {D}: подъезд на полтона','{A}m → {D}: half-step approach',[mi3(5)],[Ma1(7)],[`G9+B10+e8`],ap(mi3(4),mi3(5)),['s24','one','syn']),
         V('{B}m – {G} – {A}: минорный вамп','{B}m – {G} – {A}: minor vamp',[mi3(7)],[Ma2(8)],[Ma3(5)],ap(mi3(6),mi3(7)),['q','off','d33']),
         V('{E} и {D}: три обращения вверх по грифу','{E} and {D}: three inversions up the neck',[Ma2(5),Ma1(9),Ma3(12)],[Ma2(3),Ma1(7),Ma3(10)],[Ma2(5),Ma1(9),Ma3(12)],ap(Ma1(8),Ma1(9)),['q','scr','bz'])],
    A20:[PV('{A}: сексты через струну по миксолидийскому','{A}: sixths over a skipped string, Mixolydian',['G2+e2','G4+e3','G6+e5','G7+e7','G9+e9','G11+e10','G12+e12'],['a8','ag','sn']),
         PV('{E}: терции на двух верхних струнах','{E}: thirds on the top two strings',['B5+e4','B7+e5','B9+e7','B10+e9','B12+e10','B14+e12','B15+e14'],['a8','ag2','sn2']),
         V('{A}: хаммер в сексту','{A}: hammer-on into the sixth',['G1+e2','Gh2','G4+e3','G2+e2'],['G6+e5','Gh7','G9+e9','G7+e7'],['G11+e10','Gh12','G9+e9','G7+e7'],['G1+e2','Gh2','G2+e2','G2+e2'],['h1','h2','h3']),
         PV('{E}: сексты на средних струнах','{E}: sixths on the middle strings',['D2+B2','D4+B3','D6+B5','D7+B7','D9+B9','D11+B10','D12+B12'],['a8','sl','sn']),
         PV('{A}: терции с мёртвыми ударами, соул','{A}: thirds with dead strums, soul style',['G2+B2','G4+B3','G6+B5','G7+B7','G9+B8','G11+B10','G12+B12'],['e8','bz','one']),
         PV('{D}: сексты высоко, мелодия сверху','{D}: sixths up high, melody on top',['G7+e7','G9+e8','G11+e10','G12+e12','G14+e14','G16+e15','G17+e17'],['a8','sn2','d33'])],
    A21:[V('{E}m9 → {A}9: дорийский вамп','{E}m9 → {A}9: Dorian vamp',[m9(7)],[d9e(5)],[m9(7)],ap(m9(6),m9(7)),['q','scr','off']),
         V('{A}m7 → {D}9: один палец вниз','{A}m7 → {D}9: one finger down',[m7e(5)],[n94(5)],[m7e(5)],ap(m7e(4),m7e(5)),['e8','and','bz']),
         V('{D}m9 → {G}13: ii–V','{D}m9 → {G}13: ii–V',[m9(5)],[d13(3)],[m9(5)],ap(m9(4),m9(5)),['s24','one','d33']),
         V('{F#}m7 → {B}m7: смена позиции на кварту','{F#}m7 → {B}m7: a position shift by a fourth',[m7a(9)],[m7a(2)],[m7a(9)],ap(m7a(8),m7a(9)),['e8','e2','syn']),
         V('{B}m7 → {E}9: меняется одна нота','{B}m7 → {E}9: only one note changes',[m7e(7)],[n94(7)],[m7e(7)],ap(m7e(6),m7e(7)),['q','off','b3']),
         V('{C}m9 → {F}9: короткие удары','{C}m9 → {F}9: short hits',[m9(3)],[n94(8)],[m9(3)],ap(m9(2),m9(3)),['e8','scr','pk'])],
    A22:[V('{A} → {D}: хаммер в терцию, тоника сверху','{A} → {D}: hammer into the third, root on top',hm3(5),hm3(10),hm3(5),hm3(4).concat(hm3(5)),['h1','h2','h3']),
         V('{E} → {A}: хаммер в среднем голосе','{E} → {A}: hammer-on in the middle voice',hm1(9),hm1(14),hm1(9),hm1(8).concat(hm1(9)),['h1','h3','bz']),
         V('{D} → {G}: хаммер в верхнем голосе','{D} → {G}: hammer-on in the top voice',hm2(3),hm2(8),hm2(3),hm2(2).concat(hm2(3)),['h1','h2','bz']),
         V('{A} – {G} – {D}: три формы','{A} – {G} – {D}: three shapes',hm3(5),hm2(8),hm1(7),hm3(4).concat(hm3(5)),['h1','h3','h2']),
         V('{E}9: хаммер из квартсекстаккорда','{E}9: hammer-on out of a sus shape',['G7+B5+e7','Bh7'],hm3(5),['G7+B5+e7','Bh7'],['G6+B4+e6','Bh6','G7+B5+e7','Bh7'],['h1','h2','h3']),
         V('{C} → {F}: хаммеры шестнадцатыми','{C} → {F}: hammer-ons in sixteenths',hm3(8),hm3(1),hm3(8),hm3(7).concat(hm3(8)),['h1','bz','h3'])],
    A23:[V('{E}m: кварты по дорийскому','{E}m: fourths through the Dorian mode',[q3(2),q3(4),q3(5),q3(4)],[q3(7),q3(9),q3(7),q3(5)],[q3(9),q3(7),q3(5),q3(4)],ap(q3(1),q3(2)),['q','scr','one']),
         V('{A}m: кварты двумя нотами сверху','{A}m: two-note fourths on top',[q2(5),q2(7),q2(8),q2(7)],[q2(10),q2(12),q2(10),q2(8)],[q2(12),q2(10),q2(8),q2(7)],ap(q2(4),q2(5)),['a8','ag','sn']),
         V('{G}: бас на долю, кварты в ответ','{G}: bass on the beat, fourths answer',['E3',q3(5),q3(5)],['A3',q3(7),q3(7)],['E3',q3(5)],ap(q3(4),q3(5)),['e8','one','syn']),
         V('{C}: кварты на нижних струнах с мьютом','{C}: fourths on the low strings, palm muted',[qL(3),qL(5),qL(6),qL(5)],[qL(8),qL(10),qL(8),qL(6)],[qL(3)],ap(qL(2),qL(3)),['q','md','mo']),
         V('{F#}m: кварты с подъездом снизу','{F#}m: fourths with an approach from below',[q3(4),q3(6),q3(7),q3(6)],[q3(9),q3(11),q3(9),q3(7)],[q3(4)],ap(q3(3),q3(4)),['e8','and','d33']),
         V('{B}: параллельные кварты на тон','{B}: parallel fourths a whole step apart',[q3(9),q3(11)],[q3(4),q3(6)],[q3(9)],ap(q3(8),q3(9)),['s24','e2','b3'])],
    A38:[V('{E}m9: вверх-вниз по струнам','{E}m9: up and down the strings',['A7','D5','G7','B7','G7','D5'],['E5','D5','G4','B5','G4','D5'],['B7','G7','D5','A7'],['A7','D5','G7','B7'],['a8','a16','ag']),
         V('{D}9: через струну','{D}9: skipping strings',['D4','B5','G5','e5','G5','B5'],['D9','B10','G10','e10','G10','B10'],['e5','G5','B5','D4'],['D4','G5','B5','e5'],['a8','ag','ag2']),
         V('{C}maj7 → {F}maj7: мёртвые между нотами','{C}maj7 → {F}maj7: dead notes between',['D10','G9','B8','e7','B8','G9'],['D3','G2','B1','e0','B1','G2'],['e7','B8','G9','D10'],['D10','G9','B8','e7'],['a8','ag','sn']),
         V('{B}m7 → {E}9: от верхней струны вниз','{B}m7 → {E}9: from the top string down',['e7','B7','G7','D7','G7','B7'],['e7','B7','G7','D6','G7','B7'],['D7','G7','B7','e7'],['e7','B7','G7','D7'],['a8','a16','sn2']),
         V('{A}13 → {D}9: бас и аккорд по очереди','{A}13 → {D}9: bass and chord in turn',['E5','G6','D5','B7'],['A5','G5','D4','e5'],['B7','D5','G6','E5'],['E5','G6','D5','B7'],['a8','ag2','sn']),
         V('{G}m7 → {C}9: ломаное арпеджио','{G}m7 → {C}9: broken arpeggio',['A10','D12','G10','B11','G10','D12'],['A3','D2','G3','B3','e3','B3'],['B11','G10','D12','A10'],['A10','G10','D12','B11'],['a8','ag','sl'])],
    A39:[V('{E}9: стабы, ответ на «и»','{E}9: stabs, answer on the “and”',[n94(7)],[n94(12)],[n94(7)],ap(n94(6),n94(7)),['st1','st2','st3']),
         V('{A}13 ↔ {A}9: удары духовых','{A}13 ↔ {A}9: horn-section hits',[d13(5),d9e(5)],[d13(10),d9e(10)],[d13(5)],ap(d13(4),d13(5)),['st1','st3','st4']),
         V('{E}m7 → {A}: стаб и пауза','{E}m7 → {A}: stab and rest',[m7a(7)],[Ma3(5)],[m7a(7)],ap(m7a(6),m7a(7)),['st1','st4','st2']),
         V('{D}7#9 → {G}7#9: удар перед долей','{D}7#9 → {G}7#9: hit before the beat',[s79(5)],[s79(10)],[s79(5)],ap(s79(4),s79(5)),['st1','st2','st4']),
         V('{B}m – {G} – {A}: трезвучия-стабы','{B}m – {G} – {A}: triad stabs',[mi3(7)],[Ma2(8)],[Ma3(5)],ap(mi3(6),mi3(7)),['st1','st3','st2']),
         V('{C}m9 → {F}9: брейк в конце такта','{C}m9 → {F}9: break at the end of the bar',[m9(3)],[n94(8)],[m9(3)],ap(m9(2),m9(3)),['st1','st4','st3'])],
    L24:[V('{E}: одна нота и скретч','{E}: one note and a scratch',['D2'],['D5'],['D4','D2'],['D0','D2'],['e8','scr','one']),
         V('{A}m: три ноты на одной струне','{A}m: three notes on one string',['G2','G5','G7'],['G7','G5','G2'],['G5'],['G2'],['a8','ag','syn']),
         V('{D}: две ноты на соседних струнах','{D}: two notes on adjacent strings',['A5','D4','D7'],['D7','D4','A5'],['A5'],['A5','D7'],['e8','bz','b3']),
         V('{G}: двойная нота и скретч','{G}: a double stop and a scratch',['G7+B8'],['G5+B5'],['G7+B8'],ap('G6+B7','G7+B8'),['q','scr','d33']),
         V('{B}: синкопа на низкой ноте','{B}: syncopation on a low note',['A2','A5'],['A5','A2'],['A2'],['A4','A2'],['e8','e2','off']),
         V('{F#}m: высокие ноты с мьютом','{F#}m: high notes with a left-hand mute',['e2','e5','e4'],['e5','e4','e2'],['e2'],['e4','e2'],['a8','and','sn2'])],
    L25:[V('{E}m: пентатоника на одной струне','{E}m: pentatonic on one string',['A7','A10','Ah12','Ap10'],['A12','A10','A7','A5'],['A5','A7','A10','A7'],['A7','A10','A12','A7'],['a8','ag','sn']),
         V('{A}: дорийский по одной струне','{A}: Dorian along one string',['D7','D9','D10','D12'],['D12','D10','D9','D7'],['D7','D9','D10','D9'],['D9','D10','D12','D7'],['a8','ag2','sl']),
         V('{D}: миксолидийский по одной струне','{D}: Mixolydian along one string',['G7','G9','G11','G12'],['G12','G11','G9','G7'],['G7','G11','G9','G7'],['G9','G11','G12','G7'],['a8','sn2','bz']),
         V('{E}: блюзовый ход по низкой струне','{E}: bluesy line along the low string',['E0','E3','E5','E6'],['E7','E6','E5','E3'],['E0','E3','E0','E5'],['E3','E5','E3','E0'],['a8','one','syn']),
         V('{B}m: хаммер и пулл-офф на одной струне','{B}m: hammer-on and pull-off on one string',['B7','Bh10','Bp7','B5'],['B10','Bh12','Bp10','B7'],['B7','B10','B12','B10'],['B5','B7','Bh10','B7'],['a8','ag','sn']),
         V('{A}m9: высоко на одной струне','{A}m9: up high on one string',['e5','e8','e7','e10'],['e12','e10','e8','e7'],['e5','e7','e8','e10'],['e8','e7','e5','e7'],['a8','ag2','sn2'])],
    L26:[V('{E}: тоника, септима, октава','{E}: root, seventh, octave',['E0','E3','A2','E0','D2','E0','E3'],['E0','D0','D2','A2'],['E0','E3','E0','A2'],['E3','A2','E0','D2'],['e8','one','syn']),
         V('{A}m: дорийский рифф','{A}m: Dorian riff',['A0','A3','D2','A0','G0','D2','A3'],['A0','D0','D2','A3'],['A0','A3','A0','D2'],['A3','D2','A0','A2'],['e8','bz','b3']),
         V('{D}: рифф с открытой тоникой','{D}: riff with an open root',['D0','D3','G2','D0','A3','D0','D5'],['D0','D2','D3','A3'],['D0','D3','D0','G2'],['A3','D0','D3','D0'],['a8','off','d33']),
         V('{G}: рифф в 3-й позиции','{G}: riff in 3rd position',['E3','A2','E3','E5','A5','E3','D5'],['E3','A5','D5','A5'],['E3','E5','E3','A2'],['A5','A2','E3','E5'],['e8','one','sn']),
         V('{B}m: рифф со второй шестнадцатой','{B}m: riff starting on the second sixteenth',['A2','A5','D4','A2','E5','A2','A4'],['A2','D4','A5','A4'],['A2','A5','A2','D4'],['E5','A2','A5','A2'],['e8','e2','and']),
         V('{F#}m: рифф с октавой','{F#}m: riff with an octave jump',['E2','E5','A4','E2','D4','A2','E4'],['E2','D4','A4','E5'],['E2','E5','E2','A4'],['D4','A4','E2','E4'],['a8','scr','b3'])],
    L27:[Object.assign(V('{E} дорийский от 7-го лада','{E} Dorian from the 7th fret',[],[],[],[],['a8','a16','ag']),scl('A7 A9 A10 D7 D9 D11 D12 G9')),
         Object.assign(V('{A} дорийский от 5-го лада','{A} Dorian from the 5th fret',[],[],[],[],['a8','a16','ag2']),scl('E5 E7 E8 A5 A7 A9 A10 D7')),
         Object.assign(V('{D} дорийский, три ноты на струне','{D} Dorian, three notes per string',[],[],[],[],['a8','ag','a16']),scl('A5 A7 A8 D5 D7 D9 D10 G7')),
         Object.assign(V('{G} дорийский в 3-й позиции','{G} Dorian in 3rd position',[],[],[],[],['a8','a16','sn']),scl('E3 E5 E6 A3 A5 A7 A8 D5')),
         Object.assign(V('{B} дорийский во 2-й позиции','{B} Dorian in 2nd position',[],[],[],[],['a8','ag2','a16']),scl('A2 A4 A5 D2 D4 D6 D7 G4')),
         Object.assign(V('{F#} дорийский на верхних струнах','{F#} Dorian on the higher strings',[],[],[],[],['a8','a16','sl']),scl('D4 D6 D7 G4 G6 G8 G9 B7'))],
    L28:[Object.assign(V('{E}m, открытая позиция','{E}m, open position',[],[],[],[],['e8','bz','one']),pent('E0 E3 A0 A2 D0 D2 G0 G2 B0 B3 e0 e3')),
         Object.assign(V('{A}m, 5-я позиция','{A}m, 5th position',[],[],[],[],['e8','sn','syn']),pent('E5 E8 A5 A7 D5 D7 G5 G7 B5 B8 e5 e8')),
         Object.assign(V('{G}m, 3-я позиция','{G}m, 3rd position',[],[],[],[],['e8','sn2','b3']),pent('E3 E6 A3 A5 D3 D5 G3 G5 B3 B6 e3 e6')),
         Object.assign(V('{B}m, 7-я позиция','{B}m, 7th position',[],[],[],[],['e8','bz','d33']),pent('E7 E10 A7 A9 D7 D9 G7 G9 B7 B10 e7 e10')),
         Object.assign(V('{E}m, вторая позиция','{E}m, second position',[],[],[],[],['e8','e2','and']),pent('E3 E5 A2 A5 D2 D5 G2 G4 B3 B5 e3 e5')),
         Object.assign(V('{C}m, 8-я позиция','{C}m, 8th position',[],[],[],[],['e8','sl','off']),pent('E8 E11 A8 A10 D8 D10 G8 G10 B8 B11 e8 e11'))],
    L29:[V('{E}9: удар и отпускание','{E}9: hit and release',[n94(7)],[n94(12)],[n94(7)],ap(n94(6),n94(7)),['q','rl','rl2']),
         V('{A}m7: короткие восьмые','{A}m7: short eighths',[m7e(5)],[n94(5)],[m7e(5)],ap(m7e(4),m7e(5)),['rl','rl2','rl3']),
         V('{D}: трезвучие стаккато','{D}: staccato triad',[Ma1(7)],[Ma3(5)],[Ma1(7)],ap(Ma1(6),Ma1(7)),['q','rl3','rl2']),
         V('{C}7#9: отпускание на «и»','{C}7#9: release on the “and”',[s79(3)],[s79(8)],[s79(3)],ap(s79(2),s79(3)),['rl','rl2','pk']),
         V('{G}13 → {C}13: короткие стабы','{G}13 → {C}13: short stabs',[d13(3)],[d13(8)],[d13(3)],ap(d13(2),d13(3)),['q','rl','rl3']),
         V('{F#}m9 → {B}9: стаккато с синкопой','{F#}m9 → {B}9: staccato with syncopation',[m9(9)],[n94(2)],[m9(9)],ap(m9(8),m9(9)),['rl','rl3','st4'])],
    L30:[V('{E}9 снизу на полтона','{E}9 from a half step below',[n94(6),n94(7)],[n94(11),n94(12)],[n94(7)],ap(n94(6),n94(7)),['h1','h3','bz']),
         V('{A}13 сверху на полтона','{A}13 from a half step above',[d13(6),d13(5)],[d13(11),d13(10)],[d13(5)],ap(d13(6),d13(5)),['h1','h2','h3']),
         V('{D}9 через два полутона','{D}9 through two half steps',[n94(3),n94(4),n94(5)],[n94(8),n94(9),n94(10)],[n94(5)],ap(n94(4),n94(5)),['a8','b3','bz']),
         V('Трезвучия {A} → {D} снизу','Triads {A} → {D} from below',[Ma3(4),Ma3(5)],[Ma3(9),Ma3(10)],[Ma3(5)],ap(Ma3(4),Ma3(5)),['h1','h3','h2']),
         V('{E}m7 и {A}m7 сверху','{E}m7 and {A}m7 from above',[m7a(8),m7a(7)],[m7e(6),m7e(5)],[m7a(7)],ap(m7a(8),m7a(7)),['h1','h2','bz']),
         V('{C}7#9 → {F}7#9 снизу','{C}7#9 → {F}7#9 from below',[s79(2),s79(3)],[s79(7),s79(8)],[s79(3)],ap(s79(2),s79(3)),['h1','h3','h2'])],
    L31:[V('{E}m: бенд на тон в 12-й позиции','{E}m: whole-step bend in 12th position',['G14b16','G14b16r14','B12','e12','B15','G14'],['B15','e12','B15b17','B12','G14','G12'],['G14b16','B12','G14','D14'],['e12','B15','G14b16','G14'],['a8','sn','sl']),
         V('{A}m: бенд и спуск в 5-й позиции','{A}m: bend and descent in 5th position',['G7b9','B5','e5','B8','G7','D7'],['B8b10','B8','B5','G7','G5','D7'],['G7b9','G7','G5','D7'],['B5','G7b9','G7','D7'],['a8','sn2','bz']),
         V('{D}: бенды высоко','{D}: bends up high',['B13b15','e10','B13','G12','D12','G12'],['e13b15','e10','B13','B10','G12','G11'],['B13b15','B10','G12','D12'],['G12','B13b15','B10','G12'],['a8','sn','sl']),
         V('{A}m: бенд двойной ноты','{A}m: double-stop bend',['G7b9+B8','G7b9r7+B8','G5','D7'],['B8b10+e8','B8b10r8+e8','B5','G7'],['G7b9+B8','G5','D7','D5'],['G7b9+B8','G7','G5','D7'],['a8','sn2','sl']),
         V('{A}: бенды на полтона в мажорную терцию','{A}: half-step bends into the major third',['B8b9','B5','G7','G5'],['G5b6','G5','D7','D5'],['B8b9','B8','B5','G6'],['G5b6','G5','D7','A7'],['a8','sn','bz']),
         V('{G}m: бенд с вибрато','{G}m: bend with vibrato',['B6b8~','e3','B6','G5','D5','G3'],['G5b7~','G5','G3','D5','D3','A5'],['B6b8','G5','D5','A5'],['D5','G5b7~','G3','D5'],['a8','sn2','sl'])],
    L40:[PV('{E}m пентатоника октавами снизу','{E}m pentatonic in octaves from the bottom',['E0+D2','E3+D5','E5+D7','E7+D9','E10+D12','E12+D14','E15+D17'],['e8','sn','one']),
         PV('{A} дорийский октавами','{A} Dorian in octaves',['A0+G2','A2+G4','A3+G5','A5+G7','A7+G9','A9+G11','A10+G12'],['e8','sn2','b3']),
         PV('{D} миксолидийский на верхних октавах','{D} Mixolydian in upper octaves',['D0+B3','D2+B5','D4+B7','D5+B8','D7+B10','D9+B12','D10+B13'],['e8','bz','syn']),
         V('{G}: октавы с низкой на среднюю','{G}: octaves from the low pair to the middle pair',['E3+D5','E5+D7','A3+G5','A5+G7'],['A5+G7','A3+G5','E5+D7','E3+D5'],['E3+D5','A2+G4','E5+D7','A3+G5'],['E3+D5','E3+D5','E2+D4','E3+D5'],['e8','sn','d33']),
         PV('{B}m октавами с мёртвыми','{B}m in octaves with dead notes',['A2+G4','A5+G7','A7+G9','A9+G11','A12+G14','A14+G16','A16+G18'],['e8','bz','and']),
         V('{C}: октавы с подъездом снизу','{C}: octaves with an approach from below',['A2+G4','A3+G5','A5+G7','A6+G8'],['A8+G10','A10+G12','A8+G10','A6+G8'],['A3+G5','A5+G7','A6+G8','A5+G7'],['A2+G4','A3+G5','A3+G5','A3+G5'],['e8','sn2','sl'])],
    // связки: такт A и такт B — разные приёмы
    C32:[V('{E}9 → линия {E}m','{E}9 → {E}m line',[n94(7)],['A7','A10','D7','D9','D7','A10'],[n94(7)],['D9','D7','A10','A7'],['e8','scr','one'],['a8','ag','sn']),
         V('{A}m7 → дорийская линия','{A}m7 → Dorian line',[m7e(5)],['E5','E7','E8','A5','A7','A9'],[m7e(5)],['A9','A7','A5','E8'],['q','and','b3'],['a8','ag2','sn2']),
         V('{D}9 → миксолидийская линия','{D}9 → Mixolydian line',[n94(5)],['A5','A7','A9','D5','D7','D9'],[n94(5)],['D7','D5','A9','A7'],['e8','e2','syn'],['a8','bz','sl']),
         V('{G}13 → линия по низким струнам','{G}13 → line on the low strings',[d13(3)],['E3','E5','A2','A3','A5','E5'],[d13(3)],['A5','A3','E5','E3'],['q','scr','d33'],['a8','ag','sn']),
         V('{B}m7 → однонотный ответ','{B}m7 → single-note answer',[m7e(7)],['D7','D9','G7','G9','B7','G9'],[m7e(7)],['G9','G7','D9','D7'],['s24','off','pk'],['a8','sn','bz']),
         V('{C}7#9 → линия {C}m','{C}7#9 → {C}m line',[s79(3)],['A3','A6','D3','D5','D3','A6'],[s79(3)],['D5','D3','A6','A3'],['e8','bz','one'],['a8','ag2','sn2'])],
    C33:[V('{E}9: скретч → стаб','{E}9: scratch → stab',[n94(7)],[n94(7)],[n94(12)],ap(n94(6),n94(7)),['e8','scr','bz'],['st1','st2','st3']),
         V('{A}m7: скретч → стаб на «и»','{A}m7: scratch → stab on the “and”',[m7e(5)],[m7e(5)],[n94(5)],ap(m7e(4),m7e(5)),['e8','and','sn'],['st1','st4','st2']),
         V('{D}7#9: скретч → стаб','{D}7#9: scratch → stab',[s79(5)],[s79(5)],[s79(10)],ap(s79(4),s79(5)),['q','scr','one'],['st1','st3','st4']),
         V('{G}13: скретч → удар 13 → 9','{G}13: scratch → 13 → 9 hit',[d13(3)],[d13(3),d9e(3)],[d13(8)],ap(d13(2),d13(3)),['e8','bz','syn'],['st1','st2','st4']),
         V('Трезвучия {B}m – {A}: скретч → стаб','Triads {B}m – {A}: scratch → stab',[mi3(7)],[Ma3(5)],[mi3(7)],ap(mi3(6),mi3(7)),['e8','off','b3'],['st1','st3','st2']),
         V('{C}m9: скретч → стаб с подъездом','{C}m9: scratch → stab with an approach',[m9(3)],[m9(2),m9(3)],[n94(8)],ap(m9(2),m9(3)),['q','scr','d33'],['st1','st4','st3'])],
    C34:[V('{E}9 стаб → ответ линией','{E}9 stab → line answers',[n94(7)],['A7','A10','D7','D9','D7','A10'],[n94(7)],['D9','D7','A10','A7'],['st1','st2','st3'],['a8','ag','sn']),
         V('{A}13 стаб → ответ октавами','{A}13 stab → octaves answer',[d13(5)],['A0+G2','A3+G5','A5+G7','A3+G5'],[d13(5)],['A5+G7','A3+G5','A0+G2','A3+G5'],['st1','st3','st4'],['a8','sn2','sl']),
         V('{D}9 стаб → ответ секстами','{D}9 stab → sixths answer',[n94(5)],['G7+e7','G9+e8','G11+e10','G9+e8'],[n94(5)],['G11+e10','G9+e8','G7+e7','G7+e7'],['st1','st4','st2'],['a8','sn','bz']),
         V('{E}m7 стаб → ответ пентатоникой','{E}m7 stab → pentatonic answer',[m7a(7)],['D9','D7','G9','G7','D9','A10'],[m7a(7)],['A10','A7','D9','D7'],['st1','st2','st4'],['a8','ag2','sn2']),
         V('{G}13 стаб → ответ терциями','{G}13 stab → thirds answer',[d13(3)],['G7+B8','G9+B10','G7+B8','G5+B6'],[d13(3)],['G5+B6','G7+B8','G9+B10','G7+B8'],['st1','st3','st2'],['a8','bz','sl']),
         V('{B}7#9 стаб → ответ бендом','{B}7#9 stab → bend answers',[s79(2)],['G4b6','B3','G4','D4'],[s79(2)],['D4','G4b6','G4','A5'],['st1','st4','st3'],['a8','sn','sl'])],
    C35:[V('{E}9: вступление со второй шестнадцатой','{E}9: entry on the second sixteenth',[n94(7)],[n94(12)],[n94(7)],ap(n94(6),n94(7)),['e2','rl3','off']),
         V('{A}m7: удары на «и»','{A}m7: hits on the “and”',[m7e(5)],[n94(5)],[m7e(5)],ap(m7e(4),m7e(5)),['and','st4','rl3']),
         V('Рифф {E}: синкопы в карман','{E} riff: syncopation in the pocket',['E0','D2','E0','A2','E3'],['E0','E3','A2','D2'],['E0'],['E3','E0'],['e2','off','and']),
         V('{D}7#9: 3+3+2 со смещением','{D}7#9: 3+3+2, displaced',[s79(5)],[s79(10)],[s79(5)],ap(s79(4),s79(5)),['b3','d33','st4']),
         V('Октавы {A}: вступление на «а»','{A} octaves: entry on the “a”',['A0+G2','A3+G5','A5+G7'],['A5+G7','A3+G5','A0+G2'],['A0+G2'],['A2+G4','A3+G5'],['off','e2','rl3']),
         V('{C}m9 → {F}9: синкопы через такт','{C}m9 → {F}9: syncopation across the bar',[m9(3)],[n94(8)],[m9(3)],ap(m9(2),m9(3)),['and','st4','e2'])]
  };
  // этюды: 4 фрагмента = тот же уровень и вариант четырёх упражнений
  const ET=[['A16','L24','A20','L40'],['A17','L26','A22','L28'],['A21','L27','A19','L30'],['A18','L25','A23','L31'],['A39','L29','A38','C35'],['A21','C34','L40','A16']];
  const ETN=[['9-аккорды, скретч, сексты, октавы','ninth chords, scratch, sixths, octaves'],['7#9, басовый рифф, хаммеры, пентатоника','7#9, low riff, hammer-ons, pentatonic'],['минорный вамп, дорийский, трезвучия, подъезды','minor vamp, Dorian, triads, approaches'],['13-е аккорды, одна струна, кварты, бенды','13th chords, one string, fourths, bends'],['стабы, стаккато, арпеджио, синкопы','stabs, staccato, arpeggios, syncopation'],['вамп, вызов-ответ, октавы, 9-аккорды','vamp, call and response, octaves, ninth chords']];
  const LVL={};Object.keys(D).forEach(id=>{LVL[id]=D[id].map(lvOf);});
  D.C36=ET.map((e,i)=>({l:`Этюд ${i+1}: ${ETN[i][0]}`,le:`Étude ${i+1}: ${ETN[i][1]}`}));
  LVL.C36=ET.map((e,i)=>[0,1,2,3,4].map(j=>({t:e.map(id=>LVL[id][i][j].t[0].split(' | ').slice(0,2).join(' | '))})));
  // ---------- тексты ----------
  const T={
    A16:[{name:'Девятые аккорды',goal:'Главный аккорд фанка: доминантовый нонаккорд в духе James Brown.',how:'Формы девятого аккорда на трёх, четырёх и пяти струнах. Левая рука держит аккорд и отпускает его между ударами, правая всё время ходит шестнадцатыми.',tip:'Рука движется вниз-вверх без остановки, даже когда струны не звучат. Ритм держит правая рука, а не левая.',lvl:CH},
          {name:'Ninth chords',goal:'The main funk chord: the dominant ninth in the style of James Brown.',how:'Ninth-chord shapes on three, four and five strings. The left hand holds the chord and releases it between hits; the right hand keeps moving in sixteenths.',tip:'Keep the hand moving down and up even when the strings are silent. The right hand holds the rhythm, not the left.',lvl:CHE}],
    A17:[{name:'Аккорд 7#9',goal:'Острый «аккорд Хендрикса»: септима с повышенной ноной.',how:'Форма 7#9 от пятой струны. Сначала удары на долю, потом шестнадцатые с мёртвыми ударами, смена аккорда и синкопы.',tip:'Аккорд звучит жёстко: не держи его долго, короткий удар звучит лучше.',lvl:CH},
          {name:'7#9 chord',goal:'The sharp “Hendrix chord”: a seventh with a raised ninth.',how:'The 7#9 shape from the fifth string. First hits on the beat, then sixteenths with dead strums, a chord change and syncopation.',tip:'The chord sounds harsh: do not let it ring too long, a short hit sounds better.',lvl:CHE}],
    A18:[{name:'Тринадцатые аккорды',goal:'Ход 13 → 9 одним пальцем — классика соул и фанка.',how:'Форма тринадцатого аккорда от шестой струны. Мизинец снимается или переставляется, и аккорд превращается в девятый. Дальше смена аккорда и синкопы.',tip:'Двигается один палец, остальные стоят. Слушай, как в верхнем голосе получается мелодия.',lvl:CH},
          {name:'Thirteenth chords',goal:'The 13 → 9 move with one finger, a soul and funk classic.',how:'The thirteenth-chord shape from the sixth string. The pinky lifts or moves, and the chord turns into a ninth. Then a chord change and syncopation.',tip:'One finger moves, the others stay. Listen to the melody it makes in the top voice.',lvl:CHE}],
    A19:[{name:'Трезвучия на трёх верхних',goal:'Маленькие аккорды, которые не мешают басу и клавишам.',how:'Мажорные и минорные трезвучия на трёх верхних струнах в разных обращениях. Ищи ближайшую форму следующего аккорда.',tip:'Чем выше и короче аккорд, тем лучше он слышен в плотном миксе.',lvl:CH},
          {name:'Triads on the top three strings',goal:'Small chords that stay out of the way of bass and keys.',how:'Major and minor triads on the top three strings in different inversions. Find the nearest shape of the next chord.',tip:'The higher and shorter the chord, the better it cuts through a dense mix.',lvl:CHE}],
    A20:[{name:'Двойные ноты',goal:'Сексты и терции в духе соул и Curtis Mayfield.',how:'Две ноты сразу ходят по ладу: сексты через струну, терции на соседних струнах. Среднюю струну глуши пальцем, который играет нижнюю ноту.',tip:'Обе ноты должны звучать одинаково громко. Пробуй играть пальцами или гибридно.',lvl:['Восьмые вверх по ладу','Шестнадцатые вверх и вниз','Две части лада','Синкопы','Четыре такта по всему ладу']},
          {name:'Double stops',goal:'Sixths and thirds in the style of soul and Curtis Mayfield.',how:'Two notes at once move through the mode: sixths across a skipped string, thirds on adjacent strings. Mute the middle string with the finger that plays the lower note.',tip:'Both notes should be equally loud. Try fingers or hybrid picking.',lvl:['Eighths up the mode','Sixteenths up and down','Two parts of the mode','Syncopation','Four bars across the whole mode']}],
    A21:[{name:'Минорные септ- и нонаккорды',goal:'Дорийский вамп: m7 и m9 против доминанты.',how:'Минорный аккорд держит такт, второй аккорд отвечает. Вариант меняет форму аккорда и гармонию: вамп, ii–V, смена позиции.',tip:'Минорный аккорд в фанке звучит коротко и сухо: отпускай его сразу после удара.',lvl:CH},
          {name:'Minor seventh and ninth chords',goal:'The Dorian vamp: m7 and m9 against a dominant.',how:'The minor chord holds the bar and the second chord answers. The variant changes the chord shape and the harmony: vamp, ii–V, position shift.',tip:'A minor chord in funk sounds short and dry: release it right after the hit.',lvl:CHE}],
    A22:[{name:'Хаммеры в аккордах',goal:'Украшение аккорда хаммером в духе Curtis Mayfield и Jimi Hendrix.',how:'Аккорд звучит без терции (или с квартой), палец хаммером ставит её на место. Вариант меняет голос, в котором звучит хаммер.',tip:'Хаммер должен звучать так же громко, как удар. Бей пальцем с высоты, а не дави.',lvl:['Аккорд и хаммер восьмыми','Пары шестнадцатыми','Два аккорда','Плотные шестнадцатые','Четыре такта с подъездом']},
          {name:'Hammer-ons in chords',goal:'Decorating a chord with a hammer-on in the style of Curtis Mayfield and Jimi Hendrix.',how:'The chord sounds without its third (or with a fourth), and a finger hammers the third into place. The variant changes the voice where the hammer-on happens.',tip:'The hammer-on should be as loud as the strum. Strike from above with the finger instead of pressing.',lvl:['Chord and hammer-on in eighths','Pairs in sixteenths','Two chords','Dense sixteenths','Four bars with an approach']}],
    A23:[{name:'Квартовые аккорды',goal:'Аккорды из кварт — открытый, «современный» звук фанка и фьюжна.',how:'Три или две ноты квартами двигаются параллельно по ладу. Одна форма — разные ступени.',tip:'Форма не меняется, двигается вся рука. Следи, чтобы все ноты звучали ровно.',lvl:['Четыре аккорда на долю','Шестнадцатые','Две позиции','Синкопы','Четыре такта с подъездом']},
          {name:'Quartal chords',goal:'Chords built from fourths: the open, modern sound of funk and fusion.',how:'Three or two notes stacked in fourths move in parallel through the mode. One shape, different degrees.',tip:'The shape does not change, the whole hand moves. Make sure every note sounds evenly.',lvl:['Four chords, one per beat','Sixteenths','Two positions','Syncopation','Four bars with an approach']}],
    A38:[{name:'Арпеджио аккорда шестнадцатыми',goal:'Разложить аккорд по струнам ровными шестнадцатыми.',how:'Левая рука держит форму, правая играет по одной ноте. Вариант меняет аккорд и порядок струн: вверх-вниз, через струну, бас и аккорд по очереди.',tip:'Каждая нота отдельно: снимай звук предыдущей струны, не давай аккорду звенеть.',lvl:['Восьмые','Шестнадцатые','Смена аккорда','С мёртвыми нотами','Четыре такта']},
          {name:'Chord arpeggios in sixteenths',goal:'Break a chord across the strings in even sixteenths.',how:'The left hand holds the shape, the right hand plays one note at a time. The variant changes the chord and the string order: up and down, skipping strings, bass and chord in turn.',tip:'Every note on its own: stop the previous string and do not let the chord ring.',lvl:['Eighths','Sixteenths','Chord change','With dead notes','Four bars']}],
    A39:[{name:'Стабы',goal:'Короткие удары аккордом, как у духовой секции.',how:'Аккорд звучит одну шестнадцатую и сразу глушится. Между ударами — паузы, которые нужно отсчитывать так же точно, как удары.',tip:'Правая рука продолжает ходить шестнадцатыми над струнами, не касаясь их: так удар попадает точно.',lvl:['Удар на сильную долю','Стабы и паузы','Два аккорда','Удары перед долей','Четыре такта']},
          {name:'Stabs',goal:'Short chord hits like a horn section.',how:'The chord sounds for one sixteenth and is muted at once. Between hits there are rests: count them as precisely as the hits.',tip:'Keep the right hand moving in sixteenths above the strings without touching them: that puts every hit in the right place.',lvl:['Hit on the downbeat','Stabs and rests','Two chords','Hits before the beat','Four bars']}],
    L24:[{name:'Мьют левой рукой',goal:'Нота и «скретч» одной рукой: звук включается и выключается левой.',how:'Нажми ноту — звучит, ослабь — мёртвый щелчок. Правая рука не останавливается.',tip:'Не отрывай палец от струны полностью: достаточно ослабить нажим.',lvl:['Нота и мёртвый щелчок восьмыми','Шестнадцатые','Две фигуры','Синкопы','Четыре такта']},
          {name:'Left-hand muting',goal:'A note and a scratch with one hand: the left hand turns the sound on and off.',how:'Press the note and it rings; relax and it becomes a dead click. The right hand never stops.',tip:'Do not lift the finger off the string completely: just release the pressure.',lvl:['Note and dead click in eighths','Sixteenths','Two figures','Syncopation','Four bars']}],
    L25:[{name:'Рифф на одной струне',goal:'Однонотный фанк-рифф вдоль грифа, а не поперёк.',how:'Вся фраза на одной струне: рука двигается по ладам. Вариант меняет струну и лад.',tip:'Смещай руку на ноте, сыгранной указательным, — переход не слышен.',lvl:['Восьмые','Шестнадцатые','Фраза вверх и вниз','Синкопы','Четыре такта']},
          {name:'One-string riff',goal:'A single-note funk riff along the neck, not across it.',how:'The whole phrase stays on one string and the hand moves along the frets. The variant changes the string and the mode.',tip:'Shift the hand on a note played with the index finger: the shift becomes inaudible.',lvl:['Eighths','Sixteenths','Phrase up and down','Syncopation','Four bars']}],
    L26:[{name:'Однонотный рифф на нижних струнах',goal:'Басовый по характеру рифф в духе James Brown и The Meters.',how:'Нота за нотой на нижних струнах, с мёртвыми нотами между ними. Каждый вариант — свой рифф и своя тональность.',tip:'Играй коротко: каждая нота заканчивается до следующей, как у басиста.',lvl:['Восьмые','Шестнадцатые','Два риффа','Синкопы','Четыре такта']},
          {name:'Single-note riff on the low strings',goal:'A bass-like riff in the style of James Brown and The Meters.',how:'Note after note on the low strings, with dead notes between them. Each variant has its own riff and key.',tip:'Play short: every note ends before the next one, like a bass player.',lvl:['Eighths','Sixteenths','Two riffs','Syncopation','Four bars']}],
    L27:[{name:'Дорийский лад шестнадцатыми',goal:'Главный лад фанка — ровно и в карман.',how:'Лад вверх и вниз, потом терциями. Вариант меняет тональность и позицию.',tip:'Шестнадцатые ровные, акцент — на каждой доле.',lvl:['Восьмые вверх и вниз','Шестнадцатые','Терции','С мёртвыми нотами','Четыре такта']},
          {name:'Dorian mode in sixteenths',goal:'The main funk mode, even and in the pocket.',how:'The mode up and down, then in thirds. The variant changes the key and the position.',tip:'Keep the sixteenths even with an accent on every beat.',lvl:['Eighths up and down','Sixteenths','Thirds','With dead notes','Four bars']}],
    L28:[{name:'Пентатоника с мёртвыми нотами',goal:'Фанковая фраза: ноты пентатоники, между ними — глухие щелчки.',how:'Короткие фразы в одной позиции. Мёртвая нота — ослабленный палец на той же струне.',tip:'Мёртвые ноты тише звучащих. Именно они дают ощущение шестнадцатых.',lvl:['Восьмые','Плотные шестнадцатые','Две фразы','Синкопы','Четыре такта']},
          {name:'Pentatonic with dead notes',goal:'A funk phrase: pentatonic notes with dead clicks between them.',how:'Short phrases in one position. A dead note is a relaxed finger on the same string.',tip:'Dead notes are quieter than the ringing ones. They are what makes you feel the sixteenths.',lvl:['Eighths','Dense sixteenths','Two phrases','Syncopation','Four bars']}],
    L29:[{name:'Стаккато аккордом',goal:'Короткий аккорд: звук обрывает левая рука.',how:'Удар — и сразу ослабить нажим. Мёртвый удар после аккорда тоже входит в ритм.',tip:'Аккорд должен звучать ровно столько, сколько написано. Отпускай вовремя, а не «когда-нибудь».',lvl:['Удар на долю','Короткие удары','Два аккорда','Синкопы','Четыре такта']},
          {name:'Staccato chords',goal:'A short chord: the left hand cuts the sound.',how:'Hit and release the pressure at once. The dead strum after the chord is part of the rhythm too.',tip:'The chord should ring exactly as long as written. Release on time, not whenever.',lvl:['Hit on the beat','Short hits','Two chords','Syncopation','Four bars']}],
    L30:[{name:'Хроматический подъезд',goal:'Въехать в аккорд на полтона снизу или сверху.',how:'Та же форма на соседнем ладу звучит за шестнадцатую до аккорда. Вариант меняет аккорд и направление подъезда.',tip:'Подъезд короче и тише целевого аккорда. Ударение — на цели.',lvl:['Подъезд и аккорд','Шестнадцатые','Два аккорда','Плотный ритм','Четыре такта']},
          {name:'Chromatic approach',goal:'Slide into a chord from a half step below or above.',how:'The same shape one fret away sounds a sixteenth before the chord. The variant changes the chord and the direction of the approach.',tip:'The approach is shorter and quieter than the target. The accent goes on the target.',lvl:['Approach and chord','Sixteenths','Two chords','Dense rhythm','Four bars']}],
    L31:[{name:'Бенды в фанк-соло',goal:'Короткие точные бенды в коротких фразах.',how:'Бенд на тон или на полтона, затем пентатоника вниз. Вариант меняет позицию и вид бенда.',tip:'В фанке бенд короткий: дотянул — сразу следующая нота.',lvl:['Восьмые','Шестнадцатые','Две фразы','Синкопы','Четыре такта']},
          {name:'Bends in a funk solo',goal:'Short, accurate bends in short phrases.',how:'A whole-step or half-step bend, then down the pentatonic. The variant changes the position and the kind of bend.',tip:'In funk a bend is short: reach the pitch and go straight to the next note.',lvl:['Eighths','Sixteenths','Two phrases','Syncopation','Four bars']}],
    L40:[{name:'Октавы',goal:'Однонотная линия октавами — плотный звук в духе Wes Montgomery и фанка.',how:'Две ноты через струну, средняя заглушена указательным. Бей по всем трём струнам.',tip:'Если звенит средняя струна, положи указательный чуть площе.',lvl:['Восьмые','Шестнадцатые','Две части лада','Синкопы','Четыре такта']},
          {name:'Octaves',goal:'A single-note line in octaves: a fat sound in the style of Wes Montgomery and funk.',how:'Two notes with a string between them, the middle one muted by the index finger. Strike all three strings.',tip:'If the middle string rings, lay the index finger a little flatter.',lvl:['Eighths','Sixteenths','Two parts of the mode','Syncopation','Four bars']}],
    C32:[{name:'Аккорд → линия',goal:'Переход из аккорда в однонотную линию без потери грува.',how:'Такт аккордом, такт однонотной линией. Правая рука одинаково ходит шестнадцатыми в обоих тактах.',tip:'Грув держит правая рука: её движение не меняется, когда левая переходит с аккорда на линию.',lvl:['Аккорд, простой ритм','Аккорд шестнадцатыми','Такт аккорда, такт линии','Синкопы в обоих тактах','Четыре такта']},
          {name:'Chord → line',goal:'Go from a chord to a single-note line without losing the groove.',how:'A bar of chord, a bar of single-note line. The right hand moves in sixteenths the same way in both bars.',tip:'The right hand holds the groove: its motion does not change when the left hand moves from chord to line.',lvl:['Chord, simple rhythm','Chord in sixteenths','A bar of chord, a bar of line','Syncopation in both bars','Four bars']}],
    C33:[{name:'Скретч → стаб',goal:'Плотный скретч и короткий удар — два характера одной партии.',how:'Такт шестнадцатых с мёртвыми ударами, такт коротких стабов с паузами.',tip:'В такте стабов рука продолжает двигаться над струнами — так паузы точные.',lvl:['Аккорд и стаб','Скретч и стабы','Скретч, потом стабы','Синкопы','Четыре такта']},
          {name:'Scratch → stab',goal:'A dense scratch and a short hit: two characters in one part.',how:'A bar of sixteenths with dead strums, a bar of short stabs with rests.',tip:'In the stab bar the hand keeps moving above the strings: that keeps the rests accurate.',lvl:['Chord and stab','Scratch and stabs','Scratch, then stabs','Syncopation','Four bars']}],
    C34:[{name:'Вызов и ответ',goal:'Стаб аккордом — и ответ одной фразой, как две гитары в группе.',how:'Такт короткого аккорда с паузами, такт ответа: линия, октавы, сексты или бенд.',tip:'Ответ начинается точно в такт. Не торопись после паузы.',lvl:['Стаб, простой ответ','Стабы и ответ шестнадцатыми','Такт вызова, такт ответа','Синкопы','Четыре такта']},
          {name:'Call and response',goal:'A chord stab and a phrase answering it, like two guitars in a band.',how:'A bar of short chord with rests, a bar of answer: a line, octaves, sixths or a bend.',tip:'The answer starts right on time. Do not rush after the rest.',lvl:['Stab, simple answer','Stabs and a sixteenth-note answer','A bar of call, a bar of answer','Syncopation','Four bars']}],
    C35:[{name:'Синкопы в карман',goal:'Играть мимо доли и всё равно в карман.',how:'Удары на вторую шестнадцатую, на «и», на «а». Метроном — на долю, а ты — между.',tip:'Считай вслух «раз-и-а-и». Пока счёт ровный, синкопа не уплывёт.',lvl:['Одна синкопа','Две фигуры','Смена аккорда','Плотные синкопы','Четыре такта']},
          {name:'Syncopation in the pocket',goal:'Play off the beat and still sit in the pocket.',how:'Hits on the second sixteenth, on the “and”, on the “a”. The metronome is on the beat, you are between.',tip:'Count out loud “one-e-and-a”. As long as the count is even, the syncopation will not drift.',lvl:['One syncopation','Two figures','Chord change','Dense syncopation','Four bars']}],
    C36:[{name:'Фанк-этюд',goal:'Четыре приёма подряд, как в настоящей фанк-партии.',how:'Четыре фрагмента подряд. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов.',lvl:['Короткие фрагменты','Шестнадцатые','Два такта в фрагменте','Синкопы','Сложные фрагменты']},
          {name:'Funk étude',goal:'Four techniques in a row, like a real funk part.',how:'Four fragments in a row. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a full run on your phone. The weak spot is almost always at the joint between fragments.',lvl:['Short fragments','Sixteenths','Two bars per fragment','Syncopation','Hard fragments']}]
  };
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{
    const [ru,en]=T[id];
    EX[id]=Object.assign({n:+id.slice(1)},ru,{sub:4,v:D[id].map((v,i)=>({l:v.l,lv:LVL[id][i]}))});
    EXEN[id]=Object.assign({},en,{v:D[id].map(v=>v.le)});
  });
  return {EX,EXEN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@FKG2_END@*/

// ----- FKB1: фанк, бас, часть 1 -----
const FKB1=(function(){
// Рисунок такта — строка из 16 шагов (шестнадцатые) или 12 (триоли): символ — нота из карты тональности, '-' тянет предыдущую, '.' — пауза.
// R тоника, O октава, 3 малая терция, M большая, 4 кварта, b пониженная квинта, 5 квинта, 6 секста, 7 малая септима, L квинта снизу, a подход снизу на полтона
// x мёртвая на струне тоники, y мёртвая на струне октавы, H/Q хаммер с тоники на тон/полтора, q пулл-офф обратно на тонику.
const K={
  E:{R:'E0',a:'E1',3:'E3',M:'E4',4:'A0',b:'A1',5:'A2',6:'A4',7:'D0',O:'D2',x:'Ex'},
  Ao:{R:'A0',L:'E0',a:'E4',3:'A3',M:'A4',4:'D0',b:'D1',5:'D2',6:'D4',7:'G0',O:'G2',x:'Ax'},
  F:{R:'E1',a:'E0',3:'E4',M:'A0',4:'A1',b:'A2',5:'A3',6:'D0',7:'D1',O:'D3',x:'Ex'},
  Fs:{R:'E2',a:'E1',3:'E5',M:'A1',4:'A2',b:'A3',5:'A4',6:'D1',7:'D2',O:'D4',x:'Ex'},
  G:{R:'E3',a:'E2',3:'E6',M:'A2',4:'A3',b:'A4',5:'A5',6:'D2',7:'D3',O:'D5',x:'Ex'},
  A:{R:'E5',a:'E4',3:'E8',M:'A4',4:'A5',b:'A6',5:'A7',6:'D4',7:'D5',O:'D7',x:'Ex'},
  B:{R:'A2',L:'E2',a:'A1',3:'A5',M:'D1',4:'D2',b:'D3',5:'D4',6:'G1',7:'G2',O:'G4',x:'Ax'},
  C:{R:'A3',L:'E3',a:'A2',3:'A6',M:'D2',4:'D3',b:'D4',5:'D5',6:'G2',7:'G3',O:'G5',x:'Ax'},
  D:{R:'A5',L:'E5',a:'A4',3:'A8',M:'D4',4:'D5',b:'D6',5:'D7',6:'G4',7:'G5',O:'G7',x:'Ax'}
};
const KN={E:'{E}',Ao:'{A}',F:'{F}',Fs:'{F#}',G:'{G}',A:'{A}',B:'{B}',C:'{C}',D:'{D}'};
function mk(k,mode,ext){
  const m=Object.assign({},K[k],ext||{}),s=m.R[0],f=+m.R.slice(1);
  m.y=m.O[0]+'x';m.H=s+'h'+(f+2);m.Q=s+'h'+(f+3);m.q=s+'p'+f;
  if(mode==='s')Object.keys(m).forEach(c=>{if('HQq'.includes(c))return;const v=m[c];
    m[c]=v[1]==='x'?v[0]+(c==='y'?'Px':'Sx'):v[0]+('EA'.includes(v[0])?'S':'P')+v.slice(1);});
  if(mode==='m')Object.keys(m).forEach(c=>{if(!'xyHQq'.includes(c))m[c]+='m';});
  return m;
}
function bar(p,m,n){
  if(p.length!==n)throw Error('FKB1: '+n+' шагов: '+p);
  const out=[];for(let i=0;i<p.length;){const c=p[i];let k=1;while(p[i+k]==='-')k++;
    const t=c==='.'?'.':m[c];if(t==null)throw Error('FKB1: нет '+c+' в '+p);
    out.push(t+(k>1?':'+k:''));i+=k;}
  return out.join(' ');
}
const simp=p=>p.replace(/[xy]/g,'.');
// вариант: [тональность, режим (f пальцы, s слэп, m приглушение), подпись RU, EN, [A, B, C, F], доп. карта]
function ex(o,n,vs){
  const lvB=([A,B,C,F])=>[[[simp(A),simp(A)]],[[A,A]],[[A,B]],[[A,B],[A,C]],[[A,B],[C,F]]];
  o.v=vs.map(([k,mode,l,,P,ext])=>{const m=mk(k,mode,ext);
    return {l:l.replace('#',KN[k]),lv:lvB(P).map(sy=>({t:sy.map(b=>b.map(p=>bar(p,m,n)).join(' | '))}))};});
  o._en=vs.map(([k,,,le])=>le.replace('#',KN[k]));
  return o;
}
const EX={
W0:{name:'Разминка',goal:'Разогреть руки и включить шестнадцатые.',how:'Минуту без баса: потри ладони, круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем хроматика по одному пальцу на лад: каждая нота — восьмая, между нотами мёртвая нота той же рукой.',hf:'Указательный и средний строго по очереди, мёртвая нота — тот же щипок, левая рука лишь касается струны.',hp:'Альтернейт: вниз на ноту, вверх на мёртвую; рука не останавливается.',tip:'Рука в фанке не останавливается никогда: мёртвая нота — тоже удар.',sub:4,v:[{l:'Хроматика с мёртвыми нотами',t:['E5:2 Ex:2 E6:2 Ex:2 E7:2 Ex:2 E8:2 Ex:2 | A5:2 Ax:2 A6:2 Ax:2 A7:2 Ax:2 A8:2 Ax:2','D5:2 Dx:2 D6:2 Dx:2 D7:2 Dx:2 D8:2 Dx:2 | G5:2 Gx:2 G6:2 Gx:2 G7:2 Gx:2 G8:2 Gx:2']}]},
W1:{name:'Мобилизация без баса',goal:'Разогнать кровь в кистях, предплечьях и плечах.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Помотай расслабленной правой кистью, как будто стряхиваешь воду: это движение слэпа.',hf:'Разомни подушечки указательного и среднего: ими весь пальцевый фанк.',hp:'Покрути запястьем правой руки, как будто играешь медиатором в воздухе, без зажима.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
W2:{name:'Медленные октавы',goal:'Синхронизировать руки на перескоке через струну.',how:'Чистый звук, темп заведомо низкий. Тоника и октава через струну восьмыми, затем то же от другой ноты.',hf:'Указательный на тонику, средний на октаву; свободные пальцы левой руки глушат струну между ними.',hp:'Вниз на тонику, вверх на октаву; медиатор перелетает через струну.',tip:'Октава звучит ровно столько, сколько тоника: без провисаний.',sub:2,v:[{l:'Октавы восьмыми',t:['E5 D7 E5 D7 E7 D9 E7 D9 | A5 G7 A5 G7 A3 G5 A3 G5']}]},
W3:{name:'Медленный слэп',goal:'Поставить удар большого пальца и поп до скорости.',how:'Открытые струны: удар большим пальцем по нижней ноте, поп указательным по октаве. Медленно, каждая нота чистая.',hf:'Большой палец бьёт по струне у конца грифа и отскакивает; указательный подцепляет струну и отпускает. Если не слэпуешь — играй всё пальцами, октаву громче.',hp:'Медиатором: тоника вниз у грифа, октава вверх у подставки — для яркости.',tip:'Удар — от вращения предплечья, как у дверной ручки, а не от пальца.',sub:2,v:[{l:'Слэп и поп на открытых',t:['ES0 . DP2 . ES0 ES0 DP2 . | AS0 . GP2 . AS0 AS0 GP2 .']}]},

B1:ex({n:1,name:'Шестнадцатые с мёртвыми нотами',goal:'Двигатель фанка: непрерывная правая рука, нота и мёртвая нота.',how:'Каждая доля — четыре шестнадцатые. Звучат только тоника и пара нот лада, остальное — мёртвые ноты: левая рука лишь касается струны. Рисунок меняется с вариантом.',hf:'Указательный и средний строго по очереди, даже на мёртвых нотах: не пропускай удары.',hp:'Альтернейт шестнадцатыми: вниз на сильные, вверх на слабые, рука не останавливается.',tip:'Мёртвая нота тише звучащей, но такая же точная по времени.',sub:4,lvl:['Скелет без мёртвых нот','Грув с мёртвыми нотами','Грув и ответ','Четыре такта, сплошные шестнадцатые','Четыре такта со сбивкой']},16,[
  ['E','f','#: тоника и мёртвые','#: root and dead notes',['R-xRx.R-xRx.RxRx','R-xRx.O-xOx.7x5x','RxRxxRxROxOxx7x5','R-xR.xR-3x5x7xOx']],
  ['A','f','#: октава через восьмую','#: octave every eighth',['R.O.RxO.R.OxRxO.','R.O.RxO.5.7x5xO.','RxOxRxOxRxOx7x5x','R.O.Rx3x4x5x7xO.']],
  ['G','f','#: мажор, терция и секста','#: major, third and sixth',['R--xR.M-5--x6.5.','R--xR.M-5--xO.6.','RxxRxRMx5xx56x5x','R--xR.M-5-6-O-6-']],
  ['D','f','#: дорийский в пятой позиции','#: Dorian in fifth position',['R.xR..3x4.5.R.x.','R.xR..3x4.5.7.O.','RxxRxx3x4x5x7xOx','R.xR..O.7.6.5.4.']],
  ['Fs','f','#m: с «и» шестнадцатой','#m: from the second sixteenth',['.R-x.R-x.O-x.R7.','.R-x.R-x.5-x.37.','xR-xxR-xxO-xx5R7','.R-x.R-x7.5.4.3.']],
  ['C','f','#: группы по три','#: groups of three',['R-xR-xR-xR-xR-x.','R-xO-xR-xO-x5-7.','RxxOxxRxxOxx5x7x','R-xO-x7-x5-xM-O.']]]),
B2:ex({n:2,name:'Слэп-октавы',goal:'Главная фигура слэпа: большой палец на тонике, поп на октаве.',how:'Тоника ударом большого пальца, октава попом. Мёртвые ноты — тем же ударом с приглушённой струной. Вариант меняет ритм фигуры и тональность.',hf:'Слэп: большой палец по нижней ноте, указательный — поп. Без слэпа: тоника указательным, октава средним с подцепом, чтобы струна щёлкнула о лады.',hp:'Медиатором: тоника вниз, октава вверх; мёртвые ноты — тот же ход по приглушённой струне.',tip:'Поп не тянет струну далеко: на пару миллиметров, иначе нота уходит вверх.',sub:4,lvl:['Октавы без мёртвых','Октавы с мёртвыми нотами','Октавы и ответ септимой','Четыре такта, сплошные шестнадцатые','Четыре такта со сбивкой']},16,[
  ['E','s','#: прямые восьмые','#: straight eighths',['R.O.R.O.R.O.R.O.','R.OyR.O.R.OyRxO.','RxOyRxOyRxOyRxO.','R.O.R.O.5.7.O.R.']],
  ['Ao','s','#: синкопа 3+3+2','#: 3+3+2 syncopation',['R..O..R.O..R.O..','R..O..R.O..R7O5.','R.xO.xR.O.xR7O5y','R..O..R.O.7.5.O.']],
  ['G','s','#: галоп с мёртвой','#: gallop with a dead note',['R.xRO.xRR.xRO.x.','R.xRO.xR7.x75.x.','RxxROyxRRxxRO7O5','R.xRO.xR5.7.O.O.']],
  ['C','s','#: стоп на третьей доле','#: stop on beat three',['R.O.R...R.O.R...','R.O.R...R.O.7.5.','RyOyR.x.RyOy7y5y','R.O.R...O.7.5.R.']],
  ['Fs','s','#m: септаккорд','#m: minor seventh',['R.R.O.7.R.R.O.5.','R.R.O.7.R.x.O7O.','RxRxO.7yRxRxO7O5','R.R.O.7.5.7.O.O.']],
  ['D','s','#: долгие ноты','#: long notes',['R---O-R.R---O-R.','R---O-R.R---7-5.','R-x-OyR.R-x-7y5.','R---O-R.7.5.O.R.']]]),
B3:ex({n:3,name:'Синкопы со второй шестнадцатой',goal:'Чувствовать доли, играя мимо них.',how:'Фигура начинается не на долю, а на шестнадцатую позже или на «и». Метроном — опора: считай «раз-и-и-а» вслух.',hf:'Пальцы продолжают чередоваться и на паузах — касанием струны. Тогда синкопа попадает сама.',hp:'Рука качается шестнадцатыми все время: на паузе — холостой ход мимо струны.',tip:'Если сбиваешься — сыграй уровень 1 и держи паузы такими же точными, как ноты.',sub:4,lvl:['Синкопа без мёртвых','Синкопа с мёртвыми нотами','Синкопа и ответ','Четыре такта, мёртвые на каждой паузе','Четыре такта со сбивкой']},16,[
  ['A','f','#: со второй шестнадцатой','#: on the second sixteenth',['xR-.xR-.xO-.xR..','xR-.xR-.x5-.x7O.','xR-xxR-xxO-x7x5x','xR-.xR-.x3.4.5.7']],
  ['E','f','#: «и-а» каждой доли','#: the “and-a” of each beat',['..RR..RR..OO..R7','..RR..RR..55..73','xxRRxxRRxxOOxxR7','..RR..RR4.5.7.O.']],
  ['D','f','#: затакт на «а»','#: pickup on the “a”',['R--RR--RO--OR--.','R--RR--R5--57--.','R-xRR-xRO-xO7x5x','R--RR--R7.5.4.3.']],
  ['G','f','#m: только «и»','#m: on the “and” only',['..R...R...O...R.','..R...R...5.7.O.','xxR.xxR.xxO.x7R.','..R...R.3.4.5.7.']],
  ['B','f','#m: тресильо 3+3+2','#m: tresillo 3+3+2',['R--R--R-O--O--O-','R--R--R-5--7--O-','R-xR-xR-O-xO-xOx','R--R--R-7.5.4.3.']],
  ['C','f','#m: перенос через такт','#m: across the bar line',['R.xR.x.RxR.x.O.R','R.xR.x.Rx5.x.7.O','RxxRxxxRxRxx7x5O','R.xR.x.R7.5.4.3.']]]),
B4:ex({n:4,name:'Диско-октавы',goal:'Ровные октавы восьмыми и шестнадцатыми — основа диско и фанка.',how:'Тоника и октава через струну. Вариант меняет фигуру: прямые октавы, затакт, хроматический подход, квинта и септима, смена аккорда, галоп.',hf:'Указательный — тоника, средний — октава; большой палец лежит на нижней струне и глушит её.',hp:'Альтернейт; на шестнадцатых рука не замедляется на перескоке.',tip:'Октава коротко, но не обрывисто: отпускай палец левой руки ровно в срок.',sub:4,lvl:['Октавы восьмыми','Октавы с мёртвыми нотами','Октавы и ответ','Четыре такта шестнадцатыми','Четыре такта со сбивкой']},16,[
  ['E','f','#: прямые октавы','#: straight octaves',['R.O.R.O.R.O.R.O.','R.O.R.O.5.O.7.O.','RxOxRxOxRxOx5xOx','R.O.R.O.7.5.4.a.']],
  ['A','f','#: затакт шестнадцатой','#: sixteenth-note pickup',['R.ORR.ORR.ORR.O.','R.ORR.ORR.O55.7.','RxORRxORRxO5RxO7','R.ORR.OR7.5.3.a.']],
  ['G','f','#: подход снизу','#: approach from below',['R.OaR.OaR.OaR.Oa','R.OaR.Oa5.O.7.Oa','RxOaRxOaRxOa5x7a','R.OaR.Oa6.5.M.a.']],
  ['D','f','#: октава, квинта, септима','#: octave, fifth, seventh',['R.O.5.7.R.O.5.7.','R.O.5.7.O.7.5.4.','RxOx5x7xRxOx5x7x','R.O.5.7.O.7.5.a.']],
  ['A','f','# и {D}: смена аккорда','# and {D}: chord change',['R.O.R.O.S.T.S.T.','R.O.R.O.S.T.5.a.','RxOxRxOxSxTxSxTx','R.O.R.O.S.T.4.a.'],{S:'A5',T:'G7'}],
  ['C','f','#: галоп октавами','#: galloping octaves',['R.RRO.OOR.RRO.OO','R.RRO.OO5.557.77','RxRRO.OO5x557x77','R.RRO.OO7.5.M.a.']]]),
B5:ex({n:5,name:'Карман: длина ноты',goal:'Грув делает не только когда, но и сколько звучит нота.',how:'Ноты строго нужной длины: долгая — до следующей, короткая — снята точно на паузе. Стиль мотауна и соула. Вариант меняет рисунок длин.',hf:'Снимай ноту левой рукой (ослабь палец), а не правой; правая уже готовит следующий щипок.',hp:'Медиатор у грифа, звук круглый; короткие ноты глуши ладонью у подставки.',tip:'Запиши себя на телефон: паузы должны быть слышны так же, как ноты.',sub:4,lvl:['Длины без мёртвых','Длины с мёртвой нотой','Фраза и ответ','Четыре такта','Четыре такта со сбивкой']},16,[
  ['E','f','#: долгая и короткие','#: long and short',['R-----.RR---.5-.','R-----.RO---.7-.','R-----xRO-x-.75.','R-----.R7.5.4.a.']],
  ['A','f','#: мотаун восьмыми','#: Motown eighths',['R-R-5-a-R-R-5-a-','R-R-5-a-R-O-7-5-','R-RxR-a-R-OxO-5x','R-R-5-6-7-O-7-a-']],
  ['G','f','#: стаккато четвертями','#: staccato quarters',['R...R...5...R...','R...R.R.5...6.a.','R..xR.R.5..x6.a.','R...O...7.6.5.a.']],
  ['D','f','#: половинные с затактом','#: half notes with a pickup',['R-------R-----5L','R-------O-----75','R------xO----x75','R-------7.6.5.a.']],
  ['Fs','f','#m: толчок перед долей','#m: push before the beat',['R---R-.5R---.7.R','R---R-.5R---.O.R','R--xR-x5R--x.O7R','R---R-.57.5.4.3.']],
  ['C','f','#: пунктир 3+3+2','#: dotted 3+3+2',['R-----R-----5-a-','R-----O-----7-5-','R----xO----x7x5x','R-----O-7-6-5-a-']]]),

R6:ex({name:'Одна нота — много ритма',goal:'Грув из одной ноты: всё решает ритм.',how:'Почти только тоника и мёртвые ноты. Слушай акценты: одна нота должна качать. Вариант меняет ритмическую ячейку.',hf:'Чередуй пальцы без исключений, акцент — сильнее щипок, а не другой палец.',hp:'Альтернейт; акцентные ноты — глубже медиатор.',tip:'Пример — партии в духе Джеймса Брауна: одна нота, и все танцуют.',sub:4,lvl:['Ячейка без мёртвых','Ячейка с мёртвыми','Ячейка и ответ','Четыре такта, плотнее','Четыре такта, в конце октава']},16,[
  ['E','f','#: ячейка «раз-а»','#: “one-a” cell',['R.xRR.xRR.xRR.xR','RxR.xR.xRxR.xR.x','RxRxRRxRxRxRRxRx','R.xRR.xRRRRRO.O.']],
  ['A','f','#: только слабые','#: offbeats only',['.R.R.R.R.R.R.R.R','.R.Rx.RR.R.Rx.RR','xRxRxxRRxRxRxxRR','.R.R.R.RO.R.O.R.']],
  ['G','f','#: по три шестнадцатые','#: three-sixteenth groups',['R..R..R..R..R.R.','R..R..R..R..RRR.','RxxRxxRxxRxxRRRx','R..O..R..O..R.O.']],
  ['D','f','#: восьмая и две шестнадцатые','#: eighth and two sixteenths',['R.RRR.RRR.RRR.RR','R-RRR-RRR.R.RRRR','RxRRRxRRRxRRRRRR','R.RRR.RRO.OOO.OO']],
  ['Fs','f','#: ячейка сдвигается','#: a shifting cell',['RR.x.RR.x.RR.x.R','RR..RR..RR..RRRR','RRxxRRxxRRxxRRRR','RR.x.RR.x.RRO.O.']],
  ['C','f','#: паузы и стопы','#: rests and stops',['R.......R.R.....','R.......R.R...RR','R..x...xR.R..xRR','R.......R.R.O.O.']]]),
R7:ex({name:'Пентатоника шестнадцатыми',goal:'Минорная пентатоника как фанковая линия.',how:'Тоника, терция, кварта, квинта, септима, октава — в ритме шестнадцатых с мёртвыми нотами. Вариант меняет форму линии.',hf:'Пальцы чередуются; левая — палец на лад, позиция не сдвигается.',hp:'Альтернейт, на смене струны рука не замедляется.',tip:'Линия должна петь и качать одновременно: не гоняй ноты, держи грув.',sub:4,lvl:['Линия без мёртвых','Линия с мёртвыми','Линия и ответ','Четыре такта','Четыре такта, сплошной пробег']},16,[
  ['E','f','#m: вверх по ладу','#m: up the scale',['R.3.4.5.7.O.7.5.','R.3.4.5.O.7.5.4.','Rx3x4x5x7xOx7x5x','R3457O7543R3457O']],
  ['A','f','#m: октава и септима','#m: octave and seventh',['R.R7O.R.R.R7O.5.','R.R7O.R.5.4.3.R.','RxR7OxRxRxR7Ox5x','R.R7O.7.5.4.3.a.']],
  ['D','f','#m: широкий шаг','#m: wide steps',['R..3.4.5..7.O...','R..3.4.5..O.7...','Rxx3x4x5xx7xOxxx','R..3.4.5O7543R.a']],
  ['G','f','#m: сверху вниз','#m: top down',['O.7.5.4.3.R...R.','O.7.5.4.3.R.a.R.','Ox7x5x4x3xRxaxRx','O7543R..O7543R..']],
  ['B','f','#m: с квинтой снизу','#m: with the low fifth',['R.3RL.R.R.3RL.7.','R.3RL.R.5.4.3.R.','Rx3RLxRxRx3RLx7x','R.3RL.R.O.7.5.4.']],
  ['Fs','f','#m: педаль на тонике','#m: root pedal',['R.R3R4R5R7R5R4R3','R.R3R4R5O7O5R4R3','RxR3R4R5RxR7R5R4','R.R3R4R5O.7.5.4.']]]),
R8:ex({name:'Слэп: мёртвые ноты большим пальцем',goal:'Перкуссия большого пальца между нотами.',how:'Большой палец бьёт и по звучащей ноте, и по приглушённой струне. Поп — октава и септима. Вариант меняет место мёртвых нот.',hf:'Слэп: левая рука снимает давление для мёртвой ноты. Без слэпа: те же мёртвые ноты указательным с сильным щипком.',hp:'Медиатором: мёртвые ноты вниз у грифа, звучащие — с тем же ходом руки.',tip:'Мёртвая нота большим пальцем — это малый барабан баса: громко и сухо.',sub:4,lvl:['Только звучащие ноты','С мёртвыми нотами','Фраза и ответ','Четыре такта, плотнее','Четыре такта со сбивкой']},16,[
  ['E','s','#: мёртвая после доли','#: dead note after the beat',['R.x.R.x.R.x.O.x.','R.xRR.x.R.xRO.y.','RxxRRxxRRxxROyOy','R.xRR.x.7.5.O.O.']],
  ['Ao','s','#: мёртвая перед долей','#: dead note before the beat',['Rx.RxR.xRx.RxR.x','Rx.RxR.xRx.RO.O.','RxxRxRxxRxxRO7O5','Rx.RxR.x7.5.O.R.']],
  ['G','s','#: на «а»','#: on the “a”',['R..xR..xR..xO..y','R..xR..x5..x7..y','R.xxR.xx5.xx7yOy','R..xR..xO.7.5.R.']],
  ['C','s','#: мёртвая на долю','#: dead note on the beat',['x.R.x.R.x.R.x.O.','x.R.x.R.x.5.x.7.','xxR.xxR.xx5.x7O.','x.R.x.R.O.7.5.R.']],
  ['Fs','s','#m: тройки','#m: threes',['R.xRx.R.xRx.O.y.','R.xRx.R.xRx.7.5.','RxxRxxRxxRxxO7O5','R.xRx.R.O.7.5.4.']],
  ['D','s','#: сплошной большой палец','#: non-stop thumb',['RxRxRxRxRxRxO.O.','RxRxRxRx5x5x7.O.','RxRxRxRxRxRxOyOy','RxRxRxRxO.7.5.L.']]]),
R9:ex({name:'Хаммер после слэпа',goal:'Две ноты за один удар: слэп и хаммер.',how:'Удар большим пальцем, сразу хаммер на тон или полтора выше, иногда пулл-офф обратно. Вариант меняет интервал и ритм.',hf:'Слэп и хаммер; без слэпа — щипок и хаммер, вторая нота по громкости как первая.',hp:'Медиатором: один удар вниз, хаммер левой рукой.',tip:'Хаммер — точно на шестнадцатую, а не «когда получится».',sub:4,lvl:['Хаммер без мёртвых','С мёртвыми нотами','Фраза и ответ','Четыре такта, с пулл-оффом','Четыре такта со сбивкой']},16,[
  ['E','s','#: хаммер на тон','#: whole-step hammer',['R-H-R-H-O.y.R-H-','R-H-R-H-O.7.RH..','RHxxRHxxOyOyRHO.','R-H-R-H-7.5.O.O.']],
  ['Ao','s','#: хаммер на терцию','#: hammer to the third',['RQ..RQ..RQ..O.O.','RQ..RQ..RQq.O.O.','RQxxRQxxRQqxOyOy','RQ..RQ..7.5.O.R.']],
  ['G','s','#: хаммер на «и»','#: hammer on the “and”',['R.RH..O.R.RH..O.','R.RH..O.R.RQ..O.','RxRHxxOyRxRQxxOy','R.RH..O.7.5.4.3.']],
  ['C','s','#: хаммер и мёртвая','#: hammer and dead note',['RH.xRH.xRH.xO.O.','RH.xRH.x5.x7.O..','RHxxRHxxRHqxOyOy','RH.xRH.xO.7.5.R.']],
  ['Fs','s','#m: со второй шестнадцатой','#m: from the second sixteenth',['xRH.xRH.xRH.xO..','xRH.xRH.xRQ.xO7.','xRHxxRHxxRQqxO7O','xRH.xRH.O.7.5.4.']],
  ['D','s','#: долгие ноты','#: long notes',['R---RH--O---RH--','R---RH--O-7-RQ--','R-x-RHx-O-y-RQq-','R---RH--7-5-O-O-']]]),
R10:ex({name:'Двойной большой палец',goal:'Большой палец вниз и вверх: шестнадцатые слэпом.',how:'Большой палец бьёт вниз сквозь струну и, возвращаясь, цепляет её же или следующую вверх. В табе оба удара — слэп. Вариант меняет фигуру.',hf:'Слэп: палец проходит сквозь струну и ложится на следующую, обратный ход — ногтем. Без слэпа: те же шестнадцатые указательным и средним.',hp:'Медиатором: альтернейт шестнадцатыми, это и есть аналог двойного большого пальца.',tip:'Сначала уровень 1 очень медленно: техника важнее темпа, Виктор Вутен показывает её подробно.',sub:4,lvl:['Только звучащие','С мёртвыми','Фраза и ответ','Четыре такта','Четыре такта со сбивкой']},16,[
  ['E','s','#: вниз-вверх по одной струне','#: down-up on one string',['RxRxRxRxRxRxRxRx','RxRx5x5xRxRxO.O.','R5R5R5R5RxRxO5O5','RxRx5x5x7x5x4x3x']],
  ['Ao','s','#: группы по три','#: groups of three',['RxxRxxRxRxxRxxRx','RxxRxxRx5xx5xxO.','RxxRxxRxRxxRO5O5','RxxRxxRx7x5x4x3x']],
  ['G','s','#: через струну','#: across strings',['R5R5RxRxR5R5O.O.','R5R5RxRx45454.O.','R5R5RxRx4545O7O5','R5R5RxRx7.5.4.3.']],
  ['C','s','#: с паузами','#: with rests',['RxRx..RxRxRx..Ox','RxRx..RxRxRx..75','RxRxxxRxRxRxOy75','RxRx..RxO.7.5.L.']],
  ['Fs','s','#m: со слабой','#m: from the offbeat',['xRxRxRxRxRxRO.O.','xRxRxRxR5x5x7.O.','xRxRxRxR5x5xOy7y','xRxRxRxR7x5x4x3x']],
  ['D','s','#: восьмая и две','#: eighth and two',['R.RxR.RxR.RxO.Ox','R.RxR.Rx5.5x7.Ox','RxRxRxRx5x5x7yOy','R.RxR.RxO.7.5.L.']]]),
R11:ex({name:'Мотаун: хроматика и синкопы',goal:'Мелодичная линия по аккорду с подходами, в духе Джеймса Джеймерсона.',how:'Тоника, терция, квинта, секста, септима и хроматический подход к следующей тонике. Вариант меняет рисунок и тональность.',hf:'Один указательный палец, как Джеймерсон, или чередование — главное, ноты ровные.',hp:'Медиатор и приглушение ладонью у подставки — тоже мотаун (Кэрол Кэй).',tip:'Подход на полтона — на последнюю шестнадцатую или восьмую, к тонике точно на долю.',sub:4,lvl:['Линия без мёртвых','С мёртвыми','Линия и ответ','Четыре такта','Четыре такта со сбивкой']},16,[
  ['C','f','#: вверх по аккорду','#: up the chord',['R-R-M-5-6-5-M-a-','R-.RM-5-6-7-O-a-','R-xRM-5x6-7xO-ax','R-.RM-5-O-7-6-5a']],
  ['G','f','#: с паузой на доле','#: rest on the beat',['R---.R5-6-.5M-a-','R---.R5-O-.76-5-','R--x.R5-O-x76x5x','R---.R5-6-5-M-a-']],
  ['A','f','#: октава и подход','#: octave and approach',['R-5-O-R-a-R-5-a-','R-5-O-6-5-M-R-a-','R-5xO-6x5-MxR-a-','R-5-O-7-6-5-M-a-']],
  ['D','f','#: тоника перед долей','#: root before the beat',['R..RM..R5..RO.a.','R..RM..R5..R7.6.','R.xRM.xR5.xR7x6x','R..RM..R5.6.7.O.']],
  ['F','f','#: гамма с септимой','#: scale with the seventh',['R-a-R-M-5-M-R-a-','R-M-5-6-7-6-5-M-','R-MxR-M-5x6-7xO-','R-M-5-O-7-6-5-a-']],
  ['E','f','#: пары нот','#: note pairs',['R-.4M-.R5-.6O-7-','R-.4M-.R5-.6O-a-','R-x4M-xR5-x6O7O-','R-.4M-.R7.6.5.a.']]]),
R12:ex({name:'Полутемп',goal:'Держать грув, когда нот мало: пустота — часть ритма.',how:'Барабанщик играет вдвое медленнее, малый барабан — на третью долю. Нот мало, каждая на месте. Вариант меняет рисунок.',hf:'Ноты длинные: не снимай раньше времени, держи пальцы левой руки на ладу.',hp:'Медиатор ближе к грифу, звук толще; паузы — ладонью.',tip:'Считай вслух все шестнадцатые, даже где нот нет.',sub:4,lvl:['Грув без мёртвых','С мёртвыми','Грув и ответ','Четыре такта','Четыре такта со сбивкой']},16,[
  ['E','f','#: тоника и октава','#: root and octave',['R-----.R......O.','R-----.R....7.O.','R----x.Rx...7xO.','R-----.R7.5.4.3.']],
  ['A','f','#: повтор тоники','#: repeated root',['R--R....R-.5....','R--R....R-.57.O.','R--Rx...R-x57xO.','R--R....O.7.5.a.']],
  ['D','f','#: ход наверх','#: climb up',['R.......5..7..O.','R.......5..7.O7.','R..x...x5..7xO7.','R.......O.7.5.4.']],
  ['G','f','#m: пары','#m: pairs',['R-.R-.....R-.R..','R-.R-.....R-.5-.','R-xR-x...xR-x5-x','R-.R-.....7.5.3.']],
  ['B','f','#m: тоника и квинта снизу','#m: root and low fifth',['R-------L-------','R-------L---3-4-','R------xL---3x4x','R-------O-7-5-a-']],
  ['Fs','f','#m: с паузы','#m: from a rest',['..R-....R...O...','..R-....R...7.O.','xxR-x...R..x7xO.','..R-....O.7.5.4.']]]),
R13:ex({name:'Шаффл-фанк',goal:'Фанк на триолях: качающиеся шестнадцатые в духе шаффла Пурди.',how:'Каждая доля — триоль. Ноты на первую и третью части триоли, мёртвые — в середину. Вариант меняет рисунок.',hf:'Чередуй пальцы по триолям: каждая доля начинается с другого пальца.',hp:'Медиатором: вниз-вверх-вниз, следующая доля вверх-вниз-вверх; или каждая доля с даунстрока.',tip:'Середина триоли тихая, края — громкие: тогда качает.',sub:3,lvl:['Шаффл без мёртвых','С мёртвыми','Шаффл и ответ','Четыре такта','Четыре такта со сбивкой']},12,[
  ['E','f','#: тоника и октава','#: root and octave',['R-xR-xR-xO-x','R-xR-x5-x7-x','RxxRxx5xx7xO','R-xR-x7.5.4.']],
  ['A','f','#: края триоли','#: outer triplet notes',['R.RR.RO.R7.5','R.RR.R5.4.3.','RxRRxRO.R7x5','R.RR.RO.7.5a']],
  ['G','f','#: долгая и мёртвая','#: long and dead',['R--R-xR--O-x','R--R-x5--7-x','R-xRxx5-x7xx','R--R-xO-7-5-']],
  ['D','f','#: с середины триоли','#: from the middle of the triplet',['.xR.xR.xR.xO','.xR.xR.x5.x7','xxRxxRxx5xx7','.xR.xRO-7-5-']],
  ['C','f','#: тоника и квинта снизу','#: root and low fifth',['R-xL-xR-xL-x','R-xL-x7-x5-x','RxxLxx7xx5xx','R-xL-xO-75-a']],
  ['Fs','f','#m: четверти шаффлом','#m: shuffle quarters',['R--R--O--R--','R--R--7--5--','R-xR-xO-x7-x','R--R--O-7-5-']]]),
R14:ex({name:'Сбивки: хаммер и пулл-офф',goal:'Короткие фанковые сбивки левой рукой между долями.',how:'Тоника, хаммер на тон или полтора и пулл-офф обратно — «трель» на одну долю. Вариант меняет фигуру сбивки.',hf:'Щипок только на первую ноту сбивки, остальное — левая рука.',hp:'Медиатор — один удар на сбивку, хаммер и пулл-офф левой рукой.',tip:'Пулл-офф — палец срывает струну вбок, а не просто поднимается.',sub:4,lvl:['Сбивка без мёртвых','С мёртвыми','Сбивка и ответ','Четыре такта','Четыре такта из сбивок']},16,[
  ['E','f','#: терция туда и обратно','#: third up and back',['R.......RQqR.O..','R.......RQqRO7O5','R..x..x.RQqRxO7O','RQqRHqRQqROR7O5.']],
  ['A','f','#: тон и терция','#: step and third',['R...R...RHRQqR..','R...R...RHRQqR7O','R..xR..xRHRQqR7O','RHRQqRHRQqR.7.O.']],
  ['D','f','#: сбивка в конце такта','#: fill at the end of the bar',['R.......5.4.RQqR','R.......O.7.RQqR','R..x...x5x4xRQqR','RQqRQqRQqRQqO7O.']],
  ['G','f','#: октавы и сбивка','#: octaves and a fill',['R.O.R.O.RHqRQqR.','R.O.R.O.RHqRQq7O','RxOxRxOxRHqRQq7O','RHqRHqRQqRQq7.O.']],
  ['C','f','#: медленная трель','#: slow trill',['R---R---RQ-q-R--','R---R---RQ-q-7O.','R--xR--xRQxqx7O.','RQ-q-RQ-q-7.O.R.']],
  ['Fs','f','#m: сбивка на каждую долю','#m: a fill every beat',['R.R.RQqRR.R.RHqR','R.R.RQqRO.7.5.4.','RxRxRQqRRxRxRHqR','RQqRRHqR7.5.4.3.']]]),
R15:ex({name:'Непрерывные шестнадцатые',goal:'Приглушённые шестнадцатые без пауз, в духе Рокко Престиа.',how:'Ребро ладони правой руки лежит на струнах у подставки: звук короткий и плотный. Все шестнадцатые заняты — нотой или мёртвой нотой.',hf:'Пальцы чередуются строго, ладонь не поднимается.',hp:'Медиатор с приглушением ладонью: альтернейт без остановок.',tip:'Громкость ровная: мёртвая нота почти так же слышна, как звучащая.',sub:4,lvl:['Только звучащие','С мёртвыми','Грув и ответ','Четыре такта','Четыре такта со сбивкой']},16,[
  ['E','m','#: тоника и мёртвые','#: root and dead notes',['RxRxRxRxRxRxOxRx','RxRxRxRx5x7xOx7x','RRxRRxRROO7O5x3x','RxRxRxRx7x5x4x3x']],
  ['A','m','#: тройки','#: threes',['RxxRxxRxRxxRxxOx','RxxRxxRx5xx7xxOx','RxRRxRRx5x57x7Ox','RxxRxxRxO7O5434x']],
  ['D','m','#: со слабой','#: from the offbeat',['xRxRxRxRxOxOxRxR','xRxRxRxRx5x7xOx7','RRRRxRxROO5x7xO7','xRxRxRxRO7O5O7O5']],
  ['G','m','#: пары','#: pairs',['RRxxRRxxRRxxOOxx','RRxxRRxx55xx77xx','RRxRRRxROOxO77x5','RRxxRRxx7x5x4x3x']],
  ['C','m','#: октавы внутри','#: octaves inside',['RxRRxRxROxOOxOxO','RxRRxRxR5x55x7xO','RxRRxRRROxOOxOOO','RxRRxRxR7x5xMxax']],
  ['Fs','m','#m: с паузами','#m: with rests',['R.xR.xRxR.xR.xOx','R.xR.xRx5.x7.xOx','RxxRxxRxRxxRxxOx','R.xR.xRxO7O5434R']]])
};
const EN_TXT={
W0:{name:'Warm-up',goal:'Warm up the hands and switch on sixteenths.',how:'One minute without the bass: rub your palms, circle wrists and shoulders, clench and open your fists 20 times. Then one-finger-per-fret chromatics: every note an eighth, a dead note in between with the same hand.',hf:'Index and middle strictly alternating; the dead note is the same pluck, the fretting hand just touches the string.',hp:'Alternate picking: down on the note, up on the dead note; the hand never stops.',tip:'In funk the hand never stops: a dead note is a stroke too.',v:['Chromatics with dead notes']},
W1:{name:'Mobility without the bass',goal:'Get blood flowing in the hands, forearms and shoulders.',how:'Rub your palms until warm. Circle your wrists both ways 10 times. Shoulders up, back, down. Clench and open your fists 20 times. Shake the relaxed plucking hand as if shaking off water: that is the slap motion.',hf:'Work the fingertips of the index and middle: they play all the fingerstyle funk.',hp:'Roll the picking wrist as if picking in the air, no tension.',tip:'No stretching into pain: just warmth and mobility.'},
W2:{name:'Slow octaves',goal:'Sync the hands on a string skip.',how:'Clean tone, deliberately slow. Root and octave across a string in eighths, then the same from another note.',hf:'Index on the root, middle on the octave; the free fretting fingers mute the string in between.',hp:'Down on the root, up on the octave; the pick hops over the string.',tip:'The octave rings exactly as long as the root: no gaps.',v:['Octaves in eighths']},
W3:{name:'Slow slap',goal:'Set up the thumb slap and the pop before any speed.',how:'Open strings: slap the low note with the thumb, pop the octave with the index. Slowly, every note clean.',hf:'The thumb hits the string near the end of the neck and bounces off; the index hooks the string and lets go. If you do not slap, play it all with fingers, octave louder.',hp:'With a pick: root down near the neck, octave up near the bridge for brightness.',tip:'The slap comes from rotating the forearm, like turning a door handle, not from the thumb.',v:['Slap and pop on open strings']},
B1:{name:'Sixteenths with dead notes',goal:'The engine of funk: a non-stop plucking hand, note and dead note.',how:'Every beat is four sixteenths. Only the root and a couple of scale notes ring, the rest are dead notes: the fretting hand just touches the string. The figure changes with the variation.',hf:'Index and middle strictly alternating, dead notes included: never skip a stroke.',hp:'Alternate sixteenths: down on the beats, up in between, the hand never stops.',tip:'A dead note is softer than a ringing one, but just as precise in time.',lvl:['Skeleton without dead notes','Groove with dead notes','Groove and answer','Four bars, solid sixteenths','Four bars with a fill']},
B2:{name:'Slap octaves',goal:'The core slap figure: thumb on the root, pop on the octave.',how:'Root with a thumb slap, octave with a pop. Dead notes use the same stroke on a muted string. The variation changes the rhythm and the key.',hf:'Slap: thumb on the low note, index pops. Without slap: root with the index, octave with the middle, hooked so the string snaps against the frets.',hp:'With a pick: root down, octave up; dead notes are the same stroke on a muted string.',tip:'The pop does not pull the string far: a couple of millimetres, or the note goes sharp.',lvl:['Octaves without dead notes','Octaves with dead notes','Octaves and a seventh answer','Four bars, solid sixteenths','Four bars with a fill']},
B3:{name:'Syncopation from the second sixteenth',goal:'Feel the beats while playing around them.',how:'The figure starts not on the beat but a sixteenth later or on the “and”. The metronome is your anchor: count “one-e-and-a” out loud.',hf:'Fingers keep alternating through the rests, touching the string. Then the syncopation lands by itself.',hp:'The hand swings in sixteenths all the time: on a rest it moves past the string.',tip:'If you lose it, play level 1 and keep the rests as precise as the notes.',lvl:['Syncopation without dead notes','Syncopation with dead notes','Syncopation and answer','Four bars, dead notes in every rest','Four bars with a fill']},
B4:{name:'Disco octaves',goal:'Even octaves in eighths and sixteenths: the base of disco and funk.',how:'Root and octave across a string. The variation changes the figure: straight octaves, a pickup, a chromatic approach, fifth and seventh, a chord change, a gallop.',hf:'Index on the root, middle on the octave; the thumb rests on the low string and mutes it.',hp:'Alternate picking; in sixteenths the hand does not slow down on the skip.',tip:'The octave is short but not clipped: release the fretting finger right on time.',lvl:['Octaves in eighths','Octaves with dead notes','Octaves and answer','Four bars in sixteenths','Four bars with a fill']},
B5:{name:'Pocket: note length',goal:'The groove is not only when a note sounds but how long.',how:'Every note exactly as long as written: a long one lasts to the next, a short one stops right on the rest. Motown and soul style. The variation changes the pattern of lengths.',hf:'Stop the note with the fretting hand (release the finger), not the plucking hand; the plucking hand is already preparing the next note.',hp:'Pick near the neck for a round tone; mute the short notes with the palm at the bridge.',tip:'Record yourself on your phone: the rests must be as audible as the notes.',lvl:['Lengths without dead notes','Lengths with a dead note','Phrase and answer','Four bars','Four bars with a fill']},
R6:{name:'One note, lots of rhythm',goal:'A groove from one note: rhythm does it all.',how:'Almost only the root and dead notes. Listen to the accents: one note has to groove. The variation changes the rhythmic cell.',hf:'Alternate fingers without exception; an accent is a stronger pluck, not a different finger.',hp:'Alternate picking; dig the pick in deeper on accents.',tip:'Think of James Brown style parts: one note, and everyone dances.',lvl:['Cell without dead notes','Cell with dead notes','Cell and answer','Four bars, denser','Four bars, octave at the end']},
R7:{name:'Pentatonic in sixteenths',goal:'The minor pentatonic as a funk line.',how:'Root, third, fourth, fifth, seventh, octave in a sixteenth rhythm with dead notes. The variation changes the shape of the line.',hf:'Fingers alternate; fretting hand one finger per fret, the position stays put.',hp:'Alternate picking, no slowing down on string changes.',tip:'The line has to sing and groove at once: do not rush the notes, hold the groove.',lvl:['Line without dead notes','Line with dead notes','Line and answer','Four bars','Four bars, a full run']},
R8:{name:'Slap: thumb dead notes',goal:'Thumb percussion between the notes.',how:'The thumb hits both the ringing note and the muted string. Pops are the octave and the seventh. The variation moves the dead notes.',hf:'Slap: the fretting hand releases pressure for the dead note. Without slap: the same dead notes with a strong index pluck.',hp:'With a pick: dead notes downstroke near the neck, ringing notes with the same motion.',tip:'A thumb dead note is the bass’s snare drum: loud and dry.',lvl:['Ringing notes only','With dead notes','Phrase and answer','Four bars, denser','Four bars with a fill']},
R9:{name:'Hammer-on after the slap',goal:'Two notes from one stroke: slap and hammer-on.',how:'Slap with the thumb, then right away hammer a whole step or a step and a half up, sometimes pull off back. The variation changes the interval and the rhythm.',hf:'Slap and hammer; without slap, pluck and hammer, the second note as loud as the first.',hp:'With a pick: one downstroke, the hammer with the fretting hand.',tip:'The hammer lands exactly on the sixteenth, not “whenever”.',lvl:['Hammer without dead notes','With dead notes','Phrase and answer','Four bars, with a pull-off','Four bars with a fill']},
R10:{name:'Double thumbing',goal:'Thumb down and up: sixteenths with the slap.',how:'The thumb strikes down through the string and on the way back catches the same or the next string upward. In the tab both strokes are slaps. The variation changes the figure.',hf:'Slap: the thumb goes through the string and rests on the next, the return stroke with the nail. Without slap: the same sixteenths with index and middle.',hp:'With a pick: alternate sixteenths, the pick’s equivalent of double thumbing.',tip:'Play level 1 very slowly first: technique before tempo; Victor Wooten demonstrates it in detail.',lvl:['Ringing notes only','With dead notes','Phrase and answer','Four bars','Four bars with a fill']},
R11:{name:'Motown: chromatics and syncopation',goal:'A melodic line through the chord with approaches, in the spirit of James Jamerson.',how:'Root, third, fifth, sixth, seventh and a chromatic approach to the next root. The variation changes the pattern and the key.',hf:'One index finger like Jamerson, or alternating: the main thing is even notes.',hp:'A pick with palm muting at the bridge is Motown too (Carol Kaye).',tip:'The half-step approach is on the last sixteenth or eighth, the root exactly on the beat.',lvl:['Line without dead notes','With dead notes','Line and answer','Four bars','Four bars with a fill']},
R12:{name:'Half-time',goal:'Hold the groove with few notes: space is part of the rhythm.',how:'The drummer plays half as fast, the snare on beat three. Few notes, each in its place. The variation changes the pattern.',hf:'Long notes: do not cut them early, keep the fretting fingers down.',hp:'Pick nearer the neck for a fatter tone; rests with the palm.',tip:'Count every sixteenth out loud, even where there are no notes.',lvl:['Groove without dead notes','With dead notes','Groove and answer','Four bars','Four bars with a fill']},
R13:{name:'Shuffle funk',goal:'Funk on triplets: swinging sixteenths in the spirit of the Purdie shuffle.',how:'Every beat is a triplet. Notes on the first and third parts of the triplet, dead notes in the middle. The variation changes the pattern.',hf:'Alternate fingers through the triplets: each beat starts with a different finger.',hp:'With a pick: down-up-down, next beat up-down-up; or start every beat with a downstroke.',tip:'The middle of the triplet is quiet, the edges loud: that is what makes it swing.',lvl:['Shuffle without dead notes','With dead notes','Shuffle and answer','Four bars','Four bars with a fill']},
R14:{name:'Fills: hammer-on and pull-off',goal:'Short funk fills with the fretting hand between the beats.',how:'Root, hammer a whole step or a step and a half up and pull off back: a one-beat trill. The variation changes the fill figure.',hf:'Pluck only the first note of the fill, the rest is the fretting hand.',hp:'One pick stroke per fill, hammer and pull-off with the fretting hand.',tip:'A pull-off snaps the string sideways, the finger does not just lift.',lvl:['Fill without dead notes','With dead notes','Fill and answer','Four bars','Four bars of fills']},
R15:{name:'Non-stop sixteenths',goal:'Muted sixteenths without gaps, in the spirit of Rocco Prestia.',how:'The edge of the plucking palm rests on the strings at the bridge: a short, tight sound. Every sixteenth is filled, with a note or a dead note.',hf:'Fingers strictly alternating, the palm stays down.',hp:'Pick with palm muting: alternate picking without stops.',tip:'Even volume: a dead note is almost as audible as a ringing one.',lvl:['Ringing notes only','With dead notes','Groove and answer','Four bars','Four bars with a fill']}
};
const EXEN={};
Object.keys(EX).forEach(id=>{const e=EX[id],en=Object.assign({},EN_TXT[id]);if(e._en){en.v=e._en;delete e._en;}EXEN[id]=en;});
const P=(k,mode,p,n)=>bar(p,mk(k,mode),n||16);
const TESTS=[
  {id:'FBT1',ru:['Шестнадцатые на открытой {o:E}','Нота и мёртвая нота по очереди, держать 30 секунд без сбоя.'],en:['Sixteenths on the open {o:E}','Note and dead note in turn, hold 30 seconds without a slip.'],sub:4,t:[P('E','f','RxRxRxRxRxRxRxRx')]},
  {id:'FBT2',ru:['Слэп-октавы','Октавы слэпом в {E} с мёртвыми нотами, четыре такта подряд без сбоя.'],en:['Slap octaves','Slap octaves in {E} with dead notes, four bars in a row without a slip.'],sub:4,t:[P('E','s','R.OyR.O.R.OyRxO.')+' | '+P('E','s','R.OyR.O.R.OyRxO.'),P('E','s','R.OyR.O.R.OyRxO.')+' | '+P('E','s','RxOyRxOyRxOyRxO.')]},
  {id:'FBT3',ru:['Шестнадцатые на выносливость','Приглушённые шестнадцатые на {A} без пауз, держать 60 секунд.'],en:['Sixteenth endurance','Muted sixteenths on {A} without gaps, hold 60 seconds.'],sub:4,t:[P('A','m','RxRxRxRxRxRxOxRx')]},
  {id:'FBT4',ru:['Синкопа со второй шестнадцатой','Грув в {A}, вступающий после доли, четыре такта без сбоя.'],en:['Syncopation from the second sixteenth','A groove in {A} entering after the beat, four bars without a slip.'],sub:4,t:[P('A','f','xR-.xR-.xO-.xR..')+' | '+P('A','f','xR-.xR-.x5-.x7O.'),P('A','f','xR-.xR-.xO-.xR..')+' | '+P('A','f','xR-xxR-xxO-x7x5x')]},
  {id:'FBT5',ru:['Хаммер после слэпа','Слэп, хаммер и пулл-офф в {A}, четыре раза подряд без сбоя.'],en:['Hammer-on after the slap','Slap, hammer-on and pull-off in {A}, four times in a row without a slip.'],sub:4,t:[P('Ao','s','RQxxRQxxRQqxOyOy')]}
];
const RIFF={
  ru:['хотя бы одна мёртвая нота на каждую долю','рифф начинается со второй шестнадцатой','только одна звучащая нота, остальное — ритм и мёртвые ноты','в риффе есть октава попом или через струну','первая доля второго такта — пауза','хотя бы один хаммер или пулл-офф','не больше пяти разных нот','одна нота тянется целую долю, остальное короткое','в риффе есть хроматический подход к тонике','второй раз рифф отвечает сам себе: другой конец','хотя бы одна синкопа через тактовую черту','рифф держится один такт по кругу, но в последний раз — сбивка'],
  en:['at least one dead note on every beat','the riff starts on the second sixteenth','only one ringing note, the rest is rhythm and dead notes','includes an octave, popped or across a string','the first beat of bar two is a rest','at least one hammer-on or pull-off','no more than five different notes','one note lasts a full beat, the rest is short','includes a chromatic approach to the root','the second time through the riff answers itself: a different ending','at least one syncopation across the bar line','a one-bar loop, but the last time through ends with a fill']
};
const COACH={W0:{free:60},
  B1:{cyc:[{tag:['Начни с указательного','Start with the index finger']},{tag:['Начни со среднего','Start with the middle finger']}]}};
return {EX,EXEN,COACH,TESTS,RIFF};
})();
/*@FKB1_END@*/

// ----- FKB2: фанк, бас, часть 2 -----
const FKB2=(()=>{
  // Запись такта: 16 клеток-шестнадцатых через пробел. Роль ноты от тоники варианта:
  // R тоника, a/k полутон ниже/выше, l септима снизу, 2, m, 3, 4, b (блюзовая), 5, 6, 7, M (большая септима), O октава, N нона, d/D малая/большая децима, Q квинта над октавой, Z квинта на той же струне.
  // Префикс техники: S слэп, P поп, h хаммер, p пулл-офф. x — мёртвая нота (xR — на струне тоники; без роли — на струне предыдущей ноты, с её S/P).
  // '-' — продление, '.' — пауза. Первый токен вида 'E10:' меняет тонику такта.
  const S='EADG';
  const OFF={R:[0,0],a:[0,-1],k:[0,1],l:[0,-2],'2':[0,2],m:[0,3],'3':[1,-1],'4':[1,0],b:[1,1],'5':[1,2],'6':[2,-1],'7':[2,0],M:[2,1],O:[2,2],N:[2,4],d:[3,0],D:[3,1],Q:[3,4],Z:[0,7]};
  const rootOf=t=>[S.indexOf(t[0]),+t.slice(1)];
  const split=c=>c.length>1&&'SPhp'.includes(c[0])?[c[0],c.slice(1)]:['',c];
  const isN=v=>v!=='-'&&v!=='.'&&split(v)[1][0]!=='x';
  const cell=(c,r,prev)=>{
    let [t,x]=split(c);
    if(x[0]==='x'){let s;const role=x.slice(1);
      if(role)s=r[0]+OFF[role][0];else if(!prev)s=r[0];else{s=prev.s;if(!t&&(prev.t==='S'||prev.t==='P'))t=prev.t;}
      if(t==='h'||t==='p')t='';return {h:S[s]+t+'x',s,t};}
    const o=OFF[x];if(!o)throw new Error('FKB2: роль '+c);
    const s=r[0]+o[0],f=r[1]+o[1];if(s<0||s>3||f<0||f>20)throw new Error('FKB2: вне грифа '+c);
    return {h:S[s]+t+f,s,t};
  };
  const bar=(src,r0)=>{const c=src.trim().split(/\s+/);let r=r0;
    if(/:$/.test(c[0]))r=rootOf(c.shift().slice(0,-1));
    if(c.length!==16)throw new Error('FKB2: в такте '+c.length+' клеток: '+src);return {r,c};};
  // такт → токены; sw — свинговые шестнадцатые (деление 6: долгая 2, короткая 1)
  const out=(b,sw)=>{const ev=[];let prev=null;
    b.c.forEach((c,i)=>{
      if(c==='-'){if(!ev.length)ev.push({h:'.',i});return;}
      if(c==='.'){if(ev.length&&ev[ev.length-1].h==='.')return;ev.push({h:'.',i});return;}
      const n=cell(c,b.r,prev);prev=n;ev.push({h:n.h,i});});
    const pos=i=>sw?Math.floor(i/2)*3+(i%2?2:0):i,end=sw?24:16;
    return ev.map((e,j)=>{const k=(j+1<ev.length?pos(ev[j+1].i):end)-pos(e.i);return e.h+(k>1?':'+k:'');}).join(' ');};
  // уровень 1: по ноте на пару шестнадцатых, без мёртвых нот и легато
  const thin=b=>{const c=[];for(let i=0;i<16;i+=2){const a=b.c[i],z=b.c[i+1],n=[a,z].find(isN);
    c.push(n?(('hp'.includes(n[0])&&n.length>1)?n.slice(1):n):(a==='.'?'.':'-'),'-');}return {r:b.r,c};};
  const ghost=b=>({r:b.r,c:b.c.map((v,i)=>v==='.'&&b.c.slice(0,i).some(isN)?'x':v)});
  const fill=(b,f)=>({r:b.r,c:b.c.slice(0,12).concat(f)});
  const FILL={f:['7','5','4','a'],s:['PO','x','S5','Sa']};
  const LV=(A,B,f)=>[[thin(A)],[A],[A,B],[A,B,A,fill(B,f)],[ghost(A),B,ghost(A),fill(B,f)]];
  const LV_STOP=(H,B,f)=>[[H],[H,B],[H,H,H,B],[H,H,H,fill(B,f)],[H,ghost(B),H,fill(ghost(B),f)]];
  // m: f — пальцы, s — слэп; lv — схема уровней; v: [тоника, RU, EN, такт A, такт B, филл?]
  const D={
    A16:{m:'s',v:[
      ['E5','Октавы {A}: ровные восьмые','{A} octaves: straight eighths','SR - PO - SR - PO - SR - PO - SR - PO -','SR - PO - SR x PO - SR - PO x SR - PO -'],
      ['E3','Октавы {G}: группы по три шестнадцатые','{G} octaves: groups of three sixteenths','SR - - PO - - SR - - PO - - SR - PO -','SR - - PO - - SR - SR - PO - SxR - PO -'],
      ['A2','Октавы {B}: сдвоенные удары','{B} octaves: doubled hits','SR SR PO - SR - PO PO SR - PO - SR SR PO -','SR - PO SxR SR - PO - . SR PO - SR - PO PO'],
      ['E7','Октавы и квинта {B}','{B} octaves and the fifth','SR - PO - S5 - PO - SR - PO - S5 - PO -','SR - PO SxR S5 - PO - SR SR PO - S5 - P7 -'],
      ['E0','Октавы {E} от тоники без лада, ход через малую терцию','{E} octaves from the unfretted root, a move through the minor third','SR - SxR PO - SR - SxR SR - PO - SxR - PO -','SR - SxR PO - SR - SxR SR - PO - Sm - S5 -',['PO','x','Sm','S2']],
      ['E8','Октава и септима {C}','{C} octave and seventh','SR - PO - SxR - P7 - SR - PO - SxR P7 PO -','SR SR PO - P7 - PO - SR - PO SxR PO - P7 -']]},
    A17:{m:'f',v:[
      ['E5','{A}9: вверх до ноны и обратно','{A}9: up to the ninth and back','R - 3 5 7 - O - N - O 7 5 - 3 -','R - x 3 5 x 7 - O x N O 7 5 3 a'],
      ['A3','{C}m9: минорный нонаккорд','{C}m9: the minor ninth','R - - m - 5 - 7 - - N - 7 - 5 -','R . m 5 7 . N 7 5 . m R a - - -'],
      ['E3','{G}9: спуск с ноны','{G}9: down from the ninth','N - O 7 - 5 3 - R - - . R - l -','N O 7 5 3 R - . R - 3 5 7 - O -'],
      ['E7','{B}7#9: малая терция над октавой','{B}7#9: the minor third above the octave','R - 5 - 7 - d - 7 - 5 - 3 - R -','R 3 5 7 d - 7 5 3 - R - . R a -'],
      ['E8','{C}maj9: большая септима','{C}maj9: the major seventh','R - 3 - 5 - M - N - M - 5 - 3 -','R 3 5 M N - M 5 3 - R - 5 - a -'],
      ['A5','{D}7sus4: кварта вместо терции','{D}7sus4: the fourth instead of the third','R - 4 - 5 - 7 - O - 7 - 5 - 4 -','R 4 5 7 O - 7 5 4 - R - . R a -']]},
    A18:{m:'f',v:[
      ['E5','{A}: позиция от тоники, вверх','{A}: the position from the root, going up','R - . R m - 4 - 5 - 7 - 5 4 m -','R . R m 4 5 7 O 7 5 4 m R - . -'],
      ['A7','{E}: спуск с октавы','{E}: down from the octave','R - m - 4 . 5 - 7 - O - 7 5 4 -','O - 7 5 4 m R - l - R - . R m -'],
      ['E3','{G}: группы по три шестнадцатые','{G}: groups of three sixteenths','R - - R - - m - - 4 - - 5 - 7 -','O - - 7 - - 5 - - 4 - - m - R -'],
      ['E10','{D}: высокая позиция, тройки нот','{D}: high position, three-note cells','R m 4 - R m 4 - R m 4 5 7 - 5 -','O 7 5 - O 7 5 - 4 m R - 4 m R -'],
      ['A0','{A}: позиция у порожка','{A}: the position at the nut','R - R m - 4 5 - 7 - O - 7 - 5 -','R m R 4 m 5 4 7 5 O 7 5 4 m R -',['7','5','4','m']],
      ['E8','{C}: скачки на октаву','{C}: octave leaps','R - O - R m - 4 - 5 O - 7 - 5 -','R O R O 7 5 4 m R - . R - m 4 5']]},
    A19:{m:'f',v:[
      ['E5','{A} дорийский: гамма вверх','{A} Dorian: the scale going up','R - 2 m - 4 - 5 - 6 7 - O - 7 6','O 7 6 5 4 m 2 R - . R - 5 - 6 -'],
      ['A5','{D} дорийский: терциями','{D} Dorian: in thirds','R m 2 4 m 5 4 6 5 7 6 O - . R -','O 6 7 5 6 4 5 m 4 2 m R - . R -'],
      ['E3','{G} дорийский: вамп с секстой','{G} Dorian: a vamp on the sixth','R - . R - 6 - 7 R - . R 6 - 5 -','R - m - 4 - 6 - 5 - 4 - m - 2 -'],
      ['E7','{B} дорийский: с октавы вниз','{B} Dorian: down from the octave','R - R O - R 7 - 6 - 5 - 4 - m -','4 - 6 - 7 - 6 - 5 - 4 - m - 2 -'],
      ['A7','{E} дорийский: высокая позиция','{E} Dorian: high position','R 2 m - 5 - 6 - 7 - 6 5 m 2 R -','O - 7 - 6 - 5 - 4 - m - 2 - R -'],
      ['E10','{D} дорийский: синкопы','{D} Dorian: syncopated','R - - 2 - m - - 4 - 5 - - 6 - 7','O - - 7 - 6 - - 5 - 4 - - m - 2']]},
    A20:{m:'f',v:[
      ['E5','{A}7: арпеджио с секстой','{A}7: arpeggio with the sixth','R - 3 - 5 - 6 7 O - 7 6 5 - 3 -','R 2 3 4 5 6 7 O - . O 7 6 5 3 a'],
      ['E3','{G}7: октавная накачка','{G}7: octave pump','R - O - R - 7 6 R - O - 5 - 3 -','R O R O 7 - 6 - 5 - 4 - 3 - 2 -'],
      ['A3','{C}7: стаккато','{C}7: staccato','R . 3 . 5 . 6 . 7 . 6 . 5 . 3 .','R - 2 3 5 - 6 7 O - 7 6 5 - 3 2'],
      ['E7','{B}7: спуск с септимы','{B}7: down from the seventh','7 - 6 - 5 - 3 - R - - . R - 3 -','7 6 5 4 3 2 R - 5 - 6 - 7 - O -'],
      ['A5','{D}7: септима снизу','{D}7: the seventh below','R - l - R - 3 5 6 - 5 - 3 - R -','R - O - 7 - 6 - 5 4 3 - 2 - R -'],
      ['E10','{D}7: высокая позиция','{D}7: high position','R - . R 3 - 5 - 7 - . 7 6 - 5 -','O - 7 6 5 - 3 - 2 - R - 3 5 6 7']]},
    A21:{m:'s',v:[
      ['E5','{A}: хаммер на тон с тоники','{A}: a whole-step hammer from the root','SR - h2 - PO - x - S4 - h5 - PO - x -','SR - h2 - PO - x S4 h5 - P7 hO - x - -'],
      ['E3','{G}: хаммер снизу в тонику','{G}: a hammer from below into the root','Sl hR - PO - x Sl hR - PO x - S4 h5 PO -','Sl hR PO - S4 h5 PO x Sl hR - PO x - PO -'],
      ['A5','{D}: хаммер через блюзовую ноту','{D}: hammers through the blue note','SR - PO - S4 hb h5 - PO - x - SR - x -','SR x PO x S4 hb h5 x P7 hO x - SR - PO -'],
      ['E7','{B}: двойной удар и хаммер','{B}: a double hit and a hammer','SR SxR h2 - PO - SR - S4 - h5 - P7 - PO -','SR - h2 SxR PO - P6 h7 SR - h2 - PO - x -'],
      ['E0','{E}: хаммеры от ненажатой струны','{E}: hammers from unfretted strings','SR - - h2 PO - SR - S4 - h5 - PO - SR -','SR h2 PO SxR S4 h5 PO SxR SR h2 PO SxR S4 h5 PO -',['PO','x','S5','S4']],
      ['A3','{C}: хаммер в септиму на попе','{C}: a hammer into the seventh after a pop','SR - PO - P6 h7 - x SR - h2 - PO - x -','SR - S4 h5 PO - P6 h7 SR - h2 - PO P7 PO -']]},
    A22:{m:'f',v:[
      ['E5','{A}: тоника, квинта, секста, октава','{A}: root, fifth, sixth, octave','R - - R 5 - 6 - O - - 7 - 5 3 -','R - - 5 - 6 7 - O - 6 - 5 - 3 a'],
      ['A3','{C}: мажорная линия с секстой','{C}: a major line with the sixth','R - 3 - 5 - 6 - O - 6 - 5 - 3 -','R - - 2 3 - - 5 - - 6 - 5 4 3 2'],
      ['E3','{G}: предвосхищение тоники','{G}: anticipating the root','R - x R - - 5 - 6 - x 6 - 5 3 -','O - - O - - 7 - 6 - - 5 - 3 2 a'],
      ['E7','{B}m: минорная линия','{B}m: a minor line','R - - m - 4 5 - 7 - - 5 - 4 m -','R - O - 7 - 5 - 4 - m - R - l -'],
      ['A5','{D} и {G}: два аккорда','{D} and {G}: two chords','R - - 3 - 5 - 6 - . R - 3 5 6 -','A10: R - - 3 - 5 - 6 - - 5 - 3 - 2 -'],
      ['E8','{C}: восьмые с затактом','{C}: eighths with pickups','R - R - 5 - 5 - 6 - 6 - 5 - 3 2','R - O - 7 - 6 - 5 - . 3 - 2 - a']]},
    A23:{m:'f',v:[
      ['E5','{A}: подходы снизу к тонике и квинте','{A}: approaches from below to the root and fifth','R - - . a R - - 4 - b 5 - - . a','R - 2 m 3 - 4 - b 5 - 6 7 M O -'],
      ['E3','{G}: подход сверху к тонике','{G}: approach from above to the root','k R - - . R 4 - b 5 - . 7 - 6 -','5 - - 6 - - 7 - M O - . k R - -'],
      ['A5','{D}: окружение тоники','{D}: enclosing the root','k a R - - . 4 b 5 - - . 7 M O -','O - 7 - 6 - 5 - b - 4 - 3 - m -'],
      ['E8','{C}: короткие подходы между долями','{C}: short approaches between beats','R - x a R - x a R - O - 7 - 5 -','5 - x b 5 - x 4 m - 2 - k R - -'],
      ['A7','{E}: хроматический подъём к октаве','{E}: chromatic climb to the octave','R - . a R - . 4 b 5 - . 6 7 M O','O - M 7 6 - 5 b 4 - 3 m 2 - k R'],
      ['E10','{D}: хроматика между квинтой и квартой','{D}: chromatics between the fifth and fourth','R - 3 - 5 - . b 4 - - . 3 - m -','R - O - 7 - . M O - 7 - 6 - 5 b']]},
    A37:{m:'f',v:[
      ['E5','{A}m7: каждая нота на «и»','{A}m7: every note on the off-beat','. - R - . - m - . - 5 - . - 7 -','. - O - . - 7 - . - 5 - m - R -'],
      ['E3','{G}m7: пунктир по три шестнадцатые','{G}m7: dotted, three sixteenths each','R - - R - - 5 - - 7 - - O - - -','O - - 7 - - 5 - - m - - R - a -'],
      ['A5','{D}m7: вступление со второй шестнадцатой','{D}m7: entering on the second sixteenth','. R - - . R - - . 5 - - . 7 - -','. O - - . 7 - - . 5 - - m - R -'],
      ['E7','{B}m7: лига в следующий такт','{B}m7: tied into the next bar','R - . R - . 5 - . 7 - . O - . a','R - . 7 - . 5 - . m - . R - - -'],
      ['E8','{C}m7: паузы на долю','{C}m7: rests on the beat','R - - . m - - . 4 - 5 - - . 7 -','O - - . 7 - - . 5 - 4 - - . m -'],
      ['A7','{E}m7: короткие ноты через две паузы','{E}m7: short notes, two rests apart','R . . R . . R . . R . . O - 7 -','R . . 5 . . 7 . . O . . 7 - 5 -']]},
    L24:{m:'f',v:[
      ['E5','{A}: тоника и октава','{A}: root and octave','R x x R x x R x R x x R x x O x','R x x R x x 5 x 7 x x 5 x x R x'],
      ['E3','{G}: минорная фраза','{G}: a minor phrase','R x R x m x R x 4 x m x R x 7 x','O x 7 x 5 x 4 x m x R x l x R x'],
      ['A5','{D}: нота и две глухие','{D}: one note, two muted','R - x x R - x x 5 - x x 7 - x x','O - x x 7 - x x 5 - x x 4 - m -'],
      ['E7','{B}: ноты между долями','{B}: notes between the beats','x R x R x R x x x 5 x 5 x 7 x x','x O x O x 7 x x x 5 x 5 x m x x'],
      ['E0','{E}: от ненажатой струны','{E}: from the unfretted string','R x x x R x x x R x R x m x 5 x','R x x x R x x x 7 x 5 x m x 2 x',['7','x','5','m']],
      ['E8','{C}: сдвоенные ноты','{C}: doubled notes','R x R R x R x R R x R x 7 x 5 x','R x R R x R x R O x 7 x 5 x m x']]},
    L25:{m:'f',v:[
      ['E5','{A}: плотный рисунок','{A}: a dense pattern','R - R R - R - R R - R - R R R -','R R . R - R . R R R . R - R R .'],
      ['E3','{G}: группы по три','{G}: groups of three','R - - R - - R - - R - - R - R -','R - - R - - R - R - - R - - R -'],
      ['A5','{D}: нота и мёртвая','{D}: a note and a dead note','R x R x x R x R R x R x x R x R','R x x R x x R x x R x x R x R x'],
      ['E7','{B}: тоника и октава','{B}: root and octave','R - O - R R O - R - O R - R O -','R O R O - R O - R O R - O R O -'],
      ['E0','{E}: со слабых шестнадцатых','{E}: from the weak sixteenths','. R . R . R R . . R . R . R R R','. R R . R . R R . R R . R . R .',['R','R','R','R']],
      ['A3','{C}: короткие и длинные','{C}: short and long','R - - R - . R - - R - . R R - R','R . R . R - R . R . R - R R R R']]},
    L26:{m:'s',v:[
      ['E5','{A}: тоника, глухой удар, октава','{A}: root, muted hit, octave','SR SxR PO SxR SR SxR PO SxR SR SxR PO SxR SR SxR PO SxR','SR S4 PO S4 SR S4 PO S4 S5 S4 PO S4 SR SxR PO -'],
      ['E3','{G}: вниз на тонику, вверх на квинту','{G}: down on the root, up on the fifth','SR S5 PO S5 SR - PO S5 SR S5 PO - S5 - PO -','SR S5 P7 S5 SR S5 PO S5 S4 S5 P7 S5 SR - - -'],
      ['A5','{D}: вверх на кварту','{D}: up on the fourth','SR S4 PO S4 SR S4 PO - SR S4 PO S4 S5 S4 PO -','SR SxR S4 SxR PO SxR SR SxR S5 S4 PO S4 SR - PO -'],
      ['E7','{B}: тройки нот','{B}: three-note cells','SR S5 PO SR S5 PO SR S5 PO SR S5 PO SR S5 PO -','SR S5 PO SR S5 P7 SR S5 PO SR S5 P7 SR - PO -'],
      ['E0','{E}: от ненажатой струны','{E}: from the unfretted string','SR SxR S5 SxR PO SxR S5 SxR SR SxR S5 SxR PO S5 S4 -','SR S5 S4 PO SR S5 S4 PO SR SxR S5 SxR PO - S4 -',['PO','x','S5','S4']],
      ['A3','{C}: два удара вверх подряд','{C}: two upstrokes in a row','SR S4 S5 PO SR S4 S5 PO SR S4 S5 P7 SR S4 PO -','SR S4 S5 PO SR S4 S5 P7 SR - S5 PO SR S4 PO -']]},
    L27:{m:'s',v:[
      ['E5','{A}: глухие удары между октавами','{A}: muted hits between octaves','SR - SxR - PO - SxR - SR SxR SxR - PO - SxR -','SR - SxR SR - SxR PO - SR SxR - SR PO - SxR -'],
      ['E3','{G}: глухой поп','{G}: muted pops','SR SxR PxO SxR SR SxR PO SxR SR SxR PxO SxR S5 SxR PO -','SR SxR PxO SxR S5 SxR PxO SxR P7 SxR PO SxR SR - - -'],
      ['A5','{D}: группы по три','{D}: groups of three','SR - - SxR - - PO - SR - SxR - PO - SxR -','SR - - SxR - - P7 - SR - SxR - PO - P7 -'],
      ['E7','{B}: слэп и глухой поп по очереди','{B}: slap and muted pop in turn','SR PxO SR PxO SR PxO PO - SR PxO SR PxO S5 - PO -','SR PxO SR PxO S5 PxO P7 - SR PxO S4 PxO S5 - PO -'],
      ['E0','{E}: от ненажатой струны','{E}: from the unfretted string','SR - SxR SR - SxR PO SxR SR - SxR S5 - SxR PO -','SR - SxR S5 - SxR P7 SxR SR - SxR S4 - SxR PO -',['PO','x','S5','S4']],
      ['A3','{C}: два глухих после ноты','{C}: two muted after each note','SR SxR SxR PO SxR SxR SR SxR SxR PO SxR SxR S5 SxR PO -','SR SxR SxR P7 SxR SxR SR SxR SxR PO SxR SxR S4 SxR PO -']]},
    L28:{m:'f',v:[
      ['E5','{A}: хаммер с тоники и с септимы','{A}: hammers from the root and the seventh','R - h2 - pR - 5 - 7 - hO - p7 - 5 -','R h2 pR - 4 h5 p4 - 7 hO p7 - 5 - 4 -'],
      ['E3','{G}: хаммер снизу в тонику','{G}: a hammer from below into the root','l hR - - m - 4 h5 - - 7 - 5 - p4 -','R hm pR - 4 h5 - 7 hO p7 - 5 p4 - m -'],
      ['A5','{D}: хроматический хаммер','{D}: a chromatic hammer','R h2 hm pR - - 4 h5 - - 7 hO - p7 - -','O p7 - 5 p4 - m p2 pR - - . R - l -'],
      ['E7','{B}: трели тройками','{B}: trills in threes','R h2 pR R h2 pR R h2 pR - 5 - 7 hO p7 -','4 h5 p4 4 h5 p4 7 hO p7 - 5 - 4 - R -'],
      ['E0','{E}: легато от ненажатой струны','{E}: legato from unfretted strings','R - h2 hm pR - - . 4 - h5 - 7 - hO -','O p7 - 5 p4 - R - h2 - hm - p2 - pR -',['O','p7','5','p4']],
      ['E8','{C}: пулл-офф после паузы','{C}: a pull-off after a rest','R - . 4 h5 - . 7 hO - p7 5 - p4 R -','R h2 pR - 7 hO p7 - 4 h5 p4 - R - l hR']]},
    L29:{m:'f',v:[
      ['E5','{A} и {D}: одна фигура в двух позициях','{A} and {D}: one figure in two positions','R - 5 - O - 5 - R - 5 - O - 7 -','E10: R - 5 - O - 5 - R - 5 - O - 7 -'],
      ['E3','{G} и {C}: арпеджио на пять ладов выше','{G} and {C}: the arpeggio five frets higher','R - 3 - 5 - O - 7 - 5 - 3 - R -','E8: R - 3 - 5 - O - 7 - 5 - 3 - R -'],
      ['A5','{D}: та же фраза в другой позиции','{D}: the same phrase in another position','R m 4 5 7 - O - 7 5 4 m R - - -','E10: R m 4 5 7 - O - 7 5 4 m R - - -'],
      ['E3','{G} и {A}: квинта вдоль струны','{G} and {A}: the fifth along the string','R - - Z - - R - Z - O - 7 - 5 -','E5: R - - Z - - R - Z - O - 7 - 5 -'],
      ['E0','{E} у порожка и на октаву выше','{E} at the nut and an octave higher','R - 4 - 5 - 7 - O - 7 - 5 - 4 -','E12: R - 4 - 5 - 7 - O - 7 - 5 - 4 -'],
      ['A3','{C} и {F}: доминанта в двух позициях','{C} and {F}: a dominant in two positions','R - 3 - 5 - 6 - 7 - 6 - 5 - 3 -','A8: R - 3 - 5 - 6 - 7 - 6 - 5 - 3 -']]},
    L30:{m:'s',v:[
      ['E5','{A}: малая децима','{A}: the minor tenth','SR - Pd - SR - PO - SR - Pd - PO - SR -','SR Pd PO - S5 Pd PO - SR Pd PO Pd S5 - PO -'],
      ['E3','{G}: большая децима','{G}: the major tenth','SR - PD - S5 - PD - SR PD - SR - PD S5 -','SR PD S5 PD SR PD PO PD S5 - PD - SR - - -'],
      ['E7','{B}: квинта над октавой','{B}: the fifth above the octave','SR - - PQ - - SR - PQ - SR - PO - P7 -','SR PQ PO - SR PQ PO - SR - PQ - PO - - -'],
      ['E0','{E}: от ненажатой струны','{E}: from the unfretted string','SR - PO - SxR - Pd - SR - PO Pd SxR - PO -','SR Pd PO Pd SR - PO - S5 - Pd - PO - SR -',['PO','x','S5','S4']],
      ['A5','{D}: септима через струну','{D}: the seventh, skipping a string','SR - P7 - SR - PO - SR P7 PO - SxR - PO -','SR - P7 PO S4 - P7 - SR - PO P7 S5 - PO -'],
      ['E8','{C}: малая и большая децима','{C}: minor and major tenths','SR SxR Pd PO SR SxR PD PO SR SxR Pd PO S5 - PO -','SR SxR PD PO S5 SxR Pd PO SR - Pd - PO - SR -']]},
    L31:{m:'f',v:[
      ['E5','{A}: тоника, октава, квинта','{A}: root, octave, fifth','R O 5 O R O 5 O R O 7 O R O 5 O','R O 5 O R O 5 O 7 O 5 O 4 - m -'],
      ['E3','{G}: группы по три','{G}: groups of three','R - O R - O R - O R - O 5 - 7 -','R - O R - O 7 - O 7 - O 5 - 3 -'],
      ['A5','{D}: октава и глухая нота','{D}: octave and a dead note','R O x O R O x O 5 O x O 7 O x O','R O R O 5 O 5 O 7 O 7 O 5 - 4 -'],
      ['E7','{B}: септима снизу','{B}: the seventh below','R O l O R O l O R O 5 O 7 O 5 O','R O l O R O 7 O 5 O 4 O m - R -'],
      ['E10','{D}: высокая позиция','{D}: high position','R - O - R O - O R - O - 7 - 5 -','R O 7 O 5 O 4 O R - - . R - O -'],
      ['A3','{C}: октава через глухую','{C}: octave through a dead note','R x O x R x O x 5 x O x 7 x O x','R O 7 O 5 O 3 O R - O - R - - -']]},
    L38:{m:'f',v:[
      ['E5','{A}: филл вниз по пентатонике','{A}: a fill down the pentatonic','R - - R - - 5 - R - - - O 7 5 4','R - - R - - 5 - m 4 m R 7 5 4 m'],
      ['E3','{G}: филл вверх к октаве','{G}: a fill up to the octave','R - . R - . 7 - R - . - 5 6 7 O','R - . R - . 7 - O 7 6 5 3 5 3 a'],
      ['A5','{D}: филл после мёртвой ноты','{D}: a fill after a dead note','R - x R - x R - R - - - m 4 5 7','R - x R - x R - O 7 5 4 m 4 m R'],
      ['E7','{B}: филл с октавы','{B}: a fill from the octave','R - - - O - - - R - - - 7 O 7 5','R - - - O - - - 5 7 O 7 5 4 m a'],
      ['E8','{C}: тоника на «и», филл','{C}: root on the off-beat, then a fill','. - R - . - R - . - R - 5 4 m R','. - R - . - R - O 7 5 4 m 4 m 2'],
      ['A7','{E}: филл вверх по пентатонике','{E}: a fill up the pentatonic','R - R - R - R - 7 5 4 m R m 4 5','O - O - O - O - 7 O 7 5 4 m R l']]},
    C32:{m:'f',v:[
      ['E5','{A}: октава на третью долю','{A}: the octave on beat three','R - - R - - O - . R - 7 - 5 R -','R - - R - - O - . R - 7 5 m R -'],
      ['E3','{G}: мёртвые ноты в кармане','{G}: dead notes in the pocket','R - x R - x 7 - O - x 7 - 5 m -','R - x R - x 7 - O 7 5 m R - l -'],
      ['A5','{D}: полутемп','{D}: half-time','R - - - - - - R . - O - 7 - 5 -','R - - - - - - R . - 5 - 7 - O -'],
      ['E7','{B}: короткие ноты','{B}: short notes','R R . R R . O . R R . R 7 . 5 .','R R . R R . O . 7 7 . 5 5 . m .'],
      ['E0','{E}: от ненажатой струны','{E}: from the unfretted string','R - - - 7 - x R - - O - 7 - 5 -','R - - - 7 - x R - - m - 2 - R -',['O','7','5','4']],
      ['E8','{C}: тоника вокруг долей','{C}: the root around the beats','R - R . - R . R - . O - . 7 - R','R - R . - R . R - . 5 - . 4 - m']]},
    C33:{m:'f',lv:LV_STOP,v:[
      ['E5','{A}: удары на «раз» и «три»','{A}: hits on one and three','R - . . . . . . R - . . . . . .','R - - R - - O - . R - 7 - 5 R -'],
      ['E3','{G}: три удара по три шестнадцатые','{G}: three hits, three sixteenths apart','R . . R . . R . . . . . . . . .','R - x R - x 7 - O - x 7 - 5 m -'],
      ['A5','{D}: удары на «и»','{D}: hits on the off-beats','. . R - . . . . . . R - . . . .','R - - - - - - R . - O - 7 - 5 -'],
      ['E7','{B}: удары вразбивку','{B}: scattered hits','R . . . . . R . . . . . . . R -','R R . R R . O . R R . R 7 . 5 .'],
      ['E8','{C}: удар и подхват в конце','{C}: a hit and a pickup at the end','R - O - . . . . . . . . . . 7 5','R - R . - R . R - . O - . 7 - R'],
      ['A7','{E}: удары на последнюю шестнадцатую','{E}: hits on the last sixteenth','. . . R . . . R . . . R . . . R','R - x R - - 5 - 7 - x 7 - 5 4 -']]},
    C34:{m:'f',sw:1,v:[
      ['E5','{A}: свинг с мёртвыми нотами','{A}: swing with dead notes','R - x R - x R - 7 - O - 7 5 m -','R - x R - x R - O 7 5 4 m 4 m R'],
      ['E3','{G}: свинговое стаккато','{G}: swung staccato','R . R . 5 . 7 . O . 7 . 5 . 3 .','R R . R 5 5 . 5 7 7 . 7 O - 7 -'],
      ['A5','{D}m: группы по три','{D}m: groups of three','R - - R - - m - 4 - - 5 - 7 - -','O - - 7 - - 5 - 4 - - m - R - -'],
      ['E7','{B}: нота и глухая','{B}: a note and a dead note','R x R x R x O x R x R x 7 x 5 x','R x R x O x 7 x 5 x 4 x m x R x'],
      ['E8','{C}7: мажорная линия','{C}7: a major line','R - - - R - 3 5 6 - 5 - 3 - 2 -','R - 3 - 5 - 6 - 7 - 6 - 5 - 3 -'],
      ['A3','{C}m: с короткой шестнадцатой','{C}m: from the short sixteenth','. R - R . R - R . 5 - 7 . O - 7','. R - R . 7 - 5 . 4 - m . R - -']]},
    C35:{m:'s',v:[
      ['E5','{A}: вызов слэпом, ответ пальцами вниз','{A}: slap call, fingered answer going down','SR - PO - SR SxR PO - SR - PO - SxR - PO -','. - - - . - - - 7 - 5 - 4 m R -'],
      ['E3','{G}: короткий вызов, длинный ответ','{G}: a short call, a long answer','SR SxR PO SxR S5 - PO - SR - - - . - - -','. - - - . - - - O 7 5 m 4 m R -'],
      ['A5','{D}: вызов с хаммером, ответ вверх','{D}: a call with a hammer, an answer going up','SR - S4 h5 PO - x - SR - - - . - - -','. - - - . - - - R - m - 4 - 5 -'],
      ['E7','{B}: ответ с мёртвыми нотами','{B}: an answer with dead notes','SR PxO SR PxO S5 - PO - . - - - . - - -','. - - - R x R x 7 x 5 x R - - -'],
      ['E0','{E}: ответ с октавы','{E}: an answer from the octave','SR - SxR PO - SR - SxR SR - PO - . - - -','. - - - . - - - 7 - O - 7 - 5 -',['7','5','2','R']],
      ['A3','{C}: ответ шестнадцатыми','{C}: an answer in sixteenths','SR - PO - P7 - PO - SR - - - . - - -','. - - - . - - - 7 6 5 3 R - - -']]}
  };
  const lvBars=(id,k)=>{const e=D[id],[r,,,a,b,f]=e.v[k],R0=rootOf(r);return (e.lv||LV)(bar(a,R0),bar(b,R0),f||FILL[e.m]);};
  const sysOf=(bars,sw)=>{const o=[];for(let i=0;i<bars.length;i+=2)o.push(bars.slice(i,i+2).map(b=>out(b,sw)).join(' | '));return o;};
  const ETU=[['C32','A21','L24','L38'],['L25','A16','A22','L28'],['A37','L27','A18','L31'],['L26','A20','L24','A23'],['C32','L30','A19','L38'],['A22','L26','A17','C35']];
  const LVL_RU=['Восьмые: нота на пару шестнадцатых, без мёртвых нот и легато','Такт грува','Два такта','Четыре такта, в конце филл','Мёртвые ноты на паузах'];
  const LVL_EN=['Eighths: one note per pair of sixteenths, no dead notes or legato','One-bar groove','Two bars','Four bars ending with a fill','Dead notes in the rests'];
  const T={
    A16:[{name:'Слэп-октавы',goal:'Главная фигура слэпа: тоника большим пальцем, октава попом.',how:'S — удар большим пальцем, P — поп указательным или средним, x — глухой удар. Тоника внизу, октава через струну.',tip:'Большой палец отскакивает от струны, как палочка от барабана. Не дави.',hf:'Без слэпа: тоника большим или указательным пальцем, октава средним — резко, с отскоком струны.',hp:'Медиатором: тоника вниз, октава вверх, струну между ними глуши левой рукой.'},
         {name:'Slap octaves',goal:'The core slap figure: root with the thumb, octave with a pop.',how:'S is a thumb slap, P a pop with the index or middle finger, x a muted hit. Root below, octave two strings up.',tip:'The thumb bounces off the string like a stick off a drum. Do not press.',hf:'Without slap: root with the thumb or index, octave with the middle finger, sharp, letting the string snap.',hp:'With a pick: root down, octave up, mute the string between with the fretting hand.'}],
    A17:[{name:'Нонаккорды в фанке',goal:'Звук фанка: септаккорды с ноной, 7#9, maj9.',how:'Арпеджио от тоники до ноны и обратно шестнадцатыми. Каждый вариант — свой аккорд: 9, m9, 7#9, maj9, 7sus4.',tip:'Нона — краска сверху. Тоника на сильной доле держит грув.',hf:'Чередуй i–m строго; на нону рука сдвигается, а не тянется.',hp:'Переменный штрих; на смене струны — экономное движение.'},
         {name:'Ninth chords in funk',goal:'The funk sound: sevenths with the ninth, 7#9, maj9.',how:'An arpeggio from the root to the ninth and back in sixteenths. Each variant is its own chord: 9, m9, 7#9, maj9, 7sus4.',tip:'The ninth is colour on top. The root on the downbeat holds the groove.',hf:'Alternate i–m strictly; shift the hand for the ninth, do not stretch.',hp:'Alternate picking; economy motion on string changes.'}],
    A18:[{name:'Пентатоника в фанке',goal:'Минорная пентатоника шестнадцатыми: материал фанковых линий.',how:'Пять нот: тоника, малая терция, кварта, квинта, малая септима. Варианты — разные позиции и ритмические ячейки.',tip:'Линия должна качать. Короткие ноты короче, долгие — до конца.',hf:'Позиция в четыре лада, палец на лад. Пауза — палец ложится на струну.',hp:'Переменный штрих; на паузах ладонь глушит струны.'},
         {name:'Pentatonic funk lines',goal:'The minor pentatonic in sixteenths: the material of funk lines.',how:'Five notes: root, minor third, fourth, fifth, flat seventh. Variants are different positions and rhythm cells.',tip:'The line has to groove. Short notes shorter, long ones to full length.',hf:'A four-fret position, one finger per fret. On a rest the finger lands on the string.',hp:'Alternate picking; on rests the palm mutes the strings.'}],
    A19:[{name:'Дорийский лад',goal:'Минор с большой секстой: лад минорного фанка.',how:'Тоника, секунда, малая терция, кварта, квинта, большая секста, малая септима. Гамма, терции, вампы на сексте.',tip:'Большая секста — то, что отличает дорийский. Дай ей прозвучать.',hf:'Палец на лад, на шестой и седьмой ступени — следующая струна, без растяжки.',hp:'Терции — переменный штрих, не подстраивай его под струны.'},
         {name:'Dorian mode',goal:'Minor with a major sixth: the mode of minor funk.',how:'Root, second, minor third, fourth, fifth, major sixth, flat seventh. Scale, thirds, vamps on the sixth.',tip:'The major sixth is what makes it Dorian. Let it sound.',hf:'One finger per fret; the sixth and seventh are on the next string, no stretch.',hp:'Thirds: strict alternate picking, do not adapt it to the strings.'}],
    A20:[{name:'Миксолидийский грув',goal:'Линии на доминантсептаккорде: мажор с малой септимой.',how:'Тоника, терция, квинта, секста, септима, октава — в рисунках шестнадцатыми.',tip:'Секста и септима рядом: секста проходит, септима звенит.',hf:'Сдвиг руки — на долгой ноте, не на шестнадцатой.',hp:'Переменный штрих; стаккато — левая рука отпускает сразу после удара.'},
         {name:'Mixolydian groove',goal:'Lines over a dominant seventh: major with a flat seventh.',how:'Root, third, fifth, sixth, seventh, octave in sixteenth-note patterns.',tip:'Sixth and seventh are neighbours: the sixth passes, the seventh rings.',hf:'Shift the hand on a long note, not on a sixteenth.',hp:'Alternate picking; for staccato the fretting hand releases right after the hit.'}],
    A21:[{name:'Хаммер после слэпа',goal:'Слэп и хаммер: вторая нота звучит от левой руки.',how:'S — удар большим пальцем, h — хаммер. Бьёшь только первую ноту, вторая — пальцем левой руки на ритм. Между ними — поп октавы.',tip:'Хаммер в долю, а не «когда получится». Он такой же громкий, как удар.',hf:'Без слэпа: щипок пальцем, хаммер так же.',hp:'Медиатор — удар вниз, хаммер левой рукой; поп — штрих вверх.'},
         {name:'Hammer after a slap',goal:'Slap and hammer-on: the second note comes from the fretting hand.',how:'S is a thumb slap, h a hammer-on. Strike only the first note; the second is the fretting finger, in time. A popped octave between.',tip:'The hammer lands on the grid, not whenever. It is as loud as the slap.',hf:'Without slap: pluck with a finger, hammer the same way.',hp:'Pick downstroke, hammer with the fretting hand; the pop becomes an upstroke.'}],
    A22:[{name:'Мотаун-линии',goal:'Мелодичный бас 60-х в духе Джеймса Джеймерсона: секста, подходы, затакты.',how:'Тоника, квинта, секста, октава, проходящие и хроматические ноты, затакты шестнадцатыми.',tip:'Линия поёт, но не мешает вокалу. Играй мягче, чем хочется.',hf:'Обычно — один палец (указательный), как у Джеймерсона. Для скорости — i–m.',hp:'Медиатор у грифа, приглушить ребром ладони — звук старого соула.'},
         {name:'Motown lines',goal:'The melodic sixties bass in the spirit of James Jamerson: sixths, approaches, pickups.',how:'Root, fifth, sixth, octave, passing and chromatic notes, sixteenth-note pickups.',tip:'The line sings but stays out of the singer’s way. Play softer than you want to.',hf:'Classically one finger (the index), as Jamerson did. For speed, i–m.',hp:'Pick near the neck, muted with the edge of the palm: the old soul sound.'}],
    A23:[{name:'Хроматические подходы',goal:'Приход на ноту аккорда полутоном снизу, сверху или окружением.',how:'Подход — нота в полутоне от цели, сразу перед ней. Окружение: сверху, снизу, цель.',tip:'Подход работает, только если цель точно в долю.',hf:'Подход — свободным пальцем рядом с целью, рука не прыгает.',hp:'Подход и цель — разными направлениями штриха.'},
         {name:'Chromatic approaches',goal:'Landing on a chord tone from a half step below, above, or by enclosure.',how:'An approach is a note a half step from the target, right before it. Enclosure: above, below, target.',tip:'An approach only works if the target lands exactly on the beat.',hf:'Play the approach with a free finger next to the target; the hand does not jump.',hp:'Approach and target on opposite pick directions.'}],
    A37:[{name:'Синкопы',goal:'Ноты между долями: грув, который тянет вперёд.',how:'Минорный септаккорд на «и», со второй шестнадцатой, пунктиром по три. Метроном — на долю, ты — между.',tip:'Считай шестнадцатые вслух: «раз-и-и-а». Нота на «и» — не раньше.',hf:'На паузе пальцы лежат на струнах — синкопа без гула.',hp:'Рука ходит шестнадцатыми и на паузах — по воздуху; нота на нужном штрихе.'},
         {name:'Syncopation',goal:'Notes between the beats: a groove that pulls forward.',how:'A minor seventh on the off-beats, from the second sixteenth, dotted in threes. The metronome on the beat, you between.',tip:'Count sixteenths aloud: “one-e-and-a”. The note on “and”, never early.',hf:'During rests the fingers rest on the strings: syncopation without boom.',hp:'The picking hand moves in sixteenths through the rests too, in the air; the note falls on its stroke.'}],
    L24:[{name:'Мёртвые ноты пальцами',goal:'Глухие шестнадцатые между нотами: перкуссия фанкового баса.',how:'x — палец лежит на струне без нажима. Ритм непрерывный: нота или глухая на каждой шестнадцатой.',tip:'Мёртвая нота тише настоящей. Если громче — грув разваливается.',hf:'Правая рука не останавливается: i–m на каждую шестнадцатую.',hp:'Медиатор ходит вниз-вверх без остановки, левая рука решает, где звук.'},
         {name:'Fingerstyle dead notes',goal:'Muted sixteenths between the notes: the percussion of funk bass.',how:'x: the finger rests on the string without pressing. Continuous rhythm: a note or a dead note on every sixteenth.',tip:'A dead note is quieter than a real one. If it is louder, the groove falls apart.',hf:'The plucking hand never stops: i–m on every sixteenth.',hp:'The pick goes down-up nonstop; the fretting hand decides where the sound is.'}],
    L25:[{name:'Одна нота — много ритма',goal:'Весь грув на одной ноте: ритм вместо мелодии.',how:'Только тоника (и её октава) и мёртвые ноты. Варианты — разные ритмические рисунки.',tip:'Запиши себя: на одной ноте слышна каждая неровность.',hf:'Чередование i–m не ломай, даже если нота одна.',hp:'Штрих по сетке шестнадцатых: вниз на долю, вверх между.'},
         {name:'One note, lots of rhythm',goal:'A whole groove on one note: rhythm instead of melody.',how:'Only the root (and its octave) and dead notes. Variants are different rhythm patterns.',tip:'Record yourself: on a single note every unevenness is heard.',hf:'Keep the i–m alternation, even on one note.',hp:'Pick on the sixteenth grid: down on the beat, up between.'}],
    L26:[{name:'Двойной большой палец',goal:'Большой палец бьёт вниз и обратно вверх: два удара за одно движение.',how:'Удар S вниз по струне, на обратном ходе — вверх по следующей (как медиатором). Между ними — попы.',tip:'Движение из запястья, большой палец — как медиатор. Медленно, пока не ровно.',hf:'Без слэпа: большой палец вниз, указательный вверх — тот же рисунок.',hp:'Медиатором это обычный переменный штрих: вниз на удар, вверх на обратный ход.'},
         {name:'Double thumbing',goal:'The thumb strikes down and back up: two hits per motion.',how:'An S downstroke on one string, then on the way back an upstroke on the next (like a pick). Pops in between.',tip:'Motion from the wrist, the thumb works like a pick. Slowly, until it is even.',hf:'Without slap: thumb down, index up, the same pattern.',hp:'With a pick this is plain alternate picking: down on the hit, up on the return.'}],
    L27:[{name:'Слэп и глухие удары',goal:'Глухой слэп и поп между нотами: перкуссия слэпа.',how:'Sx — удар большим пальцем по заглушённой струне, Px — глухой поп. Левая рука лежит на струнах, не прижимая.',tip:'Глухой удар — щелчок без высоты. Если слышна нота — ослабь левую руку.',hf:'Без слэпа: глухие ноты пальцами, тот же ритм.',hp:'Медиатором: глухие — по заглушённым струнам, штрих не прерывается.'},
         {name:'Slap and muted hits',goal:'Muted slaps and pops between notes: slap percussion.',how:'Sx is a thumb hit on a muted string, Px a muted pop. The fretting hand rests on the strings without pressing.',tip:'A muted hit is a click without pitch. If you hear a note, relax the fretting hand.',hf:'Without slap: fingered dead notes, same rhythm.',hp:'With a pick: dead notes on muted strings, the picking never stops.'}],
    L28:[{name:'Легато в груве',goal:'Хаммеры и пулл-оффы внутри фанковой линии.',how:'h — хаммер, p — пулл-офф. Бьёшь первую ноту, остальные — левой рукой точно в шестнадцатую.',tip:'Легато-нота такая же громкая, как сыгранная. Проверь записью.',hf:'Хаммер — с высоты кончиком; на пулл-оффе палец срывает струну вниз.',hp:'Медиатор пропускает легато-ноты, но рука продолжает ходить.'},
         {name:'Legato in the groove',goal:'Hammer-ons and pull-offs inside a funk line.',how:'h is a hammer-on, p a pull-off. Pluck the first note; the rest come from the fretting hand, exactly on the sixteenth.',tip:'A legato note is as loud as a plucked one. Check with a recording.',hf:'Hammer from a height with the fingertip; on a pull-off the finger snaps the string downward.',hp:'The pick skips the legato notes, but the hand keeps moving.'}],
    L29:[{name:'Смена позиций',goal:'Та же фигура в другом месте грифа: переезд без сбоя ритма.',how:'Первый такт — в одной позиции, второй — та же фигура на другом аккорде или та же фраза ниже по струнам.',tip:'Переезд — на последней ноте такта, не на первой следующего.',hf:'Большой палец за грифом едет вместе с рукой.',hp:'Медиатор не ждёт левую руку: штрих по сетке.'},
         {name:'Position shifts',goal:'The same figure elsewhere on the neck: shifting without losing time.',how:'Bar one in one position, bar two the same figure on another chord, or the same phrase on lower strings.',tip:'Shift on the last note of the bar, not on the first note of the next.',hf:'The thumb behind the neck travels with the hand.',hp:'The pick does not wait for the fretting hand: keep the grid.'}],
    L30:[{name:'Поп через струны',goal:'Слэп внизу, поп через одну-две струны: децимы и октавы.',how:'Тоника слэпом, поп — октава, малая или большая децима, квинта над октавой. Струны между — заглушены.',tip:'Поп — указательным или средним, палец зацепляет струну и отпускает.',hf:'Без слэпа: большой палец на тонике, i и m на верхних — как арпеджио.',hp:'Медиатор со скачками через струны; лишние струны глушит левая рука.'},
         {name:'Pops across strings',goal:'Slap below, pop one or two strings up: tenths and octaves.',how:'Root slapped; the pop is the octave, a minor or major tenth, the fifth above the octave. Strings between are muted.',tip:'Pop with the index or middle: hook the string and let go.',hf:'Without slap: thumb on the root, i and m on top, like an arpeggio.',hp:'Pick with string skips; the fretting hand mutes the strings you skip.'}],
    L31:[{name:'Октавный рисунок',goal:'Тоника–октава шестнадцатыми: растяжка и точность левой руки.',how:'Тоника и октава через струну, между ними — квинта, септима или глухая нота.',tip:'Струна между тоникой и октавой молчит: глуши её пальцем.',hf:'Указательный на тонике, мизинец или безымянный на октаве. Правая — i–m непрерывно.',hp:'Тоника вниз, октава вверх; через струну — без лишнего хода руки.'},
         {name:'Octave patterns',goal:'Root and octave in sixteenths: fretting-hand stretch and accuracy.',how:'Root and octave two strings apart, with the fifth, seventh or a dead note between.',tip:'The string between root and octave stays silent: mute it with a finger.',hf:'Index on the root, pinky or ring on the octave. Plucking hand: i–m nonstop.',hp:'Root down, octave up; skip the string without extra hand motion.'}],
    L38:[{name:'Филлы шестнадцатыми',goal:'Грув и филл в конце такта, возврат на «раз» без сбоя.',how:'Полтакта грува, в конце — четыре или больше шестнадцатых по пентатонике к следующей тонике.',tip:'Филл кончается на сильной доле следующего такта. Слушай именно туда.',hf:'В филле не меняй чередование пальцев.',hp:'Филл — переменным штрихом, первая нота — вниз.'},
         {name:'Sixteenth-note fills',goal:'Groove plus a fill at the end of the bar, back on one without a stumble.',how:'Half a bar of groove, then four or more sixteenths on the pentatonic toward the next root.',tip:'The fill ends on the next downbeat. Listen right there.',hf:'Do not break the finger alternation in the fill.',hp:'Fill in alternate picking, first note down.'}],
    C32:[{name:'Грув в карман',goal:'Один такт по кругу: держать грув ровно и долго.',how:'Короткий рисунок повторяется. Варианты — разные стили грува: октава на третью долю, полутемп, стаккато.',tip:'Карман — это не скорость. Играй чуть позади метронома, но не отставай.',hf:'Мягкий щипок, глушение пальцами — грув в длине нот.',hp:'Медиатор с приглушением ладонью, атака одинаковая.'},
         {name:'In the pocket',goal:'One bar on repeat: holding a groove steady and long.',how:'A short pattern repeats. Variants are different groove styles: octave on three, half-time, staccato.',tip:'The pocket is not speed. Sit slightly behind the click, but do not drag.',hf:'Soft pluck, finger muting: the groove is in the note lengths.',hp:'Pick with palm muting, an even attack.'}],
    C33:[{name:'Брейки',goal:'Удары с тишиной и точный вход в грув после брейка.',how:'Такт брейка: несколько ударов, остальное — тишина. Потом такт грува.',tip:'Тишина — часть ритма. Считай каждую шестнадцатую паузы.',hf:'Глуши струну сразу после удара пальцем, которым играл.',hp:'После удара — ладонь на струны.'},
         {name:'Breaks',goal:'Hits with silence, then an exact entry into the groove.',how:'A break bar: a few hits, the rest silence. Then a bar of groove.',tip:'Silence is part of the rhythm. Count every sixteenth of the rest.',hf:'Mute the string right after the hit with the plucking finger.',hp:'After the hit, the palm goes on the strings.'}],
    C34:[{name:'Свинговые шестнадцатые',goal:'Шестнадцатые с качем: долгая–короткая, как в нью-орлеанском фанке.',how:'Пара шестнадцатых — две трети и треть доли (в табе триоли). Метроном на долю.',tip:'Не превращай свинг в пунктир. Короткая нота мягче долгой.',hf:'Долгая — m, короткая — i, мягко.',hp:'Долгая вниз, короткая вверх, рука качается.'},
         {name:'Swung sixteenths',goal:'Sixteenths with a lilt: long–short, as in New Orleans funk.',how:'A pair of sixteenths is two thirds and one third of a half beat (triplets in the tab). Metronome on the beat.',tip:'Do not turn swing into a dotted rhythm. The short note is softer than the long one.',hf:'Long on m, short on i, gently.',hp:'Long down, short up; the hand swings.'}],
    C35:[{name:'Вызов и ответ',goal:'Фраза слэпом и ответ пальцами: два тембра в одном грув.',how:'Первый такт — вызов слэпом, во втором полтакта тишины и ответ пальцами.',tip:'Ответ продолжает фразу. Спой обе части, прежде чем играть.',hf:'Без слэпа: вызов — резко, с отскоком струны; ответ — мягко.',hp:'Вызов — медиатором у бриджа, ответ — ближе к грифу.'},
         {name:'Call and response',goal:'A slap phrase and a fingered answer: two tones in one groove.',how:'Bar one is the slap call; bar two has half a bar of silence and a fingered answer.',tip:'The answer continues the phrase. Sing both parts before playing.',hf:'Without slap: the call sharp with the string snapping, the answer soft.',hp:'Call with the pick near the bridge, answer nearer the neck.'}],
    C36:[{name:'Фанковый этюд',goal:'Четыре фанковые фигуры подряд, пальцами и слэпом.',how:'Четыре фрагмента подряд. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон. Слабое место — почти всегда стык фрагментов и смена техники.',hf:'На стыке со слэпа на пальцы рука переезжает за долю до смены.',hp:'Слэп-фрагменты медиатором: удар вниз вместо S, вверх вместо P.'},
         {name:'Funk étude',goal:'Four funk figures in a row, fingerstyle and slap.',how:'Four fragments in a row. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a run. The weak spot is almost always a joint and a change of technique.',hf:'At a joint from slap to fingers, move the hand a beat before the change.',hp:'Slap fragments with a pick: downstroke for S, upstroke for P.'}]
  };
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{
    const [ru,en]=T[id],n=+id.slice(1);
    if(id==='C36'){
      const nm=k=>ETU[k].map(x=>T[x][0].name.toLowerCase()).join(', '),ne=k=>ETU[k].map(x=>T[x][1].name.toLowerCase()).join(', ');
      EX[id]=Object.assign({n},ru,{sub:4,lvl:LVL_RU,v:ETU.map((f,k)=>BV('Этюд '+(k+1)+': '+nm(k),[0,1,2,3,4].map(i=>f.map(x=>lvBars(x,k)[i].map(b=>out(b)).join(' | '))),undefined))});
      EXEN[id]=Object.assign({},en,{lvl:LVL_EN,v:ETU.map((f,k)=>'Étude '+(k+1)+': '+ne(k))});
      return;}
    const e=D[id],stop=id==='C33';
    const lr=stop?['Брейк','Брейк и такт грува','Три такта брейка и грув','Брейк и грув с филлом','Брейк через такт, мёртвые ноты в груве']:LVL_RU;
    const le=stop?['The break','Break and a groove bar','Three break bars and the groove','Break and groove with a fill','Break every other bar, dead notes in the groove']:LVL_EN;
    EX[id]=Object.assign({n},ru,{sub:e.sw?6:4,lvl:lr,v:e.v.map((v,k)=>BV(v[1],lvBars(id,k).map(bs=>e.sw?{t:sysOf(bs,1),sub:6}:sysOf(bs)),undefined))});
    EXEN[id]=Object.assign({},en,{lvl:le,v:e.v.map(v=>v[2])});
  });
  return {EX,EXEN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@FKB2_END@*/

// ----- FSA1: фингерстайл, акустика, часть 1 -----
const FSA1=(function(){
  // сетка такта: N шагов, события [позиция, токен]; совпавшие позиции сливаются в аккорд, пустые шаги продлевают ноту.
  // Часть с «m» на конце (глухой бас) делает глухим весь столбец.
  const strOf=t=>t.split('+').map(p=>p[0]);
  const merge=(a,b)=>{if(a==='.')return b;if(b==='.')return a;const s=strOf(a);const add=b.split('+').filter(p=>!s.includes(p[0]));return add.length?a+'+'+add.join('+'):a;};
  const fin=x=>{if(x==='.')return x;const ps=x.split('+');return ps.some(p=>/m$/.test(p))?ps.map(p=>p.replace(/m$/,'')).join('+')+'m':x;};
  const bar=(N,ev)=>{const g=Array(N).fill(null);ev.forEach(([i,t])=>{if(t)g[i]=g[i]==null?t:merge(g[i],t);});
    const out=[];let cur=null,len=0;const fl=()=>{if(cur!=null){const c=fin(cur);out.push(len>1?c+':'+len:c);}};
    g.forEach(x=>{if(x==null){if(cur==null){cur='.';len=1;}else len++;}else{fl();cur=x;len=1;}});fl();return out.join(' ');};
  const sys=bs=>bs.join(' | ');
  const fr=t=>+t.replace(/^[A-Za-z][hp]?/,'').replace(/[^\d].*$/,'');
  const hm=t=>t[0]+'h'+t.slice(1), pl=t=>t[0]+'p'+t.slice(1);
  // аккорд: r — бас (тоника), a — второй бас, x — третий бас (по умолчанию r), g/b/e — три верхние струны
  const C=(r,a,x,g,b,e)=>({r,a,x:x||r,g,b,e});
  // шесть материалов: тональность + строй; варианты идут через них, у каждого своя аппликатура
  const CTX=[
    {ru:'{C}, стандартный строй',en:'{C}, standard tuning',
      I:C('A3','D2','E3','G0','B1','e0'),IV:C('E1','D3','A3','G2','B1','e1'),V:C('E3','D0','A2','G0','B0','e3'),vi:C('A0','D2','E0','G2','B1','e0'),
      hi:['G0','G2','B1','B3','e0','e3']},
    {ru:'{D}, DADGAD',en:'{D}, DADGAD',tun:'dadgad',
      I:C('E0','D0','A0','G2','B0','e0'),IV:C('E5','D5','A5','G0','B2','e0'),V:C('A0','D2','E7','G2','B4','e2'),vi:C('A2','D4','','G4','B5','e4'),
      hi:['G2','G4','B0','B2','e0','e2']},
    {ru:'{E}m, стандартный строй',en:'{E}m, standard tuning',
      I:C('E0','D2','A2','G0','B0','e0'),IV:C('A0','D2','E0','G2','B1','e0'),V:C('A2','D1','E2','G2','B0','e2'),vi:C('A3','D2','E3','G0','B1','e0'),
      hi:['G0','G2','B0','B3','e0','e3']},
    {ru:'{G}, строй DGDGBD',en:'{G}, DGDGBD tuning',tun:'openg',
      I:C('A0','D0','E0','G0','B0','e0'),IV:C('A5','D5','E5','G5','B5','e5'),V:C('A7','D7','E7','G7','B7','e7'),vi:C('E2','D2','A0','G0','B0','e2'),
      hi:['G0','G2','B0','B3','e0','e2']},
    {ru:'{D}, Drop D',en:'{D}, drop-D tuning',tun:'dropd',
      I:C('E0','D0','A0','G2','B3','e2'),IV:C('E5','D5','A5','G4','B3','e3'),V:C('A0','D2','E7','G2','B2','e0'),vi:C('A2','D4','','G4','B3','e2'),
      hi:['G2','G4','B3','B5','e2','e5']},
    {ru:'{D}, строй DADF#AD',en:'{D}, DADF#AD tuning',tun:'opend',
      I:C('E0','D0','A0','G0','B0','e0'),IV:C('E5','D5','A5','G5','B5','e5'),V:C('E7','D7','A7','G7','B7','e7'),vi:C('A2','D4','','G5','B5','e4'),
      hi:['G0','G3','B0','B2','e0','e2']}
  ];
  // символы фигуры: r a x g b e — струны аккорда; F — аккорд, T — три верхние, P — бас+первая (щипок);
  // M/A — глухой бас (ладонь); 0–5 — мелодия (hi), H J K — хаммер на hi1/hi3/hi5, p q w — пулл-офф на hi0/hi2/hi4;
  // D — открытая первая струна (бурдон); X — удар большим пальцем по басовым струнам, Z — щелчок пальцами по верхним (мёртвые ноты);
  // N — флажолеты 12-го лада, n — 7-го, v — 5-го; u i o — флажолет 12-го на одной струне, U I O — 7-го; '.' — пауза, '-' — ничего
  const tok=(K,c,ch)=>{
    if('rabxge'.includes(ch))return c[ch];
    if(ch>='0'&&ch<='5')return K.hi[+ch];
    return ({F:[c.r,c.g,c.b,c.e].join('+'),T:[c.g,c.b,c.e].join('+'),P:c.r+'+'+c.e,M:c.r+'m',A:c.a+'m',
      H:hm(K.hi[1]),J:hm(K.hi[3]),K:hm(K.hi[5]),p:pl(K.hi[0]),q:pl(K.hi[2]),w:pl(K.hi[4]),D:'e0',
      X:'Ax+Dx',Z:'Gx+Bx+ex',N:'G12*+B12*+e12*',n:'G7*+B7*+e7*',v:'G5*+B5*+e5*',
      u:'G12*',i:'B12*',o:'e12*',U:'G7*',I:'B7*',O:'e7*','.':'.'})[ch]||null;};
  const pat=(K,c,s)=>{const o=[];[...s].forEach((ch,i)=>{const t=tok(K,c,ch);if(t)o.push([i,t]);});return o;};
  // ход в басу к тонике t: n нот снизу по той же струне (или сверху, если ладов не хватает)
  const walk=(t,n)=>{const s=t[0],f=fr(t),o=[];if(f>=n)for(let k=n;k>=1;k--)o.push(s+(f-k));else for(let k=n;k>=1;k--)o.push(s+(f+k));return o;};

  // строители уровней: (K, f) → 5 табов; f — номер варианта, фигура f%2
  const LV={
    B1:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),TH='r-r-r-r-';
      return f%2===0?[
        sys([b(I,TH),b(I,TH)]),
        sys([b(I,TH,'e---e---'),b(IV,TH,'e---e---')]),
        sys([b(I,TH,'-g-b-e-b'),b(IV,TH,'-g-b-e-b')]),
        sys([b(I,TH,'-2-J-4-2'),b(I,TH,'-0-H-2-0')]),
        sys([b(I,TH,'-2-J-4-2'),b(IV,TH,'-e-b-g-b'),b(I,TH,'-4-3-2-0'),b(V,TH,'-e-b-g-b')])
      ]:[
        sys([b(I,TH),b(vi,TH)]),
        sys([b(I,TH,'e-----b-'),b(vi,TH,'e-----b-')]),
        sys([b(I,TH,'e--b--g-'),b(vi,TH,'e--b--g-')]),
        sys([b(I,TH,'4--3--2-'),b(vi,TH,'2--1--0-')]),
        sys([b(I,TH,'4--3--2-'),b(IV,TH,'e--b--g-'),b(vi,TH,'2--1--0-'),b(V,TH,'e--b--g-')])
      ];},
    B2:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),TR='r-a-x-a-';
      const m=f%2===0?'-e-g-b-g':'e--b--g-';
      const pr=f%2===0?[I,IV,V,I]:[I,vi,IV,V];
      return [
        sys([b(I,TR),b(IV,TR)]),
        sys([b(I,TR,'e-------'),b(IV,TR,'e-------')]),
        sys([b(I,TR,m),b(IV,TR,m)]),
        sys(pr.map(c=>b(c,TR,m))),
        f%2===0?sys([b(I,TR,'2--J-4-2'),b(IV,TR,'-e-g-b-g'),b(V,TR,'4-3--2-0'),b(I,TR,'e-------')])
          :sys([b(I,TR,'4--3--2-'),b(vi,TR,'e--b--g-'),b(IV,TR,'2--1--0-'),b(V,TR,'e--b-ge-')])
      ];},
    B3:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),b12=(c,...s)=>bar(12,[].concat(...s.map(x=>pat(K,c,x))));
      const p1=f%2===0?'rgbexgbe':'rebgxebg',p2=f%2===0?'rgbebgag':'rebgaebg',p3=f%2===0?'rgbebgxgbebg':'rebgbexebgbe';
      return [
        sys([b(I,p1),b(IV,p1)]),
        sys([b(I,p2),b(IV,p2)]),
        sys([I,vi,IV,V].map(c=>b(c,p1,'e-------'))),
        '/3 '+sys([b12(I,p3),b12(IV,p3)]),
        '/3 '+sys([I,vi,IV,V].map(c=>b12(c,p3)))
      ];},
    B4:(K,f)=>{const{I,IV,V}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),TH='r-r-r-r-',TR='r-a-x-a-';
      return f%2===0?[
        sys([b(I,'0Hp-0Hp-'),b(I,'2Jq-2Jq-')]),
        sys([b(I,TH,'0Hp-0Hp-'),b(I,TH,'2Jq-2Jq-')]),
        sys([b(I,'5w3q1p--'),b(I,'0H2J4Kw-')]),
        sys([b(I,TH,'5w3q1p--'),b(I,TH,'0H2J4Kw-')]),
        sys([b(I,TH,'5w3q1p--'),b(IV,TH,'0H2J4K--'),b(I,TH,'-4-3-2-0'),b(V,TH,'T---T---')])
      ]:[
        sys([b(I,'0Hp-0Hp-','---D---D'),b(I,'2Jq-2Jq-','---D---D')]),
        sys([b(I,TR,'0Hp-0Hp-','---D---D'),b(I,TR,'2Jq-2Jq-','---D---D')]),
        sys([b(I,'0Hp-2JqD'),b(I,'2Jq-0HpD')]),
        sys([b(I,TR,'0Hp-2JqD'),b(IV,TR,'2Jq-0HpD')]),
        sys([b(I,TR,'0Hp-2JqD'),b(IV,TR,'2Jq-0HpD'),b(V,TR,'0Hp-2JqD'),b(I,TR,'P-------')])
      ];},
    B5:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),MT=f%2===0?'M-M-M-M-':'M-A-M-A-';
      const m1=f%2===0?'-e---e--':'-e---b-g';
      return [
        sys([b(I,MT),b(IV,MT)]),
        sys([b(I,MT,m1),b(IV,MT,m1)]),
        sys([b(I,MT,'-g-b-e-b'),b(IV,MT,'-g-b-e-b')]),
        sys([b(I,MT,'-2-J-4-2'),b(vi,MT,'-0-H-2-0')]),
        sys([b(I,MT,'-2-J-4-2'),b(vi,MT,'-0-H-2-0'),b(IV,MT,'-e-b-g-b'),b(V,MT,'-4-3-2-0')])
      ];},
    R6:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),TR='r-a-x-a-';
      const e=f%2===0;
      return [
        sys([b(I,TR,e?'-------e':'---e----'),b(IV,TR,e?'-------e':'---e----')]),
        sys([b(I,TR,e?'-b-----e':'-b-e----'),b(IV,TR,e?'-b-----e':'-b-e----')]),
        sys([b(I,TR,e?'-b-g-b-e':'-b-e--g-'),b(IV,TR,e?'-b-g-b-e':'-b-e--g-')]),
        sys([b(I,TR,e?'-2-J-2-5':'-4-K--2-'),b(IV,TR,e?'-b-g-b-e':'-b-e--g-'),b(I,TR,e?'-2-J-2-5':'-4-K--2-'),b(V,TR,e?'-b-g-b-e':'-b-e--g-')]),
        sys([b(I,TR,e?'-2-J-4-5':'-4-K--2-'),b(vi,TR,e?'-b-g-b-e':'-b-e--g-'),b(IV,TR,e?'-4-3-2-1':'-2-J--0-'),b(V,TR,'-g-b-e-T')])
      ];},
    R7:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(6,[].concat(...s.map(x=>pat(K,c,x))));
      return f%2===0?[
        sys([b(I,'r-T-T-'),b(IV,'r-T-T-')]),
        sys([b(I,'r-T-T-'),b(I,'a-T-T-'),b(IV,'r-T-T-'),b(IV,'a-T-T-')]),
        sys([b(I,'r-T-T-','4-----'),b(I,'a-T-T-','2-----'),b(IV,'r-T-T-','e-----'),b(IV,'a-T-T-','g-----')]),
        sys([b(I,'r-T-T-','4----3'),b(I,'a-T-T-','2----0'),b(V,'r-T-T-','e----b'),b(I,'r-T-T-','g-----')]),
        sys([b(I,'r-T-T-','4-3-2-'),b(vi,'r-T-T-','2-1-0-'),b(IV,'r-T-a-','e--b--'),b(V,'r-T-T-','g-----')])
      ]:[
        sys([b(I,'rgbebg'),b(IV,'rgbebg')]),
        sys([b(I,'rgbebg'),b(I,'agbebg'),b(IV,'rgbebg'),b(IV,'agbebg')]),
        sys([I,vi,IV,V].map(c=>b(c,'rgbebg'))),
        sys([b(I,'Pgbebg'),b(vi,'Pgbebg'),b(IV,'Pgbebg'),b(V,'Pgbebg')]),
        sys([b(I,'rgb-bg','---4--'),b(vi,'rgb-bg','---2--'),b(IV,'rgb-bg','---e--'),b(V,'rgbeT-')])
      ];},
    R8:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(12,[].concat(...s.map(x=>pat(K,c,x))));
      const tp=f%2===0?'-gb-gb-gb-gb':'-eb-eb-eb-eb',TQ='r--r--r--r--',TR='r--a--x--a--';
      const ml=f%2===0?'-g4-g2-g3-g0':'-b5-b4-b2-b0';
      return [
        sys([b(I,TQ,tp),b(IV,TQ,tp)]),
        sys([b(I,TR,tp),b(IV,TR,tp)]),
        sys([I,vi,IV,V].map(c=>b(c,TR,tp))),
        sys([b(I,TR,ml),b(IV,TR,tp),b(I,TR,ml),b(V,TR,tp)]),
        sys([b(I,TR,ml),b(vi,TR,tp),b(IV,TR,ml),b(V,TR,'-gb-gb-gbT--')])
      ];},
    R9:(K,f)=>{const{I,IV,V,vi}=K,S=f%2===0?'Z':'X',SN='--'+S+'---'+S+'-',b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x))));
      // при ударе большим пальцем (X) по басовым струнам бас звучит на 1 и 3
      return [
        sys([b(I,'r---r---',SN),b(IV,'r---r---',SN)]),
        sys([b(I,'r---a---',SN,'-e---e--'),b(IV,'r---a---',SN,'-e---e--')]),
        sys([b(I,'r---a---',SN,'-b-g-e-b'),b(IV,'r---a---',SN,'-b-g-e-b')]),
        sys([b(I,'r---a---',SN,'-2-J-4-2'),b(vi,'r---a---',SN,'-0-H-2-0')]),
        sys([b(I,'r---a---',SN,'-2-J-4-2'),b(vi,'r---a---',SN,'-0-H-2-0'),b(IV,'r---a---','--'+S+'--'+S+S+'-','-b-g----'),b(V,'r---a---',SN,'-4-3-2-0')])
      ];},
    R10:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(6,[].concat(...s.map(x=>pat(K,c,x)))),BS=f%2===0?'r--a--':'r--D--';
      const m1=f%2===0?'-23-21':'-gb-gb',m2=f%2===0?'-10-2-':'-eb-eg';
      return [
        sys([b(I,BS,'-gb-gb'),b(IV,BS,'-gb-gb')]),
        sys([b(I,BS,m1),b(IV,BS,m2)]),
        sys([b(I,BS,m1),b(IV,BS,m2),b(I,BS,m1),b(V,BS,'-gb-gb')]),
        sys([b(I,BS,'4K2J10'),b(IV,BS,'0H2J4-'),b(I,BS,'4K2J10'),b(V,BS,'-gb-gb')]),
        sys([b(I,BS,'4K2J10'),b(vi,BS,'0H2J4-'),b(IV,BS,'5w3q1p'),b(V,BS,'0H2-T-')])
      ];},
    R11:(K,f)=>{const{I,IV,V,vi}=K,b=ev=>bar(8,ev),P=(c,s)=>pat(K,c,s);
      const pr=f%2===0?[[I,IV],[IV,I],[I,V],[V,I]]:[[I,vi],[vi,IV],[IV,V],[V,I]];
      const w1=(c,n)=>P(c,'r-a-r---').concat([[6,walk(n.r,1)[0]]]);
      const w2=(c,n)=>{const w=walk(n.r,2);return P(c,'r-a-----').concat([[4,w[0]],[6,w[1]]]);};
      const w3=(c,n)=>{const w=walk(n.r,3);return P(c,'r-a-r---').concat([[5,w[0]],[6,w[1]],[7,w[2]]]);};
      const [p0,p1]=pr;
      return [
        sys([b(w1(...p0)),b(w1(...p1))]),
        sys([b(w1(...p0).concat(P(p0[0],'e-------'))),b(w1(...p1).concat(P(p1[0],'e-------')))]),
        sys([b(w1(...p0).concat(P(p0[0],'e--b-e--'))),b(w1(...p1).concat(P(p1[0],'e--b-e--')))]),
        sys(pr.map(([c,n])=>b(w2(c,n).concat(P(c,'eg-b-e--'))))),
        sys(pr.map(([c,n])=>b(w3(c,n).concat(P(c,'eg-b----')))))
      ];},
    R12:(K,f)=>{const{I,IV,V,vi}=K,TR='r-a-x-a-',P=(c,s)=>pat(K,c,s);
      const bb=(...l)=>bar(8,[].concat(...l.map(([c,s])=>P(c,s))));
      const e=f%2===0;
      // «толчок»: следующий аккорд вступает раньше такта, на последнюю восьмую
      const pu=(c,n,m)=>bb([c,'r-a-x-a-'],[c,m||'e-b-----'],[n,'-------P']);
      const pr=e?[I,IV,V,I]:[I,vi,IV,V];
      return [
        sys([bb([I,TR],[I,'e-------']),bb([IV,TR],[IV,'e-------'])]),
        sys([pu(I,IV),bb([IV,'g-a-x-a-'],[IV,'---b----'])]),
        sys([pu(I,IV),bb([IV,'g-a-x-a-'],[IV,'---b-g--'],[I,'-------P']),bb([I,'g-a-x-a-'],[I,'---b----'])]),
        sys([pu(pr[0],pr[1]),bb([pr[1],'g-a-x-a-'],[pr[1],e?'---b-g--':'-g-b----'],[pr[2],'-------P']),bb([pr[2],'g-a-x-a-'],[pr[2],e?'---b-g--':'-g-b----'],[pr[3],'-------P']),bb([pr[3],'g-a-x-a-'],[pr[3],'-g-b-e--'])]),
        sys([pu(pr[0],pr[1],e?'2--J----':'4--3----'),bb([pr[1],'g-a-x-a-'],[pr[1],e?'-4-2----':'-2-1----'],[pr[2],'-------P']),bb([pr[2],'g-a-x-a-'],[pr[2],e?'-0-H----':'-0---e--'],[pr[3],'-------P']),bb([pr[3],'g----a-a'],[pr[3],'-g-b----'])])
      ];},
    R13:(K,f)=>{const{I,IV,V}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x)))),TR='r-a-x-a-';
      const e=f%2===0,N=e?'N':'n',s1=e?'-u-i-o-i':'-U-I-O-I',s2=e?'-o-i-u-i':'-O-I-U-I';
      return [
        sys([b(I,'r---r---',N+'-------'),b(I,'r---r---',N+'-------')]),
        sys([b(I,'r-a-r-a-',N+'---'+N+'---'),b(IV,'r-a-r-a-','T---T---')]),
        sys([b(I,TR,s1),b(I,TR,s2)]),
        sys([b(I,TR,s1),b(IV,TR,'-g-b-e-b'),b(I,TR,s2),b(V,TR,'-g-b-e-b')]),
        sys([b(I,TR,'v---'+N+'---'),b(IV,TR,'-2-J-4-2'),b(I,TR,s2),b(V,TR,'-4-3-'+N+'--')])
      ];},
    R14:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x))));
      const e=f%2===0,R=e?'rgeagexe':'ebrebaeb';
      const m1=e?'4ga2Jgxg':'4br2Jbab',m2=e?'0Hga2gxg':'0Hra2bab';
      return [
        sys([b(I,R),b(I,R)]),
        sys([b(I,R),b(IV,R)]),
        sys([I,vi,IV,V].map(c=>b(c,R))),
        sys([b(I,m1),b(IV,R),b(I,m2),b(V,R)]),
        sys([b(I,m1),b(vi,m2),b(IV,m1),b(V,e?'rgeagT--':'ebreT---')])
      ];},
    R15:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(8,[].concat(...s.map(x=>pat(K,c,x))));
      const e=f%2===0,t=e?'D':'r',u=e?'D':'a';
      const q=(m1,m2)=>m1+'-T'+t+m2+'-T'+u;
      return [
        sys([b(I,'r-T-r-T-'),b(IV,'r-T-r-T-')]),
        sys([b(I,q('r','a')),b(IV,q('r','a'))]),
        sys([b(I,q('g','b')),b(IV,q('b','g')),b(I,q('e','b')),b(V,q('g','b'))]),
        sys([b(I,q('4','2')),b(IV,q('0','2')),b(I,q('3','2')),b(V,q('1','0'))]),
        sys([b(I,'4-T'+t+'2JT'+u),b(vi,q('0','2')),b(IV,'0-T'+t+'0HT'+u),b(V,'1-T'+t+'0-T-')])
      ];},
    R37:(K,f)=>{const{I,IV,V,vi}=K,b=(c,...s)=>bar(12,[].concat(...s.map(x=>pat(K,c,x))));
      const e=f%2===0,TQ='r--r--r--r--',TR='r--a--x--a--',up=e?'e-b-g-e-b-g-':'g-b-e-g-b-e-';
      const ml=e?'4-3-2-4-3-2-':'0-2-4-1-3-5-';
      return [
        sys([b(I,TQ,'e-e-e-e-e-e-'),b(IV,TQ,'e-e-e-e-e-e-')]),
        sys([b(I,TR,up),b(IV,TR,up)]),
        sys([I,vi,IV,V].map(c=>b(c,TR,up))),
        sys([b(I,TR,ml),b(IV,TR,up),b(I,TR,ml),b(V,TR,up)]),
        sys([b(I,TR,ml),b(vi,TR,up),b(IV,TR,e?'2-1-0-2-1-0-':'5-3-1-4-2-0-'),b(V,TR,'T-----T-----')])
      ];}
  };

  // тексты: фигуры двух видов (f%2) × материал (CTX). sub — деление, meter — размер.
  const T={
    B1:{sub:2,fig:[['Мелодия между долями','Melody between the beats'],['Мелодия на долю и с синкопой','Melody on and off the beat']],
      ru:{name:'Монотонный бас',goal:'Независимость большого пальца: бас как часы под любой мелодией.',how:'Большой палец (p) бьёт тонику четвертями и не останавливается. Пальцы i, m, a играют верхние струны: в одних вариантах между долями, в других вместе с басом и с синкопой. В открытых строях тоника — на открытой струне.',tip:'Поставь бас на автомат: считай вслух. Сбивается бас — убери мелодию и сбавь темп, мелодия подождёт.',lvl:['Только большой палец','Щипок','Ноты аккорда сверху','Мелодия с хаммером','Четыре такта, смена аккордов']},
      en:{name:'Steady thumb',goal:'Thumb independence: a clockwork bass under any melody.',how:'The thumb (p) plays the root in quarter notes and never stops. Fingers i, m and a play the top strings: between the beats in some variants, with the bass and syncopated in others. In open tunings the root is an open string.',tip:'Put the bass on autopilot: count out loud. If the bass stumbles, drop the melody and the tempo; the melody can wait.',lvl:['Thumb only','Pinch','Chord tones on top','Melody with a hammer-on','Four bars, chord changes']}},
    B2:{sub:2,fig:[['Классический Трэвис','Classic Travis'],['Трэвис с синкопой','Syncopated Travis']],
      ru:{name:'Переменный бас (Трэвис)',goal:'Переменный бас большим пальцем — основа фингерстайла.',how:'Большой палец чередует три баса аккорда на каждую долю: тоника, второй бас, третий бас, второй бас. Пальцы играют верхние струны между долями или с синкопой. Мерл Трэвис, Чет Аткинс, Томми Эммануэль.',tip:'Бас на всех долях одинаково громкий, пальцы подстраиваются под бас. Ребро ладони чуть глушит басовые струны.',lvl:['Только бас','Щипок на первую долю','Полный перебор','Четыре аккорда','Мелодия поверх баса']},
      en:{name:'Alternating bass (Travis)',goal:'An alternating thumb bass, the backbone of fingerstyle.',how:'The thumb rotates through three bass notes of the chord, one per beat: root, second bass, third bass, second bass. The fingers play the top strings between the beats or syncopated. Merle Travis, Chet Atkins, Tommy Emmanuel.',tip:'The bass is equally loud on every beat; the fingers fit around it. The edge of the palm lightly mutes the bass strings.',lvl:['Bass only','Pinch on beat one','Full pattern','Four chords','Melody over the bass']}},
    B3:{sub:2,fig:[['Вверх: p-i-m-a','Upward: p-i-m-a'],['Вниз: p-a-m-i','Downward: p-a-m-i']],
      ru:{name:'Перебор p-i-m-a',goal:'Ровный перебор: каждый палец на своей струне.',how:'Большой палец — басовые струны, i — третья, m — вторая, a — первая. Варианты чередуют направление: вверх от баса или вниз от первой струны. Восьмые, на четвёртом и пятом уровнях — триоли.',tip:'Пальцы двигаются от костяшек, кисть стоит на месте. Аккорд держи целиком, пусть звучит.',lvl:['Два аккорда','С возвратом и вторым басом','Четыре аккорда, щипок','Триоли','Триоли, четыре аккорда']},
      en:{name:'p-i-m-a arpeggios',goal:'Even fingerpicking: each finger on its own string.',how:'The thumb takes the bass strings, i the third string, m the second, a the first. The variants alternate direction: up from the bass or down from the first string. Eighth notes, triplets on levels 4 and 5.',tip:'The fingers move from the knuckles, the hand stays still. Hold the whole chord and let it ring.',lvl:['Two chords','With a turn and a second bass','Four chords, pinch','Triplets','Triplets, four chords']}},
    B4:{sub:2,fig:[['Легато в мелодии','Legato in the melody'],['Легато и открытый бурдон','Legato with an open drone']],
      ru:{name:'Хаммеры и пулл-оффы',goal:'Легато левой рукой поверх баса, как у Джона Ренборна и Берта Дженша.',how:'Нижняя нота щипком, верхняя — хаммером, обратно — пулл-оффом. В вариантах с бурдоном открытая первая струна звучит между фразами. Со второго уровня под легато идёт бас большим пальцем.',tip:'Хаммер — с высоты, точно у ладовой пластины. Пулл-офф — чуть вниз, как щипок левой рукой: нота после него не тише.',lvl:['Одна фигура','Фигура над басом','Вниз и вверх по струнам','Вниз и вверх над басом','Четыре такта']},
      en:{name:'Hammer-ons and pull-offs',goal:'Fretting-hand legato over the bass, in the vein of John Renbourn and Bert Jansch.',how:'Pluck the lower note, hammer on the upper one, pull off back down. In the drone variants the open first string rings between phrases. From level 2 the thumb plays the bass under the legato.',tip:'Hammer from a height, right behind the fret. Pull off slightly downward, like a pluck with the fretting hand: the note after it is no quieter.',lvl:['One figure','Figure over the bass','Down and up the strings','Down and up over the bass','Four bars']}},
    B5:{sub:2,fig:[['Глухой бас четвертями','Muted bass in quarters'],['Глухой переменный бас','Muted alternating bass']],
      ru:{name:'Глухой бас и звонкая мелодия',goal:'Два тембра одной рукой: бас глушит ладонь, мелодия звенит.',how:'Ребро ладони лежит на басовых струнах у подставки, большой палец играет бас глухо (m в табе). Пальцы играют верхние струны свободно. Ладонь не касается трёх верхних струн.',tip:'Слушай контраст: бас — короткий «тук», мелодия — долгая. Если мелодия глохнет, ладонь заехала на верхние струны.',lvl:['Только бас','Нота между долями','Аккорд сверху','Мелодия','Четыре такта']},
      en:{name:'Muted bass, ringing melody',goal:'Two tones from one hand: the palm mutes the bass, the melody rings.',how:'The edge of the palm rests on the bass strings near the bridge; the thumb plays a muted bass (m in the tab). The fingers play the top strings freely. The palm stays off the three top strings.',tip:'Listen for the contrast: the bass a short thud, the melody long. If the melody dies, the palm has crept onto the top strings.',lvl:['Bass only','A note between the beats','Chord on top','Melody','Four bars']}},
    R6:{sub:2,fig:[['Опережение на последнюю восьмую','Push on the last eighth'],['Синкопа во втором такте доли','Syncopation on the and of two']],
      ru:{name:'Рэгтайм-синкопа',goal:'Мелодия против ровного баса: синкопа рэгтайма.',how:'Бас — Трэвис, ровно на каждую долю. Мелодия попадает между долями: в одних вариантах на последнюю восьмую такта, в других на «и» второй доли. Слушай Блайнд Блейка и Рева Гэри Дэвиса.',tip:'Синкопа звучит только на ровном басу. Если бас подстраивается под мелодию, синкопа пропадает.',lvl:['Одна синкопа','Две ноты','Фигура в такте','Мелодия, четыре такта','Мелодия с секстой и аккордом']},
      en:{name:'Ragtime syncopation',goal:'Melody against a steady bass: ragtime syncopation.',how:'The bass is Travis, steady on every beat. The melody falls between the beats: on the last eighth of the bar in some variants, on the and of two in others. Listen to Blind Blake and Rev. Gary Davis.',tip:'Syncopation only works over a steady bass. If the bass bends to the melody, the syncopation is gone.',lvl:['One syncopation','Two notes','A figure per bar','Melody, four bars','Melody with a chord at the end']}},
    R7:{sub:2,meter:'3/4',fig:[['Бас — аккорд — аккорд','Bass, chord, chord'],['Арпеджио восьмыми','Eighth-note arpeggio']],
      ru:{name:'Вальс 3/4',goal:'Трёхдольное время: сильная доля — бас, слабые — легче.',how:'Размер 3/4. Бас на первую долю, на вторую и третью — три верхние струны щипком или перебор восьмыми. Со второго уровня бас чередуется через такт.',tip:'Первая доля — опора, две другие легче. Не превращай вальс в марш.',lvl:['Два аккорда','Переменный бас','Мелодия на первой доле','Мелодия и подхват','Четыре такта, мелодия']},
      en:{name:'Waltz in 3/4',goal:'Triple time: bass on the strong beat, lighter on the others.',how:'3/4 time. Bass on beat one; on beats two and three the top three strings are pinched together, or the chord is picked in eighths. From level 2 the bass alternates every other bar.',tip:'Beat one is the anchor, the other two are lighter. Do not turn the waltz into a march.',lvl:['Two chords','Alternating bass','Melody on beat one','Melody and pickup','Four bars, melody']}},
    R8:{sub:3,fig:[['Триоли p-i-m','Triplets p-i-m'],['Триоли p-a-m','Triplets p-a-m']],
      ru:{name:'Триольный перебор 12/8',goal:'Ровные триоли под четвертным басом.',how:'Ощущение 12/8, записано в 4/4 триолями. Большой палец — на каждую долю, два пальца заполняют триоль. На четвёртом уровне мелодия на первой струне вплетается в триоли.',tip:'Три ноты доли одинаково громкие, кроме баса. Медленно — не значит вяло.',lvl:['Тоника на долю','Переменный бас','Четыре аккорда','Мелодия в триолях','Мелодия и концовка']},
      en:{name:'Triplet picking in 12/8',goal:'Even triplets over a quarter-note bass.',how:'A 12/8 feel written in 4/4 triplets. The thumb plays every beat, two fingers fill the triplet. On level 4 a melody on the first string weaves into the triplets.',tip:'All three notes of the beat equally loud, apart from the bass. Slow does not mean sloppy.',lvl:['Root on the beat','Alternating bass','Four chords','Melody in triplets','Melody and ending']}},
    R9:{sub:2,fig:[['Щелчок пальцами на 2 и 4','Finger snap on 2 and 4'],['Удар большим пальцем на 2 и 4','Thumb slap on 2 and 4']],
      ru:{name:'Перкуссия на струнах',goal:'Малый барабан на акустике: глухой удар на 2 и 4.',how:'Бас на 1 и 3. На 2 и 4 — глухой удар: в одних вариантах пальцы шлёпают по верхним струнам, в других большой палец бьёт по басовым и сразу глушит их. Крестики в табе — глухой удар. Слушай Томми Эммануэля и Андреа Валилео.',tip:'Удар не громче баса и мелодии. Ладонь или палец ложится на струны в момент удара, а не после.',lvl:['Бас и удар','Второй бас и нота','Аккорд между ударами','Мелодия','Четыре такта, двойной удар']},
      en:{name:'Percussion on the strings',goal:'A snare drum on the acoustic: a muted hit on 2 and 4.',how:'Bass on 1 and 3. On 2 and 4 a muted hit: the fingers slap the top strings in some variants; in others the thumb strikes the bass strings and mutes them at once. x in the tab is the muted hit. Listen to Tommy Emmanuel and Andy McKee.',tip:'The hit is no louder than the bass and melody. The hand lands on the strings with the hit, not after it.',lvl:['Bass and hit','Second bass and a note','Chord between the hits','Melody','Four bars, double hit']}},
    R10:{sub:1,meter:'6/8',fig:[['Бас на две доли','Bass on both beats'],['Бас и открытый бурдон','Bass and an open drone']],
      ru:{name:'Джига 6/8',goal:'Кельтский ритм: две доли по три восьмые.',how:'Размер 6/8, пульс — восьмая, сильные — первая и четвёртая. Большой палец — на сильные, пальцы — мелодия восьмыми. В вариантах с бурдоном вторую сильную держит открытая первая струна. Пьер Бенсюзан и Тони Макманус играют так в DADGAD.',tip:'Считай «раз-и-а, два-и-а»: качается не каждая восьмая, а пары долей.',lvl:['Перебор','Мелодия','Четыре такта','Легато','Легато и концовка']},
      en:{name:'Jig in 6/8',goal:'A Celtic rhythm: two beats of three eighths.',how:'6/8 time, the pulse is the eighth, the strong ones are the first and the fourth. The thumb plays the strong eighths, the fingers a melody in eighths. In the drone variants the open first string takes the second strong eighth. Pierre Bensusan and Tony McManus play this way in DADGAD.',tip:'Count “one-and-a, two-and-a”: the swing is in the pairs of beats, not in every eighth.',lvl:['Picking','Melody','Four bars','Legato','Legato and ending']}},
    R11:{sub:2,fig:[['Ходы I–IV–V','Walks I–IV–V'],['Ходы I–VI–IV–V','Walks I–vi–IV–V']],
      ru:{name:'Басовые ходы',goal:'Связывать аккорды ходом в басу.',how:'Большой палец ведёт бас и последними долями подходит к тонике следующего аккорда по соседним ладам. На пятом уровне ход идёт восьмыми. Пальцы держат аккорд сверху.',tip:'Подход — на последнюю долю, тоника нового аккорда — точно на первую.',lvl:['Ход на одну ноту','Щипок на долю','Перебор сверху','Ход в две ноты','Ход восьмыми']},
      en:{name:'Bass walks',goal:'Connect chords with a bass walk.',how:'The thumb leads the bass and on the last beats steps to the next chord’s root by neighbouring frets. On level 5 the walk moves in eighths. The fingers hold the chord on top.',tip:'The approach note on the last beat, the new root exactly on beat one.',lvl:['One-note walk','Pinch on the beat','Picking on top','Two-note walk','Walk in eighths']}},
    R12:{sub:2,fig:[['Толчок в I–IV–V','Push in I–IV–V'],['Толчок в I–VI–IV–V','Push in I–vi–IV–V']],
      ru:{name:'Смена раньше такта',goal:'Толчок: новый аккорд вступает на последнюю восьмую.',how:'Перебор Трэвиса, а новый аккорд вступает щипком (бас и первая струна) на последнюю восьмую предыдущего такта. На первую долю нового такта бас не повторяется: там звучит нота сверху.',tip:'Левая рука переставляет аккорд на восьмую раньше. Готовь смену заранее, а не в последний момент.',lvl:['Без толчка','Один толчок','Два толчка','Четыре такта','С мелодией']},
      en:{name:'Change ahead of the bar',goal:'The push: the new chord comes in on the last eighth.',how:'Travis picking, and the new chord comes in as a pinch (bass and first string) on the last eighth of the previous bar. The bass does not repeat on the new bar’s beat one: a treble note sounds there instead.',tip:'The fretting hand moves the chord an eighth early. Prepare the change ahead of time, not at the last moment.',lvl:['No push','One push','Two pushes','Four bars','With melody']}},
    R13:{sub:2,fig:[['Флажолеты 12-го лада','12th-fret harmonics'],['Флажолеты 7-го лада','7th-fret harmonics']],
      ru:{name:'Флажолеты над басом',goal:'Колокольчики: натуральные флажолеты в ритме.',how:'Палец левой руки касается струны точно над ладовой пластиной, не прижимая, щипок — и палец сразу убирается. Звёздочка в табе — флажолет. Бас идёт своим ходом. В открытых строях флажолеты звучат аккордом строя.',tip:'Касание лёгкое и точно над пластиной. Щипок ближе к подставке даёт звонкий флажолет.',lvl:['Аккорд флажолетов','Флажолеты и аккорд','Флажолеты по одному','Флажолеты и перебор','С мелодией']},
      en:{name:'Harmonics over the bass',goal:'Bells: natural harmonics in time.',how:'A fretting finger touches the string right above the fret wire without pressing; pluck, and lift the finger at once. An asterisk in the tab is a harmonic. The bass keeps going. In open tunings the harmonics ring as the tuning’s chord.',tip:'A light touch, exactly above the fret wire. Plucking nearer the bridge gives a brighter harmonic.',lvl:['Harmonic chord','Harmonics and chord','Single harmonics','Harmonics and picking','With melody']}},
    R14:{sub:2,fig:[['Прямой ролл','Forward roll'],['Обратный ролл','Backward roll']],
      ru:{name:'Банджо-ролл 3+3+2',goal:'Восьмые группами 3+3+2: синкопа внутри ровного перебора.',how:'Пальцы повторяют фигуру из трёх нот, поэтому акцент смещается: 3+3+2 восьмые в такте. Прямой ролл идёт от баса вверх, обратный — от первой струны вниз. Так играют кантри-пикеры и Леон Редбоун.',tip:'Акцентируй первую ноту каждой группы: раз-и-а, два-и-а, раз-и.',lvl:['Один аккорд','Два аккорда','Четыре аккорда','Мелодия в ролле','Мелодия, четыре аккорда']},
      en:{name:'Banjo roll 3+3+2',goal:'Eighths grouped 3+3+2: syncopation inside even picking.',how:'The fingers repeat a three-note figure, so the accent shifts: 3+3+2 eighths per bar. The forward roll runs up from the bass, the backward roll down from the first string. Country pickers and Leon Redbone play this way.',tip:'Accent the first note of each group: one-and-a, two-and-a, one-and.',lvl:['One chord','Two chords','Four chords','Melody in the roll','Melody, four chords']}},
    R15:{sub:2,fig:[['Клохаммер с бурдоном','Clawhammer with a drone'],['Клохаммер с басом','Clawhammer with a bass']],
      ru:{name:'Клохаммер (бум-дидди)',goal:'Бой ногтем и щипок: «бум — ди-ди».',how:'Нота мелодии на долю — ногтем вниз, на вторую восьмую пауза, затем удар ногтем вниз по трём верхним струнам и сразу большой палец: на открытую первую струну (бурдон) или на бас. Так переносят банджо на гитару.',tip:'Кисть падает свободно, как молоточек: удар идёт от предплечья, пальцы не щиплют.',lvl:['Бум-ди','Бум-ди-ди','Мелодия из аккорда','Мелодия','Мелодия с хаммером']},
      en:{name:'Clawhammer (bum-ditty)',goal:'Nail strum and thumb: “bum, dit-ty”.',how:'A melody note on the beat with a downward nail stroke, a rest on the next eighth, then a nail stroke down across the top three strings and the thumb right after: on the open first string (a drone) or on the bass. A banjo technique carried over to guitar.',tip:'The hand drops freely like a hammer: the stroke comes from the forearm, the fingers do not pluck.',lvl:['Bum-dit','Bum-ditty','Melody from the chord','Melody','Melody with a hammer-on']}},
    R37:{sub:3,fig:[['Три против двух: аккорд','Three against two: chord'],['Три против двух: мелодия','Three against two: melody']],
      ru:{name:'Три против двух',goal:'Полиритм: палец — тройками, большой палец — двойками.',how:'Деление — триоли. Большой палец играет четверти, пальцы — каждую вторую триольную восьмую: на полтакта три ноты пальцами против двух басов. Совпадают они только на сильных долях.',tip:'Сначала простучи по столу: левая рука — бас, правая — тройки. Говори «раз-и-та, два».',lvl:['Тоника и первая струна','Переменный бас','Четыре аккорда','Мелодия тройками','Мелодия, четыре аккорда']},
      en:{name:'Three against two',goal:'Polyrhythm: the fingers in threes, the thumb in twos.',how:'Triplet subdivision. The thumb plays quarter notes, the fingers every second triplet eighth: three finger notes against two bass notes per half bar. They meet only on the strong beats.',tip:'Tap it on a table first: one hand the bass, the other the threes. Say “one-and-ta, two”.',lvl:['Root and first string','Alternating bass','Four chords','Melody in threes','Melody, four chords']}}
  };
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{const o=T[id];
    EX[id]=Object.assign({},o.ru,{sub:o.sub,v:CTX.map((K,f)=>BV(o.fig[f%2][0]+' · '+K.ru,LV[id](K,f),Object.assign({},o.meter?{meter:o.meter}:{},K.tun?{tun:K.tun}:{})))});
    EXEN[id]=Object.assign({},o.en,{v:CTX.map((K,f)=>o.fig[f%2][1]+' · '+K.en)});
  });
  // разминка без уровней
  Object.assign(EX,{
    W0:{name:'Разминка',goal:'Разогреть руки и пальцы правой руки.',how:'Без гитары минуту: потри ладони до тепла, медленные круги кистями, сожми и раскрой кулаки 20 раз. Затем медленная хроматика в первой позиции, пальцы правой руки чередуются i-m, на басовых струнах — большой палец.',tip:'Ногти правой руки берегут: на разминке играй мякотью пальца и мягко.',sub:2,v:[{l:'Хроматика в первой позиции',t:['E1 E2 E3 E4 A1 A2 A3 A4 D1 D2 D3 D4 G1 G2 G3 G4 B1 B2 B3 B4 e1 e2 e3 e4','e4 e3 e2 e1 B4 B3 B2 B1 G4 G3 G2 G1 D4 D3 D2 D1 A4 A3 A2 A1 E4 E3 E2 E1']}]},
    W1:{name:'Мобилизация без гитары',goal:'Разогнать кровь в кистях и предплечьях.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Сожми и раскрой кулаки 20 раз. Постучи по столу по очереди большим пальцем и пальцами i, m, a — медленно, потом быстрее.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
    W2:{name:'Медленный Трэвис',goal:'Включить большой палец и пальцы правой руки.',how:'Аккорд {C}: большой палец чередует басы, пальцы играют верхние струны между долями. Темп заведомо низкий, звук ровный.',tip:'Большой палец не задевает соседние струны, каждая нота звучит полную длительность.',sub:2,v:[{l:'Трэвис на {C} и {G}',t:['A3 B1 D2 G0 E3 B1 D2 G0 | E3 e3 D0 B0 A2 e3 D0 B0']}]},
    W3:{name:'Трели от открытых струн',goal:'Разогреть пальцы левой руки без нагрузки.',how:'Восьмые, темп вполовину рабочего. Открытая струна щипком, дальше хаммер и пулл-офф: пальцы 1, 2, 3 по очереди на третьей, затем на второй струне.',tip:'Пулл-офф — чуть вниз, а не просто снять палец.',sub:2,v:[{l:'Три пальца на двух струнах',t:['G0 Gh1 Gp0 Gh1 G0 Gh2 Gp0 Gh2 | G0 Gh3 Gp0 Gh3 B0 Bh1 Bp0 Bh1 | B0 Bh2 Bp0 Bh2 B0 Bh3 Bp0 Bh3']}]}
  });
  Object.assign(EXEN,{
    W0:{name:'Warm-up',goal:'Warm up both hands and the plucking fingers.',how:'One minute without the guitar: rub your palms until warm, slow wrist circles, open and close your fists 20 times. Then slow first-position chromatics, alternating i-m with the picking hand and the thumb on the bass strings.',tip:'Spare your picking-hand nails: warm up with the flesh of the fingers, gently.',v:['First-position chromatics']},
    W1:{name:'Mobility without the guitar',goal:'Get blood flowing in the hands and forearms.',how:'Rub your palms until warm. Wrist circles both ways, 10 each. Open and close your fists 20 times. Tap the table with the thumb and fingers i, m, a in turn, slowly, then faster.',tip:'No stretching into pain: only warmth and mobility.'},
    W2:{name:'Slow Travis',goal:'Wake up the thumb and the picking fingers.',how:'A {C} chord: the thumb alternates the bass notes, the fingers play the top strings between the beats. Deliberately slow, an even sound.',tip:'The thumb does not catch the neighbouring strings; every note rings its full length.',v:['Travis on {C} and {G}']},
    W3:{name:'Trills from open strings',goal:'Warm up the fretting fingers without strain.',how:'Eighth notes, half your working tempo. Pluck the open string, then hammer on and pull off: fingers 1, 2, 3 in turn on the third string, then on the second.',tip:'A pull-off goes slightly down, not just off the string.',v:['Three fingers on two strings']}
  });
  const TESTS=[
    {id:'FST1',ru:['Монотонный бас','Тоника {C} четвертями большим пальцем, мелодия между долями, держать 30 секунд без сбоя.'],en:['Steady thumb','Root {C} in quarter notes with the thumb, a melody between the beats, hold 30 seconds without a slip.'],sub:2,t:['A3 G0 A3 B1 A3 e0 A3 B1']},
    {id:'FST2',ru:['Перебор Трэвиса','{C}, переменный бас и пальцы между долями, четыре такта подряд без сбоя.'],en:['Travis picking','{C}, alternating bass and fingers between the beats, four bars in a row without a slip.'],sub:2,t:['A3+e0 B1 D2 G0 E3 B1 D2 G0']},
    {id:'FST3',ru:['Триоли под басом','{E}m, бас четвертями и триоли пальцами, держать 60 секунд.'],en:['Triplets over the bass','{E}m, bass in quarters and triplets in the fingers, hold 60 seconds.'],sub:3,t:['E0 G0 B0 D2 G0 B0 E0 G0 B0 D2 G0 B0']},
    {id:'FST4',ru:['Банджо-ролл','{G}, ролл 3+3+2, четыре такта подряд, акценты на месте.'],en:['Banjo roll','{G}, a 3+3+2 roll, four bars in a row, accents in place.'],sub:2,t:['E3 G0 e3 D0 G0 e3 A2 e3']},
    {id:'FST5',ru:['Перкуссия','{E}m, бас на 1 и 3, глухой удар по верхним струнам на 2 и 4, два круга подряд.'],en:['Percussion','{E}m, bass on 1 and 3, a muted hit on the top strings on 2 and 4, two loops in a row.'],sub:2,t:['E0 B0 Gx+Bx+ex e0 D2 B0 Gx+Bx+ex e0']}
  ];
  const RIFF={
    ru:['большой палец не останавливается ни на одну долю','хотя бы один флажолет','одна открытая струна звучит бурдоном через весь рифф','один глухой удар по струнам на слабую долю','мелодия на первой струне, бас — на шестой и пятой','хотя бы один хаммер или пулл-офф от открытой струны','одна синкопа: нота мелодии на последнюю восьмую такта','только три пальца: p, i, m','бас идёт ходом к следующему аккорду','в конце — аккорд, который звучит до полной тишины','две соседние ноты мелодии на разных струнах (кампанелла)','темп на 20% ниже рабочего, каждая нота ровная'],
    en:['the thumb never stops for a single beat','at least one harmonic','one open string drones through the whole riff','one muted hit on the strings on a weak beat','melody on the first string, bass on the sixth and fifth','at least one hammer-on or pull-off from an open string','one syncopation: a melody note on the last eighth of the bar','three fingers only: p, i, m','the bass walks to the next chord','end on a chord that rings out to silence','two neighbouring melody notes on different strings (campanella)','tempo 20% below your working tempo, every note even']
  };
  return {EX,EXEN,COACH:{W0:{free:60}},TESTS,RIFF};
})();
/*@FSA1_END@*/

// ----- FSA2: фингерстайл, акустика, часть 2 -----
// Вариант = контекст (строй, тональность, ход аккордов) + фигура; у каждого упражнения варианты различаются материалом, не только тональностью.
const FSA2=(()=>{
const J=(...a)=>a.flat().filter(x=>x!=null&&x!=='').join(' ');
const swp=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push(a[i]+':2 '+a[i+1]);return o.join(' ');}; // ровные восьмые → свинг (внутри /3)
const q=a=>a.map(t=>t+':2'),rev=a=>a.slice().reverse(),half=a=>a.slice(0,4),half2=a=>a.slice(4);
const strs=t=>t.split('+').map(x=>x[0]);
const pin=(a,b)=>strs(a).some(s=>strs(b).includes(s))?b:a+'+'+b; // щипок без двух нот на одной струне
const sft=(t,n)=>t.replace(/([eBGDAE])([hp]?)(\d+)/g,(m,s,k,f)=>s+k+(+f+n));
const leg=a=>a.map((t,i)=>{const p=/^([eBGDAE])(\d+)$/.exec(a[i-1]||''),c=/^([eBGDAE])(\d+)$/.exec(t);return p&&c&&p[1]===c[1]&&p[2]!==c[2]?c[1]+(+c[2]>+p[2]?'h':'p')+c[2]:t;});
const H=(s,p)=>`${s}${p}*`;
const ch=(nm,full,b,t)=>({nm,full,b,t,top:t.join('+'),x:full.replace(/\d+/g,'x')});
const SS=['E','A','D','G','B','e'];
const ob=(nm,f,s1,s2)=>Object.assign(ch(nm,SS.map(s=>s+f).join('+'),[s1+f,s2+f],['G'+f,'B'+f,'e'+f]),{f});
const eb=(nm,f)=>Object.assign(ch(nm,`E${f}+A${f+2}+D${f+2}+G${f+1}+B${f}+e${f}`,['E'+f,'D'+(f+2)],['G'+(f+1),'B'+f,'e'+f]),{f});
// стандартный строй
const cC=ch('{C}','A3+D2+G0+B1+e0',['A3','D2'],['G0','B1','e0']),cAm=ch('{A}m','A0+D2+G2+B1+e0',['A0','D2'],['G2','B1','e0']),
 cF=ch('{F}maj7','A0+D3+G2+B1+e0',['D3','A0'],['G2','B1','e0']),cG=ch('{G}','E3+A2+D0+G0+B0+e3',['E3','D0'],['G0','B0','e3']),
 cEm=ch('{E}m','E0+A2+D2+G0+B0+e0',['E0','D2'],['G0','B0','e0']),cD=ch('{D}','A0+D0+G2+B3+e2',['D0','A0'],['G2','B3','e2']),
 cDm=ch('{D}m','A0+D0+G2+B3+e1',['D0','A0'],['G2','B3','e1']),cE=ch('{E}','E0+A2+D2+G1+B0+e0',['E0','D2'],['G1','B0','e0']),
 cA=ch('{A}','A0+D2+G2+B2+e0',['A0','D2'],['G2','B2','e0']),cB7=ch('{B}7','A2+D1+G2+B0+e2',['A2','D1'],['G2','B0','e2']),
 cA7=ch('{A}7','A0+D2+G0+B2+e0',['A0','D2'],['G0','B2','e0']),cD7=ch('{D}7','A0+D0+G2+B1+e2',['D0','A0'],['G2','B1','e2']),
 cG7=ch('{G}7','E3+A2+D0+G0+B0+e1',['E3','D0'],['G0','B0','e1']),cE7=ch('{E}7','E0+A2+D2+G1+B3+e0',['E0','D2'],['G1','B3','e0']);
// Drop D, DADGAD
const dD=ch('{D}','E0+A0+D0+G2+B3+e2',['E0','D0'],['G2','B3','e2']),dG=ch('{G}','E5+A5+D5+G4+B3+e3',['E5','D5'],['G4','B3','e3']),
 gD=ch('{D}','E0+A0+D4+B0+e0',['E0','A0'],['D4','B0','e0']),gG=ch('{G}','E5+A2+D0+G0+B0+e0',['E5','D0'],['G0','B0','e0']),
 gA=ch('{A}','A0+D2+G2+B4+e0',['A0','D2'],['G2','B4','e0']),gDs=ch('{D}sus4','E0+A0+D0+G0+B0+e0',['E0','D0'],['G0','B0','e0']);
const TL={'':['стандартный строй','standard tuning'],dropd:['Drop {D}','Drop {D}'],dadgad:['DADGAD','DADGAD'],openg:['открытый {G}','open {G}'],
 opend:['открытый {D}','open {D}'],openc:['открытый {C}','open {C}'],opendm:['открытый {D}m','open {D}m'],opene:['открытый {E}','open {E}'],opena:['открытый {A}','open {A}']};
// контексты: строй, ход из 4 аккордов, мелодия (8 нот гаммы вверх на верхних струнах), открытый бас для флажолетов
const X={
 C:{p:[cC,cAm,cF,cG],mel:['G0','G2','B0','B1','B3','e0','e1','e3']},
 G:{p:[cG,cEm,cC,cD],mel:['G0','G2','B0','B1','B3','e0','e2','e3']},
 Am:{p:[cAm,cDm,cE,cAm],mel:['G2','B0','B1','B3','e0','e1','e3','e5']},
 E:{p:[cE,cA,cB7,cE],mel:['G1','G2','B0','B2','B4','e0','e2','e4']},
 dd:{tun:'dropd',p:[dD,dG,cA7,dD],mel:['G2','G4','B2','B3','e0','e2','e3','e5']},
 dg:{tun:'dadgad',p:[gD,gG,gA,gDs],mel:['G0','B0','B2','B4','e0','e2','e4','e5']},
 og:{tun:'openg',p:[ob('{G}',0,'A','D'),ob('{C}',5,'A','D'),ob('{D}',7,'A','D'),ob('{G}',0,'A','D')],mel:['G0','G2','B0','B1','e0','e2','e4','e5']},
 od:{tun:'opend',p:[ob('{D}',0,'E','A'),ob('{G}',5,'E','A'),ob('{A}',7,'E','A'),ob('{D}',0,'E','A')],mel:['G0','G1','B0','B2','B4','e0','e2','e4']},
 oc:{tun:'openc',p:[ob('{C}',0,'E','A'),ob('{F}',5,'E','A'),ob('{G}',7,'E','A'),ob('{C}',0,'E','A')],mel:['G0','G2','G4','B0','B2','e0','e1','e3']},
 odm:{tun:'opendm',p:[ob('{D}m',0,'E','A'),ob('{G}m',5,'E','A'),ob('{A}m',7,'E','A'),ob('{D}m',0,'E','A')],mel:['G0','G2','B0','B1','B3','e0','e2','e3']},
 oe:{tun:'opene',p:[ob('{E}',0,'E','A'),ob('{A}',5,'E','A'),ob('{B}',7,'E','A'),ob('{E}',0,'E','A')]},
 oa:{tun:'opena',p:[ob('{A}',0,'A','D'),ob('{D}',5,'A','D'),ob('{E}',7,'A','D'),ob('{A}',0,'A','D')]}
};
const pn=x=>x.p.map(c=>c.nm).join('–');
const tl=(x,i)=>TL[x.tun||''][i];
const vr=(x,ru,en,lv)=>({l:[`${ru} · ${tl(x,0)}`,`${en} · ${tl(x,1)}`],tun:x.tun,lv});
const EX={},EN={};
function add(id,sub,ru,en,vs){
  EX[id]=Object.assign({n:+id.slice(1)},ru,{sub,v:vs.map(x=>{const o={l:x.l[0],lv:x.lv.map(t=>({t:Array.isArray(t)?t:[t]}))};if(x.tun)o.tun=x.tun;return o;})});
  EN[id]=Object.assign({},en,{v:vs.map(x=>({l:x.l[1]}))});
}
// фигуры правой руки: такт восьмыми на аккорде
const F={
 pima:c=>[c.b[0],c.t[0],c.t[1],c.t[2],c.b[1],c.t[0],c.t[1],c.t[2]],
 pami:c=>[c.b[0],c.t[2],c.t[1],c.t[0],c.b[1],c.t[2],c.t[1],c.t[0]],
 roll:c=>[c.b[0],c.t[0],c.t[1],c.t[2],c.t[1],c.t[0],c.b[1],c.t[2]],
 banjo:c=>[c.b[0],c.t[1],c.t[2],c.b[1],c.t[1],c.t[2],c.b[0],c.t[2]],
 casc:c=>[c.t[2],c.t[1],c.t[0],c.b[0],c.t[2],c.t[1],c.t[0],c.b[1]],
 tr:c=>[c.b[0]+'+'+c.t[2],c.t[1],c.b[1],c.t[2],c.b[0],c.t[0],c.b[1],c.t[1]],
 trP:c=>[c.b[0]+'+'+c.t[2],c.t[1],c.b[1]+'+'+c.t[2],c.t[0],c.b[0]+'+'+c.t[1],c.t[2],c.b[1]+'+'+c.t[0],c.t[1]],
 mono:c=>[c.b[0]+'+'+c.t[2],c.t[1],c.b[0],c.t[2],c.b[0],c.t[0],c.b[0],c.t[1]],
 trS:c=>[c.b[0],c.t[2],c.b[1],c.t[1],c.b[0]+'+'+c.t[2],c.t[0],c.b[1],c.t[1]]
};
const bas=(c,mono)=>q(mono?[c.b[0],c.b[0],c.b[0],c.b[0]]:[c.b[0],c.b[1],c.b[0],c.b[1]]);
const SN='Ax+Dx+Gx'; // удар по струнам у розетки: малый барабан
const G={
 g0:c=>[c.b[0],c.t[2],SN,c.t[1],c.b[0],c.t[2],SN,c.t[1]],
 g1:c=>[c.b[0]+'+'+c.t[2],'.',SN,c.t[1],'.',c.b[0],SN,c.t[0]],
 g2:c=>[c.b[0],'.',c.t[2],SN,'.',c.t[1],c.b[0],'.',c.t[2],SN,c.t[1],c.t[0]],
 g16:c=>[c.b[0],'.',c.t[2],c.t[1],SN,'.',c.t[2],'.',c.b[0],c.b[0],c.t[2],c.t[1],SN,'.',c.t[1],c.t[0]]
};
const mbA=(c,m)=>[pin(c.b[0],m[0]),m[1],pin(c.b[1],m[2]),m[3],pin(c.b[0],m[4]),m[5],pin(c.b[1],m[6]),m[7]];
const mbD=(c,m)=>mbA(c,rev(m));

/* A16 арпеджио */
const a16=(x,f)=>{const [a,b,c,d]=x.p.map(F[f]);return [
  J(q(a.filter((_,i)=>i%2===0)),'|',q(b.filter((_,i)=>i%2===0))),
  J(a,'|',b),
  [J(a,'|',b),J(c,'|',d)],
  [J(a,'|',b),J(c,'|',d),J(half(a),half(d),'|',x.p[0].full+':8')],
  [J('/4',a,a,'|',b,b),J('/4',c,c,'|',d,d)]];};
add('A16',2,
 {name:'Арпеджио пальцами',goal:'Ровные арпеджио: большой палец на басу, i-m-a на верхних струнах.',how:'Аккорд держится весь такт. Большой палец (p) играет бас, указательный (i), средний (m) и безымянный (a) — по своей струне. Варианты меняют порядок пальцев, ход аккордов и строй.',tip:'Пальцы не прыгают: каждый живёт над своей струной. Все ноты одной громкости, бас чуть громче. Ориентир — классика и Томми Эммануэль в медленных пьесах.',lvl:['Четверти на двух аккордах','Восьмые на двух аккордах','Весь ход из четырёх аккордов','Ход и смены в половине такта','Шестнадцатые']},
 {name:'Fingerpicked arpeggios',goal:'Even arpeggios: thumb on the bass, i-m-a on the top strings.',how:'Hold the chord for the whole bar. The thumb (p) plays the bass, the index (i), middle (m) and ring (a) fingers each own a string. Variants change the finger order, the chord progression and the tuning.',tip:'The fingers do not jump: each one lives over its string. All notes equally loud, the bass a little louder. Think classical pieces and Tommy Emmanuel’s slow numbers.',lvl:['Quarters on two chords','Eighths on two chords','The whole four-chord progression','Progression with half-bar changes','Sixteenths']},
 [[X.C,'pima','p-i-m-a','p-i-m-a'],[X.G,'pami','p-a-m-i, сверху вниз','p-a-m-i, top down'],[X.Am,'roll','p-i-m-a-m-i, волна','p-i-m-a-m-i, wave'],
  [X.dg,'banjo','банджо-ролл 3+3+2','banjo roll 3+3+2'],[X.og,'casc','каскад a-m-i-p','a-m-i-p cascade'],[X.odm,'pima','p-i-m-a в миноре','p-i-m-a in minor']]
 .map(([x,f,r,e])=>vr(x,`${r}, ${pn(x)}`,`${e}, ${pn(x)}`,a16(x,f))));

/* A17 Трэвис */
const a17=(x,f)=>{const P=x.p.map(F[f]),m=f==='mono';return [
  J(bas(x.p[0],m),'|',bas(x.p[1],m)),
  J(P[0],'|',P[0]),
  J(P[0],'|',P[1]),
  [J(P[0],'|',P[1]),J(P[2],'|',P[3])],
  [J('/3',swp(P[0]),'|',swp(P[1])),J('/3',swp(P[2]),'|',swp(P[3]))]];};
add('A17',2,
 {name:'Трэвис-пикинг',goal:'Большой палец ведёт бас сам по себе, пальцы играют поверх.',how:'Большой палец играет на каждую долю: тоника и вторая басовая нота по очереди (или одна тоника — монотонный бас). Указательный и средний щиплют верх между ударами баса. Варианты: классический Трэвис, пинчи, монотонный бас, синкопы, разные строи.',tip:'Сначала один бас, пока он не станет автоматическим. Пальцы не должны сбивать большой палец. Ориентир — Мерл Трэвис, Чет Аткинс, Миссисипи Джон Хёрт.',lvl:['Только бас','Фигура на одном аккорде','Два аккорда','Весь ход','Свинг']},
 {name:'Travis picking',goal:'The thumb runs the bass on its own while the fingers play on top.',how:'The thumb plays on every beat: the root and a second bass note in turn (or the root only, a monotonic bass). Index and middle pluck the top between the bass hits. Variants: classic Travis, pinches, monotonic bass, syncopation, different tunings.',tip:'Bass alone first, until it runs on autopilot. The fingers must not throw the thumb off. Think Merle Travis, Chet Atkins, Mississippi John Hurt.',lvl:['Bass only','Pattern on one chord','Two chords','The whole progression','Swing']},
 [[X.C,'tr','классический Трэвис','classic Travis'],[X.G,'trP','Трэвис с пинчами','Travis with pinches'],[X.E,'mono','монотонный бас','monotonic bass'],
  [X.dd,'trS','синкопы в верхнем голосе','syncopated top voice'],[X.og,'tr','Трэвис в открытом строе','Travis in an open tuning'],[X.od,'trP','пинчи в открытом строе','pinches in an open tuning']]
 .map(([x,f,r,e])=>vr(x,`${r}, ${pn(x)}`,`${e}, ${pn(x)}`,a17(x,f))));

/* A18 мелодия поверх баса */
const a18=(x,mono)=>{const c=x.p[0],m=x.mel,b0=c.b[0],b1=mono?c.b[0]:c.b[1],P=(b,t)=>pin(b,t);return [
  J(`${P(b0,m[0])}:2 ${P(b1,m[2])}:2 ${P(b0,m[4])}:2 ${P(b1,m[2])}:2`),
  J(b0,m[0],b1,m[1],b0,m[2],b1,m[3],'|',b0,m[4],b1,m[5],b0,m[6],b1,m[7]),
  J(P(b0,m[0]),m[1],P(b1,m[2]),m[3],P(b0,m[4]),m[5],P(b1,m[6]),m[7],'|',P(b0,m[7]),m[6],P(b1,m[5]),m[4],P(b0,m[3]),m[2],P(b1,m[1]),m[0]),
  J(P(b0,m[4]),m[3],P(b1,m[2]),m[1],P(b0,m[0])+':2',P(b1,m[2])+':2','|',P(b0,m[5]),m[6],P(b1,m[7]),m[5],P(b0,m[4])+':2',b1+':2'),
  [J('/4',leg([b0,m[0],m[1],m[2]]),leg([b1,m[3],m[4],m[5]]),leg([b0,m[6],m[7],m[6]]),leg([b1,m[5],m[4],m[3]])),
   J('/4',leg([b0,m[2],m[3],m[4]]),leg([b1,m[5],m[6],m[7]]),leg([b0,m[5],m[4],m[3]]),b1,leg([m[2],m[1],m[0]]))]];};
add('A18',2,
 {name:'Мелодия поверх баса',goal:'Две партии одной рукой: мелодия в верхнем голосе, бас не останавливается.',how:'Бас большим пальцем на каждую долю, мелодия — гамма тональности на верхних струнах. На долю бас и мелодия звучат вместе (пинч), между долями — одна мелодия. Варианты: переменный или монотонный бас, разные тональности и строи.',tip:'Мелодия громче баса. Если путаешься, спой мелодию, потом сыграй её без баса, потом добавь бас.',lvl:['Пинчи четвертями','Мелодия между ударами баса','Пинч на каждую долю, вверх и вниз','Фраза с долгими нотами','Шестнадцатые с легато']},
 {name:'Melody over the bass',goal:'Two parts with one hand: melody on top, the bass never stops.',how:'Thumb bass on every beat, the melody is the key’s scale on the top strings. On the beat the bass and melody sound together (a pinch), between beats only the melody. Variants: alternating or monotonic bass, different keys and tunings.',tip:'The melody is louder than the bass. If you get lost, sing the melody, play it without the bass, then add the bass.',lvl:['Pinches in quarters','Melody between bass hits','Pinch on every beat, up and down','A phrase with long notes','Sixteenths with legato']},
 [[X.C,0,'переменный бас','alternating bass'],[X.G,1,'монотонный бас','monotonic bass'],[X.Am,0,'минор, переменный бас','minor, alternating bass'],
  [X.dg,1,'бурдон тоники','root drone'],[X.oc,0,'переменный бас в открытом строе','alternating bass, open tuning'],[X.od,1,'бурдон в открытом строе','drone, open tuning']]
 .map(([x,mo,r,e])=>vr(x,`${r}, ${x.p[0].nm}`,`${e}, ${x.p[0].nm}`,a18(x,mo))));

/* A19 кампанелла */
const CAM=[
 [X.dg,['D0','A7','D4','G0','B0','G4','B4','e0'],['E0','A0'],'{D}'],
 [X.og,['G0','G2','B0','G5','e0','B5','e4','B8'],['A0','D0'],'{G}'],
 [X.od,['D0','A7','G0','D5','B0','G5','B4','e0'],['E0','A0'],'{D}'],
 [X.oc,['B0','G7','e0','B5','e3','B9','e7','e8'],['E0','A0'],'{C}'],
 [X.E,['A7','D4','G1','D7','B0','G6','B4','e0'],['E0','E0'],'{E}'],
 [X.G,['D5','G2','B0','G5','B3','e0','B7','e3'],['E3','E3'],'{G}']];
const a19=(c,b)=>{const r=rev(c),pp=a=>a.map((t,i)=>i%2?t:pin(b[i/2%2],t)),g3=a=>[0,1,2,3].flatMap(i=>a.slice(i,i+3)),
  g4=a=>[0,1,2,3].flatMap(i=>{const g=a.slice(i,i+4);g[0]=pin(b[i%2],g[0]);return g;});return [
  J(c),J(c,'|',r),J(pp(c),'|',pp(r)),J('/3',g3(c),'|',g3(r)),J('/4',g4(c),'|',g4(r))];};
add('A19',2,
 {name:'Кампанелла',goal:'Гамма, где соседние ноты звучат на разных струнах и сливаются, как колокола.',how:'Каждая следующая нота — на другой струне, часто открытой. Пальцы левой руки не снимаются, пока нота может звучать. Правая рука чередует пальцы, не повторяя один палец подряд. Варианты: разные строи и тональности со своими аппликатурами.',tip:'Слушай хвосты нот: они должны перекрываться. Если нота глохнет, её задевает соседний палец. Ориентир — кельтская гитара и Пьер Бенсусан.',lvl:['Гамма вверх','Вверх и вниз','Бас на каждую долю','Триоли: группы по три','Шестнадцатые: группы по четыре с басом']},
 {name:'Campanella',goal:'A scale where neighbouring notes ring on different strings and overlap like bells.',how:'Each next note is on another string, often an open one. Keep the fretting fingers down while the note can ring. The picking hand alternates fingers and never repeats one finger twice. Variants: different tunings and keys, each with its own fingering.',tip:'Listen to the note tails: they should overlap. If a note dies, a neighbouring finger is touching it. Think Celtic guitar and Pierre Bensusan.',lvl:['Scale up','Up and down','Bass on every beat','Triplets: groups of three','Sixteenths: groups of four with bass']},
 CAM.map(([x,c,b,k])=>vr(x,`Гамма ${k}`,`${k} scale`,a19(c,b))));

/* A20 флажолеты */
const a20=(p1,p2,hb)=>{const [b0,b1]=hb,L4=(p,r)=>[`${b0}+${H('G',p)}+${H('B',p)}`,H('e',p),`${b1}+${H('B',p)}+${H('e',p)}`,H('G',p),`${b0}+${H('G',r)}+${H('B',r)}`,H('e',r),`${b1}+${H('B',r)}+${H('e',r)}`,H('G',r)],
  L3=p=>[b0,H('G',p),b1,H('B',p),b0,H('e',p),b1,H('B',p)],up=(p,b)=>[b,H('G',p),H('B',p),H('e',p)],dn=(p,b)=>[b,H('e',p),H('B',p),H('G',p)];return [
  J(q(['D','G','B','e'].map(s=>H(s,p1)))),
  J(['E','A','D','G','B','e','B','G'].map(s=>H(s,p1)),'|',['e','B','G','D','A','E','A','D'].map(s=>H(s,p2))),
  J(L3(p1),'|',L3(p2)),
  J(L4(p1,p2),'|',L4(p2,p1)),
  J('/4',up(p1,b0),up(p1,b1),up(p2,b0),up(p2,b1),'|',dn(p2,b0),dn(p2,b1),dn(p1,b0),dn(p1,b1))];};
add('A20',2,
 {name:'Натуральные флажолеты',goal:'Чистый колокольный звук: флажолеты на 12-м, 7-м и 5-м ладу.',how:'Палец левой руки едва касается струны прямо над ладовой пластиной, не прижимая. Щипок — ближе к подставке, палец снимается сразу после щипка. Бас — открытые струны. Варианты: разные пары ладов и строи: в открытом строе флажолеты дают аккорд.',tip:'Если звук глухой — палец не точно над порожком или держится слишком долго. На 5-м ладу флажолет тише всего: щипай сильнее.',lvl:['Четыре флажолета четвертями','Все струны на двух ладах','Бас и флажолеты','Двойные флажолеты с басом','Шестнадцатые: бас и три флажолета']},
 {name:'Natural harmonics',goal:'A clean bell tone: harmonics at frets 12, 7 and 5.',how:'A fretting finger barely touches the string right over the fret wire without pressing. Pluck closer to the bridge and lift the finger right after. The bass is on open strings. Variants: different fret pairs and tunings: in an open tuning the harmonics make a chord.',tip:'A dull sound means the finger is not exactly over the fret or stays too long. The 5th fret harmonic is the quietest: pluck harder.',lvl:['Four harmonics in quarters','All strings at two frets','Bass and harmonics','Double harmonics with bass','Sixteenths: bass and three harmonics']},
 [[X.E,12,7,['E0','A0']],[X.Am,7,5,['A0','E0']],[X.dd,12,5,['E0','A0']],[X.dg,12,7,['E0','A0']],[X.og,12,5,['A0','E0']],[X.od,7,12,['E0','A0']]]
 .map(([x,p1,p2,hb])=>vr(x,`${p1}-й и ${p2}-й лад`,`frets ${p1} and ${p2}`,a20(p1,p2,hb))));

/* A21 перкуссия */
const a21=(x,g)=>{const P=x.p.map(G[g]),pre=g==='g2'?'/3':'',c=x.p[0],g16=x.p.map(G.g16);return [
  J(`${c.b[0]}:2 ${SN}:2 ${c.b[0]}:2 ${SN}:2`),
  J(pre,P[0],'|',P[0]),
  J(pre,P[0],'|',P[1]),
  [J(pre,P[0],'|',P[1]),J(pre,P[2],'|',P[3])],
  [J('/4',g16[0],'|',g16[1]),J('/4',g16[2],'|',g16[3])]];};
add('A21',2,
 {name:'Перкуссия',goal:'Гитара как барабан: бас — бочка, удар по струнам — малый.',how:'Мёртвая нота (x) — удар большим пальцем или ребром ладони по струнам у розетки: струны глохнут, звучит щелчок, как малый барабан. Пауза — рука глушит струны. Бас большим пальцем — бочка, пальцы добавляют ноты аккорда. Варианты меняют рисунок: прямой бит, синкопы, шаффл триолями.',tip:'Удар короткий и резкий, рука сразу отскакивает. Сначала один бит без нот аккорда, пока он не качает. Ориентир — Энди Маккии и Тоби Ли.',lvl:['Бочка и малый четвертями','Бит восьмыми','Бит на двух аккордах','Бит на всём ходе','Шестнадцатые: брейк']},
 {name:'Percussion',goal:'The guitar as a drum kit: the bass is the kick, the hit on the strings the snare.',how:'A dead note (x) is a hit with the thumb or the side of the palm on the strings near the soundhole: the strings choke and click like a snare. A rest means the hand mutes the strings. The thumb bass is the kick, the fingers add chord notes. Variants change the pattern: straight beat, syncopation, triplet shuffle.',tip:'The hit is short and sharp, the hand bounces off at once. Play the beat alone without chord notes until it grooves. Think Andy McKee and Tobi Lee.',lvl:['Kick and snare in quarters','Beat in eighths','Beat on two chords','Beat over the whole progression','Sixteenths: a fill']},
 [[X.G,'g0','прямой бит','straight beat'],[X.Am,'g1','синкопы','syncopation'],[X.dg,'g2','шаффл триолями','triplet shuffle'],
  [X.og,'g0','прямой бит в открытом строе','straight beat, open tuning'],[X.dd,'g1','синкопы в Drop','syncopation in drop'],[X.od,'g2','шаффл в открытом строе','shuffle, open tuning']]
 .map(([x,g,r,e])=>vr(x,`${r}, ${pn(x)}`,`${e}, ${pn(x)}`,a21(x,g))));

/* A22 аккордовая мелодия */
const a22=x=>{const p=x.p,hf=c=>[c.full+':2',c.t[2],c.t[1]],l3=c=>[`${c.b[0]}+${c.t[1]}+${c.t[2]}:2`,`${c.b[1]}+${c.t[2]}:2`],
  l4=c=>[`${c.b[0]}+${c.t[2]}:2`,c.t[1],c.t[2],`${c.b[1]}+${c.t[1]}:2`,c.t[0],c.t[1]];return [
  J(`${p[0].full}:4 ${p[1].full}:4`,'|',`${p[2].full}:4 ${p[3].full}:4`),
  J(hf(p[0]),hf(p[1]),'|',hf(p[2]),hf(p[3])),
  J(l3(p[0]),l3(p[1]),'|',l3(p[2]),l3(p[3])),
  [J(l4(p[0]),'|',l4(p[1])),J(l4(p[2]),'|',l4(p[3]))],
  [J(l4(p[0]),'|',l4(p[1])),J(l4(p[2]),'|',l4(p[3])),J(`${p[0].full}:4 ${H('G',12)}+${H('B',12)}+${H('e',12)}:4`)]];};
add('A22',2,
 {name:'Аккордовая мелодия',goal:'Мелодия в верхнем голосе, аккорд и бас под ней — пьеса одной гитарой.',how:'Верхняя нота аккорда — мелодия, она громче остальных. Аккорд берётся целиком, а мелодия движется по верхним струнам внутри формы. Варианты: разные ходы аккордов и строи.',tip:'Выдели мелодию: безымянный палец щиплет чуть сильнее. Остальные ноты аккорда — фон. Ориентир — Чет Аткинс и Томми Эммануэль.',lvl:['Аккорды половинными','Аккорд и две ноты мелодии','Бас, аккорд и мелодия на долю','Фраза с басом','Фраза и концовка флажолетом']},
 {name:'Chord melody',goal:'Melody on top, chord and bass underneath: a piece on one guitar.',how:'The top note of the chord is the melody, louder than the rest. Take the whole chord, the melody moves on the top strings inside the shape. Variants: different progressions and tunings.',tip:'Bring out the melody: the ring finger plucks a little harder. The other chord notes are the background. Think Chet Atkins and Tommy Emmanuel.',lvl:['Chords in halves','Chord and two melody notes','Bass, chord and melody on the beat','A phrase with bass','Phrase and a harmonic ending']},
 [X.C,X.Am,X.E,X.dg,X.oc,X.odm].map(x=>vr(x,pn(x),pn(x),a22(x))));

/* A23 рэгтайм: «ум-па» */
const RG=[[X.C,[cC,cA7,cD7,cG7]],[X.G,[cG,cE7,cA7,cD7]],[{p:0},[cD,cB7,cE7,cA7]],[X.dd,[dD,dG,cA7,dD]],[X.og,X.og.p],[X.od,X.od.p]];
const a23=p=>{const um=c=>[c.b[0]+':2',c.top+':2',c.b[1]+':2',c.top+':2'],u2=c=>[c.b[0]+':2',c.top,c.t[2],c.b[1]+':2',c.top,c.t[1]],
  sy=c=>[c.b[0]+'+'+c.t[2],c.t[0],c.b[1],c.t[2],c.b[0],c.t[1],c.b[1]+'+'+c.t[2],c.t[0]],hh=c=>[c.b[0]+':2',c.top+':2'],two=f=>[J(f(p[0]),'|',f(p[1])),J(f(p[2]),'|',f(p[3]))];return [
  two(um),two(u2),two(sy),
  [J(hh(p[0]),hh(p[1]),'|',hh(p[2]),hh(p[3])),J(sy(p[0]),'|',sy(p[3]))],
  [J('/3',swp(sy(p[0])),'|',swp(sy(p[1]))),J('/3',swp(sy(p[2])),'|',swp(sy(p[3])))]];};
add('A23',2,
 {name:'Рэгтайм',goal:'«Ум-па»: бас на сильные доли, аккорд на слабые, синкопы сверху.',how:'Большой палец — бас на 1 и 3, пальцы — аккорд на 2 и 4, как левая рука пианиста. Потом мелодия в синкопах 3+3+2 поверх того же баса. Ход — рэгтайм-круг по квинтам или I–IV–V–I.',tip:'Бас не ускоряется на синкопах. Считай вслух «раз-и-два-и». Ориентир — Блайнд Блейк, Рев. Гари Дэвис, Скотт Джоплин (на фортепиано).',lvl:['Ум-па четвертями','Ум-па и нота сверху','Синкопы 3+3+2','Два аккорда в такте','Свинг']},
 {name:'Ragtime',goal:'Oom-pah: bass on the strong beats, chord on the weak ones, syncopation on top.',how:'The thumb plays the bass on 1 and 3, the fingers the chord on 2 and 4, like a pianist’s left hand. Then a 3+3+2 syncopated melody over the same bass. The progression is a ragtime circle of fifths or I–IV–V–I.',tip:'The bass does not rush on the syncopations. Count out loud: one-and-two-and. Think Blind Blake, Rev. Gary Davis, Scott Joplin (on piano).',lvl:['Oom-pah in quarters','Oom-pah with a top note','3+3+2 syncopation','Two chords per bar','Swing']},
 RG.map(([x,p])=>{const n=p.map(c=>c.nm).join('–');return vr(x,n,n,a23(p));}));

/* A38 кельтская музыка в DADGAD */
const CE=[
 ['r',['D0','D2','D4','B0','G4','B0','D4','B0'],['e0','B4','B2','B0','G4','B0','D4','D0'],'Рил, {D} ионийский','Reel, {D} Ionian'],
 ['j',['D0','D4','B0','D4','B0','e0','G4','B0','D4','G2','D4','D0'],['D2','D4','D5','B0','D5','D4','D2','D0','A2','D0','A4','D0'],'Джига, 6/8 триолями','Jig, 6/8 as triplets'],
 ['a',['D4','D5','B0','G4'],['B0','D4','D2','D0'],'Медленный эйр с бурдоном','Slow air with a drone'],
 ['r',['D0','D4','B0','D4','B3','B0','G4','B0'],['e0','B3','B0','G4','B0','D4','D2','D0'],'Рил, {D} миксолидийский','Reel, {D} Mixolydian'],
 ['r',['D0','Dh2','Dp0','D4','B0','Bh2','Bp0','G4'],['e0','eh2','ep0','B4','B2','B0','D4','D0'],'Украшения: хаммер и пулл','Ornaments: hammer and pull'],
 ['h',['D0','D4','B0','D4','e0','B4','B2','B0'],['G4','B0','D4','D2','D0','A2','A4','A5'],'Хорнпайп в свинге','Hornpipe in swing']];
const a38=(m,P1,P2)=>{const st=t=>t.replace(/([eBGDAE])[hp]/,'$1'),bt=m==='j'?3:m==='a'?1:2,
  dr=a=>a.map((t,i)=>i%bt?t:pin('E0',t)),
  w=a=>m==='j'?J('/3',a):m==='h'?J('/3',swp(a)):m==='a'?J(q(a)):J(a),
  sk=a=>{const s=a.map(st);return m==='j'?J('/3',s.filter((_,i)=>i%3===0).map(t=>t+':3')):m==='h'?J('/3',s.filter((_,i)=>i%2===0).map(t=>t+':3')):m==='a'?J(`${s[0]}:4 ${s[2]}:4`):J(q(s.filter((_,i)=>i%2===0)));},
  bar=a=>w(a).replace(/^\/3 /,''),pre=m==='j'||m==='h'?'/3':'',
  end=m==='j'||m==='h'?`${H('E',12)}+${H('D',12)}+${H('G',12)}:6 E0+A0+D0+G0+B0+e0:6`:`${H('E',12)}+${H('D',12)}+${H('G',12)}:4 E0+A0+D0+G0+B0+e0:4`;return [
  sk(P1),w(P1),J(pre,bar(P1),'|',bar(P2)),J(pre,bar(dr(P1)),'|',bar(dr(P2))),
  [J(pre,bar(dr(P1)),'|',bar(dr(P2))),J(pre,bar(dr(P1)),'|',end)]];};
add('A38',2,
 {name:'Кельтская музыка в DADGAD',goal:'Мелодии рилов и джиг в строе DADGAD, с открытыми струнами и бурдоном.',how:'Мелодия идёт по средним и верхним струнам, открытые струны звучат как волынка. На 4–5-м уровне большой палец добавляет бурдон {D} на каждую долю. Варианты — разные формы: рил, джига, эйр, хорнпайп, миксолидийский лад, украшения.',tip:'Пусть открытые струны звенят, не глуши их. Украшение — быстрое и лёгкое, на долю приходится основная нота. Ориентир — Пьер Бенсусан, Тони Макманус.',lvl:['Опорные ноты','Первый такт','Два такта','С бурдоном','Фраза и концовка']},
 {name:'Celtic music in DADGAD',goal:'Reel and jig melodies in DADGAD with open strings and a drone.',how:'The melody runs on the middle and top strings, the open strings ring like bagpipes. On levels 4–5 the thumb adds a {D} drone on every beat. Variants are different forms: reel, jig, air, hornpipe, Mixolydian mode, ornaments.',tip:'Let the open strings ring, do not mute them. An ornament is quick and light, the main note lands on the beat. Think Pierre Bensusan and Tony McManus.',lvl:['Anchor notes','First bar','Two bars','With a drone','Phrase and ending']},
 CE.map(([m,P1,P2,r,e])=>({l:[r,e],tun:'dadgad',lv:a38(m,P1,P2)})));

/* A39 двойные ноты */
const O6=[[0,0],[2,2],[4,3],[5,5],[7,7],[9,8],[11,10],[12,12]],O10=[[0,1],[2,2],[4,4],[5,6],[7,8],[9,9],[11,11],[12,13]],OD=[[0,0],[2,0],[4,2],[5,5],[7,7],[9,7],[11,9],[12,12]];
const DS=[
 [X.G,'G','e',0,O6,'D0','Сексты в {G}','Sixths in {G}'],
 [X.G,'G','e',7,O6,'D0','Сексты в {D}','Sixths in {D}'],
 [X.G,'G','B',2,O6,'A0','Терции в {A}','Thirds in {A}'],
 [X.G,'G','B',7,O6,'D0','Терции в {D}','Thirds in {D}'],
 [X.G,'E','G',0,O10,'e0','Децимы в {E}','Tenths in {E}'],
 [X.dd,'E','G',0,OD,'D0','Децимы в {D}','Tenths in {D}']];
const a39=(s1,s2,k,O,dr)=>{const d=O.map(([a,b])=>`${s1}${k+a}+${s2}${k+b}`),ab=O.map(([a,b])=>`${s1}${k+a+1}+${s2}${k+b+1}`),
  bt=i=>[(i%4?'':dr+'+')+ab[i],d[i]+':2'];return [
  J(q(d.slice(0,4))),
  J(d,'|',rev(d)),
  J(`${dr}+${d[0]}:2`,d[1],d[2],`${dr}+${d[3]}:2`,d[2],d[1],'|',`${dr}+${d[4]}:2`,d[5],d[6],`${dr}+${d[7]}:2`,d[6],d[5]),
  J([0,1,2,3].flatMap(i=>[dr,d[i]]),'|',[4,5,6,7].flatMap(i=>[dr,d[i]])),
  J('/3',[0,1,2,3].flatMap(bt),'|',[4,5,6,7].flatMap(bt))];};
add('A39',2,
 {name:'Двойные ноты',goal:'Сексты, терции и децимы: двухголосие одной рукой.',how:'Две ноты звучат вместе и двигаются по гамме тональности. Сексты — через струну, средняя глушится подушечкой пальца; терции — на соседних струнах; децимы — бас и верх через две струны. Варианты меняют интервал и тональность.',tip:'Обе ноты одинаково громкие. При смене позиции пальцы скользят, не отрываясь. На 5-м уровне подход на лад выше — короткий, основная пара — на долю.',lvl:['Четыре пары четвертями','Вверх и вниз по гамме','Ритм с бурдоном','Бурдон на каждую долю','Подход сверху триолями']},
 {name:'Double stops',goal:'Sixths, thirds and tenths: two voices with one hand.',how:'Two notes sound together and move along the key’s scale. Sixths skip a string, the middle one muted by the pad of a finger; thirds are on adjacent strings; tenths are bass and top two strings apart. Variants change the interval and the key.',tip:'Both notes equally loud. When you shift, the fingers glide without lifting. On level 5 the approach from a fret above is short, the main pair lands on the beat.',lvl:['Four pairs in quarters','Up and down the scale','Rhythm with a drone','Drone on every beat','Approach from above in triplets']},
 DS.map(([x,s1,s2,k,O,dr,r,e])=>vr(x,r,e,a39(s1,s2,k,O,dr))));

/* L24–L26: легато с открытыми струнами */
const HL={
 Em:[{p:[]},'E0',[['A',2,3],['D',2,4],['G',2,4],['B',1,3]],'{E}m'],
 Amx:[{p:[]},'A0',[['D',2,4],['G',2,4],['B',2,3],['e',2,3]],'{A} миксолидийский','{A} Mixolydian'],
 Emx:[{p:[]},'E0',[['A',2,4],['D',2,4],['B',2,3],['e',2,4]],'{E} миксолидийский','{E} Mixolydian'],
 G:[{p:[]},'E3',[['A',2,3],['D',2,4],['G',2,4],['B',1,3]],'{G}'],
 Am:[{p:[]},'A0',[['D',2,3],['G',2,4],['B',1,3],['e',1,3]],'{A}m'],
 dg:[X.dg,'E0',[['D',2,4],['G',2,4],['B',2,4],['e',2,4]],'{D}'],
 og:[X.og,'A0',[['D',2,4],['G',2,4],['B',1,3],['e',2,4]],'{G}'],
 od:[X.od,'E0',[['D',2,4],['G',1,3],['B',2,4],['e',2,4]],'{D}'],
 odm:[X.odm,'E0',[['D',2,3],['G',2,4],['B',1,3],['e',2,3]],'{D}m'],
 oc:[X.oc,'E0',[['D',2,4],['G',2,4],['B',2,4],['e',1,3]],'{C}'],
 oe:[X.oe,'E0',[['D',2,4],['G',1,3],['B',2,4],['e',2,4]],'{E}']};
const hlv=(k,fn)=>{const [x,dr,h,r,e]=HL[k];return vr(x,r,e||r,fn(dr,h));};
const l24=(dr,h)=>{const r=rev(h);return [
  J(h.map(([s,f])=>`${s}0 ${s}h${f}`)),
  J(h.map(([s,f])=>`${dr}+${s}0 ${s}h${f}`),'|',r.map(([s,,g])=>`${dr}+${s}0 ${s}h${g}`)),
  J('/3',h.map(([s,f,g])=>`${dr}+${s}0 ${s}h${f} ${s}h${g}`),'|',r.map(([s,f,g])=>`${s}0 ${s}h${g} ${s}p${f}`)),
  J('/3',h.map(([s,f])=>`${dr}+${s}0 ${s}h${f} ${s}p0`),'|',r.map(([s,,g])=>`${dr}+${s}0 ${s}h${g} ${s}p0`)),
  J('/4',h.map(([s,f,g])=>`${dr}+${s}0 ${s}h${f} ${s}h${g} ${s}p${f}`),'|',r.map(([s,f,g])=>`${dr}+${s}0 ${s}h${g} ${s}p${f} ${s}p0`))];};
add('L24',2,
 {name:'Хаммеры от открытых струн',goal:'Громкий хаммер без щипка: левая рука сама извлекает звук.',how:'Открытая струна щипком, следующая нота — только ударом пальца левой руки по ладу. Дальше — две ноты хаммером подряд и возврат пулл-оффом. Бурдон на нижней струне держит долю. Варианты — разные строи и лады со своими нотами на каждой струне.',tip:'Хаммер — кончиком пальца, быстро и близко к ладовой пластине. Нота после хаммера такая же громкая, как сыгранная щипком.',lvl:['Открытая и хаммер','С бурдоном','Два хаммера триолями','Хаммер и пулл триолями','Шестнадцатые']},
 {name:'Hammer-ons from open strings',goal:'A loud hammer-on with no pluck: the fretting hand makes the sound.',how:'Pluck the open string, the next note comes only from the fretting finger striking the fret. Then two hammer-ons in a row and back with a pull-off. A drone on a low string keeps the beat. Variants are different tunings and modes with their own notes on each string.',tip:'Hammer with the fingertip, fast and close to the fret wire. The hammered note is as loud as the plucked one.',lvl:['Open string and hammer-on','With a drone','Two hammer-ons in triplets','Hammer and pull in triplets','Sixteenths']},
 ['Em','Amx','dg','og','od','odm'].map(k=>hlv(k,l24)));
const l25=(dr,h)=>{const r=rev(h);return [
  J(h.map(([s,f])=>`${s}${f} ${s}p0`)),
  J('/3',r.map(([s,f,g])=>`${s}${g} ${s}p${f} ${s}p0`)),
  J('/3',r.map(([s,f,g])=>`${dr}+${s}${g} ${s}p${f} ${s}p0`),'|',h.map(([s,f,g])=>`${dr}+${s}${g} ${s}p${f} ${s}p0`)),
  J('/4',r.map(([s,f,g])=>`${dr}+${s}${g} ${s}p${f} ${s}p0 ${s}h${f}`),'|',h.map(([s,f,g])=>`${dr}+${s}${g} ${s}p${f} ${s}p0 ${s}h${f}`)),
  J('/6',r.map(([s,f,g])=>`${dr}+${s}${g} ${s}p${f} ${s}p0 ${s}h${f} ${s}h${g} ${s}p${f}`),'|',h.map(([s,f,g])=>`${dr}+${s}${g} ${s}p${f} ${s}p0 ${s}h${f} ${s}h${g} ${s}p${f}`))];};
add('L25',2,
 {name:'Пулл-оффы к открытым струнам',goal:'Пулл-офф, который звучит: палец срывает струну, а не отпускает.',how:'Прижатая нота щипком, следующая — пулл-офф: палец левой руки срывает струну вниз, к соседней. Два пулл-оффа подряд приводят к открытой струне. Бурдон держит долю. Варианты — разные строи и лады.',tip:'Срывай струну чуть вбок, как щипок левой рукой. Соседнюю струну не задевай — подушечка её глушит.',lvl:['Нота и пулл к открытой','Два пулла триолями','С бурдоном','Шестнадцатые: пулл и хаммер','Секстоли']},
 {name:'Pull-offs to open strings',goal:'A pull-off that sounds: the finger snaps the string instead of releasing it.',how:'Pluck the fretted note, the next comes from a pull-off: the fretting finger snaps the string down towards the next one. Two pull-offs in a row land on the open string. A drone keeps the beat. Variants are different tunings and modes.',tip:'Snap the string slightly sideways, like plucking with the fretting hand. Do not hit the next string: the pad mutes it.',lvl:['Note and pull-off to open','Two pull-offs in triplets','With a drone','Sixteenths: pull and hammer','Sextuplets']},
 ['Emx','G','oc','oe','dg','od'].map(k=>hlv(k,l25)));
const l26=(dr,h)=>{const T=([s,f])=>[`${s}0`,`${s}h${f}`,`${s}p0`,`${s}h${f}`];return [
  J(T(h[0]),T(h[1]),'|',T(h[2]),T(h[3])),
  J('/4',h.flatMap(T)),
  J('/4',h.slice(0,2).map(([s,f])=>`${dr}+${s}0 ${s}h${f} ${s}p0 ${s}h${f} ${s}p0 ${s}h${f} ${s}p0 ${s}h${f}`),'|',h.slice(2).map(([s,f])=>`${dr}+${s}0 ${s}h${f} ${s}p0 ${s}h${f} ${s}p0 ${s}h${f} ${s}p0 ${s}h${f}`)),
  J('/4',h.slice(0,2).map(([s,f,g])=>`${dr}+${s}${f} ${s}h${g} ${s}p${f} ${s}h${g} ${s}p${f} ${s}h${g} ${s}p${f} ${s}p0`),'|',h.slice(2).map(([s,f,g])=>`${dr}+${s}${f} ${s}h${g} ${s}p${f} ${s}h${g} ${s}p${f} ${s}h${g} ${s}p${f} ${s}p0`)),
  J('/6',h.map(([s,f])=>`${dr}+${s}0 ${s}h${f} ${s}p0 ${s}h${f} ${s}p0 ${s}h${f}`),'|',rev(h).map(([s,f,g])=>`${dr}+${s}${f} ${s}h${g} ${s}p${f} ${s}h${g} ${s}p${f} ${s}p0`))];};
add('L26',2,
 {name:'Трели',goal:'Ровная трель хаммерами и пуллами, пока бас держит долю.',how:'Трель — быстрое чередование двух нот одной струны: открытая и прижатая, потом две прижатые. Правая рука щиплет только первую ноту, остальное — левая. Варианты — разные строи и лады.',tip:'Двигается только кончик пальца, ладонь спокойна. Все ноты трели одной громкости — слушай, не тонет ли нота после пулла.',lvl:['Трель восьмыми','Шестнадцатыми','С бурдоном','Трель между двумя ладами','Секстоли']},
 {name:'Trills',goal:'An even trill of hammers and pulls while the bass keeps the beat.',how:'A trill is a fast alternation of two notes on one string: open and fretted, then two fretted notes. The picking hand plucks only the first note, the rest is the fretting hand. Variants are different tunings and modes.',tip:'Only the fingertip moves, the palm stays still. All trill notes equally loud: listen whether the note after the pull-off fades.',lvl:['Trill in eighths','In sixteenths','With a drone','Trill between two frets','Sextuplets']},
 ['Am','Amx','dg','og','oc','odm'].map(k=>hlv(k,l26)));

/* L27 формы вверх по грифу с открытыми струнами */
const SH=[
 [X.E,'A','D',2,[7,5,4,2],'Квинты {E}–{D}–{C#}–{B}','Fifths {E}–{D}–{C#}–{B}'],
 [X.dd,'E','D',0,[0,2,4,5],'Октавы {D}–{E}–{F#}–{G}','Octaves {D}–{E}–{F#}–{G}'],
 [X.dg,'D','G',0,[7,5,4,2],'Кварты вниз от 7-го лада','Fourths down from fret 7'],
 [X.og,'D','G',0,[12,9,7,5],'Кварты высоко: 12–5-й лад','Fourths up high: frets 12–5'],
 [X.od,'A','D',0,[2,4,5,7],'Кварты вверх от 2-го лада','Fourths up from fret 2'],
 [X.oc,'A','D',0,[2,4,5,7],'Кварты в {C}','Fourths in {C}']];
const l27=(s1,s2,d,P)=>{const a=f=>s1+f,b=f=>s2+(f+d),o=['B0','e0'],R=rev(P),
  p1=f=>`${a(f)}+${b(f)}+B0+e0:4`,p2=f=>[a(f),b(f),...o],p3=f=>[a(f),b(f),'B0','e0','B0',b(f)],p4=f=>[a(f),b(f),'B0','e0',b(f),'B0','e0','B0'],
  p5=f=>[a(f),s2+'0',s2+'h'+(f+d),'B0','e0','B0',b(f),'e0'];return [
  J(p1(P[0]),p1(P[1]),'|',p1(P[2]),p1(P[3])),
  J(p2(P[0]),p2(P[1]),'|',p2(P[2]),p2(P[3])),
  J('/3',p3(P[0]),p3(P[1]),'|',p3(P[2]),p3(P[3])),
  [J('/4',p4(P[0]),p4(P[1]),'|',p4(P[2]),p4(P[3])),J('/4',p4(R[0]),p4(R[1]),'|',p4(R[2]),p4(R[3]))],
  [J('/4',p5(P[0]),p5(P[1]),'|',p5(P[2]),p5(P[3])),J('/4',p5(R[0]),p5(R[1]),'|',p5(R[2]),p5(R[3]))]];};
add('L27',2,
 {name:'Формы по грифу и открытые струны',goal:'Двухнотная форма едет по грифу, открытые струны звенят поверх.',how:'Левая рука держит форму из двух нот и переносит её целиком на новый лад. Верхние открытые струны не меняются — получаются звенящие аккорды. Варианты: квинты, октавы, кварты, разные строи и направления.',tip:'Переезжай во время последней ноты перед сменой, не раньше. Открытые струны не должны глохнуть от переезда.',lvl:['Аккорды половинными','Арпеджио восьмыми','Триоли','Шестнадцатые, туда и обратно','Хаммер в форму']},
 {name:'Shapes up the neck with open strings',goal:'A two-note shape travels along the neck while open strings ring on top.',how:'The fretting hand holds a two-note shape and moves it as a whole to a new fret. The top open strings stay the same: ringing chords. Variants: fifths, octaves, fourths, different tunings and directions.',tip:'Shift during the last note before the change, not earlier. The open strings must not die during the shift.',lvl:['Chords in halves','Arpeggio in eighths','Triplets','Sixteenths, there and back','Hammer-on into the shape']},
 SH.map(([x,s1,s2,d,P,r,e])=>vr(x,r,e,l27(s1,s2,d,P))));

/* L28 барре в открытых строях */
const l28=p=>{const tp=c=>c.t.slice(1).join('+'),ap=c=>c.f>=2?c.t.slice(1).map(t=>sft(t,-2)).join('+'):tp(c),
  hm=c=>c.f>=2?c.t.slice(1).map(t=>t.replace(/^([eBGDAE])/,'$1h')).join('+'):tp(c),
  l4=c=>[pin(c.b[0],ap(c)),hm(c),c.b[1],c.t[2],c.b[0],c.t[0],c.b[1],c.t[2]],trp=F.tr;return [
  J(`${p[0].full}:4 ${p[1].full}:4`,'|',`${p[2].full}:4 ${p[3].full}:4`),
  [J(trp(p[0]),'|',trp(p[1])),J(trp(p[2]),'|',trp(p[3]))],
  [J(half(trp(p[0])),half(trp(p[1])),'|',half(trp(p[2])),half(trp(p[3]))),J(trp(p[2]),'|',trp(p[0]))],
  [J(l4(p[0]),'|',l4(p[1])),J(l4(p[2]),'|',l4(p[3]))],
  [J('/3',swp(l4(p[0])),'|',swp(l4(p[1]))),J('/3',swp(l4(p[2])),'|',swp(l4(p[3])))]];};
const BR=[[X.og,X.og.p],[X.od,X.od.p],[X.oc,X.oc.p],[X.oe,X.oe.p],[X.oa,X.oa.p],[{},[eb('{F}',1),eb('{A#}',6),eb('{C}',8),eb('{F}',1)]]];
add('L28',2,
 {name:'Барре в открытом строе',goal:'Один палец — целый аккорд: I, IV, V прямым барре по ладам.',how:'В открытом строе мажорный аккорд — открытые струны или барре одним пальцем на 5-м и 7-м ладу. Большой палец ведёт Трэвис, барре переезжает целиком. С 4-го уровня верх аккорда приходит хаммером с двух ладов ниже — вместо слайда. Последний вариант — то же в стандартном строе формой {E}.',tip:'Барре давит только там, где нужно: при переезде ослабь и скользи. Хаммер двумя пальцами сразу, обе ноты вместе.',lvl:['Аккорды половинными','Трэвис на барре','Смены в половине такта','Хаммер в барре','Свинг']},
 {name:'Barre in an open tuning',goal:'One finger, a whole chord: I, IV, V as a straight barre.',how:'In an open tuning the major chord is the open strings or a one-finger barre at frets 5 and 7. The thumb runs a Travis pattern, the barre moves as a whole. From level 4 the top of the chord arrives by a hammer-on from two frets below, in place of a slide. The last variant is the same in standard tuning with the {E} shape.',tip:'The barre presses only where it must: ease off and glide when you shift. Hammer with two fingers at once, both notes together.',lvl:['Chords in halves','Travis on the barre','Half-bar changes','Hammer-on into the barre','Swing']},
 BR.map(([x,p])=>{const n=p.map(c=>c.nm).join('–');return vr(x,n,n,l28(p));}));

/* L29 бенды и вибрато */
const BN=[[X.G,'E0',['B',3,5],['G',4,5],'G2','B0','{E}m'],[X.Am,'A0',['G',2,4],['B',5,6],'B3','e0','{A}m'],[X.E,'E0',['G',2,4],['B',3,4],'B2','G1','{E}'],
 [X.dg,'E0',['B',2,4],['B',4,5],'G2','e0','{D}'],[X.og,'A0',['B',3,5],['G',4,5],'e2','B0','{G}'],[X.odm,'E0',['G',2,4],['e',2,3],'B3','G0','{D}m']];
const l29=(dr,[s1,f1,t1],[s2,f2,t2],vb,lo)=>{const w=`${s1}${f1}b${t1}`,wr=`${s1}${f1}b${t1}r${f1}`,hb=`${s2}${f2}b${t2}`;return [
  J(`${dr}+${vb}~:4`,`${pin(dr,lo)}~:4`),
  J(`${dr}+${hb}:2`,`${s2}${f2}:2`,`${pin(dr,lo)}:2`,`${vb}~:2`),
  J(`${dr}+${wr}:4`,`${lo}:2`,`${dr}+${vb}~:2`),
  J(`${dr}+${w}:2`,lo,vb,`${dr}+${hb}:2`,lo,vb,'|',`${dr}+${vb}~:4`,`${pin(dr,lo)}:2`,`${dr}:2`),
  J('/3',`${dr}+${wr}:2`,lo,`${dr}+${vb}:2`,hb,`${pin(dr,lo)}:2`,vb,`${dr}+${vb}~:3`)];};
add('L29',2,
 {name:'Вибрато и бенды на акустике',goal:'Петь на толстых струнах акустики: небольшие бенды и вибрато над басом.',how:'На акустике струны тугие, поэтому бенды небольшие: полтона и тон. Тянут два-три пальца вместе, большой палец держит бас. Вибрато — ровное покачивание кистью, не пальцем. Варианты — разные лады, строи и струны бенда.',tip:'Сначала сыграй целевую ноту без бенда и запомни её. Бенд, который не дотянут, звучит фальшиво: лучше полтона точно, чем тон мимо.',lvl:['Вибрато на долгих нотах','Бенд в полтона','Бенд в тон с возвратом','Бенды над басом','Фраза в свинге']},
 {name:'Vibrato and bends on acoustic',goal:'Make the heavy acoustic strings sing: small bends and vibrato over the bass.',how:'Acoustic strings are stiff, so the bends are small: a half step and a whole step. Push with two or three fingers together while the thumb keeps the bass. Vibrato is an even rocking of the wrist, not the finger. Variants: different modes, tunings and bend strings.',tip:'Play the target note first without a bend and memorise it. An under-bend sounds out of tune: better a half step in tune than a whole step off.',lvl:['Vibrato on long notes','Half-step bend','Whole-step bend and release','Bends over the bass','A phrase in swing']},
 BN.map(([x,dr,n1,n2,vb,lo,k])=>vr(x,k,k,l29(dr,n1,n2,vb,lo))));

/* L30 басовые ходы под аккордом */
const WK=[[X.C,['G0','B1'],['A3','A2','A0','E3','E1','E0','E3','A3'],'Нисходящий бас в {C}','Descending bass in {C}'],
 [X.G,['G0','B0'],['E3','E2','E0','D0','A3','A2','A0','D0'],'Нисходящий бас в {G}','Descending bass in {G}'],
 [X.Am,['G2','B1'],['A0','E4','E3','E2','E1','E0','A2','A0'],'Хроматический спуск в {A}m','Chromatic descent in {A}m'],
 [X.dg,['B0','e0'],['E0','A4','A2','A0','E5','E4','E2','A0'],'Спуск под открытыми {A}+{D}','Descent under open {A}+{D}'],
 [X.og,['B0','e0'],['A0','E4','E2','E0','A5','A4','A2','E0'],'Спуск и ход к {C}','Descent and walk to {C}'],
 [X.od,['G0','e0'],['E0','E2','E4','E5','A0','A2','A4','A5'],'Восходящий бас в {D}','Ascending bass in {D}']];
const l30=([x,y],W)=>{const T=x+'+'+y,b=(i,t)=>pin(W[i],t);return [
  J(`${b(0,T)}:4 ${W[1]}:4`,'|',`${b(2,T)}:4 ${W[3]}:4`),
  J(`${b(0,T)}:2`,q(W.slice(1,4)),'|',`${b(4,T)}:2`,q(W.slice(5,8))),
  J([0,1,2,3].flatMap(i=>[W[i],T]),'|',[4,5,6,7].flatMap(i=>[W[i],T])),
  J(b(0,y),x,W[1],y,b(2,y),x,W[3],y,'|',b(4,y),x,W[5],y,b(6,y),x,W[7],y),
  [J('/3',[0,1,2,3].map(i=>`${W[i]}:2 ${T}`),'|',[4,5,6,7].map(i=>`${W[i]}:2 ${T}`)),J('/3',[0,1,2,3].map(i=>`${W[i]}:2 ${T}`),'|',`${b(7,T)}:12`)]];};
add('L30',2,
 {name:'Басовые ходы под аккордом',goal:'Бас идёт по ступеням, а верх аккорда стоит на месте.',how:'Верхние ноты держатся весь такт, большой палец ведёт басовую линию по нижним струнам: вниз по гамме, хроматически или вверх. Левая рука держит верх неподвижно, двигаются только басовые пальцы. Варианты — разные линии и строи.',tip:'Верхние ноты не должны обрываться, когда бас переходит. Если рвутся — смени аппликатуру баса.',lvl:['Половинные','Четверти','Восьмые: бас и аккорд','Бас и верх по очереди','Свинг и остановка']},
 {name:'Bass lines under a chord',goal:'The bass walks by steps while the top of the chord stays put.',how:'The top notes hold for the whole bar, the thumb walks a bass line on the low strings: down the scale, chromatically or up. The fretting hand keeps the top still, only the bass fingers move. Variants are different lines and tunings.',tip:'The top notes must not cut off when the bass moves. If they do, change the bass fingering.',lvl:['Halves','Quarters','Eighths: bass and chord','Bass and top in turn','Swing and a stop']},
 WK.map(([x,T,W,r,e])=>vr(x,r,e,l30(T,W))));

/* L31 независимость большого пальца */
const l31=x=>{const m=x.mel,[b0,b1]=x.p[0].b,P=(b,t)=>pin(b,t),cy=m.concat(rev(m).slice(1,7)),s6=o=>[0,1,2,3].flatMap(i=>{const k=o+i*3;return [P(b0,cy[k%14]),'.',cy[(k+1)%14],b1,cy[(k+2)%14],'.'];});return [
  J([0,1,2,3].map(i=>`${P(i%2?b1:b0,m[i*2])}:2`),'|',[0,1,2,3].map(i=>`${P(i%2?b1:b0,m[7-i*2])}:2`)),
  J(b0,m[4],b1,m[3],b0,m[2],b1,m[1],'|',b0,m[5],b1,m[6],b0,m[7],b1,m[6]),
  J(P(b0,m[0]),'.',b1,m[1],b0,m[2],P(b1,m[3]),'.','|',P(b0,m[4]),'.',b1,m[5],b0,m[6],P(b1,m[7]),'.'),
  J('/4',P(b0,m[0]),'.','.',m[1],b1,'.',m[2],'.',P(b0,m[3]),'.',m[4],'.',b1,m[5],'.','.','|',P(b0,m[7]),'.','.',m[6],b1,'.',m[5],'.',P(b0,m[4]),'.',m[3],'.',b1,m[2],'.','.'),
  J('/6',s6(0),'|',s6(12))];};
add('L31',2,
 {name:'Независимость большого пальца',goal:'Большой палец играет ровно, что бы ни делали пальцы.',how:'Бас — ровные четверти или восьмые, мелодия ложится то на долю, то между долями, то в синкопу. На 5-м уровне — три против двух: бас восьмыми, мелодия триолями. Варианты — разные тональности и строи.',tip:'Большой палец — метроном. Если бас подстраивается под мелодию, замедлись и играй бас громче.',lvl:['Пинчи на долю','Мелодия между басом','Синкопы','Шестнадцатые синкопы','Три против двух']},
 {name:'Thumb independence',goal:'The thumb keeps steady whatever the fingers do.',how:'The bass is steady quarters or eighths, the melody lands on the beat, between beats, or syncopated. On level 5: three against two, bass in eighths and melody in triplets. Variants are different keys and tunings.',tip:'The thumb is the metronome. If the bass bends to the melody, slow down and play the bass louder.',lvl:['Pinches on the beat','Melody between the bass','Syncopation','Sixteenth syncopation','Three against two']},
 [X.C,X.G,X.dg,X.og,X.od,X.odm].map(x=>vr(x,x.p[0].nm,x.p[0].nm,l31(x))));

/* L40 глушение левой рукой */
const l40=x=>{const p=x.p,st=c=>[c.full,'.',c.full,'.',c.full,'.',c.full,'.'],ck=c=>[c.full+':2',c.x,c.full,'.',c.x,c.full+':2'],
  ar=c=>[c.b[0],c.t[1],'.',c.t[2],c.b[1],c.t[1],c.x,'.'],gr=c=>[c.full,'.',c.x,c.full,'.',c.x,c.full,'.',c.x,'.',c.full,c.x,c.full,'.',c.x,'.'],
  bs=c=>[c.b[0],'.',c.top,c.x,c.b[1],c.x,c.top,'.',c.b[0],c.top,c.x,'.',c.b[1],'.',c.top,c.x];return [
  J(st(p[0]),'|',st(p[1])),J(ck(p[0]),'|',ck(p[1])),
  [J(ar(p[0]),'|',ar(p[1])),J(ar(p[2]),'|',ar(p[3]))],
  [J('/4',gr(p[0]),'|',gr(p[1])),J('/4',gr(p[2]),'|',gr(p[3]))],
  [J('/4',bs(p[0]),'|',bs(p[1])),J('/4',bs(p[2]),'|',bs(p[3]))]];};
add('L40',2,
 {name:'Глушение левой рукой',goal:'Короткие ноты и глухие удары: левая рука делает паузы.',how:'После ноты пальцы левой руки ослабляют нажим, не отрываясь от струн, — звук обрывается. Мёртвая нота (x) — удар по струнам при ослабленной форме. Паузы точно по сетке, как в фанке. Варианты — разные ходы и строи.',tip:'Не отрывай пальцы совсем — иначе зазвучат открытые струны. В открытом строе глушить труднее: подключай ребро ладони правой руки.',lvl:['Стаккато аккордами','Аккорд и глухой удар','Арпеджио с паузами','Шестнадцатые','Бас, аккорд и глушение']},
 {name:'Fretting-hand muting',goal:'Short notes and dead hits: the fretting hand makes the rests.',how:'After a note the fretting fingers ease off without leaving the strings: the sound cuts off. A dead note (x) is a hit on the strings with the shape eased. Rests land exactly on the grid, as in funk. Variants are different progressions and tunings.',tip:'Do not lift the fingers off completely, or the open strings will ring. Muting is harder in an open tuning: add the edge of the picking hand.',lvl:['Staccato chords','Chord and a dead hit','Arpeggio with rests','Sixteenths','Bass, chord and muting']},
 [X.G,X.Am,X.E,X.dd,X.og,X.oc].map(x=>vr(x,pn(x),pn(x),l40(x))));

/* C32 Трэвис → мелодия */
const c32=x=>{const p=x.p,T=F.tr(p[0]),A=mbA(p[0],x.mel),D=mbD(p[0],x.mel);return [
  J(T,'|',A),
  [J(T,'|',A),J(T,'|',D)],
  J(half(T),half2(A),'|',half(D),half2(T)),
  [J(T,'|',F.tr(p[1])),J(A,'|',D)],
  [J('/3',swp(T),'|',swp(F.tr(p[1]))),J('/3',swp(A),'|',swp(D)),J(`${p[0].full}:4 ${H('G',12)}+${H('B',12)}+${H('e',12)}:4`)]];};
add('C32',2,
 {name:'Трэвис → мелодия',goal:'Из аккомпанемента в мелодию и обратно без шва.',how:'Такт Трэвиса на тонике, потом такт мелодии над басом. Большой палец на стыке не останавливается: меняются только пальцы. Варианты — разные тональности и строи.',tip:'Стык — главное место. Если он рвётся, сыграй только последнюю долю Трэвиса и первую долю мелодии.',lvl:['Такт Трэвиса, такт мелодии','Мелодия вверх и вниз','Стык в середине такта','Смена аккорда','Свинг и концовка']},
 {name:'Travis → melody',goal:'From accompaniment into melody and back without a seam.',how:'A bar of Travis on the tonic, then a bar of melody over the bass. The thumb does not stop at the joint: only the fingers change. Variants are different keys and tunings.',tip:'The joint is the key spot. If it breaks, play just the last beat of Travis and the first beat of the melody.',lvl:['A bar of Travis, a bar of melody','Melody up and down','Joint mid-bar','Chord change','Swing and an ending']},
 [X.C,X.G,X.Am,X.dg,X.og,X.od].map(x=>vr(x,x.p[0].nm,x.p[0].nm,c32(x))));

/* C33 перкуссия → арпеджио */
const c33=(x,f)=>{const p=x.p,g=p.map(G.g0),a=p.map(F[f]),g16=p.map(G.g16);return [
  J(g[0],'|',a[0]),J(g[0],'|',a[1]),
  [J(g[0],'|',a[1]),J(g[2],'|',a[3])],
  [J(half(g[0]),half2(a[0]),'|',half(a[1]),half2(g[1])),J(half(g[2]),half2(a[2]),'|',half(a[3]),half2(g[3]))],
  [J('/4',g16[0],'|',a[1],a[1]),J('/4',a[2],a[2],'|',g16[3])]];};
add('C33',2,
 {name:'Перкуссия → арпеджио',goal:'Правая рука переключается между битом и щипком.',how:'Такт бита с ударами по струнам, потом такт арпеджио на следующем аккорде. На стыке рука собирается из удара в позицию щипка. Варианты — разные фигуры арпеджио, ходы и строи.',tip:'Удар не должен глушить следующий аккорд: после удара рука сразу уходит вверх.',lvl:['Такт бита, такт арпеджио','Смена аккорда','Весь ход','Стык в середине такта','Шестнадцатые']},
 {name:'Percussion → arpeggio',goal:'The picking hand switches between beat and fingerpicking.',how:'A bar of beat with hits on the strings, then a bar of arpeggio on the next chord. At the joint the hand gathers from the hit into picking position. Variants are different arpeggio figures, progressions and tunings.',tip:'The hit must not choke the next chord: after the hit the hand lifts at once.',lvl:['A bar of beat, a bar of arpeggio','Chord change','The whole progression','Joint mid-bar','Sixteenths']},
 [[X.G,'pima','p-i-m-a','p-i-m-a'],[X.Am,'pami','p-a-m-i','p-a-m-i'],[X.E,'roll','волна','wave'],[X.dd,'banjo','банджо-ролл','banjo roll'],[X.dg,'casc','каскад','cascade'],[X.oc,'pima','p-i-m-a','p-i-m-a']]
 .map(([x,f,r,e])=>vr(x,`${r}, ${pn(x)}`,`${e}, ${pn(x)}`,c33(x,f))));

/* C34 флажолеты → аккорды */
const c34=(x,hb,f)=>{const p=x.p,hh=n=>[hb[0],H('G',n),H('B',n),H('e',n),hb[1],H('B',n),H('G',n),H('B',n)],a=p.map(F[f]);return [
  J(hh(12),'|',p[0].full+':8'),
  J(hh(12),'|',a[0]),
  [J(hh(12),'|',a[0]),J(hh(7),'|',a[1])],
  [J(half(hh(12)),half2(a[0]),'|',half(hh(7)),half2(a[1])),J(a[2],'|',hh(5))],
  [J('/4',hh(12),hh(7),'|',a[0],a[1]),J('/4',a[2],a[3],'|',hh(5),hh(12))]];};
add('C34',2,
 {name:'Флажолеты → аккорды',goal:'Из прозрачных флажолетов в плотный аккорд и обратно.',how:'Такт флажолетов над открытым басом, потом такт арпеджио на аккорде. Левая рука переходит от лёгкого касания к полному нажиму. Варианты — разные строи, ходы и фигуры.',tip:'Флажолеты звучат тише аккорда — щипай их ближе к подставке и сильнее.',lvl:['Флажолеты и аккорд','Флажолеты и арпеджио','Два лада, два аккорда','Стык в середине такта','Шестнадцатые']},
 {name:'Harmonics → chords',goal:'From transparent harmonics into a full chord and back.',how:'A bar of harmonics over an open bass, then a bar of arpeggio on a chord. The fretting hand moves from a light touch to full pressure. Variants are different tunings, progressions and figures.',tip:'Harmonics are quieter than the chord: pluck them closer to the bridge and harder.',lvl:['Harmonics and a chord','Harmonics and arpeggio','Two frets, two chords','Joint mid-bar','Sixteenths']},
 [[X.E,['E0','A0'],'pima'],[X.Am,['A0','E0'],'roll'],[X.dd,['E0','A0'],'pami'],[X.dg,['E0','A0'],'banjo'],[X.og,['A0','E0'],'pima'],[X.od,['E0','A0'],'casc']]
 .map(([x,hb,f])=>vr(x,pn(x),pn(x),c34(x,hb,f))));

/* C35 пьеса: 8 тактов */
const c35=x=>{const p=x.p,tr=F.tr,trP=F.trP,A=mbA(p[0],x.mel),D=mbD(p[0],x.mel),end=`${p[0].full}:4 ${H('G',12)}+${H('B',12)}+${H('e',12)}:4`,
  sw=a=>swp(a),pairs=b=>[J(b[0],'|',b[1]),J(b[2],'|',b[3]),J(b[4],'|',b[5]),J(b[6],'|',b[7])];return [
  [J(bas(p[0]),'|',bas(p[1])),J(bas(p[2]),'|',bas(p[3]))],
  [J(tr(p[0]),'|',tr(p[1])),J(tr(p[2]),'|',tr(p[3]))],
  pairs([tr(p[0]),tr(p[1]),tr(p[2]),tr(p[3]),A,D,tr(p[3]),end]),
  pairs([trP(p[0]),trP(p[1]),trP(p[2]),trP(p[3]),A,D,half(tr(p[2])).concat(half(tr(p[3]))),end]),
  [J('/3',sw(trP(p[0])),'|',sw(trP(p[1]))),J('/3',sw(trP(p[2])),'|',sw(trP(p[3]))),J('/3',sw(A),'|',sw(D)),J('/3',sw(half(tr(p[2])).concat(half(tr(p[3])))),'|',`${p[0].full}:6 ${H('G',12)}+${H('B',12)}+${H('e',12)}:6`)]];};
add('C35',2,
 {name:'Пьеса на восемь тактов',goal:'Форма целиком: аккомпанемент, мелодия, концовка.',how:'Четыре такта хода Трэвисом, два такта мелодии над басом, разворот и концовка флажолетом. Первые уровни — только первые четыре такта. Варианты — разные ходы и строи.',tip:'Считай такты. Сыграй форму три раза подряд без остановки — это и есть упражнение.',lvl:['Четыре такта: бас','Четыре такта: Трэвис','Вся форма','Форма с пинчами','Форма в свинге']},
 {name:'Eight-bar piece',goal:'The whole form: accompaniment, melody, ending.',how:'Four bars of the progression in Travis, two bars of melody over the bass, a turnaround and a harmonic ending. The first levels are only the first four bars. Variants are different progressions and tunings.',tip:'Count the bars. Play the form three times in a row without stopping: that is the exercise.',lvl:['Four bars: bass','Four bars: Travis','The whole form','The form with pinches','The form in swing']},
 [X.C,X.G,X.dd,X.dg,X.og,X.od].map(x=>vr(x,pn(x),pn(x),c35(x))));

/* C36 этюд: Трэвис, кампанелла, флажолеты, перкуссия — по системе на фрагмент */
const ET=[[CAM[0],['E0','A0']],[CAM[1],['A0','E0']],[CAM[2],['E0','A0']],[CAM[3],['E0','A0']],[CAM[4],['E0','A0']],[CAM[5],['E0','A0']]];
const c36=([x,cam,cb],hb)=>{const p=x.p,T=p.map(F.tr),Cm=a19(cam,cb),Hm=a20(12,7,hb),Pg=p.map(G.g0),P16=p.map(G.g16);return [
  [J(T[0]),Cm[0],J(['E','A','D','G','B','e','B','G'].map(s=>H(s,12))),J(Pg[0])],
  [J(T[0],'|',T[1]),Cm[1],Hm[2],J(Pg[0],'|',Pg[1])],
  [J('/3',swp(T[0]),'|',swp(T[1])),Cm[2],Hm[3],J(Pg[0],'|',Pg[1],'|',Pg[2],'|',Pg[3])],
  [J(T[0],'|',T[1],'|',T[2],'|',T[3]),Cm[3],Hm[3],J('/4',P16[0],'|',P16[1])],
  [J('/3',swp(T[0]),'|',swp(T[1]),'|',swp(T[2]),'|',swp(T[3])),Cm[4],Hm[4],J('/4',P16[0],'|',P16[1],'|',P16[2],'|',P16[3])]];};
add('C36',2,
 {name:'Этюд',goal:'Четыре приёма фингерстайла подряд, как в настоящей пьесе.',how:'Четыре фрагмента: Трэвис, кампанелла, флажолеты, перкуссия. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком. Варианты — разные строи и тональности.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке: правая рука меняет роль, левая — нажим.',lvl:['Такт на фрагмент','Два такта на фрагмент','Свинг, бас под кампанеллой','Длинные фрагменты, двойные флажолеты','Свинг, шестнадцатые, весь ход']},
 {name:'Étude',goal:'Four fingerstyle techniques in a row, like a real piece.',how:'Four fragments: Travis, campanella, harmonics, percussion. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing. Variants are different tunings and keys.',tip:'Record a full run on your phone. The weak spot is almost always a joint: the picking hand changes role, the fretting hand changes pressure.',lvl:['A bar per fragment','Two bars per fragment','Swing, bass under the campanella','Long fragments, double harmonics','Swing, sixteenths, the whole progression']},
 ET.map(([c,hb])=>vr(c[0],`Этюд в ${c[3]}`,`Étude in ${c[3]}`,c36(c,hb))));

return {EX,EXEN:EN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@FSA2_END@*/

// общий сборщик: база того же инструмента (у акустики — блюзовая акустика), поверх — обе части
const genreLib=bluesLib;
LIBS.jazz={guitar:genreLib(LIBS.metal.guitar,JZG1,JZG2),acoustic:genreLib(LIBS.blues.acoustic,JZA1,JZA2),bass:genreLib(LIBS.metal.bass,JZB1,JZB2)};
LIBS.funk={guitar:genreLib(LIBS.metal.guitar,FKG1,FKG2),bass:genreLib(LIBS.metal.bass,FKB1,FKB2)};
LIBS.fingerstyle={acoustic:genreLib(LIBS.blues.acoustic,FSA1,FSA2)};
// размеры риффа дня по жанрам (у блюза — RIFF_METERS_BLUES)
const GENRE_METERS={
  jazz:{ru:['4/4, свинг','4/4, медленный свинг','3/4, джаз-вальс','5/4','4/4, босса-нова','4/4, баллада','6/8','4/4, быстрый свинг'],
        en:['4/4 swing','4/4 medium swing','3/4 jazz waltz','5/4','4/4 bossa nova','4/4 ballad','6/8','4/4 up-tempo swing']},
  funk:{ru:['4/4, шестнадцатые','4/4, шестнадцатые со свингом','4/4, синкопы на «и»','4/4, полутемп','4/4, вступление со второй шестнадцатой','7/8','4/4, один такт по кругу','12/8, шаффл-фанк'],
        en:['4/4 sixteenths','4/4 swung sixteenths','4/4 offbeat syncopation','4/4 half-time','4/4 start on the second sixteenth','7/8','4/4 one-bar vamp','12/8 shuffle funk']},
  fingerstyle:{ru:['4/4','3/4','6/8','4/4, переменный бас','2/4, рэгтайм','12/8','5/4','4/4, рубато в последнем такте'],
               en:['4/4','3/4','6/8','4/4 alternating bass','2/4 ragtime','12/8','5/4','4/4, rubato in the last bar']}
};
Object.keys(GENRE_METERS).forEach(g=>Object.values(LIBS[g]).forEach(l=>{l.METERS=GENRE_METERS[g];}));
const LIB_NOW=()=>LIBS[GENRE][INST];
function riffRules(){return LIB_NOW().RIFF;}
// Активный инструмент подменяет наборы данных; план дня, тренер и рендер работают с EX/EXEN/GROUPS/TESTS/COACH.
function applyInst(){const o=LIB_NOW();EX=o.EX;EXEN=o.EXEN;GROUPS=o.GROUPS;TESTS=o.TESTS;COACH=o.COACH;Pl.ac=INST==='acoustic';Pl.hand=HAND;}
const rng3=a=>({lo:a[0],hi:a[1],p:a[2]});
// Подогнать длительности к S секундам шагом 5 с: сначала в пределах диапазонов, потом за счёт подходов. null — не выходит.
function coFit(items,S){
  const d=items.map(x=>x.p);let D=S-d.reduce((a,b)=>a+b,0);
  const sweep=ok=>{let moved=true;while(D&&moved){moved=false;items.forEach((x,k)=>{const s=D>0?5:-5;if(D&&ok(x,d[k]+s)){d[k]+=s;D-=s;moved=true;}});}};
  sweep((x,v)=>v>=x.lo&&v<=x.hi);
  sweep((x,v)=>x.flex&&v>=10);
  return D?null:d;
}
// Перебрать число подходов и отдых в конце; взять раскладку, ближе всего к «обычно» и без выхода за диапазоны.
function coLayout(S,head,setAt,rest,nPref){
  let best=null;
  const nMax=Math.min(40,Math.floor(S/20)+1);
  for(let n=1;n<=nMax;n++)for(const trail of[0,1]){
    const items=head.map(x=>Object.assign({},x));
    for(let k=0;k<n;k++){items.push(Object.assign({type:'set',flex:true,k,n},setAt(k,n)));if(k<n-1||trail)items.push(Object.assign({type:'rest'},rest(k,n)));}
    const d=coFit(items,S);if(!d)continue;
    let dev=0,out=0;items.forEach((x,j)=>{dev+=Math.abs(d[j]-x.p)/x.p;out+=Math.max(0,x.lo-d[j],d[j]-x.hi);});
    let c=dev/items.length+out/20+(trail?0.25:0);
    if(nPref)c+=0.5*Math.max(0,nPref[0]-n,n-nPref[1]);
    if(!best||c<best.c-1e-9)best={c,items,d};
  }
  return best.items.map((x,j)=>{const o=Object.assign({},x,{sec:best.d[j]});delete o.lo;delete o.hi;delete o.p;delete o.flex;return o;});
}
// Фрагмент этюда в x/8: пульс — восьмая, поэтому деление считается от первого деления фрагмента (/2 — восьмые, без /n — sub упражнения).
function stageMeter(x,meter,sys){
  x.meter=meter;
  const den=+String(meter).split('/')[1]||4;if(den===4)return;
  const m=String(sys||'').trim().match(/^\/(\d+)/),sub=Math.round((m?+m[1]:x.sub)*4/den);
  x.sub=[1,2,3,4,6].includes(sub)?sub:1;
}
const fixed=(type,sec,extra)=>Object.assign({type,lo:sec,hi:sec,p:sec},extra||{});
function coachPlan(s,d,lv){
  const S=s.min*60;
  if(s.kind==='test'){
    const mins=splitInt(s.min,TESTS.map(()=>1));const out=[];
    TESTS.forEach((tt,j)=>{
      if(!mins[j])return;
      // между тестами — отдых в начале следующего теста (подготовки нет)
      const base={blk:j,test:tt.id,tag:[[tt.ru[0],tt.en[0]]],sub:tt.sub,meter:'4/4',burst:0};
      const sr=rng3(TEST_CO.set[tt.id.replace(/^[A-Z]*(?=T)/,'')]||TEST_CO.def); // у баса BT1…BT5, у блюза GBT/ABT/BBT — те же длительности, что у T1…T5
      out.push(...coLayout(mins[j]*60,out.length&&out[out.length-1].type==='set'?[fixed('rest',20,{blk:j})]:[],k=>Object.assign({},base,sr,{tempo:[k?'ladder':'ladder0']}),()=>Object.assign({blk:j},rng3(TEST_CO.rest)),null));
    });
    return out;
  }
  const lead=s.kind==='warm'?s.id!=='W1':['base','focus','maint','combo'].includes(s.kind);
  if(!lead)return null;
  const r=resolveEx(s,d,lv);const c=COACH[s.id]||{};
  const vi=(EX[s.id].v&&EX[s.id].v.length)?varIdx(s,d):-1;
  const cv=(c.v&&c.v[vi])||{};const cyc=cv.cyc||c.cyc;const stages=cv.stages||c.stages||(s.kind==='combo'?COMBO_STAGES:null);
  const head=c.free?[fixed('free',c.free)]:[];
  let co,nPref=null;
  if(s.kind==='warm'){co=WARM_CO;nPref=WARM_CO.n;}
  else if(s.kind==='maint'){co=MAINT_CO;nPref=MAINT_CO.n;}
  else co=PHASES[d.week].co;
  const speed=d.week===2&&s.kind!=='warm'&&s.kind!=='maint';
  const setAt=(k,n)=>{
    const x=Object.assign(rng3(co.set),{sub:r.sub,meter:r.meter,burst:0,tag:[],tempo:[]});
    if(s.kind==='warm')x.tempo=['warm'];
    else if(s.kind==='maint')x.tempo=['maint'];
    else if(d.week===0)x.tempo=[n>1&&k===0?'find':'vol'];
    else if(d.week===1)x.tempo=[k===0?'build0':(n>=5&&k>=n-3?'top':'build')];
    else if(d.week===2){
      if(k%4===3){Object.assign(x,rng3(co.work));x.tag.push(['Минута на рабочем темпе, без рывков','A minute at working tempo, no bursts']);x.tempo=['work'];}
      else{const b=[1,2,4][(k-Math.floor((k+1)/4))%3];x.burst=b;x.tag.push(['Рывки '+b+'/'+b,'Bursts '+b+'/'+b]);x.tempo=[k%4===0?'burst':'same'];}
    }
    else{x.tempo=['deload'];if(n>=2&&k===Math.floor(n/2))x.tag.push(['Чистым звуком, без перегруза','Clean tone, no gain']);}
    if(stages){const g=n===1?stages.length-1:Math.round(k*(stages.length-1)/(n-1));x.tag.unshift(stages[g]);if(cv.stageMeter&&cv.stageMeter[g])stageMeter(x,cv.stageMeter[g],r.v.t[g]);}
    if(cyc){const o=cyc[k%cyc.length];if(o.sub)x.sub=o.sub;if(o.tag)x.tag.push(o.tag);
      if(o.play){x.play=o.play;x.from=r.sub||1;}
      if(o.bpmMul){x.bpmMul=o.bpmMul;x.burst=0;x.tempo=[o.bpmMul===0.5?'half':'mul'];}
      if(o.play||o.bpmMul)x.demo=(o.play||'')+'x'+(o.bpmMul||1);
      if(k>0&&cyc[(k-1)%cyc.length].bpmMul&&!o.bpmMul)x.tempo.unshift('back');}
    return x;
  };
  const rest=()=>rng3(co.rest);
  return coLayout(S,head,setAt,rest,nPref);
}

// hold — таймер стоит в начале (или посреди) подхода k: ph 'listen' — играет пример, 'ready' — ждём «Готов», 'count' — идёт отсчёт.
// arm — отсчёт, запланированный по часам Web Audio: подход и метроном вступают в goAt. heard — первые подходы, где пример уже был.
const co={on:true,key:'',iv:null,idx:-1,hold:null,arm:null,heard:{},base:null};
const coActive=()=>co.on&&!!co.iv;
// Смена уровня пересчитывает указания, но не позицию: раскладка подходов от уровня не зависит.
function coSync(){
  const s=st.plan.segs[st.cur],key=st.i+'|'+st.T+'|'+st.cur,lk=s.id?getLvl(s.id)+'|'+s.pick:'';
  if(co.key!==key){coCancel();coBpm(null);if(co.hold&&co.hold.ph==='listen')plStop();co.hold=null;co.heard={};co.key=key;co.lk=lk;co.iv=coachPlan(s,st.plan.d);co.idx=-1;}
  else if(co.lk!==lk){co.lk=lk;co.iv=coachPlan(s,st.plan.d);}
}
// Где мы внутри сегмента: индекс интервала и сколько секунд до его конца.
function coPos(){
  const el=st.plan.segs[st.cur].min*60-st.remain;let c=0;
  for(let k=0;k<co.iv.length;k++){c+=co.iv[k].sec;if(el<c-1e-6)return{k,left:c-el};}
  return{k:co.iv.length-1,left:0};
}
function cue(){
  const c=audio();if(!c)return;const t0=c.currentTime+0.01;
  [0,0.16].forEach(dt=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=440;
    g.gain.setValueAtTime(0.0001,t0+dt);g.gain.exponentialRampToValueAtTime(0.35,t0+dt+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t0+dt+0.12);o.connect(g).connect(c.destination);o.start(t0+dt);o.stop(t0+dt+0.14);});
}
function coMetro(x){coBpm(x.bpmMul);setSub(x.sub);setMeter(x.meter);Mt.burst=x.burst;Mt.bc=0;$('mBurst').value=String(x.burst);}
const coStart=k=>co.iv.slice(0,k).reduce((a,y)=>a+y.sec,0);
// Перед первым подходом упражнения (у тестов — каждого теста) тренер играет пример и ждёт «Готов».
// Подход с новым ритмом или темпом (demo) тоже слушается заранее, один раз на ритм.
const coFirst=k=>{const x=co.iv[k];return x.type==='set'&&((x.k===0&&!co.heard[k])||(!!x.demo&&!co.heard['d:'+x.demo]));};
// Темп подхода: bpm×bpmMul на время подхода, без сохранения; null — вернуть прежний bpm.
function coBpm(mul){
  if(mul&&mul!==1){if(co.base==null)co.base=Mt.bpm;Mt.bpm=clamp(Math.round(co.base*mul),30,320);}
  else if(co.base!=null){Mt.bpm=co.base;co.base=null;}
  else return;
  $('bpm').value=Mt.bpm;$('bpmRange').value=Mt.bpm;
}
const coBar=x=>METERS[METERS[x.meter]?x.meter:'4/4'].reduce((a,b)=>a+b,0)*60/Mt.bpm;
// Отсчёт — один такт размера подхода в темпе метронома (доля = пульс метронома, в x/8 — восьмая), сильная доля с акцентом.
// Метроном запускается сразу на goAt — следующую сильную долю, поэтому сетка не сбивается.
function coCount(k,goAt){
  const c=audio();if(!c)return null;
  const x=co.iv[k];coMetro(x);
  const sp=60/Mt.bpm,n=meterPulses(),gs=groupStarts();
  if(goAt==null||goAt-n*sp<c.currentTime+0.05)goAt=c.currentTime+0.08+n*sp;
  const t0=goAt-n*sp,osc=[];
  for(let q=0;q<n;q++)osc.push(click(t0+q*sp,q===0?3:gs.has(q)?2:1));
  if(Mt.on)metroStop();metroStart(goAt);
  return{k,goAt,t0,n,osc};
}
function coCancel(){
  if(!co.arm)return;
  const c=Mt.ctx,now=c?c.currentTime:0;
  co.arm.osc.forEach(o=>{try{o.stop(now);}catch(e){}});
  co.arm=null;if(Mt.on)metroStop();
}
// Пример: таб текущего варианта и уровня один раз, без метронома тренера.
function coListen(){
  co.hold.ph='listen';coCancel();if(Mt.on)metroStop();
  const x=co.iv[co.hold.k];coMetro(x);
  const box=x.blk!=null?(document.querySelectorAll('#nowBody .test')[x.blk]||document).querySelector('.tabbox[data-tab]'):document.querySelector('#nowBody .tabbox[data-tab]');
  if(box)plStart(box,true,x.play?{from:x.from,to:x.play}:null);
  if(!Pl.on)co.hold.ph='ready';
}
function coHoldCount(){co.hold.ph='count';co.arm=coCount(co.hold.k);if(!co.arm)co.hold=null;}
function coReady(){
  if(!co.hold||co.hold.ph==='count')return;
  co.heard[co.hold.k]=true;const x=co.iv[co.hold.k];if(x.demo)co.heard['d:'+x.demo]=true;plStop();coHoldCount();renderCoach();
}
function coachTick(){
  coSync();if(!coActive())return;
  const p=coPos(),x=co.iv[p.k];
  if(co.hold){
    const h=co.hold;
    if(h.ph==='listen'&&!Pl.on){h.ph='ready';renderCoach();}
    else if(h.ph==='count'&&co.arm&&Mt.ctx.currentTime>=co.arm.goAt){
      // подход начинается ровно с сильной доли: таймер догоняет часы Web Audio
      st.last=performance.now()-(Mt.ctx.currentTime-co.arm.goAt)*1000;co.hold=null;co.arm=null;renderCoach();
    }
    renderCoachClock(p);return;
  }
  if(p.k!==co.idx){
    const prev=co.idx>=0?co.iv[co.idx]:null;co.idx=p.k;
    if(x.type==='set'){
      // таймер мог перескочить границу на долю секунды — подход начинается с начала
      if(x.sec-p.left<0.5)st.remain=st.plan.segs[st.cur].min*60-coStart(p.k);
      if(co.arm&&co.arm.k===p.k){if(Mt.ctx.currentTime<co.arm.goAt)co.hold={k:p.k,ph:'count'};else co.arm=null;}
      else{coCancel();co.hold={k:p.k};if(coFirst(p.k))coListen();else coHoldCount();}
    }else{
      coCancel();if(Mt.on)metroStop();coBpm(null);
      if(prev&&prev.type==='set')cue();
    }
    renderCoach();
    return;
  }
  // отдых перед подходом: отсчёт так, чтобы подход вступил ровно к концу отдыха
  const nx=co.iv[p.k+1];
  if(x.type!=='set'&&nx&&nx.type==='set'&&!co.arm&&!coFirst(p.k+1)&&p.left<=coBar(nx)+0.2)co.arm=coCount(p.k+1,Mt.ctx?Mt.ctx.currentTime+p.left:null);
  renderCoachClock(p);
}
// Пауза таймера останавливает метроном, пример и отсчёт; после «Продолжить» текущий интервал применяется заново.
function coachRun(){
  if(!coActive())return;
  if(st.running)co.idx=-1;
  else{coCancel();if(co.hold&&co.hold.ph==='listen')plStop();co.hold=null;metroStop();coBpm(null);}
}
function coSkipTo(sec){
  coCancel();if(co.hold&&co.hold.ph==='listen')plStop();co.hold=null;
  st.remain=Math.max(0,sec);
  if(st.remain<=0.001){st.done.add(st.cur);if(st.cur<st.plan.segs.length-1){goto(st.cur+1,st.running);return;}st.remain=0;}
  if(!st.running)co.idx=-1;
  renderClock();
  if(st.running)coachTick();else renderCoach();
}
// Пробел = «Готов», только пока тренер ждёт; в полях ввода пробел работает как обычно.
document.addEventListener('keydown',e=>{
  if(e.code!=='Space'&&e.key!==' ')return;
  if(!coActive()||!co.hold||co.hold.ph!=='ready'||!st.running||(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]')))return;
  e.preventDefault();if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();coReady();
});
function coName(x){
  if(co.hold&&x.type==='set'){const ph=co.hold.ph;if(ph==='listen')return L('Пример','Example');if(ph==='ready')return L('Готов к подходу?','Ready for the set?');return L('Отсчёт','Count-in');}
  if(x.type==='free')return GB(L('Без гитары','No guitar'),L('Без баса','No bass'));
  if(x.type==='rest')return L('Отдых','Rest');
  return(x.test?L('Проход ','Run '):L('Подход ','Set '))+(x.k+1)+L(' из ',' of ')+x.n;
}
const coTag=x=>(x.tag||[]).map(p=>L(p[0],p[1])).join(' · ');
const coTempo=x=>(x.tempo||[]).map(k=>L(TEMPO[k][0],TEMPO[k][1])).join(' ');
function renderCoach(){
  coSync();const box=$('coach');
  if(!co.iv){box.hidden=true;box.innerHTML='';return;}
  box.hidden=false;
  let h='<div class="cohd"><span class="lbl">'+L('Ведение по подходам','Set-by-set coaching')+'</span><button class="cotog" id="coToggle" aria-pressed="'+co.on+'">'+(co.on?L('Вкл','On'):L('Выкл','Off'))+'</button></div>';
  if(!co.on){box.innerHTML=h+'<p class="legend" style="margin:0">'+L('Ведение выключено: таймер считает только минуты блока, метроном включаешь сам.','Coaching is off: the timer only counts the block’s minutes, and you run the metronome yourself.')+'</p>';return;}
  const p=coPos(),x=co.iv[p.k];
  const nextSet=x.type==='set'?x:co.iv.slice(p.k+1).find(y=>y.type==='set');
  const after=co.iv.slice(p.k+1,p.k+3);
  h+='<div class="cost t-'+x.type+'"><div class="coname"><b>'+esc(coName(x))+'</b>'+(coTag(x)?'<span>'+esc(coTag(x))+'</span>':'')+'</div><div class="coclock" id="coClock">'+fmt(p.left)+'</div></div>';
  h+='<div class="costrip" id="coStrip">'+co.iv.map((y,k)=>'<i class="t-'+y.type+'" style="flex-grow:'+y.sec+'"><b style="width:'+(k<p.k?100:0)+'%"></b></i>').join('')+'</div>';
  if(nextSet&&coTempo(nextSet))h+='<p class="cotempo"><span class="lbl">'+(x.type==='set'?L('Темп','Tempo'):L('Темп к подходу','Tempo for the set'))+'</span>'+esc(coTempo(nextSet))+'</p>';
  h+='<p class="conext"><span class="lbl">'+L('Дальше','Next')+'</span>'+(after.length?after.map(y=>esc(coName(y)+(y.type==='set'&&coTag(y)?' · '+coTag(y):''))+' '+fmt(y.sec)).join(' → '):esc(L('конец блока','end of block')))+'</p>';
  const skip=x.type==='set'?L('Пропустить подход','Skip set'):x.type==='rest'?L('Пропустить отдых','Skip rest'):L('Сразу к подходу','Start the set now');
  h+='<div class="coact">'+(co.hold&&co.hold.ph==='ready'?'<button class="btn primary" id="coReady">'+L('Готов','Ready')+' (Space)</button>':'')+'<button class="btn" id="coSkip">'+skip+'</button>';
  if(x.blk!=null&&co.iv.some(y=>y.blk>x.blk))h+='<button class="btn" id="coSkipBlk">'+L('Следующий тест','Next test')+'</button>';
  h+='</div>';
  box.innerHTML=h;
  document.querySelectorAll('#nowBody .test').forEach((el,j)=>el.classList.toggle('cur',j===x.blk));
}
function renderCoachClock(p){
  const c=$('coClock');if(!c)return;
  c.textContent=fmt(p.left);
  const cell=$('coStrip').children[p.k];if(cell)cell.firstChild.style.width=(100*(1-p.left/co.iv[p.k].sec))+'%';
}
$('coach').addEventListener('click',e=>{
  if(e.target.closest('#coToggle')){co.on=!co.on;co.idx=-1;coCancel();coBpm(null);if(co.hold&&co.hold.ph==='listen')plStop();co.hold=null;if(co.on&&st.running)coachTick();renderCoach();return;}
  if(!coActive())return;
  if(e.target.closest('#coReady')){coReady();return;}
  const p=coPos();
  if(e.target.closest('#coSkip'))coSkipTo(st.remain-p.left);
  else if(e.target.closest('#coSkipBlk')){const b=co.iv[p.k].blk;let el=0,c=0;co.iv.forEach(y=>{c+=y.sec;if(y.blk<=b)el=c;});coSkipTo(st.plan.segs[st.cur].min*60-el);}
});

