"""Genera menu.html e assets/js/i18n-menu.js da data.py.

Quando cambia il menu: si aggiorna data.py (e il PDF in assets/pdf/),
poi dalla cartella del sito si lancia

    python3 tools/menu/gen.py

Nessuna dipendenza oltre a Python 3."""
import sys, os, re, json, html, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from data import CATS, ALLERGENS, LEGAL, INTERLUDES

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SITE = 'https://idrosmilanomarittima.it'
PDF = '/assets/pdf/idros-menu.pdf'
e = lambda s: html.escape(s, quote=False)
a = lambda s: html.escape(s, quote=True)

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

EN = {}
used = set()
def key(k, en):
    assert k not in used, k
    used.add(k)
    EN[k] = en
    return k

def star(s):
    """L'asterisco dei prodotti congelati in un elemento suo, per lo stile."""
    return e(s).replace('*', '<span class="frz">*</span>')

def dish_html(cat, d):
    name, dit, den, xit, xen, allg, price = d
    s = slug(name)
    den_html = den.replace('*', '<span class="frz">*</span>')
    out = ['          <li class="dish">',
           '            <div class="dish__head">',
           f'              <h4 class="dish__name">{star(name)}</h4>',
           '              <span class="dish__line" aria-hidden="true"></span>',
           f'              <span class="dish__price"><span class="dish__cur">€</span>{price}</span>',
           '            </div>',
           f'            <p class="dish__desc" data-i18n="{key(f"m.{cat}.{s}.d", den_html)}">{star(dit)}</p>']
    if xit:
        out.append(f'            <p class="dish__extra" data-i18n="{key(f"m.{cat}.{s}.x", xen)}">{e(xit)}</p>')
    if allg:
        nums, _, extra = allg.partition('|')
        tail = ' <span data-i18n="m.flavour">secondo il gusto</span>' if extra == 'FLAVOUR' else ''
        out.append(f'            <p class="dish__all"><span data-i18n="m.all">Allergeni</span> {nums}{tail}</p>')
    out.append('          </li>')
    return '\n'.join(out)

def pic(name, alt_it, sizes, widths=(500, 900), cls=''):
    srcset = ', '.join(f'/assets/img/foto/{name}-{w}.webp {w}w' for w in widths)
    w = widths[-1]
    return (f'<img src="/assets/img/foto/{name}-{widths[0]}.webp" width="{w}" height="{round(w*1.25)}"\n'
            f'             srcset="{srcset}"\n'
            f'             sizes="{sizes}" loading="lazy" decoding="async"\n'
            f'             alt="{a(alt_it)}">')

EN['m.all'] = 'Allergens'
EN['m.flavour'] = 'depending on flavour'

sections = []
index_links = []
for n, (cid, cit, cen, groups) in enumerate(CATS, 1):
    index_links.append(f'          <a href="#{cid}" data-i18n="{key(f"m.c.{cid}", cen)}">{e(cit)}</a>')
    body = []
    for git, gen, nit, nen, dishes in groups:
        gs = slug(git)
        g = [f'        <div class="mgroup">',
             f'          <h3 class="mgroup__title" data-i18n="{key(f"m.g.{cid}.{gs}", gen)}">{e(git)}</h3>']
        if nit:
            g.append(f'          <p class="mgroup__note" data-i18n="{key(f"m.g.{cid}.{gs}.n", nen)}">{e(nit)}</p>')
        g.append('          <ul class="dishes" role="list">')
        g += [dish_html(cid, d) for d in dishes]
        g.append('          </ul>')
        g.append('        </div>')
        body.append('\n'.join(g))
    sections.append(f'''<!-- ═════════ {cit.upper()} ═════════ -->
<section class="sec mcat" id="{cid}" aria-labelledby="t-{cid}">
  <div class="wrap mcat__grid">
    <header class="mcat__head">
      <p class="mcat__num" aria-hidden="true">{n:02d}</p>
      <h2 class="h2 mcat__title" id="t-{cid}" data-anim="lines" data-i18n="m.c.{cid}">{e(cit)}</h2>
    </header>
    <div class="mcat__body">
{chr(10).join(body)}
    </div>
  </div>
</section>''')
    if cid in INTERLUDES:
        (big, big_it, big_en), (small, small_it, small_en) = INTERLUDES[cid]
        sections.append(f'''<div class="minter wrap" role="presentation">
  <figure class="media media--45 minter__a" data-anim="unveil">
    {pic(big, big_it, "(min-width: 900px) 40vw, 46vw")}
  </figure>
  <div class="minter__b" data-parallax="secondary" data-depth="1.2">
    <figure class="media media--45" data-anim="unveil">
      {pic(small, small_it, "(min-width: 900px) 26vw, 46vw")}
    </figure>
  </div>
</div>''')

index_links.append(f'          <a href="#allergeni" data-i18n="m.c.allergeni">Allergeni</a>')
EN['m.c.allergeni'] = 'Allergens'

allerg = '\n'.join(
    f'          <li><span class="allergens__n">{i}</span> <span data-i18n="{key(f"m.a.{i}", en)}">{e(it)}</span></li>'
    for i, (it, en) in enumerate(ALLERGENS, 1))
legal = '\n'.join(
    f'        <p data-i18n="{key(f"m.l.{i}", en)}">{e(it)}</p>' for i, (it, en) in enumerate(LEGAL, 1))

# ---- dati strutturati ----
def plain(s): return s.replace('*', '')
ld_menu = {
  '@context': 'https://schema.org',
  '@type': 'Menu',
  '@id': f'{SITE}/menu#menu',
  'name': 'Menu IDROS',
  'url': f'{SITE}/menu',
  'inLanguage': 'it',
  'hasMenuSection': [{
      '@type': 'MenuSection',
      'name': cit,
      'hasMenuItem': [{
          '@type': 'MenuItem',
          'name': plain(d[0]),
          'description': plain(d[1] + (('. ' + d[3]) if d[3] else '')),
          'offers': {'@type': 'Offer', 'price': str(d[6]), 'priceCurrency': 'EUR'}
      } for g in groups for d in g[4]]
  } for cid, cit, cen, groups in CATS]
}
ld_crumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    {'@type': 'ListItem', 'position': 1, 'name': 'IDROS', 'item': f'{SITE}/'},
    {'@type': 'ListItem', 'position': 2, 'name': 'Menu', 'item': f'{SITE}/menu'}
  ]
}
ld = json.dumps([ld_menu, ld_crumbs], ensure_ascii=False, separators=(',', ':'))

EN.update({
  'm.eyebrow': 'The menu',
  'm.title': 'A selection of sea, land and season',
  'm.lead': 'Raw and cooked starters, hand-rolled pasta, mains from sea to land, pizza, sushi and desserts. The menu follows the season and the catch.',
  'm.prices': 'Prices in euros. The list of allergens is at the <a href="#allergeni">bottom of the page</a>; products marked with * are frozen.',
  'm.pdf': 'Download the PDF menu',
  'm.index': 'Sections',
  'm.legal.t': 'Notes',
  'm.end.eyebrow': 'IDROS · Milano Marittima',
  'm.end.title': 'We look forward to having you',
  'm.end.lead': 'The quickest way to book is a phone call. Prefer to keep the menu with you? Download it as a PDF.',
})

page = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'menu.tpl.html'), encoding='utf-8').read()
page = (page.replace('%%LD%%', ld)
            .replace('%%INDEX%%', '\n'.join(index_links))
            .replace('%%SECTIONS%%', '\n\n'.join(sections))
            .replace('%%ALLERGENS%%', allerg)
            .replace('%%LEGAL%%', legal)
            .replace('%%HEADIMG%%', pic('menu-ospiti', 'Due ospiti sfogliano il menu di IDROS al tavolo', '(min-width: 900px) 36vw, 92vw', (600, 1000)))
            .replace('%%PDF%%', PDF))
assert '%%' not in page
open(os.path.join(ROOT, 'menu.html'), 'w', encoding='utf-8').write(page)

js = ('/* ============================================================\n'
      '   IDROS — traduzioni inglesi della pagina del menu.\n'
      '   File generato dalla trascrizione del menu: l\'italiano sta in\n'
      '   menu.html. Va caricato prima di i18n.js, che lo unisce al resto.\n'
      '   ============================================================ */\n'
      'window.IDROS_EN_EXTRA = ' + json.dumps(EN, ensure_ascii=False, indent=2) + ';\n')
open(os.path.join(ROOT, 'assets/js/i18n-menu.js'), 'w', encoding='utf-8').write(js)
print('piatti:', sum(len(g[4]) for c in CATS for g in c[3]), 'chiavi EN:', len(EN))
