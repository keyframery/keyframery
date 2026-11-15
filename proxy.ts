import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation"
import { type NextRequest, NextResponse } from "next/server"

import { docsContentRoute, docsRoute } from "@site/lib/shared"

/* Every docs page is also Markdown, for AI tools and the Keyframery skill: add .mdx (or .md) to its
   URL, or ask for it with `Accept: text/markdown`. */
const { rewrite: rewriteDocs } = rewritePath(`${docsRoute}{/*path}`, `${docsContentRoute}{/*path}/content.md`)
const { rewrite: rewriteMd } = rewritePath(`${docsRoute}{/*path}.md`, `${docsContentRoute}{/*path}/content.md`)
const { rewrite: rewriteMdx } = rewritePath(`${docsRoute}{/*path}.mdx`, `${docsContentRoute}{/*path}/content.md`)

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const suffix = rewriteMdx(path) || rewriteMd(path)
  if (suffix) return NextResponse.rewrite(new URL(suffix, request.nextUrl))
  if (isMarkdownPreferred(request)) {
    const docs = rewriteDocs(path)
    if (docs) return NextResponse.rewrite(new URL(docs, request.nextUrl))
  }
  return NextResponse.next()
}

export const config = { matcher: ["/docs", "/docs/:path*"] }
