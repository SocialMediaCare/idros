/* ============================================================
   GET  /api/admin/customers          → elenco JSON
   GET  /api/admin/customers?format=csv → foglio da aprire in Excel
   PATCH /api/admin/customers         → { id, notes?, tags?, marketing_consent? }

   Filtri: ?q= &marketing=1 &ageMin=25 &ageMax=45 &city=Cervia
   ============================================================ */
import { db } from '../_lib/db.js';
import { json, fail, guardMethod, body } from '../_lib/http.js';
import { requireOwner } from '../_lib/auth.js';

const COLUMNS = [
  ['name', 'Nome'],
  ['email', 'Email'],
  ['phone', 'Telefono'],
  ['birthdate', 'Data di nascita'],
  ['age', 'Età'],
  ['city', 'Città'],
  ['lang', 'Lingua'],
  ['marketing_consent', 'Consenso marketing'],
  ['reservations_total', 'Richieste totali'],
  ['reservations_confirmed', 'Confermate'],
  ['reservations_rejected', 'Rifiutate'],
  ['guests_total', 'Coperti totali'],
  ['favourite_kind', 'Serata preferita'],
  ['last_visit', 'Ultima visita'],
  ['first_seen', 'Primo contatto'],
  ['last_seen', 'Ultimo contatto'],
  ['tags', 'Etichette'],
  ['notes', 'Note']
];

/* Excel interpreta come formula tutto ciò che inizia con = + - @:
   un nome tipo "=cmd" diventerebbe eseguibile all'apertura. */
function csvCell(value) {
  let s = Array.isArray(value) ? value.join(' | ') : (value ?? '');
  s = String(s);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  const head = COLUMNS.map(([, label]) => csvCell(label)).join(';');
  const lines = rows.map((r) => COLUMNS.map(([key]) => csvCell(r[key])).join(';'));
  /* Il BOM serve a Excel per capire che il file è UTF-8:
     senza, gli accenti italiani escono come caratteri strani. */
  return '\uFEFF' + [head, ...lines].join('\r\n');
}

export default async function handler(req, res) {
  if (!guardMethod(req, res, ['GET', 'PATCH'])) return;
  const owner = await requireOwner(req, res);
  if (!owner) return;

  const supabase = db();

  /* ---------- modifica scheda cliente ---------- */
  if (req.method === 'PATCH') {
    const { id, notes, tags, marketing_consent: consent } = body(req);
    if (!id) return fail(res, 400, 'bad_request', 'Manca l\'identificativo del cliente.');

    const patch = {};
    if (notes !== undefined) patch.notes = String(notes).slice(0, 2000) || null;
    if (Array.isArray(tags)) patch.tags = tags.map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
    if (typeof consent === 'boolean') patch.marketing_consent = consent;

    if (!Object.keys(patch).length) return fail(res, 400, 'bad_request', 'Niente da aggiornare.');

    const { data, error } = await supabase
      .from('customers').update(patch).eq('id', id).select('id').single();

    if (error) {
      console.error('[admin/customers] PATCH', error);
      return fail(res, 500, 'server_error', 'Aggiornamento non riuscito.');
    }
    return json(res, 200, { ok: true, id: data.id });
  }

  /* ---------- elenco ---------- */
  const { q, marketing, ageMin, ageMax, city, format } = req.query || {};

  let query = supabase
    .from('customer_stats')
    .select('*')
    .order('last_seen', { ascending: false })
    .limit(5000);

  if (marketing === '1') query = query.eq('marketing_consent', true);
  if (city) query = query.ilike('city', `%${String(city).replace(/[(),*%]/g, ' ').trim().slice(0, 60)}%`);
  if (ageMin) query = query.gte('age', parseInt(ageMin, 10));
  if (ageMax) query = query.lte('age', parseInt(ageMax, 10));

  if (q) {
    const safe = String(q).replace(/[(),*%]/g, ' ').trim().slice(0, 60);
    if (safe) query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin/customers]', error);
    return fail(res, 500, 'server_error', 'Lettura non riuscita.');
  }

  if (format === 'csv') {
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="idros-clienti-${stamp}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(toCsv(data || []));
  }

  json(res, 200, { customers: data || [] });
}
