// RiffGym — утилиты, язык, табы, лады. Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= утилиты ================= */
const DAY=86400000, ANCHOR=Date.UTC(2026,10,2); // пн, 2 ноября 2026
const mod=(n,m)=>((n%m)+m)%m;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rot=(a,k)=>{const n=a.length;if(!n)return[];k=mod(k,n);return a.slice(k).concat(a.slice(0,k));};
const R=(t,n)=>Array(n).fill(t).join(' ');
const J=(...a)=>a.join(' ');
// полиритмия: фигура шестнадцатыми по кругу до совпадения с тактом 4/4, одна система на такт
const poly=fig=>{const f=fig.split(' '),out=[];for(let k=0;k<f.length*16;k++)out.push(f[k%f.length]);const sys=[];for(let k=0;k<out.length;k+=16)sys.push(out.slice(k,k+16).join(' '));return sys;};
const esc=s=>String(noteTxt(String(s))).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const pickIdx=(r,n)=>Math.floor(r()*n);
function lsGet(k,d){try{const v=localStorage.getItem('grif.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsSet(k,v,q){try{localStorage.setItem('grif.'+k,JSON.stringify(v));if(!q&&k!=='sync'){localStorage.setItem('grif.sync',JSON.stringify(Date.now()));}}catch(e){}if(!q&&k!=='sync')window.dispatchEvent(new Event('grif:ls'));}
// Синхронизация с аккаунтом (Supabase, блок <script> «Аккаунт» в конце файла): только эти ключи, grif.sync — время последнего изменения
const SYNC_KEYS=['time','lang','bpm','bpmEx','tests','lvl','inst','genre','strings','hand','gstrings','tuning','theme','bpmClean','tabz'];
window.__grifStore={user:null,logq:()=>lsGet('logq',null),setLogq:q=>lsSet('logq',q,1),keys:SYNC_KEYS,at:()=>lsGet('sync',0),all:()=>{const o={};SYNC_KEYS.forEach(k=>{const v=lsGet(k,undefined);if(v!==undefined)o[k]=v;});return o;},put:(o,at)=>{SYNC_KEYS.forEach(k=>{if(o&&k in o)lsSet(k,o[k],1);});lsSet('sync',at,1);}};
function dayIndexOf(d){return Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-ANCHOR)/DAY);}
// дата YYYY-MM-DD по локальному календарю (toISOString сдвигал день назад восточнее Гринвича)
const isoDay=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
const dayIdxOfIso=s=>Math.round((Date.parse(s+'T00:00:00Z')-ANCHOR)/DAY);
function dateOfIndex(i){const u=new Date(ANCHOR+i*DAY);return new Date(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate());}
function splitInt(total,weights){
  const s=weights.reduce((a,b)=>a+b,0)||1;
  const raw=weights.map(w=>total*w/s), out=raw.map(Math.floor);
  let rest=total-out.reduce((a,b)=>a+b,0);
  raw.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]).forEach(([f,i])=>{if(rest>0){out[i]++;rest--;}});
  return out;
}

/* ================= язык ================= */
// Адрес: слова через дефис в любом порядке — язык (ru, en), жанр (metal, blues, jazz, funk, fingerstyle) и инструмент (guitar, acoustic, bass): #en, #bass, #blues-acoustic-en. Чего нет в адресе — из сохранённых настроек (lsGet).
const hashWords=()=>(location.hash||'').slice(1).toLowerCase().split(/[-,+]/);
let LANG=(function(){const h=hashWords();if(h.includes('en'))return 'en';if(h.includes('ru'))return 'ru';const s=lsGet('lang',null);if(s==='en'||s==='ru')return s;return 'en';})();
const L=(ru,en)=>LANG==='en'?en:ru;
// Инструмент: гитара или бас. У баса своё число струн (4/5/6, стандартный строй) и техника правой руки; план дня от них не зависит.
let INST=(function(){const h=hashWords();for(const k of ['bass','acoustic','guitar'])if(h.includes(k))return k;const s=lsGet('inst','guitar');return ['bass','acoustic'].includes(s)?s:'guitar';})();
// Жанры (решения автора от 2026-11-13 и 2026-11-14): инструменты по жанрам, первый — по умолчанию.
// Акустика: блюз, джаз, фингерстайл. Фингерстайл — только акустика, фанк — гитара и бас.
const GENRES={metal:['guitar','bass'],blues:['guitar','acoustic','bass'],jazz:['guitar','acoustic','bass'],funk:['guitar','bass'],fingerstyle:['acoustic']};
const GENRE_IDS=Object.keys(GENRES);
// жанр, где есть инструмент i: текущий g, если подходит, иначе первый подходящий
const genreFor=(g,i)=>GENRES[g]&&GENRES[g].includes(i)?g:GENRE_IDS.find(k=>GENRES[k].includes(i));
// Жанр (решение автора от 2026-11-13): дэт-метал или блюз. У каждой пары «жанр + инструмент» своя библиотека; расписание общее. Акустика — только блюз.
let GENRE=(function(){const h=hashWords();let g=GENRE_IDS.find(k=>h.includes(k));if(!g){const s=lsGet('genre','metal');g=GENRES[s]?s:'metal';}
  if(!GENRES[g].includes(INST)){if(h.includes(INST))return genreFor(g,INST);INST=GENRES[g][0];}return g;})();
let STRINGS=(function(){const n=+lsGet('strings',4);return [4,5,6].includes(n)?n:4;})();
let HAND=lsGet('hand','fingers')==='pick'?'pick':'fingers';
// число струн гитары: 6/7/8 (7 — низкая B, 8 — ещё F#)
let GSTR=(function(){const n=+lsGet('gstrings',6);return [6,7,8].includes(n)?n:6;})();
// строй — свой у каждого инструмента: o — сдвиг всех струн вниз от стандарта (0…−11 полутонов), d — drop (нижняя струна ещё на тон ниже)
let TUNE=(function(){const s=lsGet('tuning',null),o={guitar:{o:0,d:false},acoustic:{o:0,d:false},bass:{o:0,d:false}};if(s&&typeof s==='object')['guitar','acoustic','bass'].forEach(k=>{const x=s[k];if(x&&Number.isInteger(x.o)&&x.o<=0&&x.o>=-11)o[k]={o:x.o,d:!!x.d};});return o;})();
const GB=(g,b)=>INST==='bass'?b:g;
const NSTR=()=>INST==='bass'?STRINGS:INST==='acoustic'?6:GSTR;
// строй таба: 'guitar', 'guitar7', 'bass5'…; при нестандартном строе — суффикс @сдвиг и d для drop: 'guitar7@-5d'
const TU=()=>{const n=NSTR(),b=INST==='bass'?'bass'+n:n===6?'guitar':'guitar'+n,t=TUNE[INST];return t.o||t.d?b+'@'+t.o+(t.d?'d':''):b;};
// ключ упражнения в grif.bpmEx и grif.lvl: у баса с префиксом, чтобы не смешивать с гитарой
// у блюза ещё префикс blues., у акустики ac.: blues.ac.B1
const exKey=id=>(GENRE!=='metal'?GENRE+'.':'')+(INST==='bass'?'bass.':INST==='acoustic'?'ac.':'')+id;
const UI={
  ru:{tag:'тренировка дня · гитара и бас',today:'Сегодня',timeLabel:'Сколько времени есть',weekLabel:'Неделя',cycleLabel:'Цикл 4 недели',back:'Назад',next:'Дальше',start:'Старт',pause:'Пауза',resume:'Продолжить',totalLeft:'всего осталось',metro:'Метроном',meter:'Размер',subdiv:'Деление доли',bursts:'Рывки',ladder:'Лестница: +4 bpm каждые 8 тактов',mOn:'Включить',mOff:'Выключить',tap:'Тап',play:'ИГРАЙ',rest:'ПАУЗА',plan:'План',copy:'Скопировать тренировку',aboutT:'Как это устроено',safeT:'Правила безопасности',prevDay:'Предыдущий день',nextDay:'Следующий день',langLabel:'Язык',instLabel:'Инструмент',genreLabel:'Жанр',tuneLabel:'Строй',handLabel:'Правая рука',themeLabel:'Тема',tabzLabel:'Масштаб табов',settings:'Настройки'},
  en:{tag:'daily workout · guitar and bass',today:'Today',timeLabel:'Time available',weekLabel:'Week',cycleLabel:'4-week cycle',back:'Back',next:'Next',start:'Start',pause:'Pause',resume:'Resume',totalLeft:'total left',metro:'Metronome',meter:'Meter',subdiv:'Subdivision',bursts:'Bursts',ladder:'Ladder: +4 bpm every 8 bars',mOn:'Start',mOff:'Stop',tap:'Tap',play:'PLAY',rest:'REST',plan:'Plan',copy:'Copy workout',aboutT:'How it works',safeT:'Safety rules',prevDay:'Previous day',nextDay:'Next day',langLabel:'Language',instLabel:'Instrument',genreLabel:'Genre',tuneLabel:'Tuning',handLabel:'Right hand',themeLabel:'Theme',tabzLabel:'Tab size',settings:'Settings'}
};
const t=k=>UI[LANG][k];
const INAME=k=>k==='bass'?L('Бас','Bass'):k==='acoustic'?L('Акустика','Acoustic'):L('Гитара','Guitar');
const GENRE_NAMES={metal:['Дэт-метал','Death metal'],blues:['Блюз','Blues'],jazz:['Джаз','Jazz'],funk:['Фанк','Funk'],fingerstyle:['Фингерстайл','Fingerstyle']};
const GNAME=k=>L(...GENRE_NAMES[k]);
const ABOUT={
  ru:['Программа одна для всех. Тренировка определяется датой: у всех, кто открыл RiffGym в этот день, она одинаковая.','Жанр (дэт-метал, блюз, джаз, фанк, фингерстайл) и инструмент (электрогитара, акустика, бас) выбирают библиотеку упражнений, расписание у всех одно. Сменить их можно в профиле.','Главная настройка — время. Чем его меньше, тем раньше выпадают блоки с конца списка: сначала музыка, затем поддержка. Фокус дня остаётся всегда. Сложность выбирается уровнем прямо на упражнении.','Темп у каждого свой. <b>Чистый темп</b> — самый быстрый, на котором ты играешь без ошибок и без зажима. <b>Рабочий</b> — на 10% ниже. Протокол недели говорит, что с ними делать.','Неделя: ритм, арпеджио, левая рука — каждый фокус дважды, в воскресенье связки техник. База — каждый день.','Цикл 4 недели: объём → наращивание → скорость → разгрузка с тестами в последнее воскресенье. Каждый цикл меняется лад, каждую неделю — вариант упражнений.','Анонимная статистика посещений — Cloudflare Web Analytics: без cookies и без личных данных. Без входа настройки и результаты хранятся только в твоём браузере. Вход необязателен: он переносит настройки между устройствами и записывает занятия для экрана «Прогресс».'],
  en:['One program for everyone. The workout is set by the date: everyone who opens RiffGym on a given day gets the same one.','Genre (death metal, blues, jazz, funk, fingerstyle) and instrument (electric guitar, acoustic, bass) pick the exercise library; the schedule is the same for everyone. You can change them in your profile.','The main setting is time. The less you have, the earlier blocks drop from the end of the list: music first, then maintenance. The day’s focus always stays. Difficulty is a level you pick right on the exercise.','Tempo is personal. <b>Clean tempo</b> is the fastest you can play with no mistakes and no tension. <b>Working tempo</b> is 10% below it. The week protocol tells you what to do with them.','Week: rhythm, arpeggios and left hand, each focus twice, with technique combinations on Sunday. Base runs every day.','4-week cycle: volume → build → speed → deload, with tests on the last Sunday. Each cycle brings a new scale, each week a new exercise variant.','Anonymous visit stats via Cloudflare Web Analytics: no cookies and no personal data. Without signing in, your settings and results stay in your browser only. Signing in is optional: it carries your settings across devices and logs your practice for the Progress screen.']
};
const SAFETY={
  ru:['Боль, жжение или онемение в кисти, предплечье, локте — сразу стоп. На сегодня с этой техникой всё.','Паузы в плане обязательные. Отложи инструмент, встань, расслабь плечи.','Растяжки не через силу. Не получается — сдвинь упражнение выше по грифу.','Зажим хуже ошибки. Если рука каменеет, сбрось темп, даже если ноты чистые.','Тендинит лечится месяцами. Лишний день отдыха стоит дешевле.'],
  en:['Pain, burning or numbness in the hand, forearm or elbow: stop right away. That technique is done for today.','Breaks in the plan are mandatory. Put the instrument down, stand up, relax your shoulders.','Never force a stretch. If it does not work, move the exercise higher up the neck.','Tension is worse than a mistake. If the hand locks up, drop the tempo even if the notes are clean.','Tendinitis takes months to heal. An extra rest day is cheaper.']
};
const DOWN={ru:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']};
const MONTHS={ru:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']};
function dateText(d){const w=DOWN[LANG][mod(d.getDay()-1,7)];return LANG==='en'?w+', '+MONTHS.en[d.getMonth()]+' '+d.getDate():w+', '+d.getDate()+' '+MONTHS.ru[d.getMonth()];}

/* ================= таб ================= */
/* Токен: части через «+» (струна, h|p|t, лад, bЛАД, rЛАД, *, ~ или струна + x — мёртвая нота), затем m (палм-мьют) и :k (длина в шагах).
   Шаг = доля / деление; деление = sub варианта, токен «/n» меняет его до конца системы. «.» — пауза, «|» — тактовая черта. */
// строй: струны сверху вниз и открытые струны (midi). Бас: B — низкая B, C — высокая C.
const TUNINGS={
  guitar:{strs:['e','B','G','D','A','E'],open:{E:40,A:45,D:50,G:55,B:59,e:64}},
  guitar7:{strs:['e','B','G','D','A','E','Y'],open:{Y:35,E:40,A:45,D:50,G:55,B:59,e:64}},
  guitar8:{strs:['e','B','G','D','A','E','Y','Z'],open:{Z:30,Y:35,E:40,A:45,D:50,G:55,B:59,e:64}},
  bass4:{strs:['G','D','A','E'],open:{E:28,A:33,D:38,G:43},bass:true},
  bass5:{strs:['G','D','A','E','B'],open:{B:23,E:28,A:33,D:38,G:43},bass:true},
  bass6:{strs:['C','G','D','A','E','B'],open:{B:23,E:28,A:33,D:38,G:43,C:48},bass:true},
  // открытые строи 6-струнной гитары и акустики (решение автора от 2026-11-14): свойство варианта или уровня (tun), а не настройка.
  // Буквы струн те же, что в стандарте (e B G D A E — по положению), меняются только ноты открытых струн. Сдвиг строя пользователя применяется сверху, drop — нет.
  dadgad:{strs:['e','B','G','D','A','E'],open:{E:38,A:45,D:50,G:55,B:57,e:62},lab:'DADGAD'},
  opend:{strs:['e','B','G','D','A','E'],open:{E:38,A:45,D:50,G:54,B:57,e:62},lab:'Open D'},
  opendm:{strs:['e','B','G','D','A','E'],open:{E:38,A:45,D:50,G:53,B:57,e:62},lab:'Open Dm'},
  openg:{strs:['e','B','G','D','A','E'],open:{E:38,A:43,D:50,G:55,B:59,e:62},lab:'Open G'},
  openc:{strs:['e','B','G','D','A','E'],open:{E:36,A:43,D:48,G:55,B:60,e:64},lab:'Open C'},
  opene:{strs:['e','B','G','D','A','E'],open:{E:40,A:47,D:52,G:56,B:59,e:64},lab:'Open E'},
  opena:{strs:['e','B','G','D','A','E'],open:{E:40,A:45,D:52,G:57,B:61,e:64},lab:'Open A'},
  dropd:{strs:['e','B','G','D','A','E'],open:{E:38,A:45,D:50,G:55,B:59,e:64},lab:'Drop D'},
  dgdgcd:{strs:['e','B','G','D','A','E'],open:{E:38,A:43,D:50,G:55,B:60,e:62},lab:'DGDGCD'},
  cgcgcd:{strs:['e','B','G','D','A','E'],open:{E:36,A:43,D:48,G:55,B:60,e:62},lab:'CGCGCD'}
};
const OPEN_TUNINGS=Object.keys(TUNINGS).filter(k=>TUNINGS[k].lab);
// У 7/8-струнной гитары низкие струны в табе — Y (B) и Z (F#): буквы B и E уже заняты.
const NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],FLATS=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const TUN_C={};
// строй по ключу TU(): струны, midi открытых струн с учётом сдвига и drop, нижняя струна, название
function TUN(tu){
  tu=tu||'guitar';if(TUN_C[tu])return TUN_C[tu];
  const m=String(tu).match(/^([a-z0-9]+)(?:@(-?\d+)(d?)(k?))?$/),base=(m&&TUNINGS[m[1]])||TUNINGS.guitar,off=m&&m[2]?+m[2]:0,drop=!!(m&&m[3]);
  const low=base.strs[base.strs.length-1],open={};
  base.strs.forEach(s=>{open[s]=base.open[s]+off-(drop&&s===low?2:0);});
  const nm=base.strs.slice().reverse().map(s=>NOTES[mod(open[s],12)]);
  return TUN_C[tu]={strs:base.strs,open,bass:!!base.bass,lab:base.lab||'',off,drop,dk:drop&&!!m[4],low,std:!off&&!drop,name:nm.join(nm.some(x=>x.length>1)?' ':''),key:NOTES[mod(4+off,12)]};
}
// drop, два способа переноса таба:
// — «+2 лада» (dsh): ноты нижней струны на 2 лада выше, звучание как в стандарте того же тона;
// — «в тональности drop» (dropKey, ключ строя с суффиксом k): нижняя струна как в табе, остальные на 2 лада ниже — всё на тон ниже,
//   открытая нижняя остаётся открытой, квинты берутся одним пальцем. Выбирается, если в табе есть открытая нижняя струна,
//   а на остальных струнах нет нот ниже 2-го лада.
const dsh=(T,s)=>T.drop&&!T.dk&&s===T.low?2:0;
const RAW='raw';
function dropKey(t,T){
  // нота ниже 2-го лада на верхних струнах уходит на соседнюю нижнюю струну (A0 → нижняя 5 лад в drop D);
  // если так не выходит аккорд, весь аккорд переносится на струну ниже той же формой (D3+A1 → A6+E6). Легато на другую струну не переносим.
  const low=T.strs.indexOf(T.low);let open=false,ok=true;
  const conv=(notes,all)=>{
    const used=new Set(),res=[];
    for(const q of notes){
      let si=T.strs.indexOf(q[1]);
      if(q[8]){si+=all&&si!==low?1:0;if(si>low||used.has(si))return null;used.add(si);res.push({p:T.strs[si]+q[8]});continue;}
      let f=+q[3];
      if(si===low&&!all){if(f===0)open=true;used.add(si);res.push({f,p:q[0]});continue;}
      if(si===low)return null;
      f-=2;
      if(f<0||all){if(q[2])return null;const lo=T.strs[si+1];f+=T.open[q[1]]-T.open[lo];si++;}
      if(used.has(si))return null;used.add(si);
      const sh=f-(+q[3]);
      res.push({f,p:T.strs[si]+q[2]+f+(q[4]!=null?'b'+(+q[4]+sh)+(q[5]!=null?'r'+(+q[5]+sh):''):'')+q[6]+q[7]});
    }
    const fr=res.map(x=>x.f).filter(x=>x>0);
    return fr.length>1&&Math.max(...fr)-Math.min(...fr)>4?null:res;
  };
  const out=t.map(sys=>sys.split(/(\s+)/).map(tok=>{
    const m=tok.match(TAB_TOK);if(!tok.trim()||!m||/^[.|\/]/.test(tok))return tok;
    const notes=m[1].split('+').map(p=>p.match(TAB_PART));
    if(notes.some(q=>!q))return tok;
    const res=conv(notes,false)||(notes.length>1&&conv(notes,true));
    if(!res){ok=false;return tok;}
    return res.map(x=>x.p).join('+')+m[2]+(m[3]?':'+m[3]:'');
  }).join(''));
  return open&&ok?out:null;
}
// текст с разметкой нот под текущий строй: {E} — нота (сдвиг строя), {Bb} — нота бемолем, {s:A} — струна по её настройке, {o:E} — открытая струна (в drop нижняя — 2-й лад)
// tu — строй таба (по умолчанию текущий); в тональности drop ноты на тон ниже. tu===RAW — разметку не трогать.
function noteTxt(x,tu){
  if(tu===RAW||typeof x!=='string'||x.indexOf('{')<0)return x;
  const T=TUN(tu||TU());
  return x.replace(/\{(?:([so]):)?([A-GYZe])(#|b)?\}/g,(all,k,r,a)=>{
    const R=r==='e'?'E':r,pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11,Y:11,Z:6}[R]+(a==='#'?1:a==='b'?-1:0);
    if((k||r==='e'||r==='Y'||r==='Z')&&T.open[r]!=null){
      const lo=r==='e'?(s=>s.toLowerCase()):(s=>s);
      if(k==='o'&&T.drop&&!T.dk&&r===T.low)return NOTES[mod(T.open[r]+2,12)]+L(' (2-й лад)',' (fret 2)');
      return lo(NOTES[mod(T.open[r],12)]);
    }
    return (a==='b'?FLATS:NOTES)[mod(pc+T.off-(T.dk?2:0),12)];
  });
}
// техника: h, p, t (тэп); у баса ещё S — слэп большим пальцем, P — поп (решение автора от 2026-11-14): ES5, GP7, ESx — глухой слэп
const TAB_PART=/^([A-Za-z])(?:([hptSP]?)(\d{1,2})(?:b(\d{1,2})(?:r(\d{1,2}))?)?(\*?)(~?)|(([SP]?)x))$/;
const TAB_TOK=/^(.+?)(m?)(?::(\d+))?$/;
const EPS=1e-6;
const isInt=x=>Math.abs(x-Math.round(x))<EPS;
function parseSystem(src,sub,tu){
  const strs=TUN(tu).strs;
  const items=[],errs=[];let n=sub||1,pos=0;
  src.trim().split(/\s+/).forEach(tok=>{
    if(tok==='|'){items.push({bar:true,pos});return;}
    let m=tok.match(/^\/(\d+)$/);
    if(m){n=+m[1];if(n<1||n>8)errs.push('деление '+tok);if(!isInt(pos*n))errs.push(tok+' не на сетке');return;}
    m=tok.match(TAB_TOK);
    const k=m&&m[3]?+m[3]:1,rest=!!m&&m[1]==='.';
    if(!m||k<1||(rest&&m[2])){errs.push('токен '+tok);return;}
    const notes=rest?[]:m[1].split('+').map(p=>{
      const q=p.match(TAB_PART);if(!q){errs.push('токен '+tok);return null;}
      if(!strs.includes(q[1])){errs.push('струна '+q[1]+' в '+tok);return null;}
      const tc=q[8]?q[9]:q[2];if((tc==='S'||tc==='P')&&!TUN(tu).bass){errs.push('слэп/поп не на басу: '+tok);return null;}
      if(q[8])return {s:q[1],x:true,tech:tc,f:null,b:null,r:null,ph:false,vib:false};
      return {s:q[1],tech:q[2],f:+q[3],b:q[4]!=null?+q[4]:null,r:q[5]!=null?+q[5]:null,ph:!!q[6],vib:!!q[7]};
    }).filter(Boolean);
    items.push({pos,dur:k/n,k,n,rest,pm:!!m[2],notes});pos+=k/n;
  });
  return {items,len:pos,errs};
}
const parseTab=(systems,sub,tu)=>systems.map(s=>parseSystem(s,sub,tu));
const tabDen=meter=>+String(meter||'4/4').split('/')[1]||4;
const isP2=x=>x>0&&isInt(Math.log2(x));
// длительность → вид в нотах: lb (0 целая, 1 половинная, 2 четверть, 3 восьмая…), вязки, точка
function noteVal(k,n,den){
  const w=k/(den*Math.pow(2,Math.floor(Math.log2(n))));
  let base=w,dot=false;
  if(!isP2(w)){if(isP2(w*2/3)){base=w*2/3;dot=true;}else base=Math.pow(2,Math.floor(Math.log2(w)));}
  const lb=Math.round(-Math.log2(base));
  return {lb,beams:Math.max(0,lb-2),dot};
}
// группа вязки: доля в x/4, группа размера (2+2+3…) в x/8
function beamKey(pos,meter){
  const g=METERS[meter];
  if(tabDen(meter)===8&&g){const bar=g.reduce((a,b)=>a+b,0);const b=Math.floor(pos/bar+EPS);let p=pos-b*bar,k=0;while(k<g.length-1&&p>=g[k]-EPS){p-=g[k];k++;}return b*100+k;}
  return Math.floor(pos+EPS);
}
const BEND_TXT={1:'½',2:'full',3:'1½',4:'2'};
function renderSystem(sys,meter,si,tu){
  const STR=TUN(tu).strs,LG=13,TOP=32,X0=24,SB=TOP+(STR.length-1)*LG,S2=SB+26,H=S2+14,den=tabDen(meter);
  const yS=s=>TOP+STR.indexOf(s)*LG,f1=v=>Math.round(v*10)/10,T=TUN(tu),ftx=nt=>nt.x?'x':nt.f+dsh(T,nt.s);
  // система режется на куски по тактам (без тактов — по 4 долям), куски переносятся по ширине (flex-wrap)
  const CH=4/den*4,chunks=[[]];let x=6,cs=0;const cols=[];
  sys.items.forEach((it,ii)=>{
    const cur=chunks[chunks.length-1];
    if(it.bar){cols.push({bar:true,x:x+3});cur.push(cols.length-1);x+=8;
      if(ii<sys.items.length-1){chunks.push([]);x=6;}return;}
    if(!sys.items.some(q=>q.bar)&&cur.length&&it.pos>=cs+CH-EPS&&isInt(it.pos)){chunks.push([]);x=6;cs=it.pos;}
    const cw=Math.max(1,...it.notes.map(nt=>String(ftx(nt)).length))*7.4+4;
    const ex=(it.notes.some(nt=>nt.b!=null)?(it.notes.some(nt=>nt.r!=null)?22:13):0)+(it.notes.some(nt=>nt.vib)?14:0);
    const w=Math.max(cw+ex+6,34*Math.pow(it.dur*4/den,0.75));
    cols.push({it,x,w,cw,cx:x+3+cw/2});chunks[chunks.length-1].push(cols.length-1);x+=w;
  });
  // подписи струн — реальные ноты строя (сдвиг и drop), верхняя гитарная — строчной
  const lab=s=>{const n=NOTES[mod(T.open[s],12)];return s==='e'?n.toLowerCase():n;};
  return '<div class="tsys">'+chunks.filter(ch=>ch.length).map((ch,k)=>{
  const first=!k,last=ch[ch.length-1],endBar=cols[last].bar&&k<chunks.length-1;
  const W=Math.ceil(endBar?cols[last].x+1:(cols[last].bar?cols[last].x:cols[last].x+cols[last].w)+(k===chunks.length-1||!chunks[k+1]||!chunks[k+1].length?10:0)),R=k===chunks.length-1?W-4:W-1,L0=0;
  let back='',lines='',body='',ann='',rh='';
  STR.forEach((s,i)=>{const y=TOP+i*LG;lines+='<line class="ln" x1="'+L0+'" x2="'+R+'" y1="'+y+'" y2="'+y+'"/>';});
  // подписи струн рисуются у каждого куска, видны только у того, что начинает строку (.ls, layTabs)
  lines+='<g class="slg">'+STR.map((s,i)=>'<text class="'+(first?'sl':'sl2')+'" x="-10" y="'+(TOP+i*LG)+'" dy=".35em" text-anchor="middle">'+lab(s)+'</text>').join('')+'</g>';
  (first?[0,R]:[R]).forEach(bx=>{lines+='<line class="br" x1="'+bx+'" x2="'+bx+'" y1="'+TOP+'" y2="'+SB+'"/>';});
  const groups=new Map();let prev=null,pm=null;
  const pmEnd=()=>{if(!pm)return;ann+='<text class="an" x="'+f1(pm.x0)+'" y="10">P.M.</text>';if(pm.x1-pm.x0>34)ann+='<path class="dsh" d="M'+f1(pm.x0+26)+' 7H'+f1(pm.x1)+'V11"/>';pm=null;};
  ch.forEach(ci=>{const c=cols[ci];
    if(c.bar){if(ci===last)return;lines+='<line class="br" x1="'+f1(c.x)+'" x2="'+f1(c.x)+'" y1="'+TOP+'" y2="'+SB+'"/>';return;}
    const it=c.it,id=si+'.'+ci;
    back+='<rect class="hl ev" data-e="'+id+'" x="'+f1(c.x)+'" y="'+(TOP-9)+'" width="'+f1(c.w)+'" height="'+(S2-TOP+12)+'" rx="4"/>';
    if(it.pm){if(!pm)pm={x0:c.x+2};pm.x1=c.x+c.w-4;}else pmEnd();
    let g='';const xr=c.cx+c.cw/2;
    if(it.rest){
      const v=noteVal(it.k,it.n,den),y=TOP+2.5*LG,cx=f1(c.cx);
      if(v.lb<=2)g+='<rect class="rs" x="'+f1(c.cx-5)+'" y="'+(y-3)+'" width="10" height="5" rx="1"/>';
      else{g+='<path class="rsl" d="M'+f1(c.cx+3)+' '+(y-6)+'L'+f1(c.cx-1)+' '+(y+6)+'"/>';for(let k=0;k<Math.min(3,v.lb-2);k++)g+='<circle class="rs" cx="'+f1(c.cx-1-k)+'" cy="'+(y-4+k*4)+'" r="1.8"/>';}
    }
    it.notes.forEach(nt=>{
      const y=yS(nt.s);
      g+='<rect class="nb" x="'+f1(c.cx-c.cw/2)+'" y="'+(y-7)+'" width="'+f1(c.cw)+'" height="14" rx="3"/><text class="nt" x="'+f1(c.cx)+'" y="'+y+'" dy=".35em" text-anchor="middle">'+ftx(nt)+'</text>';
      if(nt.tech==='h'||nt.tech==='p'){
        const p=prev&&prev.it.notes.some(q=>q.s===nt.s)?prev:null,mx=p?(p.cx+c.cx)/2:c.cx-c.cw/2-3;
        if(p)body+='<path class="tq" d="M'+f1(p.cx+4)+' '+(y-6)+'Q'+f1(mx)+' '+(y-14)+' '+f1(c.cx-4)+' '+(y-6)+'"/>';
        body+='<text class="lt" x="'+f1(mx)+'" y="'+(y-12)+'" text-anchor="middle">'+nt.tech+'</text>';
      }
      if(nt.tech==='t')ann+='<text class="an" x="'+f1(c.cx)+'" y="10" text-anchor="middle">T</text>';
      if(nt.tech==='S'||nt.tech==='P')ann+='<text class="an sp" x="'+f1(c.cx)+'" y="10" text-anchor="middle">'+nt.tech+'</text>';
      if(nt.ph)ann+='<text class="an" x="'+f1(c.cx)+'" y="10" text-anchor="middle">P.H.</text>';
      if(nt.b!=null){
        const top=TOP-12,bx=xr+8;
        body+='<path class="tq" d="M'+f1(xr+1)+' '+(y-1)+'Q'+f1(bx)+' '+(y-1)+' '+f1(bx)+' '+(top+3)+'"/><path class="ah" d="M'+f1(bx-3)+' '+(top+4)+'L'+f1(bx)+' '+top+'L'+f1(bx+3)+' '+(top+4)+'Z"/>';
        body+='<text class="an" x="'+f1(bx)+'" y="'+(top-3)+'" text-anchor="middle">'+(BEND_TXT[nt.b-nt.f]||(nt.b-nt.f)/2)+'</text>';
        if(nt.r!=null){const rx=bx+10;body+='<path class="tq dsh" d="M'+f1(bx+3)+' '+top+'Q'+f1(rx)+' '+top+' '+f1(rx)+' '+(y-5)+'"/><path class="ah" d="M'+f1(rx-3)+' '+(y-6)+'L'+f1(rx)+' '+(y-2)+'L'+f1(rx+3)+' '+(y-6)+'Z"/>';if(nt.r!==nt.f)body+='<text class="an" x="'+f1(rx+4)+'" y="'+(y+3)+'">('+nt.r+')</text>';}
      }
      if(nt.vib){
        const x1=c.x+c.w-4,x0=Math.max(xr+3,x1-34);let d='M'+f1(x0)+' '+(y-9);
        for(let vx=x0,k=0;vx+3<=x1;vx+=3,k++)d+='L'+f1(vx+3)+' '+(y-9+(k%2?-2.5:2.5));
        body+='<path class="tq" d="'+d+'"/>';
      }
    });
    body+='<g class="ev" data-e="'+id+'">'+g+'</g>';
    if(!it.rest){
      const v=noteVal(it.k,it.n,den),cx=f1(c.cx);
      if(v.lb>=1)rh+='<line class="stm" x1="'+cx+'" x2="'+cx+'" y1="'+(v.lb===1?SB+14:SB+6)+'" y2="'+S2+'"/>';
      if(v.dot)rh+='<circle class="bm" cx="'+f1(c.cx+4)+'" cy="'+(S2-6)+'" r="1.4"/>';
    }
    const key=beamKey(it.pos,meter);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);
    prev=it.rest?null:c;
  });
  pmEnd();
  groups.forEach(gr=>{
    const st=gr.filter(c=>!c.it.rest).map(c=>({c,b:noteVal(c.it.k,c.it.n,den).beams})).filter(o=>o.b>0);
    if(st.length===1)for(let l=0;l<st[0].b;l++)rh+='<path class="stm" d="M'+f1(st[0].c.cx)+' '+(S2-l*4)+'l6 -6"/>';
    if(st.length>1)for(let l=0;l<3;l++)st.forEach((o,k)=>{
      if(o.b<=l)return;const nx=st[k+1],pv=st[k-1];
      if(nx&&nx.b>l)rh+='<rect class="bm" x="'+f1(o.c.cx-0.5)+'" y="'+(S2-2.5-l*4)+'" width="'+f1(nx.c.cx-o.c.cx+1)+'" height="2.5"/>';
      else if(!(pv&&pv.b>l)){const dx=nx?6:-6;rh+='<rect class="bm" x="'+f1(Math.min(o.c.cx,o.c.cx+dx))+'" y="'+(S2-2.5-l*4)+'" width="6" height="2.5"/>';}
    });
    const tn=gr.find(c=>!isP2(c.it.n));
    if(tn&&gr.length>1)rh+='<text class="tu" x="'+f1((gr[0].cx+gr[gr.length-1].cx)/2)+'" y="'+(S2+11)+'" text-anchor="middle">'+tn.it.n+'</text>';
  });
  return '<svg class="tb'+(k===chunks.filter(c=>c.length).length-1?' se':'')+'" width="'+f1(W*TAB_K)+'" height="'+f1(H*TAB_K)+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(L('Табулатура','Tablature'))+'">'+back+lines+body+ann+rh+'</svg>';
  }).join('')+'</div>';
}
// масштаб рисунка таба
const TAB_K=.8;
// перенос: куски всех систем текут одной строкой; кусок, начинающий строку, получает .ls (отступ и подписи струн)
function layTabs(sc){const ch=[...sc.querySelectorAll('svg.tb')];if(!ch.length)return;
  for(let n=0;n<4;n++){let top=null,chg=false;ch.forEach(c=>{const t=c.getBoundingClientRect().top,ls=top===null||t>top+4;if(ls)top=t;if(c.classList.contains('ls')!==ls){c.classList.toggle('ls',ls);chg=true;}});if(!chg)break;}}
const tabRO=typeof ResizeObserver!=='undefined'?new ResizeObserver(es=>es.forEach(e=>layTabs(e.target))):null;
if(tabRO)new MutationObserver(()=>document.querySelectorAll('.tabsc:not([data-ro])').forEach(sc=>{sc.setAttribute('data-ro','1');tabRO.observe(sc);layTabs(sc);})).observe(document.documentElement,{childList:true,subtree:true});
const renderTab=(systems,sub,meter,tu)=>parseTab(systems,sub,tu).map((s,si)=>renderSystem(s,meter||'4/4',si,tu)).join('');

/* ================= лады ================= */
const OPEN=TUNINGS.guitar.open;
const LOW_TO_HIGH=['E','A','D','G','B','e'];
const MATERIALS=[
  {ru:'{E} фригийский',en:'{E} Phrygian',pcs:[4,5,7,9,11,0,2]},
  {ru:'{E} гармонический минор',en:'{E} harmonic minor',pcs:[4,6,7,9,11,0,3]},
  {ru:'{E} уменьшённая (полутон–тон)',en:'{E} diminished (half–whole)',pcs:[4,5,7,8,10,11,1,2]},
  {ru:'{E} локрийский',en:'{E} Locrian',pcs:[4,5,7,9,10,0,2]},
  {ru:'{E} фригийский доминант',en:'{E} Phrygian dominant',pcs:[4,5,8,9,11,0,2]},
  {ru:'{E} целотонная',en:'{E} whole tone',pcs:[4,6,8,10,0,2]}
];
const matName=m=>noteTxt(m[LANG]);
const PHRYG=MATERIALS[0];
function scaleNotesFrom(pcs,start,count){const out=[];for(let m=start;out.length<count;m++){if(pcs.includes(mod(m,12)))out.push(m);}return out;}
function threeNps(mat){
  const cands=[];
  for(let m=45;m<=57;m++){
    if(!mat.pcs.includes(mod(m,12)))continue;
    const notes=scaleNotesFrom(mat.pcs,m,18);
    const frets=notes.map((n,k)=>n-OPEN[LOW_TO_HIGH[Math.floor(k/3)]]);
    cands.push({m,frets,max:Math.max(...frets),min:Math.min(...frets)});
  }
  const ok=cands.filter(c=>c.max<=19&&c.min>=4);
  const pool=ok.length?ok:cands;
  pool.sort((a,b)=>((mod(b.m,12)===4)-(mod(a.m,12)===4))||(a.max-b.max));
  return pool[0].frets.map((f,k)=>({s:LOW_TO_HIGH[Math.floor(k/3)],f,j:k%3}));
}
function npsTokens(mat,mode){
  const up=threeNps(mat), down=up.slice().reverse();
  const tk=(n,dir)=>{if(mode!=='legato'||n.j===(dir==='up'?0:2))return n.s+n.f;return n.s+(dir==='up'?'h':'p')+n.f;};
  return [up.map(n=>tk(n,'up')).join(' '),down.map(n=>tk(n,'down')).join(' ')];
}
// Группы по size соседних ступеней лада на одной струне, вверх; не больше 8 групп.
function stringGroups(mat,str,size){
  const fr=[];for(let f=0;f<=19;f++){if(mat.pcs.includes(mod(OPEN[str]+f,12)))fr.push(f);}
  const groups=[];for(let g=0;g+size-1<fr.length&&groups.length<8;g++)groups.push(fr.slice(g,g+size));
  return groups;
}
// tech(k) — техника k-й ноты группы ('' — медиатором).
const groupsUp=(str,gs,tech)=>gs.map(g=>g.map((f,k)=>str+(tech?tech(k,'up'):'')+f).join(' ')).join(' ');
const groupsDown=(str,gs,tech)=>gs.slice().reverse().map(g=>g.slice().reverse().map((f,k)=>str+(tech?tech(k,'down'):'')+f).join(' ')).join(' ');
function oneStringSeq(mat){
  const gs=stringGroups(mat,'e',3);
  return [groupsUp('e',gs),groupsDown('e',gs)];
}
// Гамма по 3 ноты на струну на струнах [a,b): ноты вверх и вниз; legato — медиатором только первая нота фразы на струне, nowhere — и её хаммером.
function npsRange(mat,a,b,mode){
  const up=threeNps(mat).filter(n=>{const k=LOW_TO_HIGH.indexOf(n.s);return k>=a&&k<b;}),down=up.slice().reverse();
  const tk=(n,dir)=>{const first=n.j===(dir==='up'?0:2);if(mode==='pick'||(first&&mode==='legato'))return n.s+n.f;if(first)return n.s+'h'+n.f;return n.s+(dir==='up'?'h':'p')+n.f;};
  return {up:up.map(n=>tk(n,'up')),down:down.map(n=>tk(n,'down'))};
}
const PERMS=(function(){const r=[];const p=(a,c)=>{if(!a.length){r.push(c);return;}a.forEach((x,i)=>p(a.filter((_,j)=>j!==i),c.concat(x)));};p([1,2,3,4],[]);return r;})();
const PAIRS=[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]];

