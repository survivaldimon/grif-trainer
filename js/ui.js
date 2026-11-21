// RiffGym — экраны и навигация (редизайн, этап 2): «Сегодня», «Занятие», «Упражнения», «Прогресс», «Профиль». Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= экраны ================= */
// Экран — один из блоков в .views; видимость через hidden. «Занятие» — полноэкранный режим без навигации.
const VIEWS={today:'vToday',session:'vSession',lib:'lib',progress:'vProgress',profile:'settings'};
let VIEW=LIB.on?'lib':'today',VIEW_BACK='today';
function setView(v){
  if(!VIEWS[v])v='today';
  const prev=VIEW;
  if(prev!==v&&['today','session','progress'].includes(prev))VIEW_BACK=prev;
  VIEW=v;
  // пример в табе играет только на своём экране
  if(prev!==v&&Pl.on&&Pl.box&&!$(VIEWS[v]).contains(Pl.box))plStop();
  Object.entries(VIEWS).forEach(([k,id])=>{$(id).hidden=k!==v;});
  document.body.dataset.view=v;
  if(LIB.on!==(v==='lib')){LIB.on=v==='lib';renderLib();}
  $('setBtn').setAttribute('aria-expanded',String(v==='profile'));
  if(v!=='session')setPlanOpen(false);
  renderNav();writeHash();
  if(prev!==v)window.scrollTo(0,0);
  if(v==='session')requestAnimationFrame(()=>document.querySelectorAll('#nowBody .tabsc').forEach(layTabs));
  if(v==='today')renderToday();
}
// вкладки «Упражнения» и «Профиль» повторным нажатием возвращают туда, откуда пришли
function navTo(v){if(v===VIEW&&(v==='lib'||v==='profile'))setView(VIEW_BACK);else setView(v);}
const NAV=[['today','calendar-check',()=>L('Сегодня','Today')],['lib','library',()=>L('Упражнения','Exercises')],['progress','chart-column',()=>L('Прогресс','Progress')],['profile','user-round',()=>L('Профиль','Profile')]];
const NAV_ID={today:'tabToday',lib:'libBtn',progress:'tabProgress',profile:'setBtn'};
function renderNav(){
  NAV.forEach(([v,ic,name])=>{const b=$(NAV_ID[v]);const on=VIEW===v;
    b.innerHTML='<span class="ti">'+IC(ic)+'</span><span class="tl">'+esc(name())+'</span>';
    if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('libBtn').setAttribute('aria-pressed',String(VIEW==='lib'));
}
$('tabbar').addEventListener('click',e=>{const b=e.target.closest('button[data-view]');if(b)navTo(b.dataset.view);});

/* ================= «Сегодня» ================= */
const KIND_IC={warm:'flame',base:'dumbbell',focus:'target',maint:'refresh-cw',combo:'layers',music:'guitar',pause:'coffee',test:'clipboard-check'};
const kindIc=(k,big)=>'<span class="ic k-'+k+(big?' big':'')+'">'+IC(KIND_IC[k]||'music')+'</span>';
// прогресс дня: пройденные сегменты целиком, текущий — по таймеру
function segDone(k){const s=st.plan.segs[k];if(st.done.has(k))return s.min*60;if(k===st.cur)return s.min*60-st.remain;return 0;}
function dayProgress(){const segs=st.plan.segs;let done=0;segs.forEach((s,k)=>{done+=segDone(k);});return done;}
// группы плана: один вид — одна строка, в порядке первого появления; паузы — отдельной строкой в конце
function dayGroups(){
  const g=[],by={};
  st.plan.segs.forEach((s,k)=>{const key=s.kind;let x=by[key];if(!x){x=by[key]={kind:key,min:0,segs:[]};g.push(x);}x.min+=s.min;x.segs.push(k);});
  return g.filter(x=>x.kind!=='pause').concat(g.filter(x=>x.kind==='pause'));
}
function groupTitle(x){const d=st.plan.d;return KIND(x.kind)+(x.kind==='focus'?': '+GN(d.focus).toLowerCase():'');}
function groupSub(x){
  const segs=x.segs.map(k=>st.plan.segs[k]);
  if(x.kind==='pause')return segs.length+L(' × по ',' × ')+segs[0].min+L(' мин',' min');
  if(x.kind==='music'||x.kind==='test')return segs.map(s=>segTitle(s,st.plan.d)).join(' · ');
  const n=segs.length;const cur=x.segs.indexOf(st.cur);
  if(cur>=0&&st.remain<segs[cur].min*60)return L('идёт · ','in progress · ')+(cur+1)+L(' из ',' of ')+n;
  return n+' '+(LANG==='en'?(n===1?'exercise':'exercises'):(n%10===1&&n%100!==11?'упражнение':[2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?'упражнения':'упражнений'));
}
function renderToday(){
  if(!st.plan)return;
  const d=st.plan.d,segs=st.plan.segs,T=st.plan.T;
  $('todayTitle').textContent=st.i===today?L('Сегодня','Today'):(LANG==='en'?['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']:['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'])[mod(d.date.getDay()-1,7)];
  // цикл: 4 фазы, отметка — где мы сейчас
  const cc=$('cycleCard');
  if(d.pre)cc.innerHTML='<div class="cyc-top"><b>'+L('Вводная неделя','Intro week')+'</b></div><p class="mut">'+L('Первый цикл стартует 2 ноября. Сними исходные замеры, чтобы видеть прогресс.','The first cycle starts on November 2. Take baseline measurements to see your progress.')+'</p>';
  else{
    const dic=mod(d.i,28),left=27-dic,frac=(d.dow+1)/7;
    let ph='';for(let w=0;w<4;w++){const cls=w<d.week?'done':w===d.week?'cur':'';ph+='<div><i class="'+cls+'"'+(w===d.week?' style="--f:'+(frac*100).toFixed(1)+'%"':'')+'></i><span'+(w===d.week?' class="on"':'')+'>'+esc(PH(w).name)+'</span></div>';}
    cc.innerHTML='<div class="cyc-top"><b>'+L('День ','Day ')+(dic+1)+L(' из 28',' of 28')+'</b><span class="mut">'+L('Цикл ','Cycle ')+(d.cycle+1)+'</span></div><div class="ph4">'+ph+'</div><p class="mut">'+esc(PH(d.week).steps[0])+' '+(d.isTest?L('Сегодня — тесты цикла.','Today: cycle tests.'):L('Тесты цикла через ','Cycle tests in ')+left+L(' дн.',' d'))+'</p>';
  }
  $('woOver').textContent=L('Тренировка дня','Workout of the day')+(d.pre?'':' · '+PH(d.week).name);
  $('woTitle').textContent=L('Фокус: ','Focus: ')+GN(d.focus).toLowerCase()+(d.isTest?L(' + тесты',' + tests'):'');
  // полоса дня: блоки по видам, ширина — минуты, заливка — пройденное
  const done=dayProgress();
  $('dayBar').innerHTML=dayGroups().filter(x=>x.kind!=='pause').map(x=>{const dn=x.segs.reduce((a,k)=>a+segDone(k),0);return '<i style="flex:'+x.min+'"><b class="k-'+x.kind+'" style="width:'+(100*dn/(x.min*60)).toFixed(1)+'%"></b></i>';}).join('');
  const started=done>0||st.running;
  $('dayMeta').innerHTML='<span><b>'+Math.floor(done/60)+'</b>'+L(' из ',' of ')+T+L(' мин',' min')+'</span><span>'+(started?esc(KIND(segs[st.cur].kind))+' · '+(st.cur+1)+L(' из ',' of ')+segs.length:esc(segs.length+L(' блоков',' blocks')))+'</span>';
  const leftMin=Math.ceil((T*60-done)/60);
  $('startBtn').innerHTML=IC(st.running?'chevron-right':'play')+'<span>'+(st.running?L('Вернуться к занятию','Back to the session'):started?L('Продолжить · ','Continue · ')+leftMin+L(' мин',' min'):L('Начать · ','Start · ')+timeLabel(T))+'</span>';
  // план: группы со значком вида
  $('planHd').textContent=L('План дня','Today’s plan');
  $('dayPlan').innerHTML=dayGroups().map(x=>{const all=x.segs.every(k=>st.done.has(k));
    return '<button class="it'+(all?' done':'')+'" data-grp="'+x.segs[0]+'">'+kindIc(x.kind)+'<span class="t">'+esc(groupTitle(x))+'<small>'+esc(groupSub(x))+'</small></span><span class="v">'+(all?'':x.min+L(' мин',' min'))+'</span>'+(all?'<span class="chk">'+IC('circle-check')+'</span>':'<span class="chev">'+IC('chevron-right')+'</span>')+'</button>';}).join('');
}
// «Начать»: экран занятия и сразу таймер
$('startBtn').onclick=()=>{setView('session');if(!st.running)togglePlay();};
$('dayPlan').addEventListener('click',e=>{const b=e.target.closest('button[data-grp]');if(!b)return;const k=+b.dataset.grp;if(k!==st.cur)goto(k);setView('session');});

/* ================= «Занятие» ================= */
function setPlanOpen(on){$('planDrawer').hidden=!on;$('planBtn').setAttribute('aria-expanded',String(on));document.body.classList.toggle('plan-open',on);}
$('planBtn').onclick=()=>setPlanOpen($('planDrawer').hidden);
$('planClose').onclick=()=>setPlanOpen(false);
$('exitBtn').onclick=()=>setView('today');

/* ================= «Прогресс» ================= */
function renderProgress(){
  $('progTitle').textContent=L('Прогресс','Progress');
  $('progBody').innerHTML='<span class="ic k-focus big">'+IC('chart-column')+'</span><h3>'+L('Статистика занятий','Practice stats')+'</h3><p>'+L('Минуты по дням цикла, выполнение плана по навыкам и рост чистого темпа появятся здесь для вошедших в аккаунт.','Minutes per day of the cycle, plan completion by skill and clean-tempo growth will appear here once you sign in.')+'</p>';
}

/* ================= подписи экранов ================= */
function renderViews(){
  renderNav();renderProgress();
  $('profTitle').textContent=L('Профиль','Profile');
  $('shInst').textContent=L('Мой инструмент','My instrument');
  $('shApp').textContent=L('Приложение','App');
  const lab=(id,ic,ru,en)=>{const b=$(id);b.innerHTML=IC(ic);b.setAttribute('aria-label',L(ru,en));b.title=L(ru,en);};
  lab('prevDay','chevron-left','Предыдущий день','Previous day');lab('nextDay','chevron-right','Следующий день','Next day');
  lab('exitBtn','x','Выйти из занятия','Leave the session');lab('planClose','x','Закрыть план','Close the plan');
  lab('prevSeg','skip-back','Назад','Back');lab('nextSeg','skip-forward','Дальше','Next');
  $('planBtn').innerHTML=IC('list')+'<span>'+L('План','Plan')+'</span>';
}

/* ================= масштаб таба в окне таба ================= */
document.addEventListener('click',e=>{const b=e.target.closest('button[data-tz]');if(!b)return;const k=TABZ.indexOf(TABZOOM)+(+b.dataset.tz);if(k>=0&&k<TABZ.length)setTabz(TABZ[k]);});

document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
  if(!$('planDrawer').hidden){setPlanOpen(false);$('planBtn').focus();return;}
  if(VIEW==='profile'){setView(VIEW_BACK);$('setBtn').focus();}});
