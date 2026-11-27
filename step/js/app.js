(function(){
var D=document,R=D.documentElement;
function get(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
// theme + font
function applyTheme(t){R.setAttribute('data-theme',t);try{localStorage.setItem('step-theme',t)}catch(e){}
 D.querySelectorAll('[data-set-theme]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.setTheme===t)})}
applyTheme(R.getAttribute('data-theme')||'paper');
D.querySelectorAll('[data-set-theme]').forEach(function(b){b.onclick=function(){applyTheme(b.dataset.setTheme)}});
var fs=parseInt((getComputedStyle(R).getPropertyValue('--fs')||'19'),10)||19;
D.querySelectorAll('[data-font]').forEach(function(b){b.onclick=function(){fs=Math.max(15,Math.min(28,fs+2*parseInt(b.dataset.font,10)));R.style.setProperty('--fs',fs+'px');try{localStorage.setItem('step-font',fs)}catch(e){}}});
// progress
var pr=D.getElementById('progress');
var page=D.querySelector('.page[data-page]');
function onScroll(){var h=R.scrollHeight-innerHeight;var p=h>0?scrollY/h:0;if(pr)pr.style.width=(p*100)+'%';
 if(page){set('step-last',{page:page.dataset.page,title:page.dataset.title,y:Math.round(scrollY)})}}
var tm;addEventListener('scroll',function(){clearTimeout(tm);tm=setTimeout(onScroll,120);if(pr){var h=R.scrollHeight-innerHeight;pr.style.width=(h>0?scrollY/h*100:0)+'%'}},{passive:true});
// bookmarks and notes
var KEY='step-marks';var marks=get(KEY,[]);
function mid(pg,id){return pg+'#'+id}
function render(){D.querySelectorAll('.chapter p[id]').forEach(function(p){var m=marks.filter(function(x){return x.id===mid(page.dataset.page,p.id)})[0];p.classList.toggle('marked',!!m);p.classList.toggle('noted',!!(m&&m.note));if(m&&m.note)p.title=m.note;else p.removeAttribute('title')})}
if(page){
 render();
 var last=get('step-last',null);
 if(location.hash==''&&last&&last.page===page.dataset.page&&last.y>200&&sessionStorage.getItem('step-r')!==page.dataset.page){}
 var pop=D.getElementById('pop'),cur=null;
 D.addEventListener('click',function(e){
  var p=e.target.closest&&e.target.closest('.chapter p[id]');
  if(e.target.closest&&e.target.closest('#pop'))return;
  if(!p){pop.hidden=true;return}
  if(String(getSelection()))return;
  cur=p;var r=p.getBoundingClientRect();pop.hidden=false;
  pop.style.top=(scrollY+r.top-pop.offsetHeight-6)+'px';pop.style.left=Math.max(8,Math.min(innerWidth-pop.offsetWidth-8,e.clientX-60))+'px'});
 pop.addEventListener('click',function(e){
  var a=e.target.dataset.act;if(!a||!cur)return;
  var id=mid(page.dataset.page,cur.id);var m=marks.filter(function(x){return x.id===id})[0];
  if(a==='bm'){if(m&&!m.note){marks=marks.filter(function(x){return x!==m})}else if(!m){marks.push({id:id,page:page.dataset.page,pid:cur.id,title:page.dataset.title,text:cur.textContent.slice(0,120),note:''})}
   else{m.note=m.note}}
  if(a==='note'){var t=prompt('Заметка к этому абзацу:',m&&m.note||'');if(t===null){pop.hidden=true;return}
   if(m){m.note=t;if(!t)marks=marks.filter(function(x){return x!==m})}else if(t){marks.push({id:id,page:page.dataset.page,pid:cur.id,title:page.dataset.title,text:cur.textContent.slice(0,120),note:t})}}
  set(KEY,marks);render();pop.hidden=true});
}
// index: resume + list
var rs=D.getElementById('resume');
if(rs){var l=get('step-last',null);if(l&&l.page){rs.hidden=false;rs.textContent='Продолжить: '+l.title;rs.href=l.page}}
var ml=D.getElementById('mine-list');
if(ml&&marks.length){D.getElementById('mine').hidden=false;
 marks.forEach(function(m,i){var li=D.createElement('li');var a=D.createElement('a');a.href=m.page+'#'+m.pid;
  var b=D.createElement('b');b.textContent=m.title;a.appendChild(b);a.appendChild(D.createTextNode(m.text+'…'));
  if(m.note){var n=D.createElement('i');n.textContent='✎ '+m.note;a.appendChild(n)}
  var x=D.createElement('button');x.textContent='×';x.setAttribute('aria-label','Удалить');x.onclick=function(){marks.splice(i,1);set(KEY,marks);location.reload()};
  li.appendChild(a);li.appendChild(x);ml.appendChild(li)})}
// restore position on page open (only when coming from the "resume" button)
if(page&&location.search==='?resume'){var l2=get('step-last',null);if(l2&&l2.page===page.dataset.page)scrollTo(0,l2.y)}
if(rs){rs.addEventListener('click',function(e){e.preventDefault();location.href=rs.getAttribute('href')+'?resume'})}
})();
