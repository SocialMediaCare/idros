/* ============================================================
   IDROS — i18n
   L'italiano vive nell'HTML (SEO + no-JS). Qui c'è solo l'inglese:
   al primo caricamento catturiamo l'italiano dal DOM, così non
   esistono due copie dello stesso testo da tenere allineate.
   ============================================================ */
(function () {
  'use strict';

  var EN = {
    'doc.title': 'IDROS Milano Marittima — Restaurant, Dinner Show & Club',
    'doc.desc': 'IDROS, Milano Marittima. Fine dining, dinner shows with live music and DJ sets with exclusive formats, where the seaplane base once stood.',

    'skip': 'Skip to main content',
    'load.place': 'Milano Marittima',

    'nav.exp': 'Experience',
    'nav.rest': 'Restaurant',
    'nav.events': 'Events',
    'nav.reach': 'Reach us',
    'nav.contact': 'Contact',
    'nav.book': 'Reservations',
    'nav.menu': 'Menu',

    /* --- hero --- */
    'book.b1': 'Book your table',
    'book.b2': 'Our events',
    'book.b3': 'Reach us',
    'book.b4': 'Private events',
    'hero.title': 'Welcome to IDROS',
    'hero.sub': 'Milano Marittima · Ravenna',
    'hero.scroll': 'Scroll',
    'cta.book': 'Book',
    'cta.bookTable': 'Book a table',

    /* --- quick links --- */
    'ql.1.t': 'Join us for dinner',
    'ql.1.c': 'The restaurant',
    'ql.2.t': 'The IDROS experience',
    'ql.2.c': 'Find out more',
    'ql.3.t': 'Our nights',
    'ql.3.c': 'The calendar',

    /* --- slot fotografici --- */
    'slot.hero': 'Video or photograph · The room',
    'slot.qlCena': 'Photograph · The plate',
    'slot.qlExp': 'Photograph · The show',
    'slot.qlEv': 'Photograph · The DJ set',
    'slot.exp1': 'Photograph · The room',
    'slot.exp2': 'Photograph · Detail',
    'slot.rest1': 'Photograph · The kitchen',
    'slot.rest2': 'Photograph · The plate',
    'slot.ev1': 'Photograph · The night',
    'slot.ev2': 'Photograph · Private event',
    'slot.reach1': 'Map or photograph',
    'slot.bleed': 'Full-page photograph · The night',
    'slot.g1': 'Room',
    'slot.g2': 'Terrace',
    'slot.g3': 'Dance',
    'slot.g4': 'Bar',
    'slot.g5': 'Plate',
    'slot.g6': 'Night',

    /* --- esperienza --- */
    'exp.eyebrow': 'The experience',
    'exp.title': 'A dinner that will not stay seated',
    'exp.lead': 'Where the seaplanes once landed, the room now goes dark between one course and the next. A violin crosses the tables, two dancers open the space at the centre, an actor tells a piece of this coastline.',

    /* --- full bleed --- */
    'bleed.title': 'Spectacular',
    'bleed.lead': 'From sunset to the last set.',

    /* --- ristorante --- */
    'rest.eyebrow': 'The restaurant',
    'rest.title': 'Adriatic, technique, insolence',
    'rest.lead': 'A short list, changing with the catch and the season. Adriatic crudo, hand-pulled pasta, fish in a salt crust and cooking over coals: few dishes, each with a precise reason to be there.',
    'rest.lead2': 'The cellar follows the same rule — Romagna, sparkling and a few French incursions — and the kitchen will happily rewrite a dish around an allergy or a preference, if you tell us when you book.',
    'cta.menu': 'Discover our menu',

    /* --- eventi --- */
    'ev.eyebrow': 'Events',
    'ev.title': 'What comes next',
    'tag.show': 'Dinner show',
    'tag.special': 'Special night',
    'tag.dj': 'DJ set',
    'ev.1.t': 'Salsedine — Opening Night',
    'ev.2.t': 'Mid-August Night',
    'ev.3.t': 'Idros Nights — Riviera Deep',
    'ev.4.t': 'Last Flight — end of summer',
    'ev.cta': 'Private events',

    /* --- come raggiungerci --- */
    'reach.eyebrow': 'Reach us',
    'reach.title': 'On the sea, behind the pine forest',
    'reach.note': 'Cervia exit from the E45, guarded parking a hundred metres away. Cervia–Milano Marittima station is ten minutes on foot.',
    'reach.cta': 'Open in maps',

    /* --- contatti --- */
    'cont.eyebrow': 'Contact',
    'cont.title': 'Let us hold your table',
    'cont.lead': 'Fill in the form and we will answer within a few hours. For the same evening, or for parties over ten, call us: it is faster.',
    'cont.phone': 'Telephone',
    'cont.wa': 'WhatsApp',
    'cont.waD': 'Write to us',
    'cont.hours': 'Opening hours',
    'cont.h1': 'Tuesday — Sunday, 7:30 pm — 11:00 pm',
    'cont.h2': 'Bar and DJ set Friday and Saturday until 3:00 am',
    'cont.h3': 'Closed on Monday',

    /* --- modulo --- */
    'f.title': 'Reservation form',
    'f.name': 'Full name',
    'f.phone': 'Phone',
    'f.email': 'Email',
    'f.date': 'Date',
    'f.time': 'Time',
    'f.guests': 'Guests',
    'f.kind': 'Type of evening',
    'f.k1': 'Restaurant tables',
    'f.k2': 'Dinner show',
    'f.k3': 'Tasting menu',
    'f.k4': 'DJ set &amp; after dinner',
    'f.k5': 'Private event',
    'f.notes': 'Notes, allergies, special occasions',
    'f.birth': 'Date of birth <span class="opt">optional</span>',
    'f.city': 'Town <span class="opt">optional</span>',
    'f.privacy': 'I have read the privacy notice and consent to my data being processed to manage this reservation.',
    'f.marketing': 'Keep me posted on IDROS: nights, seasonal menus and private invitations.',
    'f.submit': 'Send request',
    'f.wa': 'Send via WhatsApp',
    'f.legal': 'Your request is not confirmed until you receive our reply.',

    /* --- esito invio --- */
    'done.title': 'Request sent',
    'done.lead': 'We have emailed you a summary. This is not a confirmed booking yet: as soon as the table is ours to hold, the final confirmation will follow.',
    'done.ref': 'Reference',
    'done.again': 'Send another request',

    /* --- FAQ --- */
    'faq.title': 'Frequently asked questions',
    'faq.1.q': 'What is the IDROS experience?',
    'faq.1.a': 'A dinner where service and stage are woven together: three tableaux of dance, theatre and live music spread across the courses.',
    'faq.2.q': 'What happens after the show?',
    'faq.2.a': 'On Friday and Saturday the room changes shape and the DJ set carries on until three. Access is reserved for dinner guests.',
    'faq.3.q': 'Is there a dress code?',
    'faq.3.a': 'Smart. No black tie required, but dress for an evening at the theatre rather than dinner on the beach.',
    'faq.4.q': 'Do you cater for intolerances and allergies?',
    'faq.4.a': 'Yes. Tell us when you book and the kitchen rewrites the route around you.',

    /* --- messaggi runtime --- */
    'msg.required': 'This field is required.',
    'msg.email': 'Enter a valid email address.',
    'msg.phone': 'Enter a valid phone number.',
    'msg.date': 'Choose a date from today onwards.',
    'msg.guests': 'Enter a number between 1 and 40.',
    'msg.privacy': 'You must accept the privacy notice to continue.',
    'msg.opening': 'Opening your email client with the request ready to send…',
    'msg.wa': 'Opening WhatsApp with the request ready to send…',
    'msg.fix': 'Check the highlighted fields.',
    'msg.subject': 'Reservation request — IDROS',
    'msg.sending': 'Sending your request…',
    'msg.throttled': 'We already have several requests from you. Please call us instead.',
    'msg.serverError': 'Something went wrong on our side. Try again, or call us.',
    'msg.network': 'No connection. Check your network and try again.',
    'msg.noMail': 'Request registered, but the summary email did not go out. We have it all the same.',

    /* --- footer --- */
    'foot.claim': 'Kitchen, music and stage on the sea at Milano Marittima.',
    'foot.vat': 'VAT 00000000000',
    'foot.privacy': 'Privacy',
    'foot.cookie': 'Cookies'
  };

  /* Stringhe italiane che non stanno nel DOM (messaggi runtime, meta) */
  var IT_EXTRA = {
    'doc.title': 'IDROS Milano Marittima — Ristorante, Cena Spettacolo e Club',
    'doc.desc': "IDROS, Milano Marittima. Alta cucina, cena spettacolo con musica dal vivo e DJ set con format esclusivi, dove un tempo sorgeva l'Idroscalo.",
    'msg.required': 'Questo campo è obbligatorio.',
    'msg.email': 'Inserite un indirizzo email valido.',
    'msg.phone': 'Inserite un numero di telefono valido.',
    'msg.date': 'Scegliete una data da oggi in avanti.',
    'msg.guests': 'Inserite un numero tra 1 e 40.',
    'msg.privacy': "Per proseguire dovete accettare l'informativa privacy.",
    'msg.opening': 'Apriamo il vostro client di posta con la richiesta già pronta…',
    'msg.wa': 'Apriamo WhatsApp con la richiesta già pronta…',
    'msg.fix': 'Controllate i campi evidenziati.',
    'msg.subject': 'Richiesta di prenotazione — IDROS',
    'msg.sending': 'Stiamo inviando la richiesta…',
    'msg.throttled': 'Abbiamo già diverse richieste da questo indirizzo. Meglio se ci chiamate.',
    'msg.serverError': 'Qualcosa non ha funzionato da parte nostra. Riprovate, oppure chiamateci.',
    'msg.network': 'Connessione assente. Controllate la rete e riprovate.',
    'msg.noMail': 'Richiesta registrata, ma la mail di riepilogo non è partita. Da noi è arrivata lo stesso.'
  };

  var IT = {};
  var current = 'it';

  function captureItalian() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in IT)) IT[k] = el.innerHTML.trim();
    });
    Object.keys(IT_EXTRA).forEach(function (k) { IT[k] = IT_EXTRA[k]; });
  }

  function dict() { return current === 'en' ? EN : IT; }

  function t(key) {
    var d = dict();
    var v = (key in d) ? d[key] : (IT[key] || key);
    return v.indexOf('&amp;') > -1 ? v.replace(/&amp;/g, '&') : v;
  }

  function apply(lang) {
    current = (lang === 'en') ? 'en' : 'it';
    var d = dict();

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k in d) el.innerHTML = d[k];
    });

    document.documentElement.lang = current;
    document.title = t('doc.title');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('doc.desc'));

    var burger = document.getElementById('burger');
    if (burger) {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-label', t(open ? 'aria.burgerClose' : 'aria.burger'));
    }

    document.querySelectorAll('.lang__btn').forEach(function (b) {
      var on = b.dataset.lang === current;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    try { localStorage.setItem('idros-lang', current); } catch (e) { /* private mode */ }
    document.dispatchEvent(new CustomEvent('idros:lang', { detail: { lang: current } }));
  }

  function init() {
    captureItalian();
    var saved = null;
    try { saved = localStorage.getItem('idros-lang'); } catch (e) { /* noop */ }
    if (!saved) {
      saved = (navigator.language || 'it').toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
    }
    apply(saved === 'en' ? 'en' : 'it');

    document.querySelectorAll('.lang__btn').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.dataset.lang); });
    });
  }

  window.IDROS_I18N = { t: t, apply: apply, lang: function () { return current; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
