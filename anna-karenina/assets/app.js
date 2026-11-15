
(function(){var d=document.documentElement,K='ak-';
function g(k){try{return localStorage.getItem(K+k)}catch(e){return null}}
function s(k,v){try{localStorage.setItem(K+k,v)}catch(e){}}
function th(t){d.dataset.theme=t;document.querySelectorAll('[data-t]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t==t)})}
function fs(n){n=Math.max(15,Math.min(26,n));d.style.setProperty('--fs',n+'px');s('fs',n)}
var cur=+g('fs')||19;th(g('theme')||'paper');fs(cur);
document.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){th(b.dataset.t);s('theme',b.dataset.t)}});
var m=document.getElementById('minus'),p=document.getElementById('plus');
if(m)m.onclick=function(){cur-=1;fs(cur)};if(p)p.onclick=function(){cur+=1;fs(cur)};
var a=document.querySelector('article'),sp=document.getElementById('spread');
if(a&&sp){var on=g('spread')=='1';a.classList.toggle('spread',on);sp.setAttribute('aria-pressed',on);
sp.onclick=function(){on=!on;a.classList.toggle('spread',on);sp.setAttribute('aria-pressed',on);s('spread',on?'1':'0')}}
var bar=document.getElementById('bar');
addEventListener('scroll',function(){var h=d.scrollHeight-innerHeight;bar.style.width=(h>0?scrollY/h*100:0)+'%'});
function bms(){try{return JSON.parse(g('bm')||'[]')}catch(e){return[]}}
var bm=document.getElementById('bm');
if(bm){var me=location.pathname.split('/').pop(),t=document.title.split(' — ')[0];
function ref(){var on=bms().some(function(x){return x.h==me});bm.setAttribute('aria-pressed',on);bm.textContent=on?'Закладка стоит':'Поставить закладку'}
bm.onclick=function(){var l=bms(),i=l.findIndex(function(x){return x.h==me});if(i>=0)l.splice(i,1);else l.push({h:me,t:t});s('bm',JSON.stringify(l));ref()};ref()}
var box=document.getElementById('bms');
if(box){var l=bms();box.innerHTML=l.length?l.map(function(x){return'<li><a href="'+x.h+'">'+x.t+'</a></li>'}).join(''):'<li>Пока пусто. Откройте часть и нажмите «Поставить закладку».</li>'}
})();

(function(){var K='ak-bm';function L(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(e){return[]}}
var bm=document.getElementById('bm');
if(bm){bm.textContent='Закладка здесь';bm.setAttribute('aria-pressed','false');
bm.onclick=function(){var c=null;document.querySelectorAll('.ch').forEach(function(e){if(e.getBoundingClientRect().top<140)c=e});
var f=location.pathname.split('/').pop(),h=f+(c?'#'+c.id:''),t=document.title.split(' — ')[0]+(c?', '+c.dataset.t:'');
var l=L().filter(function(x){return x.h!=h});l.push({h:h,t:t});try{localStorage.setItem(K,JSON.stringify(l))}catch(e){}bm.textContent='Закладка сохранена'}}
var cl=document.getElementById('clr');if(cl)cl.onclick=function(){try{localStorage.setItem(K,'[]')}catch(e){}location.reload()};
var q=document.getElementById('q'),out=document.getElementById('out');
if(q&&out&&window.D){var run=function(){var v=q.value.trim().toLowerCase();out.innerHTML='';if(v.length<3){out.textContent='Введите не меньше трёх букв.';return}
var n=0,tot=0;D.forEach(function(d){var t=d[3],lo=t.toLowerCase(),i=lo.indexOf(v);if(i<0)return;tot++;if(n>=40)return;n++;
var s=Math.max(0,i-60),sn=t.slice(s,i+v.length+80).replace(/\n/g,' ');var e=document.createElement('div');e.className='hit';
var a=document.createElement('a');a.href='part-'+d[0]+'.html#c'+d[1];a.textContent='Часть '+d[0]+', глава '+d[2];e.appendChild(a);
var p=document.createElement('div');var j=sn.toLowerCase().indexOf(v);
p.append('…'+sn.slice(0,j));var m=document.createElement('mark');m.textContent=sn.slice(j,j+v.length);p.appendChild(m);p.append(sn.slice(j+v.length)+'…');e.appendChild(p);out.appendChild(e)});
if(!tot)out.textContent='Ничего не найдено.';else if(tot>n){var x=document.createElement('p');x.textContent='Показано '+n+' из '+tot+' глав. Уточните запрос.';out.appendChild(x)}};
q.oninput=run}
})();
