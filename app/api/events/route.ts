import { after } from "next/server"

import { allowHit, externalReferrer, readBeacon } from "@site/lib/beacon"
import { isCrawlerClient, recordHit, requestFacts, utcDay, visitorCode } from "@site/lib/usage"

const done = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } })

/* Page views (site/components/page-views.tsx) and successful copies (site/lib/track-copy.ts) from the browser.
   The server adds the client class, country and daily visitor code; the IP address is used for the code and
   the rate limit, and is never stored or logged. */
export async function POST(request: Request) {
  const result = await readBeacon(request)
  if (!result.ok) return done(result.status)
  const facts = requestFacts(request.headers)
  if (isCrawlerClient(facts.client)) return done(204)
  const visitor = await visitorCode(facts.ip, utcDay(), process.env.DATABASE_URL ?? "rate-limit-only")
  if (!allowHit(visitor)) return done(429)

  const { beacon } = result
  if (beacon.type === "view") {
    const referrer = externalReferrer(beacon.referrer, request.url)
    after(() => recordHit(null, { kind: "view", item: beacon.path, referrer }, facts))
  } else {
    const { event, page, component } = beacon.copy
    after(() => recordHit({ kind: event, item: page, client: component }, { kind: "copy", item: event, detail: page }, facts))
  }
  // Accepted for best-effort counting; this is not a receipt for a database write.
  return done(204)
}
