"use client"

import Link from "next/link"
import * as React from "react"

import { RoundLanding } from "@/templates/round/round"

const views: Record<string, React.ComponentType> = { round: RoundLanding }

/** A template on its own page. It has its own colours, so the site's dark mode is set aside while it is open. */
export function TemplateView({ slug, name }: { slug: string; name: string }) {
  const View = views[slug]
  const [framed, setFramed] = React.useState(true)
  const [away, setAway] = React.useState(false)

  React.useEffect(() => {
    const html = document.documentElement
    const wasDark = html.classList.contains("dark")
    const scheme = html.style.colorScheme
    html.classList.remove("dark")
    html.style.colorScheme = "light"
    setFramed(window.self !== window.top)
    // The way back steps aside while the page is being read, and returns on the way up.
    let last = window.scrollY
    const onScroll = () => {
      const now = window.scrollY
      if (Math.abs(now - last) < 12) return
      setAway(now > last && now > 120)
      last = now
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      html.classList.toggle("dark", wasDark)
      html.style.colorScheme = scheme
    }
  }, [])

  if (!View) return null
  return (
    <>
      <View />
      {/* Opened by itself (not inside the docs preview): a way back to the template's page. */}
      {!framed && (
        <Link
          href={`/docs/templates/${slug}`}
          data-away={away ? "" : undefined}
          className="fixed bottom-4 left-4 z-[70] inline-flex h-9 items-center gap-2 rounded-full bg-black/85 pr-3.5 pl-3 text-[12.5px] font-medium text-white shadow-lg ring-1 ring-white/15 backdrop-blur transition-[translate,opacity] duration-300 outline-none hover:bg-black focus-visible:ring-2 focus-visible:ring-white data-away:pointer-events-none data-away:translate-y-3 data-away:opacity-0 md:bottom-[68px]"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M13 8H3M7 4 3 8l4 4" />
          </svg>
          {name} template · Get the code
        </Link>
      )}
    </>
  )
}
