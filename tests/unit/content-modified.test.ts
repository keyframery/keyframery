import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { CONTENT_MODIFIED } from "../../apps/web/lib/content-modified"

describe("maintained significant-content dates", () => {
  it("uses real calendar dates and existing public pages", () => {
    for (const [route, modified] of Object.entries(CONTENT_MODIFIED)) {
      expect(modified, route).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(modified).toISOString().slice(0, 10), route).toBe(modified)
      const file = route.startsWith("/docs")
        ? `content/docs/${route.slice("/docs/".length) || "index"}.mdx`
        : `app/(home)${route === "/" ? "" : route}/page.tsx`
      expect(fs.existsSync(path.resolve(process.cwd(), "../apps/web", file)), route).toBe(true)
    }
  })
})
