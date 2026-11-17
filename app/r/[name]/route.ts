import { decodePreset } from "@site/lib/preset"
import { fontItem, presetRegistryItem } from "@site/lib/preset-tokens"
import { SITE } from "@site/lib/shared"

/* Registry items that are made, not built: /r/preset-<code>.json for any preset code from /create,
   and /r/font-<name>.json for the fonts a preset can bring. Every other /r/*.json is a static file
   in public/r (scripts/build-registry.mjs), and Next serves public files before dynamic routes, so
   this handler only ever sees names that have no file. With shadcn's directory entry
   (https://keyframery.com/r/{name}.json) that makes `npx shadcn add @keyframery/preset-<code>` work. */

const json = (body: unknown, status = 200, cache = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800") =>
  Response.json(body, { status, headers: { "Cache-Control": cache, "Access-Control-Allow-Origin": "*" } })

/* A preset's dependencies come from the server that made it, so a local site installs local items.
   Anywhere else (a preview deployment, a proxy) they point at keyframery.com. */
function origin(request: Request) {
  const url = new URL(request.url)
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname) ? url.origin : SITE
}

export async function GET(request: Request, context: RouteContext<"/r/[name]">) {
  const { name } = await context.params
  const preset = name.match(/^preset-([0-9A-Za-z]+)\.json$/)
  if (preset) {
    const decoded = decodePreset(preset[1])
    if (decoded) return json(presetRegistryItem(decoded, origin(request)))
    return json({ error: `"${preset[1]}" is not a Keyframery preset code. Make one at ${SITE}/create.` }, 404, "no-store")
  }
  const font = name.match(/^font-([a-z-]+)\.json$/)
  const item = font ? fontItem(font[1]) : null
  if (item) return json(item)
  return json({ error: "Not found" }, 404, "no-store")
}
