import { themeMarkdown, MARKDOWN_HEADERS } from "@/lib/page-markdown"

export const dynamic = "force-static"

export function GET() {
  return new Response(themeMarkdown(), { headers: MARKDOWN_HEADERS })
}
