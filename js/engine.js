// RiffGym — протоколы, расписание, состояние, рендер, таймер, метроном, плеер, тренер. Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= протоколы ================= */
// co — ведение (тренер): подходы и отдых [от, до, обычно] в секундах, кратно 5; work — минута на рабочем темпе в неделю скорости
const PHASES=[
  {co:{set:[60,90,75],rest:[20,30,25]},
   ru:{name:'Объём',steps:['Найди чистый темп: начни медленно и поднимай по 4 bpm, пока игра чистая, а рука мягкая.','Сбрось 20% — это рабочий темп этой недели.','Подходы по 60–90 секунд, между ними 20–30 секунд отдыха.','Цель недели — ровная атака и расслабленные руки, а не скорость.']},
   en:{name:'Volume',steps:['Find your clean tempo: start slow and add 4 bpm while the playing stays clean and the hand stays soft.','Drop 20%: that is this week’s working tempo.','Sets of 60–90 seconds with 20–30 seconds of rest in between.','The goal this week is an even attack and relaxed hands, not speed.']}},
  {co:{set:[40,60,50],rest:[20,30,25]},
   ru:{name:'Наращивание',steps:['Начни на 10% ниже вчерашнего чистого темпа.','После каждого чистого подхода (40–60 секунд) прибавляй 4 bpm.','Ошибка или зажим — минус 8 bpm и снова вверх.','Закончи тремя подходами на самом высоком чистом темпе.']},
   en:{name:'Build',steps:['Start 10% below yesterday’s clean tempo.','After every clean set (40–60 seconds), add 4 bpm.','A mistake or tension: minus 8 bpm, then climb again.','Finish with three sets at your highest clean tempo.']}},
  {co:{set:[30,60,40],rest:[15,30,20],work:[50,70,60]},
   ru:{name:'Скорость',steps:['Поставь метроном на 10–15% выше чистого темпа и включи «Рывки».','Играй 1 долю, 1 долю отдыхай. Потом 2 через 2, потом 4 через 4.','Каждые 3–4 минуты — минута на рабочем темпе без рывков, чтобы скорость перенеслась на удобный темп.','Рывок с ошибками не считается. Ноты должны быть чистыми даже на короткой дистанции.']},
   en:{name:'Speed',steps:['Set the metronome 10–15% above your clean tempo and turn on Bursts.','Play 1 beat, rest 1 beat. Then 2 and 2, then 4 and 4.','Every 3–4 minutes, play one minute at working tempo without bursts so the speed carries over to a comfortable tempo.','A burst with mistakes does not count. Notes stay clean even over a short distance.']}},
  {co:{set:[30,45,40],rest:[30,45,40]},
   ru:{name:'Разгрузка',steps:['Темп на 20% ниже чистого.','Короткие подходы по 30–45 секунд, отдых столько же.','Хотя бы один подход сыграй чистым звуком без перегруза: так слышна любая грязь.','Без рывков и рекордов.']},
   en:{name:'Deload',steps:['Tempo 20% below clean.','Short sets of 30–45 seconds with equal rest.','Play at least one set on a clean tone with no gain: every bit of noise shows.','No bursts, no records.']}}
];
const PH=k=>PHASES[k][LANG];
const MAINT_STEPS={ru:['Рабочий темп: на 10–15% ниже чистого.','2–3 подхода по минуте.','Без рывков и рекордов: задача — сохранить навык.'],en:['Working tempo: 10–15% below clean.','2–3 one-minute sets.','No bursts, no records: the job is to keep the skill.']};
const MAINT_CO={set:[50,75,60],rest:[15,30,25],n:[2,3]};
const COMBO_STEP={ru:'Связки: сначала каждую технику отдельно, потом стык двух соседних нот на границе, потом всю фразу.',en:'Combos: each technique on its own first, then the two notes at the joint, then the whole phrase.'};
const TEST_STEPS={ru:['Разогрей руки, если пропустил разминку.','Лестница: начни на комфортном темпе. Каждый чистый проход — плюс 4 bpm.','Первая ошибка или зажим — стоп. Результат — последний чистый темп.','Запиши результат: он хранится только в этом браузере.'],en:['Warm up your hands if you skipped the warm-up.','Ladder: start at a comfortable tempo. Every clean run: plus 4 bpm.','First mistake or tension: stop. Your result is the last clean tempo.','Save the result: it is stored only in this browser.']};
const PAUSE_STEPS={ru:['Отложи инструмент и встань.','Расслабь плечи, потряси кистями, сделай пару глубоких вдохов.','Попей воды.','Никакой растяжки через боль.'],en:['Put the instrument down and stand up.','Relax your shoulders, shake out your hands, take a few deep breaths.','Drink some water.','No stretching into pain.']};

/* ================= расписание ================= */
const ALLOC={
  15:{W:2,B:6,F:7,M:0,C:0,Mu:0,pn:0,pl:0},
  30:{W:3,B:8,F:12,M:7,C:0,Mu:0,pn:0,pl:0},
  45:{W:4,B:10,F:14,M:7,C:0,Mu:7,pn:1,pl:3},
  60:{W:5,B:12,F:18,M:9,C:0,Mu:10,pn:2,pl:3},
  90:{W:5,B:14,F:26,M:13,C:0,Mu:23,pn:3,pl:3},
  120:{W:7,B:16,F:32,M:15,C:10,Mu:30,pn:1,pl:10},
  180:{W:10,B:20,F:48,M:22,C:20,Mu:40,pn:2,pl:10},
  240:{W:10,B:24,F:60,M:28,C:28,Mu:60,pn:3,pl:10},
  300:{W:12,B:28,F:70,M:32,C:32,Mu:86,pn:4,pl:10}
};
const TIMES=[15,30,45,60,90,120,180,240,300];

function dayInfo(i){
  const cycle=Math.floor(i/28), dic=mod(i,28), week=Math.floor(dic/7), dow=dic%7;
  return {i,cycle,week,dow,focus:FOCUS_BY_DOW[dow],occ:(dow===6||dow<3)?0:1,gweek:Math.floor(i/7),pool:mod(Math.floor(i/7),6),material:i<0?MATERIALS[0]:MATERIALS[mod(cycle,6)],isTest:week===3&&dow===6,pre:i<0,date:dateOfIndex(i)};
}

const RIFF_METERS={ru:['4/4','3/4','5/8','7/8','9/8','11/8','13/16','6/8 поверх 4/4'],en:['4/4','3/4','5/8','7/8','9/8','11/8','13/16','6/8 over 4/4']};
// у блюза свои размеры (решение автора от 2026-11-14); выбор по индексу, поэтому RU и EN совпадают
const RIFF_METERS_BLUES={ru:['4/4','12/8','шаффл 4/4','3/4'],en:['4/4','12/8','4/4 shuffle','3/4']};
// размеры риффа дня по жанру: у библиотеки METERS (джаз, фанк, фингерстайл, решение автора от 2026-11-14), у блюза RIFF_METERS_BLUES; индекс берётся по длине списка
const riffMeters=()=>LIB_NOW().METERS||(GENRE==='blues'?RIFF_METERS_BLUES:RIFF_METERS);
const RIFF_RULES={
  ru:['хотя бы одна пауза длиной в целую долю','закончить диссонансом: малая секунда или тритон','только три нижние струны','хотя бы одна квинтоль или септоль','второй раз рифф повторяется с изменённой последней долей','через весь рифф проходит одна нота-педаль','не больше шести разных нот','рифф начинается не с сильной доли','внутри фразы одна смена размера','в риффе есть флажолет медиатором','одно место с тремоло двойными нотами','темп риффа на 20% ниже твоего рабочего, но звучит тяжело'],
  en:['at least one rest a full beat long','end on a dissonance: a minor second or a tritone','only the three lowest strings','at least one quintuplet or septuplet','the second time through, the last beat changes','one pedal note runs through the whole riff','no more than six different notes','the riff does not start on a strong beat','one meter change inside the phrase','includes a pinch harmonic','one spot with double-stop tremolo','tempo 20% below your working tempo, but it sounds heavy']
};
// у баса вместо флажолета медиатором и тремоло двойными нотами — то, что звучит на басу; индексы те же
const RIFF_RULES_BASS={ru:RIFF_RULES.ru.slice(),en:RIFF_RULES.en.slice()};
RIFF_RULES_BASS.ru[9]='в риффе есть натуральный флажолет';RIFF_RULES_BASS.en[9]='includes a natural harmonic';
RIFF_RULES_BASS.ru[10]='одно место с двойными нотами: квинта или децима';RIFF_RULES_BASS.en[10]='one spot with double stops: a fifth or a tenth';
function riffOfDay(d){
  const r=rng(Math.imul(d.i+7331,2654435761));
  const list=GROUPS[d.focus];const ti=pickIdx(r,list.length);const mi=pickIdx(r,riffMeters().ru.length);const ri=pickIdx(r,RIFF_RULES.ru.length);
  return {techId:list[ti],mi,ri,material:d.material};
}
function riffText(r){return {meter:riffMeters()[LANG][r.mi],material:matName(r.material),tech:X(r.techId,'name'),rule:riffRules()[LANG][r.ri]};}

function seg(kind,min,extra){return Object.assign({kind,min},extra||{});}
function warmSegs(W){
  if(W<=0)return[];
  if(W<=3)return[seg('warm',W,{id:'W0'})];
  if(W<8)return[seg('warm',2,{id:'W1'}),seg('warm',W-2,{id:'W2'})];
  const a=splitInt(W-2,[1,1]);
  return[seg('warm',2,{id:'W1'}),seg('warm',a[0],{id:'W2'}),seg('warm',a[1],{id:'W3'})];
}
function listSegs(kind,ids,total,extra){
  if(total<=0||!ids.length)return[];
  const mins=splitInt(total,ids.map(()=>1));
  return ids.map((id,k)=>seg(kind,mins[k],Object.assign({id},extra||{})));
}
function buildSession(i,T){
  const d=dayInfo(i);
  const a=ALLOC[T];
  const b={W:a.W,B:a.B,F:a.F,M:a.M,C:a.C,Mu:a.Mu};
  if(d.week===3&&T>=45){const f=Math.round(b.F*0.6),m=Math.round(b.M*0.6);b.Mu+=(b.F-f)+(b.M-m);b.F=f;b.M=m;}
  let test=0;
  if(d.isTest){test=Math.min(15,T-b.W);let need=test;for(const k of['B','F','M','C','Mu']){const x=Math.min(b[k],need);b[k]-=x;need-=x;}}
  const segs=[];
  segs.push(...warmSegs(b.W));
  if(test>0)segs.push(seg('test',test,{id:'TESTS'}));
  if(b.B>0){const k=clamp(Math.floor(b.B/3),1,5);const ids=['B1'].concat(rot(['B4','B2','B3','B5'],i).slice(0,k-1));segs.push(...listSegs('base',ids,b.B));}
  if(b.F>0){const list=GROUPS[d.focus],n=list.length,k=clamp(Math.floor(b.F/6),1,n);const ids=rot(list,(d.gweek*2+d.occ)*k).slice(0,k);segs.push(...listSegs(d.focus==='C'?'combo':'focus',ids,b.F,{focus:true}));}
  if(b.M>0){
    const gs=d.focus==='C'?['R','A','L']:['R','A','L'].filter(g=>g!==d.focus);
    const k=clamp(Math.floor(b.M/3.5),1,12);const cnt={};const ids=[];
    for(let j=0;j<k;j++){const g=gs[j%gs.length];cnt[g]=(cnt[g]||0);const Lg=GROUPS[g];ids.push(Lg[mod(i+cnt[g]*3+(g==='R'?0:g==='A'?1:2),Lg.length)]);cnt[g]++;}
    segs.push(...listSegs('maint',[...new Set(ids)],b.M));
  }
  if(b.C>0){
    if(d.focus==='C'){const k=clamp(Math.floor(b.C/10),1,2);const nv=EX.C36.v.length,vs=[mod(d.pool+1,nv),mod(d.pool+2,nv)].slice(0,k);const mins=splitInt(b.C,vs.map(()=>1));vs.forEach((v,j)=>segs.push(seg('combo',mins[j],{id:'C36',variant:v})));}
    else{const k=clamp(Math.floor(b.C/10),1,3);segs.push(...listSegs('combo',rot(GROUPS.C,i).slice(0,k),b.C));}
  }
  if(b.Mu>0){
    let items;
    if(b.Mu<12)items=[['riff',b.Mu]];
    else if(b.Mu<25)items=[['riff',10],['ear',b.Mu-10]];
    else if(b.Mu<45)items=[['riff',10],['ear',15],['comp',Math.max(1,b.Mu-25)]];
    else{const rest=splitInt(b.Mu-12,[30,25,30,15]);items=[['riff',12],['ear',rest[0]],['comp',rest[1]],['rep',rest[2]],['impro',rest[3]]];}
    items.forEach(x=>{if(x[1]>0)segs.push(seg('music',x[1],{mid:x[0]}));});
  }
  const play=segs.reduce((s,x)=>s+x.min,0);
  if(a.pn>0&&segs.length>1){
    const bounds=[];let c=0;segs.forEach((s,j)=>{c+=s.min;if(j<segs.length-1)bounds.push({j,c});});
    const used=new Set();const ins=[];
    for(let k=1;k<=a.pn;k++){
      const target=play*k/(a.pn+1);let best=null;
      bounds.forEach(bd=>{if(used.has(bd.j))return;if(!best||Math.abs(bd.c-target)<Math.abs(best.c-target))best=bd;});
      if(best){used.add(best.j);ins.push(best.j);}
    }
    ins.sort((x,y)=>y-x).forEach(j=>segs.splice(j+1,0,seg('pause',a.pl)));
  }
  const tot=segs.reduce((s,x)=>s+x.min,0);
  if(tot!==T){segs[segs.length-1].min+=T-tot;}
  let tt=0;segs.forEach(s=>{s.start=tt;tt+=s.min;});
  return {d,T,segs,riff:riffOfDay(d)};
}

/* ================= разрешение упражнения ================= */
// Уровень сложности: свой у каждого упражнения, по умолчанию 2, хранится в grif.lvl. Уровень меняет материал, а не план дня.
const LVL_DEF=2;
let LVS=lsGet('lvl',{});if(!LVS||typeof LVS!=='object')LVS={};
const lvlCount=id=>(EX[id]&&EX[id].lvl)?EX[id].lvl.length:0;
function getLvl(id){const n=lvlCount(id);return n?clamp(Math.round(+LVS[exKey(id)])||LVL_DEF,1,n):0;}
function setLvl(id,k){LVS[exKey(id)]=k;lsSet('lvl',LVS);}
// Упражнения с gen:true: материал по дню и ладу цикла, уровень lv (1…4) меняет сам рисунок.
function genEx(id,d,lv){
  if(INST==='bass')return genBass(id,d,lv);
  const mn=matName(d.material),mat=d.material;
  if(id==='B4'){
    const p=PERMS[mod(d.i,24)],run=(strs,base)=>strs.map((st,k)=>p.map(f=>st+(base(k)+f)).join(' ')).join(' ');
    const up=LOW_TO_HIGH,dn=LOW_TO_HIGH.slice().reverse(),skip=['E','D','A','G','D','B','G','e'];
    const t=lv===1?[run(up.slice(0,3),()=>8),run(dn.slice(3),()=>9)]
      :lv===3?[run(up,k=>7+k),run(dn,k=>12-k)]
      :lv===4?[run(skip,()=>8),run(skip.slice().reverse(),()=>9)]
      :lv===5?[run(skip,k=>7+k),run(skip.slice().reverse(),k=>14-k)]
      :[run(up,()=>8),run(dn,()=>9)];
    return {l:L('Порядок пальцев дня: ','Today’s finger order: ')+p.join('-'),t};
  }
  if(id==='A21'){
    const l=mn+L(', 3 ноты на струну',', 3 notes per string');
    if(lv===1){const x=npsRange(mat,0,3,'pick');return {l,t:[x.up.concat(x.down).join(' ')]};}
    if(lv===3){const cell=k=>{const x=npsRange(mat,k,k+2,'pick');return x.up.concat(x.down).join(' ');};return {l,t:[[0,1,2].map(cell).join(' '),[3,4].map(cell).join(' ')]};}
    if(lv===5){const x=npsRange(mat,0,6,'pick'),g=[];[x.up,x.down].forEach(a=>{for(let k=0;k<12;k++)g.push(a.slice(k,k+4).join(' '));});return {l,sub:4,t:[0,4,8,12,16,20].map(k=>g.slice(k,k+4).join(' '))};}
    if(lv===4){const up=npsRange(mat,0,6,'pick').up,g=[];for(let k=0;k<12;k++)g.push(up.slice(k,k+4).join(' '));return {l,sub:4,t:[g.slice(0,4).join(' '),g.slice(4,8).join(' '),g.slice(8).join(' ')]};}
    return {l,t:npsTokens(mat,'pick')};
  }
  if(id==='L24'){
    const pr=PAIRS[mod(d.i,6)],a=11+pr[0],b2=11+pr[1],l=L('Трель ','Trill ')+pr.join('-')+L(' и ',' and ')+mn;
    const tr16=J('/4 G'+a,R('Gh'+b2+' Gp'+a,3),'Gh'+b2),tr6=J('G'+a,R('Gh'+b2+' Gp'+a,5),'Gh'+b2);
    if(lv===1){const x=npsRange(mat,0,3,'legato');return {l,t:[tr16,x.up.concat(x.down).join(' ')]};}
    if(lv===3){const x=npsRange(mat,0,6,'nowhere');return {l,t:[tr6,x.up.join(' '),x.down.join(' ')]};}
    if(lv===4){const gs=stringGroups(mat,'e',3),tc=(k,dir)=>k?(dir==='up'?'h':'p'):'';return {l:L('Трель ','Trill ')+pr.join('-')+L(', ',', ')+mn+L(' на струне {s:e}',' on the {s:e} string'),t:[tr6,groupsUp('e',gs,tc),groupsDown('e',gs,tc)]};}
    if(lv===5){const tc=(k,dir)=>k?(dir==='up'?'h':'p'):'';return {l:L('Трель ','Trill ')+pr.join('-')+L(', ',', ')+mn+L(' на струнах {s:B} и {s:e}',' on the {s:B} and {s:e} strings'),sub:4,t:['/6 '+tr6,groupsUp('B',stringGroups(mat,'B',4),tc),groupsDown('e',stringGroups(mat,'e',4),tc)]};}
    return {l,t:[tr16].concat(npsTokens(mat,'legato'))};
  }
  if(id==='L28'){
    if(lv===1){const gs=stringGroups(mat,'e',3).slice(0,4);return {l:mn+L(' на струне {s:e}',' on the {s:e} string'),t:[groupsUp('e',gs)]};}
    if(lv===3){const gs=stringGroups(mat,'e',4);return {l:mn+L(' на струне {s:e}',' on the {s:e} string'),sub:4,t:[groupsUp('e',gs),groupsDown('e',gs)]};}
    if(lv===4){return {l:mn+L(' на струнах {s:B} и {s:e}',' on the {s:B} and {s:e} strings'),t:[groupsUp('B',stringGroups(mat,'B',3)),groupsDown('e',stringGroups(mat,'e',3))]};}
    if(lv===5){return {l:mn+L(' на струнах {s:B} и {s:e}',' on the {s:B} and {s:e} strings'),sub:4,t:[groupsUp('B',stringGroups(mat,'B',4)),groupsDown('e',stringGroups(mat,'e',4))]};}
    return {l:mn+L(' на струне {s:e}',' on the {s:e} string'),t:oneStringSeq(mat)};
  }
  return null;
}
// Вариант: по умолчанию вариант дня; s.pick — выбор вручную на этом сегменте, живёт до пересборки плана (смена дня, времени, перезагрузка).
const dayVar=(s,d)=>mod(s.variant!=null?s.variant:d.pool,EX[s.id].v.length);
const varIdx=(s,d)=>s.pick!=null?s.pick:dayVar(s,d);
// lv — уровень; без него берётся сохранённый для упражнения.
function resolveEx(s,d,lv){
  const ex=EX[s.id];if(!ex)return null;
  const nl=lvlCount(s.id);lv=nl?clamp(lv||getLvl(s.id),1,nl):0;
  let v=null;
  if(ex.gen)v=genEx(s.id,d,lv||LVL_DEF);
  else if(ex.v){
    const idx=varIdx(s,d);const raw=ex.v[idx];
    const e=(lv&&raw.lv)?raw.lv[lv-1]:raw;
    v={l:VX(s.id,idx,'l',RAW),note:VX(s.id,idx,'note',RAW),t:e.t,sub:e.sub||raw.sub,meter:e.meter||raw.meter,tun:e.tun||raw.tun};
    // версия под число струн, если есть: бас t6 → t5 → t, гитара t8 → t7 → t; у такой версии своя подпись lN и noteN, если струна в подписи другая
    const n=NSTR(),k=(INST==='bass'?[6,5]:[8,7]).find(k=>n>=k&&e['t'+k])||0;
    if(k){v.t=e['t'+k];v.l=VX(s.id,idx,'l'+k,RAW)||v.l;v.note=VX(s.id,idx,'note'+k,RAW)||v.note;}
  }
  // drop: таб в тональности drop, если можно (см. dropKey); иначе ноты нижней струны +2 лада (dsh)
  let tu=TU();
  // открытый строй варианта (tun): только на 6 струнах не баса; сдвиг пользователя сохраняется, drop не применяется
  if(v&&v.tun&&INST!=='bass'&&NSTR()===6){const o=TUNE[INST].o;tu=v.tun+(o?'@'+o:'');}
  if(v&&Array.isArray(v.t)&&TUN(tu).drop){const kt=dropKey(v.t,TUN(tu));if(kt){v.t=kt;tu+='k';}}
  if(v){v.l=noteTxt(v.l,tu);v.note=noteTxt(v.note,tu);}
  return {ex,id:s.id,v,lv,nl,tu,sub:(v&&v.sub)||ex.sub||1,meter:(v&&v.meter)||'4/4'};
}
const KINDS={ru:{warm:'Разминка',test:'Тесты',base:'База',focus:'Фокус',maint:'Поддержка',combo:'Связки',music:'Музыка',pause:'Пауза'},en:{warm:'Warm-up',test:'Tests',base:'Base',focus:'Focus',maint:'Maintenance',combo:'Combos',music:'Music',pause:'Break'}};
const KIND=k=>KINDS[LANG][k];
const MUSIC={
  riff:{ru:'Рифф дня',en:'Riff of the day',how:d=>L('Сочини рифф по условиям дня (карточка «Рифф дня»). Доведи его до чистого исполнения четыре раза подряд и запиши на телефон. Поделись с друзьями: у них те же условия.','Write a riff to today’s conditions (see the Riff of the day card). Get it clean four times in a row and record it on your phone. Share it with friends: they have the same conditions.')},
  ear:{ru:'Снятие на слух',en:'Transcription',how:d=>L('Выбери любую песню жанра и сними 4–8 тактов без табов. Сначала пропой фрагмент, потом найди ноты на грифе, потом сыграй вместе с записью. Отметь, какой лад или какие аккорды там звучат.','Pick any song in the genre and transcribe 4–8 bars without tabs. Sing the fragment first, then find the notes on the neck, then play along with the recording. Note which scale or chords it uses.')},
  comp:{ru:'Сочинение',en:'Songwriting',how:d=>L('Разверни рифф дня в часть песни: рифф → вариация → переход → второй рифф. Хотя бы в одном месте используй технику фокуса дня ('+GN(d.focus).toLowerCase()+').','Turn the riff of the day into a song section: riff → variation → transition → second riff. Use today’s focus technique ('+GN(d.focus).toLowerCase()+') at least once.')},
  rep:{ru:'Репертуар',en:'Repertoire',how:d=>L('Песня или фрагмент на твой выбор. Разбей на куски по 1–2 такта, сложные места отработай на рабочем темпе по протоколу недели, затем склей и сыграй целиком под запись.','A song or fragment of your choice. Split it into 1–2 bar chunks, drill the hard spots at working tempo with this week’s protocol, then join them and play it through to a recording.')},
  impro:{ru:'Импровизация',en:'Improvisation',how:d=>L('Метроном 4/4, лад цикла: '+matName(d.material)+'. Две минуты только шестнадцатыми, две минуты только триолями, остальное свободно. Цель — фразы с началом и концом, а не гаммы.','Metronome in 4/4, cycle scale: '+matName(d.material)+'. Two minutes of sixteenths only, two minutes of triplets only, then free. Aim for phrases with a beginning and an end, not scales.')}
};
function segTitle(s,d){
  if(s.kind==='pause')return KIND('pause');
  if(s.kind==='test')return L('Тесты цикла','Cycle tests');
  if(s.kind==='music')return MUSIC[s.mid][LANG];
  return numTitle(s.id);
}

/* ================= состояние ================= */
const today=dayIndexOf(new Date());
const st={i:today,T:clamp(lsGet('time',60),15,300),plan:null,cur:0,remain:0,running:false,last:0,done:new Set()};
if(!ALLOC[st.T])st.T=60;
const $=id=>document.getElementById(id);
function fmt(sec){sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),s=sec%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
function fmtStart(min){const h=Math.floor(min/60),m=min%60;return h+':'+String(m).padStart(2,'0');}
function timeLabel(T){if(T<60)return T+L(' мин',' min');const h=Math.floor(T/60),m=T%60;return h+L(' ч',' h')+(m?' '+m:'');}

/* ================= рендер ================= */
// Тема: по умолчанию тёмная (решение автора от 2026-11-23); auto — по системе, light/dark — выбор пользователя (grif.theme)
const THEMES=['auto','light','dark'];
let THEME=(x=>THEMES.includes(x)?x:'dark')(lsGet('theme','dark'));
function applyTheme(){
  const r=document.documentElement;if(THEME==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',THEME);
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(r).getPropertyValue('--bg').trim()||'#0e1115';
}
// Масштаб табов (grif.tabz): CSS zoom на .tabsc, перенос пересчитывает layTabs
const TABZ=[0.75,1,1.25,1.5];
let TABZOOM=(x=>TABZ.includes(x)?x:1)(lsGet('tabz',1));
function applyTabz(){document.documentElement.style.setProperty('--tabz',String(TABZOOM));
  document.querySelectorAll('button[data-tz]').forEach(b=>{const k=TABZ.indexOf(TABZOOM)+(+b.dataset.tz);b.disabled=k<0||k>=TABZ.length;});
  document.querySelectorAll('.tabsc').forEach(layTabs);}
function setTabz(x){x=+x;if(!TABZ.includes(x))return;TABZOOM=x;lsSet('tabz',x);applyTabz();}
function setTheme(x){if(!THEMES.includes(x)||x===THEME)return;THEME=x;lsSet('theme',x);applyTheme();renderStatic();}
applyTheme();
const tuneShort=()=>{const t=TUNE[INST];return NOTES[mod(4+t.o,12)]+(t.d?' drop':'');};
function renderStatic(){
  document.documentElement.lang=LANG;
  document.title='RiffGym'+(LANG==='ru'?' — тренировка на гитаре и басу':' — guitar & bass practice')+(GENRE!=='metal'?' · '+GNAME(GENRE).toLowerCase():'')+(INST!=='guitar'?' · '+INAME(INST).toLowerCase():'');
  $('logo').innerHTML='Riff<b>Gym</b>';
  document.querySelectorAll('[data-i]').forEach(el=>{el.textContent=t(el.dataset.i);});
  $('prevDay').setAttribute('aria-label',t('prevDay'));$('nextDay').setAttribute('aria-label',t('nextDay'));
  document.querySelectorAll('.lang button[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===LANG)));
  $('themeSw').setAttribute('aria-label',t('themeLabel'));
  document.querySelectorAll('#themeSw button').forEach(b=>{const k=b.dataset.themeSet;b.textContent=k==='auto'?L('Авто','Auto'):k==='light'?L('Светлая','Light'):L('Тёмная','Dark');b.setAttribute('aria-pressed',String(k===THEME));});
  $('instSw').setAttribute('aria-label',L('Инструмент','Instrument'));
  document.querySelectorAll('#instSw button').forEach(b=>{const k=b.dataset.inst;b.textContent=INAME(k);b.hidden=!GENRES[GENRE].includes(k);b.setAttribute('aria-pressed',String(k===INST));});
  $('genreSel').setAttribute('aria-label',t('genreLabel'));
  $('genreSel').innerHTML=GENRE_IDS.map(k=>'<option value="'+k+'"'+(k===GENRE?' selected':'')+'>'+GNAME(k)+'</option>').join('');
  $('instBar').hidden=INST==='acoustic';
  $('bassBar').hidden=INST!=='bass';
  $('instLbl').textContent=L('Струны','Strings');
  $('setBtn').setAttribute('aria-label',t('settings'));
  $('strChips').innerHTML=GB([6,7,8],[4,5,6]).map(n=>'<button data-str="'+n+'" aria-pressed="'+(n===NSTR())+'">'+n+L(n===4?' струны':' струн',' strings')+'</button>').join('');
  const tn=TUNE[INST];
  $('tuneKey').setAttribute('aria-label',L('Строй','Tuning'));
  $('tuneKey').innerHTML=Array.from({length:12},(_,k)=>'<option value="'+(-k)+'">'+NOTES[mod(4-k,12)]+'</option>').join('');
  $('tuneKey').value=String(tn.o);
  $('dropChips').innerHTML=[[false,L('Стандарт','Standard')],[true,'Drop']].map(o=>'<button data-drop="'+o[0]+'" aria-pressed="'+(o[0]===tn.d)+'">'+o[1]+'</button>').join('');
  $('tuneBtn').textContent=L('Настроиться','Tune up');
  $('handChips').innerHTML=[['fingers',L('Пальцы','Fingers')],['pick',L('Медиатор','Pick')]].map(o=>'<button data-hand="'+o[0]+'" aria-pressed="'+(o[0]===HAND)+'">'+o[1]+'</button>').join('');
  $('aboutL').innerHTML=ABOUT[LANG].map(x=>'<li>'+x+'</li>').join('');
  $('safeL').innerHTML=SAFETY[LANG].map(x=>'<li>'+esc(x)+'</li>').join('');
  const sv=$('mSub').value||'1',bv=$('mBurst').value||'0';
  $('mSub').innerHTML=[[1,L('нет','none')],[2,L('8-е','8ths')],[3,L('триоли','triplets')],[4,L('16-е','16ths')],[6,L('секстоли','sextuplets')],['sw',L('свинг','swing')]].map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('');
  $('mBurst').innerHTML=[[0,L('выкл','off')],[1,L('1 доля / 1 пауза','1 beat on / 1 off')],[2,'2 / 2'],[4,'4 / 4']].map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('');
  $('mSub').value=Mt.sw?'sw':String(Mt.sub);$('mBurst').value=String(Mt.burst);
  $('mToggle').textContent=Mt.on?t('mOff'):t('mOn');
  renderViews();
}
// Доступны только сегодня и 7 дней назад: будущие тренировки и старые не показываем.
const DAYS_BACK=7;
const dayOk=i=>i<=today&&i>=today-DAYS_BACK;
function renderHeader(){
  const d=st.plan.d;
  $('dateLabel').textContent=dateText(d.date);
  $('todayBtn').hidden=(st.i===today);
  $('prevDay').disabled=!dayOk(st.i-1);$('nextDay').disabled=!dayOk(st.i+1);
  const parts=[
    [L('Неделя','Week'),d.pre?L('вводная','intro'):(d.week+1)+L(' из 4 · ',' of 4 · ')+PH(d.week).name],
    [L('Фокус','Focus'),GN(d.focus)+(d.isTest?L(' + тесты',' + tests'):'')],
    [L('Лад цикла','Cycle scale'),matName(d.material)]
  ];
  parts.push([L('Рифф дня','Riff of the day'),riffText(st.plan.riff).meter]);
  $('meta').innerHTML=parts.slice(2).map(c=>'<span>'+esc(c[0])+'<b>'+esc(c[1])+'</b></span>').join('');
  const n=$('notice');
  if(d.pre){n.hidden=false;n.textContent=L('Первый цикл стартует в понедельник, 2 ноября. До старта идёт вводная неделя: в воскресенье, 1 ноября, — тестовый день. Сними исходные замеры, чтобы потом видеть прогресс.','The first cycle starts on Monday, November 2. Until then it is an intro week, and Sunday, November 1 is a test day. Take baseline measurements so you can see your progress later.');}
  else n.hidden=true;
  $('timeChips').innerHTML=TIMES.map(T=>'<button data-t="'+T+'" aria-pressed="'+(T===st.T)+'">'+timeLabel(T)+'</button>').join('');
}
function renderPlan(){
  const {segs,d}=st.plan;
  $('planList').innerHTML=segs.map((s,k)=>{
    const cls=[s.kind==='pause'?'pause':''];if(k===st.cur)cls.push('cur');if(st.done.has(k))cls.push('done');
    const g=s.kind==='focus'?d.focus:(s.kind==='maint'&&s.id&&EX[s.id]?libGroupOf(s.id):'');
    return '<li class="'+cls.join(' ')+'" data-k="'+k+'" style="--kc:var(--k-'+s.kind+')">'+kindIc(s.kind,0,g)+'<span class="nm"><span class="kind" style="--kc:var(--k-'+s.kind+')">'+KIND(s.kind)+(s.focus?' · '+GN(d.focus):'')+'</span><b>'+esc(segTitle(s,d))+'</b><span class="tm">'+fmtStart(s.start)+'–'+fmtStart(s.start+s.min)+'</span></span><span class="mn">'+s.min+'′</span></li>';
  }).join('');
  const r=riffText(st.plan.riff);
  const inPlan=st.plan.segs.some(s=>s.mid==='riff');
  $('riffCard').innerHTML='<h3>'+L('Рифф дня','Riff of the day')+'</h3><dl><dt>'+L('Размер','Meter')+'</dt><dd>'+esc(r.meter)+'</dd><dt>'+L('Лад','Scale')+'</dt><dd>'+esc(r.material)+'</dd><dt>'+L('Техника','Technique')+'</dt><dd>'+esc(r.tech)+'</dd><dt>'+L('Условие','Rule')+'</dt><dd>'+esc(r.rule)+'</dd></dl><p class="legend" style="margin:0">'+L('Одинаковый для всех в этот день.','The same for everyone today.')+(inPlan?'':L(' В плане на это время его нет — сочини на досуге.',' It is not in the plan at this length: write it in your spare time.'))+'</p>';
  renderToday();
}
function stepsHtml(title,steps){return '<div class="sect"><h4>'+esc(title)+'</h4><ol>'+steps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>';}
// заголовок строя таба: «стандартный строй», «B drop · ADGCFBE»; у баса и 7/8 струн — ещё ноты струн
function tuneName(tu){const T=TUN(tu);if(T.lab)return T.lab+(T.off?' · '+T.name:'');return (T.std?L('стандартный строй','standard tuning'):T.key+' '+(T.drop?'drop':L('стандарт','standard')))+(T.bass||T.strs.length!==6||!T.std?' '+T.name:'')+(T.dk?L(' · на тон ниже',' · a tone lower'):'');}
function tabHtml(label,systems,sub,meter,tu){
  const key=JSON.stringify([systems,sub||1,meter||'4/4',tu||'guitar']),on=Pl.on&&Pl.key===key;
  return '<div class="tabbox" data-tab="'+esc(key)+'"><div class="tabhd"><span>'+esc(label||'')+'</span><span class="tabtu">'+tuneName(tu)+'</span><span class="tz"><button class="nb" data-tz="-1" aria-label="'+L('Мельче','Smaller')+'"'+(TABZ.indexOf(TABZOOM)<=0?' disabled':'')+'>'+IC('zoom-out')+'</button><button class="nb" data-tz="1" aria-label="'+L('Крупнее','Larger')+'"'+(TABZ.indexOf(TABZOOM)>=TABZ.length-1?' disabled':'')+'>'+IC('zoom-in')+'</button></span></div>'+
    '<div class="tabsc">'+renderTab(systems,sub,meter,tu)+'</div>'+
    '<div class="tabft"><button class="btn tplay" data-play aria-pressed="'+on+'">'+plLabel(on)+'</button><label class="tloop"><input type="checkbox" data-loop'+(Pl.loop?' checked':'')+'> '+L('по кругу','loop')+'</label><span class="legend">'+L('темп метронома','metronome tempo')+'</span></div></div>';
}
function legendHtml(){return '<p class="legend" style="margin:0">'+esc(L('h — хаммер, p — пулл-офф, T — тэп, стрелка — бенд (½ — полтона, full — тон) и возврат, волна — вибрато, P.H. — флажолет медиатором, P.M. — палм-мьют, прямоугольник и косая черта — паузы. Под табом ритм: вязки по долям, цифра под вязкой — триоль, квинтоль, секстоль. '+GB('7–8 струн: играй на шести верхних.','x — мёртвая нота. Строй стандартный; в пониженном играй те же лады.'),'h hammer-on, p pull-off, T tap, arrow: bend (½ half step, full whole step) and release, wave: vibrato, P.H. pinch harmonic, P.M. palm mute, block and slash: rests. Rhythm under the tab: beams per beat, a number under the beam marks triplets, quintuplets, sextuplets. '+GB('7–8 strings: play on the top six.','x: dead note. Standard tuning; if you tune down, play the same frets.')))+'</p>';}
// бас: указание для выбранной техники правой руки
function handHtml(id){if(INST!=='bass')return '';const f=HAND==='pick'?'hp':'hf',x=X(id,f);return x?'<p class="note"><b>'+esc(HAND==='pick'?L('Медиатор','Pick'):L('Пальцы','Fingers'))+':</b> '+esc(x)+'</p>':'';}
function subName(n){return {sw:L('свинг','swing'),1:L('без деления','no subdivision'),2:L('8-е','8ths'),3:L('триоли','triplets'),4:L('16-е','16ths'),6:L('секстоли','sextuplets')}[n];}

function varHtml(s,d){
  const n=EX[s.id].v.length,cur=varIdx(s,d),day=dayVar(s,d);
  let b='';for(let k=0;k<n;k++)b+='<button data-var="'+k+'" aria-pressed="'+(k===cur)+'"'+(k===day?' class="day" title="'+L('Вариант дня','Today’s variant')+'"':'')+'>'+(k+1)+'</button>';
  return '<div class="lvl"><span class="lbl">'+L('Вариант','Variant')+'</span><div class="lvlb" role="group" aria-label="'+L('Вариант упражнения','Exercise variant')+'">'+b+'</div><span class="lvld">'+esc(L('вариант дня — ','today’s variant: ')+(day+1))+'</span></div>';
}
function lvlHtml(id,lv,nl){
  let b='';for(let k=1;k<=nl;k++)b+='<button data-lvl="'+k+'" aria-pressed="'+(k===lv)+'">'+k+'</button>';
  return '<div class="lvl"><span class="lbl">'+L('Уровень','Level')+'</span><div class="lvlb" role="group" aria-label="'+L('Уровень сложности','Difficulty level')+'">'+b+'</div><span class="lvld">'+esc(X(id,'lvl')[lv-1])+'</span></div>';
}
function renderNow(){
  const {segs,d}=st.plan;const s=segs[st.cur];
  const kc='var(--k-'+s.kind+')';
  $('now').style.setProperty('--kc',kc);
  $('nowKind').textContent=KIND(s.kind)+(s.focus?' · '+GN(d.focus):'');
  $('nowKind').style.setProperty('--kc',kc);
  $('nowPos').textContent=(st.cur+1)+L(' из ',' of ')+segs.length+' · '+s.min+L(' мин',' min');
  $('nowTitle').textContent=segTitle(s,d);
  let h='';
  if(s.kind==='pause'){h=stepsHtml(L('Что делать','What to do'),PAUSE_STEPS[LANG]);}
  else if(s.kind==='music'){
    h='<div class="sect"><h4>'+L('Задание','Task')+'</h4><p>'+esc(MUSIC[s.mid].how(d))+'</p></div>';
    if(s.mid==='riff'||s.mid==='comp'){const r=riffText(st.plan.riff);h+='<div class="sect"><h4>'+L('Условия риффа дня','Riff of the day conditions')+'</h4><p>'+esc(r.meter+' · '+r.material+' · '+L('техника: ','technique: ')+r.tech+' · '+r.rule)+'.</p></div>';}
  }
  else if(s.kind==='test'){
    h=stepsHtml(L('Протокол теста','Test protocol'),TEST_STEPS[LANG]);
    const hist=lsGet('tests',{});
    h+='<div class="tests">'+TESTS.map(tt=>{const arr=hist[tt.id]||[];const last=arr[arr.length-1];const best=arr.reduce((m,x)=>Math.max(m,x.bpm),0);const nm=tt[LANG];
      return '<div class="test"><div><b>'+esc(nm[0])+'</b><div class="legend">'+esc(nm[1])+'</div></div>'+tabHtml('',tt.t,tt.sub,'4/4',TU())+'<div class="row"><input id="ti-'+tt.id+'" type="number" min="30" max="400" placeholder="bpm" aria-label="'+esc(nm[0])+'"><button class="btn" data-save="'+tt.id+'">'+L('Записать','Save')+'</button><button class="btn" data-sub="'+tt.sub+'">'+L('Метроном: ','Metronome: ')+subName(tt.sub)+'</button><span class="hist">'+(last?L('прошлый: ','last: ')+last.bpm+' ('+esc(last.date)+') · '+L('лучший: ','best: ')+best:L('результатов пока нет','no results yet'))+'</span></div></div>';}).join('')+'</div>';
  }
  else{
    const r=resolveEx(s,d);
    if(s.kind==='maint')h+=stepsHtml(L('Протокол поддержки','Maintenance protocol'),MAINT_STEPS[LANG]);
    else if(s.kind!=='warm'){const ph=PH(d.week);h+=stepsHtml(L('Протокол недели ','Week ')+(d.week+1)+L(': ',' protocol: ')+ph.name,ph.steps);if(s.kind==='combo')h+='<div class="sect"><p class="note">'+esc(COMBO_STEP[LANG])+'</p></div>';}
    h+='<div class="sect"><p class="goal">'+esc(X(s.id,'goal'))+'</p><p>'+esc(X(s.id,'how'))+'</p>'+(r.v&&r.v.note?'<p class="note">'+esc(r.v.note)+'</p>':'')+handHtml(s.id)+'<p class="tip">'+esc(X(s.id,'tip'))+'</p></div>';
    if(!r.ex.gen&&r.ex.v&&r.ex.v.length>1)h+=varHtml(s,d);
    if(r.nl)h+=lvlHtml(s.id,r.lv,r.nl);
    if(s.kind!=='warm')h+=tempoMemHtml(s.id);
    if(r.v)h+=tabHtml(L('Вариант: ','Variant: ')+r.v.l,r.v.t,r.sub,r.meter,r.tu)+legendHtml();
  }
  $('nowBody').innerHTML=h;
  renderClock();
  renderCoach();
}
function renderClock(){
  const s=st.plan.segs[st.cur];
  $('clock').textContent=fmt(st.remain);
  $('bar').style.width=(100*(1-st.remain/(s.min*60)))+'%';
  $('playBtn').innerHTML=IC(st.running?'pause':'play')+'<span>'+(st.running?t('pause'):(st.remain<s.min*60?t('resume'):t('start')))+'</span>';
  $('playBtn').classList.toggle('on',st.running);
  const left=st.remain+st.plan.segs.slice(st.cur+1).reduce((a,x)=>a+x.min*60,0);
  $('totalLeft').textContent=t('totalLeft')+' '+fmt(left);
  if(VIEW==='today')renderToday();
}
function markPlan(){[...$('planList').children].forEach((li,k)=>{li.classList.toggle('cur',k===st.cur);li.classList.toggle('done',st.done.has(k));});renderToday();}

/* ================= таймер ================= */
let wake=null;
function wantWake(){try{if(navigator.wakeLock&&!wake)navigator.wakeLock.request('screen').then(w=>{wake=w;w.addEventListener('release',()=>wake=null);}).catch(()=>{});}catch(e){}}
function goto(k,keepRun){
  const segs=st.plan.segs;k=clamp(k,0,segs.length-1);
  if(k!==st.cur)prFlush(st.cur);
  st.cur=k;st.remain=segs[k].min*60;
  if(!keepRun)st.running=false;
  st.last=performance.now();
  metroStop();applyMetroDefaults();renderNow();markPlan();
}
function chime(){const c=audio();if(!c)return;const t0=c.currentTime+0.02;[0,0.18,0.36].forEach((dt,k)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=k===2?1320:880;g.gain.setValueAtTime(0.0001,t0+dt);g.gain.exponentialRampToValueAtTime(0.4,t0+dt+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t0+dt+0.16);o.connect(g).connect(c.destination);o.start(t0+dt);o.stop(t0+dt+0.18);});}
setInterval(()=>{
  if(!st.running)return;
  const now=performance.now();
  if(co.hold&&coActive()){st.last=now;coachTick();return;} // тренер ждёт «Готов» или отсчёт: минуты не идут
  const dt=(now-st.last)/1000;st.remain-=dt;st.last=now;prTick(dt);
  if(st.remain<=0){
    chime();st.done.add(st.cur);
    if(st.cur<st.plan.segs.length-1){goto(st.cur+1,true);}
    else{st.remain=0;st.running=false;coachRun();renderClock();markPlan();toast(L('Тренировка дня закончена','Today’s workout is done'));openSummary();return;}
  }
  renderClock();
  coachTick();
},100);

/* ================= метроном ================= */
const METERS={'4/4':[4],'3/4':[3],'6/8':[3,3],'5/8':[3,2],'7/8':[2,2,3],'9/8':[2,2,2,3],'11/8':[3,3,3,2],'12/8':[3,3,3,3],'13/16':[4,4,5]};
const Mt={ctx:null,on:false,bpm:clamp(lsGet('bpm',100),30,320),meter:'4/4',sub:1,sw:false,burst:0,ladder:false,next:0,pulse:0,subi:0,bar:0,bc:0,timer:null,q:[]};
function audio(){try{if(!Mt.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;Mt.ctx=new C();}if(Mt.ctx.state==='suspended')Mt.ctx.resume();return Mt.ctx;}catch(e){return null;}}
function meterPulses(){return METERS[Mt.meter].reduce((a,b)=>a+b,0);}
function groupStarts(){const s=new Set();let c=0;METERS[Mt.meter].forEach(g=>{s.add(c);c+=g;});return s;}
function click(tm,level,rest){
  const c=Mt.ctx,o=c.createOscillator(),g=c.createGain();
  o.type=level===0?'sine':'triangle';
  o.frequency.value=[700,1050,1400,1800][level];
  let v=[0.22,0.5,0.7,0.95][level];if(rest)v*=0.22;
  g.gain.setValueAtTime(0.0001,tm);g.gain.exponentialRampToValueAtTime(v,tm+0.002);g.gain.exponentialRampToValueAtTime(0.0001,tm+0.045);
  o.connect(g).connect(c.destination);o.start(tm);o.stop(tm+0.05);
  return o;
}
function schedule(){
  const c=Mt.ctx;const n=meterPulses(),gs=groupStarts();
  while(Mt.next<c.currentTime+0.12){
    const level=Mt.subi>0?0:(Mt.pulse===0?3:(gs.has(Mt.pulse)?2:1));
    const rest=Mt.burst>0&&Math.floor(Mt.bc/Mt.burst)%2===1;
    click(Mt.next,level,rest);
    if(Mt.subi===0)Mt.q.push({t:Mt.next,p:Mt.pulse,rest});
    Mt.next+=60/Mt.bpm*subFrac(Mt.subi);Mt.subi++;
    if(Mt.subi>=Mt.sub){Mt.subi=0;Mt.pulse++;Mt.bc++;if(Mt.pulse>=n){Mt.pulse=0;Mt.bar++;if(Mt.ladder&&Mt.bar%8===0)setBpm(Mt.bpm+4);}}
  }
}
function draw(){
  if(!Mt.on)return;
  const c=Mt.ctx;let last=null;
  while(Mt.q.length&&Mt.q[0].t<=c.currentTime)last=Mt.q.shift();
  if(last){
    [...$('dots').children].forEach((el,k)=>{el.classList.toggle('on',k===last.p);el.classList.toggle('r',last.rest);});
    const ms=$('mState');
    if(Mt.burst>0){ms.textContent=last.rest?t('rest'):t('play');ms.className='mstate '+(last.rest?'rest':'play');}
    else{ms.textContent='';ms.className='mstate';}
  }
  requestAnimationFrame(draw);
}
function renderDots(){const gs=groupStarts();$('dots').innerHTML=Array.from({length:meterPulses()},(_,k)=>'<i class="'+(gs.has(k)?'g':'')+'"></i>').join('');}
function metroStart(at){const c=audio();if(!c){toast(L('Звук недоступен в этом браузере','Sound is not available in this browser'));return;}Mt.on=true;Mt.pulse=0;Mt.subi=0;Mt.bar=0;Mt.bc=0;Mt.q=[];Mt.next=at!=null?at:c.currentTime+0.08;schedule();Mt.timer=setInterval(schedule,25);$('mToggle').textContent=t('mOff');requestAnimationFrame(draw);wantWake();}
function metroStop(){Mt.on=false;clearInterval(Mt.timer);Mt.timer=null;$('mToggle').textContent=t('mOn');$('mState').textContent='';$('mState').className='mstate';[...$('dots').children].forEach(el=>el.classList.remove('on','r'));}
function curExKey(){const s=st.plan&&st.plan.segs[st.cur];return s&&s.id?exKey(s.id):null;}
// Память темпа по упражнению (бесплатная функция, решение автора от 2026-11-20).
// grif.bpmEx — рабочий темп {exKey: bpm}, сохраняется при любой смене bpm на упражнении и подставляется при его старте;
// grif.bpmClean — последний чистый темп {exKey: {bpm, date}}, записывается кнопкой в панели «Сейчас».
function setBpm(v){
  Mt.bpm=clamp(Math.round(v)||Mt.bpm,30,320);
  $('bpm').value=Mt.bpm;$('bpmRange').value=Mt.bpm;
  lsSet('bpm',Mt.bpm);const k=curExKey();if(k){const m=lsGet('bpmEx',{});m[k]=Mt.bpm;lsSet('bpmEx',m);}
  renderTempoMem();
}
function tempoMemHtml(id){
  const k=exKey(id),w=lsGet('bpmEx',{})[k],c=lsGet('bpmClean',{})[k];
  return '<div class="lvl tempo-mem"><span class="lbl">'+L('Темп','Tempo')+'</span><span class="lvld" id="tempoMem">'+tempoMemText(w,c)+'</span><button class="btn" data-clean="1">'+L('Записать как чистый','Save as clean')+'</button></div>';
}
function tempoMemText(w,c){return esc(L('рабочий: ','working: ')+(w?w+' bpm':'—')+' · '+L('последний чистый: ','last clean: ')+(c?c.bpm+' bpm ('+c.date+')':'—'));}
function renderTempoMem(){const el=$('tempoMem'),k=curExKey();if(el&&k)el.innerHTML=tempoMemText(lsGet('bpmEx',{})[k],lsGet('bpmClean',{})[k]);}
function setMeter(m){Mt.meter=METERS[m]?m:'4/4';$('mMeter').value=Mt.meter;Mt.pulse=0;Mt.bc=0;renderDots();}
// деление доли: 1, 2, 3, 4, 6 или 'sw' — свинговые восьмые (решение автора от 2026-11-14): два клика на долю, долгая-короткая 2:1
function setSub(n){Mt.sw=n==='sw';Mt.sub=Mt.sw?2:[1,2,3,4,6].includes(+n)?+n:1;$('mSub').value=Mt.sw?'sw':String(Mt.sub);}
// длина i-го клика доли в долях
function subFrac(i){return Mt.sw?(i===0?2/3:1/3):1/Mt.sub;}
function applyMetroDefaults(){
  if(co.base!=null)coBpm(null);const s=st.plan.segs[st.cur];const d=st.plan.d;
  if(s.id&&EX[s.id]){const r=resolveEx(s,d);setSub(r.sub);setMeter(r.meter);const m=lsGet('bpmEx',{});if(m[exKey(s.id)])setBpm(m[exKey(s.id)]);}
  else setMeter('4/4');
  const fast=s.kind==='focus'||s.kind==='base'||s.kind==='combo';
  if(!(fast&&d.week===2)){Mt.burst=0;$('mBurst').value='0';}
}

/* ================= плеер ================= */
// Синтез гитары: Karplus–Strong в буфер (кэш по высоте) → перегруз WaveShaper → «кабинет». Время в долях метронома, темп — Mt.bpm.
// Бас: те же буферы на его открытых струнах, свой чистый тракт без перегруза; пальцы — мягкий щипок, медиатор — яркий.
const Pl={on:false,once:false,key:null,box:null,ev:[],i:0,next:0,pos:0,bar:4,loop:true,timer:null,bus:null,bbus:null,bufs:{},voices:[],q:[],lit:'',tu:'guitar',hand:'fingers'};
function plLabel(on){return on?'■ '+L('Стоп','Stop'):'▶ '+L('Послушать','Listen');}
function plShaper(c,k){
  const sh=c.createWaveShaper(),cv=new Float32Array(2048);
  for(let i=0;i<cv.length;i++){const x=i/(cv.length-1)*2-1;cv[i]=Math.tanh(k*x);}
  sh.curve=cv;sh.oversample='4x';return sh;
}
function plBus(c){
  if(Pl.bus)return Pl.bus;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=110;
  const drive=c.createGain();drive.gain.value=9;
  const sh=plShaper(c,2.5);
  const mid=c.createBiquadFilter();mid.type='peaking';mid.frequency.value=800;mid.Q.value=0.8;mid.gain.value=-6;
  const cab=c.createBiquadFilter();cab.type='lowpass';cab.frequency.value=4500;cab.Q.value=0.9;
  const out=c.createGain();out.gain.value=0.16;
  hp.connect(drive).connect(sh).connect(mid).connect(cab).connect(out).connect(c.destination);
  return Pl.bus=hp;
}
function plBassBus(c){
  if(Pl.bbus)return Pl.bbus;
  // чистый бас без перегруза: срез гула, лёгкий подъём низа, мягкий верх (яркость задаёт щипок: пальцы/медиатор)
  const inp=c.createGain(),out=c.createGain();out.gain.value=0.5;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=30;
  const low=c.createBiquadFilter();low.type='lowshelf';low.frequency.value=120;low.gain.value=3;
  const top=c.createBiquadFilter();top.type='lowpass';top.frequency.value=4000;top.Q.value=0.5;
  inp.connect(hp).connect(low).connect(top).connect(out).connect(c.destination);
  return Pl.bbus=inp;
}
function plAcBus(c){
  if(Pl.abus)return Pl.abus;
  // акустика: чистый тракт, корпус около 200 Гц, присутствие около 3 кГц, мягкий срез верха
  const inp=c.createGain(),out=c.createGain();out.gain.value=0.55;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=80;
  const body=c.createBiquadFilter();body.type='peaking';body.frequency.value=200;body.Q.value=1.2;body.gain.value=4;
  const pres=c.createBiquadFilter();pres.type='peaking';pres.frequency.value=3000;pres.Q.value=0.9;pres.gain.value=3;
  const top=c.createBiquadFilter();top.type='lowpass';top.frequency.value=8000;top.Q.value=0.5;
  inp.connect(hp).connect(body).connect(pres).connect(top).connect(out).connect(c.destination);
  return Pl.abus=inp;
}
function plBuf(c,midi,pm,soft){
  const key=midi+(pm?'m':'')+(soft?'f':'');if(Pl.bufs[key])return Pl.bufs[key];
  const sr=c.sampleRate,f=440*Math.pow(2,(midi-69)/12),N=Math.max(2,Math.round(sr/f-0.5));
  const len=Math.floor(sr*(pm?0.5:2.2)),b=c.createBuffer(1,len,sr),y=b.getChannelData(0),r=rng(midi*31+(pm?7:0));
  let lp=0,mean=0;
  for(let i=0;i<N;i++){lp+=(pm?0.3:soft?0.35:0.75)*((r()*2-1)-lp);y[i]=lp;mean+=lp/N;}
  for(let i=0;i<N;i++)y[i]-=mean;
  const d=Math.pow(0.001,1/(f*(pm?0.2:3)));
  for(let i=N;i<len;i++)y[i]=d*0.5*(y[i-N]+(i>N?y[i-N-1]:0));
  return Pl.bufs[key]={b,rate:f*(N+0.5)/sr};
}
function plNote(c,nt,t0,len,pm,vel){
  const T=TUN(Pl.tu);
  if(nt.x){pm=true;len=Math.min(len,0.06);vel*=0.6;} // мёртвая нота: короткий глухой щелчок без высоты
  const sp=nt.tech==='S'||nt.tech==='P';
  if(sp){vel*=1.15;plSnap(c,t0,nt.tech==='P',vel);} // слэп и поп: яркая струна и щелчок о лады
  const bf=plBuf(c,T.open[nt.s]+dsh(T,nt.s)+(nt.x?3:nt.f)+(nt.ph?19:0),pm,!!T.bass&&Pl.hand==='fingers'&&!sp);
  const src=c.createBufferSource(),g=c.createGain(),pr=src.playbackRate,rt=bf.rate;
  src.buffer=bf.b;pr.setValueAtTime(rt,t0);
  if(nt.b!=null){const up=rt*Math.pow(2,(nt.b-nt.f)/12);pr.linearRampToValueAtTime(up,t0+len*0.35);
    if(nt.r!=null){pr.setValueAtTime(up,t0+len*0.6);pr.linearRampToValueAtTime(rt*Math.pow(2,(nt.r-nt.f)/12),t0+len*0.9);}}
  let lfo=null;
  if(nt.vib){lfo=c.createOscillator();const lg=c.createGain();lfo.frequency.value=5.5;lg.gain.setValueAtTime(0,t0);lg.gain.linearRampToValueAtTime(rt*(nt.b!=null?Math.pow(2,(nt.b-nt.f)/12):1)*0.022,t0+Math.min(0.25,len*0.4));lfo.connect(lg).connect(pr);lfo.start(t0);lfo.stop(t0+len+0.1);}
  g.gain.setValueAtTime(vel,t0);g.gain.setValueAtTime(vel,t0+len);g.gain.setTargetAtTime(0,t0+len,0.012);
  let node=src;
  if(pm){const lpf=c.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=T.bass?500:900;node=src.connect(lpf);}
  node.connect(g).connect(T.bass?plBassBus(c):Pl.ac?plAcBus(c):plBus(c));
  src.start(t0);src.stop(t0+len+0.12);
  Pl.voices.push({src,g,lfo,end:t0+len+0.12});
}
// щелчок слэпа (удар о лады, ниже) и попа (струна хлопает о гриф, выше и звонче)
function plSnap(c,t0,pop,vel){
  const n=Math.floor(c.sampleRate*0.03),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(n*(pop?0.12:0.2)));
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;
  f.type='bandpass';f.frequency.value=pop?3200:1800;f.Q.value=1.2;g.gain.value=vel*(pop?0.9:0.7);
  s.connect(f).connect(g).connect(plBassBus(c));s.start(t0);s.stop(t0+0.04);
}
function plClick(c,tm,acc){
  const o=c.createOscillator(),g=c.createGain();o.frequency.value=acc?1600:1150;
  g.gain.setValueAtTime(0.0001,tm);g.gain.exponentialRampToValueAtTime(acc?0.32:0.18,tm+0.002);g.gain.exponentialRampToValueAtTime(0.0001,tm+0.04);
  o.connect(g).connect(c.destination);o.start(tm);o.stop(tm+0.05);
}
function plTick(){
  const c=Mt.ctx;if(!Pl.on||!c)return;
  if(!Pl.box||!Pl.box.isConnected){
    // таб перерисован (язык, тот же сегмент) — продолжаем на новом элементе, иначе стоп
    Pl.box=[...document.querySelectorAll('.tabbox[data-tab]')].find(b=>b.dataset.tab===Pl.key)||null;Pl.lit='';
    if(!Pl.box){plStop();return;}
  }
  Pl.voices=Pl.voices.filter(v=>v.end>c.currentTime);
  while(Pl.next<c.currentTime+0.15){
    if(Pl.i>=Pl.ev.length){if(!Pl.loop||Pl.once){if(c.currentTime>=Pl.next)plStop();return;}Pl.i=0;}
    const e=Pl.ev[Pl.i],spb=60/Mt.bpm,len=e.dur*spb;
    if(!e.rest){const vel=0.9/Math.sqrt(e.notes.length);e.notes.forEach(nt=>plNote(c,nt,Pl.next,len,e.pm,nt.tech&&nt.tech!=='S'&&nt.tech!=='P'?vel*0.6:vel));}
    if(!Mt.on)for(let p=Math.ceil(Pl.pos-EPS);p<Pl.pos+e.dur-EPS;p++)plClick(c,Pl.next+(p-Pl.pos)*spb,mod(p,Pl.bar)===0);
    Pl.q.push({t:Pl.next,id:e.id});
    Pl.next+=len;Pl.pos+=e.dur;Pl.i++;
  }
}
function plDraw(){
  if(!Pl.on)return;
  const c=Mt.ctx;let last=null;
  while(Pl.q.length&&Pl.q[0].t<=c.currentTime)last=Pl.q.shift();
  if(last&&Pl.box&&last.id!==Pl.lit){
    Pl.box.querySelectorAll('.on[data-e]').forEach(el=>el.classList.remove('on'));
    const els=Pl.box.querySelectorAll('[data-e="'+last.id+'"]');els.forEach(el=>el.classList.add('on'));Pl.lit=last.id;
    const sc=Pl.box.querySelector('.tabsc');
    if(sc&&els[0]){const r=els[0].getBoundingClientRect(),sr=sc.getBoundingClientRect();if(r.left<sr.left||r.right>sr.right-8)sc.scrollLeft+=r.left-sr.left-24;}
  }
  requestAnimationFrame(plDraw);
}
function plButtons(){document.querySelectorAll('.tabbox [data-play]').forEach(b=>{const on=Pl.on&&b.closest('.tabbox')===Pl.box;b.textContent=plLabel(on);b.setAttribute('aria-pressed',String(on));});}
// Пример другого ритма: таб в делении from переписывается в деление to, нота меняется только на долю.
// Табы с /n или :k не переписываются — играются с делением to как есть.
function rhythmTab(systems,from,to){
  return systems.map(sys=>{
    const tk=sys.trim().split(/\s+/);if(tk.some(t=>/^\/|:/.test(t)))return sys;
    const out=[];let beat=[];
    const flush=()=>{if(!beat.length)return;for(let i=0;i<to;i++)out.push(beat[Math.min(beat.length-1,Math.floor(i*beat.length/to))]);beat=[];};
    tk.forEach(t=>{if(t==='|'){flush();out.push('|');return;}beat.push(t);if(beat.length===from)flush();});
    flush();return out.join(' ');
  });
}
function plStart(box,once,re){
  plStop();Pl.once=!!once;
  const c=audio();if(!c){toast(L('Звук недоступен в этом браузере','Sound is not available in this browser'));return;}
  let [systems,sub,meter,tu]=JSON.parse(box.dataset.tab);
  if(re&&re.to&&re.to!==(sub||1)){systems=rhythmTab(systems,re.from||sub||1,re.to);sub=re.to;}
  Pl.tu=tu||'guitar';
  Pl.ev=[];parseTab(systems,sub,Pl.tu).forEach((s,si)=>{let ci=0;s.items.forEach(it=>{if(!it.bar)Pl.ev.push(Object.assign({id:si+'.'+ci},it));ci++;});});
  if(!Pl.ev.length)return;
  Pl.key=box.dataset.tab;Pl.box=box;Pl.bar=+meter.split('/')[0]||4;Pl.i=0;Pl.pos=0;Pl.q=[];Pl.lit='';
  Pl.next=c.currentTime+0.12;
  if(Mt.on&&Mt.next){
    // вступаем с ближайшей сильной доли включённого метронома
    const sp=60/Mt.bpm,n=meterPulses();let tp=Mt.next,p=Mt.pulse;
    if(Mt.subi>0){for(let i=Mt.subi;i<Mt.sub;i++)tp+=subFrac(i)*sp;p++;}
    Pl.next=tp+mod(n-p,n)*sp;
    if(Pl.next<c.currentTime+0.05)Pl.next+=n*sp;
  }
  Pl.on=true;Pl.timer=setInterval(plTick,25);plTick();requestAnimationFrame(plDraw);plButtons();
}
function plStop(){
  if(!Pl.on)return;
  Pl.on=false;Pl.once=false;clearInterval(Pl.timer);Pl.timer=null;
  const c=Mt.ctx,now=c?c.currentTime:0;
  Pl.voices.forEach(v=>{try{v.g.gain.cancelScheduledValues(now);v.g.gain.setTargetAtTime(0,now,0.01);v.src.stop(now+0.06);if(v.lfo)v.lfo.stop(now+0.06);}catch(e){}});
  Pl.voices=[];Pl.q=[];
  if(Pl.box)Pl.box.querySelectorAll('.on[data-e]').forEach(el=>el.classList.remove('on'));
  plButtons();Pl.box=null;Pl.key=null;
}
$('nowBody').addEventListener('click',e=>{const b=e.target.closest('button[data-play]');if(!b)return;const box=b.closest('.tabbox');if(Pl.on&&Pl.box===box)plStop();else plStart(box);});
$('nowBody').addEventListener('change',e=>{if(e.target.matches('input[data-loop]')){Pl.loop=e.target.checked;document.querySelectorAll('input[data-loop]').forEach(x=>{x.checked=Pl.loop;});}});

/* ================= тренер ================= */
// Ведение внутри сегмента: подходы и отдых по протоколу недели (PHASES[].co) или поддержки (MAINT_CO),
// плюс указания упражнений из COACH. Длительности кратны 5 с, их сумма равна минутам сегмента.
// Тренер сам включает метроном, деление, размер и рывки. bpm только подсказывает (TEMPO), кроме подходов с bpmMul:
// на них тренер временно ставит bpm×bpmMul и возвращает прежний bpm на отдыхе.
const WARM_CO={set:[40,120,60],rest:[10,20,15],n:[2,3]};
const TEST_CO={set:{T1:[30,30,30],T3:[60,60,60]},def:[15,30,20],rest:[20,30,20]};
const TEMPO={
  find:['Найди чистый темп: начни медленно, после каждого чистого прохода +4 bpm.','Find your clean tempo: start slow and add 4 bpm after every clean run.'],
  vol:['Рабочий темп: на 20% ниже найденного чистого.','Working tempo: 20% below the clean tempo you found.'],
  build0:['Начни на 10% ниже вчерашнего чистого темпа.','Start 10% below yesterday’s clean tempo.'],
  build:['Прошлый подход чистый — прибавь 4 bpm. Была ошибка или зажим — убавь 8 bpm.','Last set clean: add 4 bpm. A mistake or tension: take off 8 bpm.'],
  top:['Самый высокий чистый темп, без прибавки.','Your highest clean tempo, no more adding.'],
  burst:['На 10–15% выше чистого темпа.','10–15% above your clean tempo.'],
  same:['Темп тот же.','Same tempo.'],
  work:['Рабочий темп: на 10% ниже чистого.','Working tempo: 10% below clean.'],
  deload:['На 20% ниже чистого темпа.','20% below your clean tempo.'],
  maint:['Рабочий темп: на 10–15% ниже чистого.','Working tempo: 10–15% below clean.'],
  half:['Тренер ставит половину темпа: 32-е, по две ноты на щелчок.','The coach sets half tempo: 32nds, two notes per click.'],
  back:['Тренер вернул прежний темп.','The coach has restored your previous tempo.'],
  warm:['Половина рабочего темпа.','Half your working tempo.'],
  mul:['Тренер меняет темп на этот подход.','The coach changes the tempo for this set.'],
  ladder0:['Начни на комфортном темпе.','Start at a comfortable tempo.'],
  ladder:['Прошлый проход чистый — прибавь 4 bpm. Ошибка или зажим — стоп: результат — последний чистый темп, запиши его.','Last run clean: add 4 bpm. A mistake or tension: stop. Your result is the last clean tempo, save it.']
};
const COMBO_STAGES=[['Каждая техника отдельно','Each technique on its own'],['Стык: две ноты на границе техник','The joint: the two notes where techniques meet'],['Вся фраза','The whole phrase']];
// Указания упражнений: cyc — по кругу на подходы, v — только для варианта с этим индексом, stages — этапы от первого подхода к последнему.
// Поля подхода в cyc: sub — деление метронома, tag — подпись, bpmMul — множитель темпа на подходе (тренер ставит bpm×bpmMul,
// на отдыхе возвращает), play — деление, в котором звучит пример этого ритма (таб переписывается из деления упражнения:
// нота меняется только на долю). Перед первым подходом с play или bpmMul тренер играет пример в новом ритме и темпе.
const COACH_GUITAR={
  W0:{free:60},
  B1:{cyc:[{},{},{sub:6,play:6,tag:['Секстоли','Sextuplets']},{sub:4,play:8,bpmMul:0.5,tag:['32-е на половине темпа','32nds at half tempo']}]},
  B2:{v:{1:{cyc:[{tag:['Начни апстроком: переход «внутри»','Start on an upstroke: inside change']},{tag:['Начни даунстроком: переход «снаружи»','Start on a downstroke: outside change']}]}}},
  L31:{v:{1:{cyc:[{sub:2,tag:['Вибрато восьмыми','Vibrato in 8ths']},{sub:3,tag:['Вибрато триолями','Vibrato in triplets']},{sub:4,tag:['Вибрато 16-ми','Vibrato in 16ths']}]}}},
  C36:{stages:[['Фрагмент 1 отдельно','Fragment 1 on its own'],['Фрагмент 2 отдельно','Fragment 2 on its own'],['Фрагмент 3 отдельно','Fragment 3 on its own'],['Фрагмент 4 отдельно','Fragment 4 on its own'],['Пара 1+2','Pair 1+2'],['Пара 2+3','Pair 2+3'],['Пара 3+4','Pair 3+4'],['Целиком','The whole étude']],v:{2:{stageMeter:{0:'7/8'}},4:{stageMeter:{0:'5/8'}},5:{stageMeter:{1:'6/8'}}}}
};
const COACH_BASS={
  W0:{free:60},
  B1:{cyc:[{},{},{sub:6,play:6,tag:['Секстоли','Sextuplets']},{sub:4,play:8,bpmMul:0.5,tag:['32-е на половине темпа','32nds at half tempo']}]},
  B2:{v:{1:{cyc:[{tag:['Начни со среднего пальца или апстроком','Start with the middle finger or an upstroke']},{tag:['Начни с указательного или даунстроком','Start with the index finger or a downstroke']}]}}},
  L31:{v:{1:{cyc:[{sub:2,tag:['Вибрато восьмыми','Vibrato in 8ths']},{sub:3,tag:['Вибрато триолями','Vibrato in triplets']},{sub:4,tag:['Вибрато 16-ми','Vibrato in 16ths']}]}}},
  C36:{stages:COACH_GUITAR.C36.stages,v:{2:{stageMeter:{0:'7/8'}},4:{stageMeter:{0:'5/8'}},5:{stageMeter:{1:'6/8'}}}},
/*@BASS_COACH@*/
};
let COACH=COACH_GUITAR;

