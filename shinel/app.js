(function () {
  var d = document.documentElement, L = window.localStorage;
  function get(k) { try { return L.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { L.setItem(k, v); } catch (e) {} }
  function theme(t) { d.setAttribute('data-theme', t); set('sh-theme', t); }
  function size(z) { z = Math.max(15, Math.min(30, z)); d.style.setProperty('--fs', z + 'px'); set('sh-size', z); }
  var t = get('sh-theme'), z = parseInt(get('sh-size'), 10);
  if (t) d.setAttribute('data-theme', t);
  if (z) d.style.setProperty('--fs', z + 'px');
  function bms() { try { return JSON.parse(get('sh-bm') || '[]'); } catch (e) { return []; } }
  document.addEventListener('DOMContentLoaded', function () {
    var cur = function () { return parseFloat(getComputedStyle(d).getPropertyValue('--fs')) || 20; };
    document.querySelectorAll('.tools [data-theme]').forEach(function (b) {
      b.addEventListener('click', function () { theme(b.getAttribute('data-theme')); });
    });
    document.getElementById('fm').onclick = function () { size(cur() - 1); };
    document.getElementById('fp').onclick = function () { size(cur() + 1); };
    var bar = document.querySelector('.progress i');
    function prog() { var h = d.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
    addEventListener('scroll', prog, { passive: true }); prog();
    var n = parseInt(document.body.getAttribute('data-part'), 10);
    if (n) {
      set('sh-last', n);
      var b = document.getElementById('bm');
      var draw = function () { var on = bms().indexOf(n) > -1; b.classList.toggle('on', on); b.textContent = on ? '★ Закладка поставлена' : '☆ Поставить закладку'; };
      b.onclick = function () { var a = bms(), i = a.indexOf(n); if (i > -1) a.splice(i, 1); else a.push(n); set('sh-bm', JSON.stringify(a)); draw(); };
      draw();
      document.addEventListener('keydown', function (e) {
        var l = document.querySelector(e.key === 'ArrowLeft' ? '.pv' : e.key === 'ArrowRight' ? '.nx' : '_');
        if (l && !e.altKey && !e.ctrlKey && !e.metaKey) location.href = l.href;
      });
    } else if (document.getElementById('tocl')) {
      var a = bms(), box = document.getElementById('bms'), ul = document.getElementById('bml');
      a.sort(function (x, y) { return x - y; }).forEach(function (k) {
        var li = document.querySelector('#tocl li[data-n="' + k + '"]');
        if (li) ul.appendChild(li.cloneNode(true));
      });
      if (ul.children.length) box.hidden = false;
      var last = parseInt(get('sh-last'), 10), go = document.getElementById('go');
      if (last) { go.href = 'chast-' + last + '.html'; go.textContent = 'Продолжить: часть ' + last + ' →'; }
    }
  });
})();
