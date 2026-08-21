<!--
  Every image below is generated. `node scripts/build-preview.mjs` renders the
  whole gallery from scripts/demo.mjs + config.example.json — invented data, no
  account attached — so what you see here is exactly what the components do,
  with nobody's numbers in it.

  Each <a> must stay on ONE line. Broken across lines, the markdown parser
  closes the inline context and side-by-side cards stop flowing together.
-->

<div align="center">

<picture>
  <source media="(max-width: 500px)" srcset="preview/display-m.svg">
  <img alt="PIXEL, set as a large hollow pixel headline" src="preview/display.svg">
</picture>

</div>

**Pixel panels for a GitHub profile README.** Fourteen SVG components — meters,
a contribution field, project cards, a contact row — built from one bitmap
typeface and one 2px grid, so a page made of them looks like a single instrument
rather than a shelf of widgets.

No build step, no package manager, no runtime. `node` and `git` are the whole
toolchain. Every component is a function that returns a string.

<picture>
  <source media="(max-width: 500px)" srcset="preview/hero-m.svg">
  <img alt="Three sentences typed out in a bitmap face" src="preview/hero.svg">
</picture>

---

## What this is, and what it is not

**Is:** a set of parts you copy into your own repository and wire to your own
data. The design system comes with them, which is the point — the reason a page
of these holds together is that they all obey the same four rules.

**Is not:** a service, an action you install, or a URL you point at. Nothing
here phones home, and nothing renders on somebody else's server.

Three properties that turned out to matter more than they sound:

- **One file per layout, not per theme.** Both palettes ship inside every SVG as
  custom properties behind a `prefers-color-scheme` block. Verified to work
  through `<img>` by rendering a probe to a canvas and reading the pixels back.
  Switching theme repaints instead of re-downloading, and `<picture>` is left
  with a single-condition width query.
- **The type is embedded.** An SVG shown through `<img>` cannot fetch a font, so
  a subset WOFF2 (~2 KB) is inlined in every file. Without it the whole design
  falls back to whatever monospace the reader happens to have.
- **Motion never hides content.** Every effect animates `transform` only. An
  `<img>`-loaded SVG does not reliably start its animations, and an effect that
  begins at `opacity: 0` can leave a panel permanently blank — this was found
  the hard way.

---

## Quick start

```bash
git clone https://github.com/yunmin311/pixel-panels
cd pixel-panels
cp config.example.json config.json     # then edit the text
node scripts/build-preview.mjs         # renders everything into preview/
```

Point a `<picture>` at the result. One condition, nothing else:

```html
<picture>
  <source media="(max-width: 500px)" srcset="preview/rhythm-m.svg">
  <img alt="…" title="…" src="preview/rhythm.svg">
</picture>
```

`alt` carries the panel's content as text, which the components generate for
you. `title` gives the one hover a README can have — a native tooltip. Real
`:hover` is not possible: GitHub strips script, and an `<img>`-loaded SVG
receives no pointer events.

---

## The gallery

Everything below is the demo data in `scripts/demo.mjs`.

### hero — a typewriter

Shown at the top of this page. Three sentences typed and erased on a loop, one
glyph per step. The caret is welded to the leading edge of a page-coloured cover
that slides right in `steps(n)`, so it tracks the reveal for free and erasing is
the same motion backwards. On a phone the sentences wrap to two lines and the
typing time splits between them.

```json
"hero": { "lines": ["…", "…", "…"] }
```

### about — the identity block

<picture>
  <source media="(max-width: 500px)" srcset="preview/about-m.svg">
  <img alt="An about panel: name, two paragraphs, exploring chips, principles" src="preview/about.svg">
</picture>

Name at 22px, prose at 11px, plus two label rows folded in so the section is one
object rather than three loose pieces. The chips light one after another.

```json
"about":      { "name": "…", "meta": "…", "paragraphs": ["…", "…"] },
"exploring":  ["…", "…"],
"principles": ["…", "…"]
```

### sections — numbered rules

<picture>
  <source media="(max-width: 500px)" srcset="preview/sec-01-m.svg">
  <img alt="A section header: 01 // About me" src="preview/sec-01.svg">
</picture>

<picture>
  <source media="(max-width: 500px)" srcset="preview/sec-02-m.svg">
  <img alt="A section header with a subtitle: 02 // Selected work" src="preview/sec-02.svg">
</picture>

Set at 11px like everything else, not a size larger. The number in accent and a
rule running to the margin say "new section" without raising a voice; a header
bigger than its content turns a page into a stack of announcements.

```json
"sections": [{ "key": "01", "num": "01", "title": "About me", "sub": "optional" }]
```

### work — project cards

<a href="https://github.com/acme/plotter"><picture><source media="(max-width: 500px)" srcset="preview/work-plotter-m.svg"><img alt="Plotter — a stream of measurements is not information until something shapes it." src="preview/work-plotter.svg"></picture></a>
<a href="https://github.com/hollowlab/tinyfs"><picture><source media="(max-width: 500px)" srcset="preview/work-tinyfs-m.svg"><img alt="TinyFS — small enough to read in an afternoon." src="preview/work-tinyfs.svg"></picture></a>
<a href="https://github.com/quiet-tools/ledger"><picture><source media="(max-width: 500px)" srcset="preview/work-ledger-m.svg"><img alt="Ledger — plain-text accounting with no opinions about your money." src="preview/work-ledger.svg"></picture></a>
<a href="https://github.com/acme/signal-desk"><picture><source media="(max-width: 500px)" srcset="preview/work-signal-desk-m.svg"><img alt="Signal Desk — collapses a day of notifications into the few that changed something." src="preview/work-signal-desk.svg"></picture></a>

A card is one image so a README can wrap one link around the whole thing. Each
leads with why the thing exists and puts the stack underneath — the stack is the
least interesting true fact about any project. No stars, forks or issue counts:
those are the numbers a page reaches for when it has nothing to say about the
work. A marquee crawls the border, the marker every early graphical interface
used for "this one is pickable".

```json
"work": [{ "key": "…", "name": "…", "why": "…", "tags": ["…"], "url": "…" }]
```

### rhythm — segmented meters

<picture>
  <source media="(max-width: 500px)" srcset="preview/rhythm-m.svg">
  <img alt="Activity by hour and by weekday, drawn as segmented level meters" src="preview/rhythm.svg">
</picture>

Every column shows its full scale in an empty colour and fills upward, the way a
level meter on a piece of hardware does — unused capacity is information too.
The ceiling cell of each column flickers. On a phone the two meters stack and
the readout drops to one fact per row.

Expects `{ hours[24], days[7], total, spanDays, peakHour, peakWindow, busiestDay, nightShare, offsetLabel }`.

### languages — a share bar

<picture>
  <source media="(max-width: 500px)" srcset="preview/languages-m.svg">
  <img alt="A language share bar with a six-row legend" src="preview/languages.svg">
</picture>

One hue at four designed steps, not a rainbow: the ranking is the information,
and six unrelated colours make it harder to read. One slot is left blank between
languages so the steps read as ranked segments rather than one ribbon. A
highlight sweeps the bar.

The panel prints its own method line, because an unqualified language chart is
usually measuring build output.

Expects `{ top: [{ name, pct, amount }], repoCount, caption, summary, note }`.

### stars and activity — two lists

<picture><source media="(max-width: 500px)" srcset="preview/stars-m.svg"><img alt="Recently starred repositories, with a rail marking one row" src="preview/stars.svg"></picture>
<picture><source media="(max-width: 500px)" srcset="preview/activity-m.svg"><img alt="Recent activity: releases, repos opened, merged pull requests" src="preview/activity.svg"></picture>

A matched pair, so they behave identically: a rail down the left margin with one
lit segment exactly one row tall. An earlier version used a floating arrow and
could never be aligned, because a free-floating pointer has no structural anchor
— "is it pointing at the right thing" has no right answer. The rail's segment
*is* the row, so alignment is geometry.

Three inks per row and no more: the name carries the blue, the description is
the one grey, everything subordinate is faint.

### contributions — a year as a field

<picture>
  <source media="(max-width: 500px)" srcset="preview/contributions-m.svg">
  <img alt="A year of contributions as a filled field with a diagonal pixel wave" src="preview/contributions.svg">
</picture>

Days with activity fill their cell; empty days are a small centred dot, so the
graph-paper texture stays where it belongs and every real day reads at full
strength. Thresholds are the quartiles of the days that *have* activity, not
fractions of the maximum — one loud day would otherwise drag everything else
into the lowest band and waste three quarters of the ramp.

The wave is diagonal: cells are bucketed by `(column + row) % 8`, so each
diagonal rises together and the crest travels. Cells change **size**, not
position, and the timing is `step-end` — a grid with no sub-pixels cannot ease,
and pretending otherwise is what makes an effect look like CSS instead of like a
display. Amplitude is ±8% and only cells with data move; the first attempt ran
0.6×–1.35× across every cell and was a strobe.

```json
"motion": { "contributionStyle": "pixel", "contributionPeriod": 3000 }
```

`"contributionStyle": "wave"` switches to the smooth version, which is kept.

### tiles — a row of readouts

<picture>
  <source media="(max-width: 500px)" srcset="preview/tiles-m.svg">
  <img alt="Four framed readout tiles" src="preview/tiles.svg">
</picture>

Separate framed boxes rather than one divided panel, so the row survives
wrapping onto a phone. Each tile's lamp takes its turn.

```json
"tiles": [{ "label": "SHIPPED", "value": "4 tools", "note": "MIT" }]
```

### quote — a framed statement

<picture>
  <source media="(max-width: 500px)" srcset="preview/quote-m.svg">
  <img alt="A framed quotation with a blue pixel spine" src="preview/quote.svg">
</picture>

The blue spine sits *inside* the frame. A coloured stripe down the outside edge
of a card is the single most reached-for way to make a block look designed, and
it is on the anti-AI-taste list for exactly that reason.

```json
"quote": { "text": "…", "by": "…" }
```

### display — oversized pixel headline

Shown at the top. Three treatments — `solid`, `hollow`, `shadow`. Hollow is a
stroke on a bitmap face, which traces every step in the glyph; that is why it
reads as pixel art rather than as an outlined font. Sizes are 33 / 44 / 55,
picked from the text length, because the face is drawn on an 11-pixel em and
anything between those puts glyph edges on fractions.

```json
"display": { "text": "PIXEL", "treatment": "hollow", "colour": "ink", "sweep": true }
```

### contact — keycap buttons

<a href="mailto:you@example.com"><picture><img alt="Email" title="Opens your mail client" src="preview/btn-email.svg"></picture></a>
<a href="https://example.com"><picture><img alt="Website" src="preview/btn-site.svg"></picture></a>
<a href="https://example.social/@you"><picture><img alt="Mastodon" src="preview/btn-mastodon.svg"></picture></a>

One button shape, one border, one blue pixel each, and no brand colours: Gmail
red beside a green beside a gradient is three other companies' design systems
fighting on your page. Each button is its own file because a README can only
wrap a link around a whole image.

```json
"contact": [{ "key": "email", "label": "EMAIL", "href": "mailto:…", "enabled": true }]
```

### fortune — one rotating line

<picture>
  <source media="(max-width: 500px)" srcset="preview/fortune-m.svg">
  <img alt="A single line of text with a blinking caret" src="preview/fortune.svg">
</picture>

Picked by a date-derived index, so the page changes between visits without
anything being random at build time.

```json
"fortunes": ["…", "…"]
```

---

## The four rules

They are the whole difference between a set of parts and a pile of widgets.

**1 · Type is 11px or 22px, nothing between.** The face is drawn on an 11-pixel
em — unitsPerEm 550, advance 350, cap height 400, all multiples of 50 — so at
11px one font-pixel is one screen pixel and the advance is a whole number. Any
size in between lands glyph edges on half pixels and the face goes soft, which
is what "the pixel font looks bad" usually means. Hierarchy comes from case,
tracking and colour instead.

**2 · Chrome is a multiple of 2px.** Borders, markers, meter segments, heat
cells. Things get bigger by occupying more cells, never by scaling the cell —
mixing pixel sizes between elements is what breaks the illusion that they share
a surface.

**3 · Type is sized against the box it sits in, never the canvas — under 6% of
it.** Measured from `github-readme-stats`, where the headline number is 24/450
of its card. Breaking this is subtle and expensive: 22px numerals dropped into
208px readout cells is 10.6%, and they collide with the border and with each
other while looking perfectly fine in isolation.

**4 · Motion animates `transform` only, never `opacity`.** See above. Also:
motion may not repaint data. Scan heads and highlights pass over a chart at low
opacity; a peak indicator is applied to the cell already marked as the peak. An
animation that alters a reading is a lie that moves.

Colour budget is roughly **80% neutral, 15% muted blue, 5% accent**, and the
accent has four jobs: a panel's corner lamp, the peak in a chart, the newest
item in a list, and a caret.

Full reasoning and the measured sources in **[DESIGN.md](DESIGN.md)**.

---

## Writing a component

```js
// scripts/panels/thing.mjs
import { panel, svgDoc, body, label, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled } from "../lib/motion.mjs"

export const id = "thing"
export const responsive = true          // also emit a 284px phone variant

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const out = [panel(t, { x: 0, y: S.xs, w: W, h: 120, title: "Thing", meta: "note" })]
  out.push(body("hello", { x: S.sm, y: 48, fill: t.ink }))
  return { w: W, h: 136, body: out.join(""), css: styles(cfg, "thing", ""), title: "Thing — hello" }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ ...r, theme: t, bleed: SHADOW })
}
```

Add it to the arrays in `scripts/build-preview.mjs`. That is the whole wiring.

`t` is the theme: every value is a CSS custom-property reference, so
`fill="${t.ink}"` emits `fill="var(--ink)"` and the document decides what that
resolves to. `title` becomes the image's alt text, so write it as a sentence.

## Primitives

In `scripts/lib/design.mjs`:

| | |
|---|---|
| `pixelFrame` | a border with stepped corners — a grid cannot curve, so it steps |
| `pixelRule` | a divider made of blocks rather than a hairline |
| `listRail` | a track down a list's margin with one lit segment one row tall |
| `pixelCaret` | a stacked-block pointer. **Archived** — kept because it suits something with an anchor (a menu, a prompt), not a free margin |
| `tab` | a label plate riveted onto a frame rather than punched through it |
| `panel` | the three-zone anatomy: top rail, content, bottom rail |
| `readout` | a label and value that stay together |
| `pixelFrame`, `marker`, `rect`, `hline`, `vline` | the rest of the grid |

In `scripts/lib/motion.mjs` — entrances (`rise`, `grow`, `fill`, `draw`, `bloom`)
and ambient loops (`lamp`, `tick`, `stream`, `playhead`, `cursor`, `flicker`,
`ants`, `nudge`, `wave`, `pixelWave`, `keylight`, `rowlight`, `tape`). Each is
switchable per component in config, and every animated document carries a
`prefers-reduced-motion` guard.

## Type

**Departure Mono** by Helena Zhang, SIL Open Font License 1.1. Subset to the
printable ASCII range plus a few marks — about 2 KB — and embedded as a data URI
in every generated file.

The licence travels with the font in [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt),
which OFL section 2 requires of every copy. It declares **no reserved font
name**, which is why a subset may keep the original name; that was checked in
the licence text rather than in the binary, because a subset binary has its name
table stripped and would give a confidently wrong answer.

Subsetting makes you the maker of a Modified Version. If you re-subset with a
font that *does* declare a reserved name, you must rename it.

## Licence

MIT for the code. The font keeps its own OFL, which is not the same licence and
does not become MIT by sitting in this repository.
