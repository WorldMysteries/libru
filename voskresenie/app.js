(function(){
var root=document.documentElement,ls={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function fs(d){var v=Math.min(30,Math.max(15,(parseInt(getComputedStyle(root).getPropertyValue('--fs'))||20)+d));root.style.setProperty('--fs',v+'px');ls.set('fs',v)}
function theme(){var cur=root.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'),n=cur==='dark'?'light':'dark';root.dataset.theme=n;ls.set('theme',n)}
document.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;a==='fs+'?fs(2):a==='fs-'?fs(-2):theme()});
var main=document.querySelector('.read'),bar=document.querySelector('.prog i');
if(main){
 var key=main.dataset.key;ls.set('last',key);var seen=JSON.parse(ls.get('seen')||'{}');seen[key]=1;ls.set('seen',JSON.stringify(seen));
 var sp=parseFloat(ls.get('pos:'+key));if(sp>0&&!location.hash)setTimeout(function(){scrollTo(0,sp*(document.body.scrollHeight-innerHeight))},0);
 var t;addEventListener('scroll',function(){var p=scrollY/Math.max(1,document.body.scrollHeight-innerHeight);bar.style.width=(p*100)+'%';clearTimeout(t);t=setTimeout(function(){ls.set('pos:'+key,p.toFixed(4))},250)},{passive:true});
 addEventListener('keydown',function(e){if(e.target.closest('input,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;var l=e.key==='ArrowLeft'?'[rel=prev]':e.key==='ArrowRight'?'[rel=next]':null;if(l){var a=document.querySelector(l);if(a)location.href=a.href}});
}else{
 var seen2=JSON.parse(ls.get('seen')||'{}'),last=ls.get('last');
 document.querySelectorAll('[data-k]').forEach(function(a){if(seen2[a.dataset.k])a.classList.add('seen');if(a.dataset.k===last)a.classList.add('last')});
 if(last){var g=document.getElementById('go');g.href=last;g.textContent='Продолжить чтение'}
}
})();
