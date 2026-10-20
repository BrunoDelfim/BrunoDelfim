/**
 * TABLE — rows and columns, on the grid.
 *
 * A README already has tables; the reason to draw one here is that a markdown
 * table arrives wearing GitHub's type, GitHub's borders and GitHub's zebra
 * stripes, so a page built out of these panels gets a hole in it wherever data
 * appears. This is the same information in the same voice as everything around
 * it.
 *
 * Column widths are measured, not guessed, which a monospaced face makes exact:
 * the width of a string is its length times a known advance. Nothing has to be
 * estimated and nothing has to be clipped "just in case".
 *
 * No vertical rules. On a grid this fine they collide with the type at every
 * row, and the gutters already separate the columns — a line between two
 * columns that are visibly apart is a line doing nothing but adding noise.
 *
 * MOTION. A field cursor taking each column in turn — the marker a text-mode
 * table used for "this is the one you are working in". It rides the header
 * rule, which is the only horizontal line the panel already has, so it never
 * introduces a new one.
 */

import { rect, panel, pixelRule, svgDoc, body, label, labelWidth, bodyWidth, fit, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled, keylight } from "../lib/motion.mjs"

export const id = "table"
export const responsive = true

const LEAD = S.md
const GUTTER = S.md

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const spec = cfg.table ?? { head: [], rows: [] }
  const head = spec.head ?? []
  const rows = spec.rows ?? []
  const align = spec.align ?? []
  const animate = enabled(cfg, "table")
  const out = []
  const css = []

  const PAD = S.sm
  const INNER = W - PAD * 2

  // Natural width of each column: the widest thing that has to fit in it.
  const natural = head.map((h, c) =>
    Math.max(labelWidth(h, 1), ...rows.map((r) => bodyWidth(String(r[c] ?? ""))))
  )
  const total = natural.reduce((a, b) => a + b, 0) + GUTTER * Math.max(0, head.length - 1)

  // Over budget, the first column gives up the difference — it holds the names,
  // which are the only cells that survive being cut and still mean something.
  const widths = natural.slice()
  if (total > INNER && widths.length) widths[0] = Math.max(bodyWidth("....."), widths[0] - (total - INNER))

  const xs = []
  let cx = PAD
  for (const w of widths) { xs.push(cx); cx += w + GUTTER }

  const headY = S.xs + S.md + 8
  const ruleY = headY + 8
  const first = ruleY + S.sm + 4
  const H = first + Math.max(0, rows.length - 1) * LEAD + S.md + S.xs

  out.push(panel(t, { x: 0, y: S.xs, w: W, h: H - S.xs, title: spec.title ?? "table", meta: spec.meta }))

  /**
   * Right alignment is done by measuring the string and moving its origin, not
   * by `text-anchor="end"`. For untracked body text the two are equivalent; for
   * a tracked label they are not, because renderers disagree about whether the
   * letter-spacing after the final glyph counts toward the advance, and an
   * end-anchored header then sits a pixel or two off the column it labels.
   */
  const place = (str, c, y, fillCol, isLabel) => {
    const end = align[c] === "end"
    const s = fit(String(str ?? ""), widths[c])
    const w = isLabel ? labelWidth(s, 1) : bodyWidth(s)
    const x = end ? xs[c] + widths[c] - w : xs[c]
    return isLabel
      ? label(s, { x, y, tracking: 1, fill: fillCol })
      : body(s, { x, y, fill: fillCol })
  }

  head.forEach((h, c) => out.push(place(h, c, headY, t.inkDim, true)))
  out.push(pixelRule(PAD, ruleY, INNER, t.line))

  rows.forEach((r, i) => {
    const y = first + i * LEAD
    // The band is the row, so there is nothing to align it to.
    if (i % 2 === 1) out.push(rect(PAD - 4, y - 12, INNER + 8, LEAD - 4, t.lineSoft))
    r.forEach((cell, c) => {
      if (c >= widths.length) return
      out.push(place(cell, c, y, c === 0 ? t.ink : t.inkDim, false))
    })
  })

  /**
   * The field cursor lives ON the header rule, one column wide, and takes its
   * turn.
   *
   * The first version was a full-height line stepping across the columns, and
   * it was wrong in a way worth recording: at every stop it crossed five rows
   * of type, so it read as a misplaced table border rather than as a cursor —
   * the exact vertical rule this panel refuses to draw, reintroduced as an
   * animation. Motion does not get an exemption from the layout rules.
   *
   * One bar per column lighting in turn rather than one bar travelling,
   * because the columns are different widths and a single element cannot
   * change its own.
   */
  if (animate && xs.length > 1 && rows.length) {
    xs.forEach((x, c) => {
      // The resting state is the dim one, so an animation that never starts
      // leaves a faint blue header rule rather than a solid accent bar.
      out.push(rect(x, ruleY, widths[c], 2, t.accent, `opacity="0.25" class="tc${c}"`))
      css.push(keylight(`tc${c}`, { index: c, count: xs.length, period: 1200 * xs.length }))
    })
  }

  return {
    w: W, h: H, body: out.join(""),
    css: styles(cfg, "table", css.join("")),
    title: `${spec.title ?? "Table"} — ${head.join(", ")}; ${rows.map((r) => r.join(" ")).join("; ")}`,
  }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ w: r.w, h: r.h, theme: t, body: r.body, css: r.css, title: r.title, bleed: SHADOW })
}
