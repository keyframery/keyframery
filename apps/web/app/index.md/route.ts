import { homeMarkdown, MARKDOWN_HEADERS } from "@/lib/page-markdown"

export const dynamic = "force-static"

export function GET() {
  return new Response(homeMarkdown(), { headers: MARKDOWN_HEADERS })
}
