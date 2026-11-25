import { GitHubIcon } from "@site/components/github-icon"
import stars from "@site/lib/github-stars.generated.json"
import { REPO } from "@site/lib/shared"

/* GitHub with the repo's star count beside the mark. The count is written at build time (scripts/stamp-stars.mjs),
   so it costs no request and never shifts the layout; it refreshes with each deploy. */
const format = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n))

const count = typeof stars.stars === "number" ? stars.stars : null

export const githubLabel = count === null ? "Keyframery on GitHub" : `Keyframery on GitHub, ${count} stars`

/* The mark and the count without a link around them: the docs sidebar wraps it in its own icon button. */
export function GitHubStarsMark() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
      <GitHubIcon className="size-4" />
      {count !== null && <span className="tabular-nums">{format(count)}</span>}
    </span>
  )
}

/* The header's GitHub link. */
export function GitHubStars({ className = "" }: { className?: string }) {
  return (
    <a
      href={REPO}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={githubLabel}
      className={`inline-flex h-8 items-center rounded-md px-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground ${className}`}
    >
      <GitHubStarsMark />
    </a>
  )
}
