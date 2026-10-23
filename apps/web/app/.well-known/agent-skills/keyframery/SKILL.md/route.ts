import { skillFile, SKILL_MEDIA_TYPE } from "@/lib/agent-discovery"

export const dynamic = "force-static"

export function GET() {
  return new Response(new Uint8Array(skillFile()), { headers: { "Content-Type": `${SKILL_MEDIA_TYPE}; charset=utf-8`, "Access-Control-Allow-Origin": "*" } })
}
