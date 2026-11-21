(function(){
var d=document,root=d.documentElement;
function get(k,def){try{var v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){return def}}
function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
d.querySelectorAll('[data-set-theme]').forEach(function(b){b.onclick=function(){var t=b.getAttribute('data-set-theme');root.setAttribute('data-theme',t);try{localStorage.setItem('dg-theme',t)}catch(e){}}});
d.querySelectorAll('[data-size]').forEach(function(b){b.onclick=function(){var cur=parseInt(getComputedStyle(root).getPropertyValue('--fs'))||19;var n=Math.max(14,Math.min(30,cur+parseInt(b.getAttribute('data-size'))));root.style.setProperty('--fs',n+'px');try{localStorage.setItem('dg-size',n)}catch(e){}}});
var pg=d.getElementById('progress');
function prog(){var h=root.scrollHeight-innerHeight;pg.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%'}
addEventListener('scroll',prog,{passive:true});prog();
var reader=d.querySelector('.reader');
var marks=get('dg-marks',[]);
function save(){set('dg-marks',marks)}
function find(id){for(var i=0;i<marks.length;i++)if(marks[i].id===id)return i;return -1}
if(!reader){
  var last=get('dg-last',null),res=d.getElementById('resume');
  if(last&&res){res.href=last.page+'.html#'+last.id;res.textContent='Продолжить чтение →'}
  var box=d.getElementById('mine'),list=d.getElementById('mine-list');
  if(box&&marks.length){box.hidden=false;list.innerHTML=marks.slice().sort(function(a,b){return b.ts-a.ts}).map(function(m){return '<li><a href="'+m.page+'.html#'+m.id+'">'+esc(m.snip)+'</a><span class="ctx">'+esc(m.ctx)+'</span>'+(m.note?'<span class="nt">'+esc(m.note)+'</span>':'')+'</li>'}).join('')}
  return;
}
var page=reader.getAttribute('data-page'),ptitle=reader.getAttribute('data-title');
var pop=d.getElementById('pop');
function place(anchor){pop.hidden=false;var r=anchor.getBoundingClientRect();var x=Math.max(8,Math.min(scrollX+r.left,scrollX+innerWidth-pop.offsetWidth-8));pop.style.left=x+'px';pop.style.top=(scrollY+r.bottom+6)+'px'}
function closePop(){pop.hidden=true;pop.innerHTML=''}
var drawer=d.createElement('aside');drawer.className='drawer';d.body.appendChild(drawer);
d.addEventListener('keydown',function(e){if(e.key==='Escape'){closePop();drawer.classList.remove('open')}});
d.addEventListener('click',function(e){if(!pop.hidden&&!pop.contains(e.target)&&!e.target.closest('sup.fn')&&!e.target.closest('.chapter p'))closePop()});
function note(n){var li=d.getElementById('note-'+n);return li?li.textContent:''}
d.querySelectorAll('sup.fn').forEach(function(s){
  function open(e){e.stopPropagation();pop.innerHTML='<strong>Примечание '+s.dataset.fn+'.</strong> '+esc(note(s.dataset.fn));place(s)}
  s.addEventListener('click',open);
  s.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(e)}});
});
function paint(){d.querySelectorAll('.chapter p').forEach(function(p){p.classList.toggle('marked',find(p.id)>-1)})}
function ctxOf(p){return ptitle+' · '+p.closest('.chapter').querySelector('h2').textContent}
function snippet(p){var t=p.textContent.replace(/\s+/g,' ').trim();return t.length>90?t.slice(0,90)+'…':t}
function ensure(p){var j=find(p.id);if(j<0){marks.push({id:p.id,page:page,ctx:ctxOf(p),snip:snippet(p),note:'',ts:Date.now()});j=marks.length-1}return j}
d.querySelectorAll('.chapter p:not(.sep)').forEach(function(p){
  p.addEventListener('click',function(e){
    if(e.target.closest('sup.fn')||String(getSelection()))return;
    var i=find(p.id),m=i>-1?marks[i]:null;
    pop.innerHTML='<div class="row"><button id="b-bm" class="'+(m?'on':'')+'">'+(m?'Закладка есть · снять':'Поставить закладку')+'</button><button id="b-nt">'+(m&&m.note?'Заметка':'Заметка…')+'</button></div><div id="nt-box"></div>';
    place(p);
    d.getElementById('b-bm').onclick=function(){var j=find(p.id);if(j>-1)marks.splice(j,1);else ensure(p);save();paint();closePop();renderDrawer()};
    d.getElementById('b-nt').onclick=function(){
      var cur=find(p.id)>-1?marks[find(p.id)].note:'';
      d.getElementById('nt-box').innerHTML='<textarea id="nt-t" placeholder="Ваша заметка"></textarea><div class="row"><button id="nt-s" class="on">Сохранить</button></div>';
      var ta=d.getElementById('nt-t');ta.value=cur;ta.focus();
      d.getElementById('nt-s').onclick=function(){var j=ensure(p);marks[j].note=ta.value.trim();save();paint();closePop();renderDrawer()};
    };
  });
});
var lastT;addEventListener('scroll',function(){clearTimeout(lastT);lastT=setTimeout(function(){var ps=d.querySelectorAll('.chapter p:not(.sep)');for(var i=0;i<ps.length;i++){if(ps[i].getBoundingClientRect().top>60){set('dg-last',{page:page,id:ps[i].id});break}}},400)},{passive:true});
function jump(id){var el=d.getElementById(id);if(el){el.scrollIntoView({block:'center'});el.classList.add('hit');setTimeout(function(){el.classList.remove('hit')},2500)}}
function renderDrawer(){
  var h='<h3>Закладки и заметки <button class="x" id="dr-x">закрыть</button></h3>';
  if(!marks.length)h+='<p class="empty">Пока пусто. Нажмите на любой абзац, чтобы поставить закладку или добавить заметку.</p>';
  else{h+='<ul>'+marks.slice().sort(function(a,b){return b.ts-a.ts}).map(function(m){return '<li><a href="'+m.page+'.html#'+m.id+'" data-id="'+m.id+'" data-page="'+m.page+'">'+esc(m.snip)+'</a><span class="ctx">'+esc(m.ctx)+'</span>'+(m.note?'<span class="nt">'+esc(m.note)+'</span>':'')+'<button class="x" data-del="'+m.id+'">удалить</button></li>'}).join('')+'</ul>'}
  drawer.innerHTML=h;
  d.getElementById('dr-x').onclick=function(){drawer.classList.remove('open')};
  drawer.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){var j=find(b.dataset.del);if(j>-1)marks.splice(j,1);save();paint();renderDrawer()}});
  drawer.querySelectorAll('a[data-id]').forEach(function(a){a.onclick=function(e){if(a.dataset.page===page){e.preventDefault();drawer.classList.remove('open');jump(a.dataset.id)}}});
}
d.getElementById('tbm').onclick=function(){renderDrawer();drawer.classList.toggle('open')};
paint();renderDrawer();
if(/^#ch-\d+-p\d+$/.test(location.hash))setTimeout(function(){jump(location.hash.slice(1))},150);
})();
