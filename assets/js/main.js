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

  /* Quando anim.js è riuscito a partire, reveal, parallasse e
     scorrimento passano a lui: qui restano solo i fallback. */
  var CINEMATIC = document.documentElement.classList.contains('anim-ready');

  /* Casella a cui arrivano le richieste scritte dal modulo */
  var CONFIG = {
    email: 'info@idrosmilanomarittima.it'
  };

  /* Corsa del parallasse, misurata sul riferimento:
     l'immagine secondaria va da +35% a -20% della propria altezza. */
  var PARALLAX_FROM = 35;
  var PARALLAX_TO   = -20;

  document.body.classList.add('reveal-ready');

  /* ---------- 1. LOGO ----------
     La scritta di riserva sparisce solo a immagine effettivamente
     caricata: così un file mancante o corrotto non lascia il posto vuoto. */
  document.querySelectorAll('.nav__logoimg, .footer__logoimg').forEach(function (img) {
    var mostra = function () { img.closest('a').classList.add('has-logo'); };
    if (img.complete && img.naturalWidth > 0) mostra();
    else img.addEventListener('load', mostra);
  });

  /* ---------- 1b. ANNO ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 2. NAV ---------- */
  var nav = document.getElementById('nav');

  /* ---------- 3. MENÙ A TENDINA ---------- */
  var menuBtn   = document.getElementById('menuBtn');
  var menuPanel = document.getElementById('menuPanel');

  function setMenu(open) {
    if (!menuBtn || !menuPanel) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuPanel.hidden = !open;
    /* A tutto schermo la pagina sotto non deve scorrere */
    document.body.style.overflow = open ? 'hidden' : '';
    if (window.IDROS_LOCK) window.IDROS_LOCK(open);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (menuPanel) {
    menuPanel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }
  /* Un clic fuori chiude: senza, la tendina resterebbe aperta alle spalle */
  document.addEventListener('click', function (e) {
    if (menuBtn && menuPanel && !menuPanel.hidden && !e.target.closest('.navmenu')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') {
      setMenu(false); menuBtn.focus();
    }
  });

  /* ---------- 4. REVEAL E PARALLASSE (fallback) ----------
     Con anim.js attivo se ne occupa GSAP. Qui restiamo per il caso in
     cui la CDN non risponda o l'utente abbia chiesto meno movimento:
     una dissolvenza semplice, e la parallasse a rAF di prima. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-anim]'));

  if (!CINEMATIC) {
    if (REDUCED || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
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
  }

  var parallaxEls = CINEMATIC ? [] :
    Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
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

  /* ---------- 4b. FAILSAFE ----------
     Se dopo 3s un elemento già a schermo è ancora invisibile
     (observer non partito, errore JS a monte), mostriamo tutto.
     Una pagina senza animazione è sempre meglio di una vuota. */
  if (!CINEMATIC) {
    setTimeout(function () {
      var broken = revealEls.some(function (el) {
        var r = el.getBoundingClientRect();
        var inView = r.top < window.innerHeight * 0.9 && r.bottom > 0;
        return inView && parseFloat(getComputedStyle(el).opacity) < 0.05;
      });
      if (broken) document.documentElement.classList.add('reveal-force');
    }, 3000);
  }


  /* ---------- 7. PRENOTAZIONI ----------
     La piattaforma (POST /api/reservations) per ora è spenta: si prenota
     al telefono. Il modulo resta come alternativa, ma non manda niente
     al server: compone una mail indirizzata al ristorante e la apre nel
     programma di posta di chi prenota. I dati non passano dal sito.
     Per tornare alla piattaforma: vedi la cronologia git di questo file
     (commit «Sito online: …») e SETUP.md. */
  var form    = document.getElementById('bookingForm');
  var status  = document.getElementById('formStatus');
  var kindSel = document.getElementById('f-kind');

  /* I bottoni «Eventi privati» preimpostano il tipo di serata nel modulo */
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

    var name   = form.querySelector('#f-name');
    var phone  = form.querySelector('#f-phone');
    var date   = form.querySelector('#f-date');
    var time   = form.querySelector('#f-time');
    var guests = form.querySelector('#f-guests');

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

    return { ok: ok, first: first };
  }

  function get(id) {
    var el = form.querySelector('#' + id);
    return el ? el.value.trim() : '';
  }

  /* 2026-11-24 → 24/11/2026: nella mail si legge meglio */
  function niceDate(isoDate) {
    var p = isoDate.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : isoDate;
  }

  /* Oggetto e testo della mail, nella lingua della pagina */
  function compose() {
    var kindLabel = kindSel && kindSel.selectedOptions[0]
      ? kindSel.selectedOptions[0].textContent.trim() : '';
    var when = niceDate(get('f-date')) + ', ' + get('f-time');

    var lines = [
      T('mail.hello'),
      T('mail.intro'),
      '',
      T('mail.name') + ': ' + get('f-name'),
      T('mail.phone') + ': ' + get('f-phone'),
      T('mail.date') + ': ' + when,
      T('mail.guests') + ': ' + get('f-guests'),
      T('mail.kind') + ': ' + kindLabel
    ];
    var notes = get('f-notes');
    if (notes) lines.push(T('mail.notes') + ': ' + notes);
    lines.push('', T('mail.thanks'));

    return {
      subject: T('mail.subject') + ' — ' + when + ', ' + get('f-guests') + ' ' + T('mail.people'),
      body: lines.join('\r\n')
    };
  }

  function say(key, isError) {
    if (!status) return;
    status.innerHTML = key ? T(key) : '';
    status.classList.toggle('is-error', !!isError);
  }

  function focusFirst(first) {
    if (!first) return;
    first.focus();
    if (window.IDROS_SCROLL) window.IDROS_SCROLL(first);
    else first.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
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

      var mail = compose();
      var href = 'mailto:' + CONFIG.email +
        '?subject=' + encodeURIComponent(mail.subject) +
        '&body=' + encodeURIComponent(mail.body);

      /* Se sul dispositivo non c'è un programma di posta il clic non
         produce nulla: il messaggio lo dice, con le alternative. */
      say('msg.opening', false);
      window.location.href = href;
    });
  }

  document.addEventListener('idros:lang', function () {
    if (form && form.querySelector('.field.is-invalid')) validate();
  });

  /* ---------- 8. SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.IDROS_SCROLL) window.IDROS_SCROLL(target);
      else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();
