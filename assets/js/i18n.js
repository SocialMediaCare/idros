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
    'doc.desc': 'IDROS, Milano Marittima. Seafood and land dishes, sushi and contemporary pizza, dinner shows and DJ sets, where the seaplane base once stood. Book your table.',
    'doc.title.menu': 'Menu — IDROS Milano Marittima',
    'doc.desc.menu': 'The IDROS menu in Milano Marittima: raw and cooked starters, fresh pasta, mains from sea to land, pizza, sushi and desserts. Allergens and PDF download.',

    'skip': 'Skip to main content',
    'load.place': 'Milano Marittima',

    'nav.exp': 'Experience',
    'nav.rest': 'Restaurant',
    'nav.events': 'Events',
    'nav.reach': 'Reach us',
    'nav.contact': 'Contact',
    'nav.book': 'Reservations',
    'nav.menu': 'Menu',
    'nav.carta': 'Our menu',
    'nav.home': 'Home',

    /* --- hero --- */
    'book.b1': 'Book your table',
    'book.b2': 'Our menu',
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
    'ev.soon.tag': 'Coming soon',
    'ev.soon.text': 'The calendar of upcoming nights is being prepared: dinner shows, DJ sets and special occasions. Come back and see us soon.',

    /* --- come raggiungerci --- */
    'reach.eyebrow': 'Reach us',
    'reach.title': 'On the sea, behind the pine forest',
    'reach.note': 'Cervia exit from the E45, guarded parking a hundred metres away. Cervia–Milano Marittima station is ten minutes on foot.',
    'reach.cta': 'Open in maps',

    /* --- contatti --- */
    'cont.eyebrow': 'Contact',
    'cont.title': 'Let us hold your table',
    'cont.lead': 'The quickest way is a phone call: we will tell you straight away if the table is free. If you would rather write, fill in the form and your email app will open with the request ready to send.',
    'cont.call': 'Call to book',
    'cont.phone': 'Telephone',
    'cont.hours': 'Opening hours',
    'cont.h1': 'Tuesday — Sunday, 7:30 pm — 11:00 pm',
    'cont.h2': 'Bar and DJ set Friday and Saturday until 3:00 am',
    'cont.h3': 'Closed on Monday',

    /* --- modulo --- */
    'f.title': 'Or write to us',
    'f.name': 'Full name',
    'f.phone': 'Phone',
    'f.date': 'Date',
    'f.time': 'Time',
    'f.guests': 'Guests',
    'f.kind': 'Type of evening',
    'f.k1': 'Dinner at the restaurant',
    'f.k2': 'Dinner show',
    'f.k4': 'DJ set &amp; after dinner',
    'f.k5': 'Private event',
    'f.notes': 'Notes, allergies, special occasions',
    'f.submit': 'Write the email',
    'f.legal': 'The form sends nothing by itself: it opens your email app with the message already written, and you send it. Your booking is confirmed only by our reply. How we handle your data: <a href="/privacy">privacy notice</a> (in Italian).',

    /* --- mail composta dal modulo --- */
    'mail.subject': 'Table request',
    'mail.people': 'guests',
    'mail.hello': 'Good day,',
    'mail.intro': 'I would like to book a table at IDROS.',
    'mail.name': 'Name',
    'mail.phone': 'Phone',
    'mail.date': 'Date and time',
    'mail.guests': 'Guests',
    'mail.kind': 'Evening',
    'mail.notes': 'Notes',
    'mail.thanks': 'Thank you',

    /* --- FAQ --- */
    'faq.title': 'Frequently asked questions',
    'faq.1.q': 'What is the IDROS experience?',
    'faq.1.a': 'A dinner where service and stage are woven together: three tableaux of dance, theatre and live music spread across the courses.',
    'faq.2.q': 'What happens after the show?',
    'faq.2.a': 'On Friday and Saturday the room changes shape and the DJ set carries on until three. Access is reserved for dinner guests.',
    'faq.3.q': 'Is there a dress code?',
    'faq.3.a': 'Smart. No black tie required, but dress for an evening at the theatre rather than dinner on the beach.',
    'faq.4.q': 'Do you cater for intolerances and allergies?',
    'faq.4.a': 'Yes. Tell us when you book and the kitchen rewrites the route around you. The allergens in every dish are listed on the <a href="/menu#allergeni">menu</a>.',

    /* --- messaggi runtime --- */
    'msg.required': 'This field is required.',
    'msg.phone': 'Enter a valid phone number.',
    'msg.date': 'Choose a date from today onwards.',
    'msg.guests': 'Enter a number between 1 and 40.',
    'msg.fix': 'Check the highlighted fields.',
    'msg.opening': 'Opening your email app with the request ready to send. If nothing opens, write to us at <a href="mailto:info@idrosmilanomarittima.it">info@idrosmilanomarittima.it</a> or give us a call.',

    /* --- footer --- */
    'foot.claim': 'Kitchen, music and stage on the sea at Milano Marittima.',
    'foot.vat': 'VAT no.',
    'foot.seat': 'Registered office',
    'foot.capital': 'Share capital',
    'foot.menu': 'Menu',
    'foot.privacy': 'Privacy',
    'foot.cookie': 'Cookies',
    'foot.terms': 'Terms and conditions'
  };

  /* Le pagine con testi propri (il menu) aggiungono qui le loro
     traduzioni, da un file caricato prima di questo. */
  if (window.IDROS_EN_EXTRA) {
    Object.keys(window.IDROS_EN_EXTRA).forEach(function (k) { EN[k] = window.IDROS_EN_EXTRA[k]; });
  }

  /* Stringhe italiane che non stanno nel DOM (messaggi runtime, meta) */
  var IT_EXTRA = {
    'msg.required': 'Questo campo è obbligatorio.',
    'msg.phone': 'Inserite un numero di telefono valido.',
    'msg.date': 'Scegliete una data da oggi in avanti.',
    'msg.guests': 'Inserite un numero tra 1 e 40.',
    'msg.fix': 'Controllate i campi evidenziati.',
    'msg.opening': 'Apriamo la vostra posta con la richiesta già pronta. Se non si apre nulla, scriveteci a <a href="mailto:info@idrosmilanomarittima.it">info@idrosmilanomarittima.it</a> oppure chiamateci.',
    'mail.subject': 'Richiesta di prenotazione',
    'mail.people': 'persone',
    'mail.hello': 'Buongiorno,',
    'mail.intro': 'vorrei prenotare un tavolo da IDROS.',
    'mail.name': 'Nome',
    'mail.phone': 'Telefono',
    'mail.date': 'Data e ora',
    'mail.guests': 'Persone',
    'mail.kind': 'Serata',
    'mail.notes': 'Note',
    'mail.thanks': 'Grazie'
  };

  /* Titolo e descrizione cambiano da pagina a pagina: la chiave porta
     il nome della pagina (<html data-page="menu"> → doc.title.menu). */
  var PAGE = document.documentElement.getAttribute('data-page') || 'home';
  var TITLE_KEY = PAGE === 'home' ? 'doc.title' : 'doc.title.' + PAGE;
  var DESC_KEY  = PAGE === 'home' ? 'doc.desc'  : 'doc.desc.' + PAGE;

  var IT = {};
  var current = 'it';

  function captureItalian() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in IT)) IT[k] = el.innerHTML.trim();
    });
    Object.keys(IT_EXTRA).forEach(function (k) { IT[k] = IT_EXTRA[k]; });
    IT[TITLE_KEY] = document.title;
    var m = document.querySelector('meta[name="description"]');
    if (m) IT[DESC_KEY] = m.getAttribute('content');
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
    if (TITLE_KEY in d) document.title = t(TITLE_KEY);
    var meta = document.querySelector('meta[name="description"]');
    if (meta && DESC_KEY in d) meta.setAttribute('content', t(DESC_KEY));

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
