// RiffGym — раздел «Все упражнения». Обычный скрипт: файлы js/*.js делят общую область видимости и грузятся по порядку (см. index.html).
'use strict';
/* ================= все упражнения ================= */
// Раздел строится из активных EX/EXEN и GROUPS: новое упражнение попадает сюда само. Слово library в адресе открывает раздел.
const LIB={on:hashWords().includes('library'),open:new Set(),sel:{},q:'',g:'all'};
const LIB_ORDER=[['W',()=>KIND('warm')],['B',()=>KIND('base')]].concat(['R','A','L','C'].map(g=>[g,()=>GN(g)]));
const libNum=id=>EX[id].n!=null?EX[id].n:+id.replace(/\D/g,'');
// Сквозной номер упражнения: порядок раздела «Все упражнения». Только отображение, id не меняются.
const NUMC={};
function exNum(id){const m=NUMC[INST]||(NUMC[INST]=(()=>{const o={};let n=0;libGroups().forEach(g=>g.list.forEach(x=>o[x]=++n));return o;})());return m[id]||0;}
function numTitle(id){const n=exNum(id);return (n?n+'. ':'')+X(id,'name');}
function libGroups(){
  const ids=Object.keys(EX),seen=new Set(),out=[];
  LIB_ORDER.forEach(([g,name])=>{
    const list=(GROUPS[g]||ids.filter(id=>id.replace(/\d+$/,'')===g)).filter(id=>EX[id]&&!seen.has(id)).sort((a,b)=>libNum(a)-libNum(b));
    list.forEach(id=>seen.add(id));if(list.length)out.push({g,name:name(),list});
  });
  const rest=ids.filter(id=>!seen.has(id)).sort((a,b)=>libNum(a)-libNum(b));
  if(rest.length)out.push({g:'X',name:L('Другие','Other'),list:rest});
  return out;
}
// Выбор в разделе живёт только здесь: уровень по умолчанию сохранённый, вариант — вариант дня; grif.lvl не меняется.
function libSel(id){
  const ex=EX[id],x=LIB.sel[id]||{},n=lvlCount(id);
  return {lv:n?clamp(x.lv||getLvl(id),1,n):0,k:(ex.gen||!ex.v)?null:(x.k!=null?x.k:dayVar({id},st.plan.d))};
}
function libExHtml(id){
  const ex=EX[id],d=st.plan.d,{lv,k}=libSel(id),open=LIB.open.has(id);
  let h='<details class="lib-ex" data-lib="'+id+'"'+(open?' open':'')+'><summary><span class="lib-id" title="'+id+'">'+exNum(id)+'</span><span><b>'+esc(X(id,'name'))+'</b><br><span class="lib-goal">'+esc(X(id,'goal'))+'</span></span></summary>';
  if(!open)return h+'</details>';
  h+='<div class="lib-body"><div class="sect"><h4>'+L('Как играть','How to play')+'</h4><p>'+esc(X(id,'how'))+'</p></div>';
  // бас: оба указания правой руки, выбранная техника — первой
  if(INST==='bass')(HAND==='pick'?['hp','hf']:['hf','hp']).forEach((f,j)=>{const x=X(id,f);if(x)h+='<p class="note"'+(j?' style="opacity:.7"':'')+'><b>'+esc(f==='hp'?L('Медиатор','Pick'):L('Пальцы','Fingers'))+':</b> '+esc(x)+'</p>';});
  if(X(id,'tip'))h+='<p class="tip">'+esc(X(id,'tip'))+'</p>';
  if(lv)h+='<div class="sect"><h4>'+L('Уровни','Levels')+'</h4><ol>'+X(id,'lvl').map((x,j)=>'<li'+(j+1===lv?' aria-current="true"':'')+'>'+esc(x)+'</li>').join('')+'</ol></div>';
  if(k!=null){
    const day=dayVar({id},d);let b='';
    h+='<div class="sect"><h4>'+L('Варианты','Variants')+'</h4><ol>'+ex.v.map((_,j)=>'<li'+(j===k?' aria-current="true"':'')+'>'+esc(resolveEx({id,pick:j},d,lv||undefined).v.l||'')+'</li>').join('')+'</ol></div>';
    for(let j=0;j<ex.v.length;j++)b+='<button data-libvar="'+j+'" aria-pressed="'+(j===k)+'"'+(j===day?' class="day" title="'+L('Вариант дня','Today’s variant')+'"':'')+'>'+(j+1)+'</button>';
    h+='<div class="lvl"><span class="lbl">'+L('Вариант','Variant')+'</span><div class="lvlb" role="group" aria-label="'+L('Вариант упражнения','Exercise variant')+'">'+b+'</div><span class="lvld">'+esc(L('вариант дня — ','today’s variant: ')+(day+1))+'</span></div>';
  }else if(ex.gen)h+='<p class="legend" style="margin:0">'+esc(L('Материал строится по дню и ладу цикла, показан день: ','The material follows the day and the cycle scale. Showing: ')+dateText(d.date))+'</p>';
  if(lv){let b='';for(let j=1;j<=lvlCount(id);j++)b+='<button data-liblvl="'+j+'" aria-pressed="'+(j===lv)+'">'+j+'</button>';
    h+='<div class="lvl"><span class="lbl">'+L('Уровень','Level')+'</span><div class="lvlb" role="group" aria-label="'+L('Уровень сложности','Difficulty level')+'">'+b+'</div><span class="lvld">'+esc(X(id,'lvl')[lv-1])+'</span></div>';}
  const r=resolveEx(k!=null?{id,pick:k}:{id},d,lv||undefined);
  if(r&&r.v){if(r.v.note)h+='<p class="note">'+esc(r.v.note)+'</p>';if(r.v.t)h+=tabHtml(r.v.l,r.v.t,r.sub,r.meter,r.tu);}
  return h+'</div></details>';
}
function renderLib(){
  document.body.classList.toggle('lib-on',LIB.on);
  $('lib').hidden=!LIB.on;
  $('libBtn').textContent=LIB.on?L('← К тренировке','← Back to workout'):L('Все упражнения','All exercises');
  $('libBtn').setAttribute('aria-pressed',String(LIB.on));
  if(!LIB.on){$('lib').innerHTML='';return;}
  const gs=libGroups(),n=gs.reduce((a,g)=>a+g.list.length,0);
  if(LIB.g!=='all'&&!gs.some(g=>g.g===LIB.g))LIB.g='all';
  const fb=(g,name,k)=>'<button data-libf="'+g+'" aria-pressed="'+(LIB.g===g)+'">'+esc(name)+'<span class="n">'+k+'</span></button>';
  $('lib').innerHTML='<div class="lib-hd"><h2>'+L('Все упражнения','All exercises')+GB('',L(' · бас',' · bass'))+'</h2><span class="lbl" id="libN"></span></div>'+
    '<div class="lib-tools"><input type="search" class="lib-q" id="libQ" placeholder="'+L('Поиск: название, цель, номер (B1, тремоло…)','Search: name, goal, number (B1, tremolo…)')+'" aria-label="'+L('Поиск упражнений','Search exercises')+'">'+
    '<div class="tchips lib-f" role="group" aria-label="'+L('Группы','Groups')+'">'+fb('all',L('Все','All'),n)+gs.map(g=>fb(g.g,g.name,g.list.length)).join('')+'</div></div>'+
    gs.map(g=>'<div class="lib-grp" data-libg="'+g.g+'"><h3>'+esc(g.name)+'</h3><div class="lib-cards">'+g.list.map(libExHtml).join('')+'</div></div>').join('')+
    '<p class="lib-empty" id="libEmpty" hidden>'+L('Ничего не нашлось.','Nothing found.')+'</p>'+legendHtml();
  $('libQ').value=LIB.q;
  libFilter();
}
// Поиск и группа только скрывают карточки: раскрытые упражнения и плеер не перерисовываются.
const libNorm=s=>String(s||'').toLowerCase().replace(/ё/g,'е');
function libFilter(){
  const q=libNorm(LIB.q).trim().split(/\s+/).filter(Boolean);let shown=0;
  document.querySelectorAll('#lib .lib-grp').forEach(gr=>{
    let k=0;const gOk=LIB.g==='all'||gr.dataset.libg===LIB.g;
    gr.querySelectorAll('details[data-lib]').forEach(el=>{
      const id=el.dataset.lib,hay=libNorm([id,X(id,'name'),X(id,'goal'),X(id,'how'),X(id,'tip')].join(' '));
      const ok=gOk&&q.every(w=>hay.includes(w));el.hidden=!ok;if(ok)k++;
    });
    gr.hidden=!k;shown+=k;
  });
  $('libN').textContent=L('Показано ','Showing ')+shown+L(' из ',' of ')+document.querySelectorAll('#lib details[data-lib]').length;
  $('libEmpty').hidden=!!shown;
}
function libRerender(id){const el=document.querySelector('#lib details[data-lib="'+id+'"]');if(el)el.outerHTML=libExHtml(id);}
function setLib(on){on=!!on;if(on===LIB.on)return;plStop();LIB.on=on;writeHash();renderLib();window.scrollTo(0,0);}
$('libBtn').onclick=()=>setLib(!LIB.on);
$('lib').addEventListener('toggle',e=>{
  const el=e.target;if(!el.matches||!el.matches('details[data-lib]'))return;const id=el.dataset.lib;
  if(el.open===LIB.open.has(id))return;
  if(el.open)LIB.open.add(id);else{LIB.open.delete(id);if(Pl.box&&el.contains(Pl.box))plStop();}
  libRerender(id);
},true);
$('lib').addEventListener('click',e=>{
  const pb=e.target.closest('button[data-play]');if(pb){const box=pb.closest('.tabbox');if(Pl.on&&Pl.box===box)plStop();else plStart(box);return;}
  const el=e.target.closest('details[data-lib]'),lb=e.target.closest('button[data-liblvl]'),vb=e.target.closest('button[data-libvar]');
  if(!el||(!lb&&!vb))return;const id=el.dataset.lib,x=LIB.sel[id]=LIB.sel[id]||{};
  if(lb)x.lv=+lb.dataset.liblvl;if(vb)x.k=+vb.dataset.libvar;
  if(Pl.box&&el.contains(Pl.box))plStop();
  libRerender(id);
});
$('lib').addEventListener('input',e=>{if(e.target.id==='libQ'){LIB.q=e.target.value;libFilter();}});
$('lib').addEventListener('click',e=>{const b=e.target.closest('button[data-libf]');if(!b)return;LIB.g=b.dataset.libf;document.querySelectorAll('#lib button[data-libf]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));libFilter();});
$('lib').addEventListener('change',e=>{if(e.target.matches('input[data-loop]')){Pl.loop=e.target.checked;document.querySelectorAll('input[data-loop]').forEach(x=>{x.checked=Pl.loop;});}});

