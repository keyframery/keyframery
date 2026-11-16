import Link from "next/link"

import { Cover } from "@site/components/stageshow/cover"
import { hasCover } from "@site/components/stageshow/covers"
import { longDate, type Post } from "@site/lib/blog"

/**
 * A post on the blog index and the author page: its illustration, then the date, title and summary.
 * The title's link covers the whole card, so the illustration is clickable too.
 */
export function PostCard({
  post,
  minutes,
  featured = false,
  as: Heading = "h2",
}: {
  post: Post
  minutes?: number
  /** The newest post on the blog index: wider, with the illustration beside the text on large screens. */
  featured?: boolean
  as?: "h2" | "h3"
}) {
  const slug = post.slugs[0]
  const { title, description, published, archived } = post.data

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-200 hover:border-foreground/25 ${
        featured ? "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""
      }`}
    >
      {hasCover(slug) && (
        <div className={`border-b ${featured ? "lg:order-2 lg:border-b-0" : ""}`}>
          <Cover name={slug} />
        </div>
      )}
      <div className={`flex flex-1 flex-col p-5 md:p-6 ${featured ? "lg:justify-center lg:p-8" : ""}`}>
        <p className="text-sm text-muted-foreground">
          <time dateTime={published}>{longDate(published)}</time>
          {minutes ? ` · ${minutes} min read` : null}
        </p>
        <Heading
          className={`mt-2 leading-snug font-semibold tracking-tight text-balance ${featured ? "text-[24px] md:text-[28px] md:leading-[1.2]" : "text-[19px]"}`}
        >
          <Link href={post.url} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring">
            {title}
          </Link>
        </Heading>
        <p className={`mt-2 leading-relaxed text-pretty text-muted-foreground ${featured ? "text-[17px]" : "text-[15px]"}`}>{description}</p>
        {archived && <p className="mt-3 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">Tested the earlier shadcn/ui version</p>}
      </div>
    </article>
  )
}
