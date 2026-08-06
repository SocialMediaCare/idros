/* ============================================================
   Email transazionali (Resend).
   Quattro messaggi: richiesta ricevuta, avviso al ristorante,
   conferma, rifiuto. Italiano e inglese secondo la lingua con
   cui il cliente ha compilato il modulo.
   ============================================================ */
import { Resend } from 'resend';
import { env, escapeHtml } from './http.js';

let cached = null;
function client() {
  if (!cached) cached = new Resend(env('RESEND_API_KEY'));
  return cached;
}

/* ---------- dizionario ---------- */
const KIND = {
  it: {
    cena: 'Tavoli ristorante', spettacolo: 'Cena spettacolo',
    degustazione: 'Menu degustazione', club: 'DJ set e dopocena',
    privato: 'Evento privato'
  },
  en: {
    cena: 'Restaurant tables', spettacolo: 'Dinner show',
    degustazione: 'Tasting menu', club: 'DJ set & after dinner',
    privato: 'Private event'
  }
};

const COPY = {
  it: {
    received: {
      subject: 'Abbiamo ricevuto la vostra richiesta — IDROS',
      title: 'Richiesta ricevuta',
      lead: 'Grazie, abbiamo la vostra richiesta sotto gli occhi. Non è ancora una prenotazione confermata: vi scriviamo appena il tavolo è nostro da riservare.',
      foot: 'Se qualcosa non torna, rispondete a questa email o chiamateci.'
    },
    confirmed: {
      subject: 'Prenotazione confermata — IDROS',
      title: 'Vi aspettiamo',
      lead: 'La vostra prenotazione è confermata. Qui sotto trovate il riepilogo: conservatelo, vi basterà il nome all\'ingresso.',
      foot: 'Se dovesse cambiare qualcosa, avvisateci con almeno 24 ore di anticipo.'
    },
    rejected: {
      subject: 'Aggiornamento sulla vostra richiesta — IDROS',
      title: 'Non riusciamo a ospitarvi',
      lead: 'Purtroppo per la data richiesta non abbiamo disponibilità. Ci dispiace davvero: se volete, proponeteci un\'altra sera e troviamo il modo.',
      foot: 'Restiamo a disposizione al telefono per cercare un\'alternativa.'
    },
    labels: {
      name: 'Nome', email: 'Email', phone: 'Telefono', date: 'Data',
      time: 'Ora', guests: 'Coperti', kind: 'Serata', notes: 'Note',
      status: 'Stato', ref: 'Riferimento'
    },
    note: 'Messaggio dal ristorante'
  },
  en: {
    received: {
      subject: 'We have your request — IDROS',
      title: 'Request received',
      lead: 'Thank you, your request is in front of us. It is not a confirmed booking yet: we will write as soon as the table is ours to hold.',
      foot: 'If anything looks wrong, reply to this email or give us a call.'
    },
    confirmed: {
      subject: 'Reservation confirmed — IDROS',
      title: 'We are expecting you',
      lead: 'Your reservation is confirmed. The summary is below: keep it, your name at the door will be enough.',
      foot: 'Should anything change, let us know at least 24 hours in advance.'
    },
    rejected: {
      subject: 'Update on your request — IDROS',
      title: 'We cannot host you',
      lead: 'We have no availability on the date you asked for. We are genuinely sorry: suggest another evening and we will find a way.',
      foot: 'We are on the phone if you would like to look for an alternative.'
    },
    labels: {
      name: 'Name', email: 'Email', phone: 'Phone', date: 'Date',
      time: 'Time', guests: 'Guests', kind: 'Evening', notes: 'Notes',
      status: 'Status', ref: 'Reference'
    },
    note: 'Message from the restaurant'
  }
};

function lang(l) { return l === 'en' ? 'en' : 'it'; }

function formatDate(iso, l) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(l === 'en' ? 'en-GB' : 'it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}

/* ---------- impaginazione ----------
   Tabelle e stili in linea: è l'unico modo perché il messaggio
   regga su Outlook, Gmail e Apple Mail insieme. */
function rows(reservation, L, l) {
  const items = [
    [L.name, reservation.name],
    [L.email, reservation.email],
    [L.phone, reservation.phone],
    [L.date, formatDate(reservation.date, l)],
    [L.time, String(reservation.time).slice(0, 5)],
    [L.guests, reservation.guests],
    [L.kind, KIND[l][reservation.kind] || reservation.kind]
  ];
  if (reservation.notes) items.push([L.notes, reservation.notes]);
  items.push([L.ref, String(reservation.id).slice(0, 8).toUpperCase()]);

  return items.map(([k, v]) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;color:#8d8d8d;font-size:11px;letter-spacing:.18em;text-transform:uppercase;width:38%;vertical-align:top">${escapeHtml(k)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1f1f1f;color:#f2f2f2;font-size:15px;vertical-align:top">${escapeHtml(v)}</td>
    </tr>`).join('');
}

function shell({ title, lead, table, extra, foot }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#000;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a0a0a;border:1px solid #1f1f1f">
      <tr><td style="padding:36px 32px 8px">
        <p style="margin:0;font-family:Georgia,serif;font-size:20px;letter-spacing:.42em;color:#fff">IDROS</p>
        <p style="margin:6px 0 0;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#8d8d8d;font-family:Helvetica,Arial,sans-serif">Milano Marittima</p>
      </td></tr>
      <tr><td style="padding:24px 32px 0">
        <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-weight:400;font-size:26px;line-height:1.2;color:#fff">${title}</h1>
        <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#b4b4b4">${lead}</p>
      </td></tr>
      ${extra || ''}
      <tr><td style="padding:0 32px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;border-top:1px solid #1f1f1f">${table}</table>
      </td></tr>
      <tr><td style="padding:24px 32px 36px">
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#7a7a7a">${foot}</p>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#5a5a5a">Viale Gramsci 1 · 48015 Milano Marittima (RA)</p>
  </td></tr>
</table>
</body></html>`;
}

function noteBlock(text, label) {
  if (!text) return '';
  return `<tr><td style="padding:0 32px 20px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border-left:2px solid #8E1B2C">
      <tr><td style="padding:16px 18px;font-family:Helvetica,Arial,sans-serif">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#DB4756">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#e6e6e6">${escapeHtml(text)}</p>
      </td></tr>
    </table>
  </td></tr>`;
}

/* MAIL_OWNER può elencare più caselle separate da virgola: l'avviso
   arriva a tutte, mentre la risposta del cliente va alla prima. */
function owners() {
  return env('MAIL_OWNER').split(',').map((s) => s.trim()).filter(Boolean);
}

async function send({ to, subject, html, replyTo }) {
  const { error } = await client().emails.send({
    from: env('MAIL_FROM'),
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo: replyTo || undefined
  });
  if (error) throw new Error(`Resend: ${error.message || 'invio non riuscito'}`);
}

/* ---------- 1. al cliente: richiesta ricevuta ---------- */
export async function mailReceived(reservation) {
  const l = lang(reservation.lang);
  const C = COPY[l].received, L = COPY[l].labels;
  await send({
    to: reservation.email,
    subject: C.subject,
    replyTo: owners()[0],
    html: shell({ title: C.title, lead: C.lead, table: rows(reservation, L, l), foot: C.foot })
  });
}

/* ---------- 2. al ristorante: c'è una richiesta ---------- */
export async function mailOwner(reservation) {
  const L = COPY.it.labels;
  const link = `${env('SITE_URL', '')}/admin`;
  const extra = `<tr><td style="padding:0 32px 20px">
    <a href="${link}" style="display:inline-block;padding:13px 26px;background:#fff;color:#000;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none">Apri la gestione</a>
  </td></tr>`;

  await send({
    to: owners(),
    replyTo: reservation.email,
    subject: `Nuova richiesta · ${reservation.name} · ${reservation.date} · ${reservation.guests} coperti`,
    html: shell({
      title: 'Nuova richiesta di prenotazione',
      lead: 'Va accettata o rifiutata dalla pagina di gestione. Il cliente riceve la mail solo dopo la vostra scelta.',
      table: rows(reservation, L, 'it'),
      extra,
      foot: 'Rispondendo a questa email scrivete direttamente al cliente.'
    })
  });
}

/* ---------- 3. al cliente: confermata ---------- */
export async function mailConfirmed(reservation) {
  const l = lang(reservation.lang);
  const C = COPY[l].confirmed, L = COPY[l].labels;
  await send({
    to: reservation.email,
    subject: C.subject,
    replyTo: owners()[0],
    html: shell({
      title: C.title, lead: C.lead,
      table: rows(reservation, L, l),
      extra: noteBlock(reservation.decision_note, COPY[l].note),
      foot: C.foot
    })
  });
}

/* ---------- 4. al cliente: rifiutata ---------- */
export async function mailRejected(reservation) {
  const l = lang(reservation.lang);
  const C = COPY[l].rejected, L = COPY[l].labels;
  await send({
    to: reservation.email,
    subject: C.subject,
    replyTo: owners()[0],
    html: shell({
      title: C.title, lead: C.lead,
      table: rows(reservation, L, l),
      extra: noteBlock(reservation.decision_note, COPY[l].note),
      foot: C.foot
    })
  });
}
