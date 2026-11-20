
(function(){
var d=document,R=d.documentElement,P=d.body.dataset.page,T=d.body.dataset.title;
function g(k,def){try{return JSON.parse(localStorage.getItem(k))||def}catch(e){return def}}
function s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
d.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){R.dataset.theme=b.dataset.t;try{localStorage.setItem('besy-theme',b.dataset.t)}catch(e){}}});
function fs(dl){var c=parseInt(getComputedStyle(R).getPropertyValue('--fs'))||19;c=Math.max(14,Math.min(28,c+dl));R.style.setProperty('--fs',c+'px');try{localStorage.setItem('besy-fs',c)}catch(e){}}
var fm=d.getElementById('fm'),fp=d.getElementById('fp');if(fm)fm.onclick=function(){fs(-1)};if(fp)fp.onclick=function(){fs(1)};
var rb=d.getElementById('ribbon');function prog(){var h=R.scrollHeight-innerHeight;rb.style.width=(h>0?scrollY/h*100:0)+'%'}addEventListener('scroll',prog);prog();
var ps=d.querySelectorAll('.chapter p[data-p]');
if(ps.length){
 var bm=g('besy-bm',[]);function has(p){return bm.some(function(b){return b.page==P&&b.p==p})}
 ps.forEach(function(p){if(has(p.dataset.p))p.classList.add('bm');
  p.addEventListener('click',function(e){if(e.target.closest('a'))return;var n=p.dataset.p;
   if(has(n)){bm=bm.filter(function(b){return !(b.page==P&&b.p==n)});p.classList.remove('bm')}
   else{bm.push({page:P,title:T,p:n,snip:p.textContent.slice(0,90)});p.classList.add('bm')}s('besy-bm',bm)})});
 var tm;addEventListener('scroll',function(){clearTimeout(tm);tm=setTimeout(function(){var y=innerHeight*.3,cur=ps[0];ps.forEach(function(p){if(p.getBoundingClientRect().top<y)cur=p});s('besy-last',{page:P,title:T,p:cur.dataset.p})},300)});
 if(location.hash&&/^#p\d+$/.test(location.hash)){var t=d.querySelector(location.hash);if(t){t.classList.add('hl');setTimeout(function(){t.scrollIntoView({block:'center'})},50)}}
 var pop=d.getElementById('pop');
 d.querySelectorAll('a.fn').forEach(function(a){a.onclick=function(e){e.preventDefault();e.stopPropagation();var li=d.getElementById('n'+a.dataset.n);pop.innerHTML='<b>'+a.dataset.n+'.</b> '+(li?li.innerHTML:'');pop.hidden=false}});
 d.addEventListener('click',function(e){if(!e.target.closest('a.fn')&&!e.target.closest('#pop'))pop.hidden=true});
}
var bl=d.getElementById('bms');if(bl){var b=g('besy-bm',[]);if(b.length){bl.innerHTML='';b.forEach(function(x,i){var li=d.createElement('li');li.innerHTML='<button title="Удалить">✕</button><a href="'+x.page+'#p'+x.p+'">'+x.title+'</a><br><small>'+x.snip+'…</small>';li.querySelector('button').onclick=function(){b.splice(i,1);s('besy-bm',b);location.reload()};bl.appendChild(li)})}}
var rs=d.getElementById('resume'),l=g('besy-last',null);if(rs&&l){rs.hidden=false;rs.innerHTML='Вы остановились: <a href="'+l.page+'#p'+l.p+'">'+l.title+' →</a>'}
})();
