/* ============================================================
   SITO IN REVISIONE — interruttore

   IN_REVISIONE = true   chi apre il sito vede revisione.html, a
                         qualunque indirizzo, con stato 503: per
                         Google è una pausa temporanea, non una
                         pagina nuova da indicizzare.
   IN_REVISIONE = false  sito normale.

   Per rimettere online il sito: scrivere false qui sotto, fare
   commit e push. Il deploy parte da solo (GitHub Actions).

   Vedere il sito vero mentre è in revisione: aprire una volta
   /?anteprima=<PREVIEW_KEY> (la chiave è una variabile su Vercel,
   non sta nel codice). Il browser lo ricorda per 90 giorni;
   /?anteprima=esci lo dimentica.

   Sempre raggiungibili: pannello (/admin), API, file statici
   (/assets), pagine legali, robots.txt e sitemap.xml.
   In locale (python3 serve.py) questo file non conta: si vede
   sempre il sito vero, e la pagina d'attesa è a /revisione.html.
   ============================================================ */
const IN_REVISIONE = true;

const COOKIE = 'idros_anteprima';
const NOVANTA_GIORNI = 60 * 60 * 24 * 90;

export const config = {
  matcher: ['/((?!api|admin|assets|revisione|privacy|cookie|termini|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)']
};

/* «Prosegui verso la pagina richiesta», nel formato che Vercel riconosce. */
const next = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

const PAUSA = {
  'Cache-Control': 'no-store',
  'Retry-After': '86400',
  'X-Robots-Tag': 'noindex'
};

function readCookie(request, name) {
  const all = request.headers.get('cookie') || '';
  const hit = all.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export default async function middleware(request) {
  if (!IN_REVISIONE) return next();

  const url = new URL(request.url);
  const key = process.env.PREVIEW_KEY;

  /* Entrata o uscita dall'anteprima: si imposta (o si cancella) il
     cookie e si torna allo stesso indirizzo senza la chiave in vista. */
  const asked = url.searchParams.get('anteprima');
  if (key && asked !== null) {
    url.searchParams.delete('anteprima');
    const cookie = asked === key
      ? `${COOKIE}=${encodeURIComponent(key)}; Path=/; Max-Age=${NOVANTA_GIORNI}; HttpOnly; Secure; SameSite=Lax`
      : `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString(), 'Set-Cookie': cookie, 'Cache-Control': 'no-store' }
    });
  }
  if (key && readCookie(request, COOKIE) === key) return next();

  /* Pagina di revisione con stato 503 (una riscrittura semplice
     risponderebbe 200). Se per qualche motivo non si carica, basta
     un testo con i contatti. */
  try {
    const page = await fetch(new URL('/revisione', url.origin));
    if (page.ok) {
      return new Response(page.body, {
        status: 503,
        headers: { ...PAUSA, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  } catch (_) { /* si passa al testo semplice */ }

  return new Response(
    'IDROS Milano Marittima — sito in revisione, torna online a breve.\n' +
    'Tel. +39 350 133 3937 · info@idrosmilanomarittima.it\n',
    { status: 503, headers: { ...PAUSA, 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
