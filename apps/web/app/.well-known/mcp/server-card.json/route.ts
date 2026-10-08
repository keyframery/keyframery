import { serverCard } from "@/lib/agent-discovery"

export const dynamic = "force-static"

export function GET() {
  return Response.json(serverCard(), { headers: { "Access-Control-Allow-Origin": "*" } })
}
