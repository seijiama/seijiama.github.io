(function () {
  var S = window.NV_SECTIONS || [];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

  // nav + home boxes
  $('nav').innerHTML = S.map(function (s) {
    return '<a href="#' + s.id + '" data-sec="' + s.id + '">' + esc(s.short || s.title) + '</a>';
  }).join('');
  $('boxes').innerHTML = S.map(function (s) {
    return '<a class="box" href="#' + s.id + '" aria-label="Open ' + esc(s.title) + ' gallery">' +
      (s.thumb ? '<img src="' + s.thumb + '" alt="" loading="lazy">' : '') +
      '<span class="dim" aria-hidden="true"></span><span class="shade" aria-hidden="true"></span>' +
      '<span class="label"><span class="t">' + esc(s.title) + '</span><span class="k">' + esc(s.kind) + '</span></span></a>';
  }).join('');

  var current = null, lbIndex = -1, lastFocus = null;

  function render() {
    var id = location.hash.slice(1);
    var sec = S.filter(function (s) { return s.id === id; })[0] || null;
    current = sec;
    closeLb(true);
    $('home').hidden = !!sec;
    $('gallery').hidden = !sec;
    Array.prototype.forEach.call(document.querySelectorAll('[data-sec]'), function (a) {
      if (sec && a.getAttribute('data-sec') === sec.id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (sec) {
      document.title = sec.title + ' — netvisuals_';
      $('g-title').textContent = sec.title;
      $('g-sub').innerHTML = sec.num + '&nbsp;&nbsp;' + esc(sec.title) + ' <span>(' + esc(sec.kind) + ')</span>';
      $('g-count').textContent = sec.items.length === 1 ? '1 graphic' : sec.items.length + ' graphics';
      $('g-grid').innerHTML = sec.items.map(function (it, i) {
        return '<button type="button" class="thumb" data-i="' + i + '" aria-label="Expand: ' + esc(it[1]) + '">' +
          '<img src="' + it[0] + '" alt="' + esc(it[1]) + '" loading="lazy"></button>';
      }).join('');
      window.scrollTo(0, 0);
    } else {
      document.title = 'netvisuals_ — Seiji Ma';
      if (id === 'about') { var a = $('about'); if (a) a.scrollIntoView(); }
      else window.scrollTo(0, 0);
    }
  }

  // "About" on a gallery page: jump home's about without leaving the section
  document.addEventListener('click', function (e) {
    var home = e.target.closest('[data-home]');
    if (home) { e.preventDefault(); history.pushState(null, '', location.pathname); render(); return; }
    var about = e.target.closest('a[href="#about"]');
    if (about) { e.preventDefault(); $('about').scrollIntoView(); return; }
    var t = e.target.closest('.thumb');
    if (t) { openLb(+t.getAttribute('data-i')); return; }
    var lb = e.target.closest('[data-lb]');
    if (lb) {
      var a = lb.getAttribute('data-lb');
      if (a === 'close') closeLb(); else step(a === 'next' ? 1 : -1);
    }
  });

  function showLb() {
    var it = current.items[lbIndex];
    $('lb-img').src = it[0];
    $('lb-img').alt = it[1];
    $('lb-pos').textContent = (lbIndex + 1) + ' / ' + current.items.length;
    var multi = current.items.length > 1;
    document.querySelector('.lb-prev').hidden = !multi;
    document.querySelector('.lb-next').hidden = !multi;
  }
  function openLb(i) {
    if (!current) return;
    lastFocus = document.activeElement;
    lbIndex = i; showLb();
    $('lb').hidden = false;
    document.body.style.overflow = 'hidden';
    document.querySelector('.lb-close').focus();
  }
  function closeLb(silent) {
    if ($('lb').hidden) return;
    $('lb').hidden = true;
    document.body.style.overflow = '';
    lbIndex = -1;
    if (!silent && lastFocus) lastFocus.focus();
  }
  function step(d) {
    if (!current || lbIndex < 0) return;
    var n = current.items.length;
    lbIndex = (lbIndex + d + n) % n; showLb();
  }
  document.addEventListener('keydown', function (e) {
    if ($('lb').hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);
  render();
})();
