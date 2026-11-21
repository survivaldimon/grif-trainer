// RiffGym — блюз: библиотеки гитары, акустики, баса. Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= блюз ================= */
// Библиотеки блюза: та же схема id, групп, тестов и указаний тренера, что у метала (buildSession общий).
// Каждая библиотека — две части: 1 — W, B, R, тесты цикла и условия риффа дня (TESTS, RIFF); 2 — A, L, C.
// Часть: {EX:{id:…}, EXEN:{id:…}, COACH:{id:…}, TESTS?, RIFF?}. Чего в частях нет, берётся из метала того же инструмента.
/*@BLUES_GUITAR_1@*/
const BLG1=(function(){
// Блюз, электрогитара, часть 1. Табы риффов пишутся в {E} и переносятся в тональность варианта сдвигом ладов (sh).
const sh=(s,d)=>d?s.replace(/([A-Za-z])([hptSP]?)(\d+)(?:b(\d+))?(?:r(\d+))?/g,(m,a,te,f,b,r)=>a+te+(+f+d)+(b?'b'+(+b+d):'')+(r?'r'+(+r+d):'')):s;
const KEYS=[0,5,3,7,8,10],KN=['{E}','{A}','{G}','{B}','{C}','{D}'];
const lvs=a=>a.map(x=>Array.isArray(x)?{t:x}:x);
// 6 вариантов-тональностей: lev() — 5 уровней в {E}, каждый — массив систем или {t,sub}
// аккорды квадрата в {E}: r — струна тоники, f — лад, n — соседняя струна
const CH={I:{r:'E',f:0,n:'A'},IV:{r:'A',f:0,n:'D'},V:{r:'A',f:2,n:'D'}};
const Q12=['I','I','I','I','IV','IV','I','I','V','IV','I','V'];
const sys4=bars=>{const o=[];for(let i=0;i<bars.length;i+=4)o.push(bars.slice(i,i+4).join(' | '));return o;};
const sw=(a,b)=>a+':2 '+(b||a); // свинг: долгая-короткая
// шаффл 5–6: ступени над тоникой по долям, mute — доли под ладонью
const shufBar=(c,steps,mute)=>steps.map((k,i)=>{const x=c.n+(c.f+k)+'+'+c.r+c.f+(mute&&mute.includes(i)?'m':'');return sw(x);}).join(' ');
const v7=c=>c.r==='E'?'E'+c.f+'+D'+c.f+'+G'+(c.f+1):'A'+c.f+'+G'+c.f+'+B'+(c.f+2);
const vx=c=>c.r==='E'?'Ex+Dx+Gx':'Ax+Gx+Bx';
const arp=c=>c.r==='E'?['E'+c.f,'D'+c.f,'G'+(c.f+1)]:['A'+c.f,'G'+c.f,'B'+(c.f+2)];
const boogie=c=>[c.r+c.f,c.r+(c.f+4),c.n+(c.f+2),c.n+(c.f+4),c.n+(c.f+5),c.n+(c.f+4),c.n+(c.f+2),c.r+(c.f+4)];
const pairs=a=>a.map((t,i)=>i%2?t:t+':2').join(' ');
// пентатоника {A}m по позициям (снизу вверх) и открытая {E}m
const POS={1:'E5 E8 A5 A7 D5 D7 G5 G7 B5 B8 e5 e8',2:'E8 E10 A7 A10 D7 D10 G7 G9 B8 B10 e8 e10',3:'E10 E12 A10 A12 D10 D12 G9 G12 B10 B13 e10 e12',4:'E12 E15 A12 A15 D12 D14 G12 G14 B13 B15 e12 e15',5:'E3 E5 A3 A5 D2 D5 G2 G5 B3 B5 e3 e5',o:'E0 E3 A0 A2 D0 D2 G0 G2 B0 B3 e0 e3'};
const PORD=[1,2,3,4,5,'o'];
const PRU=['{A}m, 1-я позиция','{A}m, 2-я позиция','{A}m, 3-я позиция','{A}m, 4-я позиция','{A}m, 5-я позиция','{E}m, открытая позиция'];
const PEN=['{A} minor, position 1','{A} minor, position 2','{A} minor, position 3','{A} minor, position 4','{A} minor, position 5','{E} minor, open position'];
const BEND={1:'B8',2:'G7',3:'B13',4:'G12',5:'G5',o:'G2'};
const bnd=(t,s)=>{const m=t.match(/^([A-Za-z])(\d+)$/);return m[1]+m[2]+'b'+(+m[2]+(s||2));};
const rel=t=>{const m=t.match(/^([A-Za-z])(\d+)b(\d+)/);return t+'r'+m[2];};
const rng=(a,b)=>{const o=[];for(let i=a;i<=b;i++)o.push(i);return o;};

// ---- B1: пентатоника шестнадцатыми ----
const b1=n=>[
  [J(...[0,1,2,3,2,1,0,1,0,1,2,3,2,1,0,1].map(i=>n[i]))],
  [J(...rng(0,7).map(i=>n[i]),...rng(0,7).reverse().map(i=>n[i]))],
  [J(...rng(0,11).map(i=>n[i]),...rng(0,11).reverse().map(i=>n[i]))],
  [J(...rng(0,9).flatMap(i=>[n[i],n[i+1],n[i+2]]),n[11],n[10])],
  [J(...rng(0,8).flatMap(i=>[n[i],n[i+1],n[i+2],n[i+3]])),J(...rng(3,11).reverse().flatMap(i=>[n[i],n[i-1],n[i-2],n[i-3]]))]
];
// ---- B5: паузы в лид-фразах ----
const b5=(n,bt)=>{const B=bnd(bt),Rl=rel(B);
  const l2=[J(n[2],n[3],'.',n[4],n[5],'.',n[6]+':2'),J(n[6],n[5],'.',n[4],n[3],'.',n[2]+':2')];
  const l4=[J(n[9],n[8],B+':2','.:2',n[6]+':2'),J(n[10],n[9],B+':2',Rl,n[8],'.:2')];
  return [
    [J(n[0]+':2','.:2',n[1]+':2','.:2','|',n[2]+':2','.:2',n[3]+':2','.:2')],
    [l2.join(' | ')],
    [J(n[0],n[4],'.',n[2],n[6],'.',n[4]+':2','|',n[8],n[4],'.',n[10],n[6],'.',n[8]+':2')],
    [l4.join(' | ')],
    [J(l2[0],'|',l4[0],'|',l4[1],'|',n[5],n[4],'.',n[2],n[0]+':4')]
  ];};
// ---- B2: бенды ----
const B2D=[
  {b:'G7b9',tg:'G9',u:'B5',p1:'B5',p2:'G5'},
  {b:'B8b10',tg:'B10',u:'e5',p1:'e5',p2:'B5'},
  {b:'B15b17',tg:'B17',u:'e12',p1:'e12',p2:'B13'},
  {b:'e8b10',tg:'e10',u:'B8',p1:'B8',p2:'e5'},
  {b:'G12b14',tg:'G14',u:'B10',p1:'B13',p2:'D14'},
  {b:'G7b8',tg:'G8',u:'B4',p1:'B5',p2:'G5'}
];
const b2=x=>{const base=x.b.replace(/b\d+$/,''),R_=rel(x.b),U=x.b+'+'+x.u;return [
  [J(x.tg+':4',x.b+':4','|',x.tg+':4',x.b+':4')],
  [J(x.tg+':2',x.b+':2',R_+':2',base+':2','|',x.b+':2',R_+':2',x.b+':2',R_+':2')],
  [J(x.p1,x.p2,x.b+':2',R_,base,x.p1+':2','|',x.p2,x.p1,x.b+':2',R_,base,x.p2+':2')],
  [J(x.u+':2',U+':4',R_,base,'|',x.p1,x.p2,U+':4',base+':2')],
  [J(x.p1,x.p2,x.b+'~:4',R_,base,'|',x.p1,U+':3',x.p2,base+'~:3')]
];};
// ---- B3: вибрато ----
const B3D=[
  {n:'G7',p:'B5',q:'G5',n2:'D7',b:'G7b9'},
  {n:'B8',p:'e5',q:'B5',n2:'G7',b:'B8b10'},
  {n:'e5',p:'e8',q:'B8',n2:'B5',b:'G5b7'},
  {n:'D7',p:'G5',q:'D5',n2:'A7',b:'G7b9'},
  {n:'G14',p:'B13',q:'G12',n2:'D14',b:'G12b14'},
  {n:'e8',p:'B8',q:'e5',n2:'B10',b:'e8b10'}
];
const b3=x=>{const l3=[J(x.p,x.q,x.n+'~:2',x.q,x.n2+'~:3'),J(x.p,x.n+'~:7')],l4=[J(x.p,x.q,x.b+'~:6'),J(rel(x.b),x.q,x.n+'~:6')];return [
  [J(x.p+':2',x.n+'~:6','|',x.q+':2',x.n+'~:6')],
  [J(x.p,x.q,x.n+'~:6','|',x.n2+':2',x.n+'~:6')],
  [l3.join(' | ')],
  [l4.join(' | ')],
  [J(l3[0],'|',l3[1],'|',l4[0],'|',l4[1])]
];};
// ---- варианты = материал (фигура, позиция, тип хода) + тональность ----
// наборы аккордов: CH — {E} открыто; CA — {A} открыто (IV на {s:D}–{s:G}); CC — {C} закрыто от 3-го лада
const CA={I:{r:'A',f:0,n:'D'},IV:{r:'D',f:0,n:'G'},V:{r:'E',f:0,n:'A'}};
const CC={I:{r:'A',f:3,n:'D'},IV:{r:'D',f:3,n:'G'},V:{r:'E',f:3,n:'A'}};
const kc=(S,d)=>{const o={};for(const k in S)o[k]=Object.assign({},S[k],{f:S[k].f+d});return o;};
const dn1=c=>Object.assign({},c,{f:c.f-1});
const mv=sp=>sp.map(s=>({l:s.ru,lv:lvs(s.f())}));
const men=sp=>sp.map(s=>s.en);
// ---- B4: шаффл 5–6 ----
const b4=(S,st,str)=>{const bar=(c,s)=>str?s.map(k=>{const x=c.n+(c.f+k)+'+'+c.r+c.f;return x+' '+x;}).join(' '):shufBar(c,s),w=t=>str?{t,sub:2}:t;
  return [
    w([J(bar(S.I,st[0]),'|',bar(S.I,st[0]))]),
    w([[S.I,S.I,S.IV,S.IV].map(c=>bar(c,st[0])).join(' | ')]),
    w(sys4(['I','IV','I','I','IV','IV','I','I'].map(c=>bar(S[c],st[1])))),
    w(sys4(Q12.map(c=>bar(S[c],st[1])))),
    w(sys4(Q12.map(c=>bar(S[c],st[2]))))
  ];};
const ST0=[[2,2,4,4],[2,4,2,4],[2,4,5,4]];
const B4S=[
  {ru:'Классика 5–6, {E}',en:'Classic 5–6, key of {E}',f:()=>b4(CH,ST0)},
  {ru:'Открытая позиция {A}: смена струн у IV',en:'Open position in {A}: the IV moves up a string',f:()=>b4(CA,ST0)},
  {ru:'Ровные восьмые, рок-н-ролл, {G}',en:'Straight eighths, rock and roll, key of {G}',f:()=>b4(kc(CH,3),ST0,true)},
  {ru:'Хроматика 5–♭6–6, {B}',en:'Chromatic 5–♭6–6, key of {B}',f:()=>b4(kc(CH,7),[[2,3,4,3],[2,3,4,3],[2,3,4,5]])},
  {ru:'Закрытая позиция без открытых струн, {C}',en:'Closed position, no open strings, key of {C}',f:()=>b4(CC,ST0)},
  {ru:'Подъём до октавы 5–6–♭7–8, {F}',en:'Climb to the octave 5–6–♭7–8, key of {F}',f:()=>b4(kc(CH,1),[[2,4,5,7],[2,4,5,7],[2,4,7,5]])}
];
// ---- R6: бугги-линия ----
const LOWS={A:'E',D:'A',G:'D'};
const BGF={
  std:(r,n)=>[r(0),r(4),n(2),n(4),n(5),n(4),n(2),r(4)],
  m3:(r,n,h)=>[r(0),r(3),h(4),n(2),n(5),n(4),n(2),r(3)],
  oct:(r,n)=>[r(0),n(2),n(4),n(5),n(7),n(5),n(4),n(2)],
  dsc:(r,n)=>[r(0),n(7),n(5),n(4),n(3),n(2),r(4),r(3)],
  b5:(r,n)=>[r(0),r(4),n(2),n(4),n(5),n(4),n(2),n(1)]
};
const r6=(S,fig)=>{const boogie=c=>fig(k=>c.r+(c.f+k),k=>c.n+(c.f+k),k=>c.r+'h'+(c.f+k)),bar=c=>pairs(boogie(c));
  const l5=Q12.map((c,i)=>{const a=boogie(S[c]),nx=S[Q12[(i+1)%12]];if(nx!==S[c]){a[7]=nx.f>0?nx.r+(nx.f-1):(LOWS[nx.r]?LOWS[nx.r]+4:a[7]);}return pairs(a);});
  return [
    {t:[J(...boogie(S.I).slice(0,4),'|',...boogie(S.I).slice(4))],sub:1},
    [J(bar(S.I),'|',bar(S.I))],
    [['I','IV','I','I'].map(c=>bar(S[c])).join(' | ')],
    sys4(Q12.map(c=>bar(S[c]))),
    sys4(l5)
  ];};
const R6S=[
  {ru:'Классическая бугги вверх-вниз, {E}',en:'Classic boogie up and down, key of {E}',f:()=>r6(CH,BGF.std)},
  {ru:'Бугги в открытой позиции {A}',en:'Boogie in open position, key of {A}',f:()=>r6(CA,BGF.std)},
  {ru:'Малая терция с хаммером в большую, {G}',en:'Minor third hammered to the major third, key of {G}',f:()=>r6(kc(CH,3),BGF.m3)},
  {ru:'До октавы и обратно, закрытая позиция, {C}',en:'Up to the octave and back, closed position, key of {C}',f:()=>r6(CC,BGF.oct)},
  {ru:'Хроматический спуск от октавы, {B}',en:'Chromatic descent from the octave, key of {B}',f:()=>r6(kc(CH,7),BGF.dsc)},
  {ru:'С блюзовой нотой ♭5 в конце такта, {F}',en:'With the blue note ♭5 at the end of the bar, key of {F}',f:()=>r6(kc(CH,1),BGF.b5)}
];
// ---- R7: аккомпанемент септаккордами — ритмическая фигура варианта ----
const CMP={
  sw4:x=>J(sw(x),sw(x),sw(x),sw(x)),
  ch:x=>J(x+':5',x,'.:6'),
  b24:x=>J('.:3',x+':2','.:4',x+':2','.'),
  off:x=>J('.:2',x,'.:2',x,'.:2',x,'.:2',x),
  scr:(x,s)=>J(x+':2',s,'.:2',x,x+':2',s,'.:3'),
  app:(x,s,b)=>J('.:2',b,x+':3','.:2',b,x+':3')
};
const r7=(S,cell,alt)=>{const bar=(c,f)=>(f||cell)(v7(c),vx(c),v7(dn1(c)));
  return [
    {t:[J(...Array(4).fill(v7(S.I)),'|',...Array(4).fill(v7(S.I)))],sub:1},
    [['I','I','IV','IV'].map(c=>bar(S[c])).join(' | ')],
    sys4(['I','IV','I','I','IV','IV','I','I'].map(c=>bar(S[c]))),
    sys4(Q12.map(c=>bar(S[c]))),
    sys4(Q12.map((c,i)=>i===11?J(v7(S.V)+':3','.:9'):bar(S[c],i%2?alt:null)))
  ];};
const R7S=[
  {ru:'Свинг на каждую долю, {E}',en:'Swing on every beat, key of {E}',f:()=>r7(CH,CMP.sw4,CMP.ch)},
  {ru:'Чарльстон: раз и «и» второй доли, {A}',en:'Charleston: beat one and the and of two, key of {A}',f:()=>r7(kc(CH,5),CMP.ch,CMP.sw4)},
  {ru:'Удары на 2 и 4, {G}',en:'Hits on 2 and 4, key of {G}',f:()=>r7(kc(CH,3),CMP.b24,CMP.sw4)},
  {ru:'Только слабые восьмые, {C}',en:'Off-beat eighths only, key of {C}',f:()=>r7(kc(CH,8),CMP.off,CMP.sw4)},
  {ru:'Глухие удары между аккордами, {D}',en:'Muted scratches between the chords, key of {D}',f:()=>r7(kc(CH,10),CMP.scr,CMP.sw4)},
  {ru:'Подход к аккорду на полутон снизу, {B}',en:'Slide into the chord from a half step below, key of {B}',f:()=>r7(kc(CH,7),CMP.app,CMP.sw4)}
];
// ---- R8: стоп-тайм — фигура удара и сбивки варианта ----
const FILLS=['G2:2 G0 D2:2 D0 A2:2 A0 E3:2 E0','B3:2 B0 G2:2 G0 D2:2 D0 E0:3','e0:2 e3 B3:2 B0 G2:2 G0 E0:3','E0:2 E3 A0:2 A2 D0:2 D2 E0:3'];
const oct=c=>c.r+c.f+'+'+(c.r==='E'?'D':'G')+(c.f+2);
const HIT={
  two:c=>J(v7(c)+':3','.:5',v7(c),'.:3'),
  app:c=>J(v7(dn1(c)),v7(c)+':2','.:9'),
  ot:c=>J(v7(c)+':2','.',v7(c)+':2','.:7'),
  oct:c=>J(oct(c)+':3','.:9'),
  push:c=>J(v7(c)+':3','.:8',v7(c)),
  trip:c=>J(v7(c),v7(c),v7(c),'.:9')
};
const r8=(d,hit,f1,f2)=>{const S=kc(CH,d),h=c=>hit(S[c]),h1=c=>v7(S[c])+':3 .:9',F1=sh(FILLS[f1],d),F2=sh(FILLS[f2],d);
  return [
    [J(h1('I'),'|',h1('I'))],
    [J(h('I'),'|',h('I'))],
    [J(h('I'),'|',h('I'),'|',h('I'),'|',F1)],
    sys4([h('I'),h('I'),h('I'),F1,h('IV'),h('IV'),h('I'),F2]),
    sys4([h('I'),h('I'),h('I'),F1].concat(Q12.slice(4).map(c=>shufBar(S[c],[2,4,2,4]))))
  ];};
const R8S=[
  {ru:'Два удара: раз и «и» третьей доли, {E}',en:'Two hits: one and the and of three, key of {E}',f:()=>r8(0,HIT.two,0,1)},
  {ru:'Удар с подходом на полутон снизу, {A}',en:'A hit slid in from a half step below, key of {A}',f:()=>r8(5,HIT.app,2,1)},
  {ru:'Удары на раз и два, {G}',en:'Hits on one and two, key of {G}',f:()=>r8(3,HIT.ot,0,3)},
  {ru:'Удар октавой вместо аккорда, {C}',en:'An octave hit instead of the chord, key of {C}',f:()=>r8(8,HIT.oct,1,2)},
  {ru:'Удар и толчок на последнюю восьмую, {D}',en:'A hit and a push on the last eighth, key of {D}',f:()=>r8(10,HIT.push,3,0)},
  {ru:'Триоль аккордом на первую долю, {B}',en:'A chord triplet on beat one, key of {B}',f:()=>r8(7,HIT.trip,2,3)}
];
// ---- R9: ладонь и акценты — рисунок акцентов варианта ----
// по долям: M — под ладонью, O — открыто, S — открыта короткая восьмая, L — открыта долгая
const pb=(c,st,code)=>st.map((k,i)=>{const x=c.n+(c.f+k)+'+'+c.r+c.f,q=code[i],a=q==='M'||q==='S'?x+'m':x,b=q==='M'||q==='L'?x+'m':x;return a+':2 '+b;}).join(' ');
const r9=(S,P)=>[
  [J(pb(S.I,[2,2,4,4],'MMMM'),'|',pb(S.I,[2,2,4,4],'MMMM'))],
  [J(pb(S.I,[2,2,4,4],'MMMM'),'|',pb(S.I,[2,2,4,4],P))],
  [['I','IV','I','IV'].map(c=>pb(S[c],[2,4,2,4],P)).join(' | ')],
  [['I','IV','I','V'].map(c=>pb(S[c],[2,4,5,4],P)).join(' | ')],
  sys4(Q12.map((c,i)=>i===11?J(v7(S.V)+':3','.:9'):pb(S[c],[2,4,5,4],P)))
];
const R9S=[
  {ru:'Открыты 2-я и 4-я доли, {E}',en:'Beats 2 and 4 open, key of {E}',f:()=>r9(CH,'MOMO')},
  {ru:'Открыта только 4-я доля, открытая позиция {A}',en:'Only beat 4 open, open position in {A}',f:()=>r9(CA,'MMMO')},
  {ru:'Открыты короткие восьмые, {G}',en:'The short eighths open, key of {G}',f:()=>r9(kc(CH,3),'SSSS')},
  {ru:'Открыты 1-я и 3-я доли, закрытая позиция {C}',en:'Beats 1 and 3 open, closed position in {C}',f:()=>r9(CC,'OMOM')},
  {ru:'Долгая восьмая открыта, короткая под ладонью, {B}',en:'Long eighth open, short eighth muted, key of {B}',f:()=>r9(kc(CH,7),'LLLL')},
  {ru:'Смешанный рисунок: открыто, слабая, ладонь, долгая, {D}',en:'Mixed pattern: open, off-beat, muted, long, key of {D}',f:()=>r9(kc(CH,10),'OSML')}
];
// ---- R10: медленный блюз 12/8 (4/4 триолями) — фигура доли варианта ----
const TURN='e0 B0 G4 e0 B0 G3 e0 B0 G2 e0 B0 G1';
const SLW={
  ud:c=>{const a=arp(c),u=J(...a),d=J(...a.slice().reverse());return J(u,d,u,d);},
  bc:c=>{const a=arp(c),dd=a[1]+'+'+a[2];return J(...Array(4).fill(J(a[0],dd,dd)));},
  up:c=>J(...Array(4).fill(J(...arp(c)))),
  sh:c=>J(...Array(4).fill(v7(c)+':2 '+v7(c))),
  p132:c=>{const a=arp(c);return J(...Array(4).fill(J(a[0],a[2],a[1])));},
  mx:c=>J(...Array(4).fill(J(v7(c),vx(c),v7(c))))
};
const r10=(d,fig)=>{const S=kc(CH,d),bar=c=>fig(S[c]);
  return [
    [J(...Array(4).fill(v7(S.I)+':3'),'|',...Array(4).fill(v7(S.I)+':3'))],
    [J(bar('I'),'|',bar('I'))],
    [['I','IV','I','I'].map(bar).join(' | ')],
    sys4(Q12.map(bar)),
    sys4(Q12.slice(0,10).map(bar).concat([sh(TURN,d),J(sh('E0',d)+':3',v7(S.V)+':3','.:6')]))
  ];};
const R10S=[
  {ru:'Перебор вверх и вниз, {E}',en:'Arpeggio up and down, key of {E}',f:()=>r10(0,SLW.ud)},
  {ru:'Бас и двойная нота, {A}',en:'Bass note and double stop, key of {A}',f:()=>r10(5,SLW.bc)},
  {ru:'Перебор только вверх, {G}',en:'Arpeggio upward only, key of {G}',f:()=>r10(3,SLW.up)},
  {ru:'Шаффл-аккорд: долгая и короткая, {C}',en:'Shuffle chord: long and short, key of {C}',f:()=>r10(8,SLW.sh)},
  {ru:'Перебор 1–3–2, {D}',en:'Arpeggio 1–3–2, key of {D}',f:()=>r10(10,SLW.p132)},
  {ru:'Глухой удар в середине триоли, {B}',en:'A muted strum in the middle of the triplet, key of {B}',f:()=>r10(7,SLW.mx)}
];
// ---- R11: гибридный пикинг — фигура варианта ----
const hyb=c=>c.r==='E'?{r:'E'+c.f,q:'A'+(c.f+2),d:'G'+(c.f+1)+'+B'+c.f}:{r:'A'+c.f,q:'E'+c.f,d:'G'+c.f+'+B'+(c.f+2)};
const HYB={
  alt:x=>J(sw(x.r,x.d),sw(x.q,x.d),sw(x.r,x.d),sw(x.q,x.d)),
  inv:x=>J(sw(x.d,x.r),sw(x.d,x.q),sw(x.d,x.r),sw(x.d,x.q)),
  bk:x=>J(x.r+':3',x.q+'+'+x.d+':3',x.r+':3',x.q+'+'+x.d+':3'),
  syn:x=>J(x.r+':2',x.d,'.',x.d+':2',x.q+':2',x.d,'.',x.d+':2'),
  tri:x=>J(x.r,x.d,x.d,x.q,x.d,x.d,x.r,x.d,x.d,x.q,x.d,x.d),
  pin:x=>J(x.r+'+'+x.d+':2',x.d,x.q+':2',x.d,x.r+'+'+x.d+':2',x.d,x.q+':2',x.d)
};
const r11=(d,fig)=>{const S=kc(CH,d),a=c=>{const x=hyb(c);return J(sw(x.r,x.d),sw(x.r,x.d),sw(x.r,x.d),sw(x.r,x.d));},b=c=>fig(hyb(S[c]));
  return [
    [J(a(S.I),'|',a(S.I))],
    [J(b('I'),'|',b('I'))],
    [['I','IV','I','I'].map(b).join(' | ')],
    sys4(['I','IV','I','I','IV','IV','I','V'].map(b)),
    sys4(Q12.map(b))
  ];};
const R11S=[
  {ru:'Бас тоника–квинта, двойная нота на «и», {E}',en:'Root–fifth bass, double stop on the and, key of {E}',f:()=>r11(0,HYB.alt)},
  {ru:'Двойная нота на долю, бас на «и», {A}',en:'Double stop on the beat, bass on the and, key of {A}',f:()=>r11(5,HYB.inv)},
  {ru:'Бас на 1 и 3, аккорд вместе с басом на 2 и 4, {G}',en:'Bass on 1 and 3, chord with the bass on 2 and 4, key of {G}',f:()=>r11(3,HYB.bk)},
  {ru:'Синкопы двойной нотой, {C}',en:'Syncopated double stops, key of {C}',f:()=>r11(8,HYB.syn)},
  {ru:'Триоли: бас и две двойные ноты, {D}',en:'Triplets: a bass note and two double stops, key of {D}',f:()=>r11(10,HYB.tri)},
  {ru:'Щипок вместе с басом, {B}',en:'Pluck together with the bass, key of {B}',f:()=>r11(7,HYB.pin)}
];
// ---- R12: чикен-пикинг — набор нот (аккорд и позиция) варианта ----
const r12=(p,end)=>{const x=t=>t[0]+'x',q=t=>J(x(t),t),dd=(a,b)=>J(x(a)+'+'+x(b),a+'+'+b);
  return [
    [J(R(q(p[0]),8))],
    [J(R(J(q(p[0]),q(p[1])),4))],
    [J(R(J(q(p[0]),q(p[1]),q(p[2]),q(p[1])),2))],
    [J(q(p[0]),q(p[1]),q(p[2]),q(p[3]),q(p[2]),q(p[1]),q(p[0]),q(p[1]),'|',q(p[3]),q(p[2]),q(p[1]),q(p[0]),q(p[1]),q(p[2]),q(p[1]),end,'.')],
    [J(dd(p[2],p[3]),q(p[1]),dd(p[2],p[3]),q(p[0]),dd(p[1],p[2]),q(p[0]),dd(p[2],p[3]),q(p[1]),'|',dd(p[2],p[3]),q(p[1]),dd(p[1],p[2]),q(p[0]),q(p[1]),q(p[2]),q(p[1]),end+':2')]
  ];};
const R12S=[
  {ru:'Аккорд {E}, открытая позиция',en:'{E} chord, open position',f:()=>r12(['A2','D2','G1','B0'],'E0')},
  {ru:'Аккорд {A}, форма от 5-го лада',en:'{A} chord, shape at the 5th fret',f:()=>r12(['D7','G6','B5','e5'],'A0')},
  {ru:'Аккорд {G}, форма от 3-го лада',en:'{G} chord, shape at the 3rd fret',f:()=>r12(['D5','G4','B3','e3'],'E3')},
  {ru:'Септаккорд {C}7 у 8-го лада',en:'{C}7 chord at the 8th fret',f:()=>r12(['D10','G9','B11','e8'],'A3')},
  {ru:'Аккорд {D}, открытая форма',en:'{D} chord, open shape',f:()=>r12(['A5','D4','G2','B3'],'D0')},
  {ru:'Минорная терция в {B}: ♭3 вместо 3',en:'Minor third in {B}: ♭3 instead of 3',f:()=>r12(['D9','G7','B7','e7'],'E7')}
];
// ---- R13: сексты и терции — фигура варианта ----
const six=c=>c.r==='E'?{s:'G'+(c.f+1)+'+e'+c.f,n:'G'+(c.f+2)+'+e'+(c.f+2),t:'G'+(c.f+1)+'+B'+c.f,tn:'G'+(c.f+2)+'+B'+(c.f+2)}:{s:'G'+(c.f+6)+'+e'+(c.f+5),n:'G'+(c.f+7)+'+e'+(c.f+7),t:'G'+(c.f+2)+'+B'+(c.f+2),tn:'G'+(c.f+2)+'+B'+(c.f+3)};
const SIX={
  nb:x=>J(x.s+':2',x.n,x.s+':2','.',x.s+':2',x.n,x.s+':3'),
  st:x=>J(x.s+':2',x.n,x.s+':3',x.t+':2',x.t,x.t+':3'),
  th:x=>J(x.t+':2',x.tn,x.t+':2','.',x.t+':2',x.tn,x.t+':3'),
  ap:(x,b)=>J('.:2',b.s,x.s+':3','.:2',b.s,x.s+':3'),
  sy:x=>J('.:2',x.s,'.:2',x.n,'.:2',x.s,x.s+':3'),
  tr:x=>J(x.s,x.n,x.s,x.s,x.n,x.s,x.s,x.n,x.s,x.s+':3')
};
const r13=(d,fig)=>{const S=kc(CH,d),a=c=>{const x=six(c);return J(sw(x.s),sw(x.s),sw(x.s),sw(x.s));},b=(c,f)=>(f||fig)(six(S[c]),six(dn1(S[c])));
  return [
    [J(a(S.I),'|',a(S.I))],
    [J(b('I'),'|',b('I'))],
    [['I','IV','I','I'].map(c=>b(c)).join(' | ')],
    [['I','IV','I','V'].map(c=>b(c)).join(' | ')],
    sys4(Q12.map((c,i)=>b(c,i%2?(fig===SIX.st?SIX.nb:SIX.st):null)))
  ];};
const R13S=[
  {ru:'Секста и соседняя сверху, {E}',en:'A sixth and its upper neighbour, key of {E}',f:()=>r13(0,SIX.nb)},
  {ru:'Сексты и терции по очереди, {A}',en:'Sixths and thirds in turn, key of {A}',f:()=>r13(5,SIX.st)},
  {ru:'Терции: аккорд и субдоминанта над ним, {G}',en:'Thirds: the chord and the IV above it, key of {G}',f:()=>r13(3,SIX.th)},
  {ru:'Подход к сексте на полутон снизу, {C}',en:'Slide into the sixth from a half step below, key of {C}',f:()=>r13(8,SIX.ap)},
  {ru:'Синкопы: сексты на слабые восьмые, {F}',en:'Syncopation: sixths on the off-beats, key of {F}',f:()=>r13(1,SIX.sy)},
  {ru:'Сексты триолями, {B}',en:'Sixths in triplets, key of {B}',f:()=>r13(7,SIX.tr)}
];
// ---- R14: тёрнэраунды — вид хода варианта (x — ход, m — средний голос, p — педаль, c — встречный голос) ----
const V7END='E0:3 A2+D1+G2:3 .:6',LICK='e0:2 B3 B0:2 G2 G0:2 D2 E0:3';
const r14=(T,d)=>{const s=x=>sh(x,d),E=s(V7END),l3=J(...T.x.map(x=>J(T.p,T.m,x))),l4=J(...T.x.map((x,i)=>T.c[i]+'+'+x+':2 '+T.p));
  return [
    [s(J(...T.x.map(x=>x+'+'+T.p+':3'),'|',V7END))],
    [s(J(...T.x.map(x=>x+':2 '+T.p),'|',V7END))],
    [s(J(l3,'|',V7END))],
    [s(J(l4,'|',V7END))],
    [s(J(LICK,'|',l3,'|',l4,'|',V7END))]
  ];};
const R14S=[
  {ru:'Спуск на {s:G} под верхней тоникой, {E}',en:'Descent on the {s:G} string under the top root, key of {E}',f:()=>r14({x:['G4','G3','G2','G1'],m:'B0',p:'e0',c:['D2','D3','D4','D5']},0)},
  {ru:'Подъём на {s:D} под педалью сверху, {A}',en:'Climb on the {s:D} string under a top pedal, key of {A}',f:()=>r14({x:['D2','D3','D4','D5'],m:'B0',p:'e0',c:['A4','A3','A2','A1']},5)},
  {ru:'Параллельный спуск двойными нотами над тоникой в басу, {C}',en:'Parallel descent in double stops over the root in the bass, key of {C}',f:()=>r14({x:['G4+B5','G3+B4','G2+B3','G1+B2'],m:'D2',p:'E0',c:['e0','e1','e2','e3']},8)},
  {ru:'Закрытая форма у 5-го лада, педаль на {s:B}, {G}',en:'Closed shape at the 5th fret, pedal on the {s:B} string, key of {G}',f:()=>r14({x:['D6','D5','D4','D3'],m:'G4',p:'B5',c:['e5','e6','e7','e8']},3)},
  {ru:'Спуск от октавы на {s:B}, {D}',en:'Descent from the octave on the {s:B} string, key of {D}',f:()=>r14({x:['B5','B4','B3','B2'],m:'G1',p:'e0',c:['D2','D3','D4','D5']},10)},
  {ru:'Басовый ход на {s:A} к доминанте, {B}',en:'Bass walk on the {s:A} string to the dominant, key of {B}',f:()=>r14({x:['A5','A4','A3','A2'],m:'G1',p:'e0',c:['B3','B4','B5','B6']},7)}
];
// ---- R15: вызов и ответ — рифф-вызов и набор ответов варианта ----
const RSP=[['B3:2 B0 G2:2 G0','G2:2 G0 D2:3','e3:2 e0 B3:3'],['e3:2 e0 B3:2 B0','B3:2 B0 G2:3','G2:2 G0 E0:3'],['G2b4:2 G2b4r2 D2:3','B3b5:3 G2:3','e3:2 e0 B3b4:3']];
const CALL={
  c0:c=>J(sw(c.r+c.f,c.r+(c.f+3)),sw(c.n+c.f,c.n+(c.f+2))),
  c1:c=>J(c.r+c.f+':2',c.r+'h'+(c.f+3),sw(c.n+c.f,c.n+(c.f+2))),
  c2:c=>{const o=oct(c);return J(sw(o),sw(o));},
  c3:c=>J(sw(c.r+c.f,c.r+(c.f+3)),sw(c.n+(c.f+1),c.n+(c.f+2)))
};
const r15=(d,call,rs)=>{const S=kc(CH,d),k=c=>call(S[c]),RE=RSP[rs].map(x=>sh(x,d));
  return [
    [J(k('I'),'.:6','|',k('I'),'.:6')],
    [J(k('I'),RE[0],'|',k('I'),RE[1])],
    [J(k('I'),RE[0],'|',k('I'),RE[1],'|',k('I'),RE[2],'|',k('I'),'.:6')],
    sys4(['I','IV','I','I','IV','IV','I','I'].map((c,i)=>J(k(c),RE[i%3]))),
    sys4(Q12.map((c,i)=>J(k(c),i===11?'.:6':RE[i%3])))
  ];};
const R15S=[
  {ru:'Вызов тоника–♭3, ответ сверху вниз, {E}',en:'Root–♭3 call, a descending answer, key of {E}',f:()=>r15(0,CALL.c0,0)},
  {ru:'Вызов с хаммером, ответ с верхних струн, {A}',en:'Call with a hammer-on, answer from the top strings, key of {A}',f:()=>r15(5,CALL.c1,1)},
  {ru:'Вызов октавой, ответ бендами, {G}',en:'Octave call, answered with bends, key of {G}',f:()=>r15(3,CALL.c2,2)},
  {ru:'Вызов с блюзовой нотой ♭5, {C}',en:'Call with the blue note ♭5, key of {C}',f:()=>r15(8,CALL.c3,0)},
  {ru:'Вызов с хаммером, ответ бендами, {D}',en:'Call with a hammer-on, answered with bends, key of {D}',f:()=>r15(10,CALL.c1,2)},
  {ru:'Вызов октавой, ответ с верхних струн, {B}',en:'Octave call, answer from the top strings, key of {B}',f:()=>r15(7,CALL.c2,1)}
];
// ---- R37: глухие удары шестнадцатыми — ритмический рисунок варианта ----
const r37=(d,P)=>{const S=kc(CH,d),pat=(p,c)=>J(...p.split(' ').map(s=>s==='c'?v7(c):s==='x'?vx(c):'.'));
  const riff=sh(J(v7(CH.I),'Ex+Dx+Gx Ex+Dx+Gx Ex+Dx+Gx E0 E0 E3 Ex',v7(CH.I),'Ex+Dx+Gx Ex+Dx+Gx',v7(CH.I),'E0 . E2 E3'),d);
  return [
    [J(pat('c x x x c x x x c x x x c x x x',S.I),'|',pat('c x x x c x x x c x x x c x x x',S.I))],
    [J(pat(P,S.I),'|',pat(P,S.I))],
    [J(pat(P,S.I),'|',riff)],
    [J(pat(P,S.I),'|',pat(P,S.IV))],
    [J(pat(P,S.I),'|',pat(P,S.IV),'|',pat(P,S.I),'|',pat('c . . c . . c . c . . . c . . .',S.V))]
  ];};
const R37S=[
  {ru:'Рисунок 3+3+2, {E}',en:'3+3+2 pattern, key of {E}',f:()=>r37(0,'c x x c x x c x c x x c x c x x')},
  {ru:'Аккорд через шестнадцатую, {A}',en:'A chord every other sixteenth, key of {A}',f:()=>r37(5,'c x c x x c x c x c x x c x c x')},
  {ru:'Акцент на «и» доли, {G}',en:'Accent on the and of the beat, key of {G}',f:()=>r37(3,'c x x x c x c x x c x x c x c x')},
  {ru:'С паузами вместо глухих ударов, {C}',en:'Rests in place of some scratches, key of {C}',f:()=>r37(8,'c . x c . x c x c . x c . x c x')},
  {ru:'Вступление с глухих ударов, {D}',en:'Starting from scratches, key of {D}',f:()=>r37(10,'x x c x x c x x c x c x x c x c')},
  {ru:'Тресильо: группы по три, {B}',en:'Tresillo: groups of three, key of {B}',f:()=>r37(7,'c x x c x x c x x c x x c x c x')}
];

const PENT1=POS[1].split(' ');
const EX={
W0:{name:'Разминка',goal:'Разогреть руки и включить слух.',how:'Без гитары минуту: потри ладони до тепла, медленные круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем на чистом звуке медленно пентатоника {A}m в первой позиции вверх и вниз.',tip:'Только мягкие движения. Тянуть струны на холодные руки рано: бенды — позже.',sub:2,v:[{l:'Пентатоника {A}m, 1-я позиция',t:[J(...PENT1,...PENT1.slice().reverse())]}]},
W1:{name:'Мобилизация без гитары',goal:'Разогнать кровь в кистях и предплечьях.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Потряси расслабленными кистями.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
W2:{name:'Пентатоника по двум позициям',goal:'Включить синхронизацию рук и вспомнить гриф.',how:'Чистый звук, восьмые, темп заведомо низкий. Первая позиция {A}m вверх, вторая вниз.',tip:'Каждая нота звучит полную длительность, без обрывов на смене струны.',sub:2,v:[{l:'1-я и 2-я позиции',t:[J(...PENT1),J(...POS[2].split(' ').reverse())]}]},
W3:{name:'Мягкие бенды',goal:'Подготовить пальцы и струны к бендам.',how:'Чистый звук, восьмые, половина рабочего темпа. Сначала полутон, потом тон: подтяни и верни. Тяни тремя пальцами вместе, а не одним.',tip:'Подушечки ещё холодные: не тяни выше тона и не дави сильнее, чем нужно.',sub:2,v:[{l:'Полутон и тон',t:['G7:2 G7b8:2 G7b8r7:2 G7:2 | G7:2 G7b9:2 G7b9r7:2 G7:2','B8:2 B8b9:2 B8b9r8:2 B8:2 | B8:2 B8b10:4 B8:2']}]},

B1:{n:1,name:'Пентатоника шестнадцатыми',goal:'Ровный альтернейт в быстрых пентатонических фразах.',how:'Строго вниз-вверх, шестнадцатые. Каждый третий подход — секстоли, затем тридцать вторые на половине темпа. Позиция пентатоники своя у каждой недели.',tip:'На две ноты на струне медиатор не «застревает»: переход через струну такой же короткий, как удар по ней.',sub:4,lvl:['Две струны','Четыре струны','Вся позиция вверх и вниз','Секвенция тройками','Секвенция четвёрками вверх и вниз'],v:PORD.map((p,k)=>({l:PRU[k],lv:lvs(b1(POS[p].split(' ')))}))},
B2:{n:2,name:'Бенды в точную ноту',goal:'Бенд попадает в высоту целевой ноты.',how:'Восьмые. Сначала сыграй целевую ноту на ладу, потом подтяни к ней. Возврат — тоже точно в исходную ноту. На четвёртом уровне — унисон: верхняя струна держит целевую ноту, бенд догоняет её до биений-ноль.',tip:'Тяни тремя пальцами, кисть поворачивается как ключ в замке. Свободные пальцы глушат соседние струны.',sub:2,lvl:['Целевая нота и бенд','Бенд и возврат','Бенд в лике','Унисон-бенд','Две фразы с вибрато на бенде'],v:[
  {l:'Тон на {s:G}: {D}→{E}',lv:lvs(b2(B2D[0]))},
  {l:'Тон на {s:B}: {G}→{A}',note:'Половину подходов сначала целевая нота, половину — бенд вслепую и проверка нотой после.',lv:lvs(b2(B2D[1]))},
  {l:'Тон на {s:B} в 4-й позиции: {D}→{E}',lv:lvs(b2(B2D[2]))},
  {l:'Тон на {s:e}: {C}→{D}',note:'Вместо унисона — бенд под нотой соседней струны.',lv:lvs(b2(B2D[3]))},
  {l:'Тон на {s:G}: {G}→{A}',lv:lvs(b2(B2D[4]))},
  {l:'Полутон: блюзовая нота {D#}',lv:lvs(b2(B2D[5]))}]},
B3:{n:3,name:'Вибрато',goal:'Ровное, певучее вибрато в ритм.',how:'Восьмые. Вибрато в такт: два качания на долю. Высота качается вверх от ноты и возвращается точно в неё. На четвёртом и пятом уровнях — вибрато на подтянутом бенде.',tip:'Двигается кисть, а не палец: большой палец опирается на гриф или выходит над ним.',sub:2,lvl:['Длинная нота','Подход к ноте','Две ноты с вибрато','Вибрато на бенде','Четыре такта'],v:[
  {l:'Вибрато на {s:G}',lv:lvs(b3(B3D[0]))},
  {l:'Вибрато на {s:B}, мизинец',lv:lvs(b3(B3D[1]))},
  {l:'Указательным пальцем',lv:lvs(b3(B3D[2]))},
  {l:'Вибрато на {s:D}',lv:lvs(b3(B3D[3]))},
  {l:'4-я позиция',lv:lvs(b3(B3D[4]))},
  {l:'Широкое вибрато на {s:e}',lv:lvs(b3(B3D[5]))}]},
B4:{n:4,name:'Шаффл 5–6',goal:'Ровный свинг и смена аккордов квадрата.',how:'Две соседние струны: тоника и квинта, потом тоника и секста; фигуру и позицию задаёт вариант. Свинг: каждая доля — долгая и короткая восьмая (кроме варианта с ровными восьмыми). На пятом уровне в фигуру добавляется малая септима.',tip:'Тоника звучит всё время, двигается только палец на верхней струне. Ладонь слегка касается струн у подставки.',sub:3,lvl:['Одна тоника','Смена тоники и субдоминанты','8 тактов с быстрой сменой','12-тактовый квадрат','Квадрат с септимой'],v:mv(B4S)},
B5:{n:5,name:'Чистота пауз',goal:'Тишина в паузах лид-фраз.',how:'Восьмые. Точка в табе — пауза: обе руки глушат струны. После бенда струна возвращается и замолкает без скрипа.',tip:'Проверка: остановись на любой паузе — должна быть тишина, без гула соседних струн.',sub:2,lvl:['Длинные паузы','Фраза с паузами','Перескоки струн','Бенд и пауза','Четыре такта'],v:PORD.map((p,k)=>({l:PRU[k],lv:lvs(b5(POS[p].split(' '),BEND[p]))}))},

R6:{name:'Бугги-линия',goal:'Однонотный бугги-рифф по квадрату.',how:'Ступени аккорда по одной ноте; рисунок линии задаёт вариант. На первом уровне четвертями ровно, дальше свингом. На пятом перед сменой аккорда последняя нота — подход на полтона к новой тонике.',tip:'Короткая восьмая чуть тише долгой, но не проглатывается.',sub:3,lvl:['Четвертями','Свинг на тонике','Четыре такта','12-тактовый квадрат','Квадрат с подходами'],v:mv(R6S)},
R7:{name:'Аккомпанемент септаккордами',goal:'Свинговый аккомпанемент квадрата.',how:'Аккорды из трёх нот: тоника, септима, терция. Паузы глушат обе руки. Ритмическая фигура своя у каждого варианта; на пятом уровне через такт — другая фигура.',tip:'Аккорд короткий и сухой: левая рука ослабляет нажим сразу после удара.',sub:3,lvl:['Четвертями','Фигура на I и IV','8 тактов','12-тактовый квадрат','Через такт — другая фигура'],v:mv(R7S)},
R8:{name:'Стоп-тайм',goal:'Точный удар и тишина в стоп-тайме.',how:'Удар аккордом на первую долю, дальше тишина до конца такта; со второго уровня — фигура удара варианта. В четвёртом такте — сбивка по пентатонике. На пятом уровне после стоп-тайма — шаффл до конца квадрата.',tip:'Считай паузу вслух. Сбивка начинается ровно на долю, без спешки.',sub:3,lvl:['Удар и тишина','Фигура варианта','Стоп-тайм со сбивкой','8 тактов','12-тактовый квадрат'],v:mv(R8S)},
R9:{name:'Ладонь и акценты',goal:'Динамика шаффла: приглушение и открытый звук.',how:'Шаффл 5–6. Под ладонью — нота с m в табе, остальное звучит открыто. Какие доли звучат открыто, задаёт вариант.',tip:'Громкость открытых долей растёт за счёт ладони, а не силы удара.',sub:3,lvl:['Всё под ладонью','Такт под ладонью, такт с акцентами','Акценты на I и IV','С септимой','12-тактовый квадрат'],v:mv(R9S)},
R10:{name:'Медленный блюз 12/8',goal:'Триольная пульсация медленного блюза.',how:'Размер 12/8: щелчок — восьмая, акценты на начале каждой группы из трёх. Сначала аккорд на долю, потом триольная фигура варианта. На пятом уровне в конце квадрата — тёрнэраунд.',tip:'Три ноты доли ровные. Медленный темп — тяни звук, не торопи.',sub:3,lvl:['Аккорд на долю','Фигура варианта','Четыре такта','12-тактовый квадрат','Квадрат с тёрнэраундом'],v:mv(R10S)},
R11:{name:'Гибридный пикинг',goal:'Медиатор и пальцы вместе.',how:'Бас — медиатором, двойная нота сверху — средним и безымянным пальцами одновременно. Свинг.',tip:'Пальцы щиплют вверх от грифа коротко, медиатор не меняет хвата.',sub:3,lvl:['Бас на тонике','Фигура варианта','Четыре такта','8 тактов','12-тактовый квадрат'],v:mv(R11S)},
R12:{name:'Чикен-пикинг',goal:'Щелчок пальцем после глухой ноты.',how:'Шестнадцатые. Глухая нота (x) — медиатором по заглушённой струне, следующая — щипок средним пальцем, струна щёлкает о лады.',tip:'Левая рука держит ноту лёгким касанием на x и прижимает на щелчке.',sub:4,lvl:['Одна струна','Две струны','Три струны','Двухтактный лик','Двойные ноты'],v:mv(R12S)},
R13:{name:'Сексты и терции',goal:'Ритм-партия двойными нотами.',how:'Секста — струны через одну, терция — соседние. Свинг. Двойная нота звучит как одна: обе струны вместе.',tip:'Струну между нотами сексты глушит палец, который играет нижнюю ноту.',sub:3,lvl:['Одна секста','Фигура варианта','Четыре такта','Смена I–IV–I–V','12-тактовый квадрат'],v:mv(R13S)},
R14:{name:'Тёрнэраунды',goal:'Ходы последних тактов квадрата.',how:'Хроматический ход против педали, затем доминанта. Вид хода задаёт вариант. На четвёртом уровне добавляется встречный голос.',tip:'Педаль звучит ровно и тише хода: ход ведёт.',sub:3,lvl:['Четвертями','Свинг','Триоли','Встречное движение','Лик, ход и доминанта'],v:mv(R14S)},
R15:{name:'Вызов и ответ',goal:'Рифф-вопрос и лик-ответ в одной партии.',how:'Две доли — рифф на нижних струнах, две — ответ по пентатонике выше. На четвёртом и пятом уровнях рифф идёт по аккордам квадрата.',tip:'Ответ — продолжение фразы, а не новая: держи один ритм.',sub:3,lvl:['Только вызов','Вызов и ответ','Три разных ответа','8 тактов','12-тактовый квадрат'],v:mv(R15S)},
R37:{name:'Глухие удары шестнадцатыми',goal:'Плотный фанк-блюзовый ритм с глухими ударами.',how:'Шестнадцатые, рука движется вниз-вверх без остановки. x — левая рука ослабляет аккорд, медиатор бьёт по заглушённым струнам.',tip:'Рука не останавливается и в паузах: просто не задевает струны.',sub:4,lvl:['Аккорд на долю','Рисунок варианта','Рифф на басу','Два аккорда','Четыре такта'],v:mv(R37S)}
};
const PLAIN=PEN;
const EXEN={
W0:{name:'Warm-up',goal:'Warm up the hands and wake up the ears.',how:'One minute without the guitar: rub your palms until warm, slow wrist and shoulder circles, open and close your fists 20 times. Then the {A} minor pentatonic in position 1 up and down, slowly, on a clean tone.',tip:'Gentle movement only. Cold hands are not ready for bends yet.',v:['{A} minor pentatonic, position 1']},
W1:{name:'Mobility without the guitar',goal:'Get blood flowing in the hands and forearms.',how:'Rub your palms until warm. Wrist circles both ways, 10 each. Shoulders up, back, down. Open and close your fists 20 times. Shake out relaxed hands.',tip:'No stretching into pain: only warmth and mobility.'},
W2:{name:'Pentatonic in two positions',goal:'Switch on hand sync and find your way round the neck.',how:'Clean tone, eighths, deliberately slow tempo. Position 1 of {A} minor up, position 2 down.',tip:'Every note rings its full length, no gaps at string changes.',v:['Positions 1 and 2']},
W3:{name:'Gentle bends',goal:'Get the fingers and strings ready for bending.',how:'Clean tone, eighths, half your working tempo. First a half step, then a whole step: bend and release. Bend with three fingers together, not one.',tip:'Fingertips are still cold: do not go past a whole step or press harder than needed.',v:['Half step and whole step']},
B1:{name:'Pentatonic sixteenths',goal:'Even alternate picking in fast pentatonic phrases.',how:'Strict down-up, sixteenths. Every third set as sextuplets, then thirty-seconds at half tempo. Each week has its own pentatonic position.',tip:'With two notes per string the pick never gets stuck: the move across a string is as short as the stroke.',lvl:['Two strings','Four strings','Whole position up and down','Sequence in threes','Sequence in fours up and down'],v:PLAIN},
B2:{name:'Bends in tune',goal:'A bend that lands exactly on the target pitch.',how:'Eighths. First play the target note on its fret, then bend up to it. The release goes back exactly to the starting note. Level 4 is a unison bend: the higher string holds the target, the bend catches up until the beating stops.',tip:'Bend with three fingers, the wrist turns like a key in a lock. Free fingers mute the neighbouring strings.',lvl:['Target note and bend','Bend and release','Bend in a lick','Unison bend','Two phrases with vibrato on the bend'],v:['Whole step on the {s:G} string: {D}→{E}',{l:'Whole step on the {s:B} string: {G}→{A}',note:'In half the sets play the target note first; in the other half bend blind and check against the note afterwards.'},'Whole step on the {s:B} string, position 4: {D}→{E}',{l:'Whole step on the {s:e} string: {C}→{D}',note:'Instead of a unison, the bend sits under a note on the neighbouring string.'},'Whole step on the {s:G} string: {G}→{A}','Half step: the blue note {D#}']},
B3:{name:'Vibrato',goal:'Even, singing vibrato in time.',how:'Eighths. Vibrato in time: two pulses per beat. The pitch goes up from the note and comes back exactly to it. On levels 4 and 5, vibrato on a held bend.',tip:'The wrist moves, not the finger: the thumb rests on the neck or hooks over it.',lvl:['Long note','Approach to the note','Two notes with vibrato','Vibrato on a bend','Four bars'],v:['Vibrato on the {s:G} string','Vibrato on the {s:B} string, little finger','With the index finger','Vibrato on the {s:D} string','Position 4','Wide vibrato on the {s:e} string']},
B4:{name:'5–6 shuffle',goal:'An even swing and the chord changes of the twelve-bar.',how:'Two neighbouring strings: root and fifth, then root and sixth; the variant sets the figure and the position. Swing: each beat is a long and a short eighth (except the straight-eighths variant). Level 5 adds the flat seventh to the figure.',tip:'The root rings all the time; only the finger on the higher string moves. The palm lightly touches the strings by the bridge.',lvl:['Root only','Root and the IV chord','8 bars with a quick change','Twelve-bar blues','Twelve-bar with the seventh'],v:men(B4S)},
B5:{name:'Clean rests',goal:'Silence in the rests of lead phrases.',how:'Eighths. A dot in the tab is a rest: both hands mute the strings. After a bend the string comes back down and goes quiet without a squeak.',tip:'Test: stop on any rest. It should be silent, with no hum from the other strings.',lvl:['Long rests','Phrase with rests','String skips','Bend and rest','Four bars'],v:PLAIN},
R6:{name:'Boogie line',goal:'A single-note boogie riff through the twelve-bar.',how:'Chord tones one note at a time; the variant sets the shape of the line. Straight quarters on level 1, swing from then on. On level 5, the last note before a chord change is a half-step approach to the new root.',tip:'The short eighth is a little quieter than the long one, but never swallowed.',lvl:['Quarter notes','Swing on the root','Four bars','Twelve-bar blues','Twelve-bar with approach notes'],v:men(R6S)},
R7:{name:'Seventh-chord comping',goal:'Swinging accompaniment through the twelve-bar.',how:'Three-note chords: root, seventh, third. Both hands mute the rests. Each variant has its own rhythm figure; on level 5 a second figure comes every other bar.',tip:'Keep the chord short and dry: the fretting hand eases off right after the strum.',lvl:['Quarter notes','The figure on I and IV','8 bars','Twelve-bar blues','A second figure every other bar'],v:men(R7S)},
R8:{name:'Stop-time',goal:'A precise hit and silence in stop-time.',how:'One chord hit on beat one, then silence to the end of the bar; from level 2 on, the hit figure of the variant. Bar four has a pentatonic fill. On level 5 the stop-time is followed by a shuffle to the end of the twelve-bar.',tip:'Count the rest out loud. The fill starts exactly on the beat, without rushing.',lvl:['Hit and silence','The variant figure','Stop-time with a fill','8 bars','Twelve-bar blues'],v:men(R8S)},
R9:{name:'Palm and accents',goal:'Shuffle dynamics: palm-muted versus open.',how:'5–6 shuffle. Notes marked m in the tab go under the palm, the rest ring open. The variant sets which beats ring open.',tip:'The open beats get louder because the palm lifts, not because you strike harder.',lvl:['All under the palm','A bar muted, a bar with accents','Accents over I and IV','With the seventh','Twelve-bar blues'],v:men(R9S)},
R10:{name:'Slow blues in 12/8',goal:'The triplet pulse of a slow blues.',how:'In 12/8 a click is an eighth, accents mark the start of each group of three. First one chord per beat, then the triplet figure of the variant. Level 5 ends the twelve-bar with a turnaround.',tip:'The three notes of each beat are even. At a slow tempo let the sound sustain, do not rush.',lvl:['A chord per beat','The variant figure','Four bars','Twelve-bar blues','Twelve-bar with a turnaround'],v:men(R10S)},
R11:{name:'Hybrid picking',goal:'Pick and fingers together.',how:'The bass note with the pick, the double stop above with the middle and ring fingers at once. Swing.',tip:'The fingers pluck up and away from the neck briefly; the pick grip does not change.',lvl:['Bass on the root','The variant figure','Four bars','8 bars','Twelve-bar blues'],v:men(R11S)},
R12:{name:'Chicken picking',goal:'A finger snap after a muted note.',how:'Sixteenths. The dead note (x) is picked on a muted string; the next note is plucked with the middle finger so the string snaps against the frets.',tip:'The fretting hand only touches the note on the x and presses on the snap.',lvl:['One string','Two strings','Three strings','Two-bar lick','Double stops'],v:men(R12S)},
R13:{name:'Sixths and thirds',goal:'A rhythm part in double stops.',how:'A sixth is two strings with one between, a third is two neighbouring strings. Swing. A double stop sounds as one: both strings together.',tip:'The finger that plays the lower note of the sixth also mutes the string in between.',lvl:['One sixth','The variant figure','Four bars','I–IV–I–V changes','Twelve-bar blues'],v:men(R13S)},
R14:{name:'Turnarounds',goal:'The moves of the last bars of the twelve-bar.',how:'A chromatic line against a pedal note, then the dominant. The variant sets the kind of line. Level 4 adds a voice moving the other way.',tip:'The pedal rings evenly and quieter than the moving line: the line leads.',lvl:['Quarter notes','Swing','Triplets','Contrary motion','Lick, turnaround and dominant'],v:men(R14S)},
R15:{name:'Call and response',goal:'A riff that asks and a lick that answers in one part.',how:'Two beats of riff on the low strings, two beats of pentatonic answer higher up. On levels 4 and 5 the riff follows the chords of the twelve-bar.',tip:'The answer continues the phrase rather than starting a new one: keep one rhythm.',lvl:['The call only','Call and response','Three different answers','8 bars','Twelve-bar blues'],v:men(R15S)},
R37:{name:'Sixteenth-note scratches',goal:'A tight funk-blues rhythm with muted strums.',how:'Sixteenths, the hand moves down and up without stopping. On x the fretting hand eases off the chord and the pick hits the muted strings.',tip:'The hand keeps moving through the rests too: it just misses the strings.',lvl:['A chord on the beat','The variant pattern','A riff on the bass strings','Two chords','Four bars'],v:men(R37S)}
};
const TESTS=[
  {id:'GBT1',ru:['Шаффл 5–6','{E}, свинг, держать 30 секунд без сбоя ритма.'],en:['5–6 shuffle','{E}, swing, hold 30 seconds without losing the groove.'],sub:3,t:[shufBar(CH.I,[2,2,4,4])]},
  {id:'GBT2',ru:['Пентатоника шестнадцатыми','{A}m, 1-я позиция, вверх и вниз два круга.'],en:['Pentatonic sixteenths','{A} minor, position 1, up and down twice.'],sub:4,t:[J(...PENT1,...PENT1.slice().reverse())]},
  {id:'GBT3',ru:['Бугги-линия','{E}, свинг, четыре такта подряд без сбоя.'],en:['Boogie line','{E}, swing, four bars in a row without a slip.'],sub:3,t:[pairs(boogie(CH.I))]},
  {id:'GBT4',ru:['Пентатоника четвёрками','{A}m, 1-я позиция, секвенция по четыре ноты вверх, шестнадцатые.'],en:['Pentatonic in fours','{A} minor, position 1, a four-note sequence going up, sixteenths.'],sub:4,t:b1(PENT1)[4].slice(0,1)},
  {id:'GBT5',ru:['Легато триолями','{A}m, 1-я позиция: вверх хаммерами, вниз пулл-оффами.'],en:['Legato triplets','{A} minor, position 1: up with hammer-ons, down with pull-offs.'],sub:3,t:['E5 Eh8 A5 Ah7 D5 Dh7 G5 Gh7 B5 Bh8 e5 eh8','e8 ep5 B8 Bp5 G7 Gp5 D7 Dp5 A7 Ap5 E8 Ep5']}
];
const RIFF={
  ru:['хотя бы одна пауза длиной в целую долю','закончить на блюзовой ноте — пониженной квинте','только три нижние струны','хотя бы один бенд на тон','второй раз рифф повторяется с изменённой последней долей','через весь рифф проходит открытая нижняя струна','не больше пяти разных нот','рифф начинается не с сильной доли','стоп-тайм: удар на первую долю и тишина до конца такта','в риффе есть двойная нота: терция или секста','первый такт — вопрос, второй — ответ','темп на 20% ниже рабочего, но с полным свингом'],
  en:['at least one rest a full beat long','end on the blue note, the flat fifth','only the three lowest strings','at least one whole-step bend','the second time through, the last beat changes','an open low string runs through the whole riff','no more than five different notes','the riff does not start on a strong beat','stop-time: a hit on beat one and silence to the end of the bar','includes a double stop: a third or a sixth','the first bar asks, the second answers','tempo 20% below your working tempo, but fully swung']
};
const COACH={
  W0:{free:60},
  B1:{cyc:[{},{},{sub:6,play:6,tag:['Секстоли','Sextuplets']},{sub:4,play:8,bpmMul:0.5,tag:['32-е на половине темпа','32nds at half tempo']}]},
  B2:{v:{1:{cyc:[{tag:['Сначала целевая нота, потом бенд','Target note first, then the bend']},{tag:['Бенд вслепую, проверка нотой после','Blind bend, check with the note after']}]}}}
};
return {EX,EXEN,COACH,TESTS,RIFF};
})();
// Блюз, электрогитара, часть 2: A16–A23, A38, A39, L24–L31, L40, C32–C36.
// Табы записаны в {A} (5-я позиция) и переносятся сдвигом ладов: вариант = тональность (или позиция у A38, этюд у C36).
const BLG2=(()=>{
  // сдвиг всех ладов (и бендов) на k; длительности :k и деления /n не трогаются
  const sh=(t,k)=>k?t.replace(/(^|[^:\/\d])(\d+)/g,(a,p,n)=>p+(+n+k)):t;
  const KEYS=[['{A}',0],['{E}',7],['{D}',5],['{G}',-2],['{C}',3],['{B}',2]];
  // аккорды для шаблонов
  const a9='E5+A4+D5+G4',d9='A5+D4+G5+B5',e9='A7+D6+G7+B7',X9='Dx+Gx+Bx';
  const a7=['D5+G6+B5+e5','D7+G6+B8+e5','D11+G12+B10+e12','D14+G14+B14+e15'],d7a='D4+G5+B3+e5',d7b='D12+G11+B13+e10',e7a='D6+G7+B5+e7',e7b='D9+G9+B9+e10',X7='Dx+Gx+Bx+ex';
  const sh4=(c,m)=>{const q=c+(m||'');return `${c}:2 ${q} ${c}:2 ${q} ${c}:2 ${q} ${c}:2 ${q}`;};
  const P=(sub,t)=>({sub,t});
  // ---------- шаблоны уровней (в {A}) ----------
  const L={
    A16:[P(2,'E5 A4 A7 D5 A7 A4 E5 .'),
         P(2,'E5 A4 A7 D5 D7 G6 D7 D5 | A7 A4 E5 A4 A7 D5 D7 .'),
         P(2,'E5 A4 A7 D5 D7 G6 B5 B8 | e5 B8 B5 G6 D7 D5 A7 A4'),
         P(2,'E5 A4 A7 D5 D7 G6 D7 D5 | A5 D4 D7 G5 G7 B7 G7 G5'),
         P(3,'E5 A4 A7 D5 D7 G6 D7 D5 A7 A4 E5 . | A5 D4 D7 G5 G7 B7 G7 G5 D7 D4 A5 . | A7 D6 D9 G7 G9 B9 G9 G7 D9 D6 A7 . | E5 A4 A7 D5 E5:2 .:6')],
    A17:[P(3,`.:3 ${a9}:2 . .:3 ${a9}:2 .`),
         P(3,sh4(a9)),
         P(3,sh4(a9,'m')+' | '+sh4(d9,'m')),
         P(3,[a9,d9,a9,e9].map(c=>`${c}:2 ${X9} ${c}:2 ${X9} .:3 ${c}:2 ${X9}`).join(' | ')),
         P(3,[a9,d9,a9,e9].map(c=>`${sh(c,-1)} ${c}:2 ${X9} ${c}:2 .:3 ${c}:2 ${X9}`).join(' | '))],
    A18:[P(2,'G6+e5:2 G7+e7:2 G9+e9:2 G7+e7:2'),
         P(2,'G6+e5 G7+e7 G9+e9 G11+e10 G9+e9 G7+e7 G6+e5 G4+e3'),
         P(3,'G5+e5 Gh6+e5:2 G7+e7:2 G7+e7 G9+e9:2 G7+e7 G6+e5:2 .'),
         P(3,'G6+B5:2 G6+B5 G7+B7:2 G7+B7 G9+B8:2 G9+B8 G7+B7:2 G6+B5 | G6+e5:2 G7+e7 G9+e9:2 G11+e10 G9+e9:2 G7+e7 G6+e5:3'),
         P(3,'B8+e8:2 B8+e8 B8+e8:2 B8+e8 B8b10+e8:3 G6+e5:3 | G7+e7:2 G6+e5 G4+e3:2 G6+e5 G5+e5 Gh6+e5:2 G6+e5:3')],
    A19:[P(2,'E5 E7 A4 A5 A7 D4 D5 D7 | D7 D5 D4 A7 A5 A4 E7 E5'),
         P(2,'E5 E7 A4 A5 A7 D4 D5 D7 | G4 G6 G7 B5 B7 B8 e5 . | e5 B8 B7 B5 G7 G6 G4 D7 | D5 D4 A7 A5 A4 E7 E5 .'),
         P(2,'E5 A4 E7 A5 A4 A7 A5 D4 | A7 D5 D4 D7 D5 G4 D7 G6'),
         P(3,'E5 E7 A4 E7 A4 A5 A4 A5 A7 A5 A7 D4 | D4 D5 D7 D5 D7 G4 D7 G4 G6 G4 G6 G7 | G6 G7 B5 G7 B5 B7 B5 B7 B8 e5:3'),
         P(3,'G5 Gh6 B5 G7 G6 D7 D5 D4 A7 A5 A4 E5 | E8 Eh9 A7 D5 D4 D7 G5 Gh6 B5 e5:3')],
    A20:[P(2,'E5 E7 A4 A7 D4 D7 G4 G6 | G6 G4 D7 D4 A7 A4 E7 E5'),
         P(2,'E5 E7 A4 A7 D4 D7 G4 G6 | B5 B7 e5 B7 B5 G6 G4 D7'),
         P(3,'E5 E7 A4 E7 A4 A7 A4 A7 D4 A7 D4 D7 | D4 D7 G4 D7 G4 G6 G4 G6 B5 G6 B5 B7'),
         P(3,'E8 Eh9 A7 A4:2 E5 G5 Gh6 B5 e5:2 . | B8b9 B5 G7:2 G6 D7:2 D5 D4 A7:3'),
         P(3,'E8 Eh9 A7 A4:2 E5 G5 Gh6 B5 e5:2 . | B8b9 B5 G7:2 G6 D7:2 D5 D4 A7:3 | e8b9r8 e5 B8 B5:2 G7 G5 Gh6 D7 E5:3')],
    A21:[P(3,'G8+e5:3 G7+e5:3 G6+e5:3 G5+e5:3 | A7+D6+G7+B5:6 .:6'),
         P(3,'e5 B5 G8 e5 B5 G7 e5 B5 G6 e5 B5 G5 | A7+D6+G7+B5:6 .:6'),
         P(3,'e5 B5 G8 e5 B5 G7 e5 B5 G6 e5 B5 G5 | A7 D6 D9 G7 D9 D6 A7:6'),
         P(3,'e5 B5 G8 e5 B5 G7 e5 B5 G6 e5 B5 G5 | E5+D7:3 E6+D6:3 E7+D5:3 E8+D4:3 | A7 D6 D9 G7 D9 D6 A7:6'),
         P(3,'B8b10:2 e5 B8b10r8 e5 G7 G5 Gh6 D7 E5:3 | e5 B5 G8 e5 B5 G7 e5 B5 G6 e5 B5 G5 | E5+D7:3 E6+D6:3 E7+D5:3 E8+D4:3 | A7 D6 D9 G7 D9 D6 A7:6')],
    A22:[P(2,`${a7[0]}:4 ${a7[1]}:4 | ${a7[2]}:4 ${a7[1]}:4`),
         P(2,`${a7[0]}:2 ${a7[1]}:2 ${a7[2]}:2 ${a7[3]}:2 | ${a7[3]}:2 ${a7[2]}:2 ${a7[1]}:2 ${a7[0]}:2`),
         P(2,`${a7[0]}:4 ${d7a}:4 | ${a7[1]}:4 ${d7b}:4 | ${a7[0]}:4 ${e7a}:4`),
         P(3,[a7[0],d7a,a7[0],e7a].map(c=>sh4(c)).join(' | ')),
         P(3,[[a7[0],a7[1]],[d7a,d7b],[a7[0],a7[1]],[e7a,e7b]].map(([c,u])=>`${c}:2 ${c} ${u}:2 ${u} ${c}:2 ${X7} ${c}:3`).join(' | '))],
    A23:[P(2,'E5 E8 A5 A6 A7 D5 D7 . | D7 D5 A7 A6 A5 E8 E5 .'),
         P(2,'E5 E8 A5 A6 A7 D5 D7 G5 | G7 G8 B5 B8 e5 B8 B5 G8 | G7 G5 D7 D5 A7 A6 A5 E8 | E5:8'),
         P(3,'A5 A6 A7 A6 A5 E8 E5:3 .:3 | G5 G7 G8 G7 G5 D7 D5:3 .:3'),
         P(3,'B8 B5 G7b8:2 G7 G5 D7:2 D5 A7:3 | A5 A6 A7 A6 A5 E8 E5:3 .:3'),
         P(3,'B8 B5 G7b8:2 G7 G5 D7:2 D5 A7:3 | A5 A6 A7 A6 A5 E8 E5:3 .:3 | E8 E10 E11 A7 A10 D7 D10 G7 G8 G9 B8 B10 | e8:3 B10 B8 G9 G8 G7 D10 D7:3')],
    A39:[P(3,'A5:2 Ah7 A5:2 E8 E5:3 .:3 | B8b10:3 B8b10r8:2 e5 B8:3 .:3'),
         P(3,'A5:2 Ah7 A5:2 E8 E5:3 .:3 | B8b10:3 B8b10r8:2 e5 B8:3 .:3 | A5:2 Ah7 A5:2 E8 E5:3 .:3 | G7b9:3 G7b9r7:2 G5 D7:3 .:3'),
         P(3,'A5:2 Ah7 A5:2 E8 E5~:3 .:3 | e8b10:3 e8b10r8:2 e5 B8 B5 G7 D7~:3 | A5:2 Ah7 A5:2 E8 E5~:3 .:3 | G7b9:3 G7b9r7:2 G5 D7 D5 A7 A5~:3'),
         P(3,'A5:2 Ah7 A5:2 E8 E5~:3 .:3 | e15b17:3 e15b17r15:2 e12 B15 B13 G12 G14~:3 | A5:2 Ah7 A5:2 E8 E5~:3 .:3 | G7b9:3 G7b9r7:2 G5 D7 D5 A7 A5~:3'),
         P(3,'A5:2 Ah7 A5:2 E8 E5~:3 .:3 | e15b17:3 e15b17r15:2 e12 B15 B13 G12 G14~:3 | G5+B5:2 Gh7+B8 G7+B8:2 G5 D7:3 .:3 | B8b10+e8:3 B8b10r8+e8:2 B5 G7 D7 A7 A5~:3')],
    L24:[P(2,'B10:2 B8b10:2 B10:2 B8b10r8:2'),
         P(2,'G9:2 G7b9:2 G9:2 G7b9r7:2 | B10:2 B8b10:2 e5:2 B8b10r8:2'),
         P(3,'B8b10:3 B8b10r8:2 B5 G7b9:3 G7b9r7:2 G5 | D7:2 D5 A7:2 A5 E8:2 E5 .:3'),
         P(3,'G7b9+B5:3 G7b9r7+B5:3 B8b10+e5:3 B8b10r8+e5:3 | e8b10:3 e8b10r8 e5 B8 G7b9:3 D7:3'),
         P(3,'B8b10~:6 B8b10r8 B5 G7 G7b9~:3 | e8b10~:3 e8b10r8:2 e5 B8 B5 G7b9r7 D7~:3')],
    L25:[P(2,'G8:2 G7b8:2 G8:2 G7b8r7:2'),
         P(2,'B9:2 B8b9:2 B8b9r8:2 B5:2 | G8:2 G7b8:2 G7b8r7:2 G5:2'),
         P(3,'B5b8:3 B5b8r5:2 G7 G7b8:3 G7b8r7 G5 D7 | B8b9:3 B8b9r8 B5 G7 D7:2 D5 A7:3'),
         P(3,'G7b8:2 G7b9 B8b9:2 B8b10 B5b8:3 e5:3 | e8b10:2 e8b11 e8b10r8:2 e5 B8b9r8 B5 G7 G7b9~:3'),
         P(3,'G7b8:2 G7b9 B8b9:2 B8b10 B5b8:3 e5:3 | e8b10:2 e8b11 e8b10r8:2 e5 B8b9r8 B5 G7 G7b9~:3 | e15b17:3 e15b16:3 e12 B15 B13 G14~:3')],
    L26:[P(2,'e5~:4 e8~:4 B8~:4 B5~:4'),
         P(2,'B8b10~:4 B8b10r8:2 B5:2 G7b9~:4 G7:2 G5:2'),
         P(2,'e5~:2 e7~:2 e8~:2 e7~:2 | B5~:2 B7~:2 B8~:2 B7~:2'),
         P(3,'e8b10:3 e8b10r8 e5 B8 B5:2 G7 D7~:3 | B8b10~:6 G7b9~:6'),
         P(3,'B5 B8 e5 e8b10~:9 | e8b10r8 e5 B8 B5 G7 G7b9~:4 .:3 | D7 D5 A7 A5~:9')],
    L27:[P(3,'A5 Ah7 . D5 Dh7 . G5 Gh7 . B5 Bh8 .'),
         P(3,'E5 Eh8 A5 Ah7 D5 Dh7 G5 Gh7 B5 Bh8 e5 eh8 | e8 ep5 B8 Bp5 G7 Gp5 D7 Dp5 A7 Ap5 E8 Ep5'),
         P(3,'e5 eh8 ep5 B5 Bh8 Bp5 G5 Gh7 Gp5 D5 Dh7 Dp5 | A5 Ah7 Ap5 E5 Eh8 Ep5 A5:3 .:3'),
         P(3,'A5 Ah6 Ah7 Ap5 E8 Ep5 G5 Gh7 Gh8 Gp7 Gp5 D7 | B5 Bh8 Bp5 G7 Gp5 D7 Dp5 A7 Ap6 Ap5 E8 E5'),
         P(4,'e8 ep5 B8 Bp5 G7 Gp5 D7 Dp5 A7 Ap5 E8 Ep5 E5 Eh8 A5 Ah7 | D5 Dh7 G5 Gh7 B5 Bh8 e5 eh8 eh10 ep8 ep5 B8 Bp5 G7:3')],
    L28:[P(2,'G5 G7 B5 B8 G7 G9 B8 B10'),
         P(2,'D5 D7 G5 G7 B5 B8 e5 e8 | e10 e8 B10 B8 G9 G7 D10 D7'),
         P(3,'B5 B8 e5 e8 B8 B10 e8 e10 B10 B13 e10 e12 | e12 B13 B10 e10 B10 B8 e8 B8 B5 e5:3'),
         P(3,'G5 G7 Gh9 B8 B10 Bp8 G9 Gp7 Gp5 D7:3 | B5 B8 e5 e8 B8 B10 e8 e10 B10 B13 e10 e12 | e12 B13 B10 e10 B10 B8 e8 B8 B5 e5:3'),
         P(4,'e5 e8 B5 B8 e8 e10 B8 B10 e10 e12 B10 B13 e12 e15 B13 B15 | e17 e15 B17 B15 e15 e12 B15 B13 e12 e10 B13 B10 e10 e8 B10:2')],
    L29:[P(3,'B10+e5:3 B8b10+e5:3 B10+e5:3 B8b10r8+e5:3'),
         P(3,'B10+e5:3 B8b10+e5:3 B10+e5:3 B8b10r8+e5:3 | G9+B5:3 G7b9+B5:3 G7b9r7+B5:3 G5+B5:3'),
         P(3,'B8b10+e8:3 B8b10r8+e8:3 B8+e8 B5 G7 G7b9+B8:3'),
         P(3,'B8b10+e5~:6 B8b10r8+e5:3 B5 G7 G5 | G7b9+B8:3 G7b9r7+B8:3 D7 D5 A7 A5~:3'),
         P(3,'B8b10+e5~:6 B8b10r8+e5:3 B5 G7 G5 | G7b9+B8:3 G7b9r7+B8:3 D7 D5 A7 A5~:3 | B15b17+e12:6 B15b17r15+e12:3 B13 G14 G12')],
    L30:[P(3,'A5 A6 A7:2 . . D5 D6 D7:2 . .'),
         P(3,'G5 G6 G7 B5 B6 B7 B8 e5 e6 e7 e8 . | e8 e7 e6 e5 B8 B7 B6 B5 G7 G6 G5 .'),
         P(3,'E5 E6 E7 E8 A5 A6 A7 D5 D6 D7:3 | G5 G6 G7 G8 G7 G5 D7 D6 D5 A7:3'),
         P(3,'B8 B7 B6 B5 G7 G6 G5 D7 D6 D5 A7 A5 | E8 E7 E6 E5:3 .:6'),
         P(3,'E5 E6 E7 E8 A5 A6 A7 D5 D6 D7:3 | G5 G6 G7 G8 G7 G5 D7 D6 D5 A7:3 | B8 B7 B6 B5 G7 G6 G5 D7 D6 D5 A7 A5 | E8 E7 E6 E5:3 .:6')],
    L31:[P(3,'E5+A7:2 E5+A7 E5+A9:2 E5+A9 E5+A7:2 E5+A7 E5+A9:2 E5+A9'),
         P(3,'E5+A7:2 E5+A7 E5+A9:2 E5+A9 E5+A10:2 E5+A10 E5+A9:2 E5+A9'),
         P(3,'E5+A7m:2 E5+A7m E5+A9m:2 E5+A9m E5+A10m:2 E5+A10m E5+A9m:2 E5+A9m | A5+D7m:2 A5+D7m A5+D9m:2 A5+D9m A5+D10m:2 A5+D10m A5+D9m:2 A5+D9m'),
         P(3,'E5:2 A4 A7:2 A9 A10:2 A9 A7:2 A4 | A5:2 D4 D7:2 D9 D10:2 D9 D7:2 D4 | A7:2 D6 D9:2 D11 D12:2 D11 D9:2 D6 | E5:2 A4 A7:2 A9 A10:2 A9 A7:2 A4'),
         P(3,'E5+A7:2 E5+A7 E5+A9:2 E5+A9 E5+A10:2 E5+A10 E5+A9:2 E5+A9 | A5+D7:2 A5+D7 A5+D9:2 A5+D9 A5+D10:2 A5+D10 A5+D9:2 A5+D9 | E5:2 A4 A7:2 A9 A10:2 A9 A7:2 A4 | A7:2 D6 D9:2 D11 D12:2 D11 D9:2 D6 | A5:2 D4 D7:2 D9 D10:2 D9 D7:2 D4 | E5:2 A4 A7:2 A9 A10:2 A9 A7:2 A4')],
    L40:[P(2,'E5+D7:2 E8+D10:2 A5+G7:2 A7+G9:2'),
         P(2,'E5+D7 E5+D7 E8+D10 E8+D10 A5+G7 A5+G7 A7+G9 A7+G9 | A5+G7 . E8+D10 . E5+D7:4'),
         P(2,'E5+D7:2 E8+D10:2 A5+G7:2 A7+G9:2 | D7+B10 D10+B13 G7+e10 G9+e12 G7+e10 D10+B13 D7+B10:2'),
         P(3,'E5+D7:2 E5+D7 E8+D10:2 E8+D10 A5+G7:2 A7+G9 A5+G7 E8+D10:2 | E5+D7:6 .:6'),
         P(3,'E5+D7:2 E5+D7 E8+D10:2 E8+D10 A5+G7:2 A7+G9 A5+G7 E8+D10:2 | D7+B10:2 D10+B13 G7+e10:2 G9+e12 G7+e10 D10+B13:2 D7+B10:3')]
  };
  // связки
  const r1='E5+A7:2 E5+A7 E5+A9:2 E5+A9 E5+A7:2 E5+A7 E5+A9:2 E5+A9',r2='E5+A7:2 E5+A7 E5+A9:2 E5+A9 E5+A10:2 E5+A10 E5+A9:2 E5+A9',r4='A5+D7:2 A5+D7 A5+D9:2 A5+D9 A5+D10:2 A5+D10 A5+D9:2 A5+D9';
  const l1='A5:2 Ah7 A5:2 E8 E5:3 .:3',l2='B8b10:3 B8b10r8:2 B5 G7 G5 D7 D5:3',l3='G7b9:3 G7b9r7:2 G5 D7 D5 A7 A5~:3';
  const cA='E5+A7+D5+G6',cD='A5+D7+G5+B7',cE='A7+D9+G7+B9';
  Object.assign(L,{
    C32:[P(3,`${r1} | ${l1}`),P(3,`${r2} | ${l2}`),P(3,`${r2} | ${r2} | ${l2} | ${l3}`),P(3,`${r2} | ${l2} | ${r4} | ${l3}`),P(3,`${r2} | ${l1} | ${r4} | ${l3} | ${r2} | ${l2}`)],
    C33:[P(3,'B8b10:3 B8b10r8:2 B5 G7 Gp5 D7 D5:3'),
         P(3,'B8b10:3 B8b10r8:2 B5 G7 Gp5 D7 D5:3 | A5 Ah7 Ap5 E8 Ep5 . A7~:6'),
         P(3,'G7b9+B5:3 G7b9r7 Gp5 D7 D5 Dh7 Dp5 A7~:3 | A5 Ah7 Ap5 E8 Ep5 . A7~:6'),
         P(4,'e8 ep5 B8 Bp5 G7 Gp5 D7 Dp5 A7 Ap5 E8 Ep5 E5:4 | B8b10:8 B8b10r8:2 B5:2 G7~:4'),
         P(3,'G7b9+B5:3 G7b9r7 Gp5 D7 D5 Dh7 Dp5 A7~:3 | /4 e8 ep5 B8 Bp5 G7 Gp5 D7 Dp5 A7 Ap5 E8 Ep5 E5:4 | B8b10:8 B8b10r8:2 B5:2 G7~:4')],
    C34:[P(2,'G7 Gx G7 Gx B8 Bx B8 Bx'),
         P(4,'G7 Gx B8 . G7 Gx B8 . G6 Gx B5 . G6 Gx B5 .'),
         P(4,'D7 G6+e5 . D7 G7+e7 . D7 G9+e9 . D7 G7+e7 . D7:4'),
         P(4,'Bx B8 Bp5 G7 Gx G7 Gp5 D7 Dx D7 Dp5 A7 A5:4 | D7 G6+e5 . D7 G7+e7 . D7 G9+e9 . D7 G7+e7 . D7:4'),
         P(4,'Bx B8 Bp5 G7 Gx G7 Gp5 D7 Dx D7 Dp5 A7 A5:4 | D7 G6+e5 . D7 G7+e7 . D7 G9+e9 . D7 G7+e7 . D7:4 | e5 Bx B8 e5 Bx B8 e5 Bx B8b10:4 B8b10r8 B5 G7 .')],
    C35:[P(3,`${cA}:3 .:9 | ${l1}`),
         P(3,`${cA}:3 .:3 A5:2 Ah7 E8 E5:2 | ${cA}:3 .:3 G7b9:3 G7b9r7 G5 D7`),
         P(3,`${cA}:2 ${cA} .:3 A5:2 Ah7 E8 E5:2 | ${cD}:2 ${cD} .:3 B8b10:3 B8b10r8 B5 G7 | ${cA}:3 .:9`),
         P(3,`${cA}:3 .:3 A5:2 Ah7 E8 E5:2 | ${cD}:3 .:3 B8b10:3 B8b10r8 B5 G7 | ${cA}:3 .:3 G7b9:3 G7b9r7 G5 D7 | ${cE}:3 .:3 A7 D6 D9 G7:3`),
         P(3,`${cA}:3 A5:2 Ah7 A5:2 E8 E5 Eh8 Ep5 | ${cD}:3 B8b10:3 B8b10r8:2 B5 G7 Gp5 D7 | ${cA}:3 G7b9:3 G7b9r7 G5 D7 D5 Dh7 A7 | ${cE}:3 A7 D6 D9 G7 D9 D6 A7:3`)]
  });
  // этюды: 4 фрагмента = уровни четырёх упражнений; каждый фрагмент — одна система со своим делением
  const ET=[['L31','L24','A18','A21'],['A23','L26','L27','A21'],['A19','A39','L40','A21']];
  const etude=(e,k)=>[0,1,2,3,4].map(j=>({t:ET[e].map(id=>sh(`/${L[id][j].sub} ${L[id][j].t}`,k))}));
  // ---------- второй материал (вариант меняет не только тональность) ----------
  // mv: та же высота на соседней струне (d=-1 — ниже, +1 — выше): другая аппликатура и регистр струн
  const SO='EADGBe',SI=[5,5,5,4,5];
  const mv=(t,d)=>t.split(' ').map(tok=>tok.split('+').map(p=>{
    const m=p.match(/^([EADGBe])([hpt]?)(\d+|x)(.*)$/);if(!m)return p;
    const i=SO.indexOf(m[1]),j=i+d;if(j<0||j>5)throw Error('mv '+p);
    const k=d<0?SI[j]:-SI[i],f=x=>{const r=+x+k;if(r<0)throw Error('mv '+p);return r;};
    return SO[j]+m[2]+(m[3]==='x'?'x':f(m[3]))+m[4].replace(/([br])(\d+)/g,(a,c,n)=>c+f(n));
  }).join('+')).join(' ');
  const shuf2=x=>P(2,x.t.replace(/:2 /g,' ')); // шаффл «долгая-короткая» → прямые восьмые
  const mk17=(I,IV,V)=>[P(3,`.:3 ${I}:2 . .:3 ${I}:2 .`),P(3,sh4(I)),P(3,sh4(I,'m')+' | '+sh4(IV,'m')),
    P(3,[I,IV,I,V].map(c=>`${c}:2 ${X9} ${c}:2 ${X9} .:3 ${c}:2 ${X9}`).join(' | ')),
    P(3,[I,IV,I,V].map(c=>`${sh(c,-1)} ${c}:2 ${X9} ${c}:2 .:3 ${c}:2 ${X9}`).join(' | '))];
  const mk35=(A,D,E,p)=>[P(3,`${A}:3 .:9 | ${p[0]}`),P(3,`${A}:3 .:3 ${p[1]} | ${A}:3 .:3 ${p[2]}`),
    P(3,`${A}:2 ${A} .:3 ${p[1]} | ${D}:2 ${D} .:3 ${p[3]} | ${A}:3 .:9`),
    P(3,`${A}:3 .:3 ${p[1]} | ${D}:3 .:3 ${p[3]} | ${A}:3 .:3 ${p[2]} | ${E}:3 .:3 ${p[4]}`),
    P(3,`${A}:3 ${p[5]} | ${D}:3 ${p[6]} | ${A}:3 ${p[7]} | ${E}:3 ${p[8]}`)];
  // фразы связки C32 для второго материала: девятые аккорды и фразы
  const R9=c=>`${c}:2 ${X9} ${c}:2 ${X9} .:3 ${c}:2 ${X9}`,q1='B5 e5:2 B8b10:3 B8b10r8 B5 G7:3 .',q2='G7b9:3 G7b9r7 G5 D7 D5:2 A7 A5:3',q3='e8 e5 B8 B5 G7 G5 D7:2 D5 A7:3';
  const z1='.:3 E5 E8 A5 A7:2 A5 E8 E5:2',z2='.:3 G7b9:3 G7b9r7 G5 D7:2 D5:2',z3='.:3 A5 A7 D5 D7:2 D5 A7 A5:2',z4='.:3 B8b10:3 B8b10r8 B5 G7:2 G5:2';
  const vb=s=>s.replace(/(\S+):2$/,'$1~:2');
  const M={
    // A16: септаккорд от 5-й струны (в {D})
    A16:[P(2,'A5 D4 D7 G5 D7 D4 A5 .'),P(2,'A5 D4 D7 G5 G7 B7 G7 G5 | D7 D4 A5 D4 D7 G5 G7 .'),
         P(2,'A5 D4 D7 G5 G7 B7 e5 e8 | e5 B7 G7 G5 D7 D4 A5 .'),P(2,'A5 D4 D7 G5 G7 G5 D7 D4 | D5 G4 G7 B6 B8 B6 G7 G4'),
         P(3,'A5 D4 D7 G5 G7 B7 G7 G5 D7 D4 A5 . | D5 G4 G7 B6 B8 e7 B8 B6 G7 G4 D5 . | D7 G6 G9 B8 B10 e9 B10 B8 G9 G6 D7 . | A5 D4 D7 G5 A5:2 .:6')],
    // A17: I9 от 5-й струны, IV9 и V9 от 6-й (в {E})
    A17:mk17('A7+D6+G7+B7','E5+A4+D5+G4','E7+A6+D7+G6'),
    // A19: миксолидийский от 5-й струны (в {D})
    A19:[P(2,'A5 A7 D4 D5 D7 G4 G5 G7 | G7 G5 G4 D7 D5 D4 A7 A5'),
         P(2,'A5 A7 D4 D5 D7 G4 G5 G7 | B5 B7 B8 e5 e7 e8 .:2 | e8 e7 e5 B8 B7 B5 G7 G5 | G4 D7 D5 D4 A7 A5:3'),
         P(2,'A5 D4 A7 D5 D4 D7 D5 G4 | D7 G5 G4 G7 G5 B5 G7 B7'),
         P(3,'A5 A7 D4 A7 D4 D5 D4 D5 D7 D5 D7 G4 | G4 G5 G7 G5 G7 B5 G7 B5 B7 B5 B7 B8 | B7 B8 e5 B8 e5 e7 e5 e7 e8 e7 e5:2'),
         P(3,'B6 Bh7 e5 B8 B7 G7 G5 G4 D7 D5 D4 A5 | D3 Dh4 D7 G5 G4 G7 B6 Bh7 e5 B7 G7:2')],
    // A20: мажорная пентатоника от 5-й струны (в {D})
    A20:[P(2,'A5 A7 D4 D7 G4 G7 B5 B7 | B7 B5 G7 G4 D7 D4 A7 A5'),P(2,'A5 A7 D4 D7 G4 G7 B5 B7 | e5 e7 e5 B7 B5 G7 G4 D7'),
         P(3,'A5 A7 D4 A7 D4 D7 D4 D7 G4 D7 G4 G7 | G4 G7 B5 G7 B5 B7 B5 B7 e5 B7 e5 e7'),
         P(3,'D3 Dh4 D7 G4:2 D7 B6 Bh7 e5 e7:2 . | B6b7 B5 G7:2 G4 D7:2 D5 D4 A5:3'),
         P(3,'D3 Dh4 D7 G4:2 D7 B6 Bh7 e5 e7:2 . | B6b7 B5 G7:2 G4 D7:2 D5 D4 A5:3 | B6b7r6 B5 G7 G4:2 D7 D3 Dh4 A7 A5:3')],
    // A21: восходящий внутренний голос, встречное движение в обратную сторону (в {A})
    A21:[P(3,'G5+e5:3 G6+e5:3 G7+e5:3 G8+e5:3 | A7+D6+G7+B5:6 .:6'),
         P(3,'e5 B5 G5 e5 B5 G6 e5 B5 G7 e5 B5 G8 | A7+D6+G7+B5:6 .:6'),
         P(3,'e5 B5 G5 e5 B5 G6 e5 B5 G7 e5 B5 G8 | A7 D6 D9 G7 D9 D6 A7:6'),
         P(3,'e5 B5 G5 e5 B5 G6 e5 B5 G7 e5 B5 G8 | E8+D4:3 E7+D5:3 E6+D6:3 E5+D7:3 | A7 D6 D9 G7 D9 D6 A7:6'),
         P(3,'B8b10:2 e5 B8b10r8 e5 G7 G5 Gh6 D7 E5:3 | e5 B5 G5 e5 B5 G6 e5 B5 G7 e5 B5 G8 | E8+D4:3 E7+D5:3 E6+D6:3 E5+D7:3 | A7 D6 D9 G7 D9 D6 A7:6')],
    // A23: блюзовая гамма от 5-й струны (в {D})
    A23:[P(2,'A5 A8 D5 D6 D7 G5 G7 . | G7 G5 D7 D6 D5 A8 A5 .'),
         P(2,'A5 A8 D5 D6 D7 G5 G7 B6 | B8 B9 e5 e8 e5 B9 B8 B6 | G7 G5 D7 D6 D5 A8 A5 . | A5:8'),
         P(3,'D5 D6 D7 D6 D5 A8 A5:3 .:3 | B6 B8 B9 B8 B6 G7 G5:3 .:3'),
         P(3,'e5 e8 B8b9:2 B8 B6 G7:2 G5 D7:3 | D5 D6 D7 D6 D5 A8 A5:3 .:3'),
         P(3,'e5 e8 B8b9:2 B8 B6 G7:2 G5 D7:3 | D5 D6 D7 D6 D5 A8 A5:3 .:3 | A8 A10 A11 D7 D10 G7 G10 B8 B9 B10 e8 e10 | e8:3 B10 B9 B8 G10 G7 D10 D7:3')],
    // A39: фразы после паузы в долю, другие вопросы и ответы (в {A})
    A39:[P(3,`${z1} | ${z2}`),P(3,`${z1} | ${z2} | ${z3} | ${z4}`),P(3,[z1,z2,z3,z4].map(vb).join(' | ')),
         P(3,`${vb(z1)} | .:3 B15b17:3 B15b17r15 B13 G14:2 G12~:2 | ${vb(z3)} | ${vb(z4)}`),
         P(3,`${vb(z1)} | .:3 B15b17:3 B15b17r15 B13 G14:2 G12~:2 | .:3 G5+B5:2 Gh7+B8 G7+B8:2 G5 D7~:3 | .:3 B8b10+e8:3 B8b10r8+e8 B5 G7 D7~:3`)],
    // L24: бенды во 2-й позиции минорной пентатоники (в {A})
    L24:[P(2,'e12:2 e10b12:2 e12:2 e10b12r10:2'),P(2,'e12:2 e10b12:2 e12:2 e10b12r10:2 | D12:2 D10b12:2 D12:2 D10b12r10:2'),
         P(3,'e10b12:3 e10b12r10:2 e8 B10:2 B8 G9:3 | D10b12:3 D10b12r10:2 D7 A10:2 A7 E10:3'),
         P(3,'G12b14+B10:3 G12b14r12+B10:3 B10b12+e7:3 B10b12r10+e7:3 | e10b12:3 e10b12r10 e8 B10 D10b12:3 D7:3'),
         P(3,'e10b12~:6 e10b12r10 e8 B10 B10b12~:3 | D10b12~:3 D10b12r10:3 D7 A10 A7 E10~:3')],
    // L25: бенды во 2-й позиции, полтона из малой терции (в {A})
    L25:[P(2,'e9:2 e8b9:2 e9:2 e8b9r8:2'),P(2,'e9:2 e8b9:2 e8b9r8:2 e10:2 | D11:2 D10b11:2 D10b11r10:2 D7:2'),
         P(3,'G9b12:3 G9b12r9:2 G7 D10b11:3 D10b11r10 D7 A10 | e8b9:3 e8b9r8 B10 B8 G9:2 G7 D10:3'),
         P(3,'e8b9:2 e8b10 e8b11:2 e10 G9b12:3 B10:3 | e10b12:2 e10b12r10 e8b10:2 e8b9 e8 B10 B8 G9b12~:3'),
         P(3,'e8b9:2 e8b10 e8b11:2 e10 G9b12:3 B10:3 | e10b12:2 e10b12r10 e8b10:2 e8b9 e8 B10 B8 G9b12~:3 | '+sh('e10b12:2 e10b12r10 e8b10:2 e8b9 e8 B10 B8 G9b12~:3',12))],
    // L27: легато во 2-й позиции минорной пентатоники (в {A})
    L27:[P(3,'A7 Ah10 . D7 Dh10 . G7 Gh9 . B8 Bh10 .'),
         P(3,'E8 Eh10 A7 Ah10 D7 Dh10 G7 Gh9 B8 Bh10 e8 eh10 | e10 ep8 B10 Bp8 G9 Gp7 D10 Dp7 A10 Ap7 E10 Ep8'),
         P(3,'e8 eh10 ep8 B8 Bh10 Bp8 G7 Gh9 Gp7 D7 Dh10 Dp7 | A7 Ah10 Ap7 E8 Eh10 Ep8 A7:3 .:3'),
         P(3,'D7 Dh10 G7 Gh8 Gh9 Gp8 Gp7 D10 B8 Bh10 Bp8 G9 | e8 eh10 ep8 B10 Bp8 G9 Gp8 Gp7 D10 Dp7 A10 A7'),
         P(4,'e10 ep8 B10 Bp8 G9 Gp7 D10 Dp7 A10 Ap7 E10 Ep8 E8 Eh10 A7 Ah10 | D7 Dh10 G7 Gh9 B8 Bh10 e8 eh10 eh12 ep10 ep8 B10 Bp8 G9:3')],
    // L30: хроматика во 2-й позиции (в {A})
    L30:[P(3,'A8 A9 A10:2 . . G7 G8 G9:2 . .'),
         P(3,'D7 D8 D9 D10 G7 G8 G9 B8 B9 B10 e8 . | e8 B10 B9 B8 G9 G8 G7 D10 D9 D8 D7 .'),
         P(3,'E8 E9 E10 A7 A8 A9 A10 D7 D8 D9:3 | G7 G8 G9 G10 G9 G7 D10 D9 D8 D7:3'),
         P(3,'B8 G9 G8 G7 D10 D9 D8 D7 A10 A9 A8 A7 | E10 E9 E8:4 .:6'),
         P(3,'E8 E9 E10 A7 A8 A9 A10 D7 D8 D9:3 | G7 G8 G9 G10 G9 G7 D10 D9 D8 D7:3 | B8 G9 G8 G7 D10 D9 D8 D7 A10 A9 A8 A7 | E10 E9 E8:4 .:6')],
    // L40: мелодия октавами вниз (в {A})
    L40:[P(2,'A7+G9:2 A5+G7:2 E8+D10:2 E5+D7:2'),
         P(2,'A7+G9 A7+G9 A5+G7 A5+G7 E8+D10 E8+D10 E5+D7 E5+D7 | E8+D10 . A5+G7 . A7+G9:4'),
         P(2,'A7+G9:2 A5+G7:2 E8+D10:2 E5+D7:2 | G9+e12 G7+e10 D10+B13 D7+B10 D10+B13 G7+e10 G9+e12:2'),
         P(3,'A7+G9:2 A7+G9 A5+G7:2 A5+G7 E8+D10:2 E5+D7 E8+D10 A5+G7:2 | A7+G9:6 .:6'),
         P(3,'A7+G9:2 A7+G9 A5+G7:2 A5+G7 E8+D10:2 E5+D7 E8+D10 A5+G7:2 | G9+e12:2 G9+e12 G7+e10:2 D10+B13 G7+e10 D10+B13:2 D7+B10:3')],
    // C32: девятые аккорды и фразы (в {A})
    C32:[P(3,`${R9(a9)} | ${q1}`),P(3,`${R9(a9)} | ${q2}`),P(3,`${R9(a9)} | ${R9(a9)} | ${q2} | ${q3}`),P(3,`${R9(a9)} | ${q2} | ${R9(d9)} | ${q3}`),P(3,`${R9(a9)} | ${q1} | ${R9(d9)} | ${q3} | ${R9(a9)} | ${q2}`)],
    // C33: бенд, легато, вибрато во 2-й позиции (в {A})
    C33:[P(3,'e10b12:3 e10b12r10:2 e8 B10 Bp8 G9 G7:3'),
         P(3,'e10b12:3 e10b12r10:2 e8 B10 Bp8 G9 G7:3 | D7 Dh10 Dp7 A10 Ap7 . E10~:6'),
         P(3,'B10b12+e7:3 B10b12r10 Bp8 G9 G7 Gh9 Gp7 D10~:3 | D7 Dh10 Dp7 A10 Ap7 . E10~:6'),
         P(4,'e10 ep8 B10 Bp8 G9 Gp7 D10 Dp7 A10 Ap7 E10 Ep8 E10:4 | e10b12:8 e10b12r10:2 e8:2 B10~:4'),
         P(3,'B10b12+e7:3 B10b12r10 Bp8 G9 G7 Gh9 Gp7 D10~:3 | /4 e10 ep8 B10 Bp8 G9 Gp7 D10 Dp7 A10 Ap7 E10 Ep8 E10:4 | e10b12:8 e10b12r10:2 e8:2 B10~:4')],
    // C35: удары девятыми аккордами, фразы во 2-й позиции (в {A})
    C35:mk35('E5+A4+D5+G4','A5+D4+G5+B5','A7+D6+G7+B7',['e10b12:3 e10b12r10:2 e8 B10:3 B8:3','e8:2 eh10 B10 B8:2','D10b12:3 D10b12r10 D7 A10','B10b12:3 B10b12r10 B8 G9','G9 B9 e7 e10:3',
      'e8:2 eh10 e8:2 B10 B8 Bh10 Bp8','B10b12:3 B10b12r10:2 B8 G9 Gp7 D10','D10b12:3 D10b12r10 D7 A10 A7 Ah10 E10','G9 B9 e7 e10 e7 B9 G9:3'])
  };
  // те же фразы на соседних струнах или в другом ритме
  ['A18','A22','L26','L28','L29','C34'].forEach(id=>M[id]=L[id].map(x=>P(x.sub,mv(x.t,-1))));
  M.L31=L.L31.map(shuf2);
  // варианты: [материал 0|1, сдвиг от тональности шаблона, тональность]; подписи материалов
  const R6=['Форма от 6-й струны','Root on the 6th string'],R5=['Форма от 5-й струны','Root on the 5th string'];
  const TOP=['На верхних струнах','On the top strings'],MID=['На средних струнах','On the middle strings'];
  const PS1=['Позиция 1','Position 1'],PS2=['Позиция 2','Position 2'];
  const VS={
    A16:[R6,R5,[[0,0,'A'],[1,0,'D'],[0,-2,'G'],[1,-2,'C'],[0,3,'C'],[1,5,'G']]],
    A17:[R6,['I9 от 5-й струны','I9 rooted on the 5th string'],[[0,0,'A'],[1,0,'E'],[0,3,'C'],[1,-2,'D'],[0,-2,'G'],[1,3,'G']]],
    A18:[TOP,MID,[[0,3,'C'],[1,0,'A'],[0,5,'D'],[1,-2,'G'],[0,2,'B'],[1,-3,'F#']]],
    A19:[R6,R5,[[0,0,'A'],[1,0,'D'],[0,-2,'G'],[1,-2,'C'],[0,3,'C'],[1,2,'E']]],
    A20:[R6,R5,[[0,0,'A'],[1,0,'D'],[0,-2,'G'],[1,-2,'C'],[0,3,'C'],[1,2,'E']]],
    A21:[['Голос идёт вниз','Inner voice descending'],['Голос идёт вверх','Inner voice ascending'],[[0,0,'A'],[1,7,'E'],[0,3,'C'],[1,5,'D'],[0,-2,'G'],[1,2,'B']]],
    A22:[['Четыре верхние струны','Top four strings'],['Четыре средние струны','Middle four strings'],[[0,0,'A'],[1,-3,'F#'],[0,2,'B'],[1,-5,'E'],[0,-1,'G#'],[1,-4,'F']]],
    A23:[R6,R5,[[0,0,'A'],[1,0,'D'],[0,-2,'G'],[1,2,'E'],[0,3,'C'],[1,-2,'C']]],
    A39:[['Фразы с сильной доли','Phrases on the downbeat'],['Фразы после паузы в долю','Phrases after a one-beat rest'],[[0,0,'A'],[1,-1,'G#'],[0,-2,'G'],[1,-4,'F'],[0,-3,'F#'],[1,-5,'E']]],
    L24:[PS1,PS2,[[0,0,'A'],[1,-2,'G'],[0,5,'D'],[1,-5,'E'],[0,3,'C'],[1,-3,'F#']]],
    L25:[PS1,PS2,[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-7,'D'],[0,-3,'F#'],[1,-6,'D#']]],
    L26:[TOP,MID,[[0,3,'C'],[1,0,'A'],[0,5,'D'],[1,-2,'G'],[0,7,'E'],[1,-3,'F#']]],
    L27:[PS1,PS2,[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-3,'F#'],[0,3,'C'],[1,-7,'D']]],
    L28:[TOP,MID,[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-7,'D'],[0,-3,'F#'],[1,-6,'D#']]],
    L29:[TOP,MID,[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-7,'D'],[0,-3,'F#'],[1,-4,'F']]],
    L30:[PS1,PS2,[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-7,'D'],[0,3,'C'],[1,-4,'F']]],
    L31:[['Шаффл','Shuffle'],['Прямые восьмые','Straight eighths'],[[0,0,'A'],[1,-3,'F#'],[0,-2,'G'],[1,2,'B'],[0,3,'C'],[1,4,'C#']]],
    L40:[['Мелодия вверх','Melody going up'],['Мелодия вниз','Melody going down'],[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-4,'F'],[0,3,'C'],[1,-3,'F#']]],
    C32:[['Бугги-рифф и фразы','Boogie riff and phrases'],['Девятые аккорды и фразы','Ninth chords and phrases'],[[0,0,'A'],[1,7,'E'],[0,-2,'G'],[1,5,'D'],[0,3,'C'],[1,2,'B']]],
    C33:[PS1,PS2,[[0,0,'A'],[1,-5,'E'],[0,-2,'G'],[1,-3,'F#'],[0,3,'C'],[1,-2,'G']]],
    C34:[TOP,MID,[[0,3,'C'],[1,0,'A'],[0,5,'D'],[1,-2,'G'],[0,2,'B'],[1,-5,'E']]],
    C35:[['Септаккорды, фразы в позиции 1','Seventh chords, phrases in position 1'],['Девятые аккорды, фразы в позиции 2','Ninth chords, phrases in position 2'],[[0,3,'C'],[1,0,'A'],[0,-2,'G'],[1,2,'B'],[0,5,'D'],[1,-3,'F#']]]
  };
  // ---------- тексты ----------
  const KEY=['Тональность ','Key of '];
  const T={
    A16:[{name:'Септаккорд: арпеджио',goal:'Слышать доминантсептаккорд — основу блюза — нота за нотой.',how:'Тоника, терция, квинта, малая септима по очереди, без звона соседних нот. Дальше — вторая октава, смена I7 → IV7 и весь квадрат I7–IV7–V7.',tip:'Пой ноту перед тем, как сыграть: септима — это и есть «блюзовый» цвет аккорда.',lvl:['Четыре ноты аккорда восьмыми','Октава вверх и вниз','Две октавы','Смена I7 → IV7','Квадрат I7–IV7–V7 триолями']},
          {name:'Dominant 7th arpeggio',goal:'Hear the dominant 7th, the core of the blues, note by note.',how:'Root, third, fifth and flat seventh one at a time, with no neighbouring strings ringing. Then the second octave, the I7 → IV7 change and the whole I7–IV7–V7 progression.',tip:'Sing each note before you play it: the seventh is the bluesy colour of the chord.',lvl:['Four chord tones in eighths','An octave up and down','Two octaves','I7 → IV7 change','I7–IV7–V7 in triplets']}],
    A17:[{name:'Девятые аккорды: шаффл-аккомпанемент',goal:'Ритм-гитара в духе T-Bone и Freddie King: девятые аккорды на шаффле.',how:'Четырёхзвучные девятые аккорды. Сначала удары на 2 и 4, потом ровный шаффл «долгая-короткая», мёртвые удары между аккордами и подъезд на полтона снизу.',tip:'Левая рука ослабляет хват сразу после удара — так получаются и короткие аккорды, и мёртвые удары.',lvl:['Удары на 2 и 4','Шаффл на одном аккорде','Смена I9 → IV9, приглушение','Квадрат I–IV–I–V, мёртвые удары','Подъезд на полтона снизу']},
          {name:'Ninth chords: shuffle comping',goal:'Rhythm guitar in the style of T-Bone Walker and Freddie King: ninth chords over a shuffle.',how:'Four-note ninth chords. First hits on 2 and 4, then an even long-short shuffle, dead strums between chords and a half-step approach from below.',tip:'Release the left-hand pressure right after each hit: that gives you both short chords and dead strums.',lvl:['Hits on 2 and 4','Shuffle on one chord','I9 → IV9, palm muted','I–IV–I–V with dead strums','Half-step approach from below']}],
    A18:[{name:'Двойные ноты: сексты и терции',goal:'Мелодия двумя нотами сразу, как у Chuck Berry и в соуле.',how:'Сексты через струну и терции на соседних струнах идут по миксолидийскому ладу. Глуши среднюю струну пальцем, который играет нижнюю ноту. На старших уровнях — хаммер в сексту и двойной бенд.',tip:'Обе ноты должны звучать одинаково громко. Если одна тише — проверь угол медиатора или пальцев.',lvl:['Четыре сексты','Сексты вверх и вниз по ладу','Хаммер в сексту, шаффл','Терции, потом сексты','Двойные ноты с бендом']},
          {name:'Double stops: sixths and thirds',goal:'A melody in two notes at once, like Chuck Berry and soul guitar.',how:'Sixths across a skipped string and thirds on adjacent strings follow the Mixolydian mode. Mute the middle string with the finger that plays the lower note. Higher levels add a hammer-on into the sixth and a double-stop bend.',tip:'Both notes should be equally loud. If one is quieter, check the angle of your pick or fingers.',lvl:['Four sixths','Sixths up and down the mode','Hammer into the sixth, shuffle','Thirds, then sixths','Double stops with a bend']}],
    A19:[{name:'Миксолидийский лад',goal:'Звукоряд доминантсептаккорда: мажор с малой септимой.',how:'Лад в одной позиции: октава, две октавы, терции, группы по три. На последнем уровне малая терция уходит хаммером в большую — главный приём смешения мажора и минора.',tip:'Играя, держи в ушах аккорд I7: каждая нота должна «садиться» на него.',lvl:['Одна октава','Две октавы','Терции','Группы по три триолями','Фраза: малая терция → большая']},
          {name:'Mixolydian mode',goal:'The scale of the dominant 7th: major with a flat seventh.',how:'The mode in one position: one octave, two octaves, thirds, groups of three. The last level hammers the minor third into the major third, the key move for mixing major and minor.',tip:'Keep the I7 chord in your ears while you play: every note should sit on it.',lvl:['One octave','Two octaves','Thirds','Groups of three in triplets','Phrase: minor third → major third']}],
    A20:[{name:'Мажорная пентатоника и смесь',goal:'Светлый блюз в духе B.B. King и кантри-блюза.',how:'Мажорная пентатоника в позиции, затем группы по три. Дальше фразы, где малая терция поднимается в большую, а бенд на полтона ведёт в терцию аккорда.',tip:'Мажорная пентатоника звучит хорошо на I7, а на IV7 вернись к минорной.',lvl:['Октава вверх и вниз','Позиция целиком','Группы по три','Смешение мажора и минора','Длинная фраза с бендом на полтона']},
          {name:'Major pentatonic and the mix',goal:'Bright blues in the style of B.B. King and country blues.',how:'The major pentatonic in one position, then groups of three. Then phrases where the minor third rises into the major third and a half-step bend leads into the chord’s third.',tip:'Major pentatonic sounds good over I7; over IV7 go back to the minor one.',lvl:['An octave up and down','The whole position','Groups of three','Mixing major and minor','Long phrase with a half-step bend']}],
    A21:[{name:'Тёрнэраунды',goal:'Последние два такта квадрата, которые возвращают к началу.',how:'Хроматический спуск под высокой тоникой, затем аккорд или арпеджио V7. На старших уровнях — встречное движение двух голосов и бенд перед спуском.',tip:'Тёрнэраунд — это сигнал группе. Играй его уверенно и ровно, даже на медленном темпе.',lvl:['Спуск двойными нотами','Спуск триолями с тоникой','Арпеджио V7 в конце','Встречное движение голосов','Бенд, спуск, встречное движение, V7']},
          {name:'Turnarounds',goal:'The last two bars of the progression that lead back to the top.',how:'A chromatic descent under the high root, then a V7 chord or arpeggio. Higher levels add two voices in contrary motion and a bend before the descent.',tip:'A turnaround is a signal to the band. Play it with confidence and even timing, even at a slow tempo.',lvl:['Descent in double stops','Triplet descent with the root','V7 arpeggio at the end','Voices in contrary motion','Bend, descent, contrary motion, V7']}],
    A22:[{name:'Септаккорды по грифу',goal:'Один аккорд I7 в четырёх местах грифа и ближние IV7 и V7.',how:'Четыре формы септаккорда на четырёх верхних струнах. Переходи между ними без паузы, потом ищи ближайшие IV7 и V7 и играй квадрат шаффлом.',tip:'Смотри на тот палец, который остаётся на месте или сдвигается меньше всего, — он ведёт руку.',lvl:['Две формы','Четыре формы вверх и вниз','I7 → IV7 и I7 → V7 рядом','Квадрат шаффлом','Смена форм внутри такта']},
          {name:'Seventh chords up the neck',goal:'One I7 chord in four places on the neck, and the nearest IV7 and V7.',how:'Four seventh-chord shapes on the top four strings. Move between them without a gap, then find the nearest IV7 and V7 and play the progression as a shuffle.',tip:'Watch the finger that stays put or moves the least: it guides the hand.',lvl:['Two shapes','Four shapes up and down','I7 → IV7 and I7 → V7 nearby','The progression as a shuffle','Changing shapes within the bar']}],
    A23:[{name:'Блюзовая гамма',goal:'Минорная пентатоника с блюзовой нотой — пониженной квинтой.',how:'Гамма в первой позиции: нижняя октава, обе октавы, триольные фразы. Блюзовая нота — проходящая: не останавливайся на ней. На старших уровнях — бенд в блюзовую ноту и вторая позиция.',tip:'Блюзовая нота звучит, когда разрешается на соседнюю. Задержишься — будет фальшь.',lvl:['Нижняя октава','Две октавы','Триольные фразы','Бенд в блюзовую ноту','Две позиции']},
          {name:'Blues scale',goal:'The minor pentatonic with the blue note, the flat fifth.',how:'The scale in the first position: the lower octave, both octaves, triplet phrases. The blue note is a passing note: do not stop on it. Higher levels add a bend into the blue note and the second position.',tip:'The blue note works when it resolves to its neighbour. Linger on it and it sounds wrong.',lvl:['Lower octave','Two octaves','Triplet phrases','Bend into the blue note','Two positions']}],
    A38:[{name:'Пять позиций пентатоники',goal:'Минорная пентатоника по всему грифу.',how:'Вариант — позиция. Сначала половина позиции, потом целиком вверх и вниз, группы по три и по четыре, затем через ноту (терции пентатоники).',tip:'Запоминай, где в позиции тоника: на неё опирается любая фраза.',lvl:['Нижняя половина позиции','Вся позиция вверх и вниз','Группы по три','Группы по четыре','Через ноту']},
          {name:'Five pentatonic positions',goal:'The minor pentatonic across the whole neck.',how:'The variant is the position. First half of it, then the whole thing up and down, groups of three and of four, then skipping a note (pentatonic thirds).',tip:'Remember where the root is in each position: every phrase leans on it.',lvl:['Lower half of the position','The whole position up and down','Groups of three','Groups of four','Skipping a note']}],
    A39:[{name:'Вызов и ответ',goal:'Строить соло как разговор: фраза — ответ.',how:'Низкая фраза задаёт вопрос, высокая с бендом отвечает. На старших уровнях ответ уходит на октаву выше, появляются двойные ноты и бенд двух струн.',tip:'Оставляй паузы. Ответ без паузы перед ним — это не ответ, а продолжение.',lvl:['Одна пара','Две пары','Вибрато на концах фраз','Ответ октавой выше','Пары с двойными нотами']},
          {name:'Call and response',goal:'Build a solo like a conversation: a phrase and its answer.',how:'A low phrase asks, a high phrase with a bend answers. Higher levels move the answer an octave up and add double stops and a two-string bend.',tip:'Leave space. An answer with no gap before it is not an answer, just more of the same.',lvl:['One pair','Two pairs','Vibrato at phrase ends','Answer an octave up','Pairs with double stops']}],
    L24:[{name:'Бенд на тон',goal:'Попадать бендом точно в ноту.',how:'Сначала сыграй целевую ноту двумя ладами выше, потом подтяни к ней бенд. Тяни тремя пальцами, кисть поворачивается. Дальше — бенды в фразах и унисонные бенды.',tip:'Сверяй высоту с эталоном. Недотянутый бенд — самая частая фальшь в блюзе.',lvl:['Эталон и бенд','Бенды на двух струнах','Бенды в фразе','Унисонный бенд','Бенд с вибрато наверху']},
          {name:'Whole-step bend',goal:'Bend exactly to the target note.',how:'Play the target note two frets higher first, then bend up to match it. Push with three fingers while the wrist turns. Then bends inside phrases and unison bends.',tip:'Check the pitch against the reference. An under-bent note is the most common bad note in blues.',lvl:['Reference and bend','Bends on two strings','Bends in a phrase','Unison bend','Bend with vibrato at the top']}],
    L25:[{name:'Бенды на полтона и полтора тона',goal:'Управлять шириной бенда.',how:'Полтона — из малой терции в большую или в блюзовую ноту. Полтора тона — с квинты на септиму. На старших уровнях ширина меняется в одной фразе.',tip:'Полтона легко перетянуть. Сравни с эталоном ладом выше, прежде чем играть фразу.',lvl:['Полтона с эталоном','Полтона на двух струнах','Полтора тона в фразе','Разная ширина подряд','Октавой выше']},
          {name:'Half-step and step-and-a-half bends',goal:'Control how far you bend.',how:'A half step goes from the minor third to the major third or to the blue note. A step and a half goes from the fifth to the seventh. Higher levels change the width inside one phrase.',tip:'A half step is easy to overshoot. Compare it with the reference one fret up before playing the phrase.',lvl:['Half step with a reference','Half steps on two strings','Step and a half in a phrase','Different widths in a row','An octave higher']}],
    L26:[{name:'Вибрато',goal:'Ровное, певучее вибрато каждым пальцем.',how:'Вибрато на длинных нотах: указательный, средний, безымянный, мизинец. Потом вибрато на вершине бенда и в конце фраз.',tip:'Движение идёт из кисти, а не из пальца. Держи одну ширину и одну скорость, как метроном.',lvl:['Длинные ноты','Вибрато на вершине бенда','Каждым пальцем','В конце фраз','Длинная фраза']},
          {name:'Vibrato',goal:'Even, singing vibrato with every finger.',how:'Vibrato on long notes with the index, middle, ring finger and pinky. Then vibrato at the top of a bend and at phrase ends.',tip:'The motion comes from the wrist, not the finger. Keep one width and one speed, like a metronome.',lvl:['Long notes','Vibrato at the top of a bend','With each finger','At phrase ends','A long phrase']}],
    L27:[{name:'Легато в пентатонике',goal:'Хаммеры и пулл-оффы в духе Stevie Ray Vaughan.',how:'Пары нот на струне хаммером вверх и пулл-оффом вниз, потом тройки «хаммер-пулл», блюзовая нота хаммером. На последнем уровне — шестнадцатые через всю позицию.',tip:'Пулл-офф — это щипок пальцем вниз, а не просто снятие пальца. Иначе нота пропадает.',lvl:['Хаммеры на четырёх струнах','Вверх хаммерами, вниз пулл-оффами','Тройки хаммер-пулл','Блюзовая нота хаммером','Шестнадцатые через позицию']},
          {name:'Pentatonic legato',goal:'Hammer-ons and pull-offs in the style of Stevie Ray Vaughan.',how:'Pairs of notes on one string, hammer up and pull down, then hammer-pull triplets and the blue note by hammer-on. The last level is sixteenths through the whole position.',tip:'A pull-off is a downward pluck with the finger, not just lifting it. Otherwise the note dies.',lvl:['Hammer-ons on four strings','Up by hammer, down by pull-off','Hammer-pull triplets','Blue note by hammer-on','Sixteenths through the position']}],
    L28:[{name:'Переходы между позициями',goal:'Двигаться по грифу, а не сидеть в одной коробке.',how:'Пентатоника на двух-трёх верхних струнах из позиции в позицию. Переход — хаммером или сменой пальца. На последнем уровне — по двум струнам от первой позиции до пятой и обратно.',tip:'Смещай руку на ноте, сыгранной указательным: так переход незаметен на слух.',lvl:['Две позиции на двух струнах','Две позиции на четырёх струнах','Три позиции триолями','Переход хаммером','Весь гриф шестнадцатыми']},
          {name:'Moving between positions',goal:'Travel along the neck instead of staying in one box.',how:'The pentatonic on the top two or three strings, from position to position. The shift happens on a hammer-on or a finger change. The last level runs from the first position to the fifth and back on two strings.',tip:'Shift the hand on a note played with the index finger: that hides the shift from the ear.',lvl:['Two positions on two strings','Two positions on four strings','Three positions in triplets','Shift on a hammer-on','The whole neck in sixteenths']}],
    L29:[{name:'Унисонные бенды и бенды двух струн',goal:'Бенд одной струны против неподвижной соседней.',how:'Унисон: подтянутая нота догоняет соседнюю до одной высоты. Потом бенд под удержанной верхней нотой и унисон на октаву выше.',tip:'Неподвижный палец не должен сдвинуться вслед за бендом. Если струна уходит, ставь палец чуть ближе к ладу.',lvl:['Унисон с эталоном','Унисон на двух парах струн','Бенд под верхней нотой','Унисон с вибрато в фразе','Октавой выше']},
          {name:'Unison and two-string bends',goal:'Bend one string against a still neighbour.',how:'Unison: the bent note catches up with the neighbour to the same pitch. Then a bend under a held top note, and a unison an octave higher.',tip:'The still finger must not follow the bend. If its string slides, put the finger a bit closer to the fret.',lvl:['Unison with a reference','Unison on two string pairs','Bend under a top note','Unison with vibrato in a phrase','An octave higher']}],
    L30:[{name:'Хроматические проходы',goal:'Проходящие ноты между ступенями пентатоники: палец на лад.',how:'Хроматика заполняет промежутки: блюзовая нота, большая терция, секста. Каждый лад — свой палец, рука не сдвигается.',tip:'Хроматика — это движение, а не остановка. Последняя нота фразы — всегда из пентатоники.',lvl:['Короткие проходы','Хроматика на трёх струнах','Палец на лад, вверх','Спуск от септимы','Длинная фраза']},
          {name:'Chromatic passing notes',goal:'Passing notes between pentatonic degrees, one finger per fret.',how:'Chromatic notes fill the gaps: the blue note, the major third, the sixth. Each fret gets its own finger, the hand stays put.',tip:'Chromatic notes are motion, not a place to stop. The last note of a phrase is always from the pentatonic.',lvl:['Short passages','Chromatics on three strings','Finger per fret, going up','Descent from the seventh','A long phrase']}],
    L31:[{name:'Бугги: растяжка',goal:'Классический бугги-рифф: квинта, секста, септима.',how:'Две ноты на нижних струнах: квинта, секста, малая септима на растяжке мизинцем. Потом однонотная бугги-линия на I, IV и V.',tip:'Указательный не отрывается от тоники. Растяжку делай от кисти, большой палец опусти на шею грифа.',lvl:['Квинта и секста','Септима мизинцем','Приглушение, смена на IV','Однонотная линия по квадрату','Шесть тактов квадрата']},
          {name:'Boogie stretch',goal:'The classic boogie riff: fifth, sixth, seventh.',how:'Two notes on the low strings: fifth, sixth, and the flat seventh with a pinky stretch. Then a single-note boogie line on I, IV and V.',tip:'Keep the index finger on the root. Stretch from the wrist, with the thumb low on the back of the neck.',lvl:['Fifth and sixth','Seventh with the pinky','Palm muted, change to IV','Single-note line through the progression','Six bars of the progression']}],
    L40:[{name:'Октавы',goal:'Мелодия октавами с заглушенной средней струной.',how:'Две ноты через струну: нижняя — указательным, верхняя — безымянным или мизинцем. Указательный глушит струну между ними, бей по всем трём.',tip:'Если звенит средняя струна, положи указательный чуть площе.',lvl:['Четыре октавы','Повторы и паузы','Октавы на верхних струнах','Шаффл-рифф октавами','Рифф и ответ на верхних струнах']},
          {name:'Octaves',goal:'A melody in octaves with the middle string muted.',how:'Two notes with a string between them: the lower one with the index finger, the upper one with the ring finger or pinky. The index mutes the middle string; strike all three.',tip:'If the middle string rings, lay the index finger a little flatter.',lvl:['Four octaves','Repeats and rests','Octaves on the top strings','Shuffle riff in octaves','Riff and answer on the top strings']}],
    C32:[{name:'Ритм → соло',goal:'Переход из аккомпанемента в фразу и обратно без потери грува.',how:'Такт бугги-риффа, такт фразы. Потом два такта ритма и два соло, на последнем уровне — смена через такт по квадрату.',tip:'Грув держит правая рука: её движение не меняется, когда левая переходит с риффа на фразу.',lvl:['Рифф и фраза','Рифф с септимой и бенд','Два такта ритма, два соло','Рифф на IV, фраза отвечает','Шесть тактов через один']},
          {name:'Rhythm → lead',goal:'Go from comping to a phrase and back without losing the groove.',how:'A bar of boogie riff, a bar of phrase. Then two bars of rhythm and two of lead; the last level switches every bar through the progression.',tip:'The right hand holds the groove: its motion does not change when the left hand moves from riff to phrase.',lvl:['Riff and phrase','Riff with the seventh, and a bend','Two bars rhythm, two lead','Riff on IV, phrase answers','Six bars, switching every bar']}],
    C33:[{name:'Бенд → легато → вибрато',goal:'Три приёма левой руки в одной фразе.',how:'Бенд с возвратом, пулл-офф вниз по позиции, вибрато на последней ноте. На старших уровнях — унисонный бенд и спуск шестнадцатыми.',tip:'После возврата бенда струна должна встать точно на высоту лада, прежде чем начнётся легато.',lvl:['Бенд и пулл-офф','Плюс легато на нижних струнах','Начало с унисонного бенда','Спуск шестнадцатыми и бенд','Три такта целиком']},
          {name:'Bend → legato → vibrato',goal:'Three left-hand techniques in one phrase.',how:'A bend and release, pull-offs down the position, vibrato on the last note. Higher levels add a unison bend and a sixteenth-note descent.',tip:'After the release, the string must land exactly on the fret pitch before the legato starts.',lvl:['Bend and pull-off','Plus legato on the low strings','Start with a unison bend','Sixteenth descent and a bend','All three bars']}],
    C34:[{name:'Чикен-пикинг',goal:'Щелчок пальцами правой руки и мёртвые ноты в духе Albert Lee и кантри-блюза.',how:'Мёртвая нота медиатором, звучащая — средним пальцем щипком. Потом гибридный пикинг: бас медиатором, двойная нота пальцами.',tip:'Щипок пальцем идёт от грифа, струна шлёпает по ладам — так получается «куриный» щелчок.',lvl:['Мёртвая и звучащая восьмыми','Шестнадцатыми на двух струнах','Гибридный: бас и двойные ноты','Чикен-фраза с пулл-оффами','Плюс бенд из мёртвой ноты']},
          {name:'Chicken picking',goal:'A finger snap of the picking hand and dead notes, in the style of Albert Lee and country blues.',how:'The dead note with the pick, the ringing one snapped with the middle finger. Then hybrid picking: bass note with the pick, double stop with the fingers.',tip:'The finger pulls the string away from the neck and it slaps the frets: that is the chicken snap.',lvl:['Dead and ringing in eighths','Sixteenths on two strings','Hybrid: bass and double stops','Chicken phrase with pull-offs','Plus a bend out of a dead note']}],
    C35:[{name:'Стоп-тайм',goal:'Аккорд на первую долю, тишина, фраза в паузе.',how:'Группа бьёт аккорд и замолкает, ты заполняешь паузу. Сначала один удар и фраза в следующем такте, потом фраза в том же такте, на IV и V.',tip:'Тишина в стоп-тайме — часть ритма. Отсчитывай её так же точно, как ноты.',lvl:['Удар и фраза','Фраза в том же такте','Двойной удар, I и IV','Четыре такта I–IV–I–V','Фразы на три доли']},
          {name:'Stop time',goal:'A chord on beat one, silence, a phrase in the gap.',how:'The band hits a chord and stops; you fill the gap. First one hit and a phrase in the next bar, then a phrase in the same bar, on IV and V.',tip:'Silence in stop time is part of the rhythm. Count it as precisely as the notes.',lvl:['Hit and phrase','Phrase in the same bar','Double hit, I and IV','Four bars I–IV–I–V','Three-beat phrases']}],
    C36:[{name:'Блюзовый этюд',goal:'Четыре приёма подряд, как в настоящем блюзе.',how:'Четыре фрагмента подряд. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов.',lvl:['Короткие фрагменты','Фрагменты длиннее','Больше струн и приёмов','Смена гармонии внутри фрагмента','Длинные фрагменты']},
          {name:'Blues étude',goal:'Four techniques in a row, like a real blues.',how:'Four fragments in a row. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a full run on your phone. The weak spot is almost always at the joint between fragments.',lvl:['Short fragments','Longer fragments','More strings and techniques','Harmony changes within a fragment','Long fragments']}]
  };
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{
    const [ru,en]=T[id],n=+id.slice(1);
    let v,ve;
    if(id==='A38'){
      // позиции минорной пентатоники {A}; шестой вариант — первая позиция в {E}
      const POS=[['E5 E8 A5 A7 D5 D7 G5 G7 B5 B8 e5 e8',1],['E8 E10 A7 A10 D7 D10 G7 G9 B8 B10 e8 e10',2],['E10 E12 A10 A12 D10 D12 G9 G12 B10 B13 e10 e12',3],['E12 E15 A12 A15 D12 D14 G12 G14 B13 B15 e12 e15',4],['E3 E5 A3 A5 D2 D5 G2 G5 B3 B5 e3 e5',5],['E12 E15 A12 A14 D12 D14 G12 G14 B12 B15 e12 e15',1]];
      const lv=s=>{const a=s.split(' '),d=a.slice(0,11).reverse(),r=[];
        r.push({sub:2,t:[a.slice(0,8).concat(a.slice(0,7).reverse(),['.']).join(' ')]});
        r.push({sub:2,t:[a.concat(d,['.']).join(' ')]});
        const g3=[];for(let i=0;i<10;i++)g3.push(a[i],a[i+1],a[i+2]);r.push({sub:3,t:[g3.join(' ')]});
        const g4=[];for(let i=0;i<9;i++)g4.push(a[i],a[i+1],a[i+2],a[i+3]);r.push({sub:4,t:[g4.join(' ')]});
        const th=[];for(let i=0;i<9;i++)th.push(a[i],a[i+2]);r.push({sub:3,t:[th.join(' ')]});
        return r;};
      v=POS.map(([s,p],k)=>({l:`{${k<5?'A':'E'}}m, позиция ${p}`,lv:lv(s)}));
      ve=POS.map(([s,p],k)=>`{${k<5?'A':'E'}}m, position ${p}`);
    }else if(id==='C36'){
      const NM=[['шаффл, бенд, двойные ноты, тёрнэраунд','shuffle, bend, double stops, turnaround'],['блюзовая гамма, вибрато, легато, тёрнэраунд','blues scale, vibrato, legato, turnaround'],['миксолидийский, вызов-ответ, октавы, тёрнэраунд','Mixolydian, call and response, octaves, turnaround']];
      const EV=[[0,0],[1,7],[2,5],[0,-2],[1,3],[2,2]];
      v=EV.map(([e,k],i)=>({l:`Этюд ${e+1} в ${KEYS.find(x=>x[1]===k)[0]}: ${NM[e][0]}`,lv:etude(e,k)}));
      ve=EV.map(([e,k])=>`Étude ${e+1} in ${KEYS.find(x=>x[1]===k)[0]}: ${NM[e][1]}`);
    }else if(VS[id]){
      const [n0,n1,ks]=VS[id],NM=[n0,n1],SRC=[L[id],M[id]];
      v=ks.map(([m,k,nm])=>({l:`${NM[m][0]}, {${nm}}`,lv:SRC[m].map(x=>({sub:x.sub,t:[sh(x.t,k)]}))}));
      ve=ks.map(([m,k,nm])=>`${NM[m][1]}, {${nm}}`);
    }else{
      v=KEYS.map(([nm,k])=>({l:KEY[0]+nm,lv:L[id].map(x=>({sub:x.sub,t:[sh(x.t,k)]}))}));
      ve=KEYS.map(([nm])=>KEY[1]+nm);
    }
    EX[id]=Object.assign({n},ru,{sub:v[0].lv[0].sub||2,v});
    EXEN[id]=Object.assign({},en,{v:ve});
  });
  // L31: бугги-рифф под метроном с разным делением — восьмые, триоли (шаффл), шестнадцатые
  const L31C={cyc:[{sub:2,tag:['Метроном восьмыми','Metronome in 8ths']},{sub:3,tag:['Метроном триолями: шаффл','Metronome in triplets: shuffle']},{sub:4,tag:['Метроном 16-ми','Metronome in 16ths']}]};
  const COACH={L31:{v:{0:L31C,1:L31C,2:L31C,3:L31C,4:L31C,5:L31C}},C36:{stages:COACH_GUITAR.C36.stages}};
  return {EX,EXEN,COACH};
})();
/*@BLUES_GUITAR_2@*/
/*@BLUES_ACOUSTIC_1@*/
// Акустика, часть 1: фингерстайл, переменный бас (Трэвис), дельта-блюз в открытых позициях. Только 6 струн.
// Вариант = тональность (I–IV–V в открытой позиции), уровень = сложность фигуры. Табы строятся по сетке шагов.
const BLA1=(function(){
  // сетка такта: N шагов, события [позиция, токен]; совпавшие позиции сливаются в аккорд, пустые шаги продлевают ноту
  const strOf=t=>t.split('+').map(p=>p[0]);
  const merge=(a,b)=>{if(a==='.')return b;if(b==='.')return a;const s=strOf(a);const add=b.split('+').filter(p=>!s.includes(p[0]));return add.length?a+'+'+add.join('+'):a;};
  const bar=(N,ev)=>{const g=Array(N).fill(null);ev.forEach(([i,t])=>{if(t)g[i]=g[i]==null?t:merge(g[i],t);});
    // палм-мьют («m» у любой части столбца) переносится в конец токена
    const out=[];let cur=null,len=0;const fl=()=>{if(cur!=null){const c=cur!=='.'&&cur.includes('m')?cur.replace(/m/g,'')+'m':cur;out.push(len>1?c+':'+len:c);}};
    g.forEach(x=>{if(x==null){if(cur==null){cur='.';len=1;}else len++;}else{fl();cur=x;len=1;}});fl();return out.join(' ');};
  const sys=bs=>bs.join(' | ');
  const fr=t=>+t.replace(/^[A-Za-z][hp]?/,'').replace(/[^\d].*$/,'');
  const hm=t=>t[0]+'h'+t.slice(1), pl=t=>t[0]+'p'+t.slice(1);
  const bd=t=>t+'b'+(fr(t)+1), bdr=t=>t+'b'+(fr(t)+1)+'r'+fr(t);
  const NEXT={E:'A',A:'D',D:'G'}, LOW={A:'E',D:'A',G:'D'};
  // n нот хода к басу t: снизу по той же струне, с нижней струны или сверху
  const walk=(t,n)=>{const s=t[0],f=fr(t),o=[];
    if(f>=n)for(let k=n;k>=1;k--)o.push(s+(f-k));
    else if(LOW[s])for(let k=n;k>=1;k--)o.push(LOW[s]+(f+5-k));
    else for(let k=n;k>=1;k--)o.push(s+(f+k));
    return o;};
  const bg=(c,k)=>c.r+'+'+NEXT[c.r[0]]+(fr(c.r)+k);
  const CH=(nm,shape,r,a)=>{const p=shape.split(' '),f=s=>p.find(x=>x[0]===s);return {nm,r,a,g:f('G'),b:f('B'),e:f('e'),full:p.join('+'),up:[f('G'),f('B'),f('e')].join('+')};};
  const E7=CH('{E}7','E0 A2 D2 G1 B3 e0','E0','D2'),A7=CH('{A}7','A0 D2 G0 B2 e0','A0','D2'),B7=CH('{B}7','A2 D1 G2 B0 e2','A2','D1'),
    D7=CH('{D}7','D0 G2 B1 e2','D0','A0'),G7=CH('{G}7','E3 A2 D0 G0 B0 e1','E3','D0'),C7=CH('{C}7','A3 D2 G3 B1 e0','A3','D2'),
    F=CH('{F}','D3 G2 B1 e1','E1','D3'),Em=CH('{E}m','E0 A2 D2 G0 B0 e0','E0','D2'),Am=CH('{A}m','A0 D2 G2 B1 e0','A0','D2');
  // hi — минорная пентатоника на трёх верхних струнах (по две ноты на струну), bn — блюзовая нота
  const KEYS=[
    {ru:'{E}',I:E7,IV:A7,V:B7,hi:['G0','G2','B0','B3','e0','e3'],bn:'G3'},
    {ru:'{A}',I:A7,IV:D7,V:E7,hi:['G0','G2','B1','B3','e0','e3'],bn:'B4'},
    {ru:'{G}',I:G7,IV:C7,V:D7,hi:['G0','G3','B1','B3','e1','e3'],bn:'B2'},
    {ru:'{C}',I:C7,IV:F,V:G7,hi:['G0','G3','B1','B4','e1','e3'],bn:'e2'},
    {ru:'{D}',I:D7,IV:G7,V:A7,hi:['G0','G2','B1','B3','e1','e3'],bn:'G1'},
    {ru:'{E}m',I:Em,IV:Am,V:B7,hi:['G0','G2','B0','B3','e0','e3'],bn:'G3'}
  ];
  const mono=c=>[[0,c.r],[2,c.r],[4,c.r],[6,c.r]], alt=c=>[[0,c.r],[2,c.a],[4,c.r],[6,c.a]];
  const CHK='Gx+Bx+ex';
  const B8=(...ev)=>bar(8,[].concat(...ev)), B12=(...ev)=>bar(12,[].concat(...ev));
  // шаффл: бас на долю (долгая), верх аккорда на короткую
  const shf=c=>[[0,c.r],[2,c.up],[3,c.a],[5,c.up],[6,c.r],[8,c.up],[9,c.a],[11,c.up]];
  const bgg=(c,ks)=>[].concat(...ks.map((k,j)=>[[3*j,bg(c,k)],[3*j+2,bg(c,k)]]));
  const qf=c=>[[0,c.full],[3,c.full],[6,c.full],[9,c.full]];
  const P12=K=>[K.I,K.I,K.I,K.I,K.IV,K.IV,K.I,K.I,K.V,K.IV,K.I,K.V], Q12=K=>[K.I,K.IV,K.I,K.I,K.IV,K.IV,K.I,K.I,K.V,K.IV,K.I,K.V];
  const by4=bs=>[sys(bs.slice(0,4)),sys(bs.slice(4,8)),sys(bs.slice(8,12))];

  // строители уровней: K → 5 табов
  const LV={
    B1:K=>{const{I,IV,V,hi:h}=K;return [
      sys([B8(mono(I)),B8(mono(I))]),
      sys([B8(mono(I),[[0,I.e],[4,I.e]]),B8(mono(IV),[[0,IV.e],[4,IV.e]])]),
      sys([B8(mono(I),[[1,I.g],[3,I.b],[5,I.e],[7,I.b]]),B8(mono(IV),[[1,IV.g],[3,IV.b],[5,IV.e],[7,IV.b]])]),
      sys([B8(mono(I),[[1,h[2]],[3,hm(h[3])],[5,h[4]],[7,h[2]]]),B8(mono(I),[[1,h[0]],[3,hm(h[1])],[5,h[2]],[7,h[0]]])]),
      sys([B8(mono(I),[[1,h[2]],[3,hm(h[3])],[5,h[4]],[7,h[2]]]),B8(mono(IV),[[1,IV.e],[3,IV.b],[5,IV.g],[7,IV.b]]),B8(mono(I),[[1,h[0]],[3,h[1]],[5,bdr(h[1])],[7,h[0]]]),B8(mono(V),[[1,V.e],[3,V.b],[5,V.g],[7,V.b]])])
    ];},
    B2:K=>{const{I,IV,V,hi:h}=K;const tr=c=>[[0,c.e],[3,c.b],[5,c.e],[7,c.g]];return [
      sys([B8(alt(I)),B8(alt(I))]),
      sys([B8(alt(I),[[0,I.e]]),B8(alt(IV),[[0,IV.e]])]),
      sys([B8(alt(I),tr(I)),B8(alt(IV),tr(IV))]),
      sys([B8(alt(I),[[0,h[4]],[3,h[5]],[5,h[4]],[7,h[3]]]),B8(alt(IV),tr(IV)),B8(alt(I),[[0,h[2]],[3,h[3]],[5,h[1]],[7,h[0]]]),B8(alt(V),tr(V))]),
      sys([B8(alt(I),[[0,h[4]],[1,hm(h[5])],[3,h[3]],[5,h[2]],[7,h[1]]]),B8(alt(IV),tr(IV)),B8(alt(I),[[0,h[2]],[1,hm(h[3])],[3,h[1]],[5,bdr(h[1])],[7,h[0]]]),B8(alt(V),tr(V))])
    ];},
    B3:K=>{const{I,IV,V}=K;
      const p1=c=>[c.r,c.g,c.b,c.e,c.b,c.g,c.b,c.g].map((t,i)=>[i,t]),p2=c=>[c.r,c.g,c.b,c.e,c.a,c.g,c.b,c.e].map((t,i)=>[i,t]);
      const p3=c=>[[0,c.r],[0,c.e],[1,c.g],[2,c.b],[3,c.g],[4,c.a],[4,c.b],[5,c.g],[6,c.e],[7,c.g]];
      const p4=c=>[c.r,c.g,c.b,c.e,c.b,c.g,c.a,c.g,c.b,c.e,c.b,c.g].map((t,i)=>[i,t]);
      return [sys([B8(p1(I)),B8(p1(IV))]),sys([B8(p2(I)),B8(p2(IV))]),sys([B8(p3(I)),B8(p3(IV)),B8(p3(V)),B8(p3(I))]),
        '/3 '+sys([B12(p4(I)),B12(p4(IV))]),'/3 '+sys([B12(p4(I)),B12(p4(IV)),B12(p4(V)),B12(p4(I))])];},
    B4:K=>{const{I,V,hi:h}=K;
      const tr=(a,b)=>[[0,a],[1,hm(b)],[2,pl(a)],[4,a],[5,hm(b)],[6,pl(a)]];
      const dn=[[0,h[5]],[1,pl(h[4])],[2,h[3]],[3,pl(h[2])],[4,h[1]],[5,pl(h[0])]], up=[[0,h[0]],[1,hm(h[1])],[2,h[2]],[3,hm(h[3])],[4,h[4]],[5,hm(h[5])],[6,pl(h[4])]];
      return [
        sys([B8(tr(h[0],h[1])),B8(tr(h[2],h[3]))]),
        sys([B8(mono(I),tr(h[0],h[1])),B8(mono(I),tr(h[2],h[3]))]),
        sys([B8(dn,[[6,I.r]]),B8(up)]),
        sys([B8(mono(I),dn),B8(mono(I),up)]),
        sys([B8(mono(I),dn),B8(mono(I),up),B8(mono(I),[[1,h[3]],[3,bdr(h[1])],[5,K.bn],[7,h[0]]]),B8(mono(V),[[0,V.e],[4,V.b]])])
      ];},
    B5:K=>{const{I,IV,V}=K;
      const s1=c=>[[0,c.full],[2,'.']], s2=c=>[[0,c.full],[1,'.'],[3,c.full],[4,'.']];
      const s3=c=>[[0,c.r],[0,c.e],[1,'.'],[2,c.a],[3,'.'],[4,c.r],[4,c.g],[5,'.'],[6,c.a],[7,'.']];
      const s4=c=>[[0,c.full],[1,'.'],[2,c.full],[3,'.'],[5,c.full],[6,'.']];
      return [sys([B8(s1(I)),B8(s1(IV))]),sys([B8(s2(I)),B8(s2(IV))]),sys([B8(s3(I)),B8(s3(IV))]),
        sys([B8(s4(I)),B8(s4(IV)),B8(s4(V)),B8(s4(I))]),sys([B8(s4(I)),B8(s3(IV)),B8(s4(I)),B8(s3(V))])];},
    R6:K=>{const{I,IV,V}=K;
      const sw=c=>[0,2,3,5,6,8,9,11].map(i=>[i,c.full]);
      const ch=c=>[[0,c.r],[2,c.up],[3,CHK],[5,c.up],[6,c.a],[8,c.up],[9,CHK],[11,c.up]];
      return [sys([B12(qf(I)),B12(qf(IV))]),sys([B12(sw(I)),B12(sw(IV))]),sys([B12(shf(I)),B12(shf(IV)),B12(shf(V)),B12(shf(I))]),
        sys([B12(ch(I)),B12(ch(IV))]),sys([B12(ch(I)),B12(ch(IV)),B12(ch(I)),B12(ch(V))])];},
    R7:K=>{const{I,IV,V}=K;const q=c=>[[0,bg(c,2)],[3,bg(c,2)],[6,bg(c,4)],[9,bg(c,4)]];
      const s=c=>bgg(c,[2,2,4,4]),s7=c=>bgg(c,K.bk||[2,4,5,4]);
      return [sys([B12(q(I)),B12(q(I))]),sys([B12(s(I)),B12(s(IV))]),sys([B12(s7(I)),B12(s7(IV))]),
        sys([I,IV,I,V].map(c=>B12(s7(c)))),[sys([I,I,IV,I].map(c=>B12(s7(c)))),sys([V,IV,I,V].map(c=>B12(s7(c))))]];},
    R8:K=>{const{I,IV,V}=K;const s7=c=>bgg(c,K.bk||[2,4,5,4]);
      // тёрнэраунд: в 11-м такте после аккорда I бас хроматически подходит к тонике V
      const w=walk(V.r,2),ta=B12([[0,I.r],[0,I.up],[3,I.up],[6,w[0]],[9,w[1]]]);
      const f=bs=>{if(K.ta)bs[10]=ta;return by4(bs);};
      return [sys([I,IV,I,I].map(c=>B12(qf(c)))),f(P12(K).map(c=>B12(qf(c)))),f(P12(K).map(c=>B12(shf(c)))),
        f(Q12(K).map(c=>B12(shf(c)))),f(Q12(K).map(c=>B12(s7(c))))];},
    R9:K=>{const{I,IV,V,hi:h}=K;
      const s1=c=>[[0,c.full],[3,'.']], s2=c=>[[0,c.full],[3,'.'],[11,c.full]];
      const s3=c=>[[0,c.full],[3,'.'],[6,h[5]],[8,h[4]],[9,h[3]],[11,h[2]]];
      return [sys([I,I,I,I].map(c=>B12(s1(c)))),sys([I,I,I,I].map(c=>B12(s2(c)))),sys([I,IV,I,V].map(c=>B12(s3(c)))),
        [sys([I,I,I,I].map(c=>B12(s2(c)))),sys([B12(shf(IV)),B12(shf(I))])],
        [sys([I,I,I,I].map(c=>B12(s3(c)))),sys([B12(shf(IV)),B12(shf(I)),B12(shf(V)),B12(shf(I))])]];},
    R10:K=>{const{I,IV,V,hi:h}=K;
      const s1=c=>[[0,c.r],[3,c.a],[6,c.r],[9,c.a]];
      const s2=c=>[c.r,c.g,c.b,c.a,c.g,c.b,c.r,c.g,c.b,c.a,c.g,c.b].map((t,i)=>[i,t]);
      const s3=c=>[c.r,c.g,c.b,c.a,c.g,c.b,c.r,h[4],h[3],c.a,h[2],h[1]].map((t,i)=>[i,t]);
      const s4=c=>[c.r,h[0],hm(h[1]),c.a,h[2],hm(h[3]),c.r,h[4],hm(h[5]),c.a,pl(h[4]),h[3]].map((t,i)=>[i,t]);
      const s5=c=>[[0,c.r],[1,h[5]],[2,pl(h[4])],[3,c.a],[4,h[3]],[5,pl(h[2])],[6,c.r],[7,K.bn],[8,bdr(h[1])],[9,c.a],[10,h[0]]];
      return [sys([B12(s1(I)),B12(s1(IV))]),sys([B12(s2(I)),B12(s2(IV))]),sys([B12(s3(I)),B12(s2(IV)),B12(s3(I)),B12(s2(V))]),
        sys([B12(s4(I)),B12(s2(IV)),B12(s4(I)),B12(s2(I))]),sys([B12(s4(I)),B12(s2(IV)),B12(s5(I)),B12(s2(V))])];},
    R11:K=>{const{I,IV,V}=K;
      const w1=(c,n)=>[[0,c.r],[2,c.a],[4,c.r],[6,walk(n.r,1)[0]]];
      const w2=(c,n)=>{const w=walk(n.r,2);return [[0,c.r],[2,c.a],[4,w[0]],[6,w[1]]];};
      const w3=(c,n)=>{const w=walk(n.r,3);return [[0,c.r],[0,c.e],[1,c.g],[2,c.a],[3,c.b],[4,c.r],[5,w[0]],[6,w[1]],[7,w[2]]];};
      const tr=c=>[[3,c.b],[5,c.e],[7,c.g]];
      return [sys([B8(w1(I,IV)),B8(w1(IV,I))]),sys([B8(w1(I,IV),[[0,I.e]]),B8(w1(IV,I),[[0,IV.e]])]),
        sys([B8(w1(I,IV),[[0,I.e],[3,I.b],[5,I.e]]),B8(w1(IV,I),[[0,IV.e],[3,IV.b],[5,IV.e]])]),
        sys([[I,IV],[IV,I],[I,V],[V,I]].map(([c,n])=>B8(w2(c,n),[[0,c.e],[1,c.g],[3,c.b],[5,c.e]]))),
        sys([[I,IV],[IV,I],[I,V],[V,I]].map(([c,n])=>B8(w3(c,n))))];},
    R12:K=>{const{I,IV,V,hi:h}=K;
      const m=c=>[[0,c.r],[2,CHK],[4,c.r],[6,CHK]], a=c=>[[0,c.r],[2,CHK],[4,c.a],[6,CHK]];
      const t3=c=>a(c).concat([[3,c.b],[7,c.e]]);
      return [sys([B8(m(I)),B8(m(IV))]),sys([B8(a(I)),B8(a(IV))]),sys([B8(t3(I)),B8(t3(IV))]),
        sys([B8(a(I),[[0,h[4]],[3,h[3]],[5,h[2]],[7,h[3]]]),B8(t3(IV)),B8(a(I),[[0,h[4]],[3,h[3]],[5,h[1]],[7,h[0]]]),B8(t3(V))]),
        sys([B8(a(I),[[1,h[2]],[3,hm(h[3])],[5,h[4]],[7,h[2]]]),B8(t3(IV)),B8(a(I),[[1,h[0]],[3,hm(h[1])],[5,h[2]],[7,h[0]]]),B8(t3(V))])];},
    R13:K=>{const{I,IV,V,hi:h}=K;
      const call=c=>[[0,c.full],[2,c.full],[3,c.full],[6,'.']];
      const a1=[[0,h[5]],[3,h[4]],[6,h[3]],[9,h[2]]];
      const a2=[[0,h[5]],[2,h[4]],[3,h[3]],[5,h[2]],[6,h[1]],[8,h[0]],[9,I.r]];
      const a3=[[0,h[4]],[2,hm(h[5])],[3,pl(h[4])],[5,h[3]],[6,pl(h[2])],[8,h[1]],[9,I.r]];
      const a5=[[0,h[3]],[3,bdr(h[3])],[5,h[2]],[6,h[1]],[8,h[0]],[9,I.r]];
      return [sys([B12(call(I)),B12(a1)]),sys([B12(call(I)),B12(a2)]),sys([B12(call(I)),B12(a3)]),
        sys([B12(call(I)),B12(a3),B12(call(IV)),B12(a2)]),
        [sys([B12(call(I)),B12(a5),B12(call(IV)),B12(a3)]),sys([B12(call(V)),B12(a5),B12(call(I)),B12(a2)])]];},
    R14:K=>{const{I,IV,V,hi:h}=K;const dr=h[4];
      const l3=[[1,h[0]],[3,hm(h[1])],[5,dr],[7,h[1]]], l3iv=c=>[[1,c.g],[3,dr],[5,c.b],[7,dr]];
      const push=[[0,I.r],[2,I.r],[4,I.r],[1,h[0]],[3,hm(h[1])],[5,dr],[7,IV.full]];
      return [sys([B8(mono(I),[[0,dr]]),B8(mono(I),[[0,dr]])]),sys([B8(mono(I),[[3,dr],[7,dr]]),B8(mono(I),[[3,dr],[7,dr]])]),
        sys([B8(mono(I),l3),B8(mono(IV),l3iv(IV))]),
        sys([B8(push),B8(mono(IV),l3iv(IV)),B8(mono(I),l3),B8(mono(I),[[3,dr],[7,dr]])]),
        sys([B8(push),B8(mono(IV),l3iv(IV)),B8(mono(I),l3),B8(mono(V),[[0,V.e],[3,dr],[5,V.b],[7,dr]])])];},
    R15:K=>{const{I,IV,V}=K;
      const s=(c,ps)=>ps.map(i=>[i,c.full]);
      const bc=c=>[[0,c.r],[2,c.up],[3,c.up],[4,c.a],[5,c.up],[7,c.up]];
      const bp=(c,n)=>[[0,c.r],[2,c.up],[3,c.up],[4,c.a],[5,c.up],[7,n.full]];
      return [sys([B8(s(I,[0,2,4,6])),B8(s(IV,[0,2,4,6]))]),sys([B8(s(I,[0,1,2,3,4,5,6,7])),B8(s(IV,[0,1,2,3,4,5,6,7]))]),
        sys([I,IV,V,I].map(c=>B8(s(c,[0,2,3,5,6,7])))),sys([B8(bc(I)),B8(bc(IV))]),
        sys([[I,IV],[IV,V],[V,I],[I,I]].map(([c,n])=>B8(bp(c,n))))];},
    R37:K=>{const{I,IV,V,hi:h}=K;
      const b=c=>[[0,c.r],[2,c.up],[4,c.a],[6,c.up]];
      const m2=c=>b(c).concat([[3,h[4]],[7,h[3]]]);
      const m3=(c,n)=>[[0,c.r],[2,c.up],[3,h[4]],[4,c.a],[6,walk(n.r,1)[0]],[7,h[3]]];
      const m4=c=>[[0,c.r],[1,h[2]],[2,c.up],[3,hm(h[3])],[4,c.a],[5,h[4]],[6,c.up],[7,h[2]]];
      const m5=c=>[[0,c.r],[1,h[1]],[2,c.up],[3,bdr(h[1])],[4,c.a],[5,h[0]],[6,c.up],[7,h[2]]];
      return [sys([B8(b(I)),B8(b(IV))]),sys([B8(m2(I)),B8(m2(IV))]),sys([B8(m3(I,IV)),B8(m3(IV,I))]),
        sys([B8(m4(I)),B8(b(IV)),B8(m4(I)),B8(b(V))]),sys([B8(m4(I)),B8(m2(IV)),B8(m5(I)),B8(m2(V))])];}
  };

  // тексты: RU и EN; подпись варианта — слово упражнения + тональность
  const T={
    B1:{sub:2,lab:['Монотонный бас в','Dead thumb in'],
      ru:{name:'Монотонный бас',goal:'Независимость большого пальца: ровный бас под любой мелодией.',how:'Большой палец (p) бьёт тонику четвертями и не останавливается, ребро ладони слегка глушит басовые струны. Пальцы i и m играют верхние струны между долями. Так играли Лайтнин Хопкинс и Биг Билл Брунзи.',tip:'Поставь бас на автомат: считай вслух и не подстраивай его под мелодию. Сбивается бас — убери мелодию и сбавь темп.',lvl:['Только большой палец','Щипок на долю','Ноты между долями','Легато в мелодии','Четыре такта с бендом']},
      en:{name:'Dead thumb',goal:'Thumb independence: a steady bass under any melody.',how:'The thumb (p) plays the root in quarter notes and never stops; the edge of the palm lightly mutes the bass strings. Fingers i and m play the top strings between the beats. Think Lightnin’ Hopkins and Big Bill Broonzy.',tip:'Put the bass on autopilot: count out loud and never bend it to the melody. If the bass stumbles, drop the melody and the tempo.',lvl:['Thumb only','Pinch on the beat','Notes between the beats','Legato in the melody','Four bars with a bend']}},
    B2:{sub:2,lab:['Трэвис в','Travis picking in'],
      ru:{name:'Переменный бас (Трэвис)',goal:'Переменный бас большим пальцем — основа фингерстайл-блюза.',how:'Большой палец чередует тонику и вторую басовую ноту аккорда на каждую долю. Пальцы играют верхние струны между долями и щипком вместе с басом. Стиль Мерла Трэвиса, Миссисипи Джона Хёрта, Блайнд Блейка.',tip:'Бас на всех четырёх долях одинаково громкий. Мелодия подстраивается под бас, а не наоборот.',lvl:['Только бас','Щипок на первую долю','Полный перебор Трэвиса','Мелодия на пентатонике','Мелодия с легато и бендом']},
      en:{name:'Alternating bass (Travis)',goal:'An alternating thumb bass, the core of fingerstyle blues.',how:'The thumb alternates the root and the chord’s second bass note on every beat. The fingers play the top strings between the beats and pinch together with the bass. The style of Merle Travis, Mississippi John Hurt and Blind Blake.',tip:'The bass is equally loud on all four beats. The melody fits around the bass, not the other way round.',lvl:['Bass only','Pinch on beat one','Full Travis pattern','Pentatonic melody','Melody with legato and a bend']}},
    B3:{sub:2,lab:['Перебор в','Arpeggios in'],
      ru:{name:'Перебор p-i-m-a',goal:'Ровный перебор: каждый палец на своей струне.',how:'Большой палец — басовые струны, i — третья, m — вторая, a — первая. Восьмые, на четвёртом и пятом уровнях — триоли. Аккорд держи целиком, пусть звучит.',tip:'Пальцы двигаются от костяшек, кисть стоит на месте. Все ноты одинаково громкие.',lvl:['Два аккорда','Переменный бас','Щипок и четыре аккорда','Триоли','Триоли, четыре аккорда']},
      en:{name:'p-i-m-a arpeggios',goal:'Even fingerpicking: each finger on its own string.',how:'The thumb takes the bass strings, i the third string, m the second, a the first. Eighth notes, triplets on levels 4 and 5. Hold the whole chord and let it ring.',tip:'The fingers move from the knuckles, the hand stays still. Every note equally loud.',lvl:['Two chords','Alternating bass','Pinches and four chords','Triplets','Triplets, four chords']}},
    B4:{sub:2,lab:['Легато в','Legato in'],
      ru:{name:'Легато с открытых струн',goal:'Хаммеры и пулл-оффы дельта-блюза.',how:'Нижняя нота щипком, верхняя — хаммером, обратно — пулл-оффом. Со второго уровня под легато идёт бас большим пальцем на каждую долю.',tip:'Хаммер — с высоты, точно у ладовой пластины. Пулл-офф — чуть вниз, будто щипок левой рукой. Обе ноты одинаково громкие.',lvl:['Одна струна','Легато над басом','Три струны вниз и вверх','Три струны над басом','Фраза с бендом и блюзовой нотой']},
      en:{name:'Legato from open strings',goal:'Delta blues hammer-ons and pull-offs.',how:'Pluck the lower note, hammer on the upper one, pull off back down. From level 2 the thumb plays a bass note on every beat under the legato.',tip:'Hammer from a height, right behind the fret. Pull off slightly downward, like plucking with the fretting hand. Both notes equally loud.',lvl:['One string','Legato over the bass','Three strings down and up','Three strings over the bass','Phrase with a bend and a blue note']}},
    B5:{sub:2,lab:['Обрывы в','Cut-offs in'],
      ru:{name:'Глушение и обрывы',goal:'Тишина там, где нет ноты: чистые паузы на акустике.',how:'Точка в табе — пауза. Аккорд обрывается: левая рука ослабляет нажим, ладонь правой ложится на струны. Открытые струны глушит ладонь.',tip:'Проверка: на паузе не звенит ни одна открытая струна. Акустика гудит дольше электрогитары, глуши обеими руками.',lvl:['Удар и долгая пауза','Синкопа','Стаккато баса','Синкопированные обрывы','Четыре такта, смена фигур']},
      en:{name:'Muting and cut-offs',goal:'Silence wherever there is no note: clean rests on an acoustic.',how:'A dot in the tab is a rest. Cut the chord off: the fretting hand eases its pressure, the picking-hand palm lands on the strings. The palm mutes the open strings.',tip:'Test: no open string rings through a rest. An acoustic sustains longer than an electric, so mute with both hands.',lvl:['A hit and a long rest','Syncopation','Staccato bass','Syncopated cut-offs','Four bars, changing figures']}},
    R6:{sub:3,lab:['Шаффл в','Shuffle in'],
      ru:{name:'Шаффл-бой',goal:'Свинговый бой: долгая-короткая.',how:'Деление — триоли: долгая восьмая — две трети доли, короткая — треть. С третьего уровня бас на долю и верх аккорда на короткую восьмую, с четвёртого — глухой удар на 2 и 4 (крестики в табе).',tip:'Свинг держит правая рука: вниз-вверх без остановки, удары просто попадают на долгую и короткую.',lvl:['Четверти','Свинговые восьмые','Бас и аккорд','Глухой удар на 2 и 4','Четыре такта квадрата']},
      en:{name:'Shuffle strumming',goal:'Swung strumming: long-short.',how:'Triplet subdivision: the long eighth is two thirds of the beat, the short one a third. From level 3 the bass is on the beat and the top of the chord on the short eighth; from level 4 a muted hit on 2 and 4 (x in the tab).',tip:'The picking hand keeps the swing: down-up without stopping, the strokes just land on the long and the short.',lvl:['Quarter notes','Swung eighths','Bass and chord','Muted hit on 2 and 4','Four bars of the form']}},
    R7:{sub:3,lab:['Бугги в','Boogie in'],
      ru:{name:'Бугги на басовых струнах',goal:'Классический шаффл: квинта и секста над тоникой.',how:'Две басовые струны вместе: тоника и квинта, затем секста, с третьего уровня — малая септима. Свинговые восьмые большим пальцем.',tip:'Тоника звучит всё время, двигается только палец на верхней из двух струн. Если септима тянет мизинец, сдвинь кисть, а не тяни палец.',lvl:['Четверти','Свинговые восьмые','С малой септимой','Четыре такта','Восемь тактов квадрата']},
      en:{name:'Bass-string boogie',goal:'The classic shuffle: fifth and sixth over the root.',how:'Two bass strings together: root and fifth, then the sixth, and from level 3 the flat seventh. Swung eighths with the thumb.',tip:'The root rings all the time; only the finger on the upper string moves. If the seventh strains your little finger, shift the hand instead of stretching.',lvl:['Quarter notes','Swung eighths','With the flat seventh','Four bars','Eight bars of the form']}},
    R8:{sub:3,lab:['Квадрат в','12-bar in'],
      ru:{name:'12-тактовый квадрат',goal:'Чувствовать форму блюза без счёта.',how:'Двенадцать тактов: четыре на I, два на IV, два на I, затем V, IV, I, V. На четвёртом и пятом уровнях «быстрая четвёрка»: IV уже во втором такте.',tip:'Перед сменой аккорда думай на такт вперёд. Пропой форму — и сыграешь её.',lvl:['Четыре такта','Весь квадрат четвертями','Весь квадрат шаффлом','Быстрая четвёрка','Быстрая четвёрка с бугги']},
      en:{name:'12-bar form',goal:'Feel the blues form without counting.',how:'Twelve bars: four on I, two on IV, two on I, then V, IV, I, V. Levels 4 and 5 use the quick change: IV already in bar 2.',tip:'Think one bar ahead of each chord change. Sing the form and you will play it.',lvl:['Four bars','The whole form in quarters','The whole form as a shuffle','Quick change','Quick change with boogie']}},
    R9:{sub:3,lab:['Стоп-тайм в','Stop-time in'],
      ru:{name:'Стоп-тайм',goal:'Держать время в тишине.',how:'Аккорд на первую долю, дальше тишина до конца такта. Точка в табе — пауза, глуши струны. Со второго уровня — удар на последнюю восьмую такта, с третьего — ответ одиночными нотами.',tip:'Счёт не останавливается вместе со звуком. Метроном — твоя ритм-секция.',lvl:['Удар и тишина','Удар раньше такта','Ответ нотами','Стопы и шаффл','Ответы и шаффл']},
      en:{name:'Stop-time',goal:'Keep time through silence.',how:'A chord on beat one, then silence to the end of the bar. A dot in the tab is a rest: mute the strings. From level 2 a hit on the last eighth of the bar, from level 3 an answer in single notes.',tip:'The count keeps going when the sound stops. The metronome is your rhythm section.',lvl:['Hit and silence','Hit ahead of the bar','Answer in notes','Stops and shuffle','Answers and shuffle']}},
    R10:{sub:3,lab:['Медленный блюз в','Slow blues in'],
      ru:{name:'Медленный блюз 12/8',goal:'Медленный триольный грув.',how:'Размер 12/8: двенадцать восьмых в такте, щелчок — восьмая. Большой палец — на каждую долю, пальцы заполняют триоли.',tip:'Медленно — не значит вяло: каждая восьмая на месте. Дай нотам звучать.',lvl:['Бас','Триольный перебор','Мелодия сверху','Легато','Бенд и блюзовая нота']},
      en:{name:'Slow blues in 12/8',goal:'A slow triplet groove.',how:'12/8: twelve eighths per bar, a click is an eighth. The thumb plays every beat, the fingers fill in the triplets.',tip:'Slow does not mean sloppy: every eighth sits in place. Let the notes ring.',lvl:['Bass','Triplet arpeggio','Melody on top','Legato','Bend and blue note']}},
    R11:{sub:2,lab:['Ходы в','Walks in'],
      ru:{name:'Басовые ходы',goal:'Связывать аккорды ходом в басу.',how:'Большой палец ведёт бас и последней долей подходит к тонике следующего аккорда — на полтона снизу или сверху. На пятом уровне ход идёт хроматически восьмыми. Пальцы держат аккорд сверху.',tip:'Подход — на последнюю долю, тоника нового аккорда — точно на первую.',lvl:['Ход на одну ноту','Щипок на долю','Перебор сверху','Ход в две ноты','Хроматический ход восьмыми']},
      en:{name:'Bass walks',goal:'Connect chords with a bass walk.',how:'The thumb leads the bass and on the last beat approaches the next chord’s root from a half step below or above. On level 5 the walk moves chromatically in eighths. The fingers hold the chord on top.',tip:'The approach note on the last beat, the new root exactly on beat one.',lvl:['One-note walk','Pinch on the beat','Fingerpicking on top','Two-note walk','Chromatic walk in eighths']}},
    R12:{sub:2,lab:['Шлепок в','Slap in'],
      ru:{name:'Бас и шлепок',goal:'Перкуссионная акустика: бас и глухой удар на 2 и 4.',how:'Большой палец — бас на 1 и 3, на 2 и 4 пальцы ударяют по верхним струнам, а ладонь сразу их глушит: крестики в табе — глухой щелчок.',tip:'Щелчок не громче баса. Ладонь ложится на струны в момент удара, а не после.',lvl:['Бас и щелчок','Переменный бас','Ноты между долями','Мелодия','Мелодия с легато']},
      en:{name:'Bass and slap',goal:'Percussive acoustic: bass and a muted hit on 2 and 4.',how:'The thumb plays the bass on 1 and 3; on 2 and 4 the fingers strike the top strings while the palm mutes them at once: x in the tab is a dead click.',tip:'The click is no louder than the bass. The palm lands on the strings with the hit, not after it.',lvl:['Bass and click','Alternating bass','Notes between the beats','Melody','Melody with legato']}},
    R13:{sub:3,lab:['Вызов и ответ в','Call and response in'],
      ru:{name:'Вызов и ответ',goal:'Фраза аккордами — ответ одиночными нотами.',how:'Такт аккордов, затем такт ответа на пентатонике, свинговые восьмые. Точка в табе — пауза.',tip:'Ответ — вторая реплика в разговоре: короче, тише или выше вызова.',lvl:['Ответ четвертями','Свинговый ответ','Ответ с легато','Четыре такта','С бендами']},
      en:{name:'Call and response',goal:'A phrase in chords, an answer in single notes.',how:'A bar of chords, then a bar answering on the pentatonic, swung eighths. A dot in the tab is a rest.',tip:'The answer is the second line of a conversation: shorter, quieter or higher than the call.',lvl:['Answer in quarters','Swung answer','Answer with legato','Four bars','With bends']}},
    R14:{sub:2,lab:['Дельта-грув в','Delta groove in'],
      ru:{name:'Дельта-грув',goal:'Бурдон и синкопы в духе дельта-блюза.',how:'Бас на каждую долю, нота на первой струне — бурдон, он звучит между долями. С четвёртого уровня аккорд следующего такта вступает раньше, на последнюю восьмую. Слушай Чарли Паттона и Сан Хауса.',tip:'Акцент — на бурдоне между долями: от этого грув и качается.',lvl:['Бурдон на долю','Бурдон между долями','Легато и бурдон','Смена раньше такта','Четыре такта']},
      en:{name:'Delta groove',goal:'Drone and syncopation in the Delta blues style.',how:'Bass on every beat; a note on the first string is the drone, ringing between the beats. From level 4 the next bar’s chord comes in early, on the last eighth. Listen to Charley Patton and Son House.',tip:'Accent the drone between the beats: that is what makes the groove swing.',lvl:['Drone on the beat','Drone between the beats','Legato and drone','Change ahead of the bar','Four bars']}},
    R15:{sub:2,lab:['Синкопы в','Syncopation in'],
      ru:{name:'Синкопированный бой',goal:'Бой с синкопой: ровные восьмые, удары не везде.',how:'Ровные восьмые без свинга. Рука движется вниз-вверх всё время и задевает струны только там, где в табе аккорд. С четвёртого уровня — бас и аккорд, на пятом следующий аккорд вступает на последнюю восьмую.',tip:'Холостой взмах так же ровен, как удар.',lvl:['Четверти','Восьмые','Синкопа','Бас и аккорд','Смена раньше такта']},
      en:{name:'Syncopated strumming',goal:'Syncopated strumming: even eighths, not every stroke hits.',how:'Straight eighths, no swing. The hand moves down-up all the time and only strikes where the tab shows a chord. From level 4 bass and chord; on level 5 the next chord comes in on the last eighth.',tip:'The silent swing is as even as the stroke.',lvl:['Quarter notes','Eighth notes','Syncopation','Bass and chord','Change ahead of the bar']}},
    R37:{sub:2,lab:['Бой и щипок в','Strum and pluck in'],
      ru:{name:'Бой и щипок',goal:'Совместить бас, бой и одиночные ноты.',how:'Большой палец — бас, указательный — короткий бой вниз по трём верхним струнам на 2 и 4, между ними пальцы щипают мелодию.',tip:'Бой короче и тише баса, мелодия слышна поверх.',lvl:['Бас и бой','Нота между ударами','Ход в басу','Мелодия с легато','Мелодия с бендом']},
      en:{name:'Strum and pluck',goal:'Combine bass, strums and single notes.',how:'The thumb plays the bass, the index finger a short downstroke across the top three strings on 2 and 4, and the fingers pluck a melody in between.',tip:'The strum is shorter and quieter than the bass; the melody carries on top.',lvl:['Bass and strum','A note between strokes','Bass walk','Melody with legato','Melody with a bend']}}
  };
  // материал варианта: тональность + приёмы (флаги). h — верхние голоса и мелодия октавой выше (12-й лад),
  // m — глушёный ладонью бас, t — бой только по верхним струнам, v — бас начинается со второй басовой ноты,
  // a — тёрнэраунд с хроматическим ходом, 1/2 — другая фигура бугги
  const sh=t=>t[0]+(fr(t)+12);
  const FL=(K,f)=>{const k=Object.assign({},K),each=fn=>['I','IV','V'].forEach(n=>{k[n]=Object.assign({},k[n]);fn(k[n]);});
    if(f.includes('h')){k.hi=K.hi.map(sh);k.bn=sh(K.bn);each(c=>{c.g=sh(c.g);c.b=sh(c.b);c.e=sh(c.e);c.up=[c.g,c.b,c.e].join('+');});}
    if(f.includes('v'))each(c=>{const r=c.r;c.r=c.a;c.a=r;});
    if(f.includes('t'))each(c=>{c.full=c.up;});
    if(f.includes('m'))each(c=>{c.r+='m';c.a+='m';c.full+='m';});
    if(f.includes('a'))k.ta=1;
    if(f.includes('1'))k.bk=[2,5,4,2];
    if(f.includes('2'))k.bk=[4,5,4,2];
    return k;};
  const FW={h:['верх на 12-м ладу','top voices at the 12th fret'],m:['глушёный бас','muted bass'],t:['бой по верхним струнам','strum the top strings'],
    v:['бас со второй ноты','bass starts on the second note'],a:['тёрнэраунд с ходом','turnaround with a walk'],
    '1':['септима на второй доле','seventh on beat two'],'2':['бугги с сексты','boogie from the sixth'],'':['базовая фигура','basic figure']};
  const phr=(f,j)=>f?f.split('').map(c=>FW[c][j]).join(', '):FW[''][j];
  // [тональность (индекс KEYS), флаги]
  const VAR={
    B1:[[0,''],[1,'m'],[4,'h'],[2,'m'],[0,'mh'],[5,'h']],
    B2:[[0,''],[1,'m'],[2,'h'],[3,'m'],[4,'h'],[5,'mh']],
    B3:[[0,''],[1,'h'],[2,'v'],[3,'h'],[4,'v'],[5,'m']],
    B4:[[0,''],[1,'h'],[2,'m'],[3,'mh'],[4,'h'],[5,'m']],
    B5:[[0,''],[1,'t'],[2,'m'],[3,'t'],[4,'h'],[5,'m']],
    R6:[[0,''],[1,'m'],[2,'t'],[3,'th'],[4,'m'],[5,'t']],
    R7:[[0,''],[1,'1'],[2,'m'],[3,'2'],[4,'m1'],[5,'m2']],
    R8:[[0,''],[1,'a'],[2,'m'],[3,'ta'],[4,'t'],[5,'ma']],
    R9:[[0,''],[1,'t'],[2,'h'],[3,'m'],[4,'th'],[5,'h']],
    R10:[[0,''],[1,'h'],[2,'v'],[3,'m'],[4,'h'],[5,'v']],
    R11:[[0,''],[1,'m'],[2,'h'],[3,'mh'],[4,'m'],[5,'h']],
    R12:[[0,''],[1,'h'],[2,'m'],[3,'h'],[4,'m'],[5,'mh']],
    R13:[[0,''],[1,'h'],[2,'t'],[3,'m'],[4,'h'],[5,'th']],
    R14:[[0,''],[1,'h'],[2,'m'],[3,'h'],[4,'m'],[5,'mh']],
    R15:[[0,''],[1,'t'],[2,'m'],[3,'th'],[4,'t'],[5,'m']],
    R37:[[0,''],[1,'h'],[2,'m'],[3,'h'],[4,'mh'],[5,'m']]
  };
  const EX={},EXEN={};
  Object.keys(T).forEach(id=>{const o=T[id],vs=VAR[id];
    EX[id]=Object.assign({},o.ru,{sub:o.sub,v:vs.map(([k,f])=>BV(o.lab[0]+' '+KEYS[k].ru+', '+phr(f,0),LV[id](FL(KEYS[k],f)),o.meter?{meter:o.meter}:null))});
    EXEN[id]=Object.assign({},o.en,{v:vs.map(([k,f])=>o.lab[1]+' '+KEYS[k].ru+', '+phr(f,1))});
  });
  // разминка без уровней
  Object.assign(EX,{
    W0:{name:'Разминка',goal:'Разогреть руки и пальцы правой руки.',how:'Без гитары минуту: потри ладони до тепла, медленные круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем медленная хроматика в первой позиции по всем струнам, пальцы правой руки чередуются: i-m.',tip:'На акустике подушечки нагружаются сильнее, чем на электрогитаре: первые минуты играй мягко.',sub:2,v:[{l:'Хроматика в первой позиции',t:['E1 E2 E3 E4 A1 A2 A3 A4 D1 D2 D3 D4 G1 G2 G3 G4 B1 B2 B3 B4 e1 e2 e3 e4','e4 e3 e2 e1 B4 B3 B2 B1 G4 G3 G2 G1 D4 D3 D2 D1 A4 A3 A2 A1 E4 E3 E2 E1']}]},
    W1:{name:'Мобилизация без гитары',goal:'Разогнать кровь в кистях и предплечьях.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз. Сожми и раскрой кулаки 20 раз. Пошевели каждым пальцем правой руки отдельно.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
    W2:{name:'Медленный перебор',goal:'Включить большой палец и пальцы правой руки.',how:'Большой палец — басовые струны, i-m-a — три верхние. Восьмые, темп заведомо низкий. Аккорд держи, пусть звучит.',tip:'Каждая нота звучит полную длительность, большой палец не задевает соседние струны.',sub:2,v:[{l:'Перебор на двух аккордах',t:['E0 G1 A2 B0 D2 e0 A2 B0 | A0 G2 D2 B2 A0 e0 D2 B2','E0 G1 A2 B0 D2 e0 A2 B0 | E0 G1 A2 B0 D2 e0 B0 G1']}]},
    W3:{name:'Трели от открытых струн',goal:'Разогреть пальцы левой руки без нагрузки.',how:'Восьмые, темп вполовину рабочего. Открытая струна щипком, дальше хаммер и пулл-офф: пальцы 1, 2, 3 по очереди на третьей, затем на второй струне.',tip:'Пулл-офф — чуть вниз, а не просто снять палец.',sub:2,v:[{l:'Три пальца на двух струнах',t:['G0 Gh1 Gp0 Gh1 G0 Gh2 Gp0 Gh2 | G0 Gh3 Gp0 Gh3 B0 Bh1 Bp0 Bh1 | B0 Bh2 Bp0 Bh2 B0 Bh3 Bp0 Bh3']}]}
  });
  Object.assign(EXEN,{
    W0:{name:'Warm-up',goal:'Warm up both hands and the plucking fingers.',how:'One minute without the guitar: rub your palms until warm, slow wrist and shoulder circles, open and close your fists 20 times. Then slow first-position chromatics across all strings, alternating i-m with the picking hand.',tip:'An acoustic is harder on the fingertips than an electric: play gently for the first minutes.',v:['First-position chromatics']},
    W1:{name:'Mobility without the guitar',goal:'Get blood flowing in the hands and forearms.',how:'Rub your palms until warm. Wrist circles both ways, 10 each. Shoulders up, back, down. Open and close your fists 20 times. Move each picking-hand finger on its own.',tip:'No stretching into pain: only warmth and mobility.'},
    W2:{name:'Slow fingerpicking',goal:'Wake up the thumb and the picking fingers.',how:'The thumb takes the bass strings, i-m-a the top three. Eighth notes, deliberately slow. Hold the chord and let it ring.',tip:'Every note rings its full length; the thumb does not catch the neighbouring strings.',v:['Picking over two chords']},
    W3:{name:'Trills from open strings',goal:'Warm up the fretting fingers without strain.',how:'Eighth notes, half your working tempo. Pluck the open string, then hammer on and pull off: fingers 1, 2, 3 in turn on the third string, then on the second.',tip:'A pull-off goes slightly down, not just off the string.',v:['Three fingers on two strings']}
  });
  const TESTS=[
    {id:'ABT1',ru:['Монотонный бас','Тоника {E} четвертями большим пальцем, щипок на первую долю, держать 30 секунд без сбоя.'],en:['Dead thumb','Root {E} in quarter notes with the thumb, a pinch on beat one, hold 30 seconds without a slip.'],sub:2,t:['E0+e0:2 E0:2 E0:2 E0:2']},
    {id:'ABT2',ru:['Перебор Трэвиса','{E}7, переменный бас и пальцы между долями, четыре такта подряд без сбоя.'],en:['Travis picking','{E}7, alternating bass and fingers between the beats, four bars in a row without a slip.'],sub:2,t:['E0+e0:2 D2 B3 E0 e0 D2 G1']},
    {id:'ABT3',ru:['Бугги шаффлом','Бугги в {E} свинговыми восьмыми, держать 60 секунд.'],en:['Boogie shuffle','Boogie in {E} in swung eighths, hold 60 seconds.'],sub:3,t:['E0+A2:2 E0+A2 E0+A2:2 E0+A2 E0+A4:2 E0+A4 E0+A4:2 E0+A4']},
    {id:'ABT4',ru:['Перебор триолями','{E}7, p-i-m-a триолями, четыре такта подряд, все ноты ровные.'],en:['Triplet arpeggio','{E}7, p-i-m-a in triplets, four bars in a row, every note even.'],sub:3,t:['E0 G1 B3 e0 B3 G1 D2 G1 B3 e0 B3 G1']},
    {id:'ABT5',ru:['Легато с открытых струн','Хаммер и пулл-офф на трёх верхних струнах, два круга подряд, восьмые.'],en:['Legato from open strings','Hammer-on and pull-off on the top three strings, two loops in a row, eighths.'],sub:2,t:['G0 Gh2 Gp0 G0 B0 Bh3 Bp0 B0 | e0 eh3 ep0 e0 B0 Bh3 Bp0 B0']}
  ];
  const RIFF={
    ru:['хотя бы одна пауза длиной в целую долю','закончить на блюзовой ноте — пониженной квинте','только три нижние струны','один полутоновый бенд','второй раз рифф отвечает сам себе: вызов и ответ','через весь рифф идёт монотонный бас большим пальцем','не больше пяти разных нот — только пентатоника','рифф начинается не с сильной доли','в конце — тёрнэраунд к тонике','открытая струна звучит бурдоном через весь рифф','один стоп: аккорд и тишина до конца такта','темп на 20% ниже рабочего, но со свингом'],
    en:['at least one rest a full beat long','end on the blue note, the flat fifth','only the three lowest strings','one half-step bend','the second time through, the riff answers itself: call and response','a dead-thumb bass runs through the whole riff','no more than five different notes: pentatonic only','the riff does not start on a strong beat','end with a turnaround to the root','an open string drones through the whole riff','one stop: a chord, then silence to the end of the bar','tempo 20% below your working tempo, but swinging']
  };
  return {EX,EXEN,COACH:{W0:{free:60}},TESTS,RIFF};
})();
/*@BLUES_ACOUSTIC_2@*/
// Акустика, часть 2 (A, L, C): фингерстайл, Трэвис, дельта-блюз. Всё в своей области видимости, имена наружу не выходят.
const BLA2=(()=>{
const J=(...a)=>a.filter(x=>x!=null&&x!=='').join(' ');
const swp=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push(a[i]+':2 '+a[i+1]);return o.join(' ');}; // ровные восьмые → свинг (внутри /3)
const sh=(full,b,t)=>({full,b,t,top:t.join('+'),x:full.replace(/\d+/g,'x')});
const S={
  E7:sh('E0+A2+D0+G1+B0+e0',['E0','D0'],['G1','B0','e0']),
  A7:sh('A0+D2+G0+B2+e0',['A0','D2'],['G0','B2','e0']),
  D7:sh('A0+D0+G2+B1+e2',['D0','A0'],['G2','B1','e2']),
  G7:sh('E3+A2+D0+G0+B0+e1',['E3','D0'],['G0','B0','e1']),
  C7:sh('A3+D2+G3+B1+e0',['A3','D2'],['G3','B1','e0']),
  B7:sh('A2+D1+G2+B0+e2',['A2','D1'],['G2','B0','e2']),
  F7:sh('E1+A3+D1+G2+B1+e1',['E1','D1'],['G2','B1','e1']),
  'F#7':sh('E2+A4+D2+G3+B2+e2',['E2','D2'],['G3','B2','e2']),
  C:sh('A3+D2+G0+B1+e0',['A3','D2'],['G0','B1','e0']),
  G:sh('E3+A2+D0+G0+B0+e3',['E3','D0'],['G0','B0','e3']),
  D:sh('A0+D0+G2+B3+e2',['D0','A0'],['G2','B3','e2'])
};
const cn=c=>c.replace(/^([A-G]#?)/,'{$1}');
// тональности: аккорды I–IV–V, f — первая позиция минорной пентатоники (тоника на {s:E}), bs — струна и лад шаффла, m — позиция мажорной пентатоники
const K=[
  {n:'{E}',I:'E7',IV:'A7',V:'B7',f:0,bs:['E',0],m:9},
  {n:'{A}',I:'A7',IV:'D7',V:'E7',f:5,bs:['A',0],m:2},
  {n:'{G}',I:'G7',IV:'C7',V:'D7',f:3,bs:['E',3],m:12},
  {n:'{C}',I:'C7',IV:'F7',V:'G7',f:8,bs:['A',3],m:5},
  {n:'{D}',I:'D7',IV:'G7',V:'A7',f:10,bs:['A',5],m:7},
  {n:'{B}',I:'B7',IV:'E7',V:'F#7',f:7,bs:['A',2],m:4}
];
const NX={E:'A',A:'D',D:'G'};
const EX={},EN={};
// ex: id, n, ru{name,goal,how,tip,lvl}, en{…}, sub, v:[[lRu,lEn,lvs]]
function add(id,n,sub,ru,en,vs){
  EX[id]=Object.assign({n},ru,{sub,v:vs.map(([l,,lv])=>({l,lv:lv.map(t=>({t:typeof t==='string'?[t]:t}))}))});
  EN[id]=Object.assign({},en,{v:vs.map(x=>x[1])});
}

/* Вариант меняет материал, а не только тональность: паттерн правой руки, позицию пентатоники,
   фигуру шаффла, вид тёрнэраунда, пару струн, ритм, рифф. Уровни внутри варианта — сложность. */

// Трэвис-паттерны: такт восьмыми, на долях бас (b0, b1), между ними верх (t0 < t1 < t2)
const TP=[
  {ru:'классический Трэвис',en:'classic Travis',f:(b0,b1,t)=>[b0+'+'+t[2],t[1],b1,t[2],b0,t[0],b1,t[1]]},
  {ru:'монотонный бас',en:'monotonic bass',mono:1,f:(b0,b1,t)=>[b0+'+'+t[2],t[1],b0,t[2],b0+'+'+t[1],t[0],b0,t[1]]},
  {ru:'мелодия на слабых долях',en:'melody on the offbeats',f:(b0,b1,t)=>[b0,t[2],b1,t[1],b0,t[2],b1,t[0]]},
  {ru:'щипок на 1 и 3',en:'pinch on 1 and 3',f:(b0,b1,t)=>[b0+'+'+t[2],t[1],b1,t[0],b0+'+'+t[2],t[1],b1,t[0]]},
  {ru:'ролл вверх',en:'upward roll',f:(b0,b1,t)=>[b0,t[0],t[1],t[2],b1,t[0],t[1],t[2]]},
  {ru:'ролл вниз',en:'downward roll',f:(b0,b1,t)=>[b0,t[2],t[1],t[0],b1,t[2],t[1],t[0]]}];
const trp=(c,i)=>TP[i].f(c.b[0],c.b[1],c.t);
const tr=c=>trp(c,0);

// позиции минорной пентатоники: лады относительно тоники на {s:E}
const OPN={E:40,A:45,D:50,G:55,B:59,e:64},STR=['E','A','D','G','B','e'],TOP=['D','G','B','e'];
const PO=[null,
  {E:[0,3],A:[0,2],D:[0,2],G:[0,2],B:[0,3],e:[0,3]},
  {E:[3,5],A:[2,5],D:[2,5],G:[2,4],B:[3,5],e:[3,5]},
  {E:[5,7],A:[5,7],D:[5,7],G:[4,7],B:[5,8],e:[5,7]},
  {E:[7,10],A:[7,10],D:[7,9],G:[7,9],B:[8,10],e:[7,10]},
  {E:[10,12],A:[10,12],D:[9,12],G:[9,12],B:[10,12],e:[10,12]}];
const pbox=(f,p,wrap=1)=>{const o=PO[p],mx=Math.max(...STR.map(s=>o[s][1]))+f,d=wrap&&mx>17?-12:0,X={};STR.forEach(s=>X[s]=o[s].map(a=>a+f+d));return X;};
const nts=(X,ss)=>ss.flatMap(s=>X[s].map(a=>s+a));
const pit=t=>{const m=/^([EADGBe])[hp]?(\d+)/.exec(t);return OPN[m[1]]+ +m[2];};
const pcF=(R)=>t=>((pit(t)-R)%12+12)%12;
const frets=X=>{const a=STR.flatMap(s=>X[s]);return [Math.min(...a),Math.max(...a)];};
const posL=(X,p,ru)=>{const [lo,hi]=frets(X);return ru?`позиция ${p}, ${lo?`лады ${lo}–${hi}`:'открытая'}`:`position ${p}, ${lo?`frets ${lo}–${hi}`:'open'}`;};
const ups=a=>a.slice().reverse();
const lg=a=>a.map((t,i)=>{const p=a[i-1];if(!p||t==='.'||p==='.'||p[0]!==t[0])return t;return t[0]+(pit(t)>pit(p)?'h':'p')+t.slice(1);});

/* A16 Трэвис */
const a16=(k,i)=>{const c=S[k.I],c2=S[k.IV],b0=c.b[0],b1=TP[i].mono?b0:c.b[1],[t0,t1,t2]=c.t,P=x=>trp(x,i);return[
  J(`${b0}:2 ${b1}:2 ${b0}:2 ${b1}:2`,'|',`${b0}:2 ${b1}:2 ${b0}:2 ${b1}:2`),
  J(`${b0}+${t2}:2 ${b1}:2 ${b0}+${t1}:2 ${b1}:2`,'|',`${b0}+${t2}:2 ${b1}:2 ${b0}:2 ${b1}+${t0}:2`),
  J(...P(c),'|',...P(c)),
  [J(...P(c),'|',...P(c2)),J(...P(c2),'|',...P(c))],
  [J('/3',swp(P(c)),'|',swp(P(c2))),J('/3',swp(P(c2)),'|',swp(P(c)))]];};
add('A16',16,2,
 {name:'Трэвис-пикинг',goal:'Независимый большой палец: бас ровно, мелодия сверху.',how:'Большой палец держит бас на каждую долю, указательный и средний щиплют верхние струны. Вариант задаёт паттерн правой руки: классический Трэвис, монотонный бас, мелодия на слабых долях, щипок, роллы. Аккорд держится весь такт. Сначала только бас, потом добавляй верх.',tip:'Если бас сбивается, когда вступают пальцы, — убери верх и вернись к басу. Послушай Мерла Трэвиса и Миссисипи Джона Хёрта.',lvl:['Бас большим пальцем','Щипок: бас вместе с верхней нотой','Полный паттерн','Смена аккорда: I и IV','Паттерн в шаффле']},
 {name:'Travis picking',goal:'An independent thumb: steady bass, melody on top.',how:'The thumb keeps the bass on every beat, the index and middle fingers pluck the top strings. The variant sets the picking pattern: classic Travis, monotonic bass, melody on the offbeats, pinches, rolls. Hold the chord for the whole bar. Bass only first, then add the top.',tip:'If the bass stumbles when the fingers come in, drop the top and go back to the bass. Listen to Merle Travis and Mississippi John Hurt.',lvl:['Thumb bass','Pinch: bass together with a top note','Full pattern','Chord change: I and IV','Pattern in a shuffle']},
 K.map((k,i)=>[`${cn(k.I)} и ${cn(k.IV)}: ${TP[i].ru}`,`${cn(k.I)} and ${cn(k.IV)}: ${TP[i].en}`,a16(k,i)]));

/* A17 минорная пентатоника с бурдоном: открытая басовая струна, позиции вверх по грифу */
const a17=(X,d)=>{const N=nts(X,TOP),lo=s=>s+X[s][0],hi=s=>s+X[s][1],sp=(s,h)=>s+h+X[s][h==='p'?0:1];
  const l4a=J('/3',...['e','B','G','D'].map((s,i,a)=>i<3?`${d}+${hi(s)} ${sp(s,'p')} ${hi(a[i+1])}`:`${d}+${hi(s)} ${sp(s,'p')}:2`)),
    l4b=J('/3',...TOP.map((s,i)=>i<3?`${d}+${lo(s)} ${sp(s,'h')} ${sp(s,'p')}`:`${d}+${lo(s)} ${sp(s,'h')}:2`));
  const bs=['G','B','e','D'].find(s=>X[s][1]-X[s][0]===2),bi=N.indexOf(lo(bs)),BN=`${lo(bs)}b${X[bs][1]}r${X[bs][0]}`;
  return [
  [J(...nts(X,STR)),J(...ups(nts(X,STR)))],
  [J(...N.flatMap(x=>[d,x])),J(...ups(N).flatMap(x=>[d,x]))],
  [J('/3',...[5,6,5,4,3,2,1,0].map(i=>`${d}:2 ${N[i]}`)),J('/3',...[7,6,5,4,3,4,3,1].map(i=>`${d}:2 ${N[i]}`))],
  [l4a,l4b],
  [J('/3',`${d}+${BN}:2`,N[Math.max(bi-1,0)],`${d}+${N[3]}:2`,N[2],`${d}+${N[1]}:2`,N[0],`${d}+${N[2]}~:3`),l4a,l4b.replace(/:2$/,'~:2')]];};
const V17=[{n:'{E}',f:0,p:1,d:'E0'},{n:'{E}',f:0,p:2,d:'E0'},{n:'{A}',f:5,p:1,d:'A0'},{n:'{E}',f:0,p:3,d:'E0'},{n:'{A}',f:5,p:2,d:'A0'},{n:'{E}',f:0,p:4,d:'E0'}];
add('A17',17,2,
 {name:'Пентатоника с бурдоном',goal:'Мелодия на верхних струнах поверх ровного баса, как в дельта-блюзе.',how:'Большой палец бьёт открытую басовую струну на каждую долю, пальцы играют мелодию минорной пентатоники между ударами. Вариант задаёт позицию пентатоники: бурдон тот же, а рука уходит вверх по грифу.',tip:'Бурдон тише мелодии, но не пропадает. Так играли Сон Хаус и Чарли Паттон: бас как барабан.',lvl:['Гамма вверх и вниз','Бурдон на каждую долю','Свинг','Легато в триолях','Бенд, вибрато, три фразы']},
 {name:'Pentatonic over a drone',goal:'A melody on the top strings over a steady bass, delta blues style.',how:'The thumb hits an open bass string on every beat, the fingers play a minor pentatonic melody between the hits. The variant sets the pentatonic position: the drone stays, the hand moves up the neck.',tip:'The drone is quieter than the melody but never drops out. Son House and Charley Patton played like this: the bass is the drum.',lvl:['Scale up and down','Drone on every beat','Swing','Legato in triplets','Bend, vibrato, three phrases']},
 V17.map(v=>{const X=pbox(v.f,v.p);return [`${v.n}m, ${posL(X,v.p,1)}`,`${v.n}m, ${posL(X,v.p,0)}`,a17(X,v.d)];}));

/* A18 мажорная пентатоника: позиции вверх по грифу над открытым басом */
const a18=(X,d,R)=>{const N=nts(X,TOP),pc=pcF(R),at=i=>N[Math.max(0,Math.min(7,i))],i3=N.findIndex(t=>pc(t)===4),T3=N[i3],b3=T3[0]+(+T3.slice(1)-1),h3=T3[0]+'h'+T3.slice(1);
  const i2=N.findIndex((t,i)=>i>0&&pc(t)===2&&t[0]!=='D'),B2=N[i2],f2=+B2.slice(1),BN=`${B2}b${f2+2}r${f2}`;
  const s1=J('/3',`${d}+${b3}`,h3,at(i3+1),`${d}+${at(i3+2)}`,at(i3+1),T3,`${d}+${b3}`,h3,at(i3-1),`${d}+${at(i3-2)}:3`),
    s2=J('/3',`${d}+${N[7]}`,N[6],N[5],`${d}+${N[4]}`,N[3],N[2],`${d}+${b3}`,h3,at(i3-1),`${d}+${T3}~:3`);
  return [
  [J(...nts(X,STR)),J(...ups(nts(X,STR)))],
  [J(...N.flatMap(x=>[d,x])),J(...ups(N).flatMap(x=>[d,x]))],
  [J('/3',...[b3,T3,at(i3+1),at(i3+2),at(i3+1),T3,at(i3-1),at(i3-2)].map(x=>`${d}:2 ${x}`))],
  [s1,s2],
  [J(s1,'|',s2),J('/3',`${d}+${BN}:2`,at(i2-1),`${d}+${b3}`,h3,at(i3+1),`${d}+${T3}`,at(i3-1),at(i3-2),`${d}+${T3}~:3`)]];};
const V18=[{n:'{E}',f:9,p:1,d:'E0',R:40},{n:'{A}',f:2,p:1,d:'A0',R:45},{n:'{E}',f:9,p:4,d:'E0',R:40},{n:'{A}',f:2,p:2,d:'A0',R:45},{n:'{E}',f:9,p:5,d:'E0',R:40},{n:'{A}',f:2,p:3,d:'A0',R:45}];
const fretL=(X,ru)=>{const [lo,hi]=frets(X);return ru?`лады ${lo}–${hi}`:`frets ${lo}–${hi}`;};
add('A18',18,2,
 {name:'Мажорная пентатоника',goal:'Светлый кантри-блюз: мажор с переходом из малой терции в большую.',how:'Мажорная пентатоника над открытой басовой струной. Вариант задаёт место на грифе: одна и та же гамма в разных позициях. С третьего уровня малая терция хаммером переходит в большую — главный звук мажорного блюза.',tip:'Малая терция только проходит в большую, не застревай на ней. Ориентир — Блайнд Блейк и Элизабет Коттен.',lvl:['Гамма вверх и вниз','Бас на каждую долю','Свинг, терция с подходом','Хаммер из малой терции в большую','Две фразы подряд, бенд']},
 {name:'Major pentatonic',goal:'Bright country blues: major with the minor third moving to the major third.',how:'Major pentatonic over an open bass string. The variant sets the place on the neck: the same scale in different positions. From level 3 the minor third hammers into the major third, the main sound of major blues.',tip:'The minor third only passes into the major one, do not get stuck on it. Think Blind Blake and Elizabeth Cotten.',lvl:['Scale up and down','Bass on every beat','Swing, approaching the third','Hammer-on from the minor to the major third','Two phrases in a row, bend']},
 V18.map(v=>{const X=pbox(v.f,v.p);return [`${v.n}, ${fretL(X,1)}`,`${v.n}, ${fretL(X,0)}`,a18(X,v.d,v.R)];}));

/* пары струн: G→D, B→G, e→B (те же ноты на струну ниже, o=-12 — на октаву ниже) */
const SHD={G:['D',5],B:['G',4],e:['B',5]};
const dn=(t,o)=>typeof t!=='string'?t.map(x=>dn(x,o)):t.replace(/(^|[\s+])([GBe])([hpt]?)(\d+)(?:b(\d+))?(?:r(\d+))?/g,(m,a,s,h,f,b,r)=>{const [s2,dd]=SHD[s],x=dd+o;return a+s2+h+(+f+x)+(b?'b'+(+b+x):'')+(r?'r'+(+r+x):'');});

/* A19 сексты и терции */
const a19=(k,r)=>{const P=(g,e)=>`G${k+g}+e${k+e}`,T=(g,b)=>`G${k+g}+B${k+b}`,b='E'+r;
  const P0=P(0,0),P1=P(2,1),P2=P(4,3),P3=P(5,5),Pm=P(-2,-2),Pa=P(-1,-1),Pah=`Gh${k}+eh${k}`,T0=T(0,0),T1=T(2,1),T2=T(4,3);
  return [
  J(`${P0}:2 ${P1}:2 ${P2}:2 ${P1}:2`,'|',`${P0}:2 ${Pm}:2 ${P0}:4`),
  J(`${Pa} ${P0}:3 ${P1}:2 ${P2}:2`,'|',`${P3} ${P2} ${P1}:2 ${P0}:4`),
  [J('/3',`${T0}:2 ${T1}`,`${T2}:2 ${T1}`,`${P1}:2 ${P0}`,`${Pm}:2 ${P0}`),J('/3',`${P0}:2 ${P1}`,`${P2}:2 ${P3}`,`${P2}:2 ${P1}`,`${P0}:3`)],
  J(`${b}+${P0}:2 ${P1} ${P2} ${b}+${P1}:2 ${P0}:2`,'|',`${b}+${Pa} ${P0}:3 ${b}+${Pm}:2 ${P0}:2`),
  [J('/3',`${b}+${Pa}:2`,Pah,`${P1}:2`,P2,`${b}+${P1}:2`,P0,`${P0}:3`),J('/3',`${b}:2`,T0,`${T1}:2`,T2,`${b}+${Pa}:2`,Pah,`${b}+${P0}~:3`)]];};
// o: null — {s:G}–{s:e}, число — {s:D}–{s:B} со сдвигом
const V19=[{k:0,o:-12},{k:1,o:null},{k:2,o:-12},{k:3,o:null},{k:4,o:0},{k:5,o:null}];
add('A19',19,2,
 {name:'Сексты и терции',goal:'Двойные ноты: сладкий звук соул- и мемфис-блюза.',how:'Сексты на двух струнах через одну, терции на соседних. Вариант задаёт пару струн: верхняя пара звучит ярко, средняя — теплее и ближе к голосу. Средняя струна в секстах глушится подушечкой пальца. Каждая пара звучит как одна нота.',tip:'Обе ноты пары одинаково громкие. Подход на лад ниже — вместо слайда, мягко.',lvl:['Сексты четвертями','Подход на лад ниже','Терции и сексты в свинге','Бас под секстами','Хаммер в сексту, две фразы']},
 {name:'Sixths and thirds',goal:'Double stops: the sweet sound of soul and Memphis blues.',how:'Sixths on two strings with one string skipped, thirds on adjacent strings. The variant sets the string pair: the top pair sounds bright, the middle one warmer and closer to a voice. In the sixths mute the middle string with the pad of a finger. Each pair sounds like a single note.',tip:'Both notes of a pair equally loud. The approach from a fret below replaces a slide: keep it soft.',lvl:['Sixths in quarters','Approach from a fret below','Thirds and sixths in swing','Bass under the sixths','Hammer into the sixth, two phrases']},
 V19.map(({k:i,o})=>{const k=K[i],t=a19(k.m,k.f);return o==null?[`${k.n}: сексты на {s:G} и {s:e}`,`${k.n}: sixths on {s:G} and {s:e}`,t]:[`${k.n}: сексты на {s:D} и {s:B}`,`${k.n}: sixths on {s:D} and {s:B}`,t.map(x=>dn(x,o))];}));

/* A20 шаффл-бас: фигура такта — 4 доли по паре [долгая, короткая] */
const bg=(s,r)=>{const n=NX[s];return {n5:`${s}${r}+${n}${r+2}`,n6:`${s}${r}+${n}${r+4}`,n7:`${s}${r}+${n}${r+5}`,nb6:`${s}${r}+${n}${r+3}`,r:s+r,n};};
const SF=[
  {ru:'квинта–секста',en:'fifth–sixth',f:x=>[x.n5,x.n5,x.n5,x.n5,x.n6,x.n6,x.n6,x.n6]},
  {ru:'квинта–секста–септима',en:'fifth–sixth–seventh',f:x=>[x.n5,x.n5,x.n6,x.n6,x.n7,x.n7,x.n6,x.n6]},
  {ru:'буги-линия',en:'boogie line',f:(x,s,r)=>[x.r,s+(r+4),x.n+(r+2),x.n+(r+4),x.n+(r+5),x.n+(r+4),x.n+(r+2),s+(r+4)]},
  {ru:'глушёный шаффл с акцентом',en:'muted shuffle with accents',f:x=>[x.n5+'m',x.n5+'m',x.n6,x.n6+'m',x.n5+'m',x.n5+'m',x.n7,x.n6+'m']},
  {ru:'спуск септима–секста–квинта',en:'seventh–sixth–fifth descent',f:x=>[x.n7,x.n7,x.n6,x.n6,x.nb6,x.nb6,x.n5,x.n5]},
  {ru:'бас и аккорд',en:'bass and chord',f:x=>[x.r,x.n5,x.r,x.n6,x.r,x.n7,x.r,x.n6]}];
const fg=(i,s,r)=>SF[i].f(bg(s,r),s,r),fig=(i,s,r)=>swp(fg(i,s,r)),figq=(i,s,r)=>fg(i,s,r).filter((x,j)=>!(j%2)).map(x=>x+':3').join(' ');
const a20=([s,r],i)=>{const I=fig(i,s,r),IV=fig(i,NX[s],r),V=fig(i,NX[s],r+2);return [
  J(figq(i,s,r),'|',figq(i,s,r)),
  J(I,'|',I),
  J(I,'|',IV),
  [J(I,'|',IV),J(V,'|',I)],
  [J(I,'|',IV,'|',I,'|',I),J(IV,'|',IV,'|',I,'|',I),J(V,'|',IV,'|',I,'|',V)]];};
add('A20',20,3,
 {name:'Шаффл-бас',goal:'Бугги большим пальцем: тоника, квинта, секста, септима.',how:'Тоника — открытая или прижатая струна, сверху соседняя струна ведёт фигуру. Вариант задаёт фигуру: квинта–секста, с септимой, буги-линия одной нотой, глушёный шаффл, нисходящий спуск, бас и аккорд по очереди. Шаффл: долгая-короткая. Ладонь слегка глушит струны у подставки.',tip:'Ровный шаффл важнее скорости. Это рука Джимми Рида и Лайтнина Хопкинса.',lvl:['Фигура четвертями','Шаффл','Смена на IV','I, IV и V','Весь 12-тактовый квадрат']},
 {name:'Shuffle bass',goal:'Thumb boogie: root, fifth, sixth, seventh.',how:'The root on an open or fretted string, the next string carries the figure. The variant sets the figure: fifth–sixth, with the seventh, a single-note boogie line, a muted shuffle, a descent, bass and chord in turn. Shuffle: long-short. The palm lightly mutes the strings at the bridge.',tip:'A steady shuffle matters more than speed. This is the right hand of Jimmy Reed and Lightnin’ Hopkins.',lvl:['Figure in quarters','Shuffle','Change to the IV chord','I, IV and V','The whole 12-bar form']},
 K.map((k,i)=>[`${k.n}: ${SF[i].ru}`,`${k.n}: ${SF[i].en}`,a20(k.bs,i)]));

/* A21 гармонические ходы Трэвисом */
const PR=[['C','A7','D7','G7'],['G','E7','A7','D7'],['D','B7','E7','A7'],['E7','A7','B7','E7'],['A7','D7','E7','A7'],['G7','C7','D7','G7']];
const a21=cs=>{const [c1,c2,c3,c4]=cs.map(c=>S[c]),bas=c=>`${c.b[0]}:2 ${c.b[1]}:2 ${c.b[0]}:2 ${c.b[1]}:2`,pin=c=>`${c.b[0]}+${c.t[2]}:2 ${c.b[1]}:2 ${c.b[0]}+${c.t[1]}:2 ${c.b[1]}:2`;
  const h=c=>tr(c).slice(0,4);return [
  [J(bas(c1),'|',bas(c2)),J(bas(c3),'|',bas(c4))],
  [J(pin(c1),'|',pin(c2)),J(pin(c3),'|',pin(c4))],
  [J(...tr(c1),'|',...tr(c2)),J(...tr(c3),'|',...tr(c4))],
  [J(...tr(c1),'|',...tr(c2)),J(...h(c3),...h(c4),'|',...tr(c1))],
  [J('/3',swp(tr(c1)),'|',swp(tr(c2))),J('/3',swp(h(c3).concat(h(c4))),'|',swp(tr(c1)))]];};
add('A21',21,2,
 {name:'Ходы аккордов Трэвисом',goal:'Держать Трэвис-паттерн через смену аккордов.',how:'Четыре аккорда хода, по такту на каждый. Бас переходит на новый аккорд ровно на долю, без паузы. Рэгтайм-круг (I–VI–II–V) и блюзовый ход I–IV–V.',tip:'Пальцы левой руки ставь заранее, во время последней восьмой. Ориентир — Рев. Гари Дэвис и Блайнд Блейк.',lvl:['Только бас','Бас и щипок','Трэвис на каждом аккорде','Два аккорда в такте','Свинг, два аккорда в такте']},
 {name:'Chord moves with Travis',goal:'Keep the Travis pattern going through chord changes.',how:'Four chords, one bar each. The bass moves to the new chord right on the beat, with no gap. A ragtime circle (I–VI–II–V) and a blues I–IV–V move.',tip:'Place the fretting fingers early, during the last eighth. Think Rev. Gary Davis and Blind Blake.',lvl:['Bass only','Bass and pinch','Travis on every chord','Two chords per bar','Swing, two chords per bar']},
 PR.map((p,i)=>[(i<3?'Рэгтайм: ':'Блюз: ')+p.map(cn).join(' '),(i<3?'Ragtime: ':'Blues: ')+p.map(cn).join(' '),a21(p)]));

/* A22 бой: вариант — смена аккордов (I–IV или I–V) */
const a22=(c,c2)=>{const F=c.full,T=c.top,X=c.x,F2=c2.full,T2=c2.top,X2=c2.x,[b0,b1]=c.b;return [
  J(`${F}:2 ${F}:2 ${F}:2 ${F}:2`,'|',`${F2}:2 ${F2}:2 ${F2}:2 ${F2}:2`),
  J('/3',`${F}:2 ${T} ${F}:2 ${T} ${F}:2 ${T} ${F}:2 ${T}`,'|',`${F2}:2 ${T2} ${F2}:2 ${T2} ${F2}:2 ${T2} ${F2}:2 ${T2}`),
  J('/3',`${F}:2 ${T} ${X}:2 ${T} ${F}:2 ${T} ${X}:2 ${T}`,'|',`${F2}:2 ${T2} ${X2}:2 ${T2} ${F2}:2 ${T2} ${X2}:2 ${T2}`),
  [J('/3',`${b0}:2 ${T} ${X}:2 ${T} ${b1}:2 ${T} ${X}:2 ${T}`,'|',`${c2.b[0]}:2 ${T2} ${X2}:2 ${T2} ${c2.b[1]}:2 ${T2} ${X2}:2 ${T2}`)],
  [J('/3',`${b0}:2 ${T} ${X}:2 ${T} ${b1}:2 ${T} ${X}:2 ${F2}`,'|',`${X2}:2 ${T2} ${X2}:2 ${T2} ${c2.b[1]}:2 ${T2} ${X2}:2 ${F}`),
   J('/3',`${X}:2 ${T} ${b1}:2 ${T} ${b0}:2 ${T} ${X}:2 ${T}`)]];};
const P22=[['E7','A7','I–IV'],['A7','E7','I–V'],['G7','C7','I–IV'],['C7','G7','I–V'],['D7','G7','I–IV'],['E7','B7','I–V']];
add('A22',22,2,
 {name:'Бой и чак',goal:'Ритм-гитара на акустике: аккорд, глушёный удар, бас.',how:'Удар вниз по всему аккорду, вверх — по верхним струнам. Чак — удар по струнам, приглушённым ребром ладони, звучит как малый барабан. С четвёртого уровня — бас и аккорд по очереди (бум-чак). Вариант задаёт смену: на IV или на V ступень, с другой аппликатурой второго аккорда.',tip:'Кисть свободная, движение вверх-вниз не останавливается даже на паузах. Ориентир — Биг Билл Брунзи.',lvl:['Аккорд четвертями','Свинг вниз-вверх','Чак на 2 и 4','Бас и аккорд по очереди','Опережение: аккорд до сильной доли']},
 {name:'Strumming and chuck',goal:'Rhythm guitar on an acoustic: chord, muted hit, bass.',how:'A downstroke over the whole chord, an upstroke over the top strings. The chuck is a hit on strings muted with the edge of the palm, it sounds like a snare. From level 4 bass and chord take turns (boom-chuck). The variant sets the change: to the IV or the V chord, with a different second shape.',tip:'Keep the wrist loose: the down-up motion never stops, even on rests. Think Big Bill Broonzy.',lvl:['Chord in quarters','Swing down-up','Chuck on 2 and 4','Bass and chord in turn','Push: the chord before the downbeat']},
 P22.map(([a,b,f])=>[`${cn(a)} → ${cn(b)} (${f})`,`${cn(a)} → ${cn(b)} (${f})`,a22(S[a],S[b])]));

/* A23 тёрнэраунды: вид линии под педалью */
const TL=[
  {ru:'вниз по {s:G}',en:'down the {s:G} string',l:(o,j)=>`G${o+4-j}`},
  {ru:'вверх по {s:G}',en:'up the {s:G} string',l:(o,j)=>`G${o+1+j}`},
  {ru:'вниз по {s:B}',en:'down the {s:B} string',l:(o,j)=>`B${o+3-j}`},
  {ru:'терциями вниз',en:'thirds going down',l:(o,j)=>`G${o+4-j}+B${o+3-j}`},
  {ru:'вверх по {s:B}',en:'up the {s:B} string',l:(o,j)=>`B${o+j}`},
  {ru:'терциями вверх',en:'thirds going up',l:(o,j)=>`G${o+1+j}+B${o+j}`}];
const ta=(o,V,li,l2)=>{const d=`e${o}`,g=j=>TL[li].l(o,j),g2=j=>TL[l2==null?(li+1)%6:l2].l(o,j),R4=f=>[0,1,2,3].map(f).join(' ');return {
  q:R4(j=>`${g(j)}+${d}:3`),t:R4(j=>`${d} ${g(j)} ${d}`),b:R4(j=>`E${o}+${g(j)} ${d} ${g(j)}`),bB:R4(j=>`E${o}+${g2(j)}+${d} ${d} ${g2(j)}`),
  end:`E${o}:6 ${V}:6`,end2:`E${o}:3 ${V}:3 .:6`,end3:`E${o}:2 G${o} Gh${o+1}:3 ${V}:6`};};
const a23=(o,V,i)=>{const x=ta(o,V,i);return [
  J(x.q,'|',x.end),J(x.t,'|',x.end2),J(x.b,'|',x.end2),J(x.b,'|',x.end3),[J(x.b,'|',x.end3),J(x.bB,'|',x.end3)]];};
add('A23',23,3,
 {name:'Тёрнэраунд',goal:'Классический блюзовый разворот в конце квадрата.',how:'Верхняя струна звучит открыто или прижатой как педаль, под ней хроматическая линия. Вариант задаёт линию: вниз или вверх, по одной струне или терциями. Во втором такте — тоника и V7. Триоли — медленный блюзовый счёт.',tip:'Педальная нота не глохнет под линией. Такой разворот есть почти у каждого дельта-блюзмена, от Роберта Джонсона до Скипа Джеймса.',lvl:['Линия четвертями','Триоли','Бас под линией','Хаммер-подхват к V7','Два тёрнэраунда подряд']},
 {name:'Turnaround',goal:'The classic blues turnaround at the end of the form.',how:'The top string rings open or fretted as a pedal with a chromatic line under it. The variant sets the line: down or up, on one string or in thirds. The second bar is the root and V7. Triplets: the slow blues count.',tip:'The pedal note keeps ringing under the line. Nearly every delta player has this turnaround, from Robert Johnson to Skip James.',lvl:['Line in quarters','Triplets','Bass under the line','Hammer-on pickup into V7','Two turnarounds in a row']},
 K.map((k,i)=>[`${k.n}: ${TL[i].ru}`,`${k.n}: ${TL[i].en}`,a23(k.f,S[k.V].full,i)]));

/* A38 арпеджио p-i-m: порядок пальцев */
const AP=[
  {ru:'вверх и вниз',en:'up and down',o:[0,1,2,3,2,1]},
  {ru:'вниз и вверх',en:'down and up',o:[0,3,2,1,2,3]},
  {ru:'через струну',en:'skipping a string',o:[0,1,3,2,3,1]},
  {ru:'со средней струны',en:'from the middle string',o:[0,2,1,3,1,2]},
  {ru:'вверх с возвратом',en:'up and back in',o:[0,1,2,3,1,2]},
  {ru:'с верха внутрь',en:'from the top inward',o:[0,3,1,2,1,3]}];
const a38=(c,c2,c5,i)=>{const arp=(x,b)=>AP[i].o.map(j=>j?x.t[j-1]:b),bar=x=>J(...arp(x,x.b[0]),...arp(x,x.b[1]));return [
  J(`${c.b[0]}:3 ${c.t[0]}:3 ${c.t[1]}:3 ${c.t[2]}:3`,'|',`${c.b[1]}:3 ${c.t[0]}:3 ${c.t[1]}:3 ${c.t[2]}:3`),
  J(...arp(c,c.b[0]),...arp(c,c.b[0]),'|',bar(c)),
  J(bar(c),'|',bar(c)),
  [J(bar(c),'|',bar(c2)),J(bar(c2),'|',bar(c))],
  [J(bar(c),'|',bar(c2)),J(bar(c5),'|',...arp(c,c.b[0]),`${c.full}~:6`)]];};
add('A38',38,3,
 {name:'Арпеджио септаккорда',goal:'Аккорд по одной ноте: большой палец, указательный, средний, безымянный.',how:'Большой палец на басу, дальше пальцы по одному на струну. Вариант задаёт порядок пальцев: вверх-вниз, вниз-вверх, через струну и другие. Триоли — счёт медленного блюза в 12/8. Аккорд держится, ноты тянутся друг под другом.',tip:'Одинаковая громкость всех пальцев. Безымянный обычно тише — следи за ним.',lvl:['Четвертями вверх','Паттерн триолями','Бас чередуется','Смена аккорда','I, IV, V и финальный аккорд']},
 {name:'Seventh chord arpeggio',goal:'A chord one note at a time: thumb, index, middle, ring.',how:'The thumb on the bass, then one finger per string. The variant sets the finger order: up-down, down-up, skipping a string and more. Triplets: the slow 12/8 blues count. Hold the chord and let the notes ring into each other.',tip:'All fingers equally loud. The ring finger is usually weaker: watch it.',lvl:['Quarters, upward','The pattern in triplets','Alternating bass','Chord change','I, IV, V and a final chord']},
 K.map((k,i)=>[`${cn(k.I)}, ${cn(k.IV)}, ${cn(k.V)}: ${AP[i].ru}`,`${cn(k.I)}, ${cn(k.IV)}, ${cn(k.V)}: ${AP[i].en}`,a38(S[k.I],S[k.IV],S[k.V],i)]));

/* A39 вызов-ответ: рифф и ответ в первой позиции (лады от тоники) */
const off=(s,f)=>s.split(' ').map(t=>t==='.'?t:t[0]+(f+ +t.slice(1)));
const CL=[
  {ru:'рифф с повтором',en:'repeated-note riff',c:'E0 E0 E3 A0 A2 A0 E3 E0',r:'G2 G0 B3 B0 e0 B3 G2 G0'},
  {ru:'рифф с блюзовой нотой',en:'riff with the blue note',c:'E0 E3 A0 A1 A2 A0 E3 E0',r:'G0 G2 B3 B0 G2 G0 D2 D0'},
  {ru:'рифф с паузами',en:'riff with rests',c:'E0 . E0 E3 A0 . A2 A0',r:'G2 B0 B3 e0 e3 e0 B3 B0'},
  {ru:'тоника и квинта',en:'root and fifth',c:'E0 A2 E0 A2 E3 A2 A0 E3',r:'e3 e0 B3 B0 G2 G0 D2 D0'},
  {ru:'нисходящий рифф',en:'descending riff',c:'A2 A0 E3 E0 A2 A0 E3 E0',r:'B3 B0 G2 G0 G2 G0 D2 D0'},
  {ru:'спуск через блюзовую ноту',en:'descent through the blue note',c:'E0 E3 A0 A2 A1 A0 E3 E0',r:'e0 B3 e0 B3 G2 B0 G0 D2'}];
const a39=(f,i)=>{const C=off(CL[i].c,f),R=off(CL[i].r,f),C2=off(CL[(i+1)%6].c,f),Rb=R.map((x,j)=>j%2?x:`E${f}+${x}`);
  const sw=(a,b)=>J('/3',swp(a),'|',swp(b));return [
  J(...C,'|',...R),
  sw(C,R),
  sw(C,lg(R)),
  [sw(C,R),sw(C2,lg(R))],
  [sw(C,Rb),sw(C2,lg(R))]];};
add('A39',39,2,
 {name:'Вызов и ответ',goal:'Бас задаёт фразу, верх отвечает — как два голоса в одной гитаре.',how:'Такт басового риффа большим пальцем, потом такт ответа пальцами на верхних струнах. Вариант задаёт рифф и ответ. На пятом уровне бас продолжает звучать под ответом.',tip:'Ответ — это реплика, а не гамма: фразируй, как будто поёшь. Ориентир — Мадди Уотерс на акустике и Ледбелли.',lvl:['Рифф и ответ','Свинг','Легато в ответе','Четыре такта: два риффа','Бас под ответом']},
 {name:'Call and response',goal:'The bass states a phrase and the top answers: two voices in one guitar.',how:'A bar of bass riff with the thumb, then a bar of answer with the fingers on the top strings. The variant sets the riff and the answer. On level 5 the bass keeps sounding under the answer.',tip:'The answer is a line of speech, not a scale: phrase it as if singing. Think acoustic Muddy Waters and Lead Belly.',lvl:['Riff and answer','Swing','Legato in the answer','Four bars: two riffs','Bass under the answer']},
 K.map((k,i)=>[`${k.n}m: ${CL[i].ru}`,`${k.n}m: ${CL[i].en}`,a39(k.f,i)]));

/* L24 легато в позиции: вариант — позиция пентатоники */
const l24=x=>{const hm=s=>[s+x[s][0],s+'h'+x[s][1]],pl=s=>[s+x[s][1],s+'p'+x[s][0]],hp=s=>[s+x[s][0],s+'h'+x[s][1],s+'p'+x[s][0]],tl=s=>[s+x[s][0],s+'h'+x[s][1],s+'p'+x[s][0],s+'h'+x[s][1]];
  const u4=['D','G','B','e'],d4=['e','B','G','D'],u6=STR;return [
  [J(...u4.flatMap(hm)),J(...d4.flatMap(hm))],
  [J(...d4.flatMap(pl)),J(...u4.flatMap(pl))],
  [J('/3',...u4.flatMap(hp)),J('/3',...d4.flatMap(hp))],
  [J('/3',...u6.flatMap(hp)),J('/3',...u6.slice().reverse().flatMap(hp))],
  [J('/4',...d4.flatMap(tl)),J('/4',...u4.flatMap(tl))]];};
const PV=[{n:'{E}',f:0,p:1},{n:'{A}',f:5,p:2},{n:'{G}',f:3,p:3},{n:'{C}',f:8,p:4},{n:'{D}',f:10,p:5},{n:'{B}',f:7,p:1}];
add('L24',24,2,
 {name:'Хаммеры и пулл-оффы',goal:'Ровное легато левой рукой в позиции пентатоники.',how:'Правая рука играет только первую ноту на струне, вторая звучит от хаммера или пулл-оффа. Вариант задаёт позицию пентатоники: у каждой своя аппликатура и свои растяжки. В открытой позиции пулл-офф уходит на открытую струну.',tip:'Нота от легато звучит так же громко, как щипок. Пулл-офф — щипок пальцем левой руки вниз, а не просто снять палец.',lvl:['Хаммеры на четырёх струнах','Пулл-оффы','Хаммер и пулл-офф триолями','Все шесть струн','Трель шестнадцатыми']},
 {name:'Hammer-ons and pull-offs',goal:'Even left-hand legato in a pentatonic position.',how:'The right hand plays only the first note on each string, the second comes from a hammer-on or pull-off. The variant sets the pentatonic position: each has its own fingering and stretches. In open position the pull-off goes to the open string.',tip:'A legato note is as loud as a plucked one. A pull-off is a pluck downward with the fretting finger, not just lifting it.',lvl:['Hammer-ons on four strings','Pull-offs','Hammer-on and pull-off in triplets','All six strings','Trill in sixteenths']},
 PV.map(v=>{const X=pbox(v.f,v.p);return [`${v.n}m, ${posL(X,v.p,1)}`,`${v.n}m, ${posL(X,v.p,0)}`,l24(X)];}));

/* ноты пентатоники в позиции для бендов и вибрато */
const VB=[{n:'{E}',f:0,p:1,d:'E0',R:40},{n:'{A}',f:5,p:1,d:'A0',R:45},{n:'{E}',f:0,p:2,d:'E0',R:40},{n:'{A}',f:5,p:2,d:'A0',R:45},{n:'{E}',f:0,p:3,d:'E0',R:40},{n:'{A}',f:5,p:3,d:'A0',R:45}];
const pn=(X,R)=>{const N=nts(X,TOP),pc=pcF(R),fd=(p,ss)=>{for(const s of ss)for(const a of X[s])if(pc(s+a)===p)return s+a;},
  dk=(t,k)=>N[Math.max(0,N.indexOf(t)-k)],fr=t=>+t.slice(1),
  bnd=(t,st,rel)=>`${t}b${fr(t)+st}`+(rel?`r${fr(t)}`:'');
  return {N,dk,bnd,F4:fd(5,['G','B','e','D']),F5:fd(7,['G','B','D','e']),B7:fd(10,['G','B','D','e']),R3:fd(3,['B','e','G','D']),R:fd(0,['B','G','e','D'])};};

/* L25 бенды */
const l25=(X,d,R)=>{const {dk,bnd,F4,B7,R3}=pn(X,R),H=`${F4[0]}${+F4.slice(1)+1}b${+F4.slice(1)+2}`;return [
  [J(`${H}:2 ${dk(F4,1)}:2 ${H}:2 ${F4}:2`),J(`${H}:2 ${F4}:2 ${dk(F4,1)}:2 ${dk(F4,2)}:2`)],
  J(`${bnd(F4,2)}:2 ${dk(F4,1)}:2 ${bnd(B7,2)}:2 ${dk(B7,1)}:2`,'|',`${bnd(R3,2)}:2 ${dk(R3,1)}:2 ${bnd(F4,2)}:4`),
  J(`${bnd(F4,2,1)}:2 ${dk(F4,1)}:2 ${bnd(B7,2,1)}:2 ${dk(B7,1)}:2`,'|',`${bnd(R3,2,1)}:2 ${dk(R3,1)}:2 ${dk(F4,1)}:4`),
  [J('/3',`${bnd(F4,2,1)}:2 ${dk(F4,1)} ${dk(F4,2)}:2 ${dk(F4,3)} ${bnd(B7,2,1)}:2 ${dk(B7,1)} ${dk(B7,2)}:3`),J('/3',`${bnd(R3,2,1)}:2 ${dk(R3,1)} ${F4}:2 ${dk(F4,1)} ${bnd(B7,2,1)}:2 ${dk(B7,1)} ${dk(B7,2)}:3`)],
  [J('/3',`${d}+${bnd(F4,2,1)}:2 ${dk(F4,1)} ${d}+${dk(F4,2)}:2 ${dk(F4,3)} ${d}+${bnd(B7,2,1)}:2 ${dk(B7,1)} ${d}+${dk(B7,2)}~:3`),J('/3',`${d}+${bnd(R3,2,1)}:2 ${dk(R3,1)} ${d}+${F4}:2 ${dk(F4,1)} ${d}+${bnd(B7,2)}~:3 ${dk(B7,1)}:3`)]];};
add('L25',25,2,
 {name:'Небольшие бенды',goal:'Точные бенды в полтона и тон на акустических струнах.',how:'Бенд тянут два-три пальца вместе, а не один. Полтона — из блюзовой ноты в квинту, тон — на сильных нотах лада. Вариант задаёт позицию пентатоники: в каждой бенды выпадают на другие струны и пальцы. Возврат — так же медленно, как подтяжка.',tip:'На акустике струны толще: бенд короче и точнее, без четвертей тона. Проверяй высоту по ноте на ладу выше.',lvl:['Бенд в полтона','Бенд в тон','Бенд и возврат','Возврат и спуск по ладу','Бенд над бурдоном, вибрато']},
 {name:'Small bends',goal:'Accurate half and whole-step bends on acoustic strings.',how:'Bend with two or three fingers together, not one. Half-step: from the blue note to the fifth; whole-step: on the strong notes of the scale. The variant sets the pentatonic position: in each one the bends fall on other strings and fingers. Release as slowly as you bend.',tip:'Acoustic strings are heavier: keep bends short and accurate, no quarter tones. Check the pitch against the note one fret up.',lvl:['Half-step bend','Whole-step bend','Bend and release','Release and walk down the scale','Bend over a drone, vibrato']},
 VB.map(v=>{const X=pbox(v.f,v.p);return [`${v.n}m, ${posL(X,v.p,1)}`,`${v.n}m, ${posL(X,v.p,0)}`,l25(X,v.d,v.R)];}));

/* L26 вибрато */
const l26=(X,d,R)=>{const {N,dk,bnd,F4,F5,B7,R3,R:Rt}=pn(X,R),hv=s=>`${s}${X[s][0]} ${s}h${X[s][1]}~:3`;return [
  J(`${F5}~:4 ${B7}~:4`,'|',`${Rt}~:4 ${R3}~:4`),
  J(`${dk(F5,1)} ${F5}~:3 ${dk(Rt,1)} ${Rt}~:3`,'|',`${dk(B7,1)} ${B7}~:3 ${dk(R3,1)} ${R3}~:3`),
  J(hv('G'),hv('B'),'|',hv('D'),hv('G')),
  J(`${bnd(F4,2)}~:4 ${bnd(B7,2)}~:4`,'|',`${bnd(R3,2)}~:4 ${Rt}~:4`),
  [J('/3',`${N[7]}:2 ${N[6]} ${Rt}~:3 ${bnd(F4,2,1)}:2 ${dk(F4,1)} ${R3}~:3`),J('/3',`${N[1]}:2 ${N[2]} ${bnd(B7,2)}~:3 ${dk(B7,1)}:2 ${F5} ${d}+${Rt}~:3`)]];};
add('L26',26,2,
 {name:'Вибрато',goal:'Ровное вибрато: ширина и скорость под контролем.',how:'Длинные ноты с вибрато. Движение от запястья, как поворот ключа, палец только держит струну. Вариант задаёт позицию пентатоники: вибрато на разных струнах и разными пальцами. Вибрато начинается сразу после ноты, а не в конце.',tip:'Сначала медленно и широко, потом уже. Вибрато в такт метроному — ориентир для ровности.',lvl:['Длинные ноты','Подход и вибрато','Хаммер и вибрато','Вибрато на бенде','Фраза в свинге']},
 {name:'Vibrato',goal:'Even vibrato with controlled width and speed.',how:'Long notes with vibrato. The motion comes from the wrist, like turning a key; the finger just holds the string. The variant sets the pentatonic position: vibrato on different strings and with different fingers. Start the vibrato right after the note, not at its end.',tip:'Slow and wide first, then narrower. Vibrato in time with the metronome is a guide to evenness.',lvl:['Long notes','Approach and vibrato','Hammer-on and vibrato','Vibrato on a bend','A phrase in swing']},
 [3,2,1,0,5,4].map(i=>VB[i]).map(v=>{const X=pbox(v.f,v.p);return [`${v.n}m, ${posL(X,v.p,1)}`,`${v.n}m, ${posL(X,v.p,0)}`,l26(X,v.d,v.R)];}));

/* L27 басовые ходы: вид хода от I к IV (полутоны от тоники) */
const WK=[['E',0,'{E}','{A}'],['E',1,'{F}','{A#}'],['E',3,'{G}','{C}'],['A',0,'{A}','{D}'],['A',2,'{B}','{E}'],['A',3,'{C}','{F}']];
const WT=[
  {ru:'хроматика вверх',en:'chromatic climb',w:[0,2,3,4]},
  {ru:'спуск от септимы',en:'down from the seventh',w:[0,10,9,7]},
  {ru:'через терцию и квинту',en:'through the third and fifth',w:[0,4,7,6]},
  {ru:'малая и большая терция',en:'minor to major third',w:[0,0,3,4]},
  {ru:'вверх по аккорду',en:'up the chord',w:[0,4,7,9]},
  {ru:'спуск от сексты',en:'down from the sixth',w:[0,9,8,7]}];
const l27=(s,r,W)=>{const n=NX[s],nn=NX[n],I5=`${s}${r}+${n}${r+2}`,I6=`${s}${r}+${n}${r+4}`,IV5=`${n}${r}+${nn}${r+2}`,IV6=`${n}${r}+${nn}${r+4}`,v=k=>n+(r+k),
  P=x=>x<5?s+(r+x):n+(r+x-5),[w0,w1,w2,w3]=W.map(P);return [
  J(`${w0}:2 ${w1}:2 ${w2}:2 ${w3}:2`,'|',`${v(0)}:8`),
  [J(`${w0}:2 ${w1} ${w2} ${w3}:2 ${IV5}:2`),J(`${v(0)}:2 ${w3} ${w2} ${w1}:2 ${I5}:2`)],
  J('/3',`${I5}:2 ${I5} ${I6}:2 ${I6} ${w0}:2 ${w1} ${w2}:2 ${w3}`,'|',`${IV5}:2 ${IV5} ${IV6}:2 ${IV6} ${v(0)}:2 ${w3} ${w2}:2 ${w1}`),
  J('/3',swp([w0,w1,w2,w3,v(0),v(2),v(3),v(4)]),'|',swp([v(4),v(3),v(2),v(0),w3,w2,w1,w0])),
  J('/3',swp([I5,w1,w2,w3,IV5,v(2),v(3),v(4)]),'|',swp([IV6,v(3),v(2),v(0),w3,w2,w1,I5]))];};
add('L27',27,2,
 {name:'Басовый ход',goal:'Ход баса к IV ступени и обратно.',how:'Большой палец ведёт бас к соседней струне, левая рука идёт за ним без рывков. Вариант задаёт ход: хроматика, спуск сверху, по аккорду, через терции. На третьем уровне ход вплетается в шаффл.',tip:'Каждый лад — отдельный палец, позиция не съезжает. Ход звучит связно, когда ноты не прерываются.',lvl:['Ход четвертями','Ход и аккорд','Шаффл с ходом','Ход вверх и вниз в свинге','Ход с квинтами на опоре']},
 {name:'Bass walk',goal:'A bass walk up to the IV chord and back.',how:'The thumb walks the bass to the next string, the fretting hand follows without jumps. The variant sets the walk: chromatic, down from above, up the chord, through the thirds. On level 3 the walk is woven into a shuffle.',tip:'One finger per fret, the hand position does not drift. A walk sounds connected when the notes do not break off.',lvl:['Walk in quarters','Walk and chord','Shuffle with the walk','Walk up and down in swing','Walk with fifths on the landing notes']},
 WK.map(([s,r,a,b],i)=>[`${a} → ${b}: ${WT[i].ru}`,`${a} → ${b}: ${WT[i].en}`,l27(s,r,WT[i].w)]));

/* L28 хаммер в аккорде */
const CH=[
  ['{E}',{b:['E0','D2'],t:['G1','B0','e0'],h:['G0','Gh1'],p:['G2','Gp1']}],
  ['{A}',{b:['A0','D2'],t:['G2','B2','e0'],h:['B0','Bh2'],p:['B3','Bp2']}],
  ['{D}',{b:['D0','A0'],t:['G2','B3','e2'],h:['e0','eh2'],p:['e3','ep2']}],
  ['{C}',{b:['A3','E3'],t:['G0','B1','e0'],h:['D0','Dh2'],p:['B1','Bp0']}],
  ['{G}',{b:['E3','D0'],t:['G0','B0','e3'],h:['A0','Ah2'],p:['B1','Bp0']}],
  ['{A}m',{b:['A0','D2'],t:['G2','B1','e0'],h:['B0','Bh1'],p:['B3','Bp1']}]];
const l28b=c=>[`${c.b[0]}+${c.t[2]}`,c.h[0],c.h[1],c.t[2],`${c.b[0]}+${c.p[0]}`,c.p[1],c.b[1],c.t[1]];
const l28=(c,c2)=>{const [b0,b1]=c.b,[h0,h1]=c.h,T=tr(c);return [
  J(`${b0}:2 ${h0} ${h1}:3 ${b1}:2`,'|',`${b0}:2 ${h0} ${h1}:3 ${b1}:2`),
  J(`${b0}+${h0} ${h1}:3 ${b1}:2 ${c.t[2]}:2`,'|',`${b0}+${c.t[2]}:2 ${b1}+${h0} ${h1} ${b0}:2 ${b1}:2`),
  J(`${b0}+${c.t[2]} ${h0} ${h1} ${c.t[2]} ${b0} ${c.t[0]} ${b1} ${c.t[1]}`,'|',...T),
  J(...l28b(c),'|',...T),
  [J('/3',swp(l28b(c)),'|',swp(l28b(c2))),J('/3',swp(l28b(c2)),'|',swp(l28b(c)))]];};
add('L28',28,2,
 {name:'Хаммер в аккорде',goal:'Украшения внутри аккорда, не теряя бас.',how:'Аккорд стоит, один палец добавляется хаммером (из sus2 или минора в мажор) и снимается пулл-оффом (из sus4). Большой палец продолжает бас. Вариант задаёт аккорд и струну, на которой звучит украшение.',tip:'Остальные пальцы аккорда не двигаются. Хаммер — точно на долю или ровно между долями.',lvl:['Бас и хаммер','Щипок с хаммером','Трэвис с хаммером','Хаммер и пулл-офф','Два аккорда в свинге']},
 {name:'Hammer-on in a chord',goal:'Ornaments inside a chord without losing the bass.',how:'The chord holds, one finger is added with a hammer-on (from sus2 or minor to major) and removed with a pull-off (from sus4). The thumb keeps the bass going. The variant sets the chord and the string the ornament is on.',tip:'The other fingers of the chord stay put. The hammer-on lands right on the beat or exactly between beats.',lvl:['Bass and hammer-on','Pinch with a hammer-on','Travis with a hammer-on','Hammer-on and pull-off','Two chords in swing']},
 CH.map(([nm,c],i)=>{const c2=CH[(i+1)%6],hs=c.h[0][0];return [`${nm}: хаммер на {s:${hs}}, затем ${c2[0]}`,`${nm}: hammer-on on {s:${hs}}, then ${c2[0]}`,l28(c,c2[1])];}));

/* L29 смена позиций: вариант — какие позиции связываются */
const l29=(f,p)=>{const Xa=pbox(f,p,0),Xb=pbox(f,p+1,0),Xc=pbox(f,p+2,0),one=s=>{const u=[...new Set([Xa,Xb,Xc].flatMap(X=>X[s]))].sort((a,b)=>a-b);return [...u,...u.slice(1,-1).reverse()].map(a=>s+a);};
  const up=[...nts(Xa,['E','A','D']),...nts(Xb,['G','B','e'])],up3=[...nts(Xa,['E','A']),...nts(Xb,['D','G']),...nts(Xc,['B','e'])];
  const hm=(X,s)=>`${s}${X[s][0]} ${s}h${X[s][1]}`,pl=(X,s)=>`${s}${X[s][1]} ${s}p${X[s][0]}`;return [
  [J(...one('G')),J(...one('B'))],
  [J(...up),J(...ups(up))],
  [J('/3',...['E','A','D'].map(s=>hm(Xa,s)),...['G','B','e'].map(s=>hm(Xb,s))),J('/3',...['e','B','G'].map(s=>pl(Xb,s)),...['D','A','E'].map(s=>pl(Xa,s)))],
  J(...up,...ups(up).slice(1,-1)),
  [J('/3',...up3),J('/3',...ups(up3))]];};
const V29=[{n:'{E}',f:0,p:1},{n:'{A}',f:5,p:1},{n:'{G}',f:3,p:2},{n:'{E}',f:0,p:3},{n:'{C}',f:8,p:1},{n:'{A}',f:5,p:2}];
add('L29',29,2,
 {name:'Смена позиций',goal:'Связать соседние позиции пентатоники без рывков.',how:'Переход между позициями — сдвиг руки на одной струне. Вариант задаёт, какие позиции связываются. Сначала по одной струне вдоль грифа, потом гамма через две позиции, на пятом уровне — через три.',tip:'Смотри на лад, куда едешь, а не на палец. Большой палец сзади грифа едет вместе с рукой.',lvl:['Вдоль одной струны','Две позиции подряд','Легато через сдвиг','Туда и обратно','Три позиции триолями']},
 {name:'Position shifts',goal:'Join neighbouring pentatonic positions smoothly.',how:'The shift between positions is a hand move along one string. The variant sets which positions are joined. First along a single string, then a scale across two positions, on level 5 across three.',tip:'Look at the fret you are moving to, not at the finger. The thumb behind the neck travels with the hand.',lvl:['Along one string','Two positions in a row','Legato through the shift','There and back','Three positions in triplets']},
 V29.map(v=>[`${v.n}m, позиции ${v.p}–${v.p+1}–${v.p+2}`,`${v.n}m, positions ${v.p}–${v.p+1}–${v.p+2}`,l29(v.f,v.p)]));

/* L30 пулл-офф на открытую струну */
const OP=[['{E}m',{e:3,B:3,G:2,D:2},'E0'],['{E}',{e:2,B:2,G:1,D:2},'E0'],['{A}m',{e:3,B:1,G:2,D:2},'A0'],['{D}',{e:2,B:3,G:2,D:4},'A0'],['{G}',{e:3,B:3,G:4,D:2},'E3'],['{A}',{e:2,B:2,G:2,D:4},'A0']];
const l30=(x,bs)=>{const pp=s=>[s+x[s],s+'p0'],c3=['e','B','G','D'].flatMap(s=>[s+x[s],s+'p0',s==='D'?'.':({e:'B',B:'G',G:'D'}[s])+'0']),
  c3u=['D','G','B','e'].flatMap(s=>[s+x[s],s+'p0',s==='e'?'.':({D:'G',G:'B',B:'e'}[s])+'0']),thumb=a=>a.map((t,i)=>i%3?t:`${bs}+${t}`);return [
  J('/2',...pp('e'),...pp('e'),...pp('B'),...pp('B')),
  [J('/2',...['e','B','G','D'].flatMap(pp)),J('/2',...['D','G','B','e'].flatMap(pp))],
  J(...c3),
  J(...thumb(c3)),
  [J(...thumb(c3)),J(...thumb(c3u))]];};
add('L30',30,3,
 {name:'Открытые струны',goal:'Пулл-офф на открытую струну: каскад звука, как у дельта-гитаристов.',how:'Палец снимается со струны щипком вниз, открытая струна звучит громко. В каскаде открытые струны звенят друг под другом. Вариант задаёт аккорд, из которого строится каскад. С четвёртого уровня большой палец держит бас.',tip:'Не глуши открытые струны ладонью: каскад должен звенеть. Ориентир — Скип Джеймс и Мисс. Джон Хёрт.',lvl:['Две струны восьмыми','Четыре струны','Каскад триолями','Каскад над басом','Вниз и вверх над басом']},
 {name:'Open strings',goal:'Pull-offs to open strings: a ringing cascade, delta style.',how:'The finger leaves the string with a downward pluck so the open string sounds loud. In the cascade the open strings ring into each other. The variant sets the chord the cascade is built from. From level 4 the thumb holds the bass.',tip:'Do not mute the open strings with the palm: the cascade should ring. Think Skip James and Mississippi John Hurt.',lvl:['Two strings in eighths','Four strings','Cascade in triplets','Cascade over the bass','Down and up over the bass']},
 OP.map(([nm,x,bs])=>[`Каскад из ${nm}`,`Cascade from ${nm}`,l30(x,bs)]));

/* L31 терции: вариант — тональность и пара струн */
const l31=(k,r)=>{const T=(g,b)=>`G${k+g}+B${k+b}`,T0=T(0,0),T1=T(2,1),T2=T(4,3),T3=T(5,5),Tm=T(-2,-2),Th0=`G${k}+B${k-1}`,Th1=`G${k}+Bh${k}`,b='E'+r;
  const s1=J('/3',`${b}+${Th0}:2 ${Th1} ${T1}:2 ${T2} ${b}+${T1}:2 ${T0} ${Tm}:2 ${T0}`);return [
  J(`${T0}:2 ${T1}:2 ${T2}:2 ${T1}:2`,'|',`${T0}:2 ${Tm}:2 ${T0}:4`),
  J(`${T0} ${T1} ${T2} ${T3} ${T2} ${T1} ${T0} ${Tm}`,'|',`${Tm} ${T0} ${T1} ${T2} ${T3}:2 ${T2}:2`),
  J(`${Th0} ${Th1}:3 ${T1}:2 ${T0}:2`,'|',`${T2} ${T1} ${Th0} ${Th1} ${T0}:2 ${Tm}:2`),
  s1,
  J(s1,'|',`${b}+${T2}:2 ${T3} ${T2}:2 ${T1} ${b}+${Th0}:2 ${Th1} ${T0}~:3`)];};
const V31=[{k:0,o:null},{k:1,o:0},{k:2,o:null},{k:3,o:0},{k:4,o:null},{k:5,o:0}];
add('L31',31,2,
 {name:'Терции',goal:'Двойные ноты на соседних струнах и хаммер внутри пары.',how:'Терции идут по ладу вверх и вниз парами пальцев. Вариант задаёт тональность и пару струн: на средней паре терции звучат ниже и требуют другой аппликатуры. С третьего уровня малая терция хаммером переходит в большую, вторая нота пары держится.',tip:'Пальцы пары прижимают струны одинаково, обе ноты звучат. Это основа ходов Лайтнина Хопкинса и Мэнса Липскомба.',lvl:['Терции четвертями','Восьмыми вверх и вниз','Хаммер в паре','Бас под терциями в свинге','Две фразы, вибрато']},
 {name:'Thirds',goal:'Double stops on adjacent strings and a hammer-on inside the pair.',how:'Thirds move up and down the scale with pairs of fingers. The variant sets the key and the string pair: on the middle pair the thirds sit lower in the fretboard layout and need a different fingering. From level 3 the minor third hammers into the major third while the other note of the pair holds.',tip:'Both fingers of the pair press equally so both notes sound. This is the core of Lightnin’ Hopkins and Mance Lipscomb licks.',lvl:['Thirds in quarters','Eighths up and down','Hammer-on in the pair','Bass under the thirds in swing','Two phrases, vibrato']},
 V31.map(({k:i,o})=>{const k=K[i],t=l31(k.m,k.f);return o==null?[`${k.n}: терции на {s:G} и {s:B}`,`${k.n}: thirds on {s:G} and {s:B}`,t]:[`${k.n}: терции на {s:D} и {s:G}`,`${k.n}: thirds on {s:D} and {s:G}`,dn(t,o)];}));

/* L40 подвижные септаккорды и нонаккорды: вариант — ритм */
const E7f=r=>`E${r}+A${r+2}+D${r}+G${r+1}+B${r}+e${r}`,A7f=r=>`A${r}+D${r+2}+G${r}+B${r+2}+e${r}`,A9f=r=>`A${r}+D${r-1}+G${r}+B${r}+e${r}`;
const X6='Ex+Ax+Dx+Gx+Bx+ex',X5='Ax+Dx+Gx+Bx+ex';
const RP=[
  {ru:'чак на 2 и 4',en:'chuck on 2 and 4',f:(c,x)=>`${c}:2 ${x}:2 ${c}:2 ${x}:2`},
  {ru:'чарльстон',en:'charleston',f:(c,x)=>`${c}:3 ${c}:3 ${x}:2`},
  {ru:'восьмые с чаком',en:'eighths with a chuck',f:(c,x)=>`${c} ${x} ${c} ${x} ${c} ${x} ${c} ${x}`},
  {ru:'опережение',en:'push',f:(c,x)=>`${x}:2 ${c}:2 ${x} ${c}:3`},
  {ru:'стоп-тайм',en:'stop-time',f:(c,x)=>`${c}:2 . ${c} .:4`},
  {ru:'на слабые доли',en:'on the offbeats',f:(c,x)=>`. ${c} . ${c} . ${c} ${x}:2`}];
const l40=(r,i)=>{const rr=r||12,I=E7f(r),IV=A7f(r),I9=E7f(rr),IV9=A9f(rr),V9=A9f(rr+2),st=RP[i].f,s3=(c,x)=>`${c}:2 ${x} ${c}:2 ${x} ${c}:2 ${x} ${c}:2 ${x}`;return [
  J(st(I,X6),'|',st(I,X6)),
  J(st(I,X6),'|',st(IV,X5)),
  J(st(IV9,X5),'|',st(V9,X5)),
  J('/3',`${E7f(rr-1)} ${I9}:2 ${X6}:2 ${I9} ${A9f(rr-1)} ${IV9}:2 ${X5}:2 ${IV9}`,'|',`${A9f(rr+1)} ${V9}:2 ${X5}:2 ${V9} ${A9f(rr-1)} ${IV9}:2 ${X5}:2 ${IV9}`),
  [J('/3',s3(I9,X6),'|',s3(IV9,X5),'|',s3(I9,X6),'|',s3(I9,X6)),J('/3',s3(IV9,X5),'|',s3(IV9,X5),'|',s3(I9,X6),'|',s3(I9,X6)),J('/3',s3(V9,X5),'|',s3(IV9,X5),'|',s3(I9,X6),'|',s3(V9,X5))]];};
add('L40',40,2,
 {name:'Подвижные аккорды',goal:'Септаккорды и нонаккорды по грифу: левая рука держит форму.',how:'Форма септаккорда с тоникой на нижней струне и формы с тоникой на пятой струне, двигаются целиком. Между ударами рука ослабляет нажим — получается чак. Вариант задаёт ритм первых уровней: чак на 2 и 4, чарльстон, опережение, стоп-тайм.',tip:'Форма ставится вся сразу, а не по пальцу. Подход на лад ниже — вместо слайда, как у Т-Боуна Уокера.',lvl:['Одна форма в ритме','Две формы: I и IV','Нонаккорды IV и V','Подход на лад ниже','Весь квадрат нонаккордами']},
 {name:'Movable chords',goal:'Seventh and ninth chords up the neck: the fretting hand keeps the shape.',how:'A seventh chord shape with the root on the low string and shapes with the root on the fifth string, moved as a whole. Between hits the hand eases off the pressure, which gives the chuck. The variant sets the rhythm of the first levels: chuck on 2 and 4, charleston, push, stop-time.',tip:'Place the whole shape at once, not finger by finger. The approach from a fret below replaces a slide, like T-Bone Walker.',lvl:['One shape in rhythm','Two shapes: I and IV','Ninth chords on IV and V','Approach from a fret below','The whole form in ninth chords']},
 K.map((k,i)=>[`${k.n}: ${RP[i].ru}`,`${k.n}: ${RP[i].en}`,l40(k.f,i)]));

/* C32 Трэвис → лик: вариант — лик (лады от тоники) */
const LK=[
  {ru:'ответ с верхней струны',en:'answer from the top string',l:'G2 G0 B3 B0 e0 B3 G2 G0'},
  {ru:'спуск к басу',en:'descent to the bass',l:'G2 G3 G2 G0 D2 D0 E3 E0'},
  {ru:'спуск с самого верха',en:'descent from the very top',l:'e3 e0 B3 B0 G2 G0 D2 D0'},
  {ru:'вокруг квинты',en:'around the fifth',l:'D2 G0 D2 G2 B0 G2 D2 D0'},
  {ru:'подъём',en:'climb',l:'D0 D2 G0 G2 B0 B3 e0 e3'},
  {ru:'перекличка струн',en:'string call-and-answer',l:'e0 B3 e0 B3 G2 B0 G0 D2'}];
const c32=(c,f,i,P)=>{const T=trp(c,P),L=off(LK[i].l,f),L2=off(LK[(i+1)%6].l,f),m1=[...T.slice(0,4),...L.slice(0,4)],m2=[...L.slice(4),...T.slice(4)];return [
  J(...T,'|',...L),
  [J(...T,'|',...L),J(...T,'|',...L2)],
  J(...m1,'|',...m2),
  [J('/3',swp(T),'|',swp(L)),J('/3',swp(T),'|',swp(L2))],
  [J('/3',swp(m1),'|',swp(m2)),J('/3',swp([...T.slice(0,4),`G${f+3}b${f+4}r${f+3}`,`G${f+2}`,`G${f}`,`D${f+2}`]),'|',swp([...L2.slice(0,4),...T.slice(4)]))]];};
add('C32',32,2,
 {name:'Трэвис → лик',goal:'Из аккомпанемента в соло и обратно без шва.',how:'Такт Трэвиса на аккорде, потом такт мелодии в позиции пентатоники. Вариант задаёт лик. Главное место — стык: последний бас и первая нота лика.',tip:'Рука переезжает в позицию во время последней восьмой. Если стык рвётся, сыграй только две ноты на границе.',lvl:['Такт аккорда, такт лика','Два лика','Стык внутри такта','Свинг','Стык внутри такта, бенд']},
 {name:'Travis → lick',goal:'From accompaniment to solo and back without a seam.',how:'A bar of Travis on the chord, then a bar of melody in the pentatonic position. The variant sets the lick. The key spot is the joint: the last bass note and the first note of the lick.',tip:'The hand moves into position during the last eighth. If the joint breaks, play just the two notes at the boundary.',lvl:['A bar of chord, a bar of lick','Two licks','Joint mid-bar','Swing','Mid-bar joint, bend']},
 K.map((k,i)=>[`${cn(k.I)}, ${k.n}m: ${LK[i].ru}`,`${cn(k.I)}, ${k.n}m: ${LK[i].en}`,c32(S[k.I],k.f,i,i%2?1:0)]));

/* C33 бой → Трэвис: вариант — паттерн щипка */
const c33=(c,c2,P)=>{const st=x=>[`${x.full}:2`,x.full,x.top,`${x.x}:2`,x.full,x.top],sws=x=>`${x.full}:2 ${x.top} ${x.x}:2 ${x.top} ${x.full}:2 ${x.top} ${x.x}:2 ${x.top}`,T=trp(c,P),T2=trp(c2,P);return [
  J(...st(c),'|',...T),
  [J(...st(c),'|',...T),J(...st(c2),'|',...T2)],
  J(`${c.full}:2 ${c.x}:2`,...T.slice(4),'|',...T2.slice(0,4),`${c2.full}:2 ${c2.x}:2`),
  [J('/3',sws(c),'|',swp(T)),J('/3',sws(c2),'|',swp(T2))],
  [J('/3',`${c.full}:2 ${c.top} ${c.x}:2 ${c.top}`,swp(T.slice(4)),'|',swp(T2.slice(0,4)),`${c2.full}:2 ${c2.top} ${c2.x}:2 ${c2.top}`),
   J('/3',`${c2.full}:2 ${c2.top} ${c2.x}:2 ${c2.top}`,swp(T2.slice(4)),'|',swp(T.slice(0,4)),`${c.full}:2 ${c.top} ${c.x}:2 ${c.top}`)]];};
const P33=[2,3,4,5,0,1];
add('C33',33,2,
 {name:'Бой → щипок',goal:'Переключение правой руки между боем и Трэвисом.',how:'Такт боя с чаком, потом такт щипка на том же аккорде. Вариант задаёт паттерн щипка. Сначала каждая часть отдельно, потом склейка. На стыке рука из размаха собирается над струнами.',tip:'Метроном не ждёт перехода: последний удар боя и первый бас — соседние восьмые.',lvl:['Такт боя, такт щипка','Два аккорда','Смена внутри такта','Свинг','Свинг, смена внутри такта']},
 {name:'Strum → fingerpick',goal:'Switch the right hand between strumming and Travis.',how:'A bar of strumming with a chuck, then a bar of fingerpicking on the same chord. The variant sets the picking pattern. Each part on its own first, then join them. At the joint the hand gathers from the swing into position over the strings.',tip:'The metronome does not wait for the switch: the last strum and the first bass note are neighbouring eighths.',lvl:['A bar of strum, a bar of picking','Two chords','Switch mid-bar','Swing','Swing, switch mid-bar']},
 K.map((k,i)=>[`${cn(k.I)} и ${cn(k.IV)}: ${TP[P33[i]].ru}`,`${cn(k.I)} and ${cn(k.IV)}: ${TP[P33[i]].en}`,c33(S[k.I],S[k.IV],P33[i])]));

/* C34 шаффл → тёрнэраунд: вариант — фигура шаффла и вид разворота */
const c34=(k,i)=>{const [s,r]=k.bs,o=k.f,x=ta(o,S[k.V].full,i),I=fig(i,s,r),IV=fig(i,NX[s],r),V=fig(i,NX[s],r+2),half=t=>t.split(' ').slice(0,4).join(' '),tt=x.t.split(' ');return [
  [J(I,'|',x.q),J(I,'|',x.end)],
  [J(I,'|',x.t),J(I,'|',x.end2)],
  [J(half(I),...tt.slice(0,6)),J(...tt.slice(6),`E${o}:3 ${S[k.V].full}:3`)],
  [J(I,'|',IV),J(x.b,'|',x.end3)],
  [J(V,'|',IV),J(I,'|',x.b),J(x.bB,'|',x.end3)]];};
add('C34',34,3,
 {name:'Шаффл → тёрнэраунд',goal:'Из ритма в разворот без потери свинга.',how:'Шаффл большим пальцем, потом тёрнэраунд с педалью на верхней струне. Вариант задаёт фигуру шаффла и вид разворота. Сначала части отдельно, потом склейка. На пятом уровне — последние четыре такта квадрата.',tip:'Триоли шаффла и триоли тёрнэраунда — одна сетка. Считай вслух «раз-и-а».',lvl:['Такт шаффла, такт разворота','Разворот триолями','Стык внутри такта','Смена на IV, бас под разворотом','Концовка квадрата: V, IV, I, разворот']},
 {name:'Shuffle → turnaround',goal:'From rhythm into the turnaround without losing the swing.',how:'A thumb shuffle, then a turnaround with a pedal on the top string. The variant sets the shuffle figure and the kind of turnaround. Parts on their own first, then join them. On level 5: the last four bars of the form.',tip:'Shuffle triplets and turnaround triplets are one grid. Count out loud: one-and-a.',lvl:['A bar of shuffle, a bar of turnaround','Turnaround in triplets','Joint mid-bar','Change to IV, bass under the turnaround','End of the form: V, IV, I, turnaround']},
 K.map((k,i)=>[`${k.n}: ${SF[i].ru}, разворот ${TL[i].ru}`,`${k.n}: ${SF[i].en}, turnaround ${TL[i].en}`,c34(k,i)]));

/* C35 12-тактовый блюз: вариант — паттерн щипка */
const c35=(k,P)=>{const c={I:S[k.I],IV:S[k.IV],V:S[k.V]},o=k.f,ord=['I','IV','I','I','IV','IV','I','I','V','IV','I','V'],tp=x=>trp(x,P),
  bas=x=>`${x.b[0]}:2 ${x.b[1]}:2 ${x.b[0]}:2 ${x.b[1]}:2`,pin=x=>`${x.b[0]}+${x.t[2]}:2 ${x.b[1]}:2 ${x.b[0]}+${x.t[1]}:2 ${x.b[1]}:2`,
  rows=(f,bars)=>[0,1,2].map(i=>J(...bars.slice(i*4,i*4+4).map((b,j)=>(j?'| ':'')+f(c[b])))),tq=[0,1,2,3].map(j=>`G${o+4-j}+e${o}:2`).join(' '),
  tt=[0,1,2,3].map(j=>`e${o} G${o+4-j} e${o}`).join(' ');return [
  J(bas(c.I),'|',bas(c.IV),'|',bas(c.I),'|',bas(c.V)),
  J(pin(c.I),'|',pin(c.IV),'|',pin(c.I),'|',pin(c.V)),
  rows(x=>J(...tp(x)),ord),
  rows(x=>J(...tp(x)),ord.slice(0,10)).slice(0,2).concat(J(...tp(c.V)),J(...tp(c.IV)),J(tq,'|',`E${o}:4 ${c.V.full}:4`)),
  rows(x=>J('/3',swp(tp(x))),ord.slice(0,10)).slice(0,2).concat(J('/3',swp(tp(c.V)),'|',swp(tp(c.IV))),J('/3',tt,'|',`E${o}:3 ${c.V.full}:3 .:6`))];};
const P35=[1,0,3,2,5,4];
add('C35',35,2,
 {name:'12-тактовый блюз',goal:'Весь квадрат щипком: I, IV, V без остановки.',how:'Первые уровни — четыре такта на басу, дальше весь квадрат: I–IV–I–I, IV–IV–I–I, V–IV–I–V. Вариант задаёт паттерн щипка. На четвёртом уровне в конце — тёрнэраунд.',tip:'Считай такты вслух или кивком. Потеряться в квадрате — главная ошибка, техника вторична.',lvl:['Четыре такта: бас','Четыре такта: щипок','Весь квадрат паттерном','Квадрат с тёрнэраундом','Квадрат в шаффле']},
 {name:'12-bar blues',goal:'The whole form fingerpicked: I, IV, V without stopping.',how:'The first levels are four bars of bass, then the whole form: I–IV–I–I, IV–IV–I–I, V–IV–I–V. The variant sets the picking pattern. On level 4 it ends with a turnaround.',tip:'Count the bars out loud or with a nod. Getting lost in the form is the main mistake; technique comes second.',lvl:['Four bars: bass','Four bars: pinch','The whole form in the pattern','The form with a turnaround','The form in a shuffle']},
 K.map((k,i)=>[`Блюз в ${k.n}: ${TP[P35[i]].ru}`,`Blues in ${k.n}: ${TP[P35[i]].en}`,c35(k,P35[i])]));

/* C36 этюд: Трэвис, бурдон, шаффл, тёрнэраунд — по системе на фрагмент; вариант меняет материал каждого фрагмента */
const c36=(k,i)=>{const c=S[k.I],c2=S[k.IV],c5=S[k.V],f=k.f,[s,r]=k.bs,d='E'+f,a=a17(pbox(f,1,0),d),x=ta(f,c5.full,(i+2)%6),I=fig(i,s,r),IV=fig(i,NX[s],r),T=y=>trp(y,(i+3)%6),vb=t=>t.replace(/:(\d)$/,'~:$1');return [
  [J(...T(c)),J(...[`B${f+3}`,`B${f}`,`G${f+2}`,`G${f}`].flatMap(n=>[d,n])),J('/3',I),J(x.q)],
  [J('/3',swp(T(c))),a[2][0],J('/3',I),J('/3',x.t)],
  [J('/3',swp(T(c)),'|',swp(T(c2))),a[3][0],J('/3',I,'|',IV),J('/3',x.t,'|',x.end2)],
  [J('/3',swp(T(c)),'|',swp(T(c2))),J(a[3][0],'|',a[3][1]),J('/3',I,'|',IV),J('/3',x.b,'|',x.end2)],
  [J('/3',swp(T(c)),'|',swp(T(c2)),'|',swp(T(c)),'|',swp(T(c5))),J(a[4][0],'|',vb(a[3][1])),J('/3',I,'|',IV,'|',I,'|',I),J('/3',x.bB,'|',x.end3)]];};
add('C36',36,2,
 {name:'Этюд',goal:'Четыре приёма акустического блюза подряд, как в настоящей пьесе.',how:'Четыре фрагмента: щипок, мелодия над бурдоном, шаффл, тёрнэраунд. Вариант меняет материал фрагментов: паттерн щипка, фигуру шаффла и вид разворота. Сначала каждый фрагмент отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов: правая рука меняет роль.',lvl:['Такт на фрагмент, ровные восьмые','Свинг, триоли','Два такта: смена на IV','Легато над бурдоном, бас под разворотом','Длинные фрагменты: квадрат, бенд, два разворота']},
 {name:'Étude',goal:'Four acoustic blues techniques in a row, like a real piece.',how:'Four fragments: fingerpicking, melody over a drone, shuffle, turnaround. The variant changes the material of the fragments: the picking pattern, the shuffle figure and the kind of turnaround. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a full run on your phone. The weak spot is almost always the joint between fragments, where the right hand changes its role.',lvl:['A bar per fragment, straight eighths','Swing, triplets','Two bars: change to IV','Legato over the drone, bass under the turnaround','Long fragments: the form, a bend, two turnarounds']},
 K.map((k,i)=>[`Этюд в ${k.n}: ${TP[(i+3)%6].ru}, ${SF[i].ru}`,`Étude in ${k.n}: ${TP[(i+3)%6].en}, ${SF[i].en}`,c36(k,i)]));

return {EX,EXEN:EN,COACH:{C36:{stages:COACH_GUITAR.C36.stages}}};
})();
/*@BLUES_BASS_1@*/
// Бас, блюз, часть 1. Табы строятся из фигур на такт: число — интервал в полутонах от тоники аккорда,
// x — мёртвая нота, h/p — легато, m — приглушение, ~ — вибрато, :k — длина, A — хроматический подход к следующему аккорду.
// Тоника I всегда на струне E (лад r), IV и V — на струне A; вся фраза в одной позиции (лады r-1…r+4).
// Тесты BBT*: тренер ищет длительности по id без первой B (BBT1 → BT1), поэтому BT1/BT3 — как T1/T3.
const BLB1=(function(){
const SN='EADG';
// струна для интервала n от тоники R (полутоны от открытой E); sh=5 — коробка от тоники на второй снизу струне
function nt(R,n,sh){const s=Math.max(0,Math.ceil((n+sh-4)/5)),f=R+n-5*s;if(s>3||f<0||f>17)throw Error('BLB1: '+R+'/'+n+'/'+sh);return SN[s]+f;}
// один такт: c — тоника аккорда (0, 5, 7), nx — тоника следующего
function bar(R,sh,c,nx,str){
  const ap=(R+nx-1<0?nx+1:nx-1)-c; // подход снизу на полтона, от открытой E — сверху
  return str.trim().split(/\s+/).map(w=>{
    if(w==='|'||w[0]==='/'||w[0]==='.')return w;
    const m=/^([xhp]?)(A|-?\d+)(~?)(m?)(:\d+)?$/.exec(w);if(!m)throw Error('BLB1 tok '+w);
    const t=nt(R,c+(m[2]==='A'?ap:+m[2]),sh);
    return (m[1]==='x'?t[0]+'x':m[1]?t[0]+m[1]+t.slice(1)+m[3]:t+m[3])+m[4]+(m[5]||'');
  }).join(' ');
}
// прогрессии: 12 — квадрат с быстрой сменой (IV во 2-м такте), 12s — с медленной, 8 — восьмитактовый блюз
const P={2:[0,0],4:[0,5,0,0],12:[0,5,0,0,5,5,0,0,7,5,0,7],'12s':[0,0,0,0,5,5,0,0,7,5,0,7],8:[0,7,5,5,0,7,0,7],IV:[0,5],TA:[0,7],T4:[7,5,0,7]};
// форма: прогрессия → системы по 4 такта; fig(c,i,nx) — фигура такта, pre(j) — токен в начале системы j
function form(r,prog,fig,pre,sh){
  sh=sh||0;const R=r<sh?r+12:r,pr=Array.isArray(prog)?prog:P[prog];
  const bars=pr.map((c,i)=>{const nx=i+1<pr.length?pr[i+1]:pr[0];return bar(R,sh,c,nx,fig(c,i,nx,pr.length));});
  const out=[];for(let i=0;i<bars.length;i+=4)out.push(((pre&&pre(i/4))||'')+bars.slice(i,i+4).join(' | '));
  return out.map(s=>s.trim());
}
const K=[{r:0,p:'{E}'},{r:5,p:'{A}'},{r:3,p:'{G}'},{r:8,p:'{C}'},{r:1,p:'{F}'},{r:10,p:'{D}'}];
// вариант = материал (фигура, регистр, прогрессия) + тональность; lv(p) — уровни [прогрессия, фигура, доп. поля, pre]
function V(list,lv){return list.map(p=>{const k=K[p.k];return {l:p.ru+', '+k.p,lv:lv(p).map(([pr,fig,x,pre])=>Object.assign({t:form(k.r,pr,fig,pre,p.sh)},x||{}))};});}
const VE=list=>list.map(p=>p.en+', '+K[p.k].p);
const ev=i=>i%2===0, F=s=>()=>s, alt=(a,b)=>(c,i)=>ev(i)?a:b;
const last=(a,b)=>(c,i,nx,n)=>i>=n-2?b(c,i):a(c,i);
const toks=s=>s.trim().split(/\s+/);
const dead=s=>toks(s).map(w=>/^-?\d+m?$/.test(w)?'x'+w:w).join(' '); // короткие ноты шаффла — мёртвые
const appr=s=>{const w=toks(s);for(let i=w.length-1;i>=0;i--){const m=/^[xhp]?-?\d+~?(m?)(:\d+)?$/.exec(w[i]);if(m){w[i]='A'+m[1]+(m[2]||'');break;}}return w.join(' ');}; // последняя нота — подход
const om=s=>toks(s).map(w=>w.includes(':')?w.replace('m',''):w).join(' '); // долгие открыто
const shf8=s=>{const w=toks(s),o=[];for(let i=0;i<w.length;i+=2)o.push(w[i]+':2 '+w[i+1]);return o.join(' ');}; // ровные восьмые → шаффл
const shq=s=>toks(s).map(w=>w.replace(/^(A|-?\d+):3$/,'$1:2 $1')).join(' ');
const trp=s=>toks(s).map(w=>w.replace(/^(A|-?\d+):3$/,'$1 x$1 $1')).join(' ');
// уокинг: вверх по аккорду, вниз с октавы, последняя доля — подход
const WALK=alt('0:3 4:3 7:3 9:3','12:3 9:3 7:3 A:3');
const pr=p=>p.pr||'12';
// общие схемы уровней
const LG=p=>[['2',F(p.a)],['4',F(p.a)],[pr(p),F(p.a)],[pr(p),alt(p.a,p.b)],[pr(p),alt(p.a,appr(p.b))]];
const LW1=p=>[['2',alt(p.a,p.b)],['4',alt(p.a,p.b)],[pr(p),alt(p.a,p.b)],[pr(p),alt(p.a,appr(p.b))],[pr(p),alt(p.c,p.d)]];
const LW2=p=>[['2',alt(p.a,p.b)],['4',alt(p.a,p.b)],[pr(p),alt(p.a,p.b)],[pr(p),alt(p.c,p.d)],[pr(p),alt(p.c,appr(p.d))]];

const D={
B1:[{k:0,ru:'Тоника',en:'Root',a:'0:2 0 0:2 0 0:2 0 0:2 0'},
 {k:1,ru:'Тоника и октава через долю',en:'Root and octave on alternate beats',a:'0:2 0 12:2 12 0:2 0 12:2 12'},
 {k:3,sh:5,ru:'Тоника и квинта снизу',en:'Root and the fifth below',a:'0:2 0 -5:2 -5 0:2 0 -5:2 -5'},
 {k:2,ru:'Толчок: пауза и короткая',en:'Push: rest and a short note',a:'0:3 .:2 0 0:3 .:2 0'},
 {k:5,pr:'12s',ru:'Медленная смена: IV в 5-м такте',en:'Slow change: IV in bar 5',a:'0:2 0 0:2 0 12:2 12 0:2 0'},
 {k:4,pr:'8',ru:'Восьмитактовый блюз',en:'Eight-bar blues',a:'0:2 0 0:2 12 0:2 0 0:2 12'}],
B2:[{k:1,ru:'Тоника, квинта, секста',en:'Root, fifth, sixth',a:'0:2 0 7:2 7 9:2 9 7:2 7',b:'12:2 12 10:2 10 9:2 9 7:2 7'},
 {k:0,sh:5,ru:'Квинта и секста снизу',en:'Fifth and sixth below',a:'0:2 0 -5:2 -5 -3:2 -3 -5:2 -5',b:'0:2 0 -2:2 -2 -3:2 -3 -5:2 -5'},
 {k:2,ru:'Через малую септиму',en:'Through the flat seventh',a:'0:2 0 7:2 7 9:2 9 10:2 10',b:'12:2 12 10:2 10 9:2 9 7:2 7'},
 {k:3,ru:'Фигура вдвое плотнее',en:'Figure twice as dense',a:'0:2 7 9:2 7 0:2 7 9:2 7',b:'0:2 7 9:2 10 12:2 10 9:2 7'},
 {k:4,ru:'Тоника, квинта, октава',en:'Root, fifth, octave',a:'0:2 0 7:2 7 12:2 12 7:2 7',b:'0:2 0 7:2 7 12:2 12 10:2 10'},
 {k:5,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0:2 0 7:2 7 9:2 9 7:2 7',b:'12:2 12 10:2 10 9:2 9 7:2 7'}],
B3:[{k:2,ru:'Вверх по аккорду, вниз с октавы',en:'Up the chord, down from the octave',a:'0:3 4:3 7:3 9:3',b:'12:3 9:3 7:3 4:3',c:'0:3 4:2 4 7:3 9:2 x9',d:'12:3 10:2 9 7:3 A:3'},
 {k:0,ru:'Вверх по гамме',en:'Up the scale',a:'0:3 2:3 4:3 5:3',b:'7:3 5:3 4:3 2:3',c:'0:3 2:3 4:2 x4 5:3',d:'7:3 9:3 10:2 9 A:3'},
 {k:1,ru:'Тоника, квинта, октава',en:'Root, fifth, octave',a:'0:3 7:3 12:3 7:3',b:'0:3 4:3 5:3 6:3',c:'0:3 7:2 x7 12:3 7:3',d:'0:3 4:3 5:2 6 A:3'},
 {k:3,sh:5,ru:'Вниз от тоники',en:'Down from the root',a:'0:3 -2:3 -3:3 -5:3',b:'-5:3 -3:3 -2:3 -1:3',c:'0:3 -2:2 x-2 -3:3 -5:3',d:'-5:3 -3:2 -2 -1:3 A:3'},
 {k:4,ru:'Арпеджио с септимой',en:'Arpeggio with the seventh',a:'0:3 4:3 7:3 10:3',b:'12:3 10:3 7:3 4:3',c:'0:3 4:2 x4 7:3 10:3',d:'12:3 10:2 x10 7:3 A:3'},
 {k:5,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0:3 4:3 7:3 9:3',b:'12:3 9:3 7:3 4:3',c:'0:2 x0 4:3 7:2 x7 9:3',d:'12:3 9:2 x9 7:3 A:3'}],
B4:[{k:3,ru:'Вверх к терции',en:'Up to the third',a:'0:3 2:3 3:3 4:3',b:'5:3 6:3 7:3 9:3',c:'0 2 3 4:2 x4 7:3 9:2 10',d:'12:2 x12 10:2 9 7:3 A:3'},
 {k:0,ru:'Вниз с октавы',en:'Down from the octave',a:'12:3 11:3 10:3 9:3',b:'7:3 6:3 5:3 4:3',c:'12 11 10 9:2 x9 7:3 6:2 5',d:'4:3 3:2 x3 2:3 A:3'},
 {k:1,ru:'Снизу к квинте',en:'Up to the fifth',a:'0:3 5:3 6:3 7:3',b:'9:3 8:3 7:3 6:3',c:'0:3 5 6 7 7:2 x7 9:2 8',d:'7:3 6:2 x6 5:3 A:3'},
 {k:2,sh:5,ru:'Снизу к тонике',en:'Up to the root from below',a:'0:3 -3:3 -2:3 -1:3',b:'0:3 -5:3 -4:3 -3:3',c:'0 -1 -2 -3:2 x-3 -5:3 -4:2 -3',d:'-2:3 -1:2 x-1 0:3 A:3'},
 {k:4,ru:'Квинта — секста — септима',en:'Fifth, sixth, seventh',a:'0:3 7:3 8:3 9:3',b:'10:3 9:3 8:3 7:3',c:'0:3 7 8 9 10:2 x10 9:3',d:'10:3 9:2 x9 8:3 A:3'},
 {k:5,pr:'8',ru:'Восьмитактовый блюз',en:'Eight-bar blues',a:'0:3 2:3 3:3 4:3',b:'7:3 6:3 5:3 4:3',c:'0 2 3 4:2 x4 7:3 9:2 10',d:'7:2 x7 6:3 5:3 A:3'}],
B5:[{k:4,ru:'Тоника и щелчок',en:'Root and click',a:'0:2 x0 0:2 x0 7:2 x7 0:2 x0',b:'0:2 x0 7:2 x7 9:2 x9 7:2 x7'},
 {k:0,ru:'Две мёртвые на долю',en:'Two dead notes per beat',a:'0 x0 x0 7 x7 x7 0 x0 x0 7 x7 x7',b:'0 x0 x0 9 x9 x9 7 x7 x7 5 x5 x5'},
 {k:1,ru:'Мёртвая на долю, нота на короткую',en:'Dead note on the beat, note on the short one',a:'x0:2 0 x0:2 7 x0:2 9 x0:2 7',b:'x0:2 12 x0:2 10 x0:2 9 x0:2 7'},
 {k:2,ru:'Октава через мёртвую',en:'Octave across a dead note',a:'0 x0 12 x12:2 0 0 x0 12 x12:2 0',b:'0 x0 12 x12:2 10 7 x7 x7 5:2 x5'},
 {k:3,sh:5,ru:'Квинта снизу и щелчок',en:'Fifth below and click',a:'0:2 x0 -5:2 x-5 0:2 x0 -5:2 x-5',b:'0:2 x0 -5:2 x-5 -3:2 x-3 -2:2 x-2'},
 {k:5,ru:'Мёртвая триоль в конце такта',en:'Dead triplet at the end of the bar',a:'0:3 7:3 9:3 x9 x9 x9',b:'0:3 7:3 10:3 x10 x10 x10'}],
R6:[{k:5,ru:'Вверх до септимы',en:'Up to the seventh',a:'0:2 4 7:2 9 10:2 9 7:2 4',b:'0:2 4 7:2 9 12:2 10 9:2 7'},
 {k:0,ru:'Через малую терцию',en:'Through the minor third',a:'0:2 3 4:2 7 9:2 7 4:2 3',b:'0:2 3 4:2 7 9:2 10 9:2 7'},
 {k:1,ru:'До октавы и спуск',en:'Up to the octave and down',a:'0:2 4 7:2 9 12:2 9 7:2 4',b:'12:2 10 9:2 7 4:2 3 0:2 4'},
 {k:3,sh:5,ru:'Бугги вниз от тоники',en:'Boogie below the root',a:'0:2 -8 -5:2 -3 -2:2 -3 -5:2 -8',b:'0:2 -8 -5:2 -3 0:2 -2 -3:2 -5'},
 {k:4,ru:'Рок-н-ролл: по две на ноту',en:'Rock and roll: two per note',a:'0:2 0 4:2 4 7:2 7 9:2 9',b:'10:2 10 9:2 9 7:2 7 4:2 4'},
 {k:2,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0:2 4 7:2 9 10:2 9 7:2 4',b:'0:2 4 7:2 9 12:2 10 9:2 7'}],
R7:[{k:0,ru:'Удар на первую долю',en:'Hit on beat one',s:'0:3 .:9',s2:'0:3 .:6 7:2 A',w:'0:2 0 7:2 7 9:2 9 7:2 7'},
 {k:1,ru:'Удар на вторую долю',en:'Hit on beat two',s:'.:3 0:3 .:6',s2:'.:3 0:3 .:3 7:2 A',w:'0:2 4 7:2 9 10:2 9 7:2 4'},
 {k:2,ru:'Два удара: тоника и октава',en:'Two hits: root and octave',s:'0:3 12:3 .:6',s2:'0:3 12:3 .:3 10:2 A',w:'0:2 0 12:2 12 0:2 0 12:2 12'},
 {k:3,sh:5,ru:'Удар с квинты снизу',en:'Hit from the fifth below',s:'-5:2 0 .:9',s2:'-5:2 0 .:6 -2:2 A',w:'0:2 0 -5:2 -5 -3:2 -3 -5:2 -5'},
 {k:4,ru:'Брейк из трёх ударов',en:'Three-hit break',s:'0:2 0 0:3 .:6',s2:'0:2 0 0:3 .:3 9:2 A',w:'0:2 3 4:2 7 9:2 7 4:2 3'},
 {k:5,ru:'Стоп с мёртвой нотой',en:'Stop with a dead note',s:'0:3 x0:3 .:6',s2:'0:3 x0:3 .:3 x0:2 A',w:'0:2 x0 7:2 x7 9:2 x9 7:2 x7'}],
R8:[{k:1,ru:'По аккорду',en:'Through the chord',a:'0:3 4:3 7:3 9:3',b:'12:3 9:3 7:3 4:3',c:'0 4 7 9 7 4 0 4 7 9 7 4',d:'12 10 9 7 9 10 12 10 9 7 5 4'},
 {k:2,ru:'Тоника, квинта, октава',en:'Root, fifth, octave',a:'0:3 7:3 12:3 7:3',b:'0:3 7:3 10:3 7:3',c:'0 7 12 7 0 7 12 7 0 7 12 7',d:'0 7 10 7 0 7 10 7 0 7 10 7'},
 {k:0,ru:'Минорная пентатоника',en:'Minor pentatonic',a:'0:3 3:3 5:3 7:3',b:'10:3 7:3 5:3 3:3',c:'0 3 5 7 5 3 0 3 5 7 10 7',d:'12 10 7 5 7 5 3 0 3 5 7 5'},
 {k:3,sh:5,ru:'Квинта и секста снизу',en:'Fifth and sixth below',a:'0:3 -5:3 -3:3 -5:3',b:'0:3 -2:3 -3:3 -5:3',c:'0 -5 -3 0 -5 -3 0 -2 -3 -5 -3 -2',d:'0 -2 -3 -5 -3 -2 0 -1 0 -5 -4 -3'},
 {k:4,ru:'Легато и вибрато',en:'Legato and vibrato',a:'0:3 3 h4:2 7:3 9:3',b:'12~:3 10:3 9:3 7:3',c:'0:2 0 3 h4 7:2 7 9 10 9 7',d:'12~:2 10 9 7 9 10 12 10 9 7 5'},
 {k:5,ru:'Секста и септима',en:'Sixth and seventh',a:'0:3 4:3 9:3 10:3',b:'12:3 10:3 9:3 7:3',c:'0 4 7 9 10 9 12 10 9 7 4 0',d:'12 10 9 7 9 10 9 7 4 0 4 7'}],
R9:[{k:2,ru:'Тоника, квинта, секста',en:'Root, fifth, sixth',a:'0m:2 0m 7m:2 7m 9m:2 9m 7m:2 7m',b:'0m:2 0m 7m:2 7m 10m:2 10m 9m:2 9m'},
 {k:0,ru:'Тоника и октава',en:'Root and octave',a:'0m:2 0m 12m:2 12m 0m:2 0m 12m:2 12m',b:'0m:2 0m 12m:2 12m 10m:2 10m 7m:2 7m'},
 {k:1,ru:'Как контрабас: долгие четверти',en:'Upright style: long quarters',a:'0m:2 0m 4m:3 7m:2 7m 9m:3',b:'12m:2 12m 9m:3 7m:2 7m 4m:3'},
 {k:3,sh:5,ru:'Квинта снизу',en:'Fifth below',a:'0m:2 0m -5m:2 -5m 0m:2 0m -5m:2 -5m',b:'0m:2 0m -5m:2 -5m -3m:2 -3m -2m:2 -2m'},
 {k:4,ru:'Минорная фигура',en:'Minor figure',a:'0m:2 3m 5m:2 7m 10m:2 7m 5m:2 3m',b:'0m:2 3m 5m:2 6m 7m:2 6m 5m:2 3m'},
 {k:5,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0m:2 0m 7m:2 7m 9m:2 9m 7m:2 7m',b:'0m:2 0m 7m:2 7m 10m:2 10m 9m:2 9m'}],
R10:[{k:3,ru:'Хроматический спуск с октавы',en:'Chromatic descent from the octave',t1:'12:3 11:3 10:3 9:3',t2:'0:3 4:3 7:3 A:3'},
 {k:0,ru:'Хроматический подъём к квинте',en:'Chromatic climb to the fifth',t1:'0:3 4:3 5:3 6:3',t2:'0:3 4:3 7:3 A:3'},
 {k:1,ru:'Спуск по септаккорду',en:'Descent through the seventh chord',t1:'12:3 10:3 7:3 4:3',t2:'0:3 -2:3 -4:3 A:3'},
 {k:2,ru:'Спуск от малой септимы',en:'Descent from the flat seventh',t1:'10:3 9:3 8:3 7:3',t2:'0:3 4:3 7:3 A:3'},
 {k:4,ru:'Спуск по блюзовой гамме',en:'Descent through the blues scale',t1:'12:3 10:3 7:3 6:3',t2:'0:3 3:3 4:3 A:3'},
 {k:5,ru:'Подъём от квинты',en:'Climb from the fifth',t1:'7:3 8:3 9:3 10:3',t2:'0:3 4:3 7:3 A:3'}],
R11:[{k:4,ru:'Ответ ниже вызова',en:'Answer below the call',a:'0:2 4 7:2 9 .:6',b:'.:6 9:2 7 0:3',c:'0:2 3 h4 7:2 9 10 9 7 .:2',d:'. 12 10 9:2 7 x7 x7 5 0:3'},
 {k:0,ru:'Ответ с октавы',en:'Answer from the octave',a:'0:2 3 4:2 7 .:6',b:'.:6 12:2 10 9:3',c:'0 3 h4 7 9 7 10 9 7 .:3',d:'. 12 10 12:2 10 9 7 5 4:3'},
 {k:1,ru:'Вызов со второй доли',en:'Call from beat two',a:'.:3 0:2 4 7:3 .:3',b:'.:3 10:2 9 7:3 .:3',c:'.:3 0 3 h4 7 9 10 9:2 7',d:'.:3 12 10 9 7:2 x7 0:3'},
 {k:3,sh:5,ru:'Вызов под тоникой',en:'Call below the root',a:'0:2 -2 -5:2 -3 .:6',b:'.:6 -2:2 -3 -5:3',c:'0 -2 -5 -3 -2 0 -2 -3 -5 .:3',d:'.:3 -2 -3 -5 -3:2 x-3 -5:3'},
 {k:2,ru:'Тот же вызов, другой конец',en:'Same call, another ending',a:'0:2 4 7:2 9 .:6',b:'0:2 4 10:2 9 .:6',c:'0 3 h4 7:2 9 7 x7 x7 .:3',d:'0 3 h4 10:2 9 7 5 3 .:3'},
 {k:5,ru:'Короткие фразы на два удара',en:'Short two-hit phrases',a:'0:2 0 7:2 7 .:6',b:'.:6 10:2 9 0:2 0',c:'0 x0 x0 7 x7 x7 9 x9 x9 .:3',d:'.:3 10 x10 x10 9 x9 x9 0:3'}],
R12:[{k:5,ru:'Тоника, квинта, секста',en:'Root, fifth, sixth',a:'0:2 0 7:2 7 9:2 9 7:2',s:'0:3 .:2 7 .:3 9:2'},
 {k:0,ru:'С октавы',en:'From the octave',a:'0:2 0 12:2 12 10:2 10 7:2',s:'0:3 .:2 12 .:3 10:2'},
 {k:1,ru:'Бугги',en:'Boogie',a:'0:2 4 7:2 9 10:2 9 7:2',s:'0:2 4 .:2 9 .:2 9 7:2'},
 {k:3,sh:5,ru:'Квинта снизу',en:'Fifth below',a:'0:2 0 -5:2 -5 -3:2 -3 -5:2',s:'0:3 .:2 -5 .:3 -3:2'},
 {k:2,ru:'Минорная фигура',en:'Minor figure',a:'0:2 3 5:2 7 10:2 7 5:2',s:'0:3 .:2 5 .:3 7:2'},
 {k:4,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0:2 0 7:2 7 9:2 9 7:2',s:'0:3 .:2 7 .:3 9:2'}],
R13:[{k:0,ru:'Пентатоника вверх',en:'Up the pentatonic',a:'0:2 3 5:2 7 10:2 7 5:2 3',b:'0:2 3 5:2 6 7:2 6 5:2 3'},
 {k:1,ru:'Тоника, квинта, септима',en:'Root, fifth, seventh',a:'0:2 0 7:2 7 10:2 10 7:2 7',b:'0:2 0 6:2 7 10:2 7 6:2 5'},
 {k:2,ru:'Спуск с октавы',en:'Down from the octave',a:'12:2 10 7:2 5 3:2 0 3:2 5',b:'12:2 10 7:2 6 5:2 3 0:2 3'},
 {k:3,sh:5,ru:'Под тоникой',en:'Below the root',a:'0:2 -2 -5:2 -2 0:2 -2 -5:2 -7',b:'0:2 -2 -5:2 -6 -5:2 -2 0:2 -2'},
 {k:4,ru:'Минорный бугги до октавы',en:'Minor boogie up to the octave',a:'0:2 3 7:2 10 12:2 10 7:2 3',b:'0:2 3 5:2 6 7:2 10 12:2 10'},
 {k:5,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0:2 3 5:2 7 10:2 7 5:2 3',b:'0:2 3 5:2 6 7:2 6 5:2 3'}],
R14:[{k:1,ru:'Бугги до септимы',en:'Boogie up to the seventh',a:'0 4 7 9 10 9 7 4',b:'0 4 7 9 12 10 9 7'},
 {k:0,ru:'Тоника и октава',en:'Root and octave',a:'0 0 12 12 0 0 12 12',b:'0 0 12 12 10 10 7 7'},
 {k:2,ru:'Тоника, квинта, секста',en:'Root, fifth, sixth',a:'0 0 7 7 9 9 7 7',b:'0 0 7 7 10 10 9 9'},
 {k:3,sh:5,ru:'Квинта и секста снизу',en:'Fifth and sixth below',a:'0 0 -5 -5 -3 -3 -5 -5',b:'0 0 -5 -5 -2 -2 -3 -3'},
 {k:4,ru:'Минорная фигура',en:'Minor figure',a:'0 3 5 7 10 7 5 3',b:'0 3 5 6 7 6 5 3'},
 {k:5,ru:'Восьмые с мёртвыми',en:'Eighths with dead notes',a:'0 x0 7 x7 9 x9 7 x7',b:'0 x0 7 x7 10 x10 9 x9'}],
R15:[{k:2,ru:'Вверх к квинте',en:'Up to the fifth',a:'0:2 0 3:2 3 5:2 6 7:3',l:'0:2 3 5 h6 h7 10:2 7 6 p5 3'},
 {k:0,ru:'Вниз от квинты',en:'Down from the fifth',a:'7:2 7 6:2 5 3:2 3 0:3',l:'7 p6 p5 3:2 0 5:2 h6 7:3'},
 {k:1,ru:'Сверху от октавы',en:'Down from the octave',a:'12:2 12 10:2 10 7:2 6 5:3',l:'12:2 10 7:2 6 p5 3:2 0:3'},
 {k:3,sh:5,ru:'Под тоникой',en:'Below the root',a:'0:2 0 -2:2 -2 -5:2 -6 -7:3',l:'0:2 -2 -5 h-4 h-3 -2:2 -3 -4 p-5 -2'},
 {k:4,ru:'Через малую терцию',en:'Through the minor third',a:'0:2 3 4:2 3 5:2 6 7:3',l:'0:2 3 h4 5 h6 h7 3:2 6 p5 0'},
 {k:5,pr:'12s',ru:'Медленная смена',en:'Slow change',a:'0:2 0 3:2 3 5:2 6 7:3',l:'0:2 3 5 h6 h7 10:2 7 6 p5 3'}]
};
const LB1=p=>[['2',F(p.a)],['4',F(p.a)],[pr(p),F(p.a)],[pr(p),F(dead(p.a))],[pr(p),F(appr(dead(p.a)))]];
const LR7=p=>[['2',F(p.s)],['4',F(p.s)],['12',(c,i)=>i<4?p.s:p.w],['12',(c,i)=>i<4?p.s2:p.w],['12',(c,i)=>i<4?p.s2:appr(p.w)]];
const LR9=p=>[['2',F(p.a)],['4',F(p.a)],[pr(p),alt(p.a,p.b)],[pr(p),alt(om(p.a),om(p.b))],[pr(p),alt(om(p.a),appr(om(p.b)))]];
const LR10=p=>{const T=c=>c===0?p.t1:p.t2;return [['TA',T],['T4',T],['12',last(WALK,T)],['12',last(WALK,c=>shq(T(c)))],['12',last(WALK,c=>trp(T(c)))]];};
const LR12=p=>{const A=s=>(c,i,nx)=>s+' '+(nx-c);return [['IV',A(p.a)],['4',A(p.a)],[pr(p),A(p.a)],[pr(p),A(p.s)],[pr(p),A(dead(p.s))]];};
const LR14=p=>[['2',F(p.a)],['4',F(p.a)],['12',F(p.a)],['12',alt(p.a,p.b)],['12',(c,i)=>{const s=ev(i)?p.a:appr(p.b);return i>=4&&i<8?shf8(s):s;},null,j=>j===1?'/3 ':j===2?'/2 ':'']];
const LR15=p=>[['2',F(p.a)],['4',F(p.a)],[pr(p),F(p.a)],[pr(p),F(p.l)],[pr(p),F(appr(p.l))]];

const EX={
W0:{name:'Разминка',goal:'Разогреть руки и включить слух на свинг.',how:'Без баса минуту: потри ладони до тепла, круги кистями и плечами, сожми и раскрой кулаки 20 раз. Затем медленная хроматика в пятой позиции шаффлом: долгая нота и короткая.',hf:'Указательный и средний по очереди, удар мягкий, палец ложится на соседнюю струну.',hp:'Вниз на долгую ноту, вверх на короткую, медиатор неглубоко.',tip:'Только мягкие движения. Свинг здесь важнее точности ладов: «та-а-та, та-а-та».',sub:3,v:[{l:'Хроматика шаффлом',t:['E5:2 E5 E6:2 E6 E7:2 E7 E8:2 E8 | A5:2 A5 A6:2 A6 A7:2 A7 A8:2 A8','D5:2 D5 D6:2 D6 D7:2 D7 D8:2 D8 | G5:2 G5 G6:2 G6 G7:2 G7 G8:2 G8']}]},
W1:{name:'Мобилизация без баса',goal:'Разогнать кровь в кистях, предплечьях и плечах.',how:'Потри ладони до тепла. Круги кистями в обе стороны по 10 раз. Плечи вверх, назад, вниз: ремень баса давит на левое плечо. Сожми и раскрой кулаки 20 раз. Потряси расслабленными кистями.',hf:'Отдельно разомни подушечки пальцев правой руки: ими весь блюз щипаются струны.',hp:'Покрути запястьем правой руки, как будто играешь медиатором в воздухе, — свободно, без зажима.',tip:'Никакой растяжки через боль: только тепло и подвижность.'},
W2:{name:'Медленный уокинг',goal:'Включить синхронизацию рук на четвертях.',how:'Чистый звук, темп заведомо низкий. Четвертями вверх по аккорду и вниз по хроматике: каждая нота звучит до следующей.',hf:'Чередуй указательный и средний, опорный удар.',hp:'Только вниз, ровная атака.',tip:'Слушай, чтобы между нотами не было дыр: уокинг — это непрерывная линия.',sub:3,v:[{l:'Уокинг в пятой позиции',t:['A5:3 A9:3 D7:3 D9:3 | G7:3 G6:3 G5:3 D9:3','D7:3 D5:3 A8:3 A7:3 | A6:3 A5:3 E7:3 E6:3']}]},
W3:{name:'Медленные октавы шаффлом',goal:'Подготовить обе руки к перескокам.',how:'Чистый звук. Тоника и октава через струну в ритме шаффла, затем то же от следующего лада. Темп — половина рабочего.',hf:'Указательный на тонику, средний на октаву; большой палец глушит струну {s:E}, когда играешь октаву.',hp:'Вниз на тонику, вверх на октаву; медиатор перелетает через струну.',tip:'Цель — тёплые руки, а не скорость.',sub:3,v:[{l:'Октавы',t:['E5:2 D7 E5:2 D7 E7:2 D9 E7:2 D9 | A5:2 G7 A5:2 G7 A7:2 G9 A7:2 G9']}]},

B1:{n:1,name:'Шаффл на тонике',goal:'Ровный свинг правой руки: долгая и короткая.',how:'Каждая доля — две ноты: долгая на две трети, короткая на треть. Тоника аккорда, на смене аккорда — новая тоника.',hf:'Указательный на долгую, средний на короткую. Короткая тише, но звучит.',hp:'Вниз на долгую, вверх на короткую; рука качается, как маятник.',tip:'Шаффл — не две ровные восьмые. Пой «та-а-та»: середина триоли молчит.',sub:3,lvl:["Фигура на тонике, два такта","Смена I–IV","Весь квадрат","Короткая нота — мёртвая","Мёртвые и подход к каждому аккорду"],v:V(D.B1,LB1)},
B2:{n:2,name:'Тоника, квинта, секста',goal:'Главная фигура блюзового баса.',how:'Шаффл: тоника, квинта, секста и обратно. Фигура одна на все аккорды, сдвигается вместе с тоникой.',hf:'Тоника и квинта на соседних струнах: указательный — средний, опорный удар.',hp:'Вниз на долгую, вверх на короткую, даже при смене струны.',tip:'Левая рука: тоника — 1-й палец, квинта — 3-й, секста — 4-й (или 1-й с переходом). Пальцы не взлетают.',sub:3,lvl:["Фигура на тонике, два такта","Смена I–IV","Весь квадрат","Через такт — ответная фигура","Ответная фигура ведёт к аккорду"],v:V(D.B2,LG)},
B3:{n:3,name:'Уокинг четвертями',goal:'Непрерывная линия четвертями через весь квадрат.',how:'Четыре ноты на такт: вверх по аккорду (тоника, терция, квинта, секста), в следующем такте вниз с октавы. Последняя доля ведёт к следующему аккорду.',hf:'Чередуй пальцы строго, даже на одной струне. Нота держится до следующей.',hp:'Только вниз; каждая нота одной громкости.',tip:'Слушай тонику на первой доле: по ней слушатель понимает, где квадрат.',sub:3,lvl:["Вверх и обратно, два такта","Смена I–IV","Весь квадрат","Подход на 4-й доле","Скип-ноты: триольные восьмые и мёртвые"],v:V(D.B3,LW1)},
B4:{n:4,name:'Хроматические ходы',goal:'Вести линию к цели по полутонам.',how:'Четвертями от тоники вверх по полутонам к терции и квинте, обратно — к подходу на следующий аккорд.',hf:'Один палец на лад, указательный и средний по очереди.',hp:'Только вниз или альтернейт — но выбери одно и держи.',tip:'Хроматика звучит, только если приходит в ноту аккорда на сильную долю.',sub:3,lvl:["Ход и ответ, два такта","Смена I–IV","Весь квадрат","Ответный ход ведёт к аккорду","Триоли и мёртвые ноты"],v:V(D.B4,LW1)},
B5:{n:5,name:'Мёртвые ноты',goal:'Перкуссия в линии: глухой щелчок вместо ноты.',how:'Короткая доля шаффла — мёртвая нота (x): левая рука лежит на струне, не прижимая её. Дальше мёртвые триоли и перескоки.',hf:'Мёртвая нота — тот же удар пальца, просто левая рука ослабляет нажим.',hp:'Мёртвая нота — апстрок по приглушённой струне.',tip:'Мёртвая нота тише настоящей, но ритмически такая же чёткая.',sub:3,lvl:["Фигура на тонике, два такта","Смена I–IV","Весь квадрат","Через такт — ответная фигура","Ответ ведёт к аккорду"],v:V(D.B5,LG)},
R6:{name:'Бугги',goal:'Классическая бугги-линия через весь квадрат.',how:'Шаффл по две ноты на долю: тоника, терция, квинта, секста, септима и обратно. Фигура сдвигается с аккордом.',hf:'Указательный — средний строго по очереди, на смене струны опорный удар.',hp:'Вниз-вверх в ритме шаффла, рука не останавливается.',tip:'Бугги тянет вперёд: не замедляйся на спуске.',sub:3,lvl:["Фигура на тонике, два такта","Смена I–IV","Весь квадрат","Через такт — вторая фигура","Подход в конце второй фигуры"],v:V(D.R6,LG)},
R7:{name:'Стоп-тайм',goal:'Удар и тишина: точные вступления после паузы.',how:'Одна нота на первую долю — и тишина до конца такта. Во второй половине квадрата линия играет дальше шаффлом.',hf:'Удар — и сразу глуши: средний палец ложится на струну, левая рука ослабляет нажим.',hp:'Удар вниз — и ребро ладони на струны.',tip:'В тишине считай доли про себя. Следующий удар — ровно на долю, без подкрадывания.',sub:3,lvl:["Стоп на тонике","Смена I–IV","Четыре такта стопов, дальше линия","Подход в паузе стопа","Линия ведёт к каждому аккорду"],v:V(D.R7,LR7)},
R8:{name:'Медленный блюз 12/8',goal:'Тяжёлое медленное качание в 12/8.',how:'Размер 12/8: щелчок — восьмая, в такте четыре группы по три. Линия идёт по аккорду, подход ведёт к следующему.',hf:'Мягкий удар подушечкой, нота держится до следующей.',hp:'Медиатор ближе к грифу — звук круглее.',tip:'В медленном блюзе ошибка — спешка. Каждая группа из трёх — одна волна.',sub:3,lvl:["Фигура и ответ, два такта","Смена I–IV","Весь квадрат","Восьмые: плотная фигура","Плотная фигура ведёт к аккорду"],v:V(D.R8,LW2)},
R9:{name:'Шаффл с приглушением',goal:'Короткий плотный звук: приглушение ребром ладони.',how:'m — приглушение: ребро правой ладони у бриджа. Затем долгая нота открыто, короткая — приглушённо.',hf:'Ребро ладони у бриджа, щипок большим пальцем — звук как у контрабаса.',hp:'Ребро ладони лежит на струнах у бриджа, медиатор работает под ним.',tip:'Приглушённая нота всё ещё нота: высота слышна, гула нет.',sub:3,lvl:["Фигура приглушённо, два такта","Смена I–IV","Весь квадрат, через такт — вторая фигура","Долгая открыто, короткая приглушённо","Подход к следующему аккорду"],v:V(D.R9,LR9)},
R10:{name:'Тёрнэраунды',goal:'Последние такты квадрата, которые возвращают к началу.',how:'Такт I — спуск с октавы, такт V — ход вверх к подходу на тонику. Дальше тёрнэраунд в конце целого квадрата.',hf:'На спуске по одной струне чередуй пальцы, не скользи одним.',hp:'Альтернейт на спуске, вниз на первую долю.',tip:'Тёрнэраунд — сигнал «квадрат заново». Играй его увереннее, чем середину.',sub:3,lvl:["Два такта: I и V","Последние четыре такта","Квадрат 12 тактов с тёрнэраундом","Тёрнэраунд шаффлом","Тёрнэраунд триолями с мёртвой нотой"],v:V(D.R10,LR10)},
R11:{name:'Вызов и ответ',goal:'Фраза и ответ: бас разговаривает сам с собой.',how:'Чётный такт — вызов, нечётный — ответ после паузы. Паузы — часть фразы, в них тишина.',hf:'В паузе пальцы правой руки лежат на струнах и глушат их.',hp:'В паузе ребро ладони на струнах.',tip:'Ответ отличается от вызова: другим концом, другой высотой или ритмом.',sub:3,lvl:["Вызов и ответ","Смена I–IV","Весь квадрат","Плотнее: легато, мёртвые, восьмые","Ответ ведёт к аккорду"],v:V(D.R11,LW2)},
R12:{name:'Предвосхищение',goal:'Смена аккорда на последнюю долю такта раньше.',how:'Последняя короткая нота такта — уже тоника следующего аккорда. Так бас тянет квадрат вперёд.',hf:'Короткая нота на смене струны — тем же пальцем, что и следующая долгая, если так ровнее.',hp:'Короткая нота — апстрок, первая доля нового такта — вниз.',tip:'Предвосхищение должно звучать нарочно: короткая нота чёткая, не смазанная.',sub:3,lvl:["Фигура и предвосхищение","Смена I–IV","Весь квадрат","Синкопы на «и»","Синкопы мёртвыми нотами"],v:V(D.R12,LR12)},
R13:{name:'Минорный блюз',goal:'Шаффл в миноре: малая терция и блюзовая нота.',how:'Тот же квадрат, но аккорды минорные: тоника, малая терция, кварта, квинта, малая септима.',hf:'Указательный — средний, опорный удар на смене струны.',hp:'Вниз-вверх в ритме шаффла.',tip:'Пониженная квинта — проходящая: на ней не задерживайся.',sub:3,lvl:["Фигура на тонике, два такта","Смена I–IV","Весь квадрат","Через такт — блюзовая нота","Подход к следующему аккорду"],v:V(D.R13,LG)},
R14:{name:'Прямые восьмые и шаффл',goal:'Переключать ровные восьмые и свинг.',how:'Сначала бугги ровными восьмыми, как в рок-н-ролле. На последнем уровне квадрат меняет ритм: четыре такта ровно, четыре шаффлом, четыре снова ровно.',hf:'Ровные восьмые — одинаковые удары; в шаффле короткая тише.',hp:'Ровные восьмые — альтернейт или только вниз; в шаффле вниз-вверх.',tip:'Смена ритма — без смены темпа: доля та же, меняется только её деление.',sub:2,lvl:["Фигура на тонике, два такта","Смена I–IV","Весь квадрат","Через такт — вторая фигура","Ровно — шаффл — ровно"],v:V(D.R14,LR14)},
R15:{name:'Блюзовая нота',goal:'Пониженная квинта в риффе: проходящая, а не опорная.',how:'Рифф через кварту, пониженную квинту и квинту. Дальше легато: нота на струне — удар, следующие — хаммером и пулл-оффом.',hf:'Удар только на первой ноте легато; хаммер — палец левой руки падает на лад с силой.',hp:'Медиатор только на первую ноту легато.',tip:'Пониженная квинта звучит «грязно» — так и надо, но коротко.',sub:3,lvl:["Рифф на тонике, два такта","Смена I–IV","Весь квадрат","Легато через блюзовую ноту","Легато и подход"],v:V(D.R15,LR15)}
};

const EXEN={
W0:{name:'Warm-up',goal:'Warm up the hands and get the ears into swing.',how:'One minute without the bass: rub your palms until warm, circle your wrists and shoulders, clench and open your fists 20 times. Then slow chromatics in fifth position as a shuffle: a long note and a short one.',hf:'Alternate index and middle, a soft stroke, the finger comes to rest on the next string.',hp:'Down on the long note, up on the short one, keep the pick shallow.',tip:'Gentle movements only. Here the swing matters more than the frets: “daa-da, daa-da”.',v:['Shuffle chromatics']},
W1:{name:'Mobility without the bass',goal:'Get blood flowing in the hands, forearms and shoulders.',how:'Rub your palms until warm. Circle your wrists both ways 10 times. Shoulders up, back, down: the bass strap pulls on the left shoulder. Clench and open your fists 20 times. Shake out your relaxed hands.',hf:'Work the fingertips of the plucking hand separately: they pluck every note of the blues.',hp:'Roll the picking wrist as if picking in the air: loose, no tension.',tip:'No stretching into pain: just warmth and mobility.'},
W2:{name:'Slow walking',goal:'Switch on hand sync in quarter notes.',how:'Clean tone, deliberately slow tempo. Quarter notes up the chord and down chromatically: every note lasts until the next one.',hf:'Alternate index and middle, rest strokes.',hp:'Downstrokes only, even attack.',tip:'Listen for no gaps between notes: a walking line is one continuous line.',v:['Walking in fifth position']},
W3:{name:'Slow shuffle octaves',goal:'Prepare both hands for string skips.',how:'Clean tone. Root and octave across a string in a shuffle rhythm, then the same one fret higher. Half your working tempo.',hf:'Index on the root, middle on the octave; the thumb mutes the {s:E} string while the octave plays.',hp:'Down on the root, up on the octave; the pick hops over the string.',tip:'The goal is warm hands, not speed.',v:['Octaves']},
B1:{name:'Root-note shuffle',goal:'An even swing in the plucking hand: long and short.',how:'Every beat is two notes: the long one takes two thirds, the short one a third. Play the chord root; when the chord changes, the new root.',hf:'Index on the long note, middle on the short one. The short note is softer but still sounds.',hp:'Down on the long note, up on the short one; the hand swings like a pendulum.',tip:'A shuffle is not two even eighths. Sing “daa-da”: the middle of the triplet stays silent.',lvl:["Figure on the root, two bars","I–IV change","Whole form","Short note dead","Dead notes and an approach to every chord"],v:VE(D.B1)},
B2:{name:'Root, fifth, sixth',goal:'The core figure of blues bass.',how:'Shuffle: root, fifth, sixth and back. One figure for every chord, it moves with the root.',hf:'Root and fifth sit on neighbouring strings: index then middle, rest strokes.',hp:'Down on the long note, up on the short one, even across a string change.',tip:'Fretting hand: root with finger 1, fifth with 3, sixth with 4 (or 1 with a shift). Keep the fingers low.',lvl:["Figure on the root, two bars","I–IV change","Whole form","Answer figure every other bar","The answer leads into the next chord"],v:VE(D.B2)},
B3:{name:'Quarter-note walking',goal:'One continuous quarter-note line through the whole form.',how:'Four notes a bar: up the chord (root, third, fifth, sixth), next bar down from the octave. The last beat leads into the next chord.',hf:'Alternate fingers strictly, even on one string. Hold every note until the next.',hp:'Downstrokes only; every note the same volume.',tip:'Listen for the root on beat one: it tells the listener where the form is.',lvl:["Up and back, two bars","I–IV change","Whole form","Approach on beat 4","Skip notes: triplet eighths and dead notes"],v:VE(D.B3)},
B4:{name:'Chromatic lines',goal:'Lead the line to its target by half steps.',how:'Quarter notes from the root up by half steps to the third and fifth, then back toward an approach into the next chord.',hf:'One finger per fret, index and middle alternating.',hp:'Downstrokes only or alternate picking: pick one and stick with it.',tip:'Chromatics only work when they land on a chord tone on a strong beat.',lvl:["Line and answer, two bars","I–IV change","Whole form","The answer leads into the next chord","Triplets and dead notes"],v:VE(D.B4)},
B5:{name:'Dead notes',goal:'Percussion in the line: a dull click instead of a note.',how:'The short note of the shuffle is a dead note (x): the fretting hand rests on the string without pressing it. Then dead-note triplets and skips.',hf:'A dead note is the same finger stroke, the fretting hand just eases off.',hp:'A dead note is an upstroke on a muted string.',tip:'A dead note is softer than a real one but rhythmically just as sharp.',lvl:["Figure on the root, two bars","I–IV change","Whole form","Answer figure every other bar","The answer leads into the next chord"],v:VE(D.B5)},
R6:{name:'Boogie',goal:'The classic boogie line through the whole form.',how:'Shuffle, two notes per beat: root, third, fifth, sixth, seventh and back. The figure moves with the chord.',hf:'Index and middle strictly alternating, rest stroke on a string change.',hp:'Down-up in the shuffle rhythm, the hand never stops.',tip:'Boogie pulls forward: do not slow down on the way back.',lvl:["Figure on the root, two bars","I–IV change","Whole form","Second figure every other bar","Approach at the end of the second figure"],v:VE(D.R6)},
R7:{name:'Stop-time',goal:'Hit and silence: precise entries after a rest.',how:'One note on beat one, then silence to the end of the bar. In the second half of the form the line goes on as a shuffle.',hf:'Hit, then mute at once: the middle finger lands on the string, the fretting hand eases off.',hp:'Downstroke, then the edge of the palm onto the strings.',tip:'Count the beats in your head through the silence. The next hit lands right on the beat, no creeping in.',lvl:["Stop on the root","I–IV change","Four bars of stops, then the line","Approach inside the stop","The line leads into every chord"],v:VE(D.R7)},
R8:{name:'Slow blues in 12/8',goal:'A heavy, slow sway in 12/8.',how:'12/8: a click is an eighth, four groups of three in a bar. The line follows the chord and an approach leads to the next one.',hf:'A soft stroke with the finger pad, every note held until the next.',hp:'Pick closer to the neck for a rounder sound.',tip:'In a slow blues the mistake is rushing. Every group of three is one wave.',lvl:["Figure and answer, two bars","I–IV change","Whole form","Eighths: the dense figure","The dense figure leads into the next chord"],v:VE(D.R8)},
R9:{name:'Muted shuffle',goal:'A short, tight sound: muting with the edge of the palm.',how:'m is a mute: the edge of the plucking palm near the bridge. Then the long note open, the short one muted.',hf:'Edge of the palm near the bridge, pluck with the thumb: it sounds like an upright bass.',hp:'The edge of the palm rests on the strings near the bridge, the pick works under it.',tip:'A muted note is still a note: you hear the pitch, not the boom.',lvl:["Muted figure, two bars","I–IV change","Whole form, second figure every other bar","Long note open, short one muted","Approach to the next chord"],v:VE(D.R9)},
R10:{name:'Turnarounds',goal:'The last bars of the form that bring you back to the top.',how:'The I bar steps down from the octave, the V bar climbs to an approach into the root. Then the turnaround at the end of a full form.',hf:'Alternate fingers on a descent along one string, do not drag one finger.',hp:'Alternate picking on the descent, a downstroke on beat one.',tip:'A turnaround says “from the top”. Play it with more conviction than the middle.',lvl:["Two bars: I and V","The last four bars","12-bar form with a turnaround","Shuffle turnaround","Triplet turnaround with a dead note"],v:VE(D.R10)},
R11:{name:'Call and response',goal:'Phrase and answer: the bass talks to itself.',how:'Even bar is the call, odd bar the response after a rest. The rests are part of the phrase: silence in them.',hf:'During the rest the plucking fingers lie on the strings and mute them.',hp:'During the rest the edge of the palm lies on the strings.',tip:'The response differs from the call: another ending, another register or rhythm.',lvl:["Call and answer","I–IV change","Whole form","Denser: legato, dead notes, eighths","The answer leads into the next chord"],v:VE(D.R11)},
R12:{name:'Anticipation',goal:'Change the chord one short note early.',how:'The last short note of the bar is already the root of the next chord. That is how the bass pushes the form forward.',hf:'On a string change, play the short note with the same finger as the next long one if that is smoother.',hp:'The short note is an upstroke, beat one of the new bar a downstroke.',tip:'An anticipation should sound deliberate: the short note crisp, not smeared.',lvl:["Figure and anticipation","I–IV change","Whole form","Syncopation on the “and”","Syncopation with dead notes"],v:VE(D.R12)},
R13:{name:'Minor blues',goal:'A minor shuffle: minor third and the blue note.',how:'The same form with minor chords: root, minor third, fourth, fifth, minor seventh.',hf:'Index and middle, rest stroke on a string change.',hp:'Down-up in the shuffle rhythm.',tip:'The flat fifth is a passing note: do not linger on it.',lvl:["Figure on the root, two bars","I–IV change","Whole form","Blue note every other bar","Approach to the next chord"],v:VE(D.R13)},
R14:{name:'Straight eighths and shuffle',goal:'Switch between even eighths and swing.',how:'Boogie in straight eighths first, like rock and roll. On the top level the form changes feel: four bars straight, four as a shuffle, four straight again.',hf:'Straight eighths are equal strokes; in the shuffle the short note is softer.',hp:'Straight eighths: alternate or downstrokes only; in the shuffle down-up.',tip:'Change the feel without changing the tempo: the beat stays, only its subdivision changes.',lvl:["Figure on the root, two bars","I–IV change","Whole form","Second figure every other bar","Straight, shuffle, straight"],v:VE(D.R14)},
R15:{name:'Blue note',goal:'The flat fifth in a riff: passing, not resting.',how:'A riff through the fourth, flat fifth and fifth. Then legato: pick the first note on a string, the next ones with hammer-ons and pull-offs.',hf:'Pluck only the first note of the legato; on a hammer-on the fretting finger drops onto the fret with force.',hp:'Pick only the first note of the legato.',tip:'The flat fifth sounds “dirty”, which is right, but keep it short.',lvl:["Riff on the root, two bars","I–IV change","Whole form","Legato through the blue note","Legato and approach"],v:VE(D.R15)}
};

const E0=(prog,fig)=>form(0,P[prog],fig);
const TESTS=[
  {id:'BBT1',ru:['Шаффл на открытой {o:E}','Тоника шаффлом, держать 30 секунд без сбоя свинга.'],en:['Shuffle on the open {o:E}','Root-note shuffle, hold 30 seconds without losing the swing.'],sub:3,t:[R('E0:2 E0',4)]},
  {id:'BBT2',ru:['Уокинг по квадрату','12 тактов четвертями в {E} с подходами, два квадрата подряд.'],en:['Walking through the form','12 bars of quarter notes in {E} with approaches, two forms in a row.'],sub:3,t:E0('12',WALK)},
  {id:'BBT3',ru:['Бугги на выносливость','Бугги на {E}, держать 60 секунд.'],en:['Boogie endurance','Boogie in {E}, hold 60 seconds.'],sub:3,t:E0('2',F('0:2 4 7:2 9 10:2 9 7:2 4'))},
  {id:'BBT4',ru:['Мёртвые ноты','Шаффл с мёртвыми нотами по квадрату в {E}, без сбоя.'],en:['Dead notes','Shuffle with dead notes through the form in {E}, without a slip.'],sub:3,t:E0('12',F('0:2 x0 7:2 x7 9:2 x9 7:2 x7'))},
  {id:'BBT5',ru:['Тёрнэраунд','Последние четыре такта квадрата в {E}, четыре раза подряд без сбоя.'],en:['Turnaround','The last four bars of the form in {E}, four times in a row without a slip.'],sub:3,t:E0('T4',(c,i)=>i===2?'12:3 11:3 10:3 9:3':'0:3 4:3 7:3 A:3')}
];
const RIFF={
  ru:['хотя бы одна пауза длиной в целую долю','перед возвратом на тонику — пониженная квинта','только две нижние струны','хотя бы одна триоль на одной доле','второй раз рифф отвечает сам себе: другой конец','тоника звучит на каждой первой доле','не больше пяти разных нот','рифф начинается с затакта: хроматический подход к тонике','половина риффа ровными восьмыми, половина шаффлом','в риффе есть мёртвая нота','одно место с двойными нотами: квинта или децима','медленно, в 12/8, но рифф качает'],
  en:['at least one rest a full beat long','a flat fifth right before returning to the root','only the two lowest strings','at least one triplet on a single beat','the second time through the riff answers itself: a different ending','the root lands on every beat one','no more than five different notes','the riff starts with a pickup: a chromatic approach to the root','half the riff in straight eighths, half as a shuffle','includes a dead note','one spot with double stops: a fifth or a tenth','slow, in 12/8, but it grooves']
};
return {EX,EXEN,COACH:{W0:{free:60}},TESTS,RIFF};
})();
/*@BLUES_BASS_2@*/
// Бас, блюз, часть 2: A16–A23, A37, L24–L31, L38, C32–C36. Все табы строятся от тоники r на струне E (вариант = тональность).
// I — тоника на E (лад r), IV — на A (лад r), V — на A (лад r+2); интервал в полутонах ставится в «коробку» вокруг тоники аккорда.
const BLB2=(()=>{
  const S='EADG';
  // варианты меняют материал: тональность, струна тоники, раскладка IV/V и штрих
  // st — струна тоники (0 — E, 1 — A); ln — IV и V на той же струне со сменой позиции, иначе «коробкой» на соседней струне;
  // ar — штрих: '' обычный, 'gh' — короткая свинговая нота мёртвая, 'st' — четверти стаккато
  const VARS=[{r:5,k:'A',st:0,ln:0,ar:''},{r:5,k:'D',st:1,ln:1,ar:''},{r:3,k:'G',st:0,ln:0,ar:'gh'},{r:3,k:'C',st:1,ln:1,ar:'st'},{r:7,k:'B',st:0,ln:0,ar:'st'},{r:2,k:'B',st:1,ln:1,ar:'gh'}];
  const VL_RU=['позиция {s:E}, IV и V «коробкой» на соседней струне','от струны {s:A}, IV и V на той же струне со сменой позиции','низкая позиция {s:E}, мёртвые ноты на свинге','от струны {s:A} со сменой позиции, четверти стаккато','высокая позиция {s:E}, четверти стаккато','низко на {s:A} со сменой позиции, мёртвые ноты на свинге'];
  const VL_EN=['{s:E}-string position, IV and V as a box on the next string','from the {s:A} string, IV and V on the same string with a shift','low {s:E}-string position, dead notes on the swing','from the {s:A} string with shifts, staccato quarters','high {s:E}-string position, staccato quarters','low on the {s:A} string with shifts, dead notes on the swing'];
  let ART='';
  // интервал → [струна выше, сдвиг лада]
  const BOX={'-3':[0,-3],'-2':[0,-2],'-1':[0,-1],0:[0,0],1:[0,1],2:[0,2],3:[0,3],4:[1,-1],5:[1,0],6:[1,1],7:[1,2],8:[1,3],9:[2,-1],10:[2,0],11:[2,1],12:[2,2],14:[2,4]};
  const sp=(s,f,[a,b])=>{s+=a;f+=b;if(s<0||s>3||f<0||f>17)throw new Error('BLB2: нота вне грифа');return S[s]+f;};
  const key=V=>{const r=V.r,o=V.st,K={I:[o,r],IV:V.ln?[o,r+5]:[o+1,r],V:V.ln?[o,r+7]:[o+1,r+2],IV2:[o,r+5],V2:[o,r+7]};
    const c=(ch,i)=>Array.isArray(i)?sp(K[ch][0],K[ch][1],i):sp(K[ch][0],K[ch][1],BOX[i]);
    c.s=(ch,a)=>a.map(i=>c(ch,i));return c;};
  // ритм (деление 3 — свинг): четверть, половина, свинговая пара «долгая-короткая», пауза на долю
  const q=x=>ART==='st'&&/^[EADG]\d+$/.test(x)?x+':2 .':x+':3',hf=x=>x+':6',sw=(a,b)=>a+':2 '+b,P='.:3';
  const Qb=a=>a.map(q).join(' ');
  const pl=t=>/^[EADG]\d+$/.test(t);
  const Sb=a=>{const o=[];for(let i=0;i<a.length;i+=2)o.push(sw(a[i],ART==='gh'&&i+2<a.length&&pl(a[i])&&pl(a[i+1])?a[i][0]+'x':a[i+1]));return o.join(' ');};
  const Tb=a=>a.join(' ');
  const X=t=>t[0]+'x',H=t=>t[0]+'h'+t.slice(1),Pu=t=>t[0]+'p'+t.slice(1),Vb=(t,k)=>t+'~:'+k;
  // прогрессии; L — по такту на аккорд, системы по 4 такта
  const P2=['I','IV'],P4=['I','IV','I','V'],P8=['I','IV','I','I','IV','IV','I','V'],TW=['I','I','I','I','IV','IV','I','I','V','IV','I','V'],II=['I','I'];
  const L=(pr,fn)=>{const b=pr.map((ch,i)=>fn(ch,pr[(i+1)%pr.length],i)),o=[];for(let i=0;i<b.length;i+=4)o.push(b.slice(i,i+4).join(' | '));return o;};
  // ход от аккорда ch к аккорду n: красивые хроматические ходы там, где они есть
  const wk=(c,ch,n)=>ch==='I'&&n==='IV'?c.s('I',[0,2,3,4]):ch==='I'&&n==='V'?c.s('I',[0,4,5,6]):ch==='IV'&&n==='I'?[c('IV',0),c('I',3),c('I',2),c('I',1)]:ch==='V'&&(n==='I'||n==='IV')?[c('V',0),c('V',-1),c('IV',0),n==='I'?c('I',1):c('IV',-1)]:[...c.s(ch,[0,4,7]),c(n,-1)];
  // упражнения: g — 5 уровней, каждый (c) → таб
  const G={
    A16:[c=>L(P2,ch=>Qb(c.s(ch,[0,4,7,4]))),
         c=>L(['I','I','IV','IV'],(ch,n,i)=>Qb(c.s(ch,i%2?[12,10,7,4]:[0,4,7,10]))),
         c=>L(P4,ch=>Sb(c.s(ch,[0,4,7,10,12,10,7,4]))),
         c=>L(P4,(ch,n)=>Sb([...c.s(ch,[0,4,7,9,10,9,7]),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>Sb([...c.s(ch,i%2?[12,10,9,7,4,0,4]:[0,4,7,9,10,9,7]),c(n,-1)]))],
    A17:[c=>L(II,(ch,n,i)=>Qb(c.s(ch,i?[14,10,7,4]:[0,4,7,10]))),
         c=>L(P2,ch=>Sb(c.s(ch,[0,4,7,10,14,10,7,4]))),
         c=>L(P4,ch=>Tb(c.s(ch,[0,4,7,10,14,10,7,4,0,4,7,4]))),
         c=>L(P4,(ch,n)=>Tb([...c.s(ch,[0,4,7,10,14,12,10,7,4]),q(c(n,-1))])),
         c=>L(TW,(ch,n,i)=>i%2?Sb([...c.s(ch,[14,12,10,7,4,0,4]),c(n,-1)]):Tb([...c.s(ch,[0,4,7,10,14,12,10,7,4]),q(c(n,-1))]))],
    A18:[c=>L(P2,ch=>Qb(c.s(ch,[0,7,9,7]))),
         c=>L(P2,ch=>Sb(c.s(ch,[0,7,9,7,0,7,9,7]))),
         c=>L(P4,ch=>Sb(c.s(ch,[0,7,9,10,9,7,0,7]))),
         c=>L(['I','I','IV','IV'],(ch,n,i)=>Sb(c.s(ch,i%2?[10,10,9,9,7,7,4,4]:[0,0,4,4,7,7,9,9]))),
         c=>L(TW,(ch,n,i)=>Sb([...c.s(ch,i%2?[10,9,7,4,0,7,9]:[0,7,9,10,12,10,9]),c(n,-1)]))],
    A19:[c=>L(II,(ch,n,i)=>Qb(c.s(ch,i?[12,10,7,5]:[0,3,5,7]))),
         c=>L(II,(ch,n,i)=>Sb(c.s(ch,i?[12,10,7,5,3,0,3,5]:[0,3,5,7,10,12,10,7]))),
         c=>L(P2,ch=>Tb(c.s(ch,[0,3,5,7,10,12,10,7,5,3,0,3]))),
         c=>L(P4,ch=>Tb(c.s(ch,[0,3,5,3,5,7,5,7,10,7,10,12]))),
         c=>L(TW,(ch,n,i)=>i%2?Tb([...c.s(ch,[12,10,7,5,3,0,3,5,7,5,3]),c(n,-1)]):Tb(c.s(ch,[0,3,5,3,5,7,5,7,10,7,10,12])))],
    A20:[c=>L(II,(ch,n,i)=>Qb(c.s(ch,i?[12,9,7,4]:[0,2,4,7]))),
         c=>L(II,(ch,n,i)=>Sb(c.s(ch,i?[12,9,7,4,2,0,2,4]:[0,2,4,7,9,12,9,7]))),
         c=>L(P2,ch=>Tb(c.s(ch,[0,2,4,7,9,12,9,7,4,2,0,2]))),
         c=>L(P4,ch=>Tb(c.s(ch,[0,2,4,2,4,7,4,7,9,7,9,12]))),
         c=>L(TW,(ch,n,i)=>i%2?Tb([...c.s(ch,[12,9,7,4,2,0,2,4,7,4,2]),c(n,-1)]):Tb(c.s(ch,[0,2,4,2,4,7,4,7,9,7,9,12])))],
    A21:[c=>L(II,(ch,n,i)=>Qb(c.s(ch,i?[7,6,5,3]:[0,3,5,6]))),
         c=>L(II,(ch,n,i)=>Sb(c.s(ch,i?[12,10,7,6,5,3,0,3]:[0,3,5,6,7,10,12,10]))),
         c=>L(P2,ch=>Tb(c.s(ch,[0,3,5,6,7,10,12,10,7,6,5,3]))),
         c=>L(P4,ch=>Tb([c(ch,0),c(ch,3),c(ch,5),H(c(ch,6)),H(c(ch,7)),c(ch,10),c(ch,12),c(ch,10),c(ch,7),Pu(c(ch,6)),Pu(c(ch,5)),c(ch,3)])),
         c=>L(TW,(ch,n,i)=>i%2?Sb([...c.s(ch,[0,3,5,6,7,6,5]),c(n,-1)]):Tb([c(ch,0),c(ch,3),c(ch,5),H(c(ch,6)),H(c(ch,7)),c(ch,10),c(ch,12),c(ch,10),c(ch,7),Pu(c(ch,6)),Pu(c(ch,5)),c(ch,3)]))],
    A22:[c=>L(II,(ch,n,i)=>Qb(c.s(ch,i?[12,10,9,7]:[0,2,4,5]))),
         c=>L(II,(ch,n,i)=>Sb(c.s(ch,i?[12,10,9,7,5,4,2,0]:[0,2,4,5,7,9,10,12]))),
         c=>L(P2,ch=>Tb(c.s(ch,[0,2,4,5,7,9,10,12,10,9,7,4]))),
         c=>L(P4,ch=>Tb(c.s(ch,[0,4,2,5,4,7,5,9,7,10,9,12]))),
         c=>L(TW,(ch,n,i)=>Tb(i%2?[...c.s(ch,[12,10,9,7,5,4,2,0,2,4,5]),c(n,-1)]:c.s(ch,[0,4,2,5,4,7,5,9,7,10,9,12])))],
    // малая терция на A и хаммер в большую
    A23:[c=>L(II,(ch,n,i)=>Qb(i?[c(ch,10),c(ch,7),c(ch,4),c(ch,[1,-2])]:[c(ch,0),c(ch,[1,-2]),c(ch,4),c(ch,7)])),
         c=>L(P2,ch=>Sb([c(ch,0),c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),c(ch,9),c(ch,10),c(ch,9)])),
         c=>L(P4,ch=>Sb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),c(ch,9),c(ch,10),c(ch,9),c(ch,7)])),
         c=>L(P4,ch=>Tb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),c(ch,9),c(ch,10),c(ch,12),c(ch,10),c(ch,9),c(ch,7),c(ch,4),Pu(c(ch,[1,-2]))])),
         c=>L(TW,(ch,n,i)=>i%2?Sb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),c(ch,9),c(ch,10),c(ch,9),c(n,-1)]):Tb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),c(ch,9),c(ch,10),c(ch,12),c(ch,10),c(ch,9),c(ch,7),c(ch,4),Pu(c(ch,[1,-2]))]))],
    A37:[c=>L(P2,ch=>Qb(c.s(ch,[0,3,7,3]))),
         c=>L(['I','I','IV','IV'],(ch,n,i)=>Qb(c.s(ch,i%2?[12,10,7,3]:[0,3,7,10]))),
         c=>L(P4,ch=>Sb(c.s(ch,[0,3,7,10,12,10,7,3]))),
         c=>L(P4,(ch,n)=>Tb([...c.s(ch,[0,3,7,10,12,10,7,3,0,3,7]),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>i%2?Sb([...c.s(ch,[12,10,7,3,0,3,7]),c(n,-1)]):Tb([...c.s(ch,[0,3,7,10,12,10,7,3,0,3,7]),c(n,-1)]))],
    L24:[c=>L(P2,(ch,n)=>Qb([...c.s(ch,[0,4,7]),c(n,-1)])),
         c=>L(P4,(ch,n)=>Qb([...c.s(ch,[0,4,7]),c(n,-1)])),
         c=>L(P4,(ch,n,i)=>Qb([...c.s(ch,[0,4,7]),c(n,i%2?1:-1)])),
         c=>L(P8,(ch,n)=>Qb([...c.s(ch,[0,4]),c(n,-2),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>Qb(i%3===0?[...c.s(ch,[0,4,7]),c(n,-1)]:i%3===1?[...c.s(ch,[0,7]),c(n,2),c(n,1)]:[...c.s(ch,[0,4]),c(n,-2),c(n,-1)]))],
    L25:[c=>L(P2,ch=>Qb(c.s(ch,[0,4,7,9]))),
         c=>L(P4,(ch,n,i)=>Qb(c.s(ch,i%2?[12,9,7,4]:[0,4,7,9]))),
         c=>L(P8,(ch,n,i)=>Qb(i%2?[...c.s(ch,[12,9,7]),c(n,-1)]:c.s(ch,[0,4,7,9]))),
         c=>L(TW,(ch,n,i)=>Qb(i%2?[...c.s(ch,[12,9,7]),c(n,-1)]:wk(c,ch,n))),
         c=>L(TW,(ch,n,i)=>Qb(i%2?c.s(ch,[12,9,7]):wk(c,ch,n).slice(0,3))+' '+sw(X(c(ch,7)),i%2?c(n,-1):wk(c,ch,n)[3]))],
    L26:[c=>L(II,ch=>Sb([c(ch,0),X(c(ch,0)),c(ch,0),X(c(ch,0)),c(ch,7),X(c(ch,7)),c(ch,7),X(c(ch,7))])),
         c=>L(P2,ch=>Sb([c(ch,0),X(c(ch,0)),c(ch,7),X(c(ch,7)),c(ch,9),X(c(ch,9)),c(ch,7),X(c(ch,7))])),
         c=>L(P4,ch=>Sb([c(ch,0),X(c(ch,0)),c(ch,7),X(c(ch,7)),c(ch,9),X(c(ch,9)),c(ch,10),X(c(ch,10))])),
         c=>L(P4,(ch,n)=>Tb([c(ch,0),X(c(ch,0)),c(ch,0),c(ch,7),X(c(ch,7)),c(ch,7),c(ch,9),X(c(ch,9)),c(ch,9),c(ch,7),X(c(ch,7)),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>i%2?Tb([c(ch,0),X(c(ch,0)),c(ch,0),c(ch,7),X(c(ch,7)),c(ch,7),c(ch,9),X(c(ch,9)),c(ch,9),c(ch,7),X(c(ch,7)),c(n,-1)]):Sb([c(ch,0),X(c(ch,0)),c(ch,7),X(c(ch,7)),c(ch,9),X(c(ch,9)),c(ch,10),X(c(ch,10))]))],
    L27:[c=>L(P2,ch=>Qb(c.s(ch,[0,12,0,12]))),
         c=>L(P2,ch=>Sb(c.s(ch,[0,12,0,12,0,12,0,12]))),
         c=>L(P4,ch=>Sb(c.s(ch,[0,12,0,12,10,12,7,9]))),
         c=>L(P4,(ch,n)=>Tb([c(ch,0),X(c(ch,0)),c(ch,12),c(ch,0),X(c(ch,0)),c(ch,12),c(ch,10),c(ch,12),c(ch,10),c(ch,7),c(ch,9),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>i%2?Tb([c(ch,0),X(c(ch,0)),c(ch,12),c(ch,0),X(c(ch,0)),c(ch,12),c(ch,10),c(ch,12),c(ch,10),c(ch,7),c(ch,9),c(n,-1)]):Sb(c.s(ch,[0,12,0,12,10,12,7,9])))],
    // хаммеры и пулл-оффы на одной струне: малая→большая терция, квинта→секста, септима→октава
    L28:[c=>L(II,ch=>Sb([c(ch,0),c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,0),c(ch,0),c(ch,[1,-2]),H(c(ch,4))])),
         c=>L(P2,ch=>Sb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),H(c(ch,[1,4])),Pu(c(ch,7)),c(ch,10),H(c(ch,12))])),
         c=>L(P4,ch=>Tb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),H(c(ch,[1,4])),Pu(c(ch,7)),c(ch,10),H(c(ch,12)),Pu(c(ch,10)),c(ch,7),c(ch,4),c(ch,0)])),
         c=>L(P4,(ch,n)=>Tb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),H(c(ch,[1,4])),Pu(c(ch,7)),c(ch,10),H(c(ch,12)),Pu(c(ch,10)),c(ch,7),c(ch,4),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>i%2?Sb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),H(c(ch,[1,4])),Pu(c(ch,7)),c(ch,4),c(n,-1)]):Tb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),H(c(ch,[1,4])),Pu(c(ch,7)),c(ch,10),H(c(ch,12)),Pu(c(ch,10)),c(ch,7),c(ch,4),c(ch,0)]))],
    // все аккорды на струне E: IV и V — смена позиции
    L29:[c=>L(['I','IV2'],ch=>Qb(c.s(ch,[0,4,7,9]))),
         c=>L(['I','IV2'],ch=>Sb(c.s(ch,[0,4,7,9,10,9,7,4]))),
         c=>L(['I','IV2','I','V2'],ch=>Sb(c.s(ch,[0,4,7,9,10,9,7,4]))),
         c=>L(['I','IV2','I','V2'],(ch,n)=>Tb([...c.s(ch,[0,4,7,9,10,9,7,4,0,4,7]),c(n,-1)])),
         c=>L(TW.map(x=>x==='I'?x:x+'2'),(ch,n,i)=>i%2?Tb([...c.s(ch,[0,4,7,9,10,9,7,4,0,4,7]),c(n,-1)]):Sb([...c.s(ch,[0,4,7,9,10,9,7]),c(n,-1)]))],
    L30:[c=>L(II,(ch,n,i)=>i?Sb(c.s(ch,[0,7,9,7,0,7]))+' '+Tb(c.s(ch,[10,9,7])):Sb(c.s(ch,[0,7,9,7,0,7,9,7]))),
         c=>L(P2,(ch,n)=>Sb(c.s(ch,[0,7,9,7,0,7]))+' '+Tb([c(ch,12),c(ch,10),c(n,-1)])),
         c=>L(P4,(ch,n)=>Sb(c.s(ch,[0,7,9,7]))+' '+Tb([...c.s(ch,[12,10,9,7,4]),c(n,-1)])),
         c=>L(P4,(ch,n)=>Sb(c.s(ch,[0,7]))+' '+Tb([...c.s(ch,[9,10,12,10,9,7,4,3]),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>i%4===3?Sb(c.s(ch,[0,7]))+' '+Tb([...c.s(ch,[9,10,12,10,9,7,4,3]),c(n,-1)]):Sb(c.s(ch,[0,7,9,7]))+' '+Tb([...c.s(ch,[12,10,9,7,4]),c(n,-1)]))],
    // бенды на D: секста→септима (полтона), септима→октава (тон)
    L31:[c=>L(P2,ch=>Vb(c(ch,0),6)+' '+Qb(c.s(ch,[7,10]))),
         c=>L(P2,ch=>Qb(c.s(ch,[0,7]))+' '+Vb(c(ch,9)+'b'+(+c(ch,10).slice(1)),6)),
         c=>L(P4,ch=>Qb(c.s(ch,[0,7]))+' '+Vb(c(ch,10)+'b'+(+c(ch,12).slice(1)),6)),
         c=>L(P4,(ch,n)=>Sb([c(ch,0),c(ch,7),c(ch,10)+'b'+(+c(ch,12).slice(1))+'r'+c(ch,10).slice(1),c(ch,9),c(ch,7),c(ch,4)])+' '+q(c(n,-1))),
         c=>L(TW,(ch,n,i)=>i%2?Sb([c(ch,0),c(ch,7),c(ch,10)+'b'+(+c(ch,12).slice(1))+'r'+c(ch,10).slice(1),c(ch,9),c(ch,7),c(ch,4)])+' '+q(c(n,-1)):Qb(c.s(ch,[0,7]))+' '+Vb(c(ch,9)+'b'+(+c(ch,10).slice(1)),6))],
    L38:[c=>L(P2,(ch,n)=>Qb(wk(c,ch,n))),
         c=>L(P2,(ch,n)=>Sb(wk(c,ch,n).flatMap(x=>[x,x]))),
         c=>L(P4,(ch,n)=>Qb(wk(c,ch,n))),
         c=>L(P8,(ch,n)=>Sb(wk(c,ch,n).flatMap(x=>[x,X(x)]))),
         c=>L(TW,(ch,n,i)=>i%2?Sb(wk(c,ch,n).flatMap(x=>[x,X(x)])):Qb(wk(c,ch,n)))],
    // тёрнэраунд: спуск с октавы I к квинте (= тоника V)
    C32:[c=>L(['I','V'],(ch)=>Qb(ch==='I'?c.s('I',[12,10,9,8]):[...c.s('V',[0,4,7]),c('I',-1)])),
         c=>L(['I','V'],(ch)=>Sb(ch==='I'?c.s('I',[12,12,10,10,9,9,8,8]):[...c.s('V',[0,4,7,9,10,9,7]),c('I',-1)])),
         c=>L(['V','IV','I','V'],(ch,n,i)=>Qb(i===2?c.s('I',[12,10,9,8]):i===3?[...c.s('V',[0,7,0]),c('I',-1)]:[...c.s(ch,[0,4,7]),c(n,1)])),
         c=>L(['V','IV','I','V'],(ch,n,i)=>Sb(i===2?c.s('I',[12,12,10,10,9,9,8,8]):[...c.s(ch,[0,4,7,9,10,9,7]),i===3?c('I',-1):c(n,1)])),
         c=>L(TW,(ch,n,i)=>i===10?Tb(c.s('I',[12,10,12,10,9,10,9,8,9,8,7,8])):i===11?q(c('V',0))+' '+P+' '+P+' '+q(c('I',-1)):Sb([...c.s(ch,[0,4,7,9,10,9,7]),c(n,-1)]))],
    // стоп-тайм: удар на первую долю, тишина, заполнение в конце фразы
    C33:[c=>L(['I','I','I','I'],(ch,n,i)=>i<3?q(c('I',0))+' .:9':Qb(c.s('I',[0,4,7,10]))),
         c=>L(['I','I','I','I'],(ch,n,i)=>i<3?q(c('I',0))+' .:3 .:2 '+c('I',0)+' '+P:Sb(c.s('I',[0,4,7,9,10,9,7,4]))),
         c=>L(['I','I','I','I'],(ch,n,i)=>i<3?q(c('I',0))+' .:3 .:2 '+c('I',0)+' '+P:Tb(c.s('I',[12,10,9,7,4,3,0,3,4,7,9,10]))),
         c=>L(P8.map((x,i)=>i<4?'I':x),(ch,n,i)=>i<3?q(c('I',0))+' .:3 .:2 '+c('I',0)+' '+P:i===3?Tb([...c.s('I',[12,10,9,7,4,3,0,3,4,7,9]),c('IV',-1)]):Sb([...c.s(ch,[0,4,7,9,10,9,7]),c(n,-1)])),
         c=>L(TW,(ch,n,i)=>i<3?q(c('I',0))+' .:3 .:2 '+X(c('I',0))+' '+P:i===3?Tb([...c.s('I',[12,10,9,7,4,3,0,3,4,7,9]),c('IV',-1)]):i===11?q(c('V',0))+' '+P+' .:2 '+c('V',0)+' '+q(c('I',-1)):Sb([...c.s(ch,[0,4,7,9,10,9,7]),c(n,-1)]))],
    // медленный блюз: данные в 4/4 триолями, to128 переводит в 12/8 (такт = 12 восьмых)
    C34:[c=>L(P2,ch=>c.s(ch,[0,7,9,7]).map(x=>x+':3').join(' ')),
         c=>L(P2,ch=>c.s(ch,[0,4,7,9]).map(x=>x+':2 '+x).join(' ')),
         c=>L(P4,(ch,n)=>[...c.s(ch,[0,4,7,9,10,9,7,4,0,4,7]),c(n,-1)].join(' ')),
         c=>({sub:6,t:L(P4,(ch,n)=>[...c.s(ch,[0,4,7,9,10,9,7,4,0]).map(x=>x+':2'),...c.s(ch,[12,10,9,7,4]),c(n,-1)].join(' '))}),
         c=>({sub:6,t:L(TW,(ch,n,i)=>i%2?[...c.s(ch,[0,4,7,9,10,9,7,4,0]).map(x=>x+':2'),...c.s(ch,[12,10,9,7,4]),c(n,-1)].join(' '):[...c.s(ch,[0,4,7,9,10,9,7,4,0,4,7]),c(n,-1)].map(x=>x+':2').join(' '))})],
    // вызов-ответ: такт фразы, такт ответа после паузы
    C35:[c=>L(II,(ch,n,i)=>i?'.:6 '+Qb(c.s(ch,[7,0])):Qb(c.s(ch,[0,4,7,9]))),
         c=>L(II,(ch,n,i)=>i?'.:6 '+Sb(c.s(ch,[10,9,7,4])):Sb(c.s(ch,[0,4,7,9,10,9,7,4]))),
         c=>L(['I','I','IV','IV'],(ch,n,i)=>i%2?'.:6 '+Tb([...c.s(ch,[12,10,9,7,4]),c(n,-1)]):Sb(c.s(ch,[0,4,7,9,10,9,7,4]))),
         c=>L(['I','I','IV','IV','I','I','V','V'],(ch,n,i)=>i%2?'.:6 '+Tb([X(c(ch,12)),c(ch,12),c(ch,10),X(c(ch,9)),c(ch,9),c(n,-1)]):Sb(c.s(ch,[0,4,7,9,10,9,7,4]))),
         c=>L(TW,(ch,n,i)=>i%2?'.:6 '+Tb([X(c(ch,12)),c(ch,12),c(ch,10),X(c(ch,9)),c(ch,9),c(n,-1)]):Sb([c(ch,0),c(ch,[1,-2]),H(c(ch,4)),c(ch,7),c(ch,9),c(ch,10),c(ch,9),c(ch,7)]))]
  };
  // C36: фрагменты этюда, каждый — одна система; уровень 1–2 — один такт, 3–5 — два
  const FRG={
    walk:(c,lv)=>[Qb(c.s('I',[0,4,7,9])),Qb(wk(c,'I','IV')),Qb(wk(c,'I','IV'))+' | '+Qb(wk(c,'IV','I')),Qb(wk(c,'I','IV'))+' | '+Qb(wk(c,'IV','I').slice(0,3))+' '+sw(X(c('I',2)),c('I',1)),Qb(wk(c,'I','IV').slice(0,3))+' '+sw(X(c('I',4)),c('I',4))+' | '+Qb(wk(c,'IV','I').slice(0,3))+' '+sw(X(c('I',2)),c('I',1))][lv-1],
    boog:(c,lv)=>[Qb(c.s('I',[0,7,9,7])),Sb(c.s('I',[0,7,9,7,0,7,9,7])),Sb(c.s('I',[0,0,4,4,7,7,9,9]))+' | '+Sb(c.s('I',[10,10,9,9,7,7,4,4])),Sb(c.s('I',[0,0,4,4,7,7,9,9]))+' | '+Sb(c.s('I',[10,10,9,9]))+' '+Tb(c.s('I',[7,4,3,4,3,0])),Sb([c('I',0),X(c('I',0)),c('I',[1,-2]),H(c('I',4)),c('I',7),X(c('I',7)),c('I',9),c('I',9)])+' | '+Sb(c.s('I',[10,10,9,9]))+' '+Tb(c.s('I',[7,4,3,4,3,0]))][lv-1],
    oct:(c,lv)=>[Qb(c.s('IV',[0,12,0,12])),Sb(c.s('IV',[0,12,0,12,0,12,0,12])),Sb(c.s('IV',[0,12,0,12,10,12,7,9]))+' | '+Sb(c.s('V',[0,12,0,12,10,12,7,9])),Tb([c('IV',0),X(c('IV',0)),c('IV',12),c('IV',0),X(c('IV',0)),c('IV',12),...c.s('IV',[10,12,10,7,9,8])])+' | '+Sb(c.s('V',[0,12,0,12,10,12,7,9])),Tb([c('IV',0),X(c('IV',0)),c('IV',12),c('IV',0),X(c('IV',0)),c('IV',12),...c.s('IV',[10,12,10,7,9,8])])+' | '+Tb([c('V',0),X(c('V',0)),c('V',12),c('V',0),X(c('V',0)),c('V',12),...c.s('V',[10,12,10,7,9]),c('V',-1)])][lv-1],
    turn:(c,lv)=>[Qb(c.s('I',[12,10,9,8])),Sb(c.s('I',[12,12,10,10,9,9,8,8])),Qb(c.s('I',[12,10,9,8]))+' | '+Qb([...c.s('V',[0,7,0]),c('I',-1)]),Sb(c.s('I',[12,12,10,10,9,9,8,8]))+' | '+q(c('V',0))+' '+P+' '+P+' '+q(c('I',-1)),Tb(c.s('I',[12,10,12,10,9,10,9,8,9,8,7,8]))+' | '+q(c('V',0))+' '+P+' .:2 '+c('V',0)+' '+q(c('I',-1))][lv-1],
    stop:(c,lv)=>[q(c('I',0))+' .:9',q(c('I',0))+' .:3 .:2 '+c('I',0)+' '+P,q(c('I',0))+' .:9 | '+q(c('I',0))+' .:3 '+Qb(c.s('I',[7,10])),q(c('I',0))+' .:3 .:2 '+c('I',0)+' '+P+' | '+q(c('I',0))+' .:3 '+Tb(c.s('I',[12,10,9,7,4,3])),q(c('I',0))+' .:3 .:2 '+X(c('I',0))+' '+P+' | '+q(c('I',0))+' '+Tb([...c.s('I',[12,10,9,7,4,3,0,3]),c('IV',-1)])][lv-1],
    tri:(c,lv)=>[Sb(c.s('I',[0,7,9,7,0,7,9,7])),Sb(c.s('I',[0,7,9,7,0,7]))+' '+Tb(c.s('I',[10,9,7])),Sb(c.s('I',[0,7,9,7]))+' '+Tb(c.s('I',[12,10,9,7,4,3]))+' | '+Sb(c.s('IV',[0,7,9,7]))+' '+Tb([...c.s('IV',[12,10,9,7,4]),c('I',1)]),Sb(c.s('I',[0,7]))+' '+Tb(c.s('I',[9,10,12,10,9,7,4,3,0]))+' | '+Sb(c.s('IV',[0,7]))+' '+Tb([...c.s('IV',[9,10,12,10,9,7,4,3]),c('I',1)]),Tb([c('I',0),X(c('I',0)),...c.s('I',[7,9,10,12,10,9,7,4,3,0])])+' | '+Tb([c('IV',0),X(c('IV',0)),...c.s('IV',[7,9,10,12,10,9,7,4,3]),c('I',1)])][lv-1]
  };
  const ETU=[['walk','boog','oct','turn'],['stop','walk','tri','turn'],['boog','tri','oct','stop'],['walk','oct','boog','turn'],['stop','boog','walk','tri'],['tri','walk','oct','turn']];
  G.C36=[1,2,3,4,5].map(lv=>(c,k)=>ETU[k].map(f=>FRG[f](c,lv)));
  const ET_RU={walk:'уокинг',boog:'бугги',oct:'октавы',turn:'тёрнэраунд',stop:'стоп-тайм',tri:'триоли'},ET_EN={walk:'walking',boog:'boogie',oct:'octaves',turn:'turnaround',stop:'stop-time',tri:'triplets'};
  // тексты: [RU, EN]; у каждого: name, goal, how, tip, hf, hp, lvl, подпись варианта (k — нота тональности)
  const T={
    A16:[{name:'Арпеджио септаккорда',goal:'Доминантсептаккорд — главный аккорд блюза — под пальцами в любой тональности.',how:'Тоника, терция, квинта, малая септима — одна аппликатура на аккорд, сдвигается вместе с ним. Свинг: первая нота пары длиннее.',tip:'Септима делает аккорд блюзовым. Дай ей прозвучать в полную длину.',hf:'Чередуй i-m, на смене струны палец ложится на нижнюю струну и глушит её.',hp:'Вниз на сильную долю, вверх на короткую ноту свинга.',lvl:['Трезвучие четвертями','Септаккорд вверх и вниз','Свинг: I, IV, I, V','С секстой и подходом к следующему аккорду','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Seventh-chord arpeggios',goal:'The dominant seventh, the main blues chord, under your fingers in any key.',how:'Root, third, fifth, flat seventh: one shape per chord, moving with it. Swing: the first note of each pair is longer.',tip:'The seventh is what makes it blues. Let it ring full length.',hf:'Alternate i-m; on a string change the finger lands on the lower string and mutes it.',hp:'Down on the strong beat, up on the short swung note.',lvl:['Triad in quarters','Seventh chord up and down','Swing: I, IV, I, V','With the sixth and an approach to the next chord','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A17:[{name:'Нонаккорд',goal:'Девятая ступень в арпеджио: звук соул-блюза и фанка.',how:'Арпеджио доминантсептаккорда плюс нона на октаву и тон выше тоники. На 3–5 уровне — триоли.',tip:'Нона — краска, а не опора. Приходи на тонику на сильную долю.',hf:'Нона далеко от тоники: перед ней переставь руку, а не тянись.',hp:'Триоли — альтернейт; акцент сам будет ходить по долям, слушай его.',lvl:['Четвертями вверх и вниз','Свинг: I и IV','Триоли по четырём тактам','Триоли с подходом на последнюю долю','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Ninth chords',goal:'The ninth in an arpeggio: the sound of soul blues and funk.',how:'A dominant seventh arpeggio plus the ninth, an octave and a whole step above the root. Triplets on levels 3–5.',tip:'The ninth is a colour, not a landing point. Land on the root on the strong beat.',hf:'The ninth is far from the root: shift your hand before it, do not stretch.',hp:'Alternate picking on triplets; the accent moves across the beats, listen to it.',lvl:['Quarters up and down','Swing: I and IV','Triplets over four bars','Triplets with an approach on the last beat','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A18:[{name:'Тоника, квинта, секста',goal:'Главная фигура шаффл-баса и рок-н-ролла.',how:'Тоника, квинта, секста, септима — фигура, на которой стоят шаффл и буги-вуги. На 4-м уровне каждая нота дважды.',tip:'Секста к квинте — ровно на тон. Не съезжай на септиму раньше времени.',hf:'Одним пальцем на ладу на всю фигуру не играй: тоника — средний или указательный, секста — мизинец.',hp:'Все ноты вниз — так шаффл звучит плотнее; вверх — только на быстрых парах.',lvl:['Четвертями','Свинг: I и IV','С септимой: I, IV, I, V','Буги: каждая нота дважды','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Root, fifth, sixth',goal:'The core figure of shuffle bass and rock and roll.',how:'Root, fifth, sixth, seventh: the figure shuffle and boogie-woogie stand on. On level 4 every note is played twice.',tip:'The sixth is exactly a whole step above the fifth. Do not slide to the seventh too early.',hf:'Do not use one finger per fret for the whole figure: root with the middle or index, sixth with the pinky.',hp:'All downstrokes make the shuffle sound tighter; use upstrokes only on fast pairs.',lvl:['Quarters','Swing: I and IV','With the seventh: I, IV, I, V','Boogie: every note twice','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A19:[{name:'Минорная пентатоника',goal:'Основа блюзовых линий и филлов.',how:'Пять нот: тоника, малая терция, кварта, квинта, малая септима. Вверх, вниз, на 4-м уровне — секвенция по три.',tip:'Пой фразу, прежде чем играть. Пентатоника звучит, когда в ней есть мелодия.',hf:'Позиция в четыре лада, палец на лад. Не переставляй руку внутри позиции.',hp:'Альтернейт; две ноты на струне — вниз-вверх.',lvl:['Четвертями','Свинг вверх и вниз','Триоли: I и IV','Секвенция по три: I, IV, I, V','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Minor pentatonic',goal:'The base of blues lines and fills.',how:'Five notes: root, minor third, fourth, fifth, flat seventh. Up, down, and on level 4 a sequence in threes.',tip:'Sing the phrase before you play it. A pentatonic works when there is a melody in it.',hf:'A four-fret position, one finger per fret. Do not shift inside the position.',hp:'Alternate picking; two notes on a string are down-up.',lvl:['Quarters','Swing up and down','Triplets: I and IV','Sequence in threes: I, IV, I, V','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A20:[{name:'Мажорная пентатоника',goal:'Светлый блюз и кантри-блюз: мажорная терция и секста.',how:'Тоника, секунда, большая терция, квинта, секста. Та же схема, что у минорной, другие ноты.',tip:'Мажорная пентатоника над доминантсептаккордом звучит весело. Сравни с минорной на том же аккорде.',hf:'Секста на струну выше — палец на лад ниже тоники; держи руку в позиции.',hp:'Альтернейт, медиатор у самой струны.',lvl:['Четвертями','Свинг вверх и вниз','Триоли: I и IV','Секвенция по три: I, IV, I, V','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Major pentatonic',goal:'Bright blues and country blues: the major third and the sixth.',how:'Root, second, major third, fifth, sixth. The same scheme as the minor one, different notes.',tip:'A major pentatonic over a dominant seventh sounds cheerful. Compare it with the minor one on the same chord.',hf:'The sixth is one string up, one fret below the root: keep your hand in position.',hp:'Alternate picking, pick close to the string.',lvl:['Quarters','Swing up and down','Triplets: I and IV','Sequence in threes: I, IV, I, V','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A21:[{name:'Блюзовая гамма',goal:'Минорная пентатоника с блюзовой нотой — пониженной квинтой.',how:'Тоника, малая терция, кварта, пониженная квинта, квинта, малая септима. Блюзовая нота — проходящая, на ней не стой. На 4–5 уровне кварта — квинта легато.',tip:'Блюзовая нота живёт между двумя соседями. Сыграй её мимоходом, и она запоёт.',hf:'Кварта, блюзовая нота, квинта — три пальца подряд на одной струне.',hp:'В легато медиатор бьёт только первую ноту; хаммеры — громко, как удар.',lvl:['Четвертями','Свинг вверх и вниз','Триоли: I и IV','Легато через блюзовую ноту','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Blues scale',goal:'The minor pentatonic with the blue note, the flat fifth.',how:'Root, minor third, fourth, flat fifth, fifth, flat seventh. The blue note is a passing note: do not stop on it. On levels 4–5 the fourth to the fifth is legato.',tip:'The blue note lives between its two neighbours. Play it in passing and it sings.',hf:'Fourth, blue note, fifth: three fingers in a row on one string.',hp:'In legato the pick strikes only the first note; hammer-ons loud, like a pluck.',lvl:['Quarters','Swing up and down','Triplets: I and IV','Legato through the blue note','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A22:[{name:'Миксолидийский лад',goal:'Гамма доминантсептаккорда: мажор с малой септимой.',how:'Семь ступеней от тоники до октавы. На 4–5 уровне — терциями: через ступень вверх.',tip:'Это лад уокинга: из его нот строится любая линия по аккорду.',hf:'Позиция на четыре лада, секста и септима на соседней струне — без растяжки.',hp:'Терции — альтернейт со сменой струны на каждой паре; не размахивайся.',lvl:['Четвертями','Свинг вверх и вниз','Триоли: I и IV','Терциями: I, IV, I, V','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Mixolydian mode',goal:'The scale of the dominant seventh: major with a flat seventh.',how:'Seven steps from the root to the octave. On levels 4–5 in thirds: skipping a step going up.',tip:'This is the walking-bass mode: any line over the chord is built from its notes.',hf:'A four-fret position, the sixth and seventh on the next string: no stretch.',hp:'Thirds: alternate picking, a string change on every pair; keep the motion small.',lvl:['Quarters','Swing up and down','Triplets: I and IV','In thirds: I, IV, I, V','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A23:[{name:'Мажор и минор вместе',goal:'Малая терция, которая хаммером уходит в большую, — звук блюза.',how:'Малая терция на соседней струне, хаммер на лад выше — большая терция. Дальше квинта, секста, септима.',tip:'Не выбирай между мажором и минором — блюз играет оба. Малая терция — короткая, большая — опора.',hf:'Малая терция — указательный, большая — средний: хаммер с высоты.',hp:'Медиатор бьёт малую терцию, большая — только хаммером.',lvl:['Четвертями, без легато','Свинг с хаммером','Свинг: I, IV, I, V','Триоли с хаммером и пулл-оффом','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Major and minor together',goal:'A minor third hammered into the major third: the sound of the blues.',how:'The minor third on the next string, a hammer-on one fret up gives the major third. Then the fifth, sixth, seventh.',tip:'Do not choose between major and minor: the blues plays both. The minor third is short, the major third is the landing note.',hf:'Minor third with the index finger, major third with the middle.',hp:'The pick strikes the minor third; the major third comes from the hammer-on only.',lvl:['Quarters, no legato','Swing with a hammer-on','Swing: I, IV, I, V','Triplets with a hammer-on and pull-off','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    A37:[{name:'Минорный блюз',goal:'Минорные септаккорды на всех трёх аккордах квадрата.',how:'Тоника, малая терция, квинта, малая септима — на I, IV и V. Звук минорного блюза в духе медленных баллад.',tip:'Минорный блюз медленнее и тише. Играй мягче, чем шаффл.',hf:'Малая терция на той же струне, что тоника: растяжка на три лада, палец на лад.',hp:'Медиатор ближе к грифу — звук мягче.',lvl:['Трезвучие четвертями','Септаккорд вверх и вниз','Свинг: i, iv, i, v','Триоли с подходом','12-тактовый квадрат'],l:k=>'Минорный блюз в {'+k+'}'},
         {name:'Minor blues',goal:'Minor seventh chords on all three chords of the progression.',how:'Root, minor third, fifth, flat seventh on I, IV and V. The sound of a minor blues in the style of slow ballads.',tip:'A minor blues is slower and softer. Play gentler than a shuffle.',hf:'The minor third is on the same string as the root: a three-fret span, one finger per fret.',hp:'Pick closer to the neck for a softer tone.',lvl:['Triad in quarters','Seventh chord up and down','Swing: i, iv, i, v','Triplets with an approach','12-bar blues'],l:k=>'{'+k+'} minor blues'}],
    L24:[{name:'Хроматические подходы',goal:'Приходить на тонику следующего аккорда полутоном снизу или сверху.',how:'Три ноты аккорда и на четвёртую долю — нота на полутон ниже (или выше) тоники следующего аккорда. На 4-м уровне — подход из двух нот.',tip:'Подход работает, только если следующая тоника приходит точно на долю.',hf:'Подход — свободный палец рядом с целью; рука не прыгает.',hp:'Подход — тот же штрих, что и остальные ноты, без акцента.',lvl:['Подход снизу: I и IV','Подход снизу: I, IV, I, V','Снизу и сверху','Двойной подход, 8 тактов','12 тактов, все подходы'],l:k=>'Блюз в {'+k+'}'},
         {name:'Chromatic approaches',goal:'Arrive on the next chord’s root from a half step below or above.',how:'Three chord tones and, on beat four, a note a half step below (or above) the next chord’s root. On level 4 a two-note approach.',tip:'An approach works only if the next root lands exactly on the beat.',hf:'The approach uses a free finger next to the target; the hand does not jump.',hp:'The approach gets the same stroke as the other notes, no accent.',lvl:['Approach from below: I and IV','Approach from below: I, IV, I, V','From below and above','Double approach, 8 bars','12 bars, all approaches'],l:k=>'Blues in {'+k+'}'}],
    L25:[{name:'Уокинг по квадрату',goal:'Шагающая линия четвертями через весь 12-тактовый блюз.',how:'Каждая доля — нота. Вверх по аккорду, вниз по аккорду, ход к следующему. На 5-м уровне на четвёртую долю — мёртвая нота свингом перед подходом.',tip:'Уокинг держит время за всю группу. Ровность важнее нот.',hf:'Чередуй i-m строго, даже когда ноты на одной струне.',hp:'Все вниз, медиатор у грифа — звук как у контрабаса.',lvl:['Вверх по аккорду: I и IV','Вверх и вниз: I, IV, I, V','8 тактов с подходами','12 тактов с хроматическими ходами','12 тактов, мёртвая нота перед подходом'],l:k=>'Блюз в {'+k+'}'},
         {name:'Walking the 12-bar',goal:'A walking line in quarters through the whole 12-bar blues.',how:'A note on every beat. Up the chord, down the chord, a move to the next one. On level 5, beat four has a swung dead note before the approach.',tip:'A walking line keeps time for the whole band. Evenness matters more than the notes.',hf:'Alternate i-m strictly, even when the notes are on one string.',hp:'All downstrokes, pick near the neck: a sound close to an upright bass.',lvl:['Up the chord: I and IV','Up and down: I, IV, I, V','8 bars with approaches','12 bars with chromatic moves','12 bars, a dead note before the approach'],l:k=>'Blues in {'+k+'}'}],
    L26:[{name:'Мёртвые ноты в шаффле',goal:'Глухой «чк» между нотами: шаффл качает сильнее.',how:'x — мёртвая нота: палец лежит на струне без нажима. Нота на долю, мёртвая — на короткую ноту свинга. На 4–5 уровне — в триолях.',tip:'Мёртвая нота тише настоящей. Если она громче — грув разваливается.',hf:'Левая рука ослабляет нажим, правая играет как обычно.',hp:'Мёртвая — штрих вверх, с меньшей силой.',lvl:['Тоника и квинта','Тоника, квинта, секста: I и IV','С септимой: I, IV, I, V','Триоли с мёртвой в середине','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Dead notes in a shuffle',goal:'A muted “chk” between notes: the shuffle swings harder.',how:'x is a dead note: the finger rests on the string without pressing. A note on the beat, a dead note on the short swung note. On levels 4–5 in triplets.',tip:'A dead note is quieter than a real one. If it is louder, the groove falls apart.',hf:'The fretting hand releases pressure, the plucking hand plays as usual.',hp:'Dead notes are upstrokes, played lighter.',lvl:['Root and fifth','Root, fifth, sixth: I and IV','With the seventh: I, IV, I, V','Triplets with a dead note in the middle','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    L27:[{name:'Октавный шаффл',goal:'Тоника и октава свингом: диско-блюз и чикагский шаффл.',how:'Тоника и октава через струну. На 3-м уровне в конце такта — септима, квинта, секста.',tip:'Октава — короткая нота свинга, не дави на неё.',hf:'Указательный на тонике, мизинец (или безымянный) на октаве; струна между ними заглушена пальцем.',hp:'Тоника вниз, октава вверх — перескок через струну без лишнего размаха.',lvl:['Четвертями','Свинг: I и IV','С ходом в конце такта','Триоли с мёртвой нотой','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Octave shuffle',goal:'Root and octave, swung: disco blues and the Chicago shuffle.',how:'The root and the octave two strings up. On level 3 the bar ends with the seventh, fifth and sixth.',tip:'The octave is the short swung note: do not lean on it.',hf:'Index on the root, pinky (or ring) on the octave; the string between them is muted by a finger.',hp:'Root down, octave up: skip the string without a wide swing.',lvl:['Quarters','Swing: I and IV','With a move at the end of the bar','Triplets with a dead note','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    L28:[{name:'Легато в филлах',goal:'Хаммеры и пулл-оффы: малая терция в большую, квинта в сексту, септима в октаву.',how:'h — хаммер, p — пулл-офф. Бьёшь только первую ноту, вторая звучит от левой руки. На 3–5 уровне — триоли.',tip:'Нота легато громкостью равна ноте с ударом. Записывай и проверяй.',hf:'Хаммер — с высоты, кончиком пальца; пулл-офф — палец срывает струну вниз.',hp:'Медиатор бьёт первую ноту пары и отдыхает.',lvl:['Малая терция → большая','Три хаммера за такт','Триоли с пулл-оффами','Триоли с подходом','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Legato fills',goal:'Hammer-ons and pull-offs: minor third to major, fifth to sixth, seventh to octave.',how:'h is a hammer-on, p a pull-off. Pluck only the first note; the second sounds from the fretting hand. Triplets on levels 3–5.',tip:'A legato note is as loud as a plucked one. Record yourself and check.',hf:'Hammer from a height with the fingertip; on a pull-off the finger snaps the string downwards.',hp:'The pick strikes the first note of the pair and rests.',lvl:['Minor third → major','Three hammer-ons per bar','Triplets with pull-offs','Triplets with an approach','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    L29:[{name:'Смена позиций',goal:'Весь квадрат на одной нижней струне: переход в новую позицию на каждой смене аккорда.',how:'Тоники I, IV и V на одной струне — рука переезжает на 5 и 7 ладов. Фигура одна и та же.',tip:'Переезд — на последней ноте такта, а не на первой нового.',hf:'Большой палец за грифом едет вместе с рукой.',hp:'Медиатор не ждёт левую руку: штрих по времени, переезд успевает.',lvl:['Четвертями: I и IV','Свинг: I и IV','Свинг: I, IV, I, V','Триоли с подходом','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Position shifts',goal:'The whole progression on the lowest string: a new position on every chord change.',how:'The roots of I, IV and V on one string: the hand moves up 5 and 7 frets. The figure stays the same.',tip:'Shift on the last note of the bar, not on the first note of the next.',hf:'The thumb behind the neck travels with the hand.',hp:'The pick does not wait for the fretting hand: stroke on time, the shift catches up.',lvl:['Quarters: I and IV','Swing: I and IV','Swing: I, IV, I, V','Triplets with an approach','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    L30:[{name:'Триольные филлы',goal:'Филл триолями в конце такта и возврат в шаффл без сбоя.',how:'Шаффл, на последние доли — триоли вниз по аккорду к следующей тонике. Чем выше уровень, тем длиннее филл.',tip:'Филл кончается на сильной доле следующего такта — туда и слушай.',hf:'Триоли — i-m-i, следующая доля начинается с m: не сбивайся.',hp:'Альтернейт на триолях, вниз на первую ноту шаффла после филла.',lvl:['Филл на одну долю','Филл к следующему аккорду','Филл на две доли','Филл на три доли','12 тактов, длинный филл в конце каждой фразы'],l:k=>'Блюз в {'+k+'}'},
         {name:'Triplet fills',goal:'A triplet fill at the end of the bar and back into the shuffle without a stumble.',how:'A shuffle, then triplets on the last beats down the chord to the next root. The higher the level, the longer the fill.',tip:'The fill ends on the next bar’s downbeat: listen there.',hf:'Triplets are i-m-i, the next beat starts with m: keep the pattern.',hp:'Alternate picking on triplets, a downstroke on the first shuffle note after the fill.',lvl:['A one-beat fill','A fill into the next chord','A two-beat fill','A three-beat fill','12 bars, a long fill at the end of every phrase'],l:k=>'Blues in {'+k+'}'}],
    L31:[{name:'Вибрато и бенды',goal:'Певучая долгая нота на басу: вибрато и небольшой бенд.',how:'~ — вибрато, b — бенд, r — возврат. Бенды на полтона и тон, на средних струнах. Сначала сыграй целевую ноту, потом тяни до неё.',tip:'Бенд на басу заметен, даже если промахнулся на четверть тона. Проверяй высоту по целевой ноте.',hf:'Тяни двумя пальцами вместе, движение от кисти.',hp:'Бенд после удара: медиатор не мешает струне.',lvl:['Вибрато на тонике','Бенд на полтона','Бенд на тон с вибрато','Бенд и возврат в шаффле','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Vibrato and bends',goal:'A singing long note on bass: vibrato and a small bend.',how:'~ is vibrato, b a bend, r a release. Half-step and whole-step bends on the middle strings. Play the target note first, then bend up to it.',tip:'A bend on bass is noticeable even a quarter tone off. Check the pitch against the target note.',hf:'Bend with two fingers together, the motion comes from the wrist.',hp:'Bend after the attack: the pick stays off the string.',lvl:['Vibrato on the root','Half-step bend','Whole-step bend with vibrato','Bend and release in a shuffle','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    L38:[{name:'Хроматические ходы',goal:'Ходы между аккордами по полутонам: вверх от I к IV, вниз от IV к I.',how:'Тоника, секунда, малая и большая терция — и тоника IV. Обратно — по полутонам вниз. На 4–5 уровне после каждой ноты — мёртвая.',tip:'Ход должен звучать как одна линия. Не делай паузы перед новым аккордом.',hf:'Четыре пальца на четыре лада — ход идёт пальцами, не рукой.',hp:'Все вниз на четвертях, вниз-вверх на свинге.',lvl:['Четвертями: I и IV','Свинг, каждая нота дважды','I, IV, I, V','С мёртвыми нотами, 8 тактов','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Chromatic walk-ups',goal:'Moves between chords in half steps: up from I to IV, down from IV to I.',how:'Root, second, minor and major third, then the root of IV. Back down in half steps. On levels 4–5 every note is followed by a dead note.',tip:'The move should sound like one line. No gap before the new chord.',hf:'Four fingers on four frets: the fingers walk, not the hand.',hp:'All downstrokes on quarters, down-up on swing.',lvl:['Quarters: I and IV','Swing, every note twice','I, IV, I, V','With dead notes, 8 bars','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    C32:[{name:'Тёрнэраунд',goal:'Последние такты квадрата: спуск по полутонам к V и возврат к началу.',how:'Октава, септима, секста, малая секста — и квинта, она же тоника V. На 3–4 уровне — четыре последних такта квадрата, на 5-м — весь квадрат с тёрнэраундом и стопом на V.',tip:'Тёрнэраунд — сигнал всей группе, что квадрат кончается. Играй его уверенно и громко.',hf:'Спуск — четыре пальца на четыре лада, рука на месте.',hp:'Все вниз на спуске — звучит увереннее.',lvl:['Спуск и V','Свинг','Такты 9–12','Свинг, такты 9–12','12-тактовый квадрат со стопом'],l:k=>'Блюз в {'+k+'}'},
         {name:'Turnaround',goal:'The last bars of the progression: a half-step descent to V and back to the top.',how:'Octave, flat seventh, sixth, flat sixth, then the fifth, which is the root of V. Levels 3–4 are the last four bars of the progression; level 5 is the whole 12-bar with a turnaround and a stop on V.',tip:'The turnaround tells the whole band the chorus is ending. Play it with confidence.',hf:'The descent is four fingers on four frets, the hand stays put.',hp:'All downstrokes on the descent: it sounds more confident.',lvl:['Descent and V','Swing','Bars 9–12','Swing, bars 9–12','12-bar blues with a stop'],l:k=>'Blues in {'+k+'}'}],
    C33:[{name:'Стоп-тайм',goal:'Удары с тишиной между ними и точный вход после стопа.',how:'Удар на первую долю, остальное — тишина. На 2-м уровне ещё удар на последнюю восьмую второй доли. После стопов — филл и шаффл.',tip:'Тишина — часть ритма. Считай про себя каждую долю паузы.',hf:'После удара гаси струну сразу: пальцем правой руки или ослабив левую.',hp:'После удара — ладонь на струны: тишина должна быть полной.',lvl:['Три стопа и ход','Стоп с ударом на «и»','Три стопа и филл триолями','8 тактов: стопы, филл, шаффл','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Stop-time',goal:'Hits with silence between them and an exact entry after the stop.',how:'A hit on beat one, silence for the rest. Level 2 adds a hit on the last swung eighth of beat two. After the stops comes a fill and the shuffle.',tip:'Silence is part of the rhythm. Count every beat of the rest to yourself.',hf:'Mute the string right after the hit: with a plucking finger or by releasing the fretting hand.',hp:'After the hit, palm on the strings: the silence has to be total.',lvl:['Three stops and a move','A stop with a hit on the “and”','Three stops and a triplet fill','8 bars: stops, fill, shuffle','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    C34:[{name:'Медленный блюз 12/8',goal:'Медленный блюз: 12 восьмых в такте, четыре группы по три.',how:'Размер 12/8: метроном отбивает восьмые, акцент на начале каждой группы из трёх. Сначала по группе на ноту, потом каждая восьмая. На 4–5 уровне в конце такта — шестнадцатые.',tip:'В медленном блюзе нот мало, поэтому слышна каждая. Держи длительность до самого конца.',hf:'Мягко, подушечкой, ближе к грифу.',hp:'Медиатор у грифа и все вниз — звук теплее.',lvl:['Группами по три','Длинная-короткая в группе','Каждая восьмая, I, IV, I, V','С шестнадцатыми в конце такта','12-тактовый квадрат'],l:k=>'Медленный блюз в {'+k+'}'},
         {name:'Slow blues in 12/8',goal:'A slow blues: 12 eighths per bar, four groups of three.',how:'In 12/8 the metronome clicks eighths, with an accent on each group of three. First one note per group, then every eighth. Levels 4–5 end each bar with sixteenths.',tip:'A slow blues has few notes, so every one is heard. Hold each note for its full length.',hf:'Soft, with the pad of the finger, closer to the neck.',hp:'Pick near the neck, all downstrokes: a warmer sound.',lvl:['Groups of three','Long-short in each group','Every eighth, I, IV, I, V','With sixteenths at the end of the bar','12-bar blues'],l:k=>'Slow blues in {'+k+'}'}],
    C35:[{name:'Вызов-ответ',goal:'Фраза и ответ на неё: такт линии, такт паузы и филла.',how:'Первый такт — фраза, во втором полтакта тишины и ответ. На 4–5 уровне в ответе мёртвые ноты.',tip:'Ответ — продолжение фразы. Спой обе части, прежде чем играть.',hf:'В паузе гаси струны свободными пальцами.',hp:'Пауза — ладонь на струнах; ответ начинается вниз.',lvl:['Фраза и две ноты ответа','Свинг, ответ на две доли','Триольный ответ к следующему аккорду','С мёртвыми нотами, 8 тактов','12-тактовый квадрат'],l:k=>'Блюз в {'+k+'}'},
         {name:'Call and response',goal:'A phrase and its answer: a bar of line, a bar of rest and fill.',how:'The first bar is the phrase; the second has half a bar of silence and the answer. On levels 4–5 the answer has dead notes.',tip:'The answer continues the phrase. Sing both parts before you play.',hf:'Mute the strings with free fingers during the rest.',hp:'During the rest, palm on the strings; the answer starts with a downstroke.',lvl:['Phrase and a two-note answer','Swing, a two-beat answer','A triplet answer into the next chord','With dead notes, 8 bars','12-bar blues'],l:k=>'Blues in {'+k+'}'}],
    C36:[{name:'Блюзовый этюд',goal:'Четыре фигуры блюзового баса подряд, как в настоящем квадрате.',how:'Четыре фрагмента подряд. Сначала каждый отдельно на рабочем темпе, потом пары (1+2, 2+3, 3+4), потом целиком.',tip:'Запиши прогон на телефон. Слабое место почти всегда на стыке фрагментов.',hf:'На стыке фрагментов не меняй чередование пальцев: продолжай, как шло.',hp:'Стыки — самые опасные места для штриха. Реши заранее, вниз или вверх.',lvl:['Короткие фрагменты, четверти','Свинг, по такту','Два такта во фрагменте','Триоли и мёртвые ноты','Длинные фразы, легато и стопы'],l:null},
         {name:'Blues étude',goal:'Four blues bass figures in a row, like in a real chorus.',how:'Four fragments in a row. Each one on its own at working tempo first, then pairs (1+2, 2+3, 3+4), then the whole thing.',tip:'Record a full run on your phone. The weak spot is almost always at the joint between fragments.',hf:'At a joint between fragments, keep the finger alternation going as it was.',hp:'Joints are the riskiest spots for picking. Decide in advance: down or up.',lvl:['Short fragments, quarters','Swing, one bar each','Two bars per fragment','Triplets and dead notes','Long phrases, legato and stops'],l:null}]
  };
  const NUM={A16:16,A17:17,A18:18,A19:19,A20:20,A21:21,A22:22,A23:23,A37:37,L24:24,L25:25,L26:26,L27:27,L28:28,L29:29,L30:30,L31:31,L38:38,C32:32,C33:33,C34:34,C35:35,C36:36};
  const EX={},EXEN={};
  Object.keys(G).forEach(id=>{
    const [ru,en]=T[id],{l:lr,...mr}=ru,{l:le,...me}=en;
    const lab=(k,i,lang)=>id==='C36'?(lang?'Étude ':'Этюд ')+(i+1)+(lang?' in {':' в {')+k+'}: '+ETU[i].map(f=>(lang?ET_EN:ET_RU)[f]).join(', '):'{'+k+'}, '+(lang?VL_EN:VL_RU)[i];
    const x=undefined;
    EX[id]=Object.assign({n:NUM[id]},mr,{sub:3,v:VARS.map((V,i)=>{ART=id==='C36'?'':V.ar;const b=BV(lab(V.k,i,0),G[id].map(g=>g(key(V),i)),x);ART='';return b;})});
    EXEN[id]=Object.assign({},me,{v:VARS.map((V,i)=>lab(V.k,i,1))});
  });
  return {EX,EXEN,COACH:{C36:{stages:COACH_GUITAR.C36.stages},L31:{v:{1:{cyc:[{sub:2,tag:['Вибрато восьмыми','Vibrato in 8ths']},{sub:3,tag:['Вибрато триолями','Vibrato in triplets']},{sub:4,tag:['Вибрато 16-ми','Vibrato in 16ths']}]}}}}};
})();
const LIBS={
  metal:{guitar:{EX:EX_GUITAR,EXEN:EXEN_GUITAR,GROUPS:GROUPS_GUITAR,TESTS:TESTS_GUITAR,COACH:COACH_GUITAR,RIFF:RIFF_RULES},
         bass:{EX:EX_BASS,EXEN:EXEN_BASS,GROUPS:GROUPS_BASS,TESTS:TESTS_BASS,COACH:COACH_BASS,RIFF:RIFF_RULES_BASS}},
  blues:{}
};
// библиотека блюза: метал того же инструмента, поверх — обе части; указания тренера метала для переписанных id убираются
function bluesLib(base,p1,p2){
  const EX=Object.assign({},base.EX,p1.EX,p2.EX),EXEN=Object.assign({},base.EXEN,p1.EXEN,p2.EXEN),COACH=Object.assign({},base.COACH);
  [p1,p2].forEach(p=>{Object.keys(p.EX).forEach(id=>delete COACH[id]);Object.assign(COACH,p.COACH);});
  return {EX,EXEN,COACH,GROUPS:base.GROUPS,TESTS:p1.TESTS||base.TESTS,RIFF:p1.RIFF||base.RIFF};
}
// медленный блюз в 12/8: табы написаны в 4/4 триолями (sub 3, /6 — шестнадцатые). В 12/8 пульс — восьмая: sub 3→1, 6→2, /3→/1, /6→/2.
function to128(EX,ids){ids.forEach(id=>{const e=EX[id],S={3:1,6:2};
  const fx=t=>Array.isArray(t)?t.map(fx):String(t).replace(/(^|\s)\/([36])(?=\s|$)/g,(m,a,n)=>a+'/'+S[n]);
  e.sub=S[e.sub||1]||e.sub;
  e.v.forEach(v=>{if(v.sub)v.sub=S[v.sub];v.meter='12/8';(v.lv||[]).forEach(l=>{if(l.sub)l.sub=S[l.sub];if(l.meter)l.meter='12/8';['t','t5','t6'].forEach(k=>{if(l[k])l[k]=fx(l[k]);});});});});}
to128(BLG1.EX,['R10']);to128(BLA1.EX,['R10']);to128(BLB1.EX,['R8']);to128(BLB2.EX,['C34']);
// бас блюза: версии на 5 и 6 струн строятся из 4-струнного таба. t5 — та же фраза октавой ниже (струна ниже, лад −7: в высоких тональностях
// тоника уходит на низкую B), t6 — октавой выше (струна выше, лад +7) для верхнего регистра в низких тональностях. Версия ставится,
// только если все ноты остаются на грифе (лады 0…17); иначе уровень играется как есть.
function bassOct(t,dir){const SS='BEADGC';let ok=true;
  const fr=x=>{const n=+x-7*dir;if(n<0||n>17)ok=false;return n;};
  const one=w=>w.replace(/^([BEADGC])([hpt]?)(\d+|x)(?:b(\d+))?(?:r(\d+))?/,(m,st,tc,f,bb,rr)=>{const i=SS.indexOf(st)+dir;if(i<0||i>5){ok=false;return m;}
    return SS[i]+tc+(f==='x'?f:fr(f))+(bb?'b'+fr(bb):'')+(rr?'r'+fr(rr):'');});
  const sys=t=>String(t).split(/\s+/).map(tok=>tok==='|'||tok[0]==='/'||tok[0]==='.'?tok:tok.split('+').map(one).join('+')).join(' ');
  const r=Array.isArray(t)?t.map(sys):sys(t);return ok&&(dir<0?/(^|[\s+])B[hpt]?(\d|x)/:/(^|[\s+])C[hpt]?(\d|x)/).test([].concat(r).join(' '))?r:null;}
function bassExt(EX,ids,lvs,key,dir){ids.forEach(id=>EX[id].v.forEach(v=>lvs.forEach(j=>{const l=v.lv&&v.lv[j];if(!l||l[key])return;const t=bassOct(l.t,dir);if(t)l[key]=t;})));}
[BLB1.EX,BLB2.EX].forEach(E=>{const ids=Object.keys(E).filter(id=>id[0]!=='W'&&E[id].v&&E[id].v[0].lv);
  bassExt(E,ids,[3,4],'t5',-1);bassExt(E,ids.filter(id=>id[0]==='A'||id[0]==='L'),[4],'t6',1);});
LIBS.blues.guitar=bluesLib(LIBS.metal.guitar,BLG1,BLG2);
LIBS.blues.acoustic=bluesLib(LIBS.metal.guitar,BLA1,BLA2);
LIBS.blues.bass=bluesLib(LIBS.metal.bass,BLB1,BLB2);
