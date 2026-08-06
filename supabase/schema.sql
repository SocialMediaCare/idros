-- ============================================================
-- IDROS — schema prenotazioni e anagrafica clienti
-- Da eseguire una volta sola nell'SQL Editor di Supabase.
-- È idempotente: rilanciarlo non rompe nulla.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. CLIENTI
-- Una riga per persona, identificata dall'email. È l'anagrafica
-- che il proprietario usa per le campagne: qui stanno i dati
-- che non cambiano da una prenotazione all'altra.
-- ------------------------------------------------------------
create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  name              text not null,
  phone             text,
  birthdate         date,
  city              text,
  lang              text not null default 'it',
  marketing_consent boolean not null default false,
  notes             text,
  tags              text[] not null default '{}',
  first_seen        timestamptz not null default now(),
  last_seen         timestamptz not null default now()
);

create index if not exists customers_email_idx      on public.customers (lower(email));
create index if not exists customers_marketing_idx  on public.customers (marketing_consent);
create index if not exists customers_birthdate_idx  on public.customers (birthdate);

-- ------------------------------------------------------------
-- 2. PRENOTAZIONI
-- I dati di contatto sono copiati qui apposta: se il cliente
-- cambia numero, la prenotazione vecchia deve restare com'era.
-- ------------------------------------------------------------
create table if not exists public.reservations (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references public.customers(id) on delete set null,

  name          text not null,
  email         text not null,
  phone         text not null,

  date          date not null,
  time          time not null,
  guests        integer not null check (guests between 1 and 60),
  kind          text not null,
  notes         text,

  status        text not null default 'pending'
                  check (status in ('pending','confirmed','rejected','cancelled')),
  decision_note text,
  decided_at    timestamptz,
  decided_by    text,

  lang          text not null default 'it',
  source        text not null default 'web',
  created_at    timestamptz not null default now()
);

create index if not exists reservations_status_idx  on public.reservations (status, date);
create index if not exists reservations_date_idx    on public.reservations (date desc);
create index if not exists reservations_email_idx   on public.reservations (lower(email), created_at desc);
create index if not exists reservations_customer_idx on public.reservations (customer_id);

-- ------------------------------------------------------------
-- 3. VISTA CRM
-- I totali si calcolano qui invece di tenerli aggiornati a mano
-- nella tabella clienti: non possono andare fuori sincrono.
-- ------------------------------------------------------------
create or replace view public.customer_stats as
select
  c.id,
  c.email,
  c.name,
  c.phone,
  c.birthdate,
  extract(year from age(c.birthdate))::int      as age,
  c.city,
  c.lang,
  c.marketing_consent,
  c.notes,
  c.tags,
  c.first_seen,
  c.last_seen,
  count(r.id)                                            as reservations_total,
  count(r.id) filter (where r.status = 'confirmed')       as reservations_confirmed,
  count(r.id) filter (where r.status = 'rejected')        as reservations_rejected,
  count(r.id) filter (where r.status = 'pending')         as reservations_pending,
  coalesce(sum(r.guests) filter (where r.status = 'confirmed'), 0)::int as guests_total,
  max(r.date) filter (where r.status = 'confirmed')       as last_visit,
  mode() within group (order by r.kind)                   as favourite_kind
from public.customers c
left join public.reservations r on r.customer_id = c.id
group by c.id;

-- ------------------------------------------------------------
-- 4. SICUREZZA
-- Nessun accesso diretto dal browser: le tabelle si toccano solo
-- attraverso le funzioni in /api, che usano la service role key.
-- Con RLS attiva e zero policy, la chiave anon non legge niente.
-- ------------------------------------------------------------
alter table public.customers    enable row level security;
alter table public.reservations enable row level security;

revoke all on public.customers    from anon, authenticated;
revoke all on public.reservations from anon, authenticated;
revoke all on public.customer_stats from anon, authenticated;
