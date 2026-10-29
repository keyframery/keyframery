import { DocsLayout } from "fumadocs-ui/layouts/docs"

import { baseOptions } from "@/lib/layout.shared"
import { uiTree } from "@/lib/ui-tree"

// Keyframery UI reads like the docs: the same sidebar, search and contents rail, with its own tree. The site's
// links (Docs, Examples, Theme) belong to the motion layer, so the sidebar here starts at Get started.
export default function Layout({ children }: LayoutProps<"/ui">) {
  return (
    <DocsLayout tree={uiTree()} {...baseOptions()} links={[]}>
      {children}
    </DocsLayout>
  )
}
