/**
 * QA — renders every component twice, once per palette, into a page that can be
 * screenshotted.
 *
 * Not part of the build and not committed. The gallery in preview/ follows the
 * reader's own theme, which makes it useless for checking the theme you are not
 * currently in; this pins each palette so both can be looked at on one screen.
 *
 *   node scripts/qa.mjs
 *   chrome --headless=new --screenshot=.qa/shot.png --window-size=900,6000 .qa/index.html
 *
 * Output goes to .qa/, which is ignored.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

import { THEME, svgDoc, SHADOW } from "./lib/design.mjs"
import { DEMO } from "./demo.mjs"

const NAMES = process.argv.slice(2)
const ALL = ["display", "terminal", "timeline", "progress", "gauge", "ticker", "table", "languages", "contributions", "about"]
const pick = NAMES.length ? NAMES : ALL

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, ".qa")
await mkdir(OUT, { recursive: true })

const cfg = JSON.parse(await readFile(resolve(ROOT, "config.example.json"), "utf8"))

const rows = []
for (const name of pick) {
  const mod = await import(`./panels/${name}.mjs`)
  for (const mobile of [false, true]) {
    if (mobile && !mod.responsive) continue
    const r = mod.render(THEME, DEMO, cfg, { mobile })
    for (const force of ["light", "dark"]) {
      const file = `${name}${mobile ? "-m" : ""}-${force}.svg`
      // paintBg matches how each panel's own build() wraps itself: the ones
      // that draw their own frame edge-to-edge opt out of the background rect.
      const svg = svgDoc({
        w: r.w, h: r.h, theme: THEME, body: r.body, css: r.css, title: r.title,
        bleed: mod.id === "tiles" || mod.id === "gauge" || mod.id === "ticker" || mod.id === "quote" || mod.id === "display" ? 0 : SHADOW,
        paintBg: true, force,
      })
      await writeFile(resolve(OUT, file), svg, "utf8")
    }
    rows.push({ name, mobile })
  }
}

const html = `<!doctype html><meta charset="utf-8"><title>qa</title>
<style>
 body{margin:0;font:12px ui-monospace,monospace;background:#888}
 .row{display:flex;gap:0;align-items:flex-start}
 .cell{padding:12px}
 .light{background:#fff;color:#24292f}
 .dark{background:#0d1117;color:#c9d1d9}
 h2{font:12px ui-monospace,monospace;margin:0 0 6px;letter-spacing:1px;text-transform:uppercase;opacity:.6}
 img{display:block}
</style>
${rows
  .map(
    ({ name, mobile }) => `<div class="row">
  <div class="cell light"><h2>${name}${mobile ? " · phone" : ""} · light</h2><img src="${name}${mobile ? "-m" : ""}-light.svg"></div>
  <div class="cell dark"><h2>${name}${mobile ? " · phone" : ""} · dark</h2><img src="${name}${mobile ? "-m" : ""}-dark.svg"></div>
</div>`
  )
  .join("\n")}
`
await writeFile(resolve(OUT, "index.html"), html, "utf8")
console.log(`.qa/index.html — ${rows.length} row(s)`)
