/* ============================================================
   POST /api/admin/decide
   { id, action: 'confirm' | 'reject' | 'cancel', note? }

   Accettare o rifiutare significa scrivere al cliente: la mail
   parte da qui e non è facoltativa. Se l'invio fallisce lo stato
   torna indietro, così l'elenco non dice una cosa che il cliente
   non ha mai ricevuto.
   ============================================================ */
import { db } from '../_lib/db.js';
import { mailConfirmed, mailRejected } from '../_lib/mail.js';
import { json, fail, guardMethod, body } from '../_lib/http.js';
import { requireOwner } from '../_lib/auth.js';

const ACTIONS = {
  confirm: { status: 'confirmed', mail: mailConfirmed },
  reject: { status: 'rejected', mail: mailRejected },
  cancel: { status: 'cancelled', mail: null }
};

export default async function handler(req, res) {
  if (!guardMethod(req, res, ['POST'])) return;
  const owner = await requireOwner(req, res);
  if (!owner) return;

  const { id, action, note } = body(req);
  const rule = ACTIONS[action];

  if (!id || !rule) return fail(res, 400, 'bad_request', 'Richiesta incompleta.');

  const supabase = db();
  const { data: before, error: readErr } = await supabase
    .from('reservations').select('*').eq('id', id).maybeSingle();

  if (readErr || !before) return fail(res, 404, 'not_found', 'Prenotazione non trovata.');
  if (before.status === rule.status) {
    return json(res, 200, { ok: true, reservation: before, mailed: false, alreadyDone: true });
  }

  const patch = {
    status: rule.status,
    decision_note: String(note || '').trim().slice(0, 600) || null,
    decided_at: new Date().toISOString(),
    decided_by: owner.email
  };

  const { data: updated, error } = await supabase
    .from('reservations').update(patch).eq('id', id).select('*').single();

  if (error) {
    console.error('[admin/decide]', error);
    return fail(res, 500, 'server_error', 'Aggiornamento non riuscito.');
  }

  if (!rule.mail) return json(res, 200, { ok: true, reservation: updated, mailed: false });

  try {
    await rule.mail(updated);
  } catch (err) {
    console.error('[admin/decide] email non inviata, stato ripristinato:', err);
    await supabase.from('reservations').update({
      status: before.status,
      decision_note: before.decision_note,
      decided_at: before.decided_at,
      decided_by: before.decided_by
    }).eq('id', id);

    return fail(res, 502, 'mail_failed',
      'La mail al cliente non è partita: la prenotazione è rimasta come prima. Riprovate.');
  }

  json(res, 200, { ok: true, reservation: updated, mailed: true });
}
