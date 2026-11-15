import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation"
import { type NextRequest, NextResponse } from "next/server"

import { docsContentRoute, docsRoute } from "@site/lib/shared"

/* Every docs page is also Markdown, for AI tools and the Keyframery skill: add .mdx (or .md) to its
   URL, or ask for it with `Accept: text/markdown`. */
const { rewrite: rewriteDocs } = rewritePath(`${docsRoute}{/*path}`, `${docsContentRoute}{/*path}/content.md`)
const { rewrite: rewriteMd } = rewritePath(`${docsRoute}{/*path}.md`, `${docsContentRoute}{/*path}/content.md`)
const { rewrite: rewriteMdx } = rewritePath(`${docsRoute}{/*path}.mdx`, `${docsContentRoute}{/*path}/content.md`)

// A blog post as Markdown: /blog/<slug>.md, or the post's URL with `Accept: text/markdown`.
const { rewrite: rewriteBlogMd } = rewritePath("/blog/:slug.md", "/llms.mdx/blog/:slug")
const { rewrite: rewriteBlog } = rewritePath("/blog/:slug", "/llms.mdx/blog/:slug")

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path.startsWith("/blog/")) {
    const md = rewriteBlogMd(path) || (path !== "/blog/rss.xml" && isMarkdownPreferred(request) && rewriteBlog(path))
    return md ? NextResponse.rewrite(new URL(md, request.nextUrl)) : NextResponse.next()
  }
  const suffix = rewriteMdx(path) || rewriteMd(path)
  if (suffix) return NextResponse.rewrite(new URL(suffix, request.nextUrl))
  if (isMarkdownPreferred(request)) {
    const docs = rewriteDocs(path)
    if (docs) return NextResponse.rewrite(new URL(docs, request.nextUrl))
  }
  return NextResponse.next()
}

export const config = { matcher: ["/docs", "/docs/:path*", "/blog/:path*"] }
