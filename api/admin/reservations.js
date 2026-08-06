/* ============================================================
   GET /api/admin/reservations
   Elenco delle richieste per la pagina di gestione.
   Filtri: ?status=pending&from=2026-08-01&to=2026-08-31&q=rossi
   ============================================================ */
import { db } from '../_lib/db.js';
import { json, fail, guardMethod } from '../_lib/http.js';
import { requireOwner } from '../_lib/auth.js';

const STATUSES = ['pending', 'confirmed', 'rejected', 'cancelled'];

export default async function handler(req, res) {
  if (!guardMethod(req, res, ['GET'])) return;
  const owner = await requireOwner(req, res);
  if (!owner) return;

  const { status, from, to, q, limit } = req.query || {};
  const supabase = db();

  let query = supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.min(parseInt(limit, 10) || 300, 1000));

  if (status && STATUSES.includes(status)) query = query.eq('status', status);
  if (/^\d{4}-\d{2}-\d{2}$/.test(from || '')) query = query.gte('date', from);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to || '')) query = query.lte('date', to);

  if (q) {
    /* Il termine finisce dentro un pattern PostgREST: le virgole e
       le parentesi vanno tolte o spezzerebbero la sintassi del filtro. */
    const safe = String(q).replace(/[(),*%]/g, ' ').trim().slice(0, 60);
    if (safe) {
      query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin/reservations]', error);
    return fail(res, 500, 'server_error', 'Lettura non riuscita.');
  }

  const counts = { pending: 0, confirmed: 0, rejected: 0, cancelled: 0 };
  const { data: all } = await supabase.from('reservations').select('status');
  (all || []).forEach((r) => { if (counts[r.status] !== undefined) counts[r.status] += 1; });

  json(res, 200, { reservations: data || [], counts });
}
