import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation"
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server"

import { docsContentRoute, docsRoute } from "@site/lib/shared"
import { classifyRequest, recordHit, requestFacts } from "@site/lib/usage"

/* Every docs page is also Markdown, for AI tools and the Keyframery skill: add .mdx (or .md) to its
   URL, or ask for it with `Accept: text/markdown`. */
const { rewrite: rewriteDocs } = rewritePath(`${docsRoute}{/*path}`, `${docsContentRoute}{/*path}/content.md`)
const { rewrite: rewriteMd } = rewritePath(`${docsRoute}{/*path}.md`, `${docsContentRoute}{/*path}/content.md`)
const { rewrite: rewriteMdx } = rewritePath(`${docsRoute}{/*path}.mdx`, `${docsContentRoute}{/*path}/content.md`)

// A blog post as Markdown: /blog/<slug>.md, or the post's URL with `Accept: text/markdown`.
const { rewrite: rewriteBlogMd } = rewritePath("/blog/:slug.md", "/llms.mdx/blog/:slug")
const { rewrite: rewriteBlog } = rewritePath("/blog/:slug", "/llms.mdx/blog/:slug")

/** The response for a request, and whether it is Markdown chosen by the `Accept` header (not by the URL). */
function route(request: NextRequest): { response: NextResponse; negotiated: boolean } {
  const path = request.nextUrl.pathname
  if (path === "/") {
    return isMarkdownPreferred(request)
      ? { response: NextResponse.rewrite(new URL("/index.md", request.nextUrl), { headers: { Vary: "Accept" } }), negotiated: true }
      : { response: NextResponse.next(), negotiated: false }
  }
  if (path.startsWith("/blog/")) {
    const suffix = rewriteBlogMd(path)
    if (suffix) return { response: NextResponse.rewrite(new URL(suffix, request.nextUrl)), negotiated: false }
    const md = path !== "/blog/rss.xml" && isMarkdownPreferred(request) && rewriteBlog(path)
    return md ? { response: NextResponse.rewrite(new URL(md, request.nextUrl)), negotiated: true } : { response: NextResponse.next(), negotiated: false }
  }
  const suffix = rewriteMdx(path) || rewriteMd(path)
  if (suffix) return { response: NextResponse.rewrite(new URL(suffix, request.nextUrl)), negotiated: false }
  if (isMarkdownPreferred(request)) {
    const docs = rewriteDocs(path)
    if (docs) return { response: NextResponse.rewrite(new URL(docs, request.nextUrl)), negotiated: true }
  }
  return { response: NextResponse.next(), negotiated: false }
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { response, negotiated } = route(request)
  /* Registry downloads and agent reads load no analytics script, so they are counted here (site/lib/usage.ts).
     Proxy runs before public/ files, so the static /r/*.json files and the ones app/r/[name] makes are counted
     in this one place. Each hit adds to the daily counter and appends one event (with the day's visitor code);
     waitUntil runs the writes after the response, and recordHit never throws. */
  const hit = classifyRequest(request.method, request.nextUrl.pathname, negotiated)
  if (hit) {
    const facts = requestFacts(request.headers)
    event.waitUntil(recordHit({ ...hit, client: facts.client }, { kind: hit.kind === "install" ? "install" : "agent", item: hit.item }, facts))
  }
  return response
}

export const config = {
  matcher: ["/", "/docs", "/docs/:path*", "/blog/:path*", "/r/:path*", "/llms.txt", "/llms-full.txt", "/index.md", "/auth.md", "/.well-known/:path*"],
}
