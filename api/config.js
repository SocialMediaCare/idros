/* ============================================================
   GET /api/config
   La pagina di gestione ha bisogno di URL e chiave anon di
   Supabase per fare il login. Sono dati pubblici per definizione,
   ma il repository è pubblico: passarli di qui evita di scriverli
   nel codice e permette di cambiarli senza toccare il sito.
   ============================================================ */
import { json, guardMethod, env } from './_lib/http.js';

export default async function handler(req, res) {
  if (!guardMethod(req, res, ['GET'])) return;
  /* Se mancano, la pagina di gestione mostra un avviso comprensibile
     invece di un errore 500 senza spiegazione. */
  json(res, 200, {
    supabaseUrl: env('SUPABASE_URL', ''),
    supabaseAnonKey: env('SUPABASE_ANON_KEY', '')
  });
}
