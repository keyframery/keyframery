/* The Cut key: a keyframe diamond cut in two, the cobalt half already moving off the cut. One source for the
   header, the OG image and every icon file. No imports, so Node scripts load it directly. */

export const MARK = {
  /** Lower-left half, ink. */
  ink: "9.3,11.7 20.3,22.7 14.8,28.2 3.8,17.2",
  /** Upper-right half, cobalt. */
  cut: "17.2,3.8 28.2,14.8 22.7,20.3 11.7,9.3",
}

export const COLORS = { ink: "#16181d", cut: "#2447f5", tile: "#16181d", onTile: "#ffffff", cutOnTile: "#7c93ff" }

const half = (points: string, color: string) =>
  `<polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/>`

/** The mark alone, for light backgrounds. */
export function markSvg(ink: string = COLORS.ink, cut: string = COLORS.cut): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${half(MARK.ink, ink)}${half(MARK.cut, cut)}</svg>`
}

/** The app icon: the mark on the dark tile. Favicon, apple icon and plugin logo. */
export function tileSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${COLORS.tile}"/><g transform="translate(4 4) scale(0.75)">${half(MARK.ink, COLORS.onTile)}${half(MARK.cut, COLORS.cutOnTile)}</g></svg>`
}
