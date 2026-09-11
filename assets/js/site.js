/* Abundanc3 Alch3my — shared behaviour (2026-09 redesign)
   Scroll reveal, character reveal, card stack ("deal out"), mobile nav.
   Honours prefers-reduced-motion: reveals instantly, no character fade,
   card stack collapses to a plain list (CSS) and the deal logic never runs. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var reduced = mq.matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    var nav = document.getElementById(toggle.getAttribute('aria-controls'));
    var setOpen = function (open) {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(!document.body.classList.contains('nav-open'));
    });
    if (nav) {
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- Hero video: delayed start, play once, hold last frame ---------- */
  var hv = document.querySelector('[data-hero-video]');
  if (hv) {
    var video = hv.querySelector('video');
    var delay = parseInt(hv.getAttribute('data-delay') || '1500', 10);
    if (video) {
      video.muted = true;
      if (reduced) {
        var still = hv.getAttribute('data-poster-still');
        if (still) video.setAttribute('poster', still);
        video.preload = 'none';
      } else {
        var started = false;
        var start = function () {
          if (started) return;
          started = true;
          setTimeout(function () {
            var pr = video.play();
            if (pr && pr.catch) pr.catch(function () {});
          }, delay);
        };
        if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
        video.addEventListener('ended', function () { hv.classList.add('is-ended'); });
        video.addEventListener('play', function () { hv.classList.remove('is-ended'); });
        hv.addEventListener('click', function () {
          video.currentTime = 0;
          var pr = video.play();
          if (pr && pr.catch) pr.catch(function () {});
        });
      }
    }
  }

  /* ---------- Work cards: flip to the case study ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-flip]'), function (card) {
    var front = card.querySelector('.face-front');
    var back = card.querySelector('.face-back');
    var inner = card.querySelector('.flip-inner');
    var size = function () {
      var face = card.classList.contains('is-flipped') ? back : front;
      if (inner && face) inner.style.height = face.offsetHeight + 'px';
    };
    window.addEventListener('resize', size, { passive: true });
    window.addEventListener('load', size);
    Array.prototype.forEach.call(card.querySelectorAll('img'), function (im) { im.addEventListener('load', size); });
    var setFlipped = function (on) {
      card.classList.toggle('is-flipped', on);
      size();
      if (front) { front.toggleAttribute('inert', on); front.setAttribute('aria-hidden', on ? 'true' : 'false'); }
      if (back) { back.toggleAttribute('inert', !on); back.setAttribute('aria-hidden', on ? 'false' : 'true'); }
      Array.prototype.forEach.call(card.querySelectorAll('[data-flip-btn]'), function (b) { b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
      var target = on ? back : front;
      if (target) {
        var focusable = target.querySelector('[data-flip-btn]');
        if (focusable) focusable.focus({ preventScroll: true });
      }
    };
    setFlipped(false);
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      setFlipped(!card.classList.contains('is-flipped'));
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && card.classList.contains('is-flipped')) setFlipped(false);
    });
  });

  /* ---------- Scroll reveal ---------- */
  var fades = Array.prototype.slice.call(document.querySelectorAll('[data-fade]'));
  var reveal = function (el) { el.classList.add('is-visible'); };
  if (reduced || !('IntersectionObserver' in window)) {
    fades.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '60px', threshold: 0 });
    fades.forEach(function (n) { io.observe(n); });
    setTimeout(function () { fades.forEach(reveal); }, 4000);
  }

  /* ---------- Character reveal ---------- */
  var charEl = document.querySelector('[data-char-reveal]');
  var chars = [];
  if (charEl && !reduced) {
    var text = charEl.textContent;
    charEl.setAttribute('aria-label', text);
    charEl.classList.add('char-reveal');
    charEl.textContent = '';
    var frag = document.createDocumentFragment();
    Array.from(text).forEach(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.opacity = '0.28';
      s.setAttribute('aria-hidden', 'true');
      frag.appendChild(s);
      chars.push(s);
    });
    charEl.appendChild(frag);
  }

  /* ---------- Card stack ---------- */
  var stack = document.querySelector('[data-stack]');
  var wraps = stack ? Array.prototype.slice.call(stack.querySelectorAll('.stack-wrap')) : [];
  var frame = stack ? stack.querySelector('.stack-frame') : null;
  var STEP = 0.03;
  var dealRaf = 0;
  var stackActive = !!(stack && wraps.length && !reduced);

  if (stack && wraps.length && reduced) stack.classList.add('stack--static');

  function stackProgress() {
    var vh = window.innerHeight;
    var sr = stack.getBoundingClientRect();
    var travel = stack.offsetHeight - vh;
    var p = travel > 0 ? (-sr.top) / travel : 0;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function update() {
    var vh = window.innerHeight;

    if (chars.length && charEl) {
      var r = charEl.getBoundingClientRect();
      var startY = vh * 0.8, endY = vh * 0.2;
      var total = (r.top - startY) - (r.bottom - endY);
      var pc = total === 0 ? 1 : (r.top - startY) / total;
      pc = pc < 0 ? 0 : pc > 1 ? 1 : pc;
      var cn = chars.length;
      for (var i = 0; i < cn; i++) {
        var cs = i / cn, ce = (i + 1) / cn;
        var v = pc <= cs ? 0.28 : pc >= ce ? 1 : 0.28 + 0.72 * ((pc - cs) / (ce - cs));
        chars[i].style.opacity = String(v);
      }
    }

    if (!stackActive) return;
    var n = wraps.length;
    var head = wraps[0].firstElementChild.firstElementChild;
    var peek = Math.max(56, (head ? head.offsetHeight : 90) + 10);
    var maxDepth = n - 0.4;
    var maxFrame = vh - maxDepth * peek - 24;
    if (maxFrame > 240) frame.style.height = Math.min(720, Math.max(240, maxFrame)) + 'px';
    var p = stackProgress();
    var span = n - 0.2;
    var cur = p * span - 0.6;
    var behind = Math.max(0, Math.min(maxDepth, n - 1 - cur));
    var base = behind * peek / 2;
    for (var j = 0; j < n; j++) {
      var wrap = wraps[j];
      var card = wrap.firstElementChild;
      if (!card) continue;
      var u = cur - j;
      var y, s, o = 1, gone = false;
      if (u < 0) {
        var d = Math.min(-u, maxDepth);
        y = base - d * peek;
        s = 1 - d * STEP;
      } else if (j === n - 1) {
        y = base; s = 1;
      } else {
        var ex = u <= 0.72 ? 0 : Math.min(1, (u - 0.72) / 0.28);
        y = base + ex * (vh * 0.9);
        s = 1;
        o = ex <= 0.55 ? 1 : Math.max(0, 1 - (ex - 0.55) / 0.4);
        gone = ex >= 1;
      }
      wrap.style.zIndex = String(100 - j);
      card.style.visibility = gone ? 'hidden' : 'visible';
      card.style.opacity = gone ? '0' : String(Math.max(0, Math.min(1, o)));
      card.style.transform = gone ? 'none' : 'translate3d(0,' + y + 'px,0) scale(' + s + ')';
      wrap.setAttribute('aria-hidden', gone ? 'true' : 'false');
    }
  }

  function dealTo(j) {
    if (!stackActive) return;
    var n = wraps.length;
    var span = n - 0.2;
    var p = (j + 0.6) / span;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    var measure = function () {
      var st = stack.getBoundingClientRect().top + window.scrollY;
      var tr = stack.offsetHeight - window.innerHeight;
      return Math.round(st + p * Math.max(0, tr));
    };
    var from = window.scrollY;
    if (Math.abs(measure() - from) < 4) return;
    var dur = Math.min(1200, Math.max(520, Math.abs(measure() - from) * 0.28));
    var t0 = null;
    cancelAnimationFrame(dealRaf);
    var tick = function (ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / dur);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, from + (measure() - from) * e);
      update();
      if (t < 1) dealRaf = requestAnimationFrame(tick);
    };
    dealRaf = requestAnimationFrame(tick);
  }

  if (stackActive) {
    wraps.forEach(function (wrap, j) {
      wrap.style.cursor = 'pointer';
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('role', 'button');
      var name = wrap.querySelector('.h-sub');
      wrap.setAttribute('aria-label', 'Bring card ' + (j + 1) + (name ? ', ' + name.textContent.trim() : '') + ' to the front');
      wrap.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        dealTo(j);
      });
      wrap.addEventListener('keydown', function (e) {
        if (e.target !== wrap) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dealTo(j); }
      });
    });
    var cancelDeal = function () { cancelAnimationFrame(dealRaf); };
    window.addEventListener('wheel', cancelDeal, { passive: true });
    window.addEventListener('touchstart', cancelDeal, { passive: true });
  }

  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  };
  if (chars.length || stackActive) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', update);
    update();
  }
})();
