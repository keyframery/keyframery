/* Keyframery presets: a whole look and motion feel as one short code.

   A preset is a choice from a fixed list for every field below. The code packs the index of each
   choice into one integer, field by field (the first field in the lowest bits), and writes it in
   base 62 after a version letter:

     k  +  base62(base | theme << 4 | chart << 9 | …)        e.g. "k2Bf9Q"

   The rules that keep every code ever shared decoding to the same preset:
   - Fields are never reordered, resized or removed, and a list only ever grows at its end.
   - New fields go after the last one. Old codes have zeros there, and index 0 is always a field's
     default, so an old code decodes to the old preset plus today's defaults.
   - A change that can't follow those rules gets a new version letter, and "k" keeps decoding as now.

   36 of the 53 bits a JavaScript number holds exactly are used, so there is room to grow.
   The default preset (index 0 everywhere) is "k0", and it equals the tokens the components ship
   with. This module is pure: no imports, so the site, the registry route and the tests share it. */

export const PRESET_VERSION = "k"

export const PRESET_FIELDS = [
  { key: "base", bits: 4, values: ["neutral", "stone", "zinc", "slate", "gray", "mauve", "olive"] },
  {
    key: "theme",
    bits: 5,
    values: ["default", "cobalt", "blue", "sky", "teal", "emerald", "green", "amber", "yellow", "orange", "red", "rose", "violet", "indigo"],
  },
  { key: "chart", bits: 4, values: ["default", "blue", "green", "orange", "violet", "rose", "neutral"] },
  { key: "radius", bits: 4, values: ["0.625", "0", "0.3", "0.5", "0.75", "1"] },
  { key: "font", bits: 5, values: ["inherit", "inter", "geist", "figtree", "manrope", "dm-sans", "system"] },
  { key: "highlight", bits: 2, values: ["neutral", "tinted"] },
  { key: "motion", bits: 3, values: ["springy", "calm", "snappy", "playful"] },
  { key: "speed", bits: 4, values: ["1", "0.5", "0.75", "1.25", "1.5"] },
  { key: "bounce", bits: 3, values: ["style", "none", "soft", "lively", "bouncy"] },
  { key: "reduced", bits: 2, values: ["keep", "gentle"] },
] as const

type Field = (typeof PRESET_FIELDS)[number]
export type PresetKey = Field["key"]
export type Preset = { [F in Field as F["key"]]: F["values"][number] }

export const DEFAULT_PRESET: Preset = Object.fromEntries(PRESET_FIELDS.map((field) => [field.key, field.values[0]])) as Preset

const TOTAL_BITS = PRESET_FIELDS.reduce((sum, field) => sum + field.bits, 0)
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
/* Longest code: the version letter and enough base-62 digits for every bit in use. */
const MAX_LENGTH = 1 + Math.ceil(TOTAL_BITS / Math.log2(62))

export function toBase62(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`Not a non-negative safe integer: ${value}`)
  if (value === 0) return "0"
  let out = ""
  for (let rest = value; rest > 0; rest = Math.floor(rest / 62)) out = DIGITS[rest % 62] + out
  return out
}

export function fromBase62(text: string): number {
  let value = 0
  for (const char of text) {
    const digit = DIGITS.indexOf(char)
    if (digit < 0) return -1
    value = value * 62 + digit
  }
  return Number.isSafeInteger(value) ? value : -1
}

/** True when every field holds one of its listed values. */
export function isPreset(value: unknown): value is Preset {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return PRESET_FIELDS.every((field) => (field.values as readonly unknown[]).includes(record[field.key]))
}

/** A preset as its code. Missing fields take their defaults; an unknown value throws. */
export function encodePreset(preset: Partial<Preset> = {}): string {
  const full = { ...DEFAULT_PRESET, ...preset }
  let packed = 0
  let shift = 0
  for (const field of PRESET_FIELDS) {
    const index = (field.values as readonly string[]).indexOf(full[field.key])
    if (index < 0) throw new RangeError(`Unknown ${field.key}: ${String(full[field.key])}`)
    packed += index * 2 ** shift
    shift += field.bits
  }
  return PRESET_VERSION + toBase62(packed)
}

/** A code as its preset, or null when it isn't a valid code. Only the canonical spelling is accepted. */
export function decodePreset(code: unknown): Preset | null {
  if (typeof code !== "string" || code.length < 2 || code.length > MAX_LENGTH || code[0] !== PRESET_VERSION) return null
  const packed = fromBase62(code.slice(1))
  if (packed < 0 || packed >= 2 ** TOTAL_BITS) return null
  const preset: Record<string, string> = {}
  let rest = packed
  for (const field of PRESET_FIELDS) {
    const size = 2 ** field.bits
    const index = rest % size
    rest = Math.floor(rest / size)
    if (index >= field.values.length) return null
    preset[field.key] = field.values[index]
  }
  // "k00" and "k0" pack the same number; only the shortest spelling is a code.
  return encodePreset(preset as Preset) === code ? (preset as Preset) : null
}

export function isPresetCode(code: unknown): code is string {
  return decodePreset(code) !== null
}

export const DEFAULT_PRESET_CODE = encodePreset(DEFAULT_PRESET)

/* Randomize: every look field at random, the motion fields leaning towards the calmer settings that
   suit most products, so a random preset is something you'd ship. `random` returns [0, 1). */
export function randomPreset(random: () => number = Math.random): Preset {
  const pick = <T,>(values: readonly T[]) => values[Math.floor(random() * values.length)]
  return {
    base: pick(PRESET_FIELDS[0].values),
    theme: pick(PRESET_FIELDS[1].values),
    chart: pick(PRESET_FIELDS[2].values),
    radius: pick(PRESET_FIELDS[3].values),
    font: pick(PRESET_FIELDS[4].values),
    highlight: pick(PRESET_FIELDS[5].values),
    motion: pick(PRESET_FIELDS[6].values),
    speed: pick(["1", "1", "0.75", "1.25"] as const),
    bounce: pick(["style", "style", "none", "soft", "lively"] as const),
    reduced: pick(PRESET_FIELDS[9].values),
  }
}
