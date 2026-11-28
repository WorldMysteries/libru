(function () {
  'use strict';
  var LS = {
    get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var CH = window.GB_CHAPTERS || [];
  var root = document.documentElement;

  /* ---------- settings ---------- */
  var S = Object.assign({ theme: 'paper', size: 19, width: 36 }, LS.get('gb:settings', {}));
  function applySettings() {
    root.setAttribute('data-theme', S.theme);
    root.style.setProperty('--fs', S.size + 'px');
    root.style.setProperty('--measure', S.width + 'rem');
    LS.set('gb:settings', S);
  }
  applySettings();

  function buildPanel() {
    var top = document.querySelector('.top'); if (!top) return;
    var btn = document.getElementById('set-btn');
    var p = document.createElement('div');
    p.className = 'panel'; p.id = 'panel';
    p.innerHTML =
      '<h2>Тема</h2><div class="row" data-k="theme">' +
      '<button class="opt paper" data-v="paper">Бумага</button><button class="opt sepia" data-v="sepia">Сепия</button><button class="opt night" data-v="night">Ночь</button></div>' +
      '<h2>Размер шрифта</h2><div class="row" data-k="size">' +
      '<button class="opt" data-v="-1" aria-label="Меньше">A−</button><button class="opt" data-v="0">Сброс</button><button class="opt" data-v="1" aria-label="Больше">A+</button></div>' +
      '<h2>Ширина строки</h2><div class="row" data-k="width">' +
      '<button class="opt" data-v="30">Узкая</button><button class="opt" data-v="36">Средняя</button><button class="opt" data-v="44">Широкая</button></div>';
    top.appendChild(p);
    function sync() {
      p.querySelectorAll('[data-k="theme"] .opt').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === S.theme); });
      p.querySelectorAll('[data-k="width"] .opt').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.v === S.width); });
    }
    p.addEventListener('click', function (e) {
      var b = e.target.closest('.opt'); if (!b) return;
      var k = b.parentNode.dataset.k, v = b.dataset.v;
      if (k === 'theme') S.theme = v;
      if (k === 'width') S.width = +v;
      if (k === 'size') S.size = v === '0' ? 19 : Math.max(15, Math.min(28, S.size + (+v) * 1));
      applySettings(); sync();
    });
    btn.addEventListener('click', function (e) { e.stopPropagation(); var o = p.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    document.addEventListener('click', function (e) { if (!p.contains(e.target) && e.target !== btn) { p.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') p.classList.remove('open'); });
    sync();
  }

  /* ---------- storage helpers ---------- */
  function bms() { return LS.get('gb:bm', {}); }
  function nts() { return LS.get('gb:notes', {}); }
  function excerpt(t) { t = t.replace(/\s+/g, ' ').trim(); return t.length > 160 ? t.slice(0, 157).replace(/\s\S*$/, '') + '…' : t; }

  /* ---------- reader ---------- */
  function initReader() {
    var text = document.querySelector('.text'); if (!text) return;
    var ch = +text.dataset.ch;
    var paras = Array.prototype.slice.call(text.querySelectorAll('p[id]'));
    var bar = document.querySelector('.progress');
    var icoBm = '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
    var icoNote = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';

    paras.forEach(function (p) {
      var t = document.createElement('span');
      t.className = 'tools';
      t.innerHTML = '<button type="button" class="b-bm" aria-label="Закладка" title="Закладка" aria-pressed="false">' + icoBm + '</button>' +
                    '<button type="button" class="b-nt" aria-label="Заметка" title="Заметка">' + icoNote + '</button>';
      p.appendChild(t);
    });

    function refresh(p) {
      var id = p.id, B = bms(), N = nts();
      var isB = !!B[id];
      p.classList.toggle('bm', isB);
      p.classList.toggle('has-note', !!N[id]);
      var tools = p.querySelector('.tools');
      tools.classList.toggle('show', isB);
      tools.querySelector('.b-bm').setAttribute('aria-pressed', isB);
      var nxt = p.nextElementSibling;
      if (nxt && nxt.classList.contains('note-box') && !nxt.dataset.editing) nxt.remove();
      if (N[id] && !(p.nextElementSibling && p.nextElementSibling.classList.contains('note-box'))) {
        var v = document.createElement('div');
        v.className = 'note-box note-view'; v.textContent = N[id].note; v.title = 'Нажмите, чтобы изменить';
        v.addEventListener('click', function () { edit(p); });
        p.after(v);
      }
    }
    function plain(p) { var c = p.cloneNode(true); c.querySelectorAll('.tools,sup').forEach(function (x) { x.remove(); }); return c.textContent; }
    function edit(p) {
      var id = p.id, N = nts();
      var old = p.nextElementSibling;
      if (old && old.classList.contains('note-box')) old.remove();
      var box = document.createElement('div');
      box.className = 'note-box'; box.dataset.editing = '1';
      box.innerHTML = '<textarea aria-label="Текст заметки" placeholder="Ваша заметка к этому абзацу"></textarea><div class="acts"><button type="button" class="s">Сохранить</button><button type="button" class="g c">Отмена</button>' + (N[id] ? '<button type="button" class="g d">Удалить</button>' : '') + '</div>';
      var ta = box.querySelector('textarea'); ta.value = N[id] ? N[id].note : '';
      p.after(box); ta.focus();
      box.querySelector('.s').onclick = function () {
        var val = ta.value.trim(), M = nts();
        if (val) M[id] = { ch: ch, text: excerpt(plain(p)), note: val, ts: Date.now() }; else delete M[id];
        LS.set('gb:notes', M); box.remove(); refresh(p);
      };
      box.querySelector('.c').onclick = function () { box.remove(); refresh(p); };
      var d = box.querySelector('.d');
      if (d) d.onclick = function () { var M = nts(); delete M[id]; LS.set('gb:notes', M); box.remove(); refresh(p); };
    }
    paras.forEach(refresh);

    var active = null;
    text.addEventListener('click', function (e) {
      var bBm = e.target.closest('.b-bm'), bNt = e.target.closest('.b-nt');
      var p = e.target.closest('p[id]'); if (!p) return;
      if (e.target.closest('a')) return;
      if (bBm) {
        var B = bms();
        if (B[p.id]) delete B[p.id]; else B[p.id] = { ch: ch, text: excerpt(plain(p)), ts: Date.now() };
        LS.set('gb:bm', B); refresh(p); return;
      }
      if (bNt) { edit(p); return; }
      if (window.getSelection && String(window.getSelection())) return;
      if (active && active !== p) active.classList.remove('active');
      p.classList.toggle('active'); active = p.classList.contains('active') ? p : null;
    });

    /* hash highlight */
    function goHash() {
      var id = location.hash.slice(1); if (!id) return;
      var el = document.getElementById(id);
      if (el && el.tagName === 'P') { el.classList.add('hl'); setTimeout(function () { el.classList.remove('hl'); }, 2500); }
    }
    window.addEventListener('hashchange', goHash); goHash();

    /* progress + position */
    var tick = false;
    function onScroll() {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
        var pct = max > 0 ? Math.min(1, h.scrollTop / max) : 1;
        if (bar) bar.style.width = (pct * 100) + '%';
        var cur = paras[0];
        for (var i = 0; i < paras.length; i++) { if (paras[i].getBoundingClientRect().top > 90) break; cur = paras[i]; }
        LS.set('gb:pos', { ch: ch, pid: cur ? cur.id : null, pct: pct, ts: Date.now() });
        if (pct > 0.96) { var R = LS.get('gb:read', {}); if (!R[ch]) { R[ch] = 1; LS.set('gb:read', R); } }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    /* footnote popovers */
    var pop = null;
    function closePop() { if (pop) { pop.remove(); pop = null; } }
    text.addEventListener('click', function (e) {
      var a = e.target.closest('sup.fn a'); if (!a) { if (!e.target.closest('.pop')) closePop(); return; }
      e.preventDefault(); closePop();
      pop = document.createElement('div'); pop.className = 'pop';
      pop.innerHTML = '<span></span><a href="' + a.getAttribute('href') + '">Все примечания</a>';
      pop.firstChild.textContent = a.dataset.note;
      document.body.appendChild(pop);
      var r = a.getBoundingClientRect();
      pop.style.top = (window.scrollY + r.bottom + 8) + 'px';
      pop.style.left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, window.scrollX + r.left - 20)) + 'px';
    });
    document.addEventListener('click', function (e) { if (pop && !e.target.closest('.pop') && !e.target.closest('sup.fn')) closePop(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
  }

  /* ---------- index: continue + read marks ---------- */
  function initIndex() {
    var btn = document.getElementById('continue'); if (!btn) return;
    var pos = LS.get('gb:pos', null);
    if (pos && pos.ch) {
      var n = ('0' + pos.ch).slice(-2);
      btn.href = 'chapter-' + n + '.html' + (pos.pid ? '#' + pos.pid : '');
      btn.textContent = 'Продолжить: глава ' + (CH[pos.ch - 1] || pos.ch);
      btn.hidden = false;
    }
    var R = LS.get('gb:read', {});
    document.querySelectorAll('.chlist a').forEach(function (a) { if (R[a.dataset.ch]) a.classList.add('done'); });
  }

  /* ---------- my page ---------- */
  function initMine() {
    var box = document.getElementById('mine'); if (!box) return;
    function link(it, id) { return 'chapter-' + ('0' + it.ch).slice(-2) + '.html#' + id; }
    function render() {
      var B = bms(), N = nts();
      function sect(title, obj, withNote) {
        var ids = Object.keys(obj).sort(function (a, b) { return obj[b].ts - obj[a].ts; });
        var h = '<h2>' + title + ' <span class="empty">(' + ids.length + ')</span></h2>';
        if (!ids.length) return h + '<p class="empty">' + (withNote ? 'Заметок пока нет. В читалке нажмите на абзац и выберите значок карандаша.' : 'Закладок пока нет. В читалке нажмите на абзац и выберите значок закладки.') + '</p>';
        return h + ids.map(function (id) {
          var it = obj[id];
          return '<div class="item"><div class="meta"><a href="' + link(it, id) + '">Глава ' + (CH[it.ch - 1] || it.ch) + '</a><span>' + new Date(it.ts).toLocaleDateString('ru-RU') + '</span><button data-id="' + id + '" data-kind="' + (withNote ? 'n' : 'b') + '">Удалить</button></div><q></q>' + (withNote ? '<div class="nt"></div>' : '') + '</div>';
        }).join('');
      }
      box.innerHTML = sect('Закладки', B, false) + sect('Заметки', N, true);
      var qs = box.querySelectorAll('.item');
      var ordB = Object.keys(B).sort(function (a, b) { return B[b].ts - B[a].ts; });
      var ordN = Object.keys(N).sort(function (a, b) { return N[b].ts - N[a].ts; });
      var k = 0;
      ordB.forEach(function (id) { qs[k++].querySelector('q').textContent = B[id].text; });
      ordN.forEach(function (id) { var el = qs[k++]; el.querySelector('q').textContent = N[id].text; el.querySelector('.nt').textContent = N[id].note; });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-id]'); if (!b) return;
      var key = b.dataset.kind === 'n' ? 'gb:notes' : 'gb:bm', O = LS.get(key, {});
      delete O[b.dataset.id]; LS.set(key, O); render();
    });
    var ex = document.getElementById('export');
    if (ex) ex.addEventListener('click', function () {
      var B = bms(), N = nts(), out = 'Гранатовый браслет — мои закладки и заметки\n\n';
      Object.keys(B).forEach(function (id) { out += '[Закладка, глава ' + (CH[B[id].ch - 1] || B[id].ch) + '] ' + B[id].text + '\n\n'; });
      Object.keys(N).forEach(function (id) { out += '[Заметка, глава ' + (CH[N[id].ch - 1] || N[id].ch) + '] ' + N[id].text + '\n→ ' + N[id].note + '\n\n'; });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([out], { type: 'text/plain;charset=utf-8' }));
      a.download = 'granatovyi-braslet-zametki.txt'; a.click();
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildPanel(); initReader(); initIndex(); initMine();
  });
})();
