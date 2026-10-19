import { after } from "next/server"

import { readCopyEvent } from "@/lib/copy-events"
import { recordUsage } from "@/lib/usage"

export async function POST(request: Request) {
  const result = await readCopyEvent(request)
  if (!result.ok) return new Response(null, { status: result.status, headers: { "Cache-Control": "no-store" } })
  const { event, page, component } = result.event
  after(() => recordUsage({ kind: event, item: page, client: component }))
  // Accepted for best-effort aggregation; this is not a receipt for a persisted database write.
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } })
}
