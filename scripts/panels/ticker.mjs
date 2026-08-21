/**
 * TICKER — a strip of items crawling past.
 *
 * A status line, not a headline: the one place in this set where content is
 * allowed to be in motion, because the component IS the motion. Everything
 * else here holds still and lets an effect pass over it.
 *
 * The loop is seamless because the strip carries its content twice and travels
 * exactly one copy's width. At the end of the cycle the second copy is sitting
 * where the first one started, so the reset lands on an identical frame and
 * there is nothing to see. Any other distance produces a visible jump, and a
 * marquee that jumps is worse than no marquee.
 *
 * Speed is derived from length rather than fixed, so a strip of three items
 * and a strip of nine both travel at the same number of pixels per second. A
 * fixed duration makes a long strip a blur and a short one a crawl.
 *
 * Separators take the accent and the items take the one grey, which is the
 * whole colour scheme: the punctuation is the only thing that needs finding.
 */

import { rect, pixelFrame, svgDoc, body, bodyWidth, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled, belt } from "../lib/motion.mjs"

export const id = "ticker"
export const responsive = true

const H = 36
/** Pixels per second. Slow enough to read a word without chasing it. */
const SPEED = 34

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const spec = cfg.ticker ?? { items: [] }
  const items = spec.items ?? []
  const sep = spec.sep ?? "//"
  const animate = enabled(cfg, "ticker")
  const out = []
  const css = []
  const baseline = 22

  // One copy, measured as it is drawn, so the travel distance is the real
  // width rather than an estimate that drifts by a pixel per item.
  const copy = []
  let x = 0
  for (const it of items) {
    copy.push({ str: sep, x, accent: true })
    x += bodyWidth(sep) + S.xs
    copy.push({ str: it, x, accent: false })
    x += bodyWidth(it) + S.md
  }
  const copyW = x

  const strip = [0, copyW]
    .map((off) => copy.map((c) => body(c.str, { x: c.x + off, y: baseline, fill: c.accent ? t.accent : t.inkDim })).join(""))
    .join("")

  out.push(rect(SHADOW, SHADOW, W - SHADOW, H, t.shadow))
  out.push(rect(0, 0, W - SHADOW, H, t.panel))

  // Clipped to the frame's inside, so a word leaving the strip is cut by the
  // border rather than disappearing at some arbitrary distance past it.
  out.push(
    `<defs><clipPath id="tkc"><rect x="10" y="2" width="${W - SHADOW - 20}" height="${H - 4}"/></clipPath></defs>`
  )
  // Three nested groups, and each one is load-bearing: the clip, then the
  // static offset, then the animated one. Putting the offset on the animated
  // group instead would lose it the moment the animation started — a CSS
  // `transform` replaces the presentation attribute rather than adding to it.
  out.push(
    `<g clip-path="url(#tkc)"><g transform="translate(${S.sm},0)"><g class="${animate ? "tkr" : ""}">${strip}</g></g></g>`
  )
  out.push(pixelFrame(t, 0, 0, W - SHADOW, H, t.line))
  // The house corner lamp. Drawn after the clipped group and outside it, so
  // the strip scrolls under nothing and the lamp scrolls with nothing.
  out.push(rect(6, 6, 4, 4, t.accent, `class="led"`))

  if (animate && copyW > 0) css.push(belt("tkr", { distance: copyW, period: Math.round((copyW / SPEED) * 1000) }))

  return {
    w: W, h: H + SHADOW, body: out.join(""),
    css: styles(cfg, "ticker", css.join("")),
    title: items.join(` ${sep} `),
  }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ w: r.w, h: r.h, theme: t, body: r.body, css: r.css, title: r.title, paintBg: false })
}
