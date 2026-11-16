import type { Metadata } from "next"
import { PostCard } from "@site/components/blog/post-card"
import { allPosts, readingTime } from "@site/lib/blog"
import { blogIndexData, JsonLd, pageMetadata } from "@site/lib/seo"

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Blog: UI motion and coding agent tests",
    description: "Notes on UI motion, UI SDK, shadcn/ui and building with coding agents: tests we ran, what we found, and how to apply it in your own app.",
    path: "/blog",
  }),
  alternates: { canonical: "https://keyframery.com/blog", types: { "application/rss+xml": "https://keyframery.com/blog/rss.xml" } },
}

export default async function Page() {
  const posts = await Promise.all(allPosts().map(async (post) => ({ post, ...(await readingTime(post)) })))

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pt-16 pb-24 md:pt-24">
      <JsonLd data={blogIndexData(posts.map(({ post }) => ({ path: post.url, headline: post.data.title, published: post.data.published, updated: post.data.updated })))} />
      <h1 className="text-[36px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[44px]">Blog</h1>
      <p className="mt-4 max-w-[60ch] text-[18px] leading-relaxed text-muted-foreground">
        Notes on UI motion, UI SDK, shadcn/ui and building with coding agents: tests we ran, what we found, and how to apply it in your own app.{" "}
        <a href="/blog/rss.xml" className="text-foreground underline underline-offset-4">
          RSS
        </a>
      </p>
      {/* The newest post leads at full width; the rest sit three to a row, each tile as wide as its illustration's phone design. */}
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map(({ post, minutes }, i) => (
          <li key={post.url} className={i === 0 ? "sm:col-span-2 lg:col-span-3" : undefined}>
            <PostCard post={post} minutes={minutes} featured={i === 0} />
          </li>
        ))}
      </ol>
    </div>
  )
}
