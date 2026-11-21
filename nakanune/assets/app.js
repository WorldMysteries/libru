(function(){
  var KEY='nakanune:';
  var root=document.documentElement;
  function get(k,d){try{var v=localStorage.getItem(KEY+k);return v===null?d:JSON.parse(v)}catch(e){return d}}
  function set(k,v){try{localStorage.setItem(KEY+k,JSON.stringify(v))}catch(e){}}
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}

  /* theme + font size */
  var theme=get('theme',null);
  if(theme) root.setAttribute('data-theme',theme);
  var fs=get('fs',1.2);
  root.style.setProperty('--fs',fs+'rem');
  function markTheme(){
    var cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'night':'paper');
    $$('[data-set-theme]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.setTheme===cur)});
  }
  $$('[data-set-theme]').forEach(function(b){b.addEventListener('click',function(){
    root.setAttribute('data-theme',b.dataset.setTheme);set('theme',b.dataset.setTheme);markTheme();
  })});
  markTheme();
  $$('[data-fs]').forEach(function(b){b.addEventListener('click',function(){
    fs=Math.min(1.8,Math.max(.95,fs+(b.dataset.fs==='+'?.08:-.08)));
    root.style.setProperty('--fs',fs+'rem');set('fs',fs);
  })});

  /* progress bar + resume position (reader pages) */
  var reader=$('.reader');
  var page=document.body.dataset.page;
  var bar=$('.progress');
  if(reader&&page){
    var ticking=false;
    function frac(){
      var r=reader.getBoundingClientRect();
      var total=r.height-innerHeight*.6;
      return Math.max(0,Math.min(1,(-r.top+innerHeight*.2)/Math.max(total,1)));
    }
    function onScroll(){
      if(ticking)return;ticking=true;
      requestAnimationFrame(function(){
        var f=frac();
        if(bar)bar.style.width=(f*100).toFixed(1)+'%';
        ticking=false;
      });
    }
    addEventListener('scroll',onScroll,{passive:true});onScroll();
    var saveT;
    addEventListener('scroll',function(){clearTimeout(saveT);saveT=setTimeout(function(){
      if(scrollY<200)return;
      var last=null;
      $$('h3.chapter',reader).forEach(function(h){if(h.getBoundingClientRect().top<innerHeight*.4)last=h});
      set('last',{page:page,title:document.body.dataset.title,y:Math.round(scrollY),ch:last?last.id:null,
        chTitle:last?last.textContent.replace(/\s+/g,' ').trim():'',f:frac()});
    },400)});
    /* restore position if requested via ?resume */
    if(location.search.indexOf('resume')>-1&&!location.hash){
      var l=get('last',null);
      if(l&&l.page===page)setTimeout(function(){scrollTo(0,l.y)},50);
    }
    /* chapter highlight in drawer */
    var links={};
    $$('.drawer a[data-ch]').forEach(function(a){links[a.dataset.ch]=a});
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting){$$('.drawer a.on').forEach(function(a){a.classList.remove('on')});
          var a=links[e.target.id];if(a)a.classList.add('on')}
      })},{rootMargin:'0px 0px -70% 0px'});
      $$('h3.chapter',reader).forEach(function(h){io.observe(h)});
    }
  }

  /* drawer */
  var drawer=$('.drawer'),scrim=$('.scrim');
  function dr(open){if(!drawer)return;drawer.classList.toggle('open',open);scrim.classList.toggle('on',open)}
  $$('[data-drawer]').forEach(function(b){b.addEventListener('click',function(){dr(!drawer.classList.contains('open'))})});
  if(scrim)scrim.addEventListener('click',function(){dr(false)});
  if(drawer)drawer.addEventListener('click',function(e){if(e.target.closest('a')||e.target.closest('.close'))dr(false)});
  addEventListener('keydown',function(e){
    if(e.key==='Escape'){dr(false);closePop()}
    if(e.target.matches('input,textarea,button'))return;
    if(e.altKey&&e.key==='ArrowLeft'){var p=$('.pager .pv');if(p)location.href=p.href}
    if(e.altKey&&e.key==='ArrowRight'){var n=$('.pager .nx');if(n)location.href=n.href}
  });

  /* bookmarks */
  function bms(){return get('bm',[])}
  function setBm(b){set('bm',b)}
  function refreshBtns(){
    var all=bms();
    $$('.bm').forEach(function(b){
      var on=all.some(function(x){return x.id===b.dataset.id&&x.page===page});
      b.setAttribute('aria-pressed',on);
      b.setAttribute('aria-label',on?'Убрать закладку':'Поставить закладку');
      b.title=on?'Убрать закладку':'Поставить закладку';
    });
  }
  $$('.bm').forEach(function(b){b.addEventListener('click',function(){
    var all=bms(),i=-1;
    all.forEach(function(x,k){if(x.id===b.dataset.id&&x.page===page)i=k});
    if(i>-1)all.splice(i,1);
    else all.push({id:b.dataset.id,page:page,href:b.dataset.href,label:b.dataset.label,t:Date.now()});
    setBm(all);refreshBtns();
  })});
  refreshBtns();

  function renderBm(box,withDrawer){
    if(!box)return;
    var all=bms();
    box.innerHTML='';
    if(!all.length){box.innerHTML='<p class="empty">Закладок пока нет. Нажмите на флажок рядом с названием главы — место сохранится в этом браузере.</p>';return}
    var ul=document.createElement('ul');ul.className='bmlist';
    all.sort(function(a,b){return b.t-a.t}).forEach(function(x){
      var li=document.createElement('li');
      var a=document.createElement('a');a.href=x.href;a.textContent=x.label;
      var d=document.createElement('button');d.textContent='убрать';
      d.addEventListener('click',function(){setBm(bms().filter(function(y){return !(y.id===x.id&&y.page===x.page)}));renderBm(box);refreshBtns()});
      li.appendChild(a);li.appendChild(d);ul.appendChild(li);
    });
    box.appendChild(ul);
  }
  renderBm($('#bookmarks'));
  renderBm($('#drawer-bookmarks'));
  var res=$('#resume');
  if(res){
    var l=get('last',null);
    if(l){
      res.innerHTML='<a class="btn primary" href="'+l.page+'.html?resume">Продолжить: '+(l.chTitle||l.title)+'</a>';
    }
  }

  /* footnote popovers */
  var pop=null;
  function closePop(){if(pop){pop.remove();pop=null}}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a.nref');
    if(!a){if(!e.target.closest('.pop'))closePop();return}
    e.preventDefault();
    var n=a.dataset.note,li=document.getElementById('n_'+n);
    if(!li){return}
    closePop();
    pop=document.createElement('div');pop.className='pop';pop.setAttribute('role','note');
    var inner=li.querySelector('div').cloneNode(true);var bk=inner.querySelector('a[href^="#ref_"]');if(bk)bk.remove();pop.innerHTML=inner.innerHTML+'<p style="margin-top:.4rem;opacity:.7"><a href="#n_'+n+'">к списку примечаний</a></p>';
    document.body.appendChild(pop);
    var r=a.getBoundingClientRect();
    var x=Math.max(8,Math.min(r.left+scrollX-20,scrollX+document.documentElement.clientWidth-pop.offsetWidth-8));
    pop.style.left=x+'px';pop.style.top=(r.bottom+scrollY+8)+'px';
  });
})();
