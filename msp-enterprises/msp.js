/* MSP Enterprises page: Present/Past filter, card tilt, hero parallax.
   Motion is skipped under prefers-reduced-motion; the filter always works. */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Present / Past filter ---------- */
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-era-group]'));
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      groups.forEach(function (g) {
        var show = f === 'all' || g.getAttribute('data-era-group') === f;
        var wasHidden = g.hidden;
        g.hidden = !show;
        if (show && wasHidden && !reduced) {
          g.classList.remove('is-entering');
          void g.offsetWidth;
          g.classList.add('is-entering');
          setTimeout(function () { g.classList.remove('is-entering'); }, 1000);
        }
        if (show) {
          Array.prototype.forEach.call(g.querySelectorAll('[data-fade]'), function (el) { el.classList.add('is-visible'); });
        }
      });
    });
  });

  if (reduced || !finePointer) return;

  /* ---------- Card tilt + light follow ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.venture'), function (card) {
    var inner = card.querySelector('.venture-inner');
    if (!inner) return;
    var raf = 0;
    card.addEventListener('pointermove', function (e) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        inner.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
        inner.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
        inner.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        inner.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', function () {
      cancelAnimationFrame(raf);
      inner.style.setProperty('--rx', '0deg');
      inner.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- Hero collage parallax ---------- */
  var collage = document.querySelector('[data-collage]');
  var hero = collage && collage.closest('.detail-hero');
  if (collage && hero) {
    var frames = Array.prototype.slice.call(collage.querySelectorAll('.frame'));
    var hraf = 0;
    hero.addEventListener('pointermove', function (e) {
      cancelAnimationFrame(hraf);
      hraf = requestAnimationFrame(function () {
        var dx = e.clientX / window.innerWidth - 0.5;
        var dy = e.clientY / window.innerHeight - 0.5;
        frames.forEach(function (f, i) {
          var depth = (i + 1) * 10;
          f.style.setProperty('--px', (dx * depth).toFixed(1) + 'px');
          f.style.setProperty('--py', (dy * depth).toFixed(1) + 'px');
        });
      });
    });
  }
})();
