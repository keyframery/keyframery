import { homeMarkdown } from "@site/lib/agent-discovery"

export const dynamic = "force-static"

/* The home page as Markdown. The HTML page is the one to index; this copy points search engines at it. */
export function GET() {
  return new Response(homeMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", Link: '<https://keyframery.com>; rel="canonical"' },
  })
}
