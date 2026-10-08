import { authMd } from "@/lib/agent-discovery"
import { MARKDOWN_HEADERS } from "@/lib/page-markdown"

export const dynamic = "force-static"

export function GET() {
  return new Response(authMd(), { headers: MARKDOWN_HEADERS })
}
