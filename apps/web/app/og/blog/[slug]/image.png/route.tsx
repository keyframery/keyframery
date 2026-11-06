import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"

import { blog, longDate, readingTime } from "@/lib/blog"

export const revalidate = false

/** The post's social card: Fumadocs' card is made for short docs titles, and a long post title runs into its description. */
export async function GET(_req: Request, { params }: RouteContext<"/og/blog/[slug]/image.png">) {
  const { slug } = await params
  const post = blog.getPage([slug])
  if (!post) notFound()
  const { minutes } = await readingTime(post)
  const title = post.data.title
  const size = title.length > 70 ? 60 : 68

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "#0b0b0c", color: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#a1a1aa" }}>
          <div style={{ width: 22, height: 22, background: "#2447f5", transform: "rotate(45deg)", borderRadius: 3 }} />
          <span style={{ color: "#fafafa", fontWeight: 600 }}>Keyframery</span>
          <span>/ blog</span>
        </div>
        <div style={{ display: "flex", fontSize: size, lineHeight: 1.12, fontWeight: 600, letterSpacing: "-0.025em", maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa" }}>
          {`${post.data.author} · ${longDate(post.data.published)} · ${minutes} min read`}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

export function generateStaticParams() {
  return blog.getPages().map((post) => ({ slug: post.slugs[0] }))
}
