import { skillFile } from "@/lib/agent-discovery"

export const dynamic = "force-static"

export function GET() {
  return new Response(new Uint8Array(skillFile()), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Access-Control-Allow-Origin": "*" } })
}
