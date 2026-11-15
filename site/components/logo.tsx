import { MARK } from "@site/lib/logo"

/** The Cut key: a keyframe diamond cut in two. Ink follows the text colour; the cobalt half follows --cut. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg data-logo="" viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <polygon points={MARK.ink} className="fill-foreground stroke-foreground" strokeWidth={1.3} strokeLinejoin="round" />
      <polygon points={MARK.cut} className="fill-cut stroke-cut" strokeWidth={1.3} strokeLinejoin="round" />
    </svg>
  )
}
