/**
 * Renders every component from demo data into preview/.
 *
 * This is the whole build for this repository. There is no data layer here on
 * purpose: a panel takes a theme, a plain object and a config block, and the
 * gallery hands it invented values. Wire the same shape to a live source and
 * the panels do not change.
 *
 *   node scripts/build-preview.mjs
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

import { THEME } from "./lib/design.mjs"
import { DEMO } from "./demo.mjs"

import * as hero from "./panels/hero.mjs"
import * as about from "./panels/about.mjs"
import * as sections from "./panels/sections.mjs"
import * as work from "./panels/work.mjs"
import * as rhythm from "./panels/rhythm.mjs"
import * as languages from "./panels/languages.mjs"
import * as stars from "./panels/stars.mjs"
import * as activity from "./panels/activity.mjs"
import * as contributions from "./panels/contributions.mjs"
import * as fortune from "./panels/fortune.mjs"
import * as display from "./panels/display.mjs"
import * as tiles from "./panels/tiles.mjs"
import * as quote from "./panels/quote.mjs"
import * as contact from "./panels/contact.mjs"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, "preview")

const SINGLE = [hero, about, rhythm, languages, stars, activity, contributions, fortune, display, tiles, quote]
const MULTI = [sections, work, contact]

const VARIANTS = [
  { key: "", mobile: false },
  { key: "-m", mobile: true },
]

const cfg = JSON.parse(await readFile(resolve(ROOT, "config.example.json"), "utf8"))
await mkdir(OUT, { recursive: true })

let written = 0
for (const panel of SINGLE) {
  for (const v of VARIANTS) {
    if (v.mobile && !panel.responsive) continue
    const svg = panel.build(THEME, DEMO, cfg, v)
    await writeFile(resolve(OUT, `${panel.id}${v.key}.svg`), svg, "utf8")
    written++
    if (!v.mobile) console.log(`  ${panel.id.padEnd(15)} ${String(svg.length).padStart(7)} B`)
  }
}

for (const mod of MULTI) {
  let n = 0
  for (const v of VARIANTS) {
    if (v.mobile && !mod.responsive) continue
    for (const f of mod.build(THEME, DEMO, cfg, v)) {
      const base = mod.id === "contact" ? `btn-${f.key}` : f.key
      await writeFile(resolve(OUT, `${base}${v.key}.svg`), f.svg, "utf8")
      written++
      n++
    }
  }
  console.log(`  ${mod.id.padEnd(15)}          ${n} file(s)`)
}

console.log(`\n${written} file(s) -> preview/`)

// Anything left over from a previous run with different names would quietly rot
// in the gallery, so say so.
const onDisk = (await readdir(OUT)).filter((f) => f.endsWith(".svg"))
if (onDisk.length !== written) {
  console.warn(`! preview/ holds ${onDisk.length} files but this run wrote ${written} — stale output?`)
}
