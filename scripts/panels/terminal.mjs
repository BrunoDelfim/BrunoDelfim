/**
 * TERMINAL — a session transcript.
 *
 * The one panel that is allowed to look like a terminal, so none of the others
 * have to. A README that wants to show "here is what running it looks like"
 * otherwise reaches for a fenced code block, which arrives with GitHub's own
 * type, GitHub's own background and GitHub's own corner radius, and puts a
 * foreign object in the middle of the page.
 *
 * Lines are plain strings. A line beginning with the prompt string is a
 * command and takes the accent; everything else is output and takes the one
 * grey. That is the whole formatting model, and it is deliberate: a transcript
 * with four colours in it is a screenshot of a configuration, not a document.
 *
 * MOTION. A band drifting down the panel, which is the idiom this component is
 * borrowing from anyway — every CRT had one. It is held at low opacity, so it
 * passes over the text rather than repainting it, and the caret at the end of
 * the last line blinks on the ambient layer like every other caret here.
 */

import { rect, panel, svgDoc, body, bodyWidth, W_FULL, W_MOBILE, SHADOW, S } from "../lib/design.mjs"
import { styles, enabled, scanline } from "../lib/motion.mjs"
import { adv, MICRO } from "../lib/type.mjs"

export const id = "terminal"
export const responsive = true

const LEAD = S.sm

export function render(t, ctx, cfg, { mobile = false } = {}) {
  const W = mobile ? W_MOBILE : W_FULL
  const spec = cfg.terminal ?? { lines: [] }
  const prompt = spec.prompt ?? "$"
  const PAD = S.sm
  const INNER = W - PAD * 2
  const max = Math.floor(INNER / adv(MICRO))
  const animate = enabled(cfg, "terminal")
  const out = []
  const css = []

  // Truncating a transcript in the middle is fine — a terminal scrolls — but
  // truncating one INVISIBLY is not, so an over-long line keeps its head and
  // says it was cut.
  const lines = (spec.lines ?? []).map((l) => (l.length > max ? l.slice(0, max - 1) + "…" : l))

  const first = S.xs + S.md + 8
  const H = first + Math.max(0, lines.length - 1) * LEAD + S.md
  out.push(panel(t, { x: 0, y: S.xs, w: W, h: H - S.xs, title: spec.title ?? "session", meta: spec.meta }))

  let lastY = first
  let lastW = 0
  lines.forEach((l, i) => {
    const y = first + i * LEAD
    const isCmd = l.startsWith(prompt)
    if (isCmd) {
      out.push(body(prompt, { x: PAD, y, fill: t.accent }))
      out.push(body(l.slice(prompt.length).replace(/^ /, ""), { x: PAD + adv(MICRO) * (prompt.length + 1), y, fill: t.ink }))
    } else {
      out.push(body(l, { x: PAD, y, fill: t.inkDim }))
    }
    lastY = y
    lastW = bodyWidth(l)
  })

  // The caret sits where the next character would go, which is the only place
  // a caret is ever correct.
  if (lines.length) out.push(rect(PAD + lastW + 2, lastY - 8, 2, 10, t.accent, `class="cr"`))

  if (animate) {
    out.push(`<g class="tsc"><rect x="2" y="${S.xs + 4}" width="${W - 4}" height="2" fill="${t.accent}"/></g>`)
    css.push(scanline("tsc", { distance: H - S.xs - 10, period: 5200, peak: 0.28 }))
  }

  return {
    w: W, h: H + S.xs, body: out.join(""),
    css: styles(cfg, "terminal", css.join("")),
    title: `${spec.title ?? "Session"} — ${lines.join(" / ")}`,
  }
}

export const build = (t, ctx, cfg, v) => {
  const r = render(t, ctx, cfg, v)
  return svgDoc({ w: r.w, h: r.h, theme: t, body: r.body, css: r.css, title: r.title, bleed: SHADOW })
}
