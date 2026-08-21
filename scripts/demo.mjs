/**
 * Demo data for the preview gallery.
 *
 * Every number and name here is invented. The panels in this repository are
 * drawn from a live GitHub account in the project they came from; the previews
 * in the README are drawn from this file instead, so the gallery shows what the
 * components look like without publishing anybody's account.
 *
 * It is also the spec for what a panel expects. If you are wiring these to a
 * real source, produce this shape.
 */

/* A small deterministic generator, so two builds of the gallery are identical
 * and a diff means something changed rather than that the dice rolled again. */
function lcg(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000)
}

const rnd = lcg(20260821)
const DAY = 86400e3

/* ------------------------------------------------------------------ rhythm */
// A working day with a late-morning peak and a smaller evening return.
const SHAPE = [1, 0, 0, 0, 0, 1, 2, 4, 7, 11, 14, 12, 8, 6, 9, 12, 10, 7, 5, 6, 8, 6, 3, 2]
const hours = SHAPE.map((n) => n + Math.round(rnd() * 2))
const days = [18, 22, 27, 21, 19, 9, 12]

const peakHour = hours.indexOf(Math.max(...hours))
const pad = (n) => String(n).padStart(2, "0")
const night = hours.slice(22).concat(hours.slice(0, 6)).reduce((a, b) => a + b, 0)
const totalEvents = hours.reduce((a, b) => a + b, 0)

const rhythm = {
  hours,
  days,
  total: totalEvents,
  spanDays: 28,
  peakHour,
  peakWindow: `${pad(peakHour)}:00-${pad((peakHour + 1) % 24)}:00`,
  busiestDay: "Wed",
  nightShare: Math.round((night / totalEvents) * 100),
  offsetLabel: "UTC+1",
}

/* ----------------------------------------------------------- contributions */
// Quiet for most of the year, busier over the last few months — the shape a
// real account usually has, and the one the panel was tuned against.
const WEEKS = 53
const weeks = []
const today = new Date("2026-08-21T00:00:00Z")
for (let w = 0; w < WEEKS; w++) {
  const week = []
  for (let d = 0; d < 7; d++) {
    const daysAgo = (WEEKS - 1 - w) * 7 + (6 - d)
    const date = new Date(today.getTime() - daysAgo * DAY).toISOString().slice(0, 10)
    const recency = 1 - daysAgo / (WEEKS * 7) // 0 oldest, 1 newest
    const weekend = d >= 5
    const chance = recency ** 2 * (weekend ? 0.35 : 0.8)
    const n = rnd() < chance ? 1 + Math.floor(rnd() * (4 + recency * 26)) : 0
    week.push({ date, n, wd: (d + 1) % 7 })
  }
  weeks.push(week)
}

const flat = weeks.flat()
const active = flat.filter((d) => d.n > 0)
const sorted = active.map((d) => d.n).sort((a, b) => a - b)
const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
const levels = [1, q(0.25), q(0.5), q(0.75)].map((v, i, a) => Math.max(v, (a[i - 1] ?? 0) + 1))
for (let i = 1; i < levels.length; i++) levels[i] = Math.max(levels[i], levels[i - 1] + 1)

let longest = 0
let run = 0
for (const d of flat) { run = d.n > 0 ? run + 1 : 0; longest = Math.max(longest, run) }

const contributions = {
  weeks,
  total: flat.reduce((a, d) => a + d.n, 0),
  activeDays: active.length,
  totalDays: flat.length,
  max: Math.max(...active.map((d) => d.n)),
  peak: active.reduce((best, d) => (!best || d.n > best.n ? d : best), null),
  levels,
  longestStreak: longest,
  currentStreak: 6,
  level: (n) => (n <= 0 ? 0 : n < levels[1] ? 1 : n < levels[2] ? 2 : n < levels[3] ? 3 : 4),
}

/* ----------------------------------------------------------------- the rest */

const now = today

export const DEMO = {
  now,
  login: "octo-demo",
  rhythm,
  contributions,

  stars: [
    {
      name: "acme/plotter",
      description: "Turns a stream of measurements into something you can actually read.",
      language: "Rust",
      starredAt: new Date(now.getTime() - 0.8 * DAY).toISOString(),
    },
    {
      name: "hollowlab/tinyfs",
      description: "A filesystem small enough to read in an afternoon.",
      language: "C",
      starredAt: new Date(now.getTime() - 3 * DAY).toISOString(),
    },
    {
      name: "quiet-tools/ledger",
      description: "Plain-text accounting with no opinions about your money.",
      language: "Python",
      starredAt: new Date(now.getTime() - 11 * DAY).toISOString(),
    },
  ],

  languages: {
    top: [
      { name: "Rust", pct: 31.4, amount: "8.2k lines" },
      { name: "TypeScript", pct: 24.8, amount: "6.5k lines" },
      { name: "Markdown", pct: 18.2, amount: "4.8k lines" },
      { name: "Python", pct: 12.1, amount: "3.2k lines" },
      { name: "CSS", pct: 8.3, amount: "2.2k lines" },
      { name: "Shell", pct: 5.2, amount: "1.4k lines" },
    ],
    repoCount: 4,
    caption: "LINES I WROTE, ACROSS SELECTED WORK",
    summary: "26.3k lines",
    note: "Lines I added in 214 commits I authored, across all 4 selected repos. Generated and vendored files excluded.",
    method: "authored-lines",
    partial: false,
  },

  activity: [
    { type: "release", tag: "RELEASED", detail: "v0.7.0", repo: "plotter", at: now - 2 * DAY, ago: "2D" },
    { type: "public", tag: "OPEN SOURCED", detail: "", repo: "tinyfs", at: now - 5 * DAY, ago: "5D" },
    { type: "pr", tag: "MERGED PR", detail: "#48", repo: "ledger", at: now - 9 * DAY, ago: "9D" },
    { type: "ref/create", tag: "NEW REPO", detail: "", repo: "signal-desk", at: now - 16 * DAY, ago: "2W" },
  ],
}
