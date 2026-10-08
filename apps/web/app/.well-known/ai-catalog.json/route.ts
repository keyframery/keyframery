import { aiCatalog } from "@/lib/agent-discovery"

export const dynamic = "force-static"

export function GET() {
  return Response.json(aiCatalog(), { headers: { "Access-Control-Allow-Origin": "*" } })
}
