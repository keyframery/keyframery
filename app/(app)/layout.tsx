import { HomeLayout } from "fumadocs-ui/layouts/home"

import { baseOptions } from "@site/lib/layout.shared"

/* Pages that work like an app (/create): the site header, no footer. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>
}
