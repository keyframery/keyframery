"use client"

import type { Framework } from "fumadocs-core/framework"
import { RootProvider } from "fumadocs-ui/provider/next"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SiteLink: NonNullable<Framework["Link"]> = ({ href = "#", prefetch, ...props }) => {
  const pathname = usePathname()
  // Docs pages carry live demos. Fetch them when a visitor navigates, rather than competing
  // with the landing page's fonts and demos.
  return <Link {...props} href={href} prefetch={pathname === "/" ? false : prefetch} />
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  return <RootProvider components={{ Link: SiteLink }}>{children}</RootProvider>
}
