"use client"

import Link from "next/link"
import * as React from "react"

import { Backroom } from "@/templates/backroom/backroom"
import { RoundLanding } from "@/templates/round/round"

/* How each template is shown. A landing page has fixed colours, so the site's dark mode is set aside while it
   is open. An admin owns its addresses under /templates/<slug>/… and its own theme (it sets `dark` on <html>
   from its appearance settings and puts back what was there when it closes). */
type View = { render: (props: { slug: string; path: string }) => React.ReactNode; light?: boolean; back?: boolean }

const views: Record<string, View> = {
  round: { render: () => <RoundLanding />, light: true, back: true },
  backroom: { render: ({ slug, path }) => <Backroom basePath={`/templates/${slug}`} initialPath={path} /> },
}

/** A template on its own page. `path` is the address inside a template that has pages of its own. */
export function TemplateView({ slug, name, path = "/" }: { slug: string; name: string; path?: string }) {
  const view = views[slug]
  const light = view?.light ?? false
  const [framed, setFramed] = React.useState(true)
  const [away, setAway] = React.useState(false)

  React.useEffect(() => {
    setFramed(window.self !== window.top)
    if (!light) return
    const html = document.documentElement
    const wasDark = html.classList.contains("dark")
    const scheme = html.style.colorScheme
    html.classList.remove("dark")
    html.style.colorScheme = "light"
    return () => {
      html.classList.toggle("dark", wasDark)
      html.style.colorScheme = scheme
    }
  }, [light])

  React.useEffect(() => {
    // The way back steps aside while the page is being read, and returns on the way up.
    let last = window.scrollY
    const onScroll = () => {
      const now = window.scrollY
      if (Math.abs(now - last) < 12) return
      setAway(now > last && now > 120)
      last = now
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!view) return null
  return (
    <>
      {view.render({ slug, path })}
      {/* Opened by itself (not inside the docs preview): a way back to the template's page. */}
      {view.back && !framed && (
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
