import { themeMarkdown, markdownCopyHeaders } from "@/lib/page-markdown"

export const dynamic = "force-static"

export function GET() {
  return new Response(themeMarkdown(), { headers: markdownCopyHeaders("/theme") })
}
