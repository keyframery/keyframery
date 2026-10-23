"use client"

import type { Framework } from "fumadocs-core/framework"
import { RootProvider } from "fumadocs-ui/provider/next"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SearchDialog } from "./deferred-search-dialog"

const SiteLink: NonNullable<Framework["Link"]> = ({ href = "#", prefetch, ...props }) => {
  const pathname = usePathname()
  // Docs include the full demo registry. Fetch those routes when a visitor navigates,
  // rather than competing with the landing page's fonts and interactive demo.
  return <Link {...props} href={href} prefetch={pathname === "/" ? false : prefetch} />
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider components={{ Link: SiteLink }} search={{ SearchDialog }}>
      {children}
    </RootProvider>
  )
}
