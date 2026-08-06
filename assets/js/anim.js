/* ============================================================
   IDROS — livello cinematico
   GSAP + ScrollTrigger + Lenis, caricati da CDN prima di questo file.
   Se una delle due librerie non risponde il file esce subito e la
   pagina resta quella statica di main.js: nessuna schermata vuota.
   ============================================================ */
(function () {
  'use strict';

  var doc = document.documentElement;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Se GSAP non c'è, o l'utente ha chiesto meno movimento,
     togliamo gli stati iniziali messi dallo script inline e usciamo. */
  if (REDUCED || !window.gsap || !window.ScrollTrigger) {
    doc.classList.remove('gsap-on', 'is-loading');
    var l = document.getElementById('loader');
    if (l) l.remove();
    document.querySelectorAll('.loader__panel').forEach(function (p) { p.remove(); });
    return;
  }

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  doc.classList.add('anim-ready');

  var EASE = 'expo.out';

  /* ============================================================
     1. SCORRIMENTO INERZIALE (Lenis)
     ============================================================ */
  var lenis = null;

  if (window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      infinite: false
    });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* main.js e il drawer usano questi due ganci invece di toccare
     direttamente window.scrollTo, che con Lenis non funziona. */
  window.IDROS_SCROLL = function (target) {
    if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.25 });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  window.IDROS_LOCK = function (locked) {
    if (!lenis) return;
    if (locked) lenis.stop(); else lenis.start();
  };

  /* ============================================================
     2. TESTO IN RIGHE
     Ogni riga entra da sotto la propria maschera. Le righe vanno
     ricalcolate quando cambia la lingua: i18n riscrive l'innerHTML.
     ============================================================ */
  function splitLines(el) {
    var source = el.getAttribute('data-split-src');
    if (source === null) {
      source = el.textContent.replace(/\s+/g, ' ').trim();
      el.setAttribute('data-split-src', source);
    }

    /* passo 1: una parola per span, per misurare dove va a capo */
    el.textContent = '';
    var words = source.split(' ');
    var probes = [];
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = w;
      el.appendChild(s);
      probes.push(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });

    var groups = [], current = null, lastTop = null;
    probes.forEach(function (s) {
      var top = s.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        lastTop = top; current = []; groups.push(current);
      }
      current.push(s.textContent);
    });

    /* passo 2: una maschera per riga */
    el.textContent = '';
    var inners = [];
    groups.forEach(function (g) {
      var line = document.createElement('span');
      line.className = 'line';
      var inner = document.createElement('span');
      inner.className = 'line__in';
      inner.textContent = g.join(' ');
      line.appendChild(inner);
      el.appendChild(line);
      inners.push(inner);
    });
    return inners;
  }

  /* A fine animazione la maschera va tolta: se la finestra cambia
     larghezza il testo si rimpagina e con overflow:hidden verrebbe
     tagliato a metà riga. */
  function unmask(el) {
    el.querySelectorAll('.line').forEach(function (n) { n.style.overflow = 'visible'; });
  }

  /* ============================================================
     3. PRELOADER
     ============================================================ */
  function intro(done) {
    var loader = document.getElementById('loader');
    if (!loader) { doc.classList.remove('is-loading'); done(); return; }

    var brand = loader.querySelectorAll('.loader__brand span');
    var bar = loader.querySelector('.loader__bar i');
    var pct = loader.querySelector('.loader__pct');
    var panels = document.querySelectorAll('.loader__panel');
    var counter = { v: 0 };

    if (lenis) lenis.stop();

    var tl = gsap.timeline({
      onComplete: function () {
        loader.remove();
        panels.forEach(function (p) { p.remove(); });
        doc.classList.remove('is-loading');
        if (lenis) lenis.start();
        done();
      }
    });

    tl.to(brand, { y: '0%', opacity: 1, duration: .9, stagger: .05, ease: EASE })
      .to(bar, { right: '0%', duration: 1.5, ease: 'power2.inOut' }, .15)
      .to(counter, {
        v: 100, duration: 1.5, ease: 'power2.inOut',
        onUpdate: function () { if (pct) pct.textContent = String(Math.round(counter.v)).padStart(3, '0'); }
      }, .15)
      .to(loader.querySelector('.loader__inner'), { opacity: 0, y: -20, duration: .5, ease: 'power2.in' }, '+=0.15')
      .set(loader, { autoAlpha: 0 })
      .to(panels[0], { yPercent: -100, duration: 1.1, ease: EASE }, '<')
      .to(panels[1], { yPercent: 100, duration: 1.1, ease: EASE }, '<');
  }

  /* ============================================================
     4. HERO
     ============================================================ */
  function heroIn() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var title = hero.querySelector('.hero__title');
    var lines = title ? splitLines(title) : [];
    if (title) gsap.set(title, { opacity: 1 });

    var tl = gsap.timeline({ defaults: { ease: EASE } });

    tl.from(hero.querySelector('.hero__media'), { scale: 1.18, duration: 1.8, ease: 'power2.out' }, 0)
      .to(lines, { y: '0%', duration: 1.25, stagger: .09, onComplete: function () { if (title) unmask(title); } }, .25)
      .from(hero.querySelectorAll('.hero__sub'), { y: 24, opacity: 0, duration: .9 }, .55)
      .from(hero.querySelectorAll('.booking .ghost'), { y: 26, opacity: 0, duration: .8, stagger: .07 }, .45)
      .from(hero.querySelector('.scrollcue'), { opacity: 0, y: 14, duration: .7 }, .9)
      .from('.nav__inner > *', { y: -18, opacity: 0, duration: .8, stagger: .06 }, .1);
  }

  /* La foto dell'hero resta indietro e si scurisce mentre si scende */
  function heroScroll() {
    var media = document.querySelector('.hero__media');
    var foot = document.querySelector('.hero__foot');
    if (!media) return;

    gsap.to(media, {
      yPercent: 22, scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    if (foot) {
      gsap.to(foot, {
        yPercent: -55, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ============================================================
     5. ANIMAZIONI ALLO SCORRIMENTO
     ============================================================ */
  function buildReveals(scope) {
    scope = scope || document;

    /* 5a — titoli e testi in righe mascherate */
    scope.querySelectorAll('[data-anim="lines"]').forEach(function (el) {
      var lines = splitLines(el);
      gsap.set(el, { opacity: 1 });
      gsap.to(lines, {
        y: '0%', duration: 1.15, stagger: .085, ease: EASE,
        onComplete: function () { unmask(el); },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* 5b — blocchi che salgono */
    scope.querySelectorAll('[data-anim="rise"]').forEach(function (el) {
      gsap.fromTo(el, { y: 46, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* 5c — dissolvenze semplici */
    scope.querySelectorAll('[data-anim="fade"]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    /* 5d — liste ed elenchi, un elemento dopo l'altro */
    scope.querySelectorAll('[data-anim="stagger"]').forEach(function (el) {
      gsap.fromTo(el.children, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, stagger: .08, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    /* 5e — immagini che si aprono da una fessura */
    scope.querySelectorAll('[data-anim="unveil"]').forEach(function (el) {
      var label = el.querySelector('.media__label');
      var shot = el.querySelector('img, video');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
      tl.fromTo(el,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: EASE });
      /* la foto parte ingrandita e rientra: senza, l'apertura sembra una tendina */
      if (shot) tl.fromTo(shot, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: EASE }, 0);
      if (label) tl.to(label, { opacity: 1, duration: .6 }, .8);
    });
  }

  /* ============================================================
     6. PARALLASSE
     Sostituisce quella a rAF di main.js: qui è agganciata a
     ScrollTrigger, quindi in fase con Lenis.
     ============================================================ */
  function parallax() {
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var depth = parseFloat(el.getAttribute('data-depth')) || 1;
      gsap.fromTo(el, { yPercent: 14 * depth }, {
        yPercent: -14 * depth, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  }

  /* ============================================================
     7. SEZIONE A TUTTA PAGINA
     La parola gigante si ingrandisce e sfila mentre la foto
     rallenta dietro: è il momento più alto della pagina.
     ============================================================ */
  function bleed() {
    var sec = document.querySelector('.sec--bleed');
    if (!sec) return;
    var media = sec.querySelector('.bleed__media');
    var body = sec.querySelector('.bleed__body');
    var word = sec.querySelector('.h2--xl');

    var tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
    if (media) tl.fromTo(media, { yPercent: -12, scale: 1.15 }, { yPercent: 12, scale: 1, ease: 'none' }, 0);
    if (word) tl.fromTo(word, { scale: .82, letterSpacing: '.12em' }, { scale: 1.06, letterSpacing: '0em', ease: 'none' }, 0);
    if (body) tl.fromTo(body, { opacity: .35 }, { opacity: 1, ease: 'none', duration: .5 }, 0);
  }

  /* ============================================================
     8. FASCIA DI TESTO SCORREVOLE
     Va da sola, accelera con lo scorrimento e cambia verso
     quando si risale: dà l'impressione che la pagina abbia un motore.
     ============================================================ */
  function marquee() {
    var track = document.querySelector('.marquee__track');
    if (!track) return;
    var group = track.querySelector('.marquee__group');
    if (!group) return;

    var width = group.offsetWidth;
    var x = 0, dir = -1, base = .55;

    /* duplichiamo finché la fascia non copre due volte lo schermo */
    while (track.offsetWidth < window.innerWidth * 2) {
      track.appendChild(group.cloneNode(true));
    }

    gsap.ticker.add(function () {
      var v = lenis ? Math.min(Math.abs(lenis.velocity || 0) * .06, 6) : 0;
      if (lenis && lenis.direction) dir = lenis.direction === 1 ? -1 : 1;
      x += (base + v) * dir;
      if (x <= -width) x += width;
      if (x >= 0) x -= width;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    });

    window.addEventListener('resize', function () { width = group.offsetWidth; }, { passive: true });
  }

  /* ============================================================
     9. GALLERIA
     Scorre in orizzontale seguendo lo scorrimento verticale.
     Al primo trascinamento manuale il collegamento si stacca:
     comanda l'utente, non la pagina.
     ============================================================ */
  function gallery() {
    var gal = document.getElementById('gal');
    if (!gal) return;
    var manual = false;
    gal.addEventListener('pointerdown', function () { manual = true; });
    gal.addEventListener('wheel', function () { manual = true; }, { passive: true });

    ST.create({
      trigger: gal.closest('.sec--gallery') || gal,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: function (self) {
        if (manual) return;
        var max = gal.scrollWidth - gal.clientWidth;
        if (max <= 0) return;
        gal.scrollLeft = max * self.progress;
      }
    });

    /* inclinazione sulla velocità: le foto "sbandano" appena */
    var items = gal.querySelectorAll('.gal__p, .gal__l');
    var setters = Array.prototype.map.call(items, function (el) {
      return gsap.quickTo(el, 'skewY', { duration: .5, ease: 'power3.out' });
    });
    gsap.ticker.add(function () {
      var v = lenis ? gsap.utils.clamp(-6, 6, (lenis.velocity || 0) * .05) : 0;
      setters.forEach(function (s) { s(v); });
    });
  }

  /* ============================================================
     10. CURSORE
     ============================================================ */
  function cursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var el = document.getElementById('cursor');
    if (!el) return;

    doc.classList.add('has-cursor');
    var dot = el.querySelector('.cursor__dot');
    var ring = el.querySelector('.cursor__ring');
    var label = el.querySelector('.cursor__label');

    var xDot = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' });
    var yDot = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
    var xRing = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' });
    var yRing = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });

    gsap.set([dot, ring], { xPercent: 0, yPercent: 0 });

    window.addEventListener('pointermove', function (e) {
      xDot(e.clientX); yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);
    }, { passive: true });

    document.addEventListener('pointerdown', function () { gsap.to(ring, { scale: .78, duration: .25 }); });
    document.addEventListener('pointerup', function () { gsap.to(ring, { scale: 1, duration: .3 }); });

    /* l'anello si allarga sui bersagli e mostra una parola sulle foto */
    var hot = 'a, button, summary, input, select, textarea, .ql__card, .gal__p, .gal__l, .event';
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest(hot);
      if (!t) return;
      var word = t.getAttribute('data-cursor');
      gsap.to(ring, { scale: word ? 2.2 : 1.7, borderColor: 'rgba(255,255,255,.95)', duration: .35, ease: EASE });
      gsap.to(dot, { scale: word ? 0 : .4, duration: .3 });
      if (word && label) { label.textContent = word; gsap.to(label, { opacity: 1, duration: .3 }); }
    });
    document.addEventListener('pointerout', function (e) {
      if (!e.target.closest(hot)) return;
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hot)) return;
      gsap.to(ring, { scale: 1, borderColor: 'rgba(255,255,255,.7)', duration: .35, ease: EASE });
      gsap.to(dot, { scale: 1, duration: .3 });
      if (label) gsap.to(label, { opacity: 0, duration: .2 });
    });
    document.addEventListener('pointerleave', function () { gsap.to(el, { opacity: 0, duration: .2 }); });
    document.addEventListener('pointerenter', function () { gsap.to(el, { opacity: 1, duration: .2 }); });
  }

  /* ============================================================
     11. BOTTONI MAGNETICI
     ============================================================ */
  function magnetic() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.ghost, .link, .social a, .nav__reserve').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: .6, ease: EASE });
      var yTo = gsap.quickTo(el, 'y', { duration: .6, ease: EASE });
      var pull = el.classList.contains('ghost') ? .28 : .2;

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * pull);
        yTo((e.clientY - (r.top + r.height / 2)) * pull);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ============================================================
     12. NAV E BARRA DI AVANZAMENTO
     ============================================================ */
  function navBar() {
    var nav = document.getElementById('nav');
    var bar = document.getElementById('progress');

    if (bar) {
      gsap.to(bar, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: .3 }
      });
    }
    if (!nav) return;

    ST.create({
      start: 'top -80', end: 'max',
      onUpdate: function (self) {
        var down = self.direction === 1;
        var drawerOpen = document.getElementById('drawer') && !document.getElementById('drawer').hidden;
        nav.classList.toggle('is-hidden', down && !drawerOpen && self.scroll() > 300);
      }
    });
  }

  /* ============================================================
     13. FAQ — apertura fluida
     `details` apre di scatto: qui l'altezza viene animata a mano.
     ============================================================ */
  function faq() {
    document.querySelectorAll('.faq__item').forEach(function (item) {
      var summary = item.querySelector('summary');
      var body = item.querySelector('p');
      if (!summary || !body) return;

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        var open = item.hasAttribute('open');

        if (open) {
          gsap.to(body, {
            height: 0, opacity: 0, duration: .45, ease: 'power2.inOut',
            onComplete: function () { item.removeAttribute('open'); gsap.set(body, { height: 'auto' }); }
          });
        } else {
          item.setAttribute('open', '');
          gsap.fromTo(body,
            { height: 0, opacity: 0 },
            {
              height: 'auto', opacity: 1, duration: .55, ease: EASE,
              onComplete: function () { ST.refresh(); }
            });
        }
      });
    });
  }

  /* ============================================================
     14. MARCHIO DEL PIÈ DI PAGINA
     ============================================================ */
  function footerMark() {
    var mark = document.querySelector('.footer__mark');
    if (!mark) return;
    gsap.fromTo(mark, { yPercent: 30 }, {
      yPercent: -6, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
    });
  }

  /* ============================================================
     15. SEZIONI: velo che si dissolve entrando
     ============================================================ */
  function sections() {
    document.querySelectorAll('.sec:not(.sec--hero)').forEach(function (sec) {
      gsap.fromTo(sec, { opacity: .45 }, {
        opacity: 1, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 62%', scrub: true }
      });
    });
  }

  /* ============================================================
     16. AVVIO
     ============================================================ */
  function start() {
    heroIn();
    heroScroll();
    buildReveals();
    parallax();
    bleed();
    marquee();
    gallery();
    cursor();
    magnetic();
    navBar();
    faq();
    footerMark();
    sections();
    ST.refresh();
  }

  /* Aspettiamo i font: se le metriche cambiano dopo lo split,
     le righe finiscono fuori dalla loro maschera. */
  function boot() {
    intro(start);
  }

  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise(function (r) { setTimeout(r, 2500); })
    ]).then(boot);
  } else {
    boot();
  }

  /* Cambio lingua: i18n riscrive l'innerHTML e cancella le righe.
     Le ricostruiamo già visibili — l'animazione l'abbiamo già vista. */
  document.addEventListener('idros:lang', function () {
    document.querySelectorAll('[data-anim="lines"], .hero__title').forEach(function (el) {
      el.removeAttribute('data-split-src');
      var lines = splitLines(el);
      gsap.set(el, { opacity: 1 });
      gsap.set(lines, { y: '0%' });
      unmask(el);
    });
    ST.refresh();
  });

  /* Rimpaginazione: le righe restano, ma i trigger vanno rimisurati */
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { ST.refresh(); }, 220);
  }, { passive: true });
})();
