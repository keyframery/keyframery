import { GitHubIcon } from "@site/components/github-icon"
import stars from "@site/lib/github-stars.generated.json"
import { REPO } from "@site/lib/shared"

/* The header's GitHub link with the repo's star count beside the mark. The count is written at build time
   (scripts/stamp-stars.mjs), so it costs no request and never shifts the header; it refreshes with each deploy. */
const format = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n))

export function GitHubStars({ className = "" }: { className?: string }) {
  const count = typeof stars.stars === "number" ? stars.stars : null
  return (
    <a
      href={REPO}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={count === null ? "Keyframery on GitHub" : `Keyframery on GitHub, ${count} stars`}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground ${className}`}
    >
      <GitHubIcon className="size-4" />
      {count !== null && <span className="tabular-nums">{format(count)}</span>}
    </a>
  )
}
