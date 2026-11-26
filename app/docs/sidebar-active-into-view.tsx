"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/** With ~120 pages, a visitor who lands deep in the docs should see where they are: bring the active
 *  sidebar link into view when it is outside the sidebar's scroll area. Never moves it otherwise. */
export function SidebarActiveIntoView() {
  const pathname = usePathname()
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const link = document.querySelector<HTMLElement>('#nd-sidebar a[data-active="true"]')
      const viewport = link?.closest<HTMLElement>('[data-id$="-viewport"]')
      if (!link || !viewport) return
      const box = viewport.getBoundingClientRect()
      const item = link.getBoundingClientRect()
      if (item.top >= box.top + 24 && item.bottom <= box.bottom - 24) return
      viewport.scrollTop += item.top - box.top - box.height / 3
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])
  return null
}
