(function () {
  var KEY = 'zhenitba:';
  function get(k, d) { try { var v = localStorage.getItem(KEY + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }
  var root = document.documentElement;

  // theme
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme-btn') === t ? 'true' : 'false');
    });
  }
  var theme = get('theme', null) || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'paper');
  applyTheme(theme);
  document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
    b.addEventListener('click', function () { theme = b.getAttribute('data-theme-btn'); set('theme', theme); applyTheme(theme); });
  });

  // font size
  var size = get('size', 1.125);
  function applySize() { root.style.setProperty('--fs', size + 'rem'); }
  applySize();
  document.querySelectorAll('[data-size]').forEach(function (b) {
    b.addEventListener('click', function () {
      size = Math.min(1.6, Math.max(0.9, size + (b.getAttribute('data-size') === '+' ? 0.0625 : -0.0625)));
      set('size', size); applySize();
    });
  });

  // reading progress and last position
  var bar = document.getElementById('progress');
  var page = document.body.getAttribute('data-page');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      bar.style.width = (p * 100) + '%';
      if (page) set('last', { page: page, title: document.body.getAttribute('data-title'), y: window.scrollY });
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }
  if (page) {
    var last = get('last', null);
    if (last && last.page === page && location.hash === '' && last.y > 0 && location.search === '?resume') {
      window.scrollTo(0, last.y);
    }
  }

  // bookmarks
  var marks = get('marks', []);
  function has(id) { return marks.some(function (m) { return m.id === id; }); }
  document.querySelectorAll('.bm').forEach(function (b) {
    var id = b.getAttribute('data-id');
    b.setAttribute('aria-pressed', has(id) ? 'true' : 'false');
    b.textContent = has(id) ? '★' : '☆';
    b.addEventListener('click', function () {
      if (has(id)) { marks = marks.filter(function (m) { return m.id !== id; }); }
      else { marks.push({ id: id, url: b.getAttribute('data-url'), title: b.getAttribute('data-title') }); }
      set('marks', marks);
      b.setAttribute('aria-pressed', has(id) ? 'true' : 'false');
      b.textContent = has(id) ? '★' : '☆';
    });
  });

  // index page: bookmark list and "continue reading"
  var list = document.getElementById('bm-list');
  if (list) {
    var empty = document.getElementById('bm-empty');
    var render = function () {
      list.innerHTML = '';
      empty.hidden = marks.length > 0;
      marks.forEach(function (m) {
        var li = document.createElement('li');
        var a = document.createElement('a'); a.href = m.url; a.textContent = m.title;
        var x = document.createElement('button'); x.type = 'button'; x.textContent = 'Убрать';
        x.addEventListener('click', function () { marks = marks.filter(function (k) { return k.id !== m.id; }); set('marks', marks); render(); });
        li.appendChild(a); li.appendChild(x); list.appendChild(li);
      });
    };
    render();
    var last2 = get('last', null), box = document.getElementById('resume');
    if (box && last2 && last2.page && last2.y > 200) {
      var link = document.getElementById('resume-link');
      link.href = last2.page + '?resume'; link.textContent = last2.title;
      box.hidden = false;
    }
  }
})();
