/* What a preset sets: the colour tokens (light and dark), the corners, the font and the motion.
   The same functions feed the /create preview, the "Copy CSS" button and the shadcn registry item
   at /r/preset-<code>.json, so all three always agree.

   Colours are the shadcn/ui token names the components already read. With every field at its
   default, the tokens equal src/index.css exactly and no motion or corner rules are written, so
   the default preset is the look the components ship with (scripts/tests/preset.test.mjs checks). */

import theming from "../../content/theming.json"
import { DEFAULT_PRESET, encodePreset, type Preset } from "./preset"

export type TokenSet = Record<string, string>

const round = (value: number, places = 3) => {
  const out = Number(value.toFixed(places))
  return Object.is(out, -0) ? 0 : out
}
const oklch = (l: number, c: number, h: number) => (round(c) === 0 ? `oklch(${round(l)} 0 0)` : `oklch(${round(l)} ${round(c)} ${round(h, 1)})`)

/* ---------- Base colour: the neutral ladder, tinted ----------
   The lightness of every step is today's neutral ladder. A tinted base adds its hue with most
   chroma at middle lightness and none at pure white, the way Tailwind's grey families are built. */

const LADDER = {
  light: {
    background: 1, foreground: 0.165, card: 1, "card-foreground": 0.165, popover: 1, "popover-foreground": 0.165,
    primary: 0.205, "primary-foreground": 0.985, secondary: 0.965, "secondary-foreground": 0.205,
    muted: 0.962, "muted-foreground": 0.52, accent: 0.955, "accent-foreground": 0.205, border: 0.915, input: 0.885,
  },
  dark: {
    background: 0.16, foreground: 0.965, card: 0.195, "card-foreground": 0.965, popover: 0.205, "popover-foreground": 0.965,
    primary: 0.93, "primary-foreground": 0.18, secondary: 0.255, "secondary-foreground": 0.965,
    muted: 0.235, "muted-foreground": 0.69, accent: 0.275, "accent-foreground": 0.965,
  },
} as const

/* Dark borders are white at low alpha, so they read on any tint; destructive and the focus ring are their own colours. */
const FIXED = {
  light: { destructive: "oklch(0.577 0.225 27)", ring: "oklch(0.62 0.17 255)" },
  dark: { destructive: "oklch(0.7 0.19 22)", border: "oklch(1 0 0 / 0.1)", input: "oklch(1 0 0 / 0.16)", ring: "oklch(0.7 0.15 255)" },
} as const

export const BASES: Record<Preset["base"], { label: string; hue: number; chroma: number }> = {
  neutral: { label: "Neutral", hue: 0, chroma: 0 },
  stone: { label: "Stone", hue: 56, chroma: 0.014 },
  zinc: { label: "Zinc", hue: 286, chroma: 0.017 },
  slate: { label: "Slate", hue: 257, chroma: 0.045 },
  gray: { label: "Gray", hue: 264, chroma: 0.028 },
  mauve: { label: "Mauve", hue: 322, chroma: 0.022 },
  olive: { label: "Olive", hue: 112, chroma: 0.02 },
}

const tint = (base: Preset["base"], l: number) => {
  const { hue, chroma } = BASES[base]
  return oklch(l, chroma * 4 * l * (1 - l), hue)
}

/* ---------- Theme colour: primary, its ink and the focus ring ----------
   Light uses the 600 step of Tailwind's palette (500 or 400 for the yellows), dark the 500 step.
   A light colour gets dark ink, a dark one near-white ink. Cobalt is Keyframery's own playhead. */

type Swatch = readonly [l: number, c: number, h: number]

export const THEMES: Record<Preset["theme"], { label: string; light: Swatch; dark: Swatch } | { label: string; light: null; dark: null }> = {
  default: { label: "Default", light: null, dark: null },
  cobalt: { label: "Cobalt", light: [0.507, 0.258, 266.4], dark: [0.707, 0.153, 272.1] },
  blue: { label: "Blue", light: [0.546, 0.245, 262.881], dark: [0.623, 0.214, 259.815] },
  sky: { label: "Sky", light: [0.588, 0.158, 241.966], dark: [0.685, 0.169, 237.323] },
  teal: { label: "Teal", light: [0.6, 0.118, 184.704], dark: [0.704, 0.14, 182.503] },
  emerald: { label: "Emerald", light: [0.596, 0.145, 163.225], dark: [0.696, 0.17, 162.48] },
  green: { label: "Green", light: [0.627, 0.194, 149.214], dark: [0.723, 0.219, 149.579] },
  amber: { label: "Amber", light: [0.769, 0.188, 70.08], dark: [0.769, 0.188, 70.08] },
  yellow: { label: "Yellow", light: [0.852, 0.199, 91.936], dark: [0.852, 0.199, 91.936] },
  orange: { label: "Orange", light: [0.646, 0.222, 41.116], dark: [0.705, 0.213, 47.604] },
  red: { label: "Red", light: [0.577, 0.245, 27.325], dark: [0.637, 0.237, 25.331] },
  rose: { label: "Rose", light: [0.586, 0.253, 17.585], dark: [0.645, 0.246, 16.439] },
  violet: { label: "Violet", light: [0.541, 0.281, 293.009], dark: [0.606, 0.25, 292.717] },
  indigo: { label: "Indigo", light: [0.511, 0.262, 276.966], dark: [0.585, 0.233, 277.117] },
}

const ink = ([l, c, h]: Swatch) => (l >= 0.68 ? oklch(0.24, Math.min(0.06, c * 0.3), h) : "oklch(0.985 0 0)")
/* A focus ring must show against the page: very light colours ring a step darker. */
const ringOf = ([l, c, h]: Swatch) => oklch(Math.min(l, 0.68), c, h)

/* ---------- Chart palette (--chart-1 … --chart-5) ----------
   Default is the set src/index.css ships (a cobalt lead, quieter blues, one warm counterpoint); the others are one hue from light to dark (Tailwind 300 to 800). */

const ramp = (h: number, steps: readonly (readonly [number, number])[]) => steps.map(([l, c]) => oklch(l, c, h))

export const CHARTS: Record<Preset["chart"], { label: string; light: string[]; dark: string[] }> = {
  default: {
    label: "Default",
    light: ["oklch(0.56 0.19 263)", "oklch(0.74 0.1 228)", "oklch(0.4 0.08 262)", "oklch(0.72 0.12 62)", "oklch(0.85 0.035 250)"],
    dark: ["oklch(0.66 0.17 263)", "oklch(0.8 0.09 228)", "oklch(0.56 0.07 260)", "oklch(0.76 0.11 64)", "oklch(0.9 0.025 250)"],
  },
  blue: { label: "Blue", ...both(ramp(262, [[0.809, 0.105], [0.623, 0.214], [0.546, 0.245], [0.488, 0.243], [0.424, 0.199]])) },
  green: { label: "Green", ...both(ramp(150, [[0.871, 0.15], [0.723, 0.219], [0.627, 0.194], [0.527, 0.154], [0.448, 0.119]])) },
  orange: { label: "Orange", ...both(ramp(45, [[0.837, 0.128], [0.705, 0.213], [0.646, 0.222], [0.553, 0.195], [0.47, 0.157]])) },
  violet: { label: "Violet", ...both(ramp(293, [[0.811, 0.111], [0.606, 0.25], [0.541, 0.281], [0.491, 0.27], [0.432, 0.232]])) },
  rose: { label: "Rose", ...both(ramp(16, [[0.81, 0.117], [0.645, 0.246], [0.586, 0.253], [0.514, 0.222], [0.455, 0.188]])) },
  neutral: { label: "Neutral", light: ramp(0, [[0.87, 0], [0.708, 0], [0.556, 0], [0.439, 0], [0.269, 0]]), dark: ramp(0, [[0.922, 0], [0.708, 0], [0.556, 0], [0.439, 0], [0.371, 0]]) },
}

function both(values: string[]) {
  return { light: values, dark: values }
}

/* ---------- Corners ----------
   The components don't read --radius: each has its own corner variable with a px fallback
   (content/theming.json lists them). A radius other than the default scales every one of those
   that isn't a pill. At the default nothing is written, so components keep their exact corners. */

export const RADII: Record<Preset["radius"], string> = { "0": "0", "0.3": "0.3rem", "0.5": "0.5rem", "0.625": "0.625rem", "0.75": "0.75rem", "1": "1rem" }

/* [variable, px]: a pill (9999px or infinity) keeps its shape; "8px / 9px / 10px" by size uses the middle size. */
export const RADIUS_VARS: (readonly [string, number])[] = Object.values(theming as unknown as Record<string, [string, string, string][]>)
  .flat()
  .filter(([name]) => name.endsWith("-radius"))
  .flatMap(([name, , fallback]) => {
    const sizes = [...fallback.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]))
    if (!sizes.length || sizes.some((px) => px >= 999) || /infinity/.test(fallback)) return []
    return [[name, sizes.length > 1 ? sizes[1] : sizes[0]] as const]
  })

export function radiusVars(preset: Preset): Record<string, string> {
  if (preset.radius === DEFAULT_PRESET.radius) return {}
  const scale = Number(preset.radius) / Number(DEFAULT_PRESET.radius)
  return Object.fromEntries(RADIUS_VARS.map(([name, px]) => [name, `${round(Math.round(px * scale * 2) / 2, 1)}px`]))
}

/* ---------- Fonts ----------
   A font is a shadcn `registry:font` item, so the CLI wires it the way the project expects:
   next/font in a Next.js app, @fontsource-variable plus an @import anywhere else. "inherit" keeps
   the project's font, as Keyframery always has; "system" writes the system stack. */

export const FONTS: Record<Preset["font"], { label: string; family: string | null; google?: string; dependency?: string }> = {
  inherit: { label: "Your font", family: null },
  inter: { label: "Inter", family: "'Inter Variable', sans-serif", google: "Inter", dependency: "@fontsource-variable/inter" },
  geist: { label: "Geist", family: "'Geist Variable', sans-serif", google: "Geist", dependency: "@fontsource-variable/geist" },
  figtree: { label: "Figtree", family: "'Figtree Variable', sans-serif", google: "Figtree", dependency: "@fontsource-variable/figtree" },
  manrope: { label: "Manrope", family: "'Manrope Variable', sans-serif", google: "Manrope", dependency: "@fontsource-variable/manrope" },
  "dm-sans": { label: "DM Sans", family: "'DM Sans Variable', sans-serif", google: "DM_Sans", dependency: "@fontsource-variable/dm-sans" },
  system: { label: "System", family: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" },
}

/** The shadcn registry item for one font, served at /r/font-<name>.json. */
export function fontItem(name: string) {
  const font = FONTS[name as Preset["font"]]
  if (!font?.google || !font.family || !font.dependency) return null
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `font-${name}`,
    type: "registry:font" as const,
    title: font.label,
    font: { family: font.family, provider: "google" as const, import: font.google, variable: "--font-sans", subsets: ["latin"], dependency: font.dependency },
  }
}

/* ---------- Motion ----------
   The five styles as src/index.css defines them (the test compares the two). Subtle is what the
   components ship with (no data-motion attribute); every preset writes only what differs from it. A preset picks one as
   the app's own motion, optionally faster or slower and with a different amount of bounce, and
   writes it on :root:not([data-motion]): a page without data-motion moves this way, while a
   data-motion attribute (or the MotionStyle switcher) still selects the four stock styles. */

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)"

export const STYLES = {
  subtle: {
    label: "Subtle",
    note: "Quick fades and slides, no bounce or flourishes. The default.",
    speed: 0.7,
    flourish: 0,
    spring: EASE_OUT,
    pop: EASE_OUT,
  },
  springy: {
    label: "Springy",
    note: "A 5% spring and a 16% pop. For most products.",
    speed: 1,
    flourish: 1,
    spring: "linear(0, 0.001 0.5%, 0.010 1.5%, 0.036 2.8%, 0.082 4.4%, 0.153 6.3%, 0.247 8.5%, 0.358 10.9%, 0.480 13.5%, 0.604 16.3%, 0.721 19.3%, 0.825 22.4%, 0.911 25.8%, 0.976 29.3%, 1.019 33.0%, 1.044 36.8%, 1.054 40.8%, 1.052 45.0%, 1.044 49.3%, 1.033 53.8%, 1.022 58.4%, 1.012 63.1%, 1.005 68.0%, 1.000 73.0%, 0.998 78.1%, 0.997 83.4%, 0.997 88.8%, 0.998 94.3%, 1)",
    pop: "linear(0, 0.002 0.5%, 0.019 1.5%, 0.066 2.8%, 0.150 4.4%, 0.276 6.3%, 0.435 8.5%, 0.612 10.9%, 0.789 13.5%, 0.945 16.3%, 1.064 19.3%, 1.136 22.4%, 1.163 25.8%, 1.151 29.3%, 1.114 33.0%, 1.067 36.8%, 1.023 40.8%, 0.992 45.0%, 0.976 49.3%, 0.974 53.8%, 0.980 58.4%, 0.989 63.1%, 0.997 68.0%, 1.003 73.0%, 1.004 78.1%, 1.004 83.4%, 1.002 88.8%, 1.000 94.3%, 1)",
  },
  calm: {
    label: "Calm",
    note: "Slower and no bounce. For dashboards and long sessions.",
    speed: 1.35,
    flourish: 1,
    spring: "linear(0, 0.001 0.5%, 0.007 1.5%, 0.024 2.8%, 0.055 4.4%, 0.102 6.4%, 0.163 8.5%, 0.235 10.9%, 0.316 13.5%, 0.400 16.3%, 0.484 19.3%, 0.565 22.4%, 0.641 25.8%, 0.708 29.3%, 0.767 33.0%, 0.818 36.8%, 0.859 40.8%, 0.893 45.0%, 0.920 49.3%, 0.941 53.8%, 0.957 58.4%, 0.970 63.1%, 0.979 68.0%, 0.985 73.0%, 0.990 78.1%, 0.993 83.4%, 0.995 88.8%, 0.997 94.3%, 1)",
    pop: "linear(0, 0.001 0.5%, 0.006 1.5%, 0.022 2.8%, 0.052 4.4%, 0.099 6.4%, 0.161 8.5%, 0.237 10.9%, 0.325 13.5%, 0.419 16.3%, 0.515 19.3%, 0.609 22.4%, 0.697 25.8%, 0.775 29.3%, 0.841 33.0%, 0.896 36.8%, 0.938 40.8%, 0.970 45.0%, 0.991 49.3%, 1.005 53.8%, 1.012 58.4%, 1.015 63.1%, 1.015 68.0%, 1.013 73.0%, 1.011 78.1%, 1.008 83.4%, 1.005 88.8%, 1.003 94.3%, 1)",
  },
  snappy: {
    label: "Snappy",
    note: "Fast and crisp, almost no overshoot. For tools and dense apps.",
    speed: 0.6,
    flourish: 1,
    spring: "linear(0, 0.001 0.5%, 0.007 1.5%, 0.022 2.8%, 0.052 4.4%, 0.098 6.4%, 0.159 8.5%, 0.234 10.9%, 0.319 13.5%, 0.410 16.3%, 0.502 19.3%, 0.592 22.4%, 0.676 25.8%, 0.752 29.3%, 0.816 33.0%, 0.870 36.8%, 0.913 40.8%, 0.946 45.0%, 0.969 49.3%, 0.986 53.8%, 0.996 58.4%, 1.002 63.1%, 1.005 68.0%, 1.006 73.0%, 1.006 78.1%, 1.005 83.4%, 1.004 88.8%, 1.003 94.3%, 1)",
    pop: "linear(0, 0.001 0.5%, 0.009 1.5%, 0.032 2.8%, 0.074 4.4%, 0.139 6.4%, 0.225 8.5%, 0.329 10.9%, 0.445 13.5%, 0.564 16.3%, 0.681 19.3%, 0.787 22.4%, 0.877 25.8%, 0.948 29.3%, 1.000 33.0%, 1.033 36.8%, 1.050 40.8%, 1.054 45.0%, 1.050 49.3%, 1.041 53.8%, 1.030 58.4%, 1.019 63.1%, 1.010 68.0%, 1.004 73.0%, 1.000 78.1%, 0.998 83.4%, 0.997 88.8%, 0.997 94.3%, 1)",
  },
  playful: {
    label: "Playful",
    note: "A little slower, a 12% spring and a 29% pop. For consumer apps.",
    speed: 1.15,
    flourish: 1,
    spring: "linear(0, 0.001 0.5%, 0.010 1.5%, 0.033 2.8%, 0.079 4.4%, 0.149 6.4%, 0.243 8.5%, 0.359 10.9%, 0.489 13.5%, 0.624 16.3%, 0.756 19.3%, 0.875 22.4%, 0.974 25.8%, 1.047 29.3%, 1.095 33.0%, 1.117 36.8%, 1.118 40.8%, 1.104 45.0%, 1.080 49.3%, 1.054 53.8%, 1.029 58.4%, 1.009 63.1%, 0.995 68.0%, 0.988 73.0%, 0.986 78.1%, 0.987 83.4%, 0.991 88.8%, 0.995 94.3%, 1)",
    pop: "linear(0, 0.003 0.5%, 0.023 1.5%, 0.080 2.8%, 0.185 4.4%, 0.341 6.4%, 0.539 8.5%, 0.757 10.9%, 0.968 13.5%, 1.140 16.3%, 1.250 19.3%, 1.286 22.4%, 1.255 25.8%, 1.176 29.3%, 1.078 33.0%, 0.991 36.8%, 0.935 40.8%, 0.918 45.0%, 0.933 49.3%, 0.965 53.8%, 0.997 58.4%, 1.018 63.1%, 1.023 68.0%, 1.017 73.0%, 1.006 78.1%, 0.997 83.4%, 0.993 88.8%, 0.995 94.3%, 1)",
  },
} as const satisfies Record<Preset["motion"], { label: string; note: string; speed: number; flourish: number; spring: string; pop: string }>

/* Overshoot of the two springs: --ease-spring moves things, --ease-pop lands small payoffs. */
export const BOUNCES: Record<Preset["bounce"], { label: string; spring: number; pop: number } | { label: string; spring: null; pop: null }> = {
  style: { label: "Style's own", spring: null, pop: null },
  none: { label: "None", spring: 0, pop: 0 },
  soft: { label: "Soft", spring: 0.02, pop: 0.07 },
  lively: { label: "Lively", spring: 0.08, pop: 0.2 },
  bouncy: { label: "Bouncy", spring: 0.14, pop: 0.3 },
}

/* A damped spring, settled by the end, as a CSS linear() easing. Overshoot 0 is critically damped. */
export function springEasing(overshoot: number): string {
  const zeta = overshoot <= 0 ? 1 : -Math.log(overshoot) / Math.sqrt(Math.PI ** 2 + Math.log(overshoot) ** 2)
  const at = (omega: number, t: number) => {
    if (zeta >= 1) return 1 - Math.exp(-omega * t) * (1 + omega * t)
    const damped = omega * Math.sqrt(1 - zeta ** 2)
    return 1 - Math.exp(-zeta * omega * t) * (Math.cos(damped * t) + (zeta / Math.sqrt(1 - zeta ** 2)) * Math.sin(damped * t))
  }
  // The slowest spring that has settled (within 0.3%) over the last tenth.
  let omega = 4
  while (omega < 60 && Array.from({ length: 11 }, (_, i) => 0.9 + i / 100).some((t) => Math.abs(at(omega, t) - 1) > 0.003)) omega += 0.25
  const points = Array.from({ length: 39 }, (_, i) => (i + 1) / 40).map((t) => round(at(omega, t)).toFixed(3))
  return `linear(0, ${points.join(", ")}, 1)`
}

export type Motion = { speed: number; flourish: number; spring: string; pop: string }

/** The motion the preset's default style resolves to, and the CSS variables that differ from what ships (Subtle). */
export function presetMotion(preset: Preset): Motion & { vars: Record<string, string> } {
  const style = STYLES[preset.motion]
  const bounce = BOUNCES[preset.bounce]
  const speed = round(style.speed / Number(preset.speed))
  const spring = bounce.spring === null ? style.spring : springEasing(bounce.spring)
  const pop = bounce.pop === null ? style.pop : springEasing(bounce.pop)
  const flourish = style.flourish
  const shipped = STYLES.subtle
  const vars: Record<string, string> = {}
  if (speed !== shipped.speed) vars["--kf-speed"] = String(speed)
  if (flourish !== shipped.flourish) vars["--kf-flourish"] = String(flourish)
  if (spring !== shipped.spring) vars["--ease-spring"] = spring
  if (pop !== shipped.pop) vars["--ease-pop"] = pop
  return { speed, flourish, spring, pop, vars }
}

/* Reduced motion, gentler: for visitors who ask their system for less motion, every style loses
   its overshoot and flourishes and runs at 0.7× the duration, which is Subtle. The components
   already drop their larger moves under prefers-reduced-motion; this calms what remains. */
export const GENTLE = { "--kf-speed": "0.7", "--kf-flourish": "0", "--ease-spring": "var(--ease-house)", "--ease-pop": "var(--ease-house)" }

/* ---------- The whole preset ---------- */

export function presetTokens(preset: Preset): { light: TokenSet; dark: TokenSet } {
  const light: TokenSet = {}
  const dark: TokenSet = {}
  for (const [name, l] of Object.entries(LADDER.light)) light[name] = tint(preset.base, l)
  for (const [name, l] of Object.entries(LADDER.dark)) dark[name] = tint(preset.base, l)
  Object.assign(light, FIXED.light)
  Object.assign(dark, FIXED.dark)

  const theme = THEMES[preset.theme]
  if (theme.light) {
    light.primary = oklch(...theme.light)
    light["primary-foreground"] = ink(theme.light)
    light.ring = ringOf(theme.light)
    dark.primary = oklch(...theme.dark)
    dark["primary-foreground"] = ink(theme.dark)
    dark.ring = ringOf(theme.dark)
  }
  if (preset.highlight === "tinted") {
    const hue = theme.light ? theme.light[2] : BASES[preset.base].hue
    const strength = theme.light || BASES[preset.base].chroma ? 1 : 0
    light.accent = oklch(0.955, 0.03 * strength, hue)
    light["accent-foreground"] = oklch(0.3, 0.09 * strength, hue)
    dark.accent = oklch(0.3, 0.045 * strength, hue)
    dark["accent-foreground"] = oklch(0.965, 0.015 * strength, hue)
  }

  const chart = CHARTS[preset.chart]
  chart.light.forEach((value, i) => (light[`chart-${i + 1}`] = value))
  chart.dark.forEach((value, i) => (dark[`chart-${i + 1}`] = value))
  light.radius = RADII[preset.radius]
  return { light, dark }
}

/** One line a person can read: "Stone, Cobalt, 0.5rem, Figtree · Calm, 1.25×, soft bounce". */
export function describePreset(preset: Preset): string {
  const look = [BASES[preset.base].label, THEMES[preset.theme].label === "Default" ? null : THEMES[preset.theme].label, RADII[preset.radius] === "0" ? "square" : RADII[preset.radius], preset.font === "inherit" ? null : FONTS[preset.font].label]
  const motion = [STYLES[preset.motion].label, preset.speed === "1" ? null : `${preset.speed}× speed`, preset.bounce === "style" ? null : `${BOUNCES[preset.bounce].label.toLowerCase()} bounce`, preset.reduced === "gentle" ? "gentler reduced motion" : null]
  return `${look.filter(Boolean).join(", ")} · ${motion.filter(Boolean).join(", ")}`
}

type CssTree = { [selector: string]: string | CssTree }

/* The `css` part of the registry item. Motion and corners go in the base layer like Keyframery's own
   motion tokens; reduced motion stays unlayered so it wins over every data-motion style. */
function presetCssTree(preset: Preset): CssTree {
  const tree: CssTree = {}
  const base: CssTree = {}
  const corners = radiusVars(preset)
  if (Object.keys(corners).length) base[":root"] = corners
  const { vars } = presetMotion(preset)
  if (Object.keys(vars).length) base[":root:not([data-motion])"] = vars
  if (Object.keys(base).length) tree["@layer base"] = base
  if (preset.reduced === "gentle") tree["@media (prefers-reduced-motion: reduce)"] = { ":root, [data-motion]": { ...GENTLE } }
  return tree
}

/** The shadcn registry item served at /r/preset-<code>.json. `origin` is where its dependencies live. */
export function presetRegistryItem(preset: Preset, origin: string) {
  const code = encodePreset(preset)
  const { light, dark } = presetTokens(preset)
  const font = FONTS[preset.font]
  const css = presetCssTree(preset)
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: `preset-${code}`,
    type: "registry:theme" as const,
    title: `Keyframery preset ${code}`,
    description: `${describePreset(preset)}. Made at ${origin}/create?preset=${code}`,
    registryDependencies: [`${origin}/r/motion.json`, ...(font.google ? [`${origin}/r/font-${preset.font}.json`] : [])],
    cssVars: {
      ...(preset.font === "system" && font.family ? { theme: { "font-sans": font.family } } : {}),
      light,
      dark,
    },
    ...(Object.keys(css).length ? { css } : {}),
    meta: { preset: code, create: `${origin}/create?preset=${code}` },
  }
}

const block = (selector: string, vars: Record<string, string>, indent = "") =>
  `${indent}${selector} {\n${Object.entries(vars).map(([name, value]) => `${indent}  ${name.startsWith("--") ? name : `--${name}`}: ${value};`).join("\n")}\n${indent}}`

/** The preset as CSS to paste into a global stylesheet, for projects that don't use the shadcn CLI. */
export function presetCss(preset: Preset, origin = "https://keyframery.com"): string {
  const code = encodePreset(preset)
  const { light, dark } = presetTokens(preset)
  const parts = [`/* Keyframery preset ${code}: ${describePreset(preset)}\n   ${origin}/create?preset=${code} */`, block(":root", light), block(".dark", dark)]
  const corners = radiusVars(preset)
  if (Object.keys(corners).length) parts.push(`/* Corners: every Keyframery component's radius, scaled to ${RADII[preset.radius]}. */\n${block(":root", corners)}`)
  const { vars } = presetMotion(preset)
  if (Object.keys(vars).length) parts.push(`/* Motion: ${STYLES[preset.motion].label}${preset.speed === "1" ? "" : ` at ${preset.speed}×`}${preset.bounce === "style" ? "" : `, ${BOUNCES[preset.bounce].label.toLowerCase()} bounce`}. A data-motion attribute still picks a stock style. */\n@layer base {\n${block(":root:not([data-motion])", vars, "  ")}\n}`)
  if (preset.reduced === "gentle") parts.push(`/* Gentler motion for people who ask their system for less. */\n@media (prefers-reduced-motion: reduce) {\n${block(":root, [data-motion]", GENTLE, "  ")}\n}`)
  const font = FONTS[preset.font]
  if (font.family) {
    const load = font.dependency ? `Install ${font.dependency} and add @import "${font.dependency}"; (or load ${font.label} with next/font), then: ` : ""
    parts.push(`/* Font: ${font.label}. ${load}*/\n@theme inline {\n  --font-sans: ${font.family};\n}`)
  }
  return parts.join("\n\n") + "\n"
}

/** CSS variables for the /create preview: the tokens for one mode, the corners and the motion. */
export function presetPreviewVars(preset: Preset, mode: "light" | "dark"): Record<string, string> {
  const tokens = { ...presetTokens(preset)[mode], radius: RADII[preset.radius] }
  const { speed, flourish, spring, pop } = presetMotion(preset)
  return {
    ...Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--${name}`, value])),
    ...radiusVars(preset),
    "--kf-speed": String(speed),
    "--kf-flourish": String(flourish),
    "--ease-spring": spring,
    "--ease-pop": pop,
  }
}
