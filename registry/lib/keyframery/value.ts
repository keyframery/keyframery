/** ValueCut's pure parts: how a value splits into cells and which cells changed. */

/** Numbers split into one cell per character (digits roll); text is a single cell (it crossfades). */
export function unitsOf(value: number | string, text: string): string[] {
  return typeof value === "number" ? [...text] : [text]
}

/** Which of `next`'s cells differ from `prev`, aligned from the right so ones line up with ones. */
export function changedUnits(prev: string[], next: string[]): boolean[] {
  const offset = next.length - prev.length
  return next.map((unit, i) => i - offset < 0 || prev[i - offset] !== unit)
}

/** The unit that sat in the same place-value before, if there was one. */
export function previousUnit(prev: string[], next: string[], i: number): string | undefined {
  const j = i - (next.length - prev.length)
  return j < 0 ? undefined : prev[j]
}

export function formatValue(value: number | string, locale?: string, format?: Intl.NumberFormatOptions): string {
  return typeof value === "number" ? new Intl.NumberFormat(locale, format).format(value) : value
}
