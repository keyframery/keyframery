/*
 * The closing panel's backdrop: a dim horizon drawn as a timeline, with keyframe diamonds resting along the
 * arc. It is still on purpose, with no moving light, so it renders on the server and ships no JavaScript.
 */

const W = 1400
const H = 640
// Quadratic arc: from (x0, y0) through control (W/2, cy) to (x1, y0).
const A = { x0: -80, y0: 600, cx: W / 2, cy: 250, x1: W + 80 }
const at = (t: number) => {
  const u = 1 - t
  return { x: u * u * A.x0 + 2 * u * t * A.cx + t * t * A.x1, y: u * u * A.y0 + 2 * u * t * A.cy + t * t * A.y0 }
}
const KEYS = Array.from({ length: 11 }, (_, i) => 0.12 + (i * 0.76) / 10)
const PATH = `M ${A.x0} ${A.y0} Q ${A.cx} ${A.cy} ${A.x1} ${A.y0}`

export function KeyframeArc() {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 -z-10 h-full w-full">
      <defs>
        <linearGradient id="kf-arc" x1="0" x2="1">
          <stop offset="0" stopColor="#8098ff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#a9b8ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8098ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="kf-sky" cx="0.5" cy="1" r="0.75">
          <stop offset="0" stopColor="#2f4fd8" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#6d5cf6" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="kf-blur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#kf-sky)" />
      {/* Below the arc stays dark: the planet. */}
      <path d={`${PATH} L ${A.x1} ${H} L ${A.x0} ${H} Z`} fill="#050608" />
      <path d={PATH} fill="none" stroke="#8098ff" strokeOpacity="0.35" strokeWidth="14" filter="url(#kf-blur)" />
      <path d={PATH} fill="none" stroke="url(#kf-arc)" strokeWidth="1.5" />
      {KEYS.map((t) => {
        const p = at(t)
        return (
          <path
            key={t}
            d={`M ${p.x} ${p.y - 7} L ${p.x + 7} ${p.y} L ${p.x} ${p.y + 7} L ${p.x - 7} ${p.y} Z`}
            fill="transparent"
            stroke="#a9b8ff"
            strokeWidth="1.25"
            opacity="0.35"
          />
        )
      })}
    </svg>
  )
}
