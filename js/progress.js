// RiffGym — экран «Прогресс» (редизайн, этап 6). Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= данные ================= */
// Статистика только для вошедших: журнал practice_log (сервер, window.__grifStore.fetchLog) + ещё не отправленная очередь grif.logq
// + идущий сейчас сегмент. Минуты, статус и паутина — по всем жанрам и инструментам; чистый темп и тесты — по текущим.
const PG={rows:new Map(),u:null,at:0,busy:false,err:false,all:false};
const PG_DAY=600;                          // день засчитывается от 10 минут
const PG_AX=['B','R','A','L','C','M'];     // оси паутины: база, ритм, арпеджио, левая рука, связки, музыка
const pgAxName=g=>g==='B'?KIND('base'):g==='M'?KIND('music'):GN(g);
// грузим текущий и прошлый цикл (и не меньше 7 дней для статуса)
const pgFrom=()=>isoDay(dateOfIndex(Math.min((dayInfo(today).cycle-1)*28,today-6)));
function pgReset(){const u=prUser();if(PG.u!==u){PG.rows.clear();PG.u=u;PG.at=0;PG.err=false;}}
// записи очереди остаются в памяти и после отправки: сервер мог ещё не вернуть их в журнале
function pgAbsorb(){const u=prUser();if(!u)return;prQueue().log.forEach(x=>{if(x&&x._u===u&&x.client_id)PG.rows.set(x.client_id,x);});}
async function pgLoad(force){
  pgReset();const S=window.__grifStore;
  if(!PG.u||!S||typeof S.fetchLog!=='function'||PG.busy)return;
  if(!force&&PG.at&&Date.now()-PG.at<60000)return;
  PG.busy=true;
  try{const r=await S.fetchLog(pgFrom());(r||[]).forEach(x=>{if(x&&x.client_id)PG.rows.set(x.client_id,x);});PG.err=false;}catch(e){PG.err=true;}
  PG.busy=false;PG.at=Date.now();
  if(VIEW==='progress')renderProgress();
}
function pgRows(){
  pgAbsorb();const u=prUser(),out=[...PG.rows.values()];
  if(u&&st.plan)Object.keys(PR.sec).forEach(k=>{const s=st.plan.segs[+k];if(s&&s.kind!=='pause'&&PR.sec[k]>=1)out.push(prRow(+k,PR.sec[k],u));});
  return out;
}
const pgGrp=r=>r.kind==='music'?'M':(r.kind==='warm'||r.kind==='test'||r.kind==='pause')?null:PG_AX.includes(r.grp)?r.grp:null;
// по дням: сыграно секунд, время плана (T), секунды по осям
function pgDays(rows){
  const D={};
  rows.forEach(r=>{const i=+r.day_index;if(!Number.isFinite(i))return;const x=D[i]||(D[i]={sec:0,T:0,g:{}});const s=Math.max(0,+r.played_sec||0);
    x.sec+=s;if(+r.plan_min>x.T)x.T=+r.plan_min;const g=pgGrp(r);if(g)x.g[g]=(x.g[g]||0)+s;});
  return D;
}
const pgT=x=>x&&ALLOC[x.T]?x.T:st.T;
// минуты плана дня без пауз: с ними сравнивается сыгранное
const pgPlanMin=(i,x)=>pgPlan(i,pgT(x)).min;
const PG_PLAN={};
function pgPlan(i,T){
  const key=GENRE+'|'+INST+'|'+i+'|'+T;if(PG_PLAN[key])return PG_PLAN[key];
  const p={min:0};buildSession(i,T).segs.forEach(s=>{if(s.kind!=='pause')p.min+=s.min;const g=s.kind==='music'?'M':s.kind==='base'?'B':s.kind==='combo'?'C':(s.kind==='focus'||s.kind==='maint')?libGroupOf(s.id):null;if(g&&PG_AX.includes(g))p[g]=(p[g]||0)+s.min*60;});
  return PG_PLAN[key]=p;
}
// паутина цикла c: сыграно по оси / по плану в дни с занятиями (100% — как в плане)
function pgRadar(D,c){
  const pl={},pd={};let n=0;
  for(let i=c*28;i<c*28+28;i++){const x=D[i];if(!x||x.sec<PG_DAY)continue;n++;const p=pgPlan(i,pgT(x));PG_AX.forEach(g=>{pl[g]=(pl[g]||0)+(p[g]||0);pd[g]=(pd[g]||0)+(x.g[g]||0);});}
  return n?{n,v:PG_AX.map(g=>pl[g]?pd[g]/pl[g]:null)}:null;
}
// чистый темп по упражнениям текущего жанра и инструмента: точки по дням (в день — лучший), плюс последний из grif.bpmClean
function pgClean(rows){
  const by={},add=(id,i,b)=>{if(!EX[id]||!(b>0)||!Number.isFinite(i))return;const m=by[id]||(by[id]={});m[i]=Math.max(m[i]||0,b);};
  rows.forEach(r=>{if(r.clean_bpm&&r.ex_id&&r.genre===GENRE&&r.inst===INST)add(r.ex_id,+r.day_index,+r.clean_bpm);});
  const m=lsGet('bpmClean',{})||{};
  Object.keys(EX).forEach(id=>{const c=m[exKey(id)];if(c&&c.bpm&&typeof c.date==='string'&&!(by[id]&&Object.values(by[id]).includes(+c.bpm)))add(id,dayIdxOfIso(c.date),+c.bpm);});
  return Object.entries(by).map(([id,o])=>({id,pts:Object.keys(o).map(Number).sort((a,b)=>a-b).map(i=>({i,bpm:o[i]}))}))
    .sort((a,b)=>b.pts[b.pts.length-1].i-a.pts[a.pts.length-1].i||a.id.localeCompare(b.id));
}
// упражнения, где чистый темп за 7 дней выше всего, что было раньше
const pgGrown=cl=>cl.filter(x=>{const w=today-6,old=x.pts.filter(p=>p.i<w),nw=x.pts.filter(p=>p.i>=w&&p.i<=today);return old.length&&nw.length&&Math.max(...nw.map(p=>p.bpm))>Math.max(...old.map(p=>p.bpm));}).length;

/* ================= рисунки ================= */
const FONT='font-family="Inter,-apple-system,Segoe UI,sans-serif"';
const nDays=n=>n+' '+(LANG==='en'?(n===1?'day':'days'):(n%10===1&&n%100!==11?'день':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'дня':'дней'));
const hm=sec=>{const m=Math.round(sec/60),h=Math.floor(m/60);return h?h+L(' ч ',' h ')+(m%60?m%60+L(' мин',' min'):''):m+L(' мин',' min');};
// минуты по дням цикла: столбик — сыгранное, пунктир — выбранное время, снизу четыре фазы
function pgColsSvg(D,c){
  const W=320,H=150,X0=26,X1=W-4,T0=12,B=H-34,ref=pgPlan(today,st.T).min,d0=c*28;
  const vals=[...Array(28)].map((_,k)=>{const i=d0+k;return i>today?undefined:Math.round((D[i]?D[i].sec:0)/60);});
  const top=Math.max(ref*1.25,...vals.filter(v=>v!=null));
  const step=[15,30,60,90,120,180,240].find(s=>top/s<=3.2)||300,max=Math.ceil(top/step)*step;
  const x=k=>X0+(X1-X0)*k/28,y=v=>B-(B-T0)*v/max,bw=(X1-X0)/28-2.4;
  let s='';
  for(let v=0;v<=max;v+=step)s+='<line x1="'+X0+'" x2="'+X1+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="var(--sep)"/><text x="'+(X0-5)+'" y="'+(y(v)+3.5)+'" text-anchor="end" font-size="9.5" fill="var(--sec)" '+FONT+'>'+v+'</text>';
  vals.forEach((v,k)=>{const X=x(k)+1.2,i=d0+k,cur=i===today;
    if(v===undefined){s+='<rect x="'+X+'" y="'+(B-2)+'" width="'+bw+'" height="2" rx="1" fill="var(--fill)"/>';return;}
    if(v===0){s+='<circle cx="'+(X+bw/2)+'" cy="'+(B-2)+'" r="1.8" fill="var(--ter)"/>';return;}
    const ok=v*60>=PG_DAY;s+='<rect class="pg-col'+(ok?' ok':'')+'" data-day="'+i+'" x="'+X+'" y="'+y(v)+'" width="'+bw+'" height="'+(B-y(v))+'" rx="2" fill="'+(cur?'var(--timer)':ok?'var(--fg)':'var(--ter)')+'" fill-opacity="'+(cur||!ok?1:.78)+'"><title>'+esc(dateText(dateOfIndex(i))+' · '+v+L(' мин',' min'))+'</title></rect>';});
  s+='<line x1="'+X0+'" x2="'+X1+'" y1="'+y(ref)+'" y2="'+y(ref)+'" stroke="var(--nav)" stroke-width="1.4" stroke-dasharray="4 3"/><text x="'+X1+'" y="'+(y(ref)-4)+'" text-anchor="end" font-size="9.5" font-weight="600" fill="var(--nav)" '+FONT+'>'+esc(L('план ','plan ')+ref+L(' мин',' min'))+'</text>';
  const wk=dayInfo(today).week,curC=dayInfo(today).cycle===c;
  for(let w=0;w<4;w++){const a=x(w*7)+1,b=x(w*7+7)-1,on=curC&&w===wk;
    s+='<line x1="'+a+'" x2="'+b+'" y1="'+(B+8)+'" y2="'+(B+8)+'" stroke="'+(on?'var(--timer)':'var(--ter)')+'" stroke-width="3" stroke-linecap="round"/><text x="'+((a+b)/2)+'" y="'+(B+22)+'" text-anchor="middle" font-size="10" font-weight="'+(on?700:500)+'" fill="'+(on?'var(--fg)':'var(--sec)')+'" '+FONT+'>'+esc(PH(w).name)+'</text>';}
  return '<svg class="pg-cols" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(L('Минуты по дням цикла','Minutes per day of the cycle'))+'">'+s+'</svg>';
}
// паутина: внешний контур — 100% плана, пунктир — прошлый цикл, оранжевым — ниже 80%
// навыки: полоса — доля плана в дни занятий (шкала до 115%), белая риска — 100%, тонкая — прошлый цикл; ниже 80% — оранжевым
const PG_BC={B:'--k-base',R:'--k-music',A:'--k-combo',L:'--k-focus',C:'--rest',M:'--k-warm'};
function pgRadarSvg(now,prev){
  const M=1.15,w=v=>(Math.min(v||0,M)/M*100).toFixed(1)+'%';
  return '<div class="pg-bars">'+PG_AX.map((g,i)=>{const v=now.v[i],pv=prev&&prev.v[i],low=v!=null&&v<.8;
    return '<div class="pg-bar"><span class="nm">'+esc(pgAxName(g))+'</span><span class="tr"><i style="width:'+w(v)+';background:'+(low?'var(--timer)':'var('+PG_BC[g]+')')+'"></i>'+(pv!=null?'<em class="pv" style="left:'+w(pv)+'"></em>':'')+'<em class="full" style="left:'+w(1)+'"></em></span><b'+(low?' class="low"':'')+'>'+(v==null?'—':Math.round(v*100)+'%')+'</b></div>';}).join('')+'</div>';
}
// маленький график темпа
function pgSpark(pts){
  const W=76,H=26,a=pts.slice(-12);if(a.length<2)return '<svg class="spark" viewBox="0 0 '+W+' '+H+'"></svg>';
  const lo=Math.min(...a.map(p=>p.bpm)),hi=Math.max(...a.map(p=>p.bpm)),r=Math.max(hi-lo,4);
  const P=a.map((p,k)=>[(2+(W-4)*k/(a.length-1)).toFixed(1),(H-3-(H-6)*(p.bpm-lo)/r).toFixed(1)]);
  return '<svg class="spark" viewBox="0 0 '+W+' '+H+'"><polyline points="'+P.map(q=>q.join(',')).join(' ')+'" fill="none" stroke="var(--k-base)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+P[P.length-1][0]+'" cy="'+P[P.length-1][1]+'" r="2.6" fill="var(--k-base)"/></svg>';
}
const pgDelta=(a,b)=>{const d=a-b;return d?'<span class="dl '+(d>0?'up':'dn')+'">'+(d>0?'+':'−')+Math.abs(d)+'</span>':'';};

/* ================= экран ================= */
const PG_ST={
  none:['Нет занятий','No practice','За неделю занятий нет. День засчитывается от 10 минут — начните с короткой тренировки.','No practice this week. A day counts from 10 minutes, so start with a short workout.'],
  over:['Перегруз','Overreaching','Больше плана в полтора раза. Следите за зажимом и усталостью рук, отдых — часть тренировки.','Half as much again as the plan. Watch for tension and tired hands: rest is part of training.'],
  prod:['Продуктивно','Productive','Объём и регулярность по плану — так темп и растёт.','Volume and regularity on plan: this is how tempo grows.'],
  keep:['Поддержание','Maintaining','Форма держится. Чтобы расти, добавьте дней или минут.','You are holding your level. To grow, add days or minutes.'],
  rest:['Разгрузка','Recovery','Неделя разгрузки: меньше объёма — это по плану.','Deload week: less volume is the plan.'],
  low:['Недобор','Below plan','Для роста мало: лучше 15 минут каждый день, чем час раз в неделю.','Not enough to grow: 15 minutes daily beats an hour once a week.']
};
function pgStatusKey(days,pct){
  if(!days&&!pct)return 'none';
  if(days>=5&&pct>=1.5)return 'over';
  if(days>=5&&pct>=.8)return 'prod';
  if(days>=3&&pct>=.5)return 'keep';
  if(dayInfo(today).week===3&&days>=2)return 'rest';
  return 'low';
}
function pgStatusHtml(D,grown){
  const ids=[...Array(7)].map((_,k)=>today-6+k);
  const days=ids.filter(i=>D[i]&&D[i].sec>=PG_DAY).length,played=ids.reduce((a,i)=>a+(D[i]?D[i].sec:0),0),plan=ids.reduce((a,i)=>a+pgPlanMin(i,D[i])*60,0);
  const pct=plan?played/plan:0,k=pgStatusKey(days,pct),t=PG_ST[k];
  const wd=LANG==='en'?['M','T','W','T','F','S','S']:['П','В','С','Ч','П','С','В'];
  const cells=ids.map(i=>{const x=D[i],cl=x&&x.sec>=PG_DAY?'on':x&&x.sec>0?'part':'';return '<span class="'+cl+(i===today?' td':'')+'" title="'+esc(dateText(dateOfIndex(i))+(x?' · '+Math.round(x.sec/60)+L(' мин',' min'):''))+'"><i></i>'+wd[mod(dateOfIndex(i).getDay()-1,7)]+'</span>';}).join('');
  const line=grown?L('Чистый темп вырос в ','Clean tempo went up in ')+(LANG==='en'?nEx(grown):grown+' '+(grown%10===1&&grown%100!==11?'упражнении':'упражнениях'))+'.':'';
  const num=(v,u,lab)=>'<div><b>'+v+'<small>'+u+'</small></b><span>'+lab+'</span></div>';
  return '<div class="card pg-st g-L st-'+k+'" id="pgStatus" data-st="'+k+'"><div class="ct"><span class="mut">'+L('Статус за 7 дней','Status, last 7 days')+'</span></div><div class="lab2">'+esc(L(t[0],t[1]))+'</div>'+
    '<div class="pg-nums">'+num(days,L(' из 7',' of 7'),L('дней от 10 мин','days of 10+ min'))+num(Math.round(pct*100),'%',L('от плана','of plan'))+num(Math.round(played/60),L(' мин',' min'),L('сыграно','played'))+'</div>'+
    (line?'<p class="pg-line">'+esc(line)+'</p>':'')+'<div class="wk7">'+cells+'</div><p class="mut pg-tip">'+esc(L(t[2],t[3]))+'</p></div>';
}
function pgTestsHtml(){
  const hist=lsGet('tests',{})||{},next=(()=>{let i=today;while(mod(i,28)!==27)i++;return i;})();
  const rows=TESTS.map(tt=>{const a=(hist[tt.id]||[]).filter(x=>x&&x.bpm>0);if(!a.length)return '';const last=a[a.length-1],prev=a[a.length-2],best=Math.max(...a.map(x=>x.bpm));
    return '<div class="rec pg-test"><span class="t">'+esc(tt[LANG][0])+'<small>'+esc(L('лучший ','best ')+best+(a.length>1?' · '+a.length+L(' замера',' results'):''))+'</small></span>'+pgSpark(a.map((x,k)=>({i:k,bpm:x.bpm})))+'<b>'+last.bpm+'<small> bpm</small>'+(prev?pgDelta(last.bpm,prev.bpm):'')+'</b></div>';}).join('');
  return '<div class="card" id="pgTests"><div class="ct"><span>'+L('Тесты цикла','Cycle tests')+'</span><span class="mut">'+esc(next===today?L('сегодня','today'):dateText(dateOfIndex(next)))+'</span></div>'+
    (rows||'<p class="mut pg-empty">'+esc(L('Результатов пока нет. Тесты — в последнее воскресенье цикла, сразу после разминки.','No results yet. Tests come on the last Sunday of the cycle, right after the warm-up.'))+'</p>')+'</div>';
}
function renderProgress(){
  $('progTitle').textContent=L('Прогресс','Progress');
  const d=dayInfo(today);
  $('progOver').textContent=d.pre?L('Вводная неделя','Intro week'):L('Цикл ','Cycle ')+(d.cycle+1)+' · '+PH(d.week).name;
  const body=$('progBody'),u=prUser();
  if(!u){
    body.innerHTML='<div class="card empty" id="pgSignIn"><span class="ic k-focus big">'+IC('chart-column')+'</span><h3>'+L('Статистика — для вошедших','Stats are for signed-in users')+'</h3><p>'+L('Войдите в профиле: занятия будут записываться сами, а здесь появятся минуты по дням цикла, выполнение плана по навыкам и рост чистого темпа.','Sign in from your profile: sessions are logged automatically, and here you will see minutes per day of the cycle, plan completion by skill and clean-tempo growth.')+'</p><button class="btn nb" data-pgsign>'+IC('log-in')+L('В профиль','Profile')+'</button></div>'+pgTestsHtml();
    return;
  }
  if(VIEW==='progress')pgLoad(false);
  const rows=pgRows(),D=pgDays(rows),cl=pgClean(rows);
  const now=pgRadar(D,d.cycle),prev=pgRadar(D,d.cycle-1);
  const tot=Object.keys(D).filter(i=>+i>=d.cycle*28&&+i<=today).reduce((a,i)=>a+D[i].sec,0);
  const note=PG.busy&&!PG.at?L('Загружаем журнал…','Loading your log…'):PG.err?L('Нет связи с сервером — показаны записи с этого устройства.','No connection: showing records from this device.'):'';
  const list=PG.all?cl:cl.slice(0,6);
  body.innerHTML=(note?'<p class="mut pg-note" id="pgNote">'+esc(note)+'</p>':'')+
    '<div class="pg-grid">'+pgStatusHtml(D,pgGrown(cl))+
    '<div class="card" id="pgCols"><div class="ct"><span>'+L('Минуты по дням · цикл ','Minutes per day · cycle ')+(d.cycle+1)+'</span><span class="mut">'+esc(hm(tot))+'</span></div>'+pgColsSvg(D,d.cycle)+'</div>'+
    '<div class="card" id="pgRadar"><div class="ct"><span>'+L('Навыки · выполнение плана','Skills · plan completion')+'</span></div>'+
      (now?pgRadarSvg(now,prev)+'<div class="pg-leg mut"><span>'+L('риска — 100% плана в дни занятий','mark: 100% of plan on practice days')+'</span>'+(prev?'<span class="dash">'+L('прошлый цикл','last cycle')+'</span>':'')+'</div>'
        :'<p class="mut pg-empty">'+esc(L('Появится после первого дня от 10 минут в этом цикле.','Appears after your first day of 10+ minutes this cycle.'))+'</p>')+'</div>'+
    '<div class="card" id="pgClean"><div class="ct"><span>'+L('Чистый темп','Clean tempo')+'</span><span class="mut">'+esc(GNAME(GENRE)+' · '+INAME(INST).toLowerCase())+'</span></div>'+
      (cl.length?list.map(x=>{const p=x.pts,last=p[p.length-1];return '<div class="rec pg-ex" data-ex="'+esc(x.id)+'"><span class="t">'+esc(numTitle(x.id))+'<small>'+esc(dateText(dateOfIndex(last.i)))+'</small></span>'+pgSpark(p)+'<b>'+last.bpm+'<small> bpm</small>'+(p.length>1?pgDelta(last.bpm,p[0].bpm):'')+'</b></div>';}).join('')+
        (cl.length>6?'<button class="btn nb pg-all" data-pgall>'+(PG.all?L('Свернуть','Show less'):L('Все ','All ')+cl.length)+'</button>':'')
        :'<p class="mut pg-empty">'+esc(L('Запишите чистый темп кнопкой «Записать как чистый» на упражнении — здесь появится его рост.','Save a clean tempo with “Save as clean” on an exercise, and its growth will show here.'))+'</p>')+'</div>'+
    pgTestsHtml()+'</div>';
}
$('vProgress').addEventListener('click',e=>{
  if(e.target.closest('[data-pgsign]')){setView('profile');return;}
  if(e.target.closest('[data-pgall]')){PG.all=!PG.all;renderProgress();}
});
window.addEventListener('grif:user',()=>{pgReset();if(VIEW==='progress')renderProgress();});
window.addEventListener('grif:log',pgAbsorb);
