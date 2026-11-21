// RiffGym — события, запуск, window.__grif. Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= события ================= */
function rebuild(){
  st.plan=buildSession(st.i,st.T);
  st.done=new Set();st.running=false;st.cur=0;st.remain=st.plan.segs[0].min*60;
  metroStop();
  renderHeader();renderPlan();applyMetroDefaults();renderNow();renderLib();
}
function setLang(l){
  LANG=l;lsSet('lang',l);
  writeHash();
  renderStatic();renderHeader();renderPlan();renderNow();markPlan();renderLib();
}
function writeHash(){const h=(GENRE!=='metal'&&GENRE!==genreFor('',INST)?GENRE+'-':'')+(INST!=='guitar'?INST+'-':'')+(LIB.on?'library-':'')+LANG;try{history.replaceState(null,'','#'+h);}catch(e){try{location.hash=h;}catch(e2){}}}
// смена инструмента: другой набор упражнений, план дня строится заново
function setInst(i){
  if(!['bass','acoustic'].includes(i))i='guitar';if(i===INST)return;
  INST=i;lsSet('inst',i);const g=genreFor(GENRE,i);if(g!==GENRE){GENRE=g;lsSet('genre',g);}
  applyInst();writeHash();plStop();
  renderStatic();rebuild();
}
// смена жанра: другая библиотека, план дня строится заново; акустика есть только в блюзе
function setGenre(g){
  if(!GENRES[g])g='metal';if(g===GENRE)return;
  GENRE=g;lsSet('genre',g);if(!GENRES[g].includes(INST)){INST=GENRES[g][0];lsSet('inst',INST);}
  applyInst();writeHash();plStop();
  renderStatic();rebuild();
}
// профиль для тестов: 'guitar', 'bass', 'blues-guitar', 'acoustic', 'blues-bass'
// и новые: 'jazz-guitar', 'jazz-acoustic', 'jazz-bass', 'funk-guitar', 'funk-bass', 'fingerstyle' (акустика)
function setProf(p){const w=p.split('-'),g=GENRES[w[0]]?w[0]:p==='acoustic'?'blues':'metal',i=w.find(x=>['guitar','bass','acoustic'].includes(x))||GENRES[g][0];
  if(GENRES[GENRE].includes(i))setGenre(g);setInst(i);setGenre(g);}
// число струн и техника меняют только таб и указания текущего упражнения, не план и не таймер
function setStrings(n){
  if(!GB([6,7,8],[4,5,6]).includes(n)||n===NSTR())return;
  if(INST==='bass'){STRINGS=n;lsSet('strings',n);}else{GSTR=n;lsSet('gstrings',n);}
  plStop();renderStatic();renderNow();renderLib();
}
function setTuning(o,d){
  o=Math.max(-11,Math.min(0,Math.round(+o)||0));d=!!d;const t=TUNE[INST];if(t.o===o&&t.d===d)return;
  TUNE[INST]={o,d};lsSet('tuning',TUNE);plStop();renderStatic();renderHeader();renderPlan();renderNow();markPlan();renderLib();renderLib();
}
// строй текущего упражнения: открытый строй варианта или строй пользователя
function curTu(){const s=st.plan&&st.plan.segs[st.cur];const r=s&&s.id&&EX[s.id]?resolveEx(s,st.plan.d):null;return r&&r.tu||TU();}
// «Настроиться»: открытые струны текущего строя снизу вверх
function tuneUp(){
  plStop();const c=audio();if(!c)return;
  Pl.tu=curTu();const T=TUN(Pl.tu),t0=c.currentTime+0.1;
  T.strs.slice().reverse().forEach((s,k)=>plNote(c,{s,f:-dsh(T,s),tech:'',b:null,r:null,ph:false,vib:false},t0+k*1.1,1.5,false,0.8));
}
function setHand(h){h=h==='pick'?'pick':'fingers';if(h===HAND)return;HAND=h;Pl.hand=h;lsSet('hand',h);plStop();renderStatic();renderNow();renderLib();}
let toastT=null;
function toast(msg){let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';el.setAttribute('role','status');document.body.appendChild(el);}el.textContent=msg;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{el.hidden=true;},2200);}

document.querySelectorAll('.lang button[data-lang]').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
window.addEventListener('hashchange',()=>{const h=hashWords();const i=h.includes('bass')?'bass':'guitar';if(i!==INST)setInst(i);const l=h.includes('en')?'en':h.includes('ru')?'ru':LANG;if(l!==LANG)setLang(l);setLib(h.includes('library'));});
document.querySelectorAll('#themeSw button').forEach(b=>b.onclick=()=>setTheme(b.dataset.themeSet));
document.querySelectorAll('#tabzSw button').forEach(b=>b.onclick=()=>setTabz(b.dataset.tabz));
applyTabz();
document.querySelectorAll('#instSw button').forEach(b=>b.onclick=()=>setInst(b.dataset.inst));
$('genreSel').onchange=e=>setGenre(e.target.value);
$('strChips').addEventListener('click',e=>{const b=e.target.closest('button[data-str]');if(b)setStrings(+b.dataset.str);});
$('tuneKey').onchange=e=>setTuning(+e.target.value,TUNE[INST].d);
$('dropChips').addEventListener('click',e=>{const b=e.target.closest('button[data-drop]');if(b)setTuning(TUNE[INST].o,b.dataset.drop==='true');});
$('tuneBtn').onclick=tuneUp;
$('handChips').addEventListener('click',e=>{const b=e.target.closest('button[data-hand]');if(b)setHand(b.dataset.hand);});
$('timeChips').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;st.T=+b.dataset.t;lsSet('time',st.T);rebuild();});
function setDay(i){if(i===st.i)return;st.i=i;rebuild();}
$('prevDay').onclick=()=>{if(dayOk(st.i-1))setDay(st.i-1);};
$('nextDay').onclick=()=>{if(dayOk(st.i+1))setDay(st.i+1);};
function setSettings(on){if(on!==(VIEW==='profile'))setView(on?'profile':VIEW_BACK);}
$('todayBtn').onclick=()=>{st.i=today;rebuild();};
$('planList').addEventListener('click',e=>{const li=e.target.closest('li[data-k]');if(!li)return;goto(+li.dataset.k);if(VIEW!=='session')setView('session');if(window.innerWidth<1100)setPlanOpen(false);});
function togglePlay(){audio();if(st.running){st.running=false;}else{st.running=true;st.last=performance.now();wantWake();}coachRun();renderClock();}
$('playBtn').onclick=togglePlay;
$('nextSeg').onclick=()=>{st.done.add(st.cur);goto(st.cur+1);};
$('prevSeg').onclick=()=>goto(st.cur-1);
$('nowBody').addEventListener('click',e=>{
  const sv=e.target.closest('button[data-save]');
  if(sv){const id=sv.dataset.save;const inp=$('ti-'+id);const v=Math.round(+inp.value);if(!v||v<20||v>400){toast(L('Введи темп в bpm, например 140','Enter a tempo in bpm, e.g. 140'));return;}
    const h=lsGet('tests',{});(h[id]=h[id]||[]).push({bpm:v,date:dateOfIndex(st.i).toISOString().slice(0,10)});lsSet('tests',h);toast(L('Записано: ','Saved: ')+v+' bpm');renderNow();return;}
  const sb=e.target.closest('button[data-sub]');if(sb){setSub(sb.dataset.sub);setMeter('4/4');toast(L('Метроном настроен','Metronome set'));return;}
  if(e.target.closest('button[data-clean]')){const k=curExKey();if(k){const m=lsGet('bpmClean',{});m[k]={bpm:Mt.bpm,date:dateOfIndex(st.i).toISOString().slice(0,10)};lsSet('bpmClean',m);renderTempoMem();toast(L('Чистый темп: ','Clean tempo: ')+Mt.bpm+' bpm');}return;}
  const lb=e.target.closest('button[data-lvl]');if(lb)changeLvl(+lb.dataset.lvl);
  const vb=e.target.closest('button[data-var]');if(vb)changeVar(+vb.dataset.var);
});
// Уровень меняется на ходу: таймер и позиция тренера не трогаются, деление и размер метронома — по новому материалу.
function changeLvl(k){
  const s=st.plan.segs[st.cur];if(!s.id||!lvlCount(s.id)||k===getLvl(s.id))return;
  setLvl(s.id,k);
  materialChanged(s);
}
// Вариант меняется вручную так же: план дня не меняется, выбор не запоминается.
function changeVar(k){
  const s=st.plan.segs[st.cur];if(!s.id||EX[s.id].gen||!EX[s.id].v||k===varIdx(s,st.plan.d))return;
  s.pick=k===dayVar(s,st.plan.d)?null:k;
  materialChanged(s);
}
function materialChanged(s){
  if(Pl.on)plStop();
  renderNow();
  let x=null;
  if(coActive()){
    // ждём «Готов» — пример заново по новому материалу; отсчёт — заново в новом размере
    if(co.hold){if(co.hold.ph==='count'){coCancel();coHoldCount();}else coListen();renderCoach();return;}
    if(co.arm)coCancel(); // отсчёт в отдыхе перепланируется на следующем тике
    x=co.iv[coPos().k];if(x.type!=='set')return;
  }
  else x=resolveEx(s,st.plan.d);
  setSub(x.sub);
  if(x.meter!==Mt.meter){setMeter(x.meter);if(Mt.on){metroStop();metroStart();}}
}
document.querySelectorAll('.mbpm button[data-d]').forEach(b=>b.onclick=()=>setBpm(Mt.bpm+(+b.dataset.d)));
$('bpm').addEventListener('change',e=>setBpm(+e.target.value));
$('bpmRange').addEventListener('input',e=>setBpm(+e.target.value));
$('mMeter').innerHTML=Object.keys(METERS).map(m=>'<option value="'+m+'">'+m+(METERS[m].length>1?' ('+METERS[m].join('+')+')':'')+'</option>').join('');
$('mMeter').onchange=e=>setMeter(e.target.value);
$('mSub').onchange=e=>setSub(e.target.value);
$('mBurst').onchange=e=>{Mt.burst=+e.target.value;Mt.bc=0;};
$('mLadder').onchange=e=>{Mt.ladder=e.target.checked;Mt.bar=0;};
$('mToggle').onclick=()=>{Mt.on?metroStop():metroStart();};
let taps=[];
$('mTap').onclick=()=>{const tm=performance.now();taps=taps.filter(x=>tm-x<2500);taps.push(tm);if(taps.length>=2){const iv=[];for(let k=1;k<taps.length;k++)iv.push(taps[k]-taps[k-1]);const avg=iv.slice(-4).reduce((a,b)=>a+b,0)/Math.min(4,iv.length);setBpm(60000/avg);}};

$('shareBtn').onclick=()=>{
  const {segs,d,T}=st.plan;const r=riffText(st.plan.riff);
  const lines=[L('RiffGym · тренировка дня · ','RiffGym · daily workout · ')+GB('',L('бас · ','bass · '))+dateText(d.date),L('Неделя ','Week ')+(d.week+1)+' ('+PH(d.week).name+') · '+L('фокус: ','focus: ')+GN(d.focus)+(d.isTest?L(' + тесты',' + tests'):'')+' · '+L('лад: ','scale: ')+matName(d.material),L('Время: ','Time: ')+timeLabel(T),''];
  segs.forEach(s=>lines.push(fmtStart(s.start)+'  '+KIND(s.kind)+': '+segTitle(s,d)+' ('+s.min+L(' мин',' min')+')'));
  lines.push('',L('Рифф дня: ','Riff of the day: ')+r.meter+', '+r.material+', '+r.tech.toLowerCase()+', '+L('условие: ','rule: ')+r.rule+'.');
  const text=noteTxt(lines.join('\n'));
  const box=$('shareBox');
  const fallback=()=>{box.hidden=false;box.innerHTML='<textarea class="share" id="shareText" readonly></textarea>';$('shareText').value=text;$('shareText').select();toast(L('Выдели и скопируй текст','Select and copy the text'));};
  try{navigator.clipboard.writeText(text).then(()=>{box.hidden=true;toast(L('Тренировка скопирована','Workout copied'));},fallback);}catch(e){fallback();}
};

applyInst();
renderStatic();
setBpm(Mt.bpm);
rebuild();
setView(VIEW);
if(onbNeeded())openOnb();
window.__grif={openOnb,onbNeeded,ONB,setView,setPlanOpen,togglePlay,exKey,curTu,OPEN_TUNINGS,GENRES,riffMeters,subFrac,setSub,setGenre,setProf,LIBS,setTabz,NOTES,setDay,rhythmTab,setTheme,Mt,noteTxt,dropKey,TUN,TU,setTuning,tuneUp,tuneName,buildSession,coachPlan,dayInfo,resolveEx,ALLOC,TIMES,renderTab,parseTab,setLang,X,VX,getLvl,st,co,TUNINGS,tabHtml,Pl,setInst,setLib,LIB,setStrings,setHand,genEx,EX_GUITAR,EX_BASS,EXEN_GUITAR,EXEN_BASS,GROUPS_GUITAR,GROUPS_BASS,TESTS_GUITAR,TESTS_BASS};
// активные наборы данных меняются вместе с инструментом
['EX','EXEN','GROUPS','TESTS','COACH','INST','STRINGS','HAND','GSTR','TUNE','GENRE'].forEach(k=>Object.defineProperty(window.__grif,k,{get:()=>({EX,EXEN,GROUPS,TESTS,COACH,INST,STRINGS,HAND,GSTR,TUNE,GENRE})[k]}));
