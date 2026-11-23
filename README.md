# IDROS — sito web

Sito bilingue (IT/EN) per il ristorante IDROS di Milano Marittima.
Pagina unica, nero pieno, impaginazione ricostruita da
[liogroup.com/mykonos](https://www.liogroup.com/mykonos).

HTML + CSS + JavaScript, nessun build step. Le prenotazioni girano su funzioni
serverless Vercel con database Supabase ed email Resend: la messa in funzione è
descritta in **[SETUP.md](SETUP.md)**.

## Vederlo in locale

```bash
python3 serve.py
```

Poi apri <http://localhost:8137>. Ctrl+C per fermare.

Così funziona solo la parte pubblica: il modulo ha bisogno delle API, che
richiedono `vercel dev` (vedi SETUP.md).

## Struttura

```
index.html                  la home
menu.html                   il menu (generato, vedi «Il menu»)
privacy.html cookie.html    pagine legali
termini.html  404.html
assets/css/style.css        design system e layout
assets/css/anim.css         stati iniziali delle animazioni, preloader, cursore
assets/js/i18n.js           traduzioni (l'italiano sta nell'HTML, qui c'è l'inglese)
assets/js/anim.js           regia GSAP + Lenis
assets/js/i18n-menu.js      traduzioni inglesi della pagina menu (generate)
assets/js/main.js           menu, validazione, modulo che apre la mail, ripiego senza GSAP
assets/fonts/ assets/vendor/  caratteri e librerie serviti dal sito (niente terze parti)
assets/img/foto/            le foto, già ritagliate e in WebP
assets/pdf/idros-menu.pdf   il menu da scaricare
tools/menu/                 trascrizione del menu e generatore della pagina
admin/                      pannello del proprietario (login, prenotazioni, clienti)
api/                        funzioni serverless: modulo pubblico e area riservata
supabase/schema.sql         tabelle, vista CRM e blocco degli accessi
serve.py                    server locale per la sola parte grafica
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
    <div class="tit__text" data-anim="lines">
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
della pagina: senza, la composizione resta ferma e perde tutto l'effetto. Con
`data-depth` si regola l'intensità.

**`data-anim`** decide come entra il blocco: `lines` (righe di testo che salgono da
una maschera), `rise`, `fade`, `stagger` (figli a cascata), `unveil` (foto svelata
dal basso con la scala che rientra).

### I due tipi di pulsante

| Classe | Aspetto | Dove usarla |
|---|---|---|
| `.link` | testo con riga e quadratino a sinistra; in hover il quadratino si allunga e tutto diventa oro | CTA di sezione, card |
| `.actions` | contenitore per due link vicini (es. Prenota + Menù) | sezione Ristorante |
| `.ghost` | riquadro bordato 46px | pila dell'hero |
| `.ghost--solid` | riquadro pieno bianco | invio del modulo |

Aggiungi `.link--block` quando il link sta da solo su una riga.

### Card con testo sulla foto

Nel layout `quickLinks` il testo sta **sopra** la fotografia, in basso a sinistra,
e non c'è paragrafo — solo titolo e link:

```html
<article class="ql__card" data-anim="rise">
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

Tutti gli slot hanno la loro foto, in `assets/img/foto/`, in WebP e in due misure
(`-<larghezza>.webp`), con `srcset` e `sizes`: il browser scarica quella adatta allo
schermo. Gli originali (circa 150 MB) stanno fuori dal sito; qui ci sono solo i
ritagli, già nel rapporto d'aspetto dello slot (3,3 MB in tutto). L'hero e la
sezione a tutta pagina hanno un ritaglio orizzontale per gli schermi larghi e la
foto verticale intera per i telefoni (`<picture>` con `media`).

Criterio: dove si parla di ristorante, piatti e persone a tavola; dove si parla
del locale, il lampadario e i dettagli della sala.

Le classi `media--*` impongono il **rapporto d'aspetto misurato sul riferimento**.

| Classe | Rapporto | Dove |
|---|---|---|
| `media--square` | 1:1 (552×552) | quickLinks |
| `media--47` | 435:765 | foto grande di `twoImagesText` |
| `media--23` | 316:465 | foto piccola di `twoImagesText` |
| `media--69` | 688:1000 | foto grande di `altLayout` |
| `media--68` | 322:473 | foto piccola di `altLayout` |
| `media--45` | 4:5 | pagina menu |

### Cambiare una foto

Ritagliarla nel rapporto della classe, esportarla in WebP (qualità 70-75) in due
larghezze come le altre, e sostituire i nomi in `src` e `srcset`. Sempre `width`,
`height` e un `alt` che descriva la foto; `loading="lazy"` su tutte tranne l'hero.
Le foto devono essere **scure e contrastate**: su fondo nero una foto chiara e
piatta rompe l'impianto.

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

## Contenuti ancora da verificare

Sito online dal 23 novembre 2026. Foto, menu, contatti e pagine legali sono veri.
Restano scritti dal primo generatore, e vanno fatti rileggere al ristorante:

- **Testi** di Esperienza, Ristorante, FAQ e il riferimento all'**idroscalo**
  (violino, ballerine, attore, DJ set fino alle tre: verosimili ma non verificati).
- **Orari** nella sezione Contatti.

L'italiano si modifica in `index.html`. Per ogni testo cambiato va aggiornata la
traduzione in `assets/js/i18n.js`: la chiave è la stessa dell'attributo `data-i18n`.

### Eventi

La sezione Eventi mostra «Coming soon». L'elenco degli appuntamenti è in
`index.html`, dentro un commento (`ELENCO EVENTI — pronto, solo spento`): per
riattivarlo si tolgono i segni di commento, si aggiornano date e titoli e le
traduzioni `ev.1.t` … `ev.4.t` in `i18n.js`, e si toglie il blocco `.soon`.

### Social

Le icone Instagram, Facebook e Spotify nel piè di pagina sono commentate finché
non ci sono gli indirizzi veri delle pagine.

---

## Il menu

La pagina `/menu` (`menu.html`) e le sue traduzioni (`assets/js/i18n-menu.js`)
sono **generate** dalla trascrizione del PDF in `tools/menu/data.py`. Quando
cambia il menu:

1. si sostituisce il PDF in `assets/pdf/idros-menu.pdf`;
2. si aggiornano piatti, descrizioni, allergeni e prezzi in `tools/menu/data.py`;
3. dalla cartella del sito: `python3 tools/menu/gen.py`.

Il PDF ha `noindex`: su Google deve comparire la pagina, non il file.

---

## Le prenotazioni

Per ora **al telefono**: tutti i «Prenota» del sito sono link `tel:`. In
alternativa il modulo in fondo alla home compone una mail per
`info@idrosmilanomarittima.it` e la apre nel programma di posta del cliente;
il sito non riceve né salva nulla.

La piattaforma (database, mail automatiche, pannello `/admin`) è spenta, non
cancellata: come riaccenderla è spiegato in [SETUP.md](SETUP.md), punto 6.

---

## Privacy, cookie, termini

`privacy.html`, `cookie.html`, `termini.html`, linkate dal piè di pagina di ogni
pagina. Il sito **non usa cookie e non contatta server di terzi**: caratteri
(`assets/fonts/`) e librerie (`assets/vendor/`) sono serviti dal dominio stesso,
quindi non serve il banner. Se si aggiungono Analytics, Meta Pixel, una mappa
incorporata, un widget di prenotazione o i font da Google, diventa obbligatorio
e vanno aggiornate privacy e cookie policy.

---

## Pubblicazione

**Vercel**, perché servono le funzioni in `api/`. Ogni push su `main` pubblica il
sito da solo (`.github/workflows/deploy.yml`). Procedura completa in
[SETUP.md](SETUP.md).

**Google Search Console**: proprietà `https://idrosmilanomarittima.it/`,
sitemap `https://idrosmilanomarittima.it/sitemap.xml` (va aggiornata a mano
quando si aggiunge una pagina).

---

## Note tecniche

**Animazioni.** GSAP + ScrollTrigger + Lenis, serviti dal sito (`assets/vendor/`), con `defer`. Tre livelli di
sicurezza: se le librerie arrivano, `anim.js` prende il comando; se non arrivano
entro cinque secondi uno script inline toglie `gsap-on` e `main.js` fa comparire i
blocchi con `IntersectionObserver`; senza JavaScript la pagina è statica e
completamente leggibile. Nessuno di questi casi lascia un contenuto invisibile.

**Accessibilità** — contrasti: bianco 21:1, secondario 11,6:1, terziario 7,3:1,
oro 8,95:1. Tutti AAA. Focus visibile, target touch ≥ 44px, ogni campo con label,
`prefers-reduced-motion` disattiva parallasse e reveal.

**Sicurezza.** Il repository è pubblico: nessuna chiave sta nel codice. Le tabelle
Supabase hanno RLS attiva e zero policy, quindi la chiave anon non legge niente —
si passa sempre dalle funzioni in `api/`, che verificano il token del proprietario
e controllano che l'email sia in `ADMIN_EMAILS`.

**Browser** — Chrome, Safari, Firefox ed Edge recenti. `backdrop-filter` ha già il
prefisso `-webkit-` per Safari.
