/* ============================================================
   Sito "in arrivo".
   Finché su Vercel esiste la variabile PREVIEW_KEY, chi apre il
   sito vede in-arrivo.html. Chi apre una volta
   /?anteprima=<PREVIEW_KEY> riceve un cookie e da lì in poi vede
   il sito vero; /?anteprima=esci lo toglie.
   Per mettere online il sito: eliminare PREVIEW_KEY su Vercel e
   rilanciare il deploy. Questo file può restare dov'è.
   Pannello, API e file statici restano sempre raggiungibili.
   ============================================================ */
const COOKIE = 'idros_anteprima';
const NOVANTA_GIORNI = 60 * 60 * 24 * 90;

export const config = {
  matcher: ['/((?!api|admin|assets|in-arrivo|robots\\.txt|sitemap\\.xml).*)']
};

/* Le due risposte che Vercel riconosce: «prosegui» e «servi un
   altro percorso allo stesso indirizzo». */
const next = () => new Response(null, { headers: { 'x-middleware-next': '1' } });
const rewrite = (url) => new Response(null, { headers: { 'x-middleware-rewrite': String(url) } });

function readCookie(request, name) {
  const all = request.headers.get('cookie') || '';
  const hit = all.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export default function middleware(request) {
  const key = process.env.PREVIEW_KEY;
  if (!key) return next();

  const url = new URL(request.url);
  const asked = url.searchParams.get('anteprima');

  /* Entrata o uscita dall'anteprima: si imposta (o si cancella) il
     cookie e si torna allo stesso indirizzo senza la chiave in vista. */
  if (asked !== null) {
    url.searchParams.delete('anteprima');
    const cookie = asked === key
      ? `${COOKIE}=${encodeURIComponent(key)}; Path=/; Max-Age=${NOVANTA_GIORNI}; HttpOnly; Secure; SameSite=Lax`
      : `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString(), 'Set-Cookie': cookie, 'Cache-Control': 'no-store' }
    });
  }

  if (readCookie(request, COOKIE) === key) return next();
  return rewrite(new URL('/in-arrivo', request.url));
}
