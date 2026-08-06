/* ============================================================
   IDROS — pannello di gestione.
   Accesso con Supabase Auth; il token della sessione viaggia
   come Bearer verso /api/admin/*, che è l'unico posto dove
   il database viene davvero toccato.
   ============================================================ */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const $ = (sel, root = document) => root.querySelector(sel);

const KIND = {
  cena: 'Tavoli ristorante',
  spettacolo: 'Cena spettacolo',
  degustazione: 'Menu degustazione',
  club: 'DJ set e dopocena',
  privato: 'Evento privato'
};

const STATUS = {
  pending: 'Da decidere',
  confirmed: 'Confermata',
  rejected: 'Rifiutata',
  cancelled: 'Annullata'
};

let sb = null;

/* ---------- utilità ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value.length <= 10 ? `${value}T12:00:00` : value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(value) {
  return value ? String(value).slice(0, 5) : '—';
}

let toastTimer = null;
function toast(message, bad) {
  const box = $('#toast');
  box.textContent = message;
  box.classList.toggle('is-bad', !!bad);
  box.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { box.hidden = true; }, 4200);
}

/* ---------- chiamate autenticate ---------- */
async function token() {
  const { data } = await sb.auth.getSession();
  return data.session ? data.session.access_token : null;
}

async function api(path, options = {}) {
  const jwt = await token();
  if (!jwt) { showGate('Sessione scaduta, rientrate.'); throw new Error('no_session'); }

  const headers = { Authorization: `Bearer ${jwt}` };
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) { await sb.auth.signOut(); showGate('Sessione scaduta, rientrate.'); throw new Error('unauthorized'); }
  return res;
}

async function apiJson(path, options) {
  const res = await api(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Richiesta non riuscita.');
  return data;
}

/* ============================================================
   ACCESSO
   ============================================================ */
function showGate(message) {
  $('#gate').hidden = false;
  $('#app').hidden = true;
  const msg = $('#loginMsg');
  msg.classList.remove('is-ok');
  msg.textContent = message || '';
}

async function showApp(user) {
  $('#gate').hidden = true;
  $('#app').hidden = false;
  $('#who').textContent = user.email;
  await Promise.all([loadBookings(), loadCustomers()]);
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const btn = $('#loginBtn');
  const msg = $('#loginMsg');
  msg.classList.remove('is-ok');
  msg.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Attendere…';

  const { data, error } = await sb.auth.signInWithPassword({
    email: $('#l-email').value.trim(),
    password: $('#l-pass').value
  });

  btn.disabled = false;
  btn.textContent = 'Entra';

  if (error) { msg.textContent = 'Email o password non corretti.'; return; }
  $('#l-pass').value = '';
  try {
    await showApp(data.user);
  } catch (err) {
    /* Autenticato ma non nell'elenco dei proprietari. */
    await sb.auth.signOut();
    showGate('Questo account non è abilitato alla gestione.');
  }
});

$('#logoutBtn').addEventListener('click', async () => {
  await sb.auth.signOut();
  showGate('');
});

/* ============================================================
   PRENOTAZIONI
   ============================================================ */
let bookStatus = 'pending';

function bookQuery() {
  const params = new URLSearchParams();
  if (bookStatus) params.set('status', bookStatus);
  const q = $('#b-q').value.trim();
  const from = $('#b-from').value;
  const to = $('#b-to').value;
  if (q) params.set('q', q);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return params.toString();
}

async function loadBookings() {
  const state = $('#bookState');
  state.hidden = false;
  state.textContent = 'Carico…';
  $('#bookList').replaceChildren();

  const data = await apiJson(`/api/admin/reservations?${bookQuery()}`);

  Object.keys(STATUS).forEach((key) => {
    const badge = document.getElementById(`c-${key}`);
    if (badge) badge.textContent = data.counts[key] || 0;
  });

  const rows = data.reservations || [];
  if (!rows.length) {
    state.textContent = 'Nessuna richiesta con questi filtri.';
    return;
  }
  state.hidden = true;
  $('#bookList').append(...rows.map(cardFor));
}

function cell(label, value) {
  const box = el('div', 'cell');
  box.append(el('dt', null, label), el('dd', null, value));
  return box;
}

function cardFor(row) {
  const card = el('article', 'card');
  card.dataset.status = row.status;
  card.dataset.id = row.id;

  const head = el('div', 'card__head');
  const left = el('div');
  left.append(
    el('h2', 'card__name', row.name),
    el('p', 'card__ref', `Rif. ${String(row.id).slice(0, 8).toUpperCase()} · ricevuta il ${fmtDate(row.created_at)}`)
  );
  head.append(left, el('span', `badge badge--${row.status}`, STATUS[row.status] || row.status));
  card.append(head);

  const grid = el('dl', 'card__grid');
  grid.append(
    cell('Data', fmtDate(row.date)),
    cell('Ora', fmtTime(row.time)),
    cell('Coperti', row.guests),
    cell('Serata', KIND[row.kind] || row.kind),
    cell('Lingua', row.lang === 'en' ? 'Inglese' : 'Italiano')
  );
  card.append(grid);

  const contact = el('div', 'card__contact');
  const tel = el('a', 'contact', row.phone);
  tel.href = `tel:${String(row.phone).replace(/[^\d+]/g, '')}`;
  const mail = el('a', 'contact', row.email);
  mail.href = `mailto:${row.email}`;
  contact.append(tel, mail);
  card.append(contact);

  if (row.notes) {
    const notes = el('p', 'card__notes');
    notes.append(el('b', null, 'Note del cliente'), document.createTextNode(row.notes));
    card.append(notes);
  }

  if (row.status === 'pending') {
    card.append(actionsFor(row));
  } else {
    const done = el('p', 'card__done',
      `${STATUS[row.status]} il ${fmtDate(row.decided_at)}${row.decided_by ? ` da ${row.decided_by}` : ''}` +
      `${row.decision_note ? ` — «${row.decision_note}»` : ''}`);
    card.append(done);

    if (row.status === 'confirmed') {
      const undo = el('button', 'btn btn--ghost btn--sm', 'Annulla prenotazione');
      undo.type = 'button';
      undo.addEventListener('click', () => decide(row, 'cancel', '', undo));
      const wrap = el('div', 'card__act');
      wrap.append(undo);
      card.append(wrap);
    }
  }

  return card;
}

function actionsFor(row) {
  const wrap = el('div', 'card__act');

  const note = el('input');
  note.type = 'text';
  note.placeholder = 'Messaggio per il cliente (facoltativo)';
  note.maxLength = 500;

  const yes = el('button', 'btn btn--ok btn--sm', 'Conferma');
  yes.type = 'button';
  const no = el('button', 'btn btn--no btn--sm', 'Rifiuta');
  no.type = 'button';

  yes.addEventListener('click', () => decide(row, 'confirm', note.value.trim(), yes, no));
  no.addEventListener('click', () => {
    if (!confirm(`Rifiutare la richiesta di ${row.name}? Riceverà una email.`)) return;
    decide(row, 'reject', note.value.trim(), yes, no);
  });

  wrap.append(note, yes, no);
  return wrap;
}

async function decide(row, action, note, ...buttons) {
  buttons.forEach((b) => { b.disabled = true; });
  try {
    await apiJson('/api/admin/decide', {
      method: 'POST',
      body: JSON.stringify({ id: row.id, action, note })
    });
    toast(action === 'confirm' ? 'Confermata, email inviata.'
      : action === 'reject' ? 'Rifiutata, email inviata.'
      : 'Prenotazione annullata.');
    await loadBookings();
  } catch (err) {
    toast(err.message, true);
    buttons.forEach((b) => { b.disabled = false; });
  }
}

$('#statusChips').addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  $('#statusChips').querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-on', c === chip));
  bookStatus = chip.dataset.status;
  loadBookings().catch((err) => toast(err.message, true));
});

$('#bookFilters').addEventListener('submit', (event) => {
  event.preventDefault();
  loadBookings().catch((err) => toast(err.message, true));
});

$('#bookFilters').addEventListener('reset', () => {
  setTimeout(() => loadBookings().catch((err) => toast(err.message, true)), 0);
});

/* ============================================================
   CLIENTI
   ============================================================ */
function custQuery() {
  const params = new URLSearchParams();
  const q = $('#c-q').value.trim();
  const city = $('#c-city').value.trim();
  const min = $('#c-agemin').value;
  const max = $('#c-agemax').value;
  if (q) params.set('q', q);
  if (city) params.set('city', city);
  if (min) params.set('ageMin', min);
  if (max) params.set('ageMax', max);
  if ($('#c-marketing').checked) params.set('marketing', '1');
  return params.toString();
}

async function loadCustomers() {
  const state = $('#custState');
  const table = $('#custTable');
  state.hidden = false;
  state.textContent = 'Carico…';
  table.hidden = true;
  $('#custBody').replaceChildren();

  const data = await apiJson(`/api/admin/customers?${custQuery()}`);
  const rows = data.customers || [];

  if (!rows.length) {
    state.textContent = 'Nessun cliente con questi filtri.';
    return;
  }
  state.hidden = false;
  state.textContent = `${rows.length} client${rows.length === 1 ? 'e' : 'i'}.`;
  table.hidden = false;
  $('#custBody').append(...rows.map(rowFor));
}

function td(content, className) {
  const cellEl = el('td', className);
  if (content instanceof Node) cellEl.append(content);
  else cellEl.textContent = content === null || content === undefined || content === '' ? '—' : String(content);
  return cellEl;
}

function rowFor(c) {
  const tr = el('tr');

  const name = el('div');
  name.append(el('span', 't-name', c.name || '—'));
  if (c.tags && c.tags.length) name.append(el('span', 't-sub', c.tags.join(' · ')));
  tr.append(td(name));

  const contact = el('div');
  const mail = el('a', null, c.email);
  mail.href = `mailto:${c.email}`;
  contact.append(mail);
  if (c.phone) {
    const tel = el('a', null, c.phone);
    tel.href = `tel:${String(c.phone).replace(/[^\d+]/g, '')}`;
    const sub = el('span', 't-sub');
    sub.append(tel);
    contact.append(sub);
  }
  tr.append(td(contact));

  tr.append(td(c.age, 't-num'));
  tr.append(td(c.city));
  tr.append(td(`${c.reservations_total || 0} (${c.reservations_confirmed || 0} ok)`, 't-num'));
  tr.append(td(c.guests_total, 't-num'));
  tr.append(td(KIND[c.favourite_kind] || c.favourite_kind));
  tr.append(td(c.last_visit ? fmtDate(c.last_visit) : '—'));

  const consent = el('label');
  const box = el('input');
  box.type = 'checkbox';
  box.checked = !!c.marketing_consent;
  box.addEventListener('change', () => patchCustomer(c.id, { marketing_consent: box.checked }, box));
  consent.append(box, el('span', c.marketing_consent ? 'yes' : 'no', c.marketing_consent ? ' sì' : ' no'));
  tr.append(td(consent));

  tr.append(td(editorFor(c), 't-note'));
  return tr;
}

function editorFor(c) {
  const wrap = el('div');

  const notes = el('input');
  notes.type = 'text';
  notes.placeholder = 'Note interne';
  notes.value = c.notes || '';
  notes.maxLength = 500;

  const tags = el('input');
  tags.type = 'text';
  tags.placeholder = 'Etichette separate da virgola';
  tags.value = (c.tags || []).join(', ');

  const save = el('button', 'btn btn--ghost btn--sm', 'Salva');
  save.type = 'button';
  save.addEventListener('click', () => patchCustomer(c.id, {
    notes: notes.value.trim(),
    tags: tags.value.split(',').map((t) => t.trim()).filter(Boolean)
  }, save));

  wrap.append(notes, tags, save);
  return wrap;
}

async function patchCustomer(id, patch, control) {
  control.disabled = true;
  try {
    await apiJson('/api/admin/customers', { method: 'PATCH', body: JSON.stringify({ id, ...patch }) });
    toast('Scheda aggiornata.');
  } catch (err) {
    toast(err.message, true);
  }
  control.disabled = false;
}

$('#custFilters').addEventListener('submit', (event) => {
  event.preventDefault();
  loadCustomers().catch((err) => toast(err.message, true));
});

$('#custFilters').addEventListener('reset', () => {
  setTimeout(() => loadCustomers().catch((err) => toast(err.message, true)), 0);
});

/* L'esportazione richiede l'intestazione Authorization, quindi non
   può essere un semplice link: il file arriva come blob e lo si
   consegna al browser con un ancora temporanea. */
$('#exportBtn').addEventListener('click', async () => {
  const btn = $('#exportBtn');
  btn.disabled = true;
  try {
    const params = custQuery();
    const res = await api(`/api/admin/customers?${params}${params ? '&' : ''}format=csv`);
    if (!res.ok) throw new Error('Esportazione non riuscita.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = el('a');
    link.href = url;
    link.download = `idros-clienti-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('File scaricato.');
  } catch (err) {
    toast(err.message, true);
  }
  btn.disabled = false;
});

/* ============================================================
   SEZIONI
   ============================================================ */
$('#tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('.tab');
  if (!tab) return;
  $('#tabs').querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-on', t === tab));
  $('#view-bookings').hidden = tab.dataset.view !== 'bookings';
  $('#view-customers').hidden = tab.dataset.view !== 'customers';
});

/* ============================================================
   AVVIO
   ============================================================ */
(async function boot() {
  try {
    const cfg = await fetch('/api/config').then((r) => r.json());
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) throw new Error('config');
    sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (err) {
    showGate('Configurazione del server mancante. Controllate le variabili d\'ambiente su Vercel.');
    $('#loginBtn').disabled = true;
    return;
  }

  const { data } = await sb.auth.getSession();
  if (!data.session) { showGate(''); return; }

  try {
    await showApp(data.session.user);
  } catch (err) {
    await sb.auth.signOut();
    showGate('Questo account non è abilitato alla gestione.');
  }
})();
