import { skillsIndex } from "@/lib/agent-discovery"

export const dynamic = "force-static"

export function GET() {
  return Response.json(skillsIndex(), { headers: { "Access-Control-Allow-Origin": "*" } })
}
