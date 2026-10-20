/**
 * GAUGE — a dial drawn on the grid.
 *
 * The one shape a pixel system is supposed to be bad at. A grid cannot draw an
 * arc, so it does what a grid always does: it steps. Twenty-one blocks placed
 * on a semicircle and snapped to the 2px grid give a curve made entirely of
 * right angles, which is the same trick as the stepped corners on every frame
 * in this set, scaled up until you can see it happening.
 *
 * Snapping is what makes it work, and it has to happen after the trigonometry,
 * never before. Blocks left on their exact positions land on fractional pixels,
 * the renderer antialiases them, and the arc turns into a soft grey smear —
 * the visual equivalent of setting the bitmap face at 27px.
 *
 * NO NEEDLE. A needle from the centre would be a diagonal line, which a grid
 * draws as a staircase that reads as an error rather than as a style. The value
 * is marked by one oversized block on the arc instead — the peak indicator this
 * design already uses in three other places.
 *
 * LAYOUT. Dial left, reading right, on one baseline grid. The first version
 * stacked them — dial above, number in the bowl — and a 400px-wide box spent
 * most of its width on nothing while the number fought the arc for the middle
 * of it. A dial is an instrument; instruments put the scale next to the
 * readout, not underneath it.
 *
 * SIZE. The number is 22px only where the tile is wide enough for that to stay
 * under 6% of it, which is two across a desktop column and never on a phone.
 * `maxSizeFor` makes that call rather than a guess.
 *
 * NO ENTRANCE ON THE ARC, and this one was found by looking rather than by
 * reasoning. The blocks were assembling with `bloom`, which scales up from 0.4
 * — and an entrance that has not run yet leaves its element at exactly that,
 * so a screenshot taken before the animation started showed a dial made of
 * 2px dots instead of 6px blocks. On a heat field a scaled-down cell still
 * reads as a cell; on a dial it reads as a different, broken instrument. The
 * only motion here is the indicator, which marks the reading without
 * constructing it.
 */

import { rect, pixelFrame, svgDoc, label, body, text, labelWidth, fit, maxSizeFor, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled, tick } from "../lib/motion.mjs"

export const id = "gauge"
export const responsive = true

const GH = 96
const GAP = S.xs
const STEPS = 21
const R = 36
const BLOCK = 6

/** Block positions along the semicircle, snapped to the grid after the maths. */
function arc(cx, cy, size) {
  const half = size / 2
  return Array.from({ length: STEPS }, (_, i) => {
    const a = Math.PI * (1 - i / (STEPS - 1))
    return {
      x: Math.round((cx + R * Math.cos(a) - half) / 2) * 2,
      y: Math.round((cy - R * Math.sin(a) - half) / 2) * 2,
    }
  })
}

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const items = cfg.gauge ?? []
  const animate = enabled(cfg, "gauge")
  const out = []
  const css = []

  const perRow = mobile ? 1 : Math.min(items.length, 2)
  const cellW = Math.floor((W - GAP * (perRow - 1)) / perRow)
  const rows = Math.ceil(items.length / perRow)
  const numSize = maxSizeFor(cellW)

  items.forEach((it, i) => {
    const x = (i % perRow) * (cellW + GAP)
    const y = Math.floor(i / perRow) * (GH + GAP)
    const cx = x + S.md + R
    const cy = y + 62
    const textX = cx + R + S.lg
    const room = cellW - (textX - x) - S.sm

    const max = Number(it.max) || 100
    const val = Math.max(0, Math.min(max, Number(it.value) || 0))
    const idx = Math.round((val / max) * (STEPS - 1))

    out.push(rect(x + SHADOW, y + SHADOW, cellW, GH, t.shadow))
    out.push(rect(x, y, cellW, GH, t.panel))
    out.push(pixelFrame(t, x, y, cellW, GH, t.line))

    arc(cx, cy, BLOCK).forEach((p, k) => {
      if (k === idx) return
      // The unlit part of the scale is drawn in the border colour, not in the
      // chart's "empty" colour. `dataEmpty` is tuned to sit quietly behind a
      // field of several hundred cells; twenty of them strung along a curve
      // simply vanished on a light background, and a dial missing half its
      // scale reads as a broken quarter-circle rather than as a low reading.
      out.push(rect(p.x, p.y, BLOCK, BLOCK, k < idx ? t.data2 : t.line))
    })

    // The indicator: bigger than the blocks it sits among, so it reads as a
    // pointer rather than as a brighter reading.
    const p = arc(cx, cy, 10)[idx]
    out.push(rect(p.x, p.y, 10, 10, t.accent, animate ? `class="pk"` : ""))

    // Scale ends, measured into place rather than anchored — tracked type is
    // only ever left-anchored here. See lib/type.mjs.
    const lo = String(it.min ?? 0)
    const hi = String(it.maxLabel ?? max)
    out.push(label(lo, { x: cx - R - Math.round(labelWidth(lo, 1) / 2), y: cy + 18, tracking: 1, fill: t.inkFaint }))
    out.push(label(hi, { x: cx + R - Math.round(labelWidth(hi, 1) / 2), y: cy + 18, tracking: 1, fill: t.inkFaint }))

    out.push(label(it.label, { x: textX, y: y + 34, tracking: 1, fill: t.inkDim }))
    out.push(text(String(it.display ?? val), { x: textX, y: y + 62, size: numSize, fill: t.titleInk }))
    if (it.note) out.push(body(fit(it.note, room), { x: textX, y: y + 80, fill: t.inkFaint }))
  })

  if (animate && items.length) css.push(tick("pk", { period: 1900 }))

  return {
    w: W,
    h: rows * GH + (rows - 1) * GAP + SHADOW,
    body: out.join(""),
    css: styles(cfg, "gauge", css.join("")),
    title: items.map((i) => `${i.label}: ${i.display ?? i.value} of ${i.max ?? 100}`).join(", "),
  }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ w: r.w, h: r.h, theme: t, body: r.body, css: r.css, title: r.title, paintBg: false })
}
