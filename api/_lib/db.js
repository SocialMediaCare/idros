/* ============================================================
   Client Supabase con la service role key.
   Vive solo lato server: quella chiave scavalca le policy RLS
   e non deve mai finire in una pagina.
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import { env } from './http.js';

let cached = null;

export function db() {
  if (cached) return cached;
  cached = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}
