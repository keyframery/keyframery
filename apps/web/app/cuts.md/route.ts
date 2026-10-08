import { cutsMarkdown, MARKDOWN_HEADERS } from "@/lib/page-markdown"

export const dynamic = "force-static"

export function GET() {
  return new Response(cutsMarkdown(), { headers: MARKDOWN_HEADERS })
}
