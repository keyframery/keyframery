"use client"

import Link from "next/link"
import * as React from "react"

import { useCutsControl } from "@/app/cuts-control"
import { ThemePreview } from "@/components/theme/theme-preview"
import type { Menus } from "@/lib/keyframery/engine"
import { cssValue, encode, PROFILES, VARS, type Var } from "@/lib/theme-url"

const profiles = Object.keys(PROFILES) as (keyof typeof PROFILES)[]
const vars = Object.keys(VARS) as Var[]

export function MotionProfiles() {
  const [profile, setProfile] = React.useState<keyof typeof PROFILES>("expressive")
  const { setMenus, setPace, reset } = useCutsControl()
  const selected = PROFILES[profile]

  React.useEffect(() => {
    const root = document.documentElement
    const previous = vars.filter((v) => v !== "pace").map((v) => ({
      css: VARS[v].css,
      value: root.style.getPropertyValue(VARS[v].css),
      priority: root.style.getPropertyPriority(VARS[v].css),
    }))
    return () => {
      for (const { css, value, priority } of previous) {
        if (value) root.style.setProperty(css, value, priority)
        else root.style.removeProperty(css)
      }
      reset()
    }
  }, [reset])

  React.useEffect(() => {
    const settings = selected.settings
    setMenus(settings.menus as Menus)
    setPace(settings.vars.pace === 1 ? undefined : Number(settings.vars.pace))
    for (const v of vars) {
      if (v !== "pace") document.documentElement.style.setProperty(VARS[v].css, cssValue(v, settings.vars[v]))
    }
  }, [selected, setMenus, setPace])

  const query = encode(selected.settings)

  return (
    <section aria-labelledby="profiles-title" className="mx-auto w-full max-w-[1200px] px-4 pt-24 md:pt-36" data-testid="home-motion-profiles">
      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end md:gap-16">
        <div>
          <h2 id="profiles-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance md:text-[38px]">
            One app. Three motion feels.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground">
            A motion theme is a few props on <code className="font-mono text-[15px] text-foreground">{"<Cuts />"}</code> and CSS variables in your
            globals.css, next to your colours. Pick a profile, then create a record and open its details below.
          </p>
        </div>
        <div>
          <div role="group" aria-label="Motion profile" className="grid grid-cols-3 gap-2">
            {profiles.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={profile === key}
                onClick={() => setProfile(key)}
                className="rounded-lg border bg-card px-3 py-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
              >
                {PROFILES[key].label}
              </button>
            ))}
          </div>
          <p className="mt-3 min-h-10 text-sm leading-relaxed text-muted-foreground" role="status">{selected.description}</p>
        </div>
      </div>
      <div className="stage-grid mt-8 rounded-2xl border p-4 sm:p-6 md:p-8">
        <ThemePreview compact />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">Your system&apos;s reduced-motion preference is respected.</p>
        <Link href={`/theme${query ? `?${query}` : ""}`} className="font-medium text-foreground underline underline-offset-4">
          Customize {selected.label}
        </Link>
      </div>
    </section>
  )
}
