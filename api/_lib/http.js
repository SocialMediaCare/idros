/* ============================================================
   Utilità comuni alle funzioni serverless.
   ============================================================ */

export function json(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(JSON.stringify(body));
}

export function fail(res, status, code, message) {
  return json(res, status, { error: code, message });
}

/* Le funzioni sono servite dallo stesso dominio del sito, quindi
   CORS non servirebbe. Lo teniamo stretto per non lasciare l'API
   utilizzabile da una pagina copiata altrove. */
export function guardMethod(req, res, allowed) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', allowed.join(', '));
    res.status(204).end();
    return false;
  }
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    fail(res, 405, 'method_not_allowed', 'Metodo non consentito.');
    return false;
  }
  return true;
}

export function body(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

export function env(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Variabile d'ambiente mancante: ${name}`);
  }
  return v;
}

/* Blocco elementare contro l'invio ripetuto: la memoria di una
   funzione serverless non è condivisa fra istanze, quindi è solo
   il primo filtro. Quello vero è il controllo sul database. */
const hits = new Map();

export function throttle(key, limit, windowMs) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > windowMs) {
    hits.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  if (hits.size > 500) hits.clear();
  return entry.count <= limit;
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
