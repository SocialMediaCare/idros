# IDROS — messa in funzione delle prenotazioni

Guida passo passo. Non serve saper programmare: si tratta di aprire tre
siti (Supabase, Resend, Vercel), copiare qualche chiave e incollarla.

Alla fine avrete:

- il modulo del sito che registra le richieste e manda una mail al cliente;
- una mail di avviso al ristorante a ogni nuova richiesta;
- la pagina `/admin` dove accettare o rifiutare (ogni scelta manda la mail al cliente);
- l'elenco clienti con filtri ed esportazione per Excel.

---

## 1. Supabase (il database)

1. Su [supabase.com](https://supabase.com) create un progetto. Regione: **Frankfurt**
   o **Milan**, per stare vicini ai clienti.
2. Aprite **SQL Editor → New query**, incollate tutto il contenuto di
   `supabase/schema.sql` e premete **Run**. Crea le tabelle e blocca ogni
   accesso diretto dal browser.
3. Andate in **Project Settings → API** e annotate:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (segreta: scavalca ogni
     permesso, non va mai nel browser né in un commit)
4. Andate in **Authentication → Users → Add user**, create l'utente del
   proprietario con email e password, e spuntate **Auto Confirm User**.
   Quella email dovrà comparire in `ADMIN_EMAILS`.

## 2. Resend (le email)

1. Su [resend.com](https://resend.com) aggiungete il dominio del ristorante in
   **Domains** e inserite nel DNS i record che vi mostra (SPF, DKIM). Senza
   dominio verificato si può provare solo con `onboarding@resend.dev`, che però
   scrive soltanto all'indirizzo con cui vi siete registrati.
2. **API Keys → Create** → copiate la chiave: è `RESEND_API_KEY`.

## 3. Vercel (il sito)

1. Su [vercel.com](https://vercel.com) fate **Add New → Project** e collegate il
   repository GitHub. Non toccate nulla nelle impostazioni di build: il sito è
   statico e le funzioni in `api/` vengono riconosciute da sole.
2. **Settings → Environment Variables**: aggiungete una per una le voci elencate
   in `.env.example`, per gli ambienti *Production*, *Preview* e *Development*.
3. Fate **Deploy**. Dopo il primo deploy tornate nelle variabili, correggete
   `SITE_URL` con l'indirizzo definitivo (senza barra finale) e rilanciate il
   deploy dalla scheda *Deployments*.

## 4. Prova

1. Aprite il sito, compilate il modulo: deve arrivare la mail «Richiesta
   ricevuta» al cliente e l'avviso al ristorante.
2. Aprite `/admin`, entrate con l'utente creato al punto 1.4.
3. Premete **Conferma**: al cliente arriva la mail di conferma. Con **Rifiuta**
   arriva quella di rifiuto. Il testo scritto nel campo «Messaggio per il
   cliente» finisce dentro l'email.
4. Nella scheda **Clienti** premete **Esporta Excel (CSV)**: il file si apre con
   doppio clic in Excel, accenti compresi.

---

## Come si usa il pannello

**Prenotazioni.** Le richieste nuove sono sotto *Da decidere*. Ogni scheda mostra
telefono ed email cliccabili: se serve concordare un cambio, si chiama prima di
decidere. Le confermate si possono ancora annullare (l'annullamento **non** manda
email: avvisate voi il cliente).

**Clienti.** Una riga per persona, con età, città, quante volte è venuta, quanti
coperti ha portato e la serata che sceglie più spesso. I filtri (età, città,
consenso) restringono l'elenco **e** l'esportazione: filtrate prima, esportate
poi, e avete la lista pronta per una campagna. Note ed etichette si scrivono
direttamente in tabella, il pulsante *Salva* le registra.

**Chi riceve cosa.** `ADMIN_EMAILS` decide chi *entra* nel pannello, `MAIL_OWNER`
chi *riceve l'avviso* di nuova richiesta: sono elenchi separati, e in entrambi si
possono mettere più indirizzi divisi da virgola. Finché il dominio non è verificato
su Resend, però, le mail arrivano soltanto al titolare dell'account Resend.

**Consenso marketing.** La spunta in tabella si può togliere: serve quando un
cliente chiede di non ricevere più comunicazioni. Chi non ha la spunta non va
contattato per pubblicità.

---

## Sviluppo in locale

Solo la parte grafica:

```bash
python3 serve.py          # http://localhost:8137
```

Con le API funzionanti serve la CLI di Vercel:

```bash
npm install
npm i -g vercel
vercel link
vercel env pull .env.local
vercel dev                # http://localhost:3000
```

`.env.local` contiene le chiavi vere: è escluso da git e non va condiviso.

---

## Se qualcosa non va

| Sintomo | Causa quasi sempre |
|---|---|
| `/admin` dice «Configurazione del server mancante» | mancano `SUPABASE_URL` o `SUPABASE_ANON_KEY` su Vercel |
| «Questo account non è abilitato» | l'email non è dentro `ADMIN_EMAILS` (attenzione agli spazi) |
| Il modulo risponde ma non arriva nessuna mail | `RESEND_API_KEY` sbagliata o dominio non verificato |
| «La mail al cliente non è partita» | Resend ha rifiutato l'invio; la prenotazione è rimasta com'era, si può riprovare |
| Il CSV in Excel ha caratteri strani | è stato aperto con un programma diverso: usate Excel o Numbers |

---

## Regole di sicurezza

Il repository è **pubblico**. Chiavi, password e indirizzi dei clienti non
devono mai finire in un file del progetto: vivono solo nelle variabili
d'ambiente di Vercel. La `service_role` di Supabase in particolare dà accesso
completo al database: se sospettate che sia uscita, rigeneratela subito dalla
dashboard.
