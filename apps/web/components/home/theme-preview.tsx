import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { PROFILES } from "@/lib/theme-url"

// Static illustrations of each profile's entrance easing, not motion controls.
const PROFILE_PREVIEWS = [
  { key: "quiet", path: "M 12 82 C 42.4 82, 27.2 10, 88 10" },
  { key: "crisp", path: "M 12 82 C 27.2 17.2, 19.6 10, 88 10" },
  { key: "expressive", path: "M 12 82 C 28.72 10, 39.36 10, 88 10" },
] as const

export function ThemePreview() {
  return (
    <section id="themes" aria-labelledby="themes-title" className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-4 pt-20 md:pt-28">
      <div className="relative isolate overflow-hidden rounded-2xl border bg-card">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-muted/70 via-transparent to-muted/30" />
        <div className="grid gap-9 p-6 sm:p-9 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:p-10">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Set the feel</p>
            <h2 id="themes-title" className="mt-4 text-[32px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-[40px]">
              Your app. Your motion.
            </h2>
            <p className="mt-4 max-w-[39ch] text-[16px] leading-relaxed text-pretty text-muted-foreground">
              Start with a profile. Tune the pace, easing and cuts, then bring one consistent feel to your app.
            </p>
            <Link href="/theme" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background outline-none hover:bg-foreground/85 focus-visible:ring-3 focus-visible:ring-ring/50">
              Create a motion theme <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <p className="mt-4 max-w-[35ch] text-xs leading-relaxed text-muted-foreground">Save locally, share a link and keep the source. Free, with no account required.</p>
          </div>
          <div className="min-w-0">
            <p className="mb-3 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">Illustrative entrance easing</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PROFILE_PREVIEWS.map(({ key, path }) => {
                const profile = PROFILES[key]
                return (
                  <div key={key} className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-x-4 rounded-xl border bg-background/90 p-4 sm:grid-cols-1 sm:items-start sm:gap-0">
                    <svg aria-hidden="true" viewBox="0 0 100 96" fill="none" className="row-span-2 w-20 overflow-visible sm:row-auto sm:mb-4 sm:w-full">
                      <path d="M 12 10 V 82 H 88" className="stroke-border" strokeWidth="1" />
                      <path d="M 12 46 H 88 M 50 10 V 82" className="stroke-border" strokeWidth="0.7" strokeDasharray="2 3" />
                      <path d={path} className="stroke-cut" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="12" cy="82" r="3" className="fill-background stroke-cut" strokeWidth="1.5" />
                      <circle cx="88" cy="10" r="3" className="fill-cut" />
                    </svg>
                    <h3 className="self-end text-sm font-semibold tracking-tight sm:self-auto">{profile.label}</h3>
                    <p className="mt-1 self-start text-xs leading-relaxed text-muted-foreground sm:mt-2">{profile.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
