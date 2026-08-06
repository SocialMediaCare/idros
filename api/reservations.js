/* ============================================================
   POST /api/reservations
   Riceve il modulo pubblico, aggiorna l'anagrafica, registra la
   richiesta in stato "pending" e avvisa cliente e ristorante.
   Non conferma niente: la conferma è una scelta del proprietario.
   ============================================================ */
import { db } from './_lib/db.js';
import { mailReceived, mailOwner } from './_lib/mail.js';
import { json, fail, guardMethod, body, throttle, clientIp } from './_lib/http.js';

const KINDS = ['cena', 'spettacolo', 'degustazione', 'club', 'privato'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function validate(input) {
  const errors = {};
  const out = {
    name: clean(input.name, 120),
    email: clean(input.email, 160).toLowerCase(),
    phone: clean(input.phone, 40),
    date: clean(input.date, 10),
    time: clean(input.time, 5),
    guests: parseInt(input.guests, 10),
    kind: clean(input.kind, 24),
    notes: clean(input.notes, 1000) || null,
    birthdate: clean(input.birthdate, 10) || null,
    city: clean(input.city, 80) || null,
    lang: input.lang === 'en' ? 'en' : 'it',
    marketing: input.marketing === true || input.marketing === 'true'
  };

  if (out.name.length < 2) errors.name = 'required';
  if (!EMAIL_RE.test(out.email)) errors.email = 'email';
  if (out.phone.replace(/\D/g, '').length < 8) errors.phone = 'phone';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(out.date)) {
    errors.date = 'required';
  } else {
    /* Confronto fra stringhe ISO: niente fusi orari di mezzo.
       Un giorno di tolleranza copre chi prenota da un altro paese. */
    const today = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (out.date < today) errors.date = 'date';
    const limit = new Date(Date.now() + 400 * 86400000).toISOString().slice(0, 10);
    if (out.date > limit) errors.date = 'date';
  }

  if (!/^\d{2}:\d{2}$/.test(out.time)) errors.time = 'required';
  if (!Number.isInteger(out.guests) || out.guests < 1 || out.guests > 40) errors.guests = 'guests';
  if (!KINDS.includes(out.kind)) out.kind = 'cena';
  if (input.privacy !== true && input.privacy !== 'true') errors.privacy = 'privacy';

  if (out.birthdate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(out.birthdate) || out.birthdate > new Date().toISOString().slice(0, 10)) {
      out.birthdate = null;
    }
  }

  return { out, errors };
}

export default async function handler(req, res) {
  if (!guardMethod(req, res, ['POST'])) return;

  const input = body(req);

  /* Campo esca: è nascosto nel modulo, un umano non lo compila mai. */
  if (clean(input.website, 200)) return json(res, 200, { ok: true, id: null });

  if (!throttle(`ip:${clientIp(req)}`, 8, 10 * 60 * 1000)) {
    return fail(res, 429, 'too_many', 'Troppe richieste. Riprovate fra qualche minuto.');
  }

  const { out, errors } = validate(input);
  if (Object.keys(errors).length) {
    return json(res, 422, {
      error: 'invalid',
      message: 'Alcuni campi non sono validi.',
      fields: errors
    });
  }

  const supabase = db();

  try {
    /* Freno vero, condiviso fra tutte le istanze: cinque richieste
       all'ora dallo stesso indirizzo sono già molto generose. */
    const since = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('email', out.email)
      .gte('created_at', since);

    if ((count || 0) >= 5) {
      return fail(res, 429, 'too_many', 'Abbiamo già diverse richieste da questo indirizzo. Chiamateci.');
    }

    /* --- anagrafica --- */
    const { data: existing } = await supabase
      .from('customers')
      .select('id, marketing_consent')
      .eq('email', out.email)
      .maybeSingle();

    let customerId = existing?.id || null;

    const profile = {
      email: out.email,
      name: out.name,
      phone: out.phone,
      lang: out.lang,
      last_seen: new Date().toISOString()
    };
    /* Data di nascita e città si scrivono solo se arrivano compilate:
       un campo lasciato vuoto non deve cancellare quello che sappiamo già. */
    if (out.birthdate) profile.birthdate = out.birthdate;
    if (out.city) profile.city = out.city;
    /* Il consenso si può dare, non togliere di nascosto:
       la revoca passa dalla pagina di gestione. */
    if (out.marketing) profile.marketing_consent = true;

    if (customerId) {
      await supabase.from('customers').update(profile).eq('id', customerId);
    } else {
      const { data: created, error } = await supabase
        .from('customers')
        .insert({ ...profile, marketing_consent: out.marketing })
        .select('id')
        .single();
      if (error) throw error;
      customerId = created.id;
    }

    /* --- richiesta --- */
    const { data: reservation, error: resErr } = await supabase
      .from('reservations')
      .insert({
        customer_id: customerId,
        name: out.name,
        email: out.email,
        phone: out.phone,
        date: out.date,
        time: out.time,
        guests: out.guests,
        kind: out.kind,
        notes: out.notes,
        lang: out.lang,
        status: 'pending'
      })
      .select('*')
      .single();

    if (resErr) throw resErr;

    /* Le email non devono poter far fallire la prenotazione:
       se Resend è giù la richiesta resta comunque registrata e
       visibile nella pagina di gestione. */
    let mailed = true;
    try {
      await Promise.all([mailReceived(reservation), mailOwner(reservation)]);
    } catch (err) {
      mailed = false;
      console.error('[reservations] invio email non riuscito:', err);
    }

    return json(res, 201, {
      ok: true,
      id: reservation.id,
      ref: String(reservation.id).slice(0, 8).toUpperCase(),
      mailed
    });
  } catch (err) {
    console.error('[reservations]', err);
    return fail(res, 500, 'server_error', 'Non siamo riusciti a registrare la richiesta. Riprovate o chiamateci.');
  }
}
