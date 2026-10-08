// Tells Bing and the other IndexNow engines about every page in the live sitemap. Run after each deploy: `pnpm indexnow`.
import fs from "node:fs"
import path from "node:path"

const SITE = "https://keyframery.com"
const publicDir = path.join(import.meta.dirname, "../apps/web/public")
const key = fs.readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace(".txt", "")
if (!key) throw new Error("No IndexNow key file (32 hex characters + .txt) in apps/web/public")

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList }),
})
// 200: accepted. 202: accepted, key check pending. Anything else is an error worth reading.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`)
if (res.status !== 200 && res.status !== 202) process.exit(1)
