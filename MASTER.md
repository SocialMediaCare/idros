# IDROS — Design System (MASTER)

Sistema di layout ricostruito da **[liogroup.com/mykonos](https://www.liogroup.com/mykonos)**.

Le misure qui sotto non sono stimate a occhio: sono state lette dal DOM del sito di
riferimento a 1440px e riprodotte. Dove ci siamo discostati, è annotato il perché.

**Cosa è stato replicato:** impaginazione, proporzioni, offset, tecniche e corse di
animazione, comportamento dello scroll, scala tipografica.
**Cosa non è stato copiato:** fotografie, testi e marchio — materiale protetto, e
comunque sostituito dai contenuti IDROS.

---

## 1. Il sistema a layout nominati

Il riferimento marca ogni sezione con `data-layout`. Abbiamo fatto lo stesso, così
aggiungere una sezione significa scegliere un layout esistente, non inventarne uno.

| `data-layout` | Uso in IDROS | Altezza a 1440 |
|---|---|---|
| `hero` | Apertura, pila di prenotazione al centro | 100svh |
| `quickLinks` | "Scopri" — tre quadrati a zigzag | contenuto |
| `twoImagesText` | Esperienza · Ristorante · Come raggiungerci | 885px |
| `fullBleedMedia` | Dichiarazione a tutta pagina | 100svh |
| `twoImagesTextAltLayout` | Eventi | contenuto |
| `gallery` | Striscia sfalsata scorrevole | 435px |
| `form` | Contatti + modulo | contenuto |
| `faqs` | Domande frequenti | contenuto |
| `socialMedia` | Footer | contenuto |

L'ordine attuale riproduce il ritmo del riferimento: apertura, indice, sezione,
respiro a tutta pagina, sezione, sezione alternata, galleria, sezione, contatti, FAQ.

## 2. Geometria verificata

Confronto fra il riferimento e la nostra ricostruzione, entrambi a 1440px e allo
stesso stato di parallasse:

### `twoImagesText`

| Elemento | Lío | IDROS |
|---|---|---|
| Testo | x=32, w=440 | x=32, w=440 |
| Immagine secondaria | x=627, 316×465 | x=627, 316×466 |
| Immagine principale | x=973, 435×765 | x=973, 435×765 |
| Altezza sezione | 885 | 885 |

Proporzioni: testo **32%** · secondaria **23%** · principale **31,6%**, tutte
allineate in basso, `margin-left:auto` sulla secondaria a creare lo spazio elastico,
gap fisso 30px fra le due immagini.

### `twoImagesTextAltLayout`

| Elemento | Lío | IDROS |
|---|---|---|
| Principale | x=32, 688×1000 | x=32, 688×1000 |
| Secondaria | x=865, 322×473 | x=864, 321×472 |

La colonna destra **non è a filo destro**: parte al 60,5% ed è larga 33,3%, lasciando
circa 100px di aria a destra. È voluto, e va mantenuto.

### `gallery`

| Elemento | Lío | IDROS |
|---|---|---|
| Verticale | x=30, 240×315 | x=30, 240×315 |
| Orizzontale | x=300, 451×266 | x=300, 451×266 |

Gap 30px, l'orizzontale sfalsata 25px più in basso. La striscia eccede la larghezza
della finestra: scorre orizzontalmente, con trascinamento a mouse.

### `quickLinks`

Riferimento: quadrati 552×552, sinistra y=60, destra y=236, sinistra y=772.

Due scostamenti voluti:

- **Niente titolo di sezione.** Il "Discover More" del riferimento qui non c'è: le
  card partono subito sotto l'hero (30px), che è il ritmo richiesto.
- **La colonna destra è centrata verticalmente**, non sfalsata di 176px fissi.
  Avendo una card sola contro le due di sinistra, l'offset fisso lasciava 594px di
  vuoto in fondo; centrandola scende a 394px e lo sfalsamento resta leggibile.
  È una regola che si autoregola col contenuto, non un numero magico.

Il passo verticale interno è elastico (`clamp(3rem,7vw,6.5rem)`) invece dei 160px
fissi del riferimento, perché i nostri blocchi di testo sono più alti dei loro.

### `quickLinks` — testo sopra la foto

Nel riferimento la card **non ha paragrafo**: solo il titolo e il link, entrambi
sovrapposti alla fotografia in basso a sinistra.

| Elemento | Lío | IDROS |
|---|---|---|
| Titolo | 38px, peso 300, maiuscolo | 38px, peso 300, maiuscolo |
| Titolo da sinistra | 64px | 64px |
| Link da sinistra / dal fondo | 64px / 64px | 64px / 64px |
| Margine mobile | 20px, 40px sotto | 20px, 40px sotto |

Sotto il testo c'è un velo (`linear-gradient` dal 40% in giù) che non esiste nel
riferimento: serve perché una fotografia chiara renderebbe illeggibile il titolo.

### Il pulsante di sezione

Il "pulsante" delle sezioni **non ha bordo**. È un testo con `padding-left:45px`,
preceduto da una riga e da un quadratino costruiti con gli pseudo-elementi:

| | Lío | IDROS |
|---|---|---|
| `::before` (riga) | 35×1px | 35×1px |
| `::after` (quadratino) | 5×5px | 5×5px |
| Hover | il quadratino va a 35px, tutto passa all'accento | identico |
| Transizione | 500ms `cubic-bezier(.4,0,.2,1)` | identica |

Verificato a misura: a riposo testo bianco e quadratino 5px; in hover testo
`rgb(219,71,86)` e quadratino 35px.

I bottoni bordati (46px, bordo 1px) restano solo dove li usa il riferimento:
la pila dell'hero. Nel modulo restano bottoni perché sono controlli di form,
non link.

**Coppie di link (`.actions`).** Due link affiancati non entrano nella colonna di
testo: insieme misurano ~468px contro i 440 disponibili, e nelle sezioni specchiate
lo sconfinamento finirebbe contro il bordo della finestra. Farli entrare
richiederebbe rimpicciolire il testo al pixel, cosa fragile perché il font cambia
da Gill Sans a Jost secondo la piattaforma e le metriche non coincidono. Restano
quindi incolonnati con passo zero — leggono come una coppia — e si affiancano
solo da 1500px in su.

### Rapporti d'aspetto delle immagini

```css
.media--square { aspect-ratio: 1/1 }        /* 552 × 552 */
.media--47     { aspect-ratio: 435/765 }    /* principale twoImagesText */
.media--23     { aspect-ratio: 316/465 }    /* secondaria */
.media--69     { aspect-ratio: 688/1000 }   /* principale altLayout */
.media--68     { aspect-ratio: 322/473 }    /* secondaria altLayout */
```

Sono questi rapporti a produrre l'effetto "foto di dimensioni diverse fra loro".
Vanno rispettati quando arrivano le fotografie vere.

## 3. Animazioni

Il riferimento **non usa GSAP né librerie di scroll**. Nemmeno noi: reveal via
`IntersectionObserver`, parallasse via `requestAnimationFrame`. Zero dipendenze.

### Reveal
Partenza identica al riferimento: `opacity:0` + `translateY(50px)` → `opacity:1` +
`translateY(0)`. Durata 800ms, easing `cubic-bezier(.16,1,.3,1)`.
Trigger a `rootMargin: 0px 0px -12% 0px`.

### Parallasse sulle immagini secondarie
Misurato sul riferimento: le immagini con classe `.image-secondary` traslano
**da `translateY(+35%)` a `translateY(-20%)`** della propria altezza mentre la
sezione attraversa la finestra. Riprodotto identico con `data-parallax="secondary"`:

```
p = (altezzaFinestra - top) / (altezzaFinestra + altezzaElemento)   [0…1]
y = 35 + (-20 - 35) · p
```

È questa corsa a tenere "vive" le composizioni sfalsate mentre si scorre: le due
immagini di ogni sezione si avvicinano e si allontanano invece di restare ferme.
Verificato con campionamento su sette punti dello scroll: 35% → 32,1% → 19,5% →
5,2% → −9,5% → −20%.

### Regola di robustezza
Nessuna animazione può essere l'unica cosa che rende visibile un contenuto.
Tre reti indipendenti:

1. `body.no-js` → tutto visibile senza JavaScript.
2. Timer inline 2s → se `main.js` non arriva, `.reveal-force` mostra tutto.
3. Timer 3s in `main.js` → se un elemento già a schermo è ancora invisibile,
   si salta allo stato finale.

## 4. Colore

Nero e bianco come il riferimento. L'unica deviazione è l'accento.

| Ruolo | Token | Hex | Contrasto |
|---|---|---|---|
| Fondo | `--black` | `#000000` | — |
| Superficie | `--surface` | `#0A0A0A` | — |
| Superficie alta | `--raised` | `#131313` | — |
| Testo | `--white` | `#FFFFFF` | **21:1** su nero |
| Testo secondario | `--dim` | `#B4B4B4` | **11,6:1** su nero |
| Testo terziario | `--muted` | `#9A9A9A` | **7,3:1** su nero |
| Accento riempimenti | `--wine` | `#8E1B2C` | bianco sopra: **8,96:1** |
| Accento testo e hover | `--wine-lt` | `#DB4756` | **5,05:1** su nero |

> **Deviazione.** Lío usa un magenta `#F013BF` sul link RESERVATIONS. Al suo posto
> il bordeaux.
>
> **Perché due token e non uno.** Un bordeaux pieno (`#8E1B2C`) su fondo nero dà
> 2,34:1: illeggibile come testo. Quindi il bordeaux vive nei riempimenti, dove
> sopra ci va il bianco, e per testo e hover si usa `--wine-lt`, che sullo stesso
> nero arriva a 5,05:1. Usare il bordeaux pieno per un link sarebbe un errore
> di accessibilità, non una scelta estetica.

Nessun `border-radius` in tutto il sito.

## 5. Tipografia

Il riferimento usa **due** famiglie, non una.

```
/* sans: quasi tutto */
--font: "gill-sans-nova", "Gill Sans Nova", "Gill Sans", "GillSans",
        "Gill Sans MT", "Jost", -apple-system, sans-serif;

/* serif display: solo i titoli-respiro */
--font-display: "Playfair Display", "Ivar Display", Georgia, serif;
```

Il serif compare su "Discover More" e "Spectacularrr" — da noi su "Scopri" e sul
titolo della sezione a tutta pagina. Lì il testo non è maiuscolo ma capitalizzato,
ed è molto grande. Il loro font è **Ivar Display** (Letters from Sweden, a licenza);
Playfair Display è l'equivalente libero più vicino per contrasto e proporzioni.

`gill-sans-nova` è Adobe Fonts, a licenza. Lo stack lo cerca comunque per primo, così
attivando l'abbonamento il sito lo usa senza toccare il CSS. In assenza: `Gill Sans`
di sistema su Mac e iPhone, `Gill Sans MT` su Windows con Office, `Jost` altrove.

| Uso | Peso | Tracking | Caso |
|---|---|---|---|
| H1 / H2 | 200 | .02em | maiuscolo |
| H3 | 300 | .12em | maiuscolo |
| Eyebrow | 400 | .28em | maiuscolo |
| Bottoni | 400 | .22em (≈3,2px) | maiuscolo |
| Nav | 300 | .18em | maiuscolo |
| Wordmark | 300 | .42em | maiuscolo |
| Corpo | 300 | normale | minuscolo |

Il tracking largo sul maiuscolo è la firma del riferimento: è quello, più del nero,
a produrre la sensazione di lusso.

## 6. Misure di impianto

- **Gutter**: 32px per lato (`--gutter`), come il riferimento
- **Padding di sezione**: 20px mobile / 30px desktop (`--sec-pad`)
- **Accavallamento**: `--stitch: 3vw` da 900px in su

> **Deviazione voluta.** Il riferimento usa 60px sopra e sotto, cioè 120px di nero
> fra un blocco e l'altro. Qui il passo è più stretto e le sezioni si accavallano
> di `--stitch`, così lo scorrimento legge come un unico flusso invece che come
> pagine impilate. Risultato misurato: **17–30px** di nero fra le sezioni,
> contro i 120px di partenza.
>
> Le sezioni a schermo pieno (`hero`, `fullBleedMedia`) sono escluse
> dall'accavallamento: il testo della sezione accanto finirebbe sopra la loro foto.
> Gli override devono avere la stessa specificità di `.sec + .sec` ed essere
> dichiarati dopo, altrimenti non si applicano.

**Respiro finale.** Le ultime tre sezioni (`#raggiungerci`, `#contatti`, `#faq`)
non si accavallano: hanno `margin-top: 1.75rem`. Lì servono blocchi distinti, non
un flusso continuo — l'intreccio le rendeva illeggibili come sezioni separate.
Gli id battono `.sec + .sec` per specificità.

Distanze misurate a 1440px dopo la regolazione:

| Confine | Prima | Ora |
|---|---|---|
| hero → prima foto | 30px | 30px |
| card "L'esperienza" → sezione sotto | 594px | 394px |
| galleria → Come raggiungerci | −13px | +58px |
| Come raggiungerci → Contatti | −43px | +28px |
| Contatti → FAQ | −43px | +28px |
- **Bottone**: 46px di altezza, bordo 1px bianco, spigolo vivo, tracking 3,2px
- **Pila di prenotazione**: larghezza 320px, gap 12px, baricentro al ~58% dell'hero

## 7. Da non fare

- Niente `border-radius`: basta un angolo arrotondato per far sembrare tutto un template
- Non allineare le immagini fra loro: lo sfalsamento **è** il progetto
- Non togliere il parallasse dalle secondarie: senza, le composizioni si spengono
- Niente emoji come icone: solo SVG inline
- Niente ottone su superfici estese: è un accento
- Niente fotografie chiare o piatte: su fondo nero rompono l'impianto

## 8. Checklist pre-consegna

- [x] Geometria verificata contro il riferimento a 1440px
- [x] Corsa del parallasse verificata su sette punti dello scroll
- [x] Contrasti AAA su tutti i livelli di testo
- [x] Focus visibile, target touch ≥ 44px
- [x] `prefers-reduced-motion` rispettato (parallasse e reveal disattivati)
- [x] Responsive 375 / 768 / 1024 / 1440 senza scroll orizzontale
- [x] Un solo H1, ogni input con label
- [x] Bilingue IT/EN, inclusi messaggi di errore
- [ ] Fotografie reali nei 19 slot
- [ ] Telefono, WhatsApp, email, P. IVA reali
- [ ] Pagine Privacy e Cookie
- [ ] Favicon e `og:image`
