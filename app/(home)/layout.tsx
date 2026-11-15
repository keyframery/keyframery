import { HomeLayout } from "fumadocs-ui/layouts/home"

import { SiteFooter } from "@site/components/footer"
import { baseOptions } from "@site/lib/layout.shared"

// The footer sits beside HomeLayout, not inside it: HomeLayout renders <main>, and a <footer> inside
// <main> is no longer the page's contentinfo landmark.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeLayout {...baseOptions()}>{children}</HomeLayout>
      <SiteFooter />
    </>
  )
}
