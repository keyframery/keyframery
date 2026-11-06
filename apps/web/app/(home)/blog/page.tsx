import type { Metadata } from "next"
import Link from "next/link"

import { allPosts, longDate, readingTime } from "@/lib/blog"
import { blogIndexData, JsonLd, pageMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Blog: shadcn/ui motion and coding agent tests",
    description: "Notes on UI motion, shadcn/ui and building with coding agents: tests we ran, what we found, and how to apply it in your own app.",
    path: "/blog",
  }),
  alternates: { canonical: "https://keyframery.com/blog", types: { "application/rss+xml": "https://keyframery.com/blog/rss.xml" } },
}

export default async function Page() {
  const posts = await Promise.all(allPosts().map(async (post) => ({ post, ...(await readingTime(post)) })))

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pt-16 pb-24 md:pt-24">
      <JsonLd data={blogIndexData(posts.map(({ post }) => ({ path: post.url, headline: post.data.title, published: post.data.published, updated: post.data.updated })))} />
      <h1 className="text-[36px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[44px]">Blog</h1>
      <p className="mt-4 max-w-[60ch] text-[18px] leading-relaxed text-muted-foreground">
        Notes on UI motion, shadcn/ui and building with coding agents: tests we ran, what we found, and how to apply it in your own app.{" "}
        <a href="/blog/rss.xml" className="text-foreground underline underline-offset-4">
          RSS
        </a>
      </p>
      <ol className="mt-12 grid gap-4">
        {posts.map(({ post, minutes }) => (
          <li key={post.url}>
            <article className="relative rounded-xl border p-5 transition-colors hover:bg-muted/40 md:p-6">
              <p className="text-sm text-muted-foreground">
                <time dateTime={post.data.published}>{longDate(post.data.published)}</time> · {minutes} min read
              </p>
              <h2 className="mt-2 text-[21px] leading-snug font-semibold tracking-tight text-balance">
                <Link href={post.url} className="after:absolute after:inset-0">
                  {post.data.title}
                </Link>
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{post.data.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
