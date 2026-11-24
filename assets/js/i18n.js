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
    'nav.private': 'Private events',
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
    'exp.title': 'More than a dinner. The IDROS experience.',
    'exp.lead': 'A great crystal chandelier, blue velvet, the play of reflections in the mirrors and the magic of soft lighting. At IDROS every detail helps create an atmosphere to be lived, even before you sit down at the table.',
    'exp.lead2': 'Food, entertainment and music come together in an experience that evolves over the evening. The pleasure of dinner gives way to the show, the rhythm builds and the DJ set carries the night.',
    'exp.lead3': 'On Sunday, the pleasure of being together starts at lunchtime and carries on through aperitivo, music and dinner.',
    'exp.lead4': 'A place where time slips by without you noticing, where every moment is a good reason to stay a little longer.',

    /* --- full bleed --- */
    'bleed.title': 'Spectacular',
    'bleed.lead': 'Get ready to be left speechless.',

    /* --- ristorante --- */
    'rest.eyebrow': 'The restaurant',
    'rest.title': 'A menu without borders',
    'rest.lead': 'In the kitchen we always start from outstanding, carefully chosen ingredients. The menu ranges from fish to meat, from raw dishes to reinvented classics, with room for sushi and pizza too, both classic and contemporary.',
    'rest.lead2': 'Whether it is an important dinner or a night out with friends, you will find the right dish. If you have allergies or preferences, let us know when you book and the kitchen will be happy to help.',
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
    'ev.soon.text': 'We are preparing the calendar of upcoming nights, with dinner shows, DJ sets and special occasions. Stay up to date on our social profiles <a href="https://www.instagram.com/idrosmilanomarittima/" target="_blank" rel="noopener noreferrer">Instagram</a> and <a href="https://www.facebook.com/people/Idros-Milano-Marittima/61595955028912/" target="_blank" rel="noopener noreferrer">Facebook</a>.',
    'priv.eyebrow': 'Private events',
    'priv.title': 'The room, all yours',
    'priv.lead': 'Planning a private or corporate event? Get in touch to discover how IDROS can become the stage for your evening.',
    'priv.lead2': 'Birthdays, anniversaries, corporate dinners, invitation-only parties. You can book the whole venue or our private room, more intimate and secluded.',
    'priv.lead3': 'Together with you we take care of every detail, from a personalised menu to decorating the venue, from the welcome to the final toast.',
    'priv.form': 'Request information',
    'priv.ig': 'Message us on Instagram',
    'priv.call': 'Call us',

    /* --- come raggiungerci --- */
    'reach.eyebrow': 'Reach us',
    'reach.title': 'On the sea, behind the pine forest',
    'reach.note': 'A stone’s throw from Rotonda Primo Maggio, in the heart of Milano Marittima. If you come by car, the most convenient car park is on Viale Forlì, a few minutes’ walk away, while the one on Via Jelenia Gora is free and about ten minutes away. Cervia – Milano Marittima station is about two kilometres away.',
    'reach.cta': 'Open in maps',

    /* --- contatti --- */
    'cont.eyebrow': 'Contact',
    'cont.title': 'Let us hold your table',
    'cont.lead': 'The quickest way is to call us, so we can let you know straight away whether we can welcome you. If you would rather write, fill in the form and your email app will open with the request ready to send.',
    'cont.call': 'Call to book',
    'cont.phone': 'Telephone',
    'cont.hours': 'Opening hours',
    'cont.h1': 'Wednesday open for events (see the <a href="#eventi">events</a> section or contact us)',
    'cont.h2': 'Thursday 7:00 pm — midnight',
    'cont.h3': 'Friday and Saturday 7:00 pm — 3:00 am',
    'cont.h4': 'Sunday 12:00 pm — midnight',
    'cont.h5': 'Closed on Monday and Tuesday',

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
    'faq.1.a': 'A whole evening in one place. You have dinner at the restaurant, the room comes alive with the shows and after dinner the DJ set begins. On Sunday it all starts at lunchtime, with aperitivo and dinner accompanied by the DJ set.',
    'faq.2.q': 'When are you open?',
    'faq.2.a': 'Thursday from 7:00 pm to midnight, Friday and Saturday from 7:00 pm to 3:00 am, Sunday from noon to midnight. On Wednesday we open for events, so check the <a href="#eventi">events</a> section or get in touch. Closed on Monday and Tuesday.',
    'faq.3.q': 'What is on the menu?',
    'faq.3.a': 'Fish and meat, raw dishes, sushi and pizza, both classic and contemporary, all made with outstanding ingredients. You will find the full list on the <a href="/menu">menu</a> page.',
    'faq.4.q': 'What happens after dinner?',
    'faq.4.a': 'The lights go down, the DJ set begins and the room changes pace. On Friday and Saturday it carries on until three.',
    'faq.5.q': 'Do you host private and corporate events?',
    'faq.5.a': 'Yes, we host birthdays, anniversaries, corporate dinners and invitation-only parties. You can book the whole venue or the private room, with a personalised menu and a tailored set-up. Find out more in the <a href="#eventi-privati">private events</a> section, or give us a call.',
    'faq.6.q': 'How do I book?',
    'faq.6.a': 'The quickest way is to call <a href="tel:+393501333937">+39 350 133 3937</a> and we will tell you our availability straight away. You can also fill in the <a href="#prenota">form</a> and send us your request by email.',
    'faq.7.q': 'Is there a dress code?',
    'faq.7.a': 'Smart. No black tie required, but dress for an evening at the theatre rather than dinner on the beach.',
    'faq.8.q': 'Do you cater for intolerances and allergies?',
    'faq.8.a': 'Yes. Let us know when you book and the kitchen will adapt the dishes to your needs. The allergens in every dish are listed on the <a href="/menu#allergeni">menu</a>.',
    'faq.9.q': 'Where can I park?',
    'faq.9.a': 'The most convenient car park is on Viale Forlì, a few minutes’ walk away. The car park on Via Jelenia Gora is free, about ten minutes from us.',

    /* --- messaggi runtime --- */
    'msg.required': 'This field is required.',
    'msg.phone': 'Enter a valid phone number.',
    'msg.date': 'Choose a date from today onwards.',
    'msg.guests': 'Enter a number between 1 and 40.',
    'msg.fix': 'Check the highlighted fields.',
    'msg.opening': 'Opening your email app with the request ready to send. If nothing opens, write to us at <a href="mailto:info@idrosmilanomarittima.it">info@idrosmilanomarittima.it</a> or give us a call.',

    /* --- footer --- */
    'foot.vat': 'VAT no.',
    'foot.seat': 'Registered office',
    'foot.capital': 'Share capital',
    'foot.menu': 'Menu',
    'foot.privacy': 'Privacy',
    'foot.cookie': 'Cookies',
    'foot.terms': 'Terms and conditions',
    'foot.credit': 'Website by'
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
