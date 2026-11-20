
(function(){var d=document,R=d.documentElement;
function g(){try{return JSON.parse(localStorage.getItem('m33-read'))||[]}catch(e){return[]}}
function s(v){try{localStorage.setItem('m33-read',JSON.stringify(v))}catch(e){}}
d.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){R.dataset.theme=b.dataset.t;try{localStorage.setItem('m33-theme',b.dataset.t)}catch(e){}}});
var r=g(),n=d.body.dataset.ch,cb=d.getElementById('done');
if(cb&&n){cb.checked=r.indexOf(+n)>-1;cb.onchange=function(){r=g().filter(function(x){return x!=+n});if(cb.checked)r.push(+n);s(r)}}
var p=d.getElementById('prog');if(p){var all=d.querySelectorAll('.toc li');all.forEach(function(li){if(r.indexOf(+li.dataset.ch)>-1)li.classList.add('read')});p.textContent='Прочитано глав: '+r.length+' из '+all.length}
var inf=d.getElementById('info');
d.querySelectorAll('.st').forEach(function(e){function go(){d.querySelectorAll('.st').forEach(function(x){x.classList.remove('on')});e.classList.add('on');
var h=e.dataset.c.split(',').map(function(c){c=c.trim();var f='glava-'+(c.length<2?'0'+c:c)+'.html';return '<a href="'+f+'">глава '+c+'</a>'}).join(', ');inf.innerHTML='<b>'+e.dataset.n+'</b> — '+h}
e.onclick=go;e.onkeydown=function(k){if(k.key=='Enter')go()}});
})();
