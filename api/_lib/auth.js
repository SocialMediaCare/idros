/* ============================================================
   Accesso all'area riservata.
   Il token arriva da Supabase Auth (login sulla pagina /admin) e
   viene verificato qui contro Supabase. Non basta essere
   registrati: l'email deve stare nell'elenco ADMIN_EMAILS.
   ============================================================ */
import { db } from './db.js';
import { env, fail } from './http.js';

function allowlist() {
  return env('ADMIN_EMAILS')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireOwner(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    fail(res, 401, 'no_token', 'Accesso riservato: effettuate il login.');
    return null;
  }

  const { data, error } = await db().auth.getUser(token);
  if (error || !data?.user) {
    fail(res, 401, 'invalid_token', 'Sessione scaduta: rientrate.');
    return null;
  }

  const email = (data.user.email || '').toLowerCase();
  if (!allowlist().includes(email)) {
    fail(res, 403, 'not_allowed', 'Questo account non è abilitato alla gestione.');
    return null;
  }

  return { id: data.user.id, email };
}
