(function(){var d=document,r=d.documentElement,L=localStorage,K='oid_bm';
function g(){try{return JSON.parse(L.getItem(K))||[]}catch(e){return[]}}
function s(v){try{L.setItem(K,JSON.stringify(v))}catch(e){}}
function put(k,v){try{L.setItem(k,v)}catch(e){}}
function mark(){d.querySelectorAll('[data-theme]').forEach(function(b){b.classList.toggle('on',b.dataset.theme==(r.dataset.theme||'paper'))});
d.querySelectorAll('[data-view]').forEach(function(b){b.classList.toggle('on',b.dataset.view==(r.classList.contains('spread')?'spread':'tape'))})}
d.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
if(b.dataset.theme){r.dataset.theme=b.dataset.theme;put('theme',b.dataset.theme)}
if(b.dataset.view){r.classList.toggle('spread',b.dataset.view=='spread');put('view',b.dataset.view)}
if(b.dataset.fs){var f=Math.min(28,Math.max(14,(parseInt(getComputedStyle(r).getPropertyValue('--fs'))||19)+ +b.dataset.fs));r.style.setProperty('--fs',f+'px');put('fs',f)}
if(b.id=='bm'){var a=g(),u=location.pathname.split('/').pop(),y=Math.round(scrollY/Math.max(1,r.scrollHeight-innerHeight)*1000)/1000;
a=a.filter(function(x){return x.u!=u});a.push({u:u,t:d.title.split(' — ')[0],y:y});s(a);b.textContent='Закладка сохранена'}
if(b.dataset.del){s(g().filter(function(x,i){return i!=b.dataset.del}));list()}mark()});
function list(){var o=d.getElementById('bms');if(!o)return;var a=g();
o.innerHTML=a.length?'':'<li>Закладок пока нет. Откройте страницу книги и нажмите «Закладка».</li>';
a.forEach(function(x,i){var li=d.createElement('li');li.innerHTML='<a href="'+x.u+'?y='+x.y+'"></a><button data-del="'+i+'" title="Удалить" aria-label="Удалить закладку">×</button>';li.firstChild.textContent=x.t+' · '+Math.round(x.y*100)+'%';o.appendChild(li)})}
function bar(){var b=d.getElementById('bar');if(b)b.style.width=(scrollY/Math.max(1,r.scrollHeight-innerHeight)*100)+'%'}
addEventListener('scroll',bar,{passive:true});
addEventListener('load',function(){var m=/[?&]y=([\d.]+)/.exec(location.search);if(m)scrollTo(0,parseFloat(m[1])*(r.scrollHeight-innerHeight));bar()});
list();mark()})();
