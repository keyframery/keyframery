// Tells IndexNow (Bing, Yandex, Naver, Seznam and the other engines that share it) which pages changed.
//
//   node scripts/indexnow.mjs                 every URL in the live sitemap
//   node scripts/indexnow.mjs /docs /blog/x   only these paths
//
// Run it after a production deploy. The key is public by design: IndexNow checks that
// https://keyframery.com/<key>.txt holds it, which proves the site asked.
const HOST = "keyframery.com"
const KEY = "a4360835771c22f5b5efe34385c216d6"

const paths = process.argv.slice(2)
let urls
if (paths.length) {
  urls = paths.map((p) => `https://${HOST}${p.startsWith("/") ? p : `/${p}`}`)
} else {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
})
// 200 and 202 both mean accepted; 422 means a URL isn't on this host or the key didn't match.
console.log(`indexnow: ${urls.length} URLs -> HTTP ${res.status} ${res.statusText}`)
if (!res.ok) process.exit(1)
