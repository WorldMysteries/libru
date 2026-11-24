(function(){
  var root=document.documentElement;
  function get(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function getJSON(k,d){try{return JSON.parse(get(k,'')||'null')||d}catch(e){return d}}

  /* theme */
  var themeBtns=document.querySelectorAll('[data-set-theme]');
  function applyTheme(t){
    root.dataset.theme=t;
    themeBtns.forEach(function(b){b.classList.toggle('on',b.dataset.setTheme===t)});
  }
  applyTheme(get('oi-theme','paper'));
  themeBtns.forEach(function(b){b.addEventListener('click',function(){set('oi-theme',b.dataset.setTheme);applyTheme(b.dataset.setTheme)})});

  /* font size */
  var fs=parseInt(get('oi-font','19'),10)||19;
  document.querySelectorAll('[data-font]').forEach(function(b){
    b.addEventListener('click',function(){
      fs=Math.max(14,Math.min(30,fs+parseInt(b.dataset.font,10)*1));
      root.style.setProperty('--fs',fs+'px');set('oi-font',fs);
    });
  });

  /* toast */
  var toast=document.getElementById('toast'),tt;
  function say(m){if(!toast)return;toast.textContent=m;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},2000)}

  var page=document.querySelector('.page[data-slug]');

  /* reading progress */
  var bar=document.querySelector('.progress i');
  function progress(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    var p=h>0?window.scrollY/h:0;
    if(bar)bar.style.width=(Math.min(1,p)*100)+'%';
    return p;
  }

  /* footnotes popover */
  var pop=document.getElementById('pop');
  function closePop(){if(pop)pop.hidden=true}
  document.addEventListener('click',function(ev){
    var a=ev.target.closest&&ev.target.closest('a.fn');
    if(!a){if(pop&&!ev.target.closest('#pop'))closePop();return}
    if(!pop||!a.dataset.note)return;
    ev.preventDefault();
    pop.innerHTML='<b>Примечание '+a.dataset.n+'</b>'+a.dataset.note.replace(/</g,'&lt;');
    pop.hidden=false;
    var r=a.getBoundingClientRect();
    var left=Math.max(12,Math.min(window.innerWidth-pop.offsetWidth-12,r.left+window.scrollX-20));
    pop.style.left=left+'px';
    var top=r.bottom+window.scrollY+8;
    pop.style.top=top+'px';
    if(r.bottom+pop.offsetHeight+16>window.innerHeight){pop.style.top=(r.top+window.scrollY-pop.offsetHeight-8)+'px'}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePop()});

  /* reader-only */
  if(page){
    var slug=page.dataset.slug,title=page.dataset.title;
    var paras=[].slice.call(document.querySelectorAll('.text p[id]'));
    function topPara(){
      var y=96;
      for(var i=0;i<paras.length;i++){var r=paras[i].getBoundingClientRect();if(r.bottom>y)return paras[i]}
      return paras[paras.length-1];
    }
    /* save position */
    var lastSave=0;
    function save(){
      var p=progress();
      var tp=topPara();
      var now=Date.now();
      if(now-lastSave<400)return;lastSave=now;
      set('oi-last',JSON.stringify({slug:slug,title:title,pid:tp?tp.id:null,p:p}));
      if(p>0.96){var read=getJSON('oi-read',{});read[slug]=1;set('oi-read',JSON.stringify(read))}
    }
    window.addEventListener('scroll',save,{passive:true});
    window.addEventListener('resize',progress);
    progress();

    /* bookmark button */
    var bmBtn=document.getElementById('bm');
    if(bmBtn)bmBtn.addEventListener('click',function(){
      var tp=topPara();if(!tp)return;
      var txt=tp.textContent.trim().replace(/\s+/g,' ');
      var list=getJSON('oi-bm',[]);
      list=list.filter(function(b){return b.pid!==tp.id});
      list.unshift({slug:slug,title:title,pid:tp.id,snip:txt.slice(0,110)+(txt.length>110?'…':''),t:Date.now()});
      set('oi-bm',JSON.stringify(list.slice(0,50)));
      document.querySelectorAll('.text p.hl').forEach(function(x){x.classList.remove('hl')});
      tp.classList.add('hl');setTimeout(function(){tp.classList.remove('hl')},1800);
      say('Закладка сохранена');
    });

    /* arrow-key paging at page edges */
    document.addEventListener('keydown',function(e){
      if(e.altKey||e.ctrlKey||e.metaKey)return;
      var el=document.activeElement;if(el&&/input|textarea|select/i.test(el.tagName))return;
      if(e.key==='ArrowRight'){var n=document.querySelector('.nv.next');if(n)location.href=n.href}
      if(e.key==='ArrowLeft'){var p=document.querySelector('.nv.prev');if(p)location.href=p.href}
    });

    /* jump to hash / saved paragraph */
    var h=location.hash.slice(1);
    if(h){var t=document.getElementById(h);if(t){setTimeout(function(){t.scrollIntoView({block:'start'});t.classList.add('hl');setTimeout(function(){t.classList.remove('hl')},2200)},50)}}
    else{
      var last=getJSON('oi-last',null);
      if(last&&last.slug===slug&&last.pid&&last.p>0.02&&last.p<0.96){
        var el=document.getElementById(last.pid);
        if(el)setTimeout(function(){el.scrollIntoView({block:'start'})},50);
      }
    }
  }

  /* home page: resume + read marks + bookmarks list */
  var home=document.querySelector('.home');
  if(home){
    var last=getJSON('oi-last',null);
    var res=document.getElementById('resume');
    if(last&&last.slug&&res){
      res.textContent='Продолжить чтение →';
      res.href=last.slug+'.html'+(last.pid?'#'+last.pid:'');
      res.title=last.title||'';
    }
    var read=getJSON('oi-read',{});
    document.querySelectorAll('.card[data-slug]').forEach(function(c){if(read[c.dataset.slug])c.classList.add('read')});
    var box=document.getElementById('bmbox'),ul=document.getElementById('bmlist');
    function render(){
      var list=getJSON('oi-bm',[]);
      if(!box)return;
      box.hidden=!list.length;ul.innerHTML='';
      list.forEach(function(b,i){
        var li=document.createElement('li');
        var a=document.createElement('a');a.href=b.slug+'.html#'+b.pid;
        var s=document.createElement('small');s.textContent=b.title;
        a.appendChild(s);a.appendChild(document.createTextNode(b.snip));
        var x=document.createElement('button');x.type='button';x.textContent='×';x.title='Удалить закладку';
        x.onclick=function(){var l=getJSON('oi-bm',[]);l.splice(i,1);set('oi-bm',JSON.stringify(l));render()};
        li.appendChild(a);li.appendChild(x);ul.appendChild(li);
      });
    }
    render();
  }
})();
