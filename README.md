# IDROS — sito web

Sito statico bilingue (IT/EN) per il ristorante IDROS di Milano Marittima.
Pagina unica, nero pieno, impaginazione ricostruita da
[liogroup.com/mykonos](https://www.liogroup.com/mykonos).

HTML + CSS + JavaScript. **Nessuna dipendenza esterna**, nessun build step.

## Vederlo in locale

```bash
python3 serve.py
```

Poi apri <http://localhost:8137>. Ctrl+C per fermare.

## Struttura

```
index.html                  tutta la pagina
assets/css/style.css        design system e layout
assets/js/i18n.js           traduzioni (l'italiano sta nell'HTML, qui c'è l'inglese)
assets/js/main.js           reveal, parallasse, menu, validazione, prenotazioni
assets/img/                 vuota — qui vanno le foto
design-system/idros/        misure prese dal riferimento e regole di layout
serve.py                    server locale
```

---

## Come è fatta la pagina

Ogni sezione è marcata con `data-layout`, come nel sito di riferimento. Per aggiungere
una sezione **non serve inventare un layout**: se ne sceglie uno esistente e si
riempiono gli slot.

| `data-layout` | Cosa fa | Dove è usato |
|---|---|---|
| `hero` | Schermo pieno, pila di prenotazione al centro | apertura |
| `quickLinks` | Tre quadrati a zigzag, testo sopra la foto | indice sotto l'hero |
| `twoImagesText` | Testo + due foto sfalsate di dimensioni diverse | Esperienza, Ristorante, Come raggiungerci |
| `fullBleedMedia` | Foto a tutta pagina con titolo sopra | dichiarazione |
| `twoImagesTextAltLayout` | Foto grande a sx, foto piccola + testo a dx | Eventi |
| `gallery` | Striscia orizzontale sfalsata, trascinabile | galleria |
| `form` | Contatti + modulo di prenotazione | Contatti |
| `faqs` | Fisarmonica di domande | FAQ |

### Aggiungere una sezione `twoImagesText`

Copia questo blocco e cambia testi e `data-img-slot`:

```html
<section class="sec" data-layout="twoImagesText" id="la-tua-sezione">
  <div class="wrap tit">
    <div class="tit__text" data-reveal>
      <p class="eyebrow">Occhiello</p>
      <h2 class="h2">Titolo della sezione</h2>
      <p>Testo.</p>
      <a class="link link--block" href="#prenota">Prenota</a>
    </div>
    <div class="tit__sec" data-parallax="secondary">
      <figure class="media media--23" data-img-slot="nome-2">
        <span class="media__label">Fotografia · piccola</span>
      </figure>
    </div>
    <div class="tit__main">
      <figure class="media media--47" data-img-slot="nome-1">
        <span class="media__label">Fotografia · grande</span>
      </figure>
    </div>
  </div>
</section>
```

Aggiungi `data-mirror` alla `<section>` per specchiare la composizione (immagini a
sinistra, testo a destra). Nel sito è già così per la sezione Ristorante.

**`data-parallax="secondary"`** è ciò che fa scorrere la foto piccola più lentamente
della pagina: senza, la composizione resta ferma e perde tutto l'effetto.
**`data-reveal`** fa comparire il blocco dal basso quando entra nella finestra.

### I due tipi di pulsante

| Classe | Aspetto | Dove usarla |
|---|---|---|
| `.link` | testo con riga e quadratino a sinistra; in hover il quadratino si allunga e tutto diventa bordeaux | CTA di sezione, card |
| `.actions` | contenitore per due link vicini (es. Prenota + Menù) | sezione Ristorante |
| `.ghost` | riquadro bordato 46px | pila dell'hero |
| `.ghost--solid` | riquadro pieno bianco | invio del modulo |

Aggiungi `.link--block` quando il link sta da solo su una riga.

### Card con testo sulla foto

Nel layout `quickLinks` il testo sta **sopra** la fotografia, in basso a sinistra,
e non c'è paragrafo — solo titolo e link:

```html
<article class="ql__card" data-reveal>
  <figure class="media media--square" data-img-slot="nome">
    <span class="media__label">Fotografia · didascalia</span>
  </figure>
  <div class="ql__over">
    <h3 class="ql__t">Titolo</h3>
    <a class="link" href="#sezione">Vai</a>
  </div>
</article>
```

Il velo scuro sotto il testo è automatico: serve perché una foto chiara
renderebbe illeggibile il titolo bianco.

---

## Le foto

Ci sono **19 slot**. Finché sono vuoti mostrano un fondo materico con un'etichetta:
non sembrano rotti, sembrano in attesa.

Le classi `media--*` impongono il **rapporto d'aspetto misurato sul riferimento**.
È da lì che nasce l'effetto "foto di dimensioni diverse fra loro": vanno rispettate.

| Classe | Rapporto | Dove |
|---|---|---|
| `media--square` | 1:1 (552×552) | quickLinks |
| `media--47` | 435:765 | foto grande di `twoImagesText` |
| `media--23` | 316:465 | foto piccola di `twoImagesText` |
| `media--69` | 688:1000 | foto grande di `altLayout` |
| `media--68` | 322:473 | foto piccola di `altLayout` |

### Inserire una foto

```html
<!-- prima -->
<figure class="media media--47" data-img-slot="esperienza-1">
  <span class="media__label" data-i18n="slot.exp1">Fotografia · La sala</span>
</figure>

<!-- dopo -->
<figure class="media media--47" data-img-slot="esperienza-1">
  <img src="assets/img/sala.webp" alt="La sala di IDROS durante lo spettacolo"
       loading="lazy" width="870" height="1530">
</figure>
```

Il CSS che posiziona l'immagine dentro lo slot **c'è già** (`object-fit:cover`):
non devi aggiungere nulla.

**Requisiti:** WebP o AVIF, lato lungo 1600–2000px, `loading="lazy"` su tutte tranne
l'hero, `width` e `height` sempre indicati. Le foto devono essere **scure e
contrastate**: su fondo nero una foto chiara e piatta rompe l'impianto.

Ritaglia rispettando il rapporto della classe, altrimenti `cover` taglia i bordi.

### Video nell'hero

Come fa il riferimento:

```html
<div class="hero__media media" data-img-slot="hero">
  <video autoplay muted loop playsinline poster="assets/img/hero.webp">
    <source src="assets/img/hero.mp4" type="video/mp4">
  </video>
</div>
```

`muted` e `playsinline` sono obbligatori, altrimenti iOS non riproduce.

---

## Cosa va sostituito prima di pubblicare

Tutto quello che segue è **segnaposto**. Il contenitore è finito, i contenuti no.

### 1. Contatti — `assets/js/main.js`

```js
var CONFIG = {
  whatsapp: '390000000000',        // numero vero, internazionale senza +
  email:    'prenotazioni@idros.it'
};
```

Lo stesso numero va aggiornato anche in `index.html`: cerca `+39 0544 000000`
(sezione Contatti e dati strutturati `schema.org`) e `prenotazioni@idros.it`.

### 2. Indirizzo, orari, P. IVA — `index.html`

| Segnaposto | Dove |
|---|---|
| `Viale Gramsci 1` / `48015 Milano Marittima (RA)` | Come raggiungerci + JSON-LD |
| `P. IVA 00000000000` | footer |
| Orari | sezione Contatti |

Gli orari non aggiornati sono uno dei due modi in cui un sito di ristorante fallisce.
L'altro sono le foto brutte.

### 3. Testi, eventi e FAQ

Descrizioni, date e risposte sono **inventate**, verosimili ma inventate.

L'italiano si modifica in `index.html`. Per ogni testo cambiato, aggiorna la
traduzione in `assets/js/i18n.js`: la chiave è la stessa dell'attributo `data-i18n`.

Esempio: `<h3 data-i18n="ql.1.t">Vieni a cena</h3>` → cerca `'ql.1.t'` in `i18n.js`.

### 4. Riferimento all'idroscalo — **da verificare**

Scritto senza date né dettagli verificabili, perché non ho fonti sull'idroscalo di
Milano Marittima. Fallo controllare a chi conosce la storia del posto prima di
pubblicare: se ci sono fatti reali il testo diventa molto più forte, e se il
riferimento è più libero è meglio saperlo prima che lo scriva un giornalista.

### 5. Il link "Scopri il nostro menù" — **da collegare**

Nella sezione Ristorante c'è un secondo link accanto a "Prenota un tavolo" che
al momento punta a `href="#"`: non porta da nessuna parte. Va collegato a un PDF
del menu (`assets/menu.pdf`) o a una pagina dedicata, prima di pubblicare.

Il menu non è più diviso in tre percorsi degustazione: la sezione ora descrive
il carattere della carta senza elencare piatti e prezzi, che invecchiano male su
un sito. L'elenco vero sta nel PDF o nella pagina che collegherai qui.

### 6. Privacy e Cookie

I link nel footer sono `href="#"`. Servono due pagine reali: il modulo raccoglie nome,
telefono, email e note.

Il sito **non usa cookie e non traccia nulla**, quindi al momento non serve un banner.
Se aggiungi Analytics, Meta Pixel o il widget di un motore di prenotazione, diventa
obbligatorio.

---

## Le prenotazioni

Tre ingressi, tutti verso lo stesso modulo:

1. **La pila al centro dell'hero** — quattro tipi di serata; ogni bottone preimposta
   il campo "Tipo di serata" nel modulo tramite `data-book`
2. **Prenotazioni in navigazione**
3. **Bottoni di sezione** — ognuno con il proprio `data-book`

Il modulo valida i campi e apre il client di posta, oppure WhatsApp col pulsante
dedicato. Messaggio generato:

```
Richiesta di prenotazione — IDROS

Nome: Mario Rossi
Telefono: 333 1234567
Email: mario@esempio.it
Data: 2026-08-22
Ora: 20:30
Coperti: 4
Serata: DJ set & dopocena
Note: Allergia ai crostacei.
```

### Passare a un motore esterno

Si sostituisce `<form id="bookingForm">` con il widget di TheFork, OpenTable o
Quandoo senza toccare il resto. Attenzione: quei widget portano la loro grafica,
quasi sempre chiara e arrotondata — su questo impianto vanno ridisegnati.

---

## Pubblicazione

Sito statico: Netlify, Vercel, Cloudflare Pages, GitHub Pages o FTP tradizionale.

- [ ] Contatti reali ovunque
- [ ] Foto vere nei 19 slot
- [ ] Menu, prezzi, calendario e FAQ reali
- [ ] Testo storico verificato
- [ ] Pagine Privacy e Cookie
- [ ] Favicon (manca)
- [ ] `og:image` per le anteprime social (manca)
- [ ] HTTPS attivo

---

## Note tecniche

**Zero dipendenze.** Il sito di riferimento non usa GSAP né librerie di scroll, e
nemmeno noi: reveal via `IntersectionObserver`, parallasse via `requestAnimationFrame`.
Niente CDN da cui dipendere, niente da aggiornare.

**Accessibilità** — contrasti: bianco 21:1, secondario 11,6:1, terziario 7,3:1,
ottone 8,2:1. Tutti AAA. Focus visibile, target touch ≥ 44px, ogni campo con label,
`prefers-reduced-motion` disattiva parallasse e reveal.

**Se JavaScript non parte** il sito resta completamente leggibile: tre reti di
sicurezza indipendenti impediscono che un'animazione lasci un contenuto invisibile.
Dettaglio in `design-system/idros/MASTER.md` §3.

**Browser** — Chrome, Safari, Firefox ed Edge recenti. `backdrop-filter` ha già il
prefisso `-webkit-` per Safari.
