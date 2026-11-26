"use client"

import { GitHubIcon } from "@site/components/github-icon"
import { formatStars, useGitHubStars } from "@site/lib/github-stars"
import { REPO } from "@site/lib/shared"

/* GitHub with the repo's live star count beside the mark (site/lib/github-stars.ts). */
export const githubLabel = "Star Keyframery on GitHub"

/* The mark and the count without a link around them: the docs sidebar wraps it in its own icon button. */
export function GitHubStarsMark() {
  const stars = useGitHubStars()
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
      <GitHubIcon className="size-4" />
      {stars !== null && (
        <span className="tabular-nums">
          {formatStars(stars)}
          <span className="sr-only"> stars</span>
        </span>
      )}
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
