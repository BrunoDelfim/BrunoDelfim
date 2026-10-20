/**
 * PROGRESS — labelled bars for things that are partly done.
 *
 * A percentage is the easiest number in the world to draw badly. The two usual
 * failures are a rounded pill with a gradient in it, which belongs to a
 * different design language entirely, and a bar that shows only the filled
 * part, which hides the size of what is left.
 *
 * So: discrete cells, the whole scale always drawn, unfilled capacity in its
 * own colour. Same construction as the rhythm meters, laid on its side. You
 * can count the remaining cells, which is the point — "72%" is a number,
 * eleven empty cells is a quantity.
 *
 * A percentage is also rounded to the nearest cell and nothing else. A bar
 * whose last cell is half-lit claims a precision the grid cannot carry.
 *
 * MOTION. A block hopping cell by cell along the filled run, `steps()` timed,
 * so it lands on cells rather than sliding through them.
 */

import { rect, panel, svgDoc, body, label, labelWidth, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled, march, fill } from "../lib/motion.mjs"

export const id = "progress"
export const responsive = true

const LEAD = S.md
const CELL = 6
const GAP = 2
const PITCH = CELL + GAP
const BAR_H = 10

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const items = cfg.progress ?? []
  const animate = enabled(cfg, "progress")
  const out = []
  const css = []

  const PAD = S.sm
  const first = S.xs + S.md + 8
  const H = first + Math.max(0, items.length - 1) * LEAD + S.md + S.xs
  out.push(panel(t, { x: 0, y: S.xs, w: W, h: H - S.xs, title: cfg.progressTitle ?? "progress", meta: cfg.progressMeta }))

  // One label column and one number column for the whole panel. Sizing each
  // row to its own content makes a set of bars that all start somewhere else,
  // and the eye cannot compare lengths it has to find first.
  const labelW = Math.max(0, ...items.map((i) => labelWidth(i.label, 1)))
  const pctW = labelWidth("100%", 1)
  const barX = PAD + labelW + S.sm
  const barW = W - PAD - pctW - S.sm - barX
  const cells = Math.max(1, Math.floor((barW + GAP) / PITCH))

  items.forEach((it, i) => {
    const y = first + i * LEAD
    const pct = Math.max(0, Math.min(100, Number(it.pct) || 0))
    const filled = Math.round((pct / 100) * cells)
    const top = y - BAR_H + 2

    out.push(label(it.label, { x: PAD, y, tracking: 1, fill: t.inkDim }))

    const run = []
    for (let c = 0; c < cells; c++) {
      const on = c < filled
      // The head of the run is a step brighter, which is how a segmented
      // display marks where a value actually stops.
      const paint = !on ? t.dataEmpty : c === filled - 1 ? t.data4 : t.data2
      run.push(rect(barX + c * PITCH, top, CELL, BAR_H, paint))
    }
    out.push(animate ? `<g class="pf${i}">${run.join("")}</g>` : run.join(""))
    if (animate) css.push(fill(`pf${i}`, { delay: i * 60 }))

    // Right-aligned by measurement, not by text-anchor — a tracked string that
    // is end-anchored drifts between renderers. See lib/type.mjs.
    const pctStr = `${Math.round(pct)}%`
    out.push(label(pctStr, { x: W - PAD - labelWidth(pctStr, 1), y, tracking: 1, fill: pct >= 100 ? t.accent : t.ink }))

    // The scanner only travels the filled run, so it never implies a cell is
    // lit that is not.
    if (animate && filled > 1) {
      out.push(
        `<g class="pm${i}"><rect x="${barX}" y="${top}" width="${CELL}" height="${BAR_H}" fill="${t.data4}" opacity="0.6"/></g>`
      )
      css.push(march(`pm${i}`, { cells: filled, cellW: PITCH, period: 400 * filled }))
    }
  })

  return {
    w: W, h: H, body: out.join(""),
    css: styles(cfg, "progress", css.join("")),
    title: items.map((i) => `${i.label} ${Math.round(i.pct)}%`).join(", "),
  }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ w: r.w, h: r.h, theme: t, body: r.body, css: r.css, title: r.title, bleed: SHADOW })
}
