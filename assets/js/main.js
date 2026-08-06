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

  /* Contatti — segnaposto, da sostituire con quelli reali */
  var CONFIG = {
    whatsapp: '390000000000',   // formato internazionale, senza +
    email:    'prenotazioni@idros.it',
    api:      '/api/reservations'
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

  function get(id) {
    var el = form.querySelector('#' + id);
    return el ? el.value.trim() : '';
  }

  function checked(id) {
    var el = form.querySelector('#' + id);
    return !!(el && el.checked);
  }

  /* Quello che finisce nel database */
  function payload() {
    return {
      name:      get('f-name'),
      email:     get('f-email'),
      phone:     get('f-phone'),
      date:      get('f-date'),
      time:      get('f-time'),
      guests:    get('f-guests'),
      kind:      kindSel ? kindSel.value : 'cena',
      notes:     get('f-notes'),
      birthdate: get('f-birth'),
      city:      get('f-city'),
      privacy:   checked('f-privacy'),
      marketing: checked('f-marketing'),
      website:   get('f-website'),
      lang:      document.documentElement.lang === 'en' ? 'en' : 'it'
    };
  }

  /* Quello che si legge in un messaggio WhatsApp */
  function collect() {
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

    /* ---------- 7b. INVIO ALLA PIATTAFORMA ----------
       La richiesta finisce nel database e fa partire due email:
       il riepilogo al cliente e l'avviso al ristorante. La conferma
       vera arriva solo quando il proprietario accetta. */
    var submitBtn = document.getElementById('formSubmit');
    var doneBox   = document.getElementById('formDone');
    var refEl     = document.getElementById('formRef');
    var againBtn  = document.getElementById('formAgain');
    var sending   = false;

    function setBusy(on) {
      sending = on;
      form.classList.toggle('is-busy', on);
      if (submitBtn) submitBtn.disabled = on;
    }

    function showErrors(fields) {
      var map = {
        name: 'f-name', email: 'f-email', phone: 'f-phone', date: 'f-date',
        time: 'f-time', guests: 'f-guests', privacy: 'f-privacy'
      };
      var first = null;
      Object.keys(fields || {}).forEach(function (key) {
        var el = form.querySelector('#' + (map[key] || ''));
        if (!el) return;
        setError(el, 'msg.' + fields[key]);
        if (!first) first = el;
      });
      focusFirst(first);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      var v = validate();
      if (!v.ok) { say('msg.fix', true); focusFirst(v.first); return; }

      setBusy(true);
      say('msg.sending', false);

      fetch(CONFIG.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload())
      }).then(function (r) {
        return r.json().then(function (data) { return { status: r.status, data: data }; });
      }).then(function (res) {
        if (res.status === 422) { say('msg.fix', true); showErrors(res.data.fields); return; }
        if (res.status === 429) { say('msg.throttled', true); return; }
        if (!res.data || !res.data.ok) { say('msg.serverError', true); return; }

        if (refEl) refEl.textContent = res.data.ref || '—';
        say(res.data.mailed ? '' : 'msg.noMail', !res.data.mailed);
        form.hidden = true;
        if (doneBox) {
          doneBox.hidden = false;
          if (window.IDROS_SCROLL) window.IDROS_SCROLL(doneBox);
        }
        form.reset();
      }).catch(function () {
        say('msg.network', true);
      }).then(function () {
        setBusy(false);
      });
    });

    if (againBtn) {
      againBtn.addEventListener('click', function () {
        if (doneBox) doneBox.hidden = true;
        form.hidden = false;
        say('', false);
        if (window.IDROS_SCROLL) window.IDROS_SCROLL(form);
      });
    }

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
