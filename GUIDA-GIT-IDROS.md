# Guida Git per il sito IDROS (da dare in pasto a Claude Code)

> Questo file è pensato per essere letto da Claude Code.
> Aprilo con Claude Code e digli: **"leggi GUIDA-GIT-IDROS.md e aiutami a seguirla"**.

## Contesto

- Repo GitHub: `https://github.com/SocialMediaCare/idros` (pubblica, branch `main`)
- Account GitHub: **SocialMediaCare** — è lo stesso account usato anche da un'altra
  persona che lavora sullo stesso sito.
- Il sito è statico: HTML + CSS + JS puri, nessun build step, nessuna dipendenza.
- Server locale per vedere il sito: `python3 serve.py` → http://localhost:8137

**IMPORTANTE:** dato che siamo in due a lavorare sullo stesso repo, la regola d'oro è:
**prima di iniziare a lavorare si fa sempre `git pull`, alla fine si fa `git push`.**

---

## 1. Setup iniziale (solo la prima volta)

### 1a. Installa git e la CLI di GitHub (se non le hai)

Su macOS:

```bash
xcode-select --install     # installa git (se manca)
brew install gh            # installa la CLI di GitHub
```

### 1b. Fai il login su GitHub

```bash
gh auth login
```

Rispondi così:
- `GitHub.com`
- `HTTPS`
- `Authenticate Git with your GitHub credentials?` → **Yes**
- `Login with a web browser` → si apre il browser, incolla il codice e accedi con
  l'account **SocialMediaCare**.

Verifica:

```bash
gh auth status
```

Deve comparire l'account `SocialMediaCare`. Se compaiono più account, seleziona quello
giusto con `gh auth switch --user SocialMediaCare`.

### 1c. Imposta nome ed email dei commit

```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua@email.com"
```

### 1d. Scarica il repo (clone)

Scegli una cartella dove tenere il progetto, per esempio la Scrivania:

```bash
cd ~/Desktop
git clone https://github.com/SocialMediaCare/idros.git
cd idros
```

Fatto. Ora hai una copia locale del sito. Il clone si fa **una sola volta**.
Da qui in poi userai solo `pull` e `push`.

---

## 2. Il ciclo di lavoro (ogni volta che ci lavori)

### PRIMA di toccare qualsiasi file → PULL

```bash
git pull
```

Questo scarica le modifiche fatte dall'altra persona. **Non saltare mai questo passo**:
se modifichi file vecchi senza aver pullato, rischi conflitti fastidiosi.

### Poi lavori

Modifica i file, prova il sito in locale con `python3 serve.py`.

### ALLA FINE → commit + push

```bash
git status                 # vedi cosa hai cambiato
git add .                  # prepara le modifiche
git commit -m "descrizione breve di cosa hai cambiato"
git push
```

E il gioco è fatto: le modifiche sono online e l'altra persona le vedrà al suo
prossimo `git pull`.

---

## 3. Cosa dire a Claude Code

Non serve che tu impari i comandi a memoria. Basta che a Claude Code dici:

- All'inizio della sessione:
  > "Fai un git pull prima di iniziare, controlla se ci sono modifiche nuove."

- Alla fine della sessione:
  > "Fai commit e push delle modifiche."

Claude eseguirà i comandi per te. Se qualcosa va storto, digli semplicemente:
> "Il push ha dato errore, risolvilo tu."

---

## 4. Problemi comuni

**"Updates were rejected because the remote contains work that you do not have"**
Vuol dire che l'altra persona ha pushato qualcosa mentre lavoravi. Soluzione:

```bash
git pull --rebase
git push
```

**Conflitto (CONFLICT: Merge conflict in ...)**
Due persone hanno modificato le stesse righe. Non farti prendere dal panico e non
cancellare nulla: chiedi a Claude Code
> "C'è un conflitto di merge, aiutami a risolverlo senza perdere modifiche."

**Non ricordo se ho pushato**

```bash
git status
```

Se dice `Your branch is up to date with 'origin/main'` e `nothing to commit`, sei a posto.

---

## 5. Regole da rispettare

- ❌ **Mai** committare file `.env`, password, chiavi API o credenziali: **il repo è pubblico**.
- ❌ Mai usare `git push --force` o `git reset --hard` senza chiedere all'altra persona.
- ✅ Sempre `git pull` prima di iniziare.
- ✅ Sempre `git push` quando hai finito (non lasciare lavoro solo sul tuo computer).
- ✅ Messaggi di commit brevi ma chiari ("aggiunta sezione menu", "fix menu mobile").
