import { DocsLayout } from "fumadocs-ui/layouts/docs"

import { baseOptions } from "@site/lib/layout.shared"
import { getDocsNavigation } from "@site/lib/docs-navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  const options = baseOptions()
  // The page tree already contains the docs destinations; keep only site-level exits here.
  const links = options.links?.filter((item) => !("url" in item) || !item.url?.startsWith("/docs"))
  return (
    <DocsLayout tree={getDocsNavigation()} {...options} links={links} sidebar={{ defaultOpenLevel: 0 }}>
      {children}
    </DocsLayout>
  )
}
