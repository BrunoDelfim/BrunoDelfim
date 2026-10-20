/**
 * TIMELINE — dated entries on a rail.
 *
 * The same rail the two list panels use, turned into a spine. A milestone list
 * drawn as bullet points has to invent a relationship between its rows; a rail
 * states one, because the rail is continuous and the nodes are on it.
 *
 * Every node is the same size, including the newest. Scaling the most recent
 * entry is the standard move and it is wrong here: it says "this one matters
 * more" when what is actually true is "this one happened last", and the date
 * column already says that.
 *
 * MOTION. A block running down the rail — time moving through the list rather
 * than a highlight picking rows out of it. It travels on the rail itself, so
 * it never crosses a word.
 */

import { rect, panel, svgDoc, body, label, labelWidth, fit, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled, playhead } from "../lib/motion.mjs"

export const id = "timeline"
export const responsive = true

const LEAD = S.md
const RAIL_X = 24
const NODE = 6

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const items = cfg.timeline ?? []
  const animate = enabled(cfg, "timeline")
  const out = []
  const css = []

  const first = S.xs + S.md + 8
  const lastY = first + Math.max(0, items.length - 1) * LEAD
  const H = lastY + S.md + S.xs

  out.push(panel(t, { x: 0, y: S.xs, w: W, h: H - S.xs, title: cfg.timelineTitle ?? "timeline" }))

  // The rail runs from the first node to the last and no further. A rail that
  // overshoots its own contents is decoration pretending to be structure.
  const railTop = first - 8
  const railH = lastY - railTop + NODE
  out.push(rect(RAIL_X, railTop, 2, railH, t.lineSoft))

  const whenW = Math.max(0, ...items.map((i) => labelWidth(i.when, 1)))
  const textX = RAIL_X + S.sm + whenW + S.sm
  const noteX = W - S.sm

  items.forEach((it, i) => {
    const y = first + i * LEAD
    // Newest first, so the top node is the live one and takes the accent.
    const lit = i === 0
    out.push(rect(RAIL_X - 2, y - 8, NODE, NODE, lit ? t.accent : t.line))
    out.push(label(it.when, { x: RAIL_X + S.sm, y, tracking: 1, fill: lit ? t.accent : t.inkFaint }))
    const noteW = it.note ? labelWidth(it.note, 1) : 0
    const room = noteX - textX - (it.note ? noteW + S.sm : 0)
    out.push(body(fit(it.what, room), { x: textX, y, fill: lit ? t.ink : t.inkDim }))
    // Right-aligned by measurement rather than by text-anchor: renderers
    // disagree about whether the tracking after the last glyph counts toward
    // the advance, so an end-anchored tracked string drifts a pixel or two
    // between them. See lib/type.mjs.
    if (it.note) out.push(label(it.note, { x: noteX - noteW, y, tracking: 1, fill: t.inkFaint }))
  })

  if (animate && items.length > 1) {
    out.push(`<g class="tlp"><rect x="${RAIL_X}" y="${railTop}" width="2" height="10" fill="${t.accent}"/></g>`)
    css.push(playhead("tlp", { distance: railH - 10, period: 6400, axis: "Y", peak: 0.85 }))
  }

  return {
    w: W, h: H, body: out.join(""),
    css: styles(cfg, "timeline", css.join("")),
    title: items.map((i) => `${i.when}: ${i.what}`).join(" / "),
  }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ w: r.w, h: r.h, theme: t, body: r.body, css: r.css, title: r.title, bleed: SHADOW })
}
