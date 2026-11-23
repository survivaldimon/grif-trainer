// RiffGym — экраны и навигация (редизайн, этап 2): «Сегодня», «Занятие», «Упражнения», «Прогресс», «Профиль». Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= экраны ================= */
// Экран — один из блоков в .views; видимость через hidden. «Занятие» — полноэкранный режим без навигации.
const VIEWS={today:'vToday',session:'vSession',lib:'lib',progress:'vProgress',profile:'settings',summary:'vSummary'};
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
  if(v==='summary')renderSummary();
  if(v==='progress')renderProgress();
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
// значок вида: обложка (img/art) и знак с музыкальной темой; у фокуса — знак и обложка группы дня
const KIND_IC={warm:'audio-waveform',base:'guitar',focus:'target',maint:'repeat',combo:'layers',music:'music',pause:'coffee',test:'clipboard-check'};
const GROUP_IC={R:'drum',A:'trending-up',L:'hand',C:'layers'};
const kindIc=(k,big,g)=>'<span class="ic k-'+k+(g?' g-'+g:'')+(big?' big':'')+'">'+IC(g&&GROUP_IC[g]||KIND_IC[k]||'music')+'</span>';
// «Войдите, чтобы сохранять занятия»: только если вход доступен (строка аккаунта в профиле видна) и пользователь не вошёл
function renderSignBanner(){
  const b=$('signBanner'),row=$('accRow'),u=window.__grifStore&&window.__grifStore.user;
  b.hidden=!(row&&!row.hidden)||!!u;if(b.hidden)return;
  b.innerHTML='<span class="st"><small>'+IC('music')+esc(L('Ваш прогресс','Your progress'))+'</small><b>'+esc(L('Войдите, чтобы сохранять занятия','Sign in to save your progress'))+'</b><span>'+esc(L('Минуты, навыки и чистый темп — на всех устройствах','Minutes, skills and clean tempo on all your devices'))+'</span></span><span class="go">'+IC('log-in')+esc(L('Войти','Sign in'))+'</span>';
}
$('signBanner').addEventListener('click',e=>{e.preventDefault();setView('profile');const i=document.getElementById('accIn');if(i)i.click();});
['grif:user','grif:acc'].forEach(ev=>window.addEventListener(ev,()=>{if(VIEW==='today')renderSignBanner();}));
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
  renderSignBanner();
  // обложка дня — группа фокуса; метки: фаза, день цикла, цикл, тесты
  $('woCard').className='hero wo g-'+(d.pre?'H':d.focus);
  const bd=t=>'<span>'+esc(t)+'</span>';
  if(d.pre)$('cycleCard').innerHTML=bd(L('Вводная неделя','Intro week'))+bd(L('Цикл стартует 2 ноября','The cycle starts on November 2'));
  else{const dic=mod(d.i,28),left=27-dic;
    $('cycleCard').innerHTML=bd(PH(d.week).name)+bd(L('День ','Day ')+(dic+1)+L(' из 28 · Цикл ',' of 28 · Cycle ')+(d.cycle+1))+bd(d.isTest?L('Сегодня тесты','Tests today'):L('Тесты через ','Tests in ')+left+L(' дн.',' d'));}
  $('woOver').textContent=L('Тренировка дня','Workout of the day');
  // карточка цикла (на компьютере, справа): 4 фазы, отметка дня, что делать на этой неделе
  if(d.pre)$('cycleSide').innerHTML='<div class="cyc-top"><b>'+L('Вводная неделя','Intro week')+'</b></div><p class="mut">'+L('Первый цикл стартует 2 ноября. Сними исходные замеры, чтобы видеть прогресс.','The first cycle starts on November 2. Take baseline measurements to see your progress.')+'</p>';
  else{const frac=(d.dow+1)/7,nt=d.i+27-mod(d.i,28);
    let ph='';for(let w=0;w<4;w++){const cls=w<d.week?'done':w===d.week?'cur':'';ph+='<div><i class="'+cls+'"'+(w===d.week?' style="--f:'+(frac*100).toFixed(1)+'%"':'')+'></i><span'+(w===d.week?' class="on"':'')+'>'+esc(PH(w).name)+'</span></div>';}
    $('cycleSide').innerHTML='<div class="cyc-top"><b>'+L('Цикл ','Cycle ')+(d.cycle+1)+'</b><span class="mut">'+esc(d.isTest?L('тесты сегодня','tests today'):L('тесты: ','tests: ')+dateText(dateOfIndex(nt)))+'</span></div><div class="ph4">'+ph+'</div><p class="mut">'+esc(PH(d.week).steps[0])+'</p>';}
  $('woTitle').textContent=L('Фокус: ','Focus: ')+GN(d.focus).toLowerCase()+(d.isTest?L(' + тесты',' + tests'):'');
  // полоса дня: блоки по видам, ширина — минуты, заливка — пройденное
  const done=dayProgress(),started0=done>0;
  // на компьютере полоса — дорожка из обложек с подписями (ширина — минуты), на телефоне — тонкая полоса
  $('dayBar').innerHTML=dayGroups().filter(x=>x.kind!=='pause').map(x=>{const dn=x.segs.reduce((a,k)=>a+segDone(k),0),cur=x.segs.includes(st.cur)&&(started0||st.running);
    return '<i class="ic k-'+x.kind+(x.kind==='focus'?' g-'+d.focus:'')+(cur?' cur':'')+'" style="flex:'+x.min+'" title="'+esc(groupTitle(x))+'"><b class="k-'+x.kind+'" style="width:'+(100*dn/(x.min*60)).toFixed(1)+'%"></b><span>'+esc((x.min>=8?groupTitle(x)+' · ':'')+x.min+'′')+'</span></i>';}).join('');
  const started=done>0||st.running;
  $('dayMeta').innerHTML='<span><b>'+Math.floor(done/60)+'</b>'+L(' из ',' of ')+T+L(' мин',' min')+'</span><span>'+(started?esc(KIND(segs[st.cur].kind))+' · '+(st.cur+1)+L(' из ',' of ')+segs.length:esc(segs.length+L(' блоков',' blocks')))+'</span>';
  const leftMin=Math.ceil((T*60-done)/60);
  $('startBtn').innerHTML=IC(st.running?'chevron-right':'play')+'<span>'+(st.running?L('Вернуться к занятию','Back to the session'):started?L('Продолжить · ','Continue · ')+leftMin+L(' мин',' min'):L('Начать · ','Start · ')+timeLabel(T))+'</span>';
  // план: группы со значком вида
  $('planHd').textContent=L('План дня','Today’s plan');
  $('dayPlan').innerHTML=dayGroups().map(x=>{const all=x.segs.every(k=>st.done.has(k));
    return '<button class="it'+(all?' done':'')+'" data-grp="'+x.segs[0]+'">'+kindIc(x.kind,0,x.kind==='focus'?d.focus:'')+'<span class="t">'+esc(groupTitle(x))+'<small>'+esc(groupSub(x))+'</small></span><span class="v">'+(all?'':x.min+L(' мин',' min'))+'</span>'+(all?'<span class="chk">'+IC('circle-check')+'</span>':'<span class="chev">'+IC('chevron-right')+'</span>')+'</button>';}).join('');
}
// «Начать»: экран занятия и сразу таймер
$('startBtn').onclick=()=>{setView('session');if(!st.running)togglePlay();};
$('dayPlan').addEventListener('click',e=>{const b=e.target.closest('button[data-grp]');if(!b)return;const k=+b.dataset.grp;if(k!==st.cur)goto(k);setView('session');});

/* ================= «Занятие» ================= */
function setPlanOpen(on){$('planDrawer').hidden=!on;$('planBtn').setAttribute('aria-expanded',String(on));document.body.classList.toggle('plan-open',on);}
$('planBtn').onclick=()=>setPlanOpen($('planDrawer').hidden);
$('planClose').onclick=()=>setPlanOpen(false);
$('exitBtn').onclick=()=>setView('today');

/* ================= подписи экранов ================= */
function renderViews(){
  renderNav();renderProgress();
  $('profTitle').textContent=L('Профиль','Profile');
  $('mToggle').dataset.l=L('Метроном','Metronome');
  $('shInst').textContent=L('Мой инструмент','My instrument');
  $('shApp').textContent=L('Приложение','App');
  const lab=(id,ic,ru,en)=>{const b=$(id);b.innerHTML=IC(ic);b.setAttribute('aria-label',L(ru,en));b.title=L(ru,en);};
  lab('prevDay','chevron-left','Предыдущий день','Previous day');lab('nextDay','chevron-right','Следующий день','Next day');
  lab('exitBtn','x','Выйти из занятия','Leave the session');lab('planClose','x','Закрыть план','Close the plan');
  lab('prevSeg','skip-back','Назад','Back');lab('nextSeg','skip-forward','Дальше','Next');
  $('planBtn').innerHTML=IC('list')+'<span>'+L('План','Plan')+'</span>';
  $('finishBtn').innerHTML=IC('circle-check')+'<span>'+L('Завершить занятие','Finish the session')+'</span>';
}

/* ================= масштаб таба в окне таба ================= */
document.addEventListener('click',e=>{const b=e.target.closest('button[data-tz]');if(!b)return;const k=TABZ.indexOf(TABZOOM)+(+b.dataset.tz);if(k>=0&&k<TABZ.length)setTabz(TABZ[k]);});

/* ================= онбординг ================= */
// Первый вход: ни жанр, ни инструмент, ни время ещё не сохранены и в адресе нет жанра, инструмента или library.
// Выбор только записывает настройки; план дня от него не зависит.
const ONB_SKIP=['metal','blues','jazz','funk','fingerstyle','guitar','bass','acoustic','library'];
const onbNeeded=()=>lsGet('genre',null)==null&&lsGet('inst',null)==null&&lsGet('time',null)==null&&!hashWords().some(w=>ONB_SKIP.includes(w));
const ONB={on:false,step:0,inst:'guitar',genre:'metal',T:60};
const ONB_INST=[['guitar','guitar',()=>L('Электрогитара','Electric guitar'),()=>L('6, 7 или 8 струн','6, 7 or 8 strings'),'#ff9500'],
  ['acoustic','music',()=>L('Акустика','Acoustic guitar'),()=>L('Блюз, джаз, фингерстайл','Blues, jazz, fingerstyle'),'#34c759'],
  ['bass','audio-waveform',()=>L('Бас-гитара','Bass guitar'),()=>L('4, 5 или 6 струн','4, 5 or 6 strings'),'#007aff']];
const ONB_GENRE={metal:['zap','#ff3b30','Скорость, точность, чистая игра на перегрузе','Speed, precision, clean playing under gain'],
  blues:['guitar','#007aff','Бенды, вибрато, фразировка, шаффл','Bends, vibrato, phrasing, shuffle'],
  jazz:['piano','#ff9500','Аккорды, арпеджио, свинг','Chords, arpeggios, swing'],
  funk:['audio-waveform','#af52de','Ритм, глушение, шестнадцатые, слэп на басу','Rhythm, muting, sixteenths, slap on bass'],
  fingerstyle:['hand','#34c759','Независимость пальцев: бас и мелодия вместе','Finger independence: bass and melody together']};
function openOnb(){ONB.on=true;ONB.step=0;ONB.inst=INST;ONB.genre=GENRE;ONB.T=st.T;$('onb').hidden=false;document.body.classList.add('onb-open');renderOnb();}
function closeOnb(){ONB.on=false;$('onb').hidden=true;document.body.classList.remove('onb-open');}
function onbOpt(kind,val,ic,col,title,sub,on){return '<button class="opt'+(on?' on':'')+'" data-onb="'+kind+'" data-v="'+val+'" aria-pressed="'+on+'"><span class="ic big" style="--c:'+col+'">'+IC(ic)+'</span><span class="ot"><b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</span><span class="radio"></span></button>';}
function renderOnb(){
  if(!ONB.on)return;
  const s=ONB.step;let h,lead,body;
  if(s===0){h=L('На чём вы играете?','What do you play?');lead=L('Инструмент можно поменять в любой момент в профиле.','You can change the instrument any time in your profile.');
    body=ONB_INST.map(([k,ic,t,sub,col])=>onbOpt('inst',k,ic,col,t(),sub(),k===ONB.inst)).join('');}
  else if(s===1){h=L('Что будем играть?','What will you play?');lead=L('План дня общий для всех, кто выбрал этот жанр. Поменять можно в профиле.','The daily plan is the same for everyone in this genre. Change it in your profile.');
    if(!GENRES[ONB.genre].includes(ONB.inst))ONB.genre=GENRE_IDS.find(g=>GENRES[g].includes(ONB.inst));
    body=GENRE_IDS.filter(g=>GENRES[g].includes(ONB.inst)).map(g=>{const x=ONB_GENRE[g];return onbOpt('genre',g,x[0],x[1],GNAME(g),L(x[2],x[3])+' · '+GENRES[g].map(INAME).join(', ').toLowerCase(),g===ONB.genre);}).join('');}
  else{h=L('Сколько времени на занятие?','How long do you practice?');lead=L('Время можно менять каждый день на экране «Сегодня». Тренер делит его на разминку, базу, фокус и остальное.','You can change it every day on the Today screen. The coach splits it into warm-up, base, focus and the rest.');
    body='<div class="onb-times">'+TIMES.map(T=>'<button class="nb" data-onb="time" data-v="'+T+'" aria-pressed="'+(T===ONB.T)+'">'+esc(timeLabel(T))+'</button>').join('')+'</div>';}
  $('onb').innerHTML='<div class="onb-in"><div class="onb-top"><div class="lang" role="group" aria-label="Language"><button data-onblang="ru" aria-pressed="'+(LANG==='ru')+'">RU</button><button data-onblang="en" aria-pressed="'+(LANG==='en')+'">EN</button></div>'+
    '<div class="onb-dots">'+[0,1,2].map(k=>'<i class="'+(k<=s?'on':'')+'"></i>').join('')+'</div><button class="onb-skip" id="onbSkip">'+L('Пропустить','Skip')+'</button></div>'+
    '<h2 id="onbH">'+esc(h)+'</h2><p class="onb-lead">'+esc(lead)+'</p><div class="onb-list">'+body+'</div>'+
    '<div class="onb-foot">'+(s?'<button class="btn nb" id="onbBack">'+L('Назад','Back')+'</button>':'')+'<button class="btn-pri" id="onbNext">'+(s<2?L('Дальше','Next'):L('Начать','Start'))+'</button></div></div>';
}
function finishOnb(skip){
  if(!skip){
    if(ONB.inst!==INST)setInst(ONB.inst);
    if(ONB.genre!==GENRE)setGenre(ONB.genre);
    st.T=ONB.T;
  }
  lsSet('inst',INST);lsSet('genre',GENRE);lsSet('time',st.T);lsSet('lang',LANG);
  closeOnb();rebuild();setView('today');
}
$('onb').addEventListener('click',e=>{
  const o=e.target.closest('[data-onb]');
  if(o){const v=o.dataset.v;if(o.dataset.onb==='inst')ONB.inst=v;else if(o.dataset.onb==='genre')ONB.genre=v;else ONB.T=+v;renderOnb();return;}
  const lb=e.target.closest('[data-onblang]');if(lb){setLang(lb.dataset.onblang);renderOnb();return;}
  if(e.target.closest('#onbSkip')){finishOnb(true);return;}
  if(e.target.closest('#onbBack')){ONB.step=Math.max(0,ONB.step-1);renderOnb();return;}
  if(e.target.closest('#onbNext')){if(ONB.step<2){ONB.step++;renderOnb();}else finishOnb(false);}
});

document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
  if(!$('planDrawer').hidden){setPlanOpen(false);$('planBtn').focus();return;}
  if(VIEW==='profile'){setView(VIEW_BACK);$('setBtn').focus();}});
