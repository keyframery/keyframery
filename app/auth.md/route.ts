import { authMd } from "@site/lib/agent-discovery"

export const dynamic = "force-static"

export function GET() {
  return new Response(authMd(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
