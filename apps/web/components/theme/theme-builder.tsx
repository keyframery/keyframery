"use client"

import { track } from "@vercel/analytics"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { useCutsControl } from "@/app/cuts-control"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Menus } from "@/lib/keyframery/engine"
import { cssValue, decode, encode, GROUPS, toCode, VARS, type Group, type ThemeSettings, type Var } from "@/lib/theme-url"

import { ThemePreview } from "./theme-preview"

const GROUP_LABELS: Record<Group, string> = { dialog: "Dialog, alert dialog, command", sheet: "Sheet", drawer: "Drawer", tabs: "Tabs", toast: "Toast" }

export function ThemeBuilder() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { setMenus, setPace, reset } = useCutsControl()
  const [s, setS] = React.useState<ThemeSettings>(() => decode(params.toString()))
  const [copied, setCopied] = React.useState<"" | "code" | "link">("")
  const code = toCode(s)

  // Drive the site's <Cuts /> while this page is open, and give the site its own cuts back on the way out.
  React.useEffect(() => {
    setMenus(s.menus as Menus)
    setPace(s.vars.pace === 1 ? undefined : Number(s.vars.pace))
  }, [s, setMenus, setPace])
  React.useEffect(() => () => reset(), [reset])

  // The other variables live on <html>, so portaled parts pick them up as well.
  React.useEffect(() => {
    const root = document.documentElement
    const names = (Object.keys(VARS) as Var[]).filter((v) => v !== "pace")
    for (const v of names) root.style.setProperty(VARS[v].css, cssValue(v, s.vars[v]))
    return () => names.forEach((v) => root.style.removeProperty(VARS[v].css))
  }, [s])

  // Keep the URL in step, without adding history entries.
  React.useEffect(() => {
    const q = encode(s)
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false })
  }, [s, router, pathname])

  const copy = async (what: "code" | "link") => {
    const text = what === "code" ? [code.jsx, code.css].filter(Boolean).join("\n\n") : `${location.origin}${pathname}${encode(s) ? `?${encode(s)}` : ""}`
    await navigator.clipboard?.writeText(text).catch(() => {})
    track(what === "code" ? "theme_copy" : "theme_share")
    setCopied(what)
    setTimeout(() => setCopied(""), 1600)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="grid content-start gap-6">
        {(Object.keys(GROUPS) as Group[]).map((g) => (
          <fieldset key={g}>
            <legend className="text-sm font-medium">{GROUP_LABELS[g]}</legend>
            <div role="radiogroup" aria-label={GROUP_LABELS[g]} className="mt-2 flex flex-wrap gap-1.5">
              {GROUPS[g].map((cut) => (
                <button
                  key={cut}
                  type="button"
                  role="radio"
                  aria-checked={s.menus[g] === cut}
                  onClick={() => setS((p) => ({ ...p, menus: { ...p.menus, [g]: cut } }))}
                  className="rounded-md border px-2.5 py-1 font-mono text-[13px] text-muted-foreground hover:bg-muted aria-checked:border-foreground aria-checked:text-foreground"
                >
                  {cut}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        {(Object.keys(VARS) as Var[]).map((v) => {
          const def = VARS[v]
          if ("presets" in def)
            return (
              <fieldset key={v}>
                <legend className="text-sm font-medium">{def.label}</legend>
                <div role="radiogroup" aria-label={def.label} className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(def.presets).map(([key, p]) => (
                    <button key={key} type="button" role="radio" aria-checked={s.vars[v] === key} onClick={() => setS((prev) => ({ ...prev, vars: { ...prev.vars, [v]: key } }))} className="rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted aria-checked:border-foreground aria-checked:text-foreground">
                      {p.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )
          return (
            <div key={v} className="grid gap-2">
              <div className="flex justify-between text-sm">
                <label htmlFor={`var-${v}`} className="font-medium">{def.label}</label>
                <span className="font-mono text-[13px] text-muted-foreground">{v === "pace" ? `${s.vars[v]}×` : cssValue(v, s.vars[v])}</span>
              </div>
              <Slider id={`var-${v}`} aria-label={def.label} min={def.min} max={def.max} step={def.step} value={[Number(s.vars[v])]} onValueChange={(x) => setS((p) => ({ ...p, vars: { ...p.vars, [v]: Number((Array.isArray(x) ? x[0] : x).toFixed(2)) } }))} />
            </div>
          )
        })}
      </div>
      <div className="grid content-start gap-4 max-lg:order-first lg:sticky lg:top-20">
        <ThemePreview />
        <div className="rounded-xl border bg-card">
          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
            <code data-testid="theme-jsx">{code.jsx}</code>
            {code.css && (
              <>
                {"\n\n"}
                <code data-testid="theme-css">{code.css}</code>
              </>
            )}
          </pre>
          <div className="flex gap-2 border-t p-2">
            <Button size="sm" aria-label="Copy the code" onClick={() => copy("code")}>{copied === "code" ? "Copied" : "Copy the code"}</Button>
            <Button size="sm" variant="outline" aria-label="Share" onClick={() => copy("link")}>{copied === "link" ? "Link copied" : "Share"}</Button>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setS(decode(""))}>Reset</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
