// RiffGym — учёт занятий и итог (редизайн, этап 5). Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= учёт занятий ================= */
// Пишем только для вошедших: блок «Аккаунт» ставит window.__grifStore.user = id пользователя.
// Секунды считаются по часам, пока идёт таймер (не во время «Готов» и отсчёта): пропуск подхода кнопкой не засчитывается.
// Сегмент дольше 15 с — одна запись в очереди grif.logq; отправляет её блок «Аккаунт» (событие grif:log).
const PR_MIN=15;
const PR={sec:{},from:{}};
const prUser=()=>(window.__grifStore&&window.__grifStore.user)||null;
const prDay=d=>{const x=d.date;return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
const prId=()=>{try{if(crypto.randomUUID)return crypto.randomUUID();}catch(e){}return Date.now().toString(36)+Math.random().toString(36).slice(2,10);};
function prQueue(){const q=lsGet('logq',null);return q&&Array.isArray(q.log)&&Array.isArray(q.ses)?q:{log:[],ses:[]};}
function prSave(q){lsSet('logq',q,1);try{window.dispatchEvent(new Event('grif:log'));}catch(e){}}
// вызывает цикл таймера: dt — секунды с прошлого тика, только пока таймер идёт
function prTick(dt){if(!st.running||!(dt>0))return;const k=st.cur;PR.sec[k]=(PR.sec[k]||0)+Math.min(dt,2);}
const prPlayed=()=>Object.values(PR.sec).reduce((a,x)=>a+x,0);
// уходим с сегмента: записываем сыгранное и обнуляем
function prFlush(k){
  const sec=PR.sec[k]||0;delete PR.sec[k];
  const s=st.plan&&st.plan.segs[k],u=prUser();
  if(!s||s.kind==='pause'||sec<PR_MIN||!u)return;
  PR.from[k]=(PR.from[k]||0)+sec;
  const d=st.plan.d,ex=s.id&&EX[s.id]?s.id:null;
  const q=prQueue();
  q.log.push({_u:u,client_id:prId(),day:prDay(d),day_index:d.i,genre:GENRE,inst:INST,kind:s.kind,ex_id:ex,grp:ex?libGroupOf(ex):null,
    lvl:ex&&lvlCount(ex)?getLvl(ex):null,variant:ex&&!EX[ex].gen&&EX[ex].v?varIdx(s,d):null,planned_sec:s.min*60,played_sec:Math.round(sec),bpm:Math.round(Mt.bpm)});
  prSave(q);
}
function prFlushAll(){Object.keys(PR.sec).forEach(k=>prFlush(+k));}
window.addEventListener('pagehide',prFlushAll);

/* ================= итог занятия ================= */
const SUM={feel:0};
// сыгранное за сегодняшний план: уже записанное + текущее
const prTotal=()=>Object.values(PR.from).reduce((a,x)=>a+x,0)+prPlayed();
function prExCount(){const ks=new Set([...Object.keys(PR.from),...Object.keys(PR.sec)].filter(k=>((PR.from[k]||0)+(PR.sec[k]||0))>=PR_MIN));return [...ks].filter(k=>{const s=st.plan.segs[+k];return s&&s.id&&EX[s.id];}).length;}
// упражнения, у которых сегодня записан чистый темп
function prCleanToday(){const dstr=dateOfIndex(st.i).toISOString().slice(0,10),m=lsGet('bpmClean',{});return Object.keys(EX).filter(id=>m[exKey(id)]&&m[exKey(id)].date===dstr).map(id=>({id,bpm:m[exKey(id)].bpm}));}
function openSummary(){
  if(st.running){st.running=false;coachRun();}
  prFlushAll();SUM.feel=0;
  setView('summary');
}
function renderSummary(){
  const d=st.plan.d,T=st.plan.T,played=prTotal(),u=prUser();
  const cl=prCleanToday();
  $('vSummary').innerHTML='<div class="done-h"><span class="ok">'+IC('circle-check')+'</span><h1 class="lt">'+(st.done.size>=st.plan.segs.length?L('Тренировка готова','Workout done'):L('Итог занятия','Session summary'))+'</h1><p class="mut">'+esc(dateText(d.date))+'</p></div>'+
    '<div class="g3"><div class="card"><small>'+L('Время','Time')+'</small><b>'+Math.round(played/60)+'<small> '+L('мин','min')+'</small></b></div><div class="card"><small>'+L('Упражнений','Exercises')+'</small><b>'+prExCount()+'</b></div><div class="card"><small>'+L('От плана','Of plan')+'</small><b>'+Math.min(100,Math.round(100*played/(T*60)))+'<small>%</small></b></div></div>'+
    (cl.length?'<div class="card"><div class="sum-h">'+L('Чистый темп сегодня','Clean tempo today')+'</div>'+cl.slice(0,5).map(x=>'<div class="rec"><span>'+esc(numTitle(x.id))+'</span><b>'+x.bpm+' bpm</b></div>').join('')+'</div>':'')+
    '<div class="card"><div class="sum-h">'+L('Как ощущения?','How did it feel?')+'</div><div class="feel" role="group">'+[1,2,3,4,5].map(n=>'<button class="nb" data-feel="'+n+'" aria-pressed="'+(SUM.feel===n)+'">'+n+'</button>').join('')+'</div>'+
    '<div class="feelab"><span>'+L('Тяжело, был зажим','Hard, I was tense')+'</span><span>'+L('Легко','Easy')+'</span></div>'+
    '<textarea id="sumNote" maxlength="2000" rows="3" placeholder="'+L('Заметка: что получилось, что нет','Note: what worked, what did not')+'"></textarea></div>'+
    (u?'':'<div class="card sum-in">'+IC('log-in')+'<p>'+L('Войдите в профиле, чтобы сохранять занятия и видеть прогресс.','Sign in from your profile to keep your sessions and see your progress.')+'</p><button class="btn nb" id="sumSignIn">'+L('В профиль','Profile')+'</button></div>')+
    '<button class="btn-pri" id="sumSave">'+(u?L('Сохранить','Save'):L('Готово','Done'))+'</button>';
}
function saveSummary(){
  const u=prUser();
  if(u){
    const d=st.plan.d,q=prQueue(),note=($('sumNote').value||'').trim().slice(0,2000);
    q.ses.push({_u:u,client_id:prId(),day:prDay(d),day_index:d.i,genre:GENRE,inst:INST,planned_min:st.plan.T,played_sec:Math.round(prTotal()),feel:SUM.feel||null,note:note||null});
    prSave(q);toast(L('Занятие сохранено','Session saved'));
  }
  setView('today');
}
$('vSummary').addEventListener('click',e=>{
  const f=e.target.closest('button[data-feel]');if(f){SUM.feel=+f.dataset.feel;document.querySelectorAll('#vSummary [data-feel]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.feel===SUM.feel)));return;}
  if(e.target.closest('#sumSave'))saveSummary();
  else if(e.target.closest('#sumSignIn'))setView('profile');
});
$('finishBtn').onclick=openSummary;
