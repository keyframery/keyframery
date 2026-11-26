import { DocsLayout } from "fumadocs-ui/layouts/docs"

import { GitHubStarsMark, githubLabel } from "@site/components/github-stars"
import { baseOptions } from "@site/lib/layout.shared"
import { getDocsNavigation } from "@site/lib/docs-navigation"
import { REPO } from "@site/lib/shared"

import { SidebarActiveIntoView } from "./sidebar-active-into-view"
import { StarPrompt } from "./star-prompt"

export default function Layout({ children }: { children: React.ReactNode }) {
  const options = baseOptions()
  // The page tree already contains the docs destinations; keep only site-level exits here.
  const links = options.links?.filter((item) => item.type !== "custom" && (!("url" in item) || !item.url?.startsWith("/docs")))
  // The sidebar footer shows only icon links, so GitHub (with its star count) goes in as one, beside the theme toggle.
  links?.push({ type: "icon", url: REPO, text: "GitHub", label: githubLabel, external: true, icon: <GitHubStarsMark /> })
  return (
    <DocsLayout tree={getDocsNavigation()} {...options} nav={{ ...options.nav, children: undefined }} links={links} sidebar={{ defaultOpenLevel: 0 }}>
      <SidebarActiveIntoView />
      <StarPrompt />
      {children}
    </DocsLayout>
  )
}
