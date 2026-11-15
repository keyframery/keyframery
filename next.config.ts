import fs from "node:fs"
import path from "node:path"
import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

/* Old keyframery.com URLs (the discontinued <Cuts /> product) go to the closest new page, so
   links and search results keep working. /docs/components/<name> pages that exist in Keyframery UI
   keep their URL and need no redirect. The full old list is content/old-urls.txt. */
const slugs = new Set(fs.readdirSync(path.join(process.cwd(), "src/components/ui")).map((f) => f.replace(/\.tsx$/, "")))
const renamed: Record<string, string> = {
  "dropdown-menu": "menu",
  "input-otp": "otp-input",
  "radio-group": "radio",
  "native-select": "select",
  sheet: "drawer",
  sonner: "toast",
  "toggle-group": "toggle",
  "input-group": "input",
  "button-group": "button",
}
const oldUrls = fs
  .readFileSync(path.join(process.cwd(), "content/old-urls.txt"), "utf8")
  .split("\n")
  .map((u) => u.trim())
  .filter(Boolean)

const kept = new Set(["", "/blog", "/blog/shadcn-skill-vs-mcp", "/blog/best-claude-code-skills-ui-animation", "/authors/briyan-hingrajiya", "/docs", "/docs/installation", "/docs/accessibility", "/docs/components", "/docs/ai-tools", "/docs/changelog", "/privacy", "/terms"])

function target(url: string): string | null {
  if (kept.has(url)) return null
  const component = url.match(/^\/docs\/components\/([a-z-]+)$/)
  if (component) {
    const name = component[1]
    if (slugs.has(name)) return null
    return renamed[name] ? `/docs/components/${renamed[name]}` : "/docs/components"
  }
  if (url === "/theme" || url === "/docs/motion-themes" || url === "/docs/customize") return "/docs/motion-styles"
  if (url === "/ui" || url.startsWith("/ui/")) return "/docs/components"
  if (url === "/docs/guides/animations-not-working") return "/docs/troubleshooting"
  if (url.startsWith("/docs/")) return "/docs"
  return "/"
}

const redirects = oldUrls.flatMap((source) => {
  const destination = target(source)
  return destination === null ? [] : [{ source, destination, permanent: true }]
})

const config: NextConfig = {
  reactStrictMode: true,
  typescript: { tsconfigPath: "tsconfig.next.json" },
  turbopack: { root: path.resolve(process.cwd()) },
  async redirects() {
    return [
      // Vercel's own addresses serve the same site; send them to the one address search engines should index.
      // Production only, so preview deployments stay reachable.
      ...(process.env.VERCEL_ENV === "production"
        ? [{ source: "/:path*", has: [{ type: "host" as const, value: "(?<sub>.*)\\.vercel\\.app" }], destination: "https://keyframery.com/:path*", permanent: true }]
        : []),
      ...redirects,
    ]
  },
  async headers() {
    // The shadcn CLI fetches registry items from anywhere.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
    ]
    // The home page points agents at its machine-readable files (RFC 8288 Link headers, RFC 9727 api-catalog).
    const link = [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</docs>; rel="service-doc"',
      '</llms.txt>; rel="describedby"; type="text/plain"',
      '</index.md>; rel="alternate"; type="text/markdown"',
    ].join(", ")
    // Pages with a Markdown twin vary by Accept, so a cache never hands Markdown to a browser.
    const vary = [{ key: "Vary", value: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept" }]
    return [
      { source: "/:path*", headers: security },
      ...["/", "/docs", "/docs/:path*", "/blog/:slug"].map((source) => ({ source, headers: vary })),
      { source: "/", headers: [{ key: "Link", value: link }] },
      { source: "/r/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] },
    ]
  },
}

export default createMDX()(config)
