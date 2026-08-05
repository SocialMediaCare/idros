/* ============================================================
   IDROS — comportamento
   Nessuna dipendenza esterna: il sito di riferimento non usa
   GSAP né librerie di scroll, e nemmeno noi. Reveal via
   IntersectionObserver, parallasse via rAF.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = function (k) { return window.IDROS_I18N ? window.IDROS_I18N.t(k) : k; };

  /* Contatti — segnaposto, da sostituire con quelli reali */
  var CONFIG = {
    whatsapp: '390000000000',   // formato internazionale, senza +
    email:    'prenotazioni@idros.it'
  };

  /* Corsa del parallasse, misurata sul riferimento:
     l'immagine secondaria va da +35% a -20% della propria altezza. */
  var PARALLAX_FROM = 35;
  var PARALLAX_TO   = -20;

  document.body.classList.add('reveal-ready');

  /* ---------- 1. ANNO ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 2. NAV ---------- */
  var nav = document.getElementById('nav');

  /* ---------- 3. MENU MOBILE ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', T(open ? 'aria.burgerClose' : 'aria.burger'));
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger && burger.getAttribute('aria-expanded') === 'true') {
      setDrawer(false); burger.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
    if (e.matches) setDrawer(false);
  });

  /* ---------- 4. REVEAL ----------
     Stessa partenza del riferimento: opacity 0 / translateY(50px). */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  function revealAll() { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }

  if (REDUCED || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. PARALLASSE ----------
     Le immagini secondarie scorrono più lentamente della pagina:
     è quello che, nel riferimento, tiene "vive" le composizioni
     sfalsate mentre si scorre. */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;

  function updateParallax() {
    ticking = false;
    if (REDUCED) return;
    var vh = window.innerHeight;

    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;   /* fuori portata */

      /* 0 quando l'elemento entra dal basso, 1 quando esce in alto */
      var p = (vh - r.top) / (vh + r.height);
      p = p < 0 ? 0 : (p > 1 ? 1 : p);

      var y = PARALLAX_FROM + (PARALLAX_TO - PARALLAX_FROM) * p;
      el.style.transform = 'translateY(' + y.toFixed(3) + '%)';
    }
  }

  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
    if (!ticking) { ticking = true; window.requestAnimationFrame(updateParallax); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  updateParallax();

  /* ---------- 5b. FAILSAFE ----------
     Se dopo 3s un elemento già a schermo è ancora invisibile
     (observer non partito, errore JS a monte), mostriamo tutto.
     Una pagina senza animazione è sempre meglio di una vuota. */
  setTimeout(function () {
    var broken = revealEls.some(function (el) {
      var r = el.getBoundingClientRect();
      var inView = r.top < window.innerHeight * 0.9 && r.bottom > 0;
      return inView && parseFloat(getComputedStyle(el).opacity) < 0.05;
    });
    if (broken) document.documentElement.classList.add('reveal-force');
  }, 3000);

  /* ---------- 6. GALLERIA: trascinamento col mouse ---------- */
  var gal = document.getElementById('gal');
  if (gal) {
    var down = false, startX = 0, startScroll = 0, moved = false;
    gal.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;      /* il touch scorre già da sé */
      down = true; moved = false;
      startX = e.clientX; startScroll = gal.scrollLeft;
      gal.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      gal.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; gal.style.cursor = '';
    });
    gal.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    gal.style.cursor = 'grab';
  }

  /* ---------- 7. PRENOTAZIONI ---------- */
  var form    = document.getElementById('bookingForm');
  var status  = document.getElementById('formStatus');
  var waBtn   = document.getElementById('waSend');
  var waLink  = document.getElementById('waLink');
  var kindSel = document.getElementById('f-kind');

  if (waLink) waLink.href = 'https://wa.me/' + CONFIG.whatsapp;

  /* I bottoni dell'hero preimpostano il tipo di serata nel modulo */
  document.querySelectorAll('[data-book]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (kindSel) kindSel.value = a.getAttribute('data-book');
    });
  });

  var dateInput = document.getElementById('f-date');
  if (dateInput) {
    var d = new Date();
    var iso = d.getFullYear() + '-' +
              String(d.getMonth() + 1).padStart(2, '0') + '-' +
              String(d.getDate()).padStart(2, '0');
    dateInput.min = iso;
    if (!dateInput.value) dateInput.value = iso;
  }

  function fieldOf(input) { return input.closest('.field'); }

  function setError(input, msgKey) {
    var f = fieldOf(input);
    if (!f) return;
    var err = f.querySelector('[data-err-for="' + input.id + '"]');
    if (msgKey) {
      f.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (err) { err.textContent = T(msgKey); err.hidden = false; }
    } else {
      f.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (err) { err.textContent = ''; err.hidden = true; }
    }
  }

  function validate() {
    if (!form) return { ok: false, first: null };
    var first = null, ok = true;
    function fail(input, key) { setError(input, key); ok = false; if (!first) first = input; }

    var name    = form.querySelector('#f-name');
    var phone   = form.querySelector('#f-phone');
    var email   = form.querySelector('#f-email');
    var date    = form.querySelector('#f-date');
    var time    = form.querySelector('#f-time');
    var guests  = form.querySelector('#f-guests');
    var privacy = form.querySelector('#f-privacy');

    [name, time].forEach(function (el) {
      if (!el) return;
      if (!el.value.trim()) fail(el, 'msg.required'); else setError(el, null);
    });

    if (phone) {
      var digits = phone.value.replace(/[^\d]/g, '');
      if (!phone.value.trim()) fail(phone, 'msg.required');
      else if (digits.length < 8) fail(phone, 'msg.phone');
      else setError(phone, null);
    }

    if (email) {
      if (!email.value.trim()) fail(email, 'msg.required');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) fail(email, 'msg.email');
      else setError(email, null);
    }

    if (date) {
      if (!date.value) fail(date, 'msg.required');
      else if (date.min && date.value < date.min) fail(date, 'msg.date');
      else setError(date, null);
    }

    if (guests) {
      var n = parseInt(guests.value, 10);
      if (!guests.value) fail(guests, 'msg.required');
      else if (isNaN(n) || n < 1 || n > 40) fail(guests, 'msg.guests');
      else setError(guests, null);
    }

    if (privacy) {
      if (!privacy.checked) fail(privacy, 'msg.privacy'); else setError(privacy, null);
    }

    return { ok: ok, first: first };
  }

  function collect() {
    var get = function (id) {
      var el = form.querySelector('#' + id);
      return el ? el.value.trim() : '';
    };
    var kindLabel = kindSel && kindSel.selectedOptions[0]
      ? kindSel.selectedOptions[0].textContent.trim() : '';

    var L = document.documentElement.lang === 'en'
      ? { n:'Name', p:'Phone', e:'Email', d:'Date', t:'Time', g:'Guests', k:'Evening', no:'Notes' }
      : { n:'Nome', p:'Telefono', e:'Email', d:'Data', t:'Ora', g:'Coperti', k:'Serata', no:'Note' };

    var lines = [
      L.n + ': ' + get('f-name'),
      L.p + ': ' + get('f-phone'),
      L.e + ': ' + get('f-email'),
      L.d + ': ' + get('f-date'),
      L.t + ': ' + get('f-time'),
      L.g + ': ' + get('f-guests'),
      L.k + ': ' + kindLabel
    ];
    var notes = get('f-notes');
    if (notes) lines.push(L.no + ': ' + notes);
    return lines.join('\n');
  }

  function say(key, isError) {
    if (!status) return;
    status.textContent = T(key);
    status.classList.toggle('is-error', !!isError);
  }

  function focusFirst(first) {
    if (!first) return;
    first.focus();
    first.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
  }

  if (form) {
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () {
        var f = fieldOf(el);
        if (f && f.classList.contains('is-invalid')) validate();
      });
      el.addEventListener('input', function () {
        var f = fieldOf(el);
        if (f && f.classList.contains('is-invalid')) setError(el, null);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = validate();
      if (!v.ok) { say('msg.fix', true); focusFirst(v.first); return; }
      say('msg.opening', false);
      window.location.href = 'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent(T('msg.subject')) +
        '&body=' + encodeURIComponent(collect());
    });

    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var v = validate();
        if (!v.ok) { say('msg.fix', true); focusFirst(v.first); return; }
        say('msg.wa', false);
        window.open('https://wa.me/' + CONFIG.whatsapp +
          '?text=' + encodeURIComponent(T('msg.subject') + '\n\n' + collect()),
          '_blank', 'noopener');
      });
    }
  }

  document.addEventListener('idros:lang', function () {
    if (form && form.querySelector('.field.is-invalid')) validate();
    if (burger) {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-label', T(open ? 'aria.burgerClose' : 'aria.burger'));
    }
  });

  /* ---------- 8. SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();
