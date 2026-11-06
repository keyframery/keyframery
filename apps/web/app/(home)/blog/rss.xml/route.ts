import { allPosts } from "@/lib/blog"
import { SITE } from "@/lib/seo"

export const revalidate = false

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const rfc822 = (day: string) => new Date(`${day}T12:00:00Z`).toUTCString()

export function GET() {
  const posts = allPosts()
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${SITE}${p.url}</link>
      <guid isPermaLink="true">${SITE}${p.url}</guid>
      <pubDate>${rfc822(p.data.published)}</pubDate>
      <dc:creator>${esc(p.data.author)}</dc:creator>
      <description>${esc(p.data.description)}</description>
${p.data.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Keyframery blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Notes on UI motion, shadcn/ui and building with coding agents, from the makers of Keyframery.</description>
    <language>en</language>
${posts[0] ? `    <lastBuildDate>${rfc822(posts[0].data.updated ?? posts[0].data.published)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
