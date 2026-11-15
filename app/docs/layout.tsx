import { DocsLayout } from "fumadocs-ui/layouts/docs"

import { baseOptions } from "@site/lib/layout.shared"
import { source } from "@site/lib/source"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  )
}
