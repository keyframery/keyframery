"use client"

import { usePathname, useSearchParams } from "next/navigation"
import * as React from "react"

import { useCutsControl } from "@/app/cuts-control"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { Menus } from "@/lib/keyframery/engine"
import {
  cssValue,
  decode,
  encode,
  GROUPS,
  parseTheme,
  profileOf,
  PROFILES,
  serializeTheme,
  themeAgentPrompt,
  toCode,
  toInstall,
  VARS,
  type Group,
  type ThemeSettings,
  type Var,
} from "@/lib/theme-url"

import { ThemePreview } from "./theme-preview"

const GROUP_LABELS: Record<Group, string> = { dialog: "Dialog, alert dialog, command", sheet: "Sheet", drawer: "Drawer", tabs: "Tabs", toast: "Toast" }
const STORAGE_KEY = "keyframery:themes:v1"
type SavedTheme = { name: string; json: string }
type CopyTarget = "code" | "link" | "install" | "agent"
const clone = (settings: ThemeSettings): ThemeSettings => ({ menus: { ...settings.menus }, vars: { ...settings.vars } })

function radioKey(event: React.KeyboardEvent<HTMLButtonElement>, choices: readonly string[], current: string, select: (choice: string) => void) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const index = choices.indexOf(current)
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? choices.length - 1
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % choices.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index + choices.length - 1) % choices.length
            : null
  if (next === null) return
  event.preventDefault()
  select(choices[next])
  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="radio"]')[next]?.focus()
}

export function ThemeBuilder() {
  const params = useSearchParams()
  const pathname = usePathname()
  const query = params.toString()
  const { setMenus, setPace, reset } = useCutsControl()
  const [s, setS] = React.useState<ThemeSettings>(() => decode(query))
  const [seenQuery, setSeenQuery] = React.useState(query)
  const [copied, setCopied] = React.useState<CopyTarget | "">("")
  const [saved, setSaved] = React.useState<SavedTheme[]>([])
  const [themeName, setThemeName] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const [error, setError] = React.useState("")
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const importRef = React.useRef<HTMLInputElement>(null)
  const code = toCode(s)
  const profile = profileOf(s)

  // Search params are the external source on back/forward navigation. Local changes update the URL
  // in their event handler, so a synchronization effect cannot overwrite a newly restored history entry.
  if (seenQuery !== query) {
    setSeenQuery(query)
    setS(decode(query))
  }
  const apply = (settings: ThemeSettings) => {
    setS(settings)
    const nextQuery = encode(settings)
    window.history.replaceState(null, "", nextQuery ? `${pathname}?${nextQuery}` : pathname)
  }

  React.useEffect(() => {
    setMenus(s.menus as Menus)
    setPace(s.vars.pace === 1 ? undefined : Number(s.vars.pace))
  }, [s, setMenus, setPace])
  React.useEffect(() => () => reset(), [reset])
  React.useEffect(() => {
    const root = document.documentElement
    const names = (Object.keys(VARS) as Var[]).filter((v) => v !== "pace")
    const previous = names.map((v) => [VARS[v].css, root.style.getPropertyValue(VARS[v].css), root.style.getPropertyPriority(VARS[v].css)] as const)
    for (const v of names) root.style.setProperty(VARS[v].css, cssValue(v, s.vars[v]))
    return () => previous.forEach(([name, value, priority]) => (value ? root.style.setProperty(name, value, priority) : root.style.removeProperty(name)))
  }, [s])
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    [],
  )
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const entries: unknown = JSON.parse(raw)
      if (!Array.isArray(entries) || entries.length > 30) throw new Error("Saved themes could not be read. You can still import a theme file.")
      const themes = entries.map((entry: unknown) => {
        if (
          !entry ||
          typeof entry !== "object" ||
          !("name" in entry) ||
          !("json" in entry) ||
          typeof entry.name !== "string" ||
          !entry.name.trim() ||
          entry.name.length > 64 ||
          typeof entry.json !== "string"
        )
          throw new Error("A saved theme is invalid. Import your exported file to recover it.")
        parseTheme(entry.json)
        return { name: entry.name, json: entry.json }
      })
      // This browser-only store is read after hydration; the server cannot supply its initial value.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(themes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Local storage is unavailable. Use JSON export to keep your theme.")
    }
  }, [])

  const copy = async (what: CopyTarget) => {
    setError("")
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard is unavailable. Select and copy the code below.")
      const text =
        what === "code"
          ? [code.jsx, code.css].filter(Boolean).join("\n\n")
          : what === "install"
            ? toInstall(s)
            : what === "agent"
              ? themeAgentPrompt(s)
              : `${location.origin}${pathname}${encode(s) ? `?${encode(s)}` : ""}`
      await navigator.clipboard.writeText(text)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      setCopied(what)
      setNotice(
        what === "link"
          ? "Theme link copied."
          : what === "agent"
            ? "Coding-agent instructions copied."
            : what === "install"
              ? "Installation instructions copied."
              : "Theme code copied.",
      )
      copyTimer.current = setTimeout(() => setCopied(""), 1600)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy failed. Select and copy the code below.")
    }
  }
  const persist = (themes: SavedTheme[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
    setSaved(themes)
  }
  const save = (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    const name = themeName.trim()
    if (!name) {
      setError("Give your theme a name before saving.")
      return
    }
    try {
      const existing = saved.some((theme) => theme.name === name)
      if (!existing && saved.length >= 30) throw new Error("You have 30 saved themes. Remove one or export this theme as JSON.")
      persist([...saved.filter((theme) => theme.name !== name), { name, json: serializeTheme(s, name) }])
      setNotice(existing ? `Updated “${name}” on this device.` : `Saved “${name}” on this device.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed. Download JSON to keep your theme.")
    }
  }
  const importFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError("")
    try {
      if (file.size > 100_000) throw new Error("Theme files must be smaller than 100 KB.")
      const settings = parseTheme(await file.text())
      apply(settings)
      setNotice(`Imported ${file.name}. Save it on this device or copy its installation instructions.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Choose a Keyframery theme JSON file.")
    }
  }
  const download = () => {
    setError("")
    try {
      const url = URL.createObjectURL(new Blob([serializeTheme(s, themeName.trim() || undefined)], { type: "application/json" }))
      const link = document.createElement("a")
      link.href = url
      link.download = `${(themeName.trim() || profile || "keyframery-theme").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "keyframery-theme"}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice("Theme JSON download started.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON export failed. Copy the theme code instead.")
    }
  }
  const variable = (v: Var) => {
    const def = VARS[v]
    if ("presets" in def)
      return (
        <fieldset key={v}>
          <legend className="text-sm font-medium">{def.label}</legend>
          <div role="radiogroup" aria-label={def.label} className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(def.presets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={s.vars[v] === key}
                tabIndex={s.vars[v] === key ? 0 : -1}
                onKeyDown={(event) => radioKey(event, Object.keys(def.presets), key, (choice) => apply({ ...s, vars: { ...s.vars, [v]: choice } }))}
                onClick={() => apply({ ...s, vars: { ...s.vars, [v]: key } })}
                className="rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted aria-checked:border-foreground aria-checked:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </fieldset>
      )
    return (
      <div key={v} className="grid gap-2">
        <div className="flex justify-between gap-2 text-sm">
          <label htmlFor={`var-${v}`} className="font-medium">
            {def.label}
          </label>
          <span className="font-mono text-[13px] text-muted-foreground">{v === "pace" ? `${s.vars[v]}× duration` : cssValue(v, s.vars[v])}</span>
        </div>
        <Slider
          id={`var-${v}`}
          aria-label={def.label}
          disabled={["travel", "blur", "depth"].includes(v) && s.menus.dialog !== "rack-focus"}
          min={def.min}
          max={def.max}
          step={def.step}
          value={[Number(s.vars[v])]}
          onValueChange={(value) => apply({ ...s, vars: { ...s.vars, [v]: Number((Array.isArray(value) ? value[0] : value).toFixed(2)) } })}
        />
      </div>
    )
  }

  return (
    <div className="grid min-w-0 gap-6">
      <fieldset>
        <legend className="text-sm font-medium">Start with a motion profile</legend>
        <div role="radiogroup" aria-label="Motion profile" className="mt-3 grid gap-3 sm:grid-cols-3">
          {(Object.keys(PROFILES) as (keyof typeof PROFILES)[]).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-label={PROFILES[key].label}
              aria-checked={profile === key}
              tabIndex={profile === key || (profile === null && key === "quiet") ? 0 : -1}
              onKeyDown={(event) => radioKey(event, Object.keys(PROFILES), key, (choice) => apply(clone(PROFILES[choice as keyof typeof PROFILES].settings)))}
              onClick={() => apply(clone(PROFILES[key].settings))}
              className="rounded-xl border bg-card p-4 text-left hover:bg-muted/40 aria-checked:border-foreground aria-checked:ring-1 aria-checked:ring-foreground"
            >
              <span className="block text-sm font-semibold">{PROFILES[key].label}</span>
              <span className="mt-1.5 block text-sm leading-5 text-muted-foreground">{PROFILES[key].description}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {profile ? `${PROFILES[profile].label} profile selected.` : "Custom theme. Your changes are ready to save or share."}
        </p>
      </fieldset>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="grid min-w-0 gap-4">
          <details className="rounded-xl border bg-card" open>
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Advanced settings</summary>
            <div className="grid gap-5 border-t p-4">
              {(Object.keys(GROUPS) as Group[]).map((group) => (
                <fieldset key={group}>
                  <legend className="text-sm font-medium">{GROUP_LABELS[group]}</legend>
                  <div role="radiogroup" aria-label={GROUP_LABELS[group]} className="mt-2 flex flex-wrap gap-1.5">
                    {GROUPS[group].map((cut) => (
                      <button
                        key={cut}
                        type="button"
                        role="radio"
                        aria-checked={s.menus[group] === cut}
                        tabIndex={s.menus[group] === cut ? 0 : -1}
                        onKeyDown={(event) => radioKey(event, GROUPS[group], cut, (choice) => apply({ ...s, menus: { ...s.menus, [group]: choice } }))}
                        onClick={() => apply({ ...s, menus: { ...s.menus, [group]: cut } })}
                        className="rounded-md border px-2.5 py-1 font-mono text-[13px] text-muted-foreground hover:bg-muted aria-checked:border-foreground aria-checked:text-foreground"
                      >
                        {cut}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <p className="text-xs leading-5 text-muted-foreground">
                “none” keeps the component’s original motion. Drawer controls page depth; swipe motion stays native.
              </p>
              <div className="grid gap-5 border-t pt-4">
                {(["pace", "ease", "easeExit", "hold"] as Var[]).map(variable)}
                <p className="text-xs leading-5 text-muted-foreground">
                  Pace multiplies duration: below 1 is faster. Skeleton hold delays the loading placeholder.
                </p>
              </div>
              <fieldset className="grid gap-4 border-t pt-4" disabled={s.menus.dialog !== "rack-focus"}>
                <legend className="pt-4 text-sm font-medium">Rack-focus dialog only</legend>
                <p className="text-xs leading-5 text-muted-foreground">
                  Travel, blur and depth shape rack-focus dialogs, alert dialogs and command panels. Choose rack-focus to adjust them.
                </p>
                <div className={s.menus.dialog !== "rack-focus" ? "grid gap-5 opacity-50" : "grid gap-5"}>
                  {(["travel", "blur", "depth"] as Var[]).map(variable)}
                </div>
              </fieldset>
            </div>
          </details>
          <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Keep your theme</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Named saves stay in this browser. Download JSON to move a theme between projects or devices.
            </p>
            <form onSubmit={save} className="mt-3 flex gap-2">
              <Input aria-label="Theme name" placeholder="Theme name" maxLength={64} value={themeName} onChange={(event) => setThemeName(event.target.value)} />
              <Button type="submit" size="sm">
                Save theme
              </Button>
            </form>
            {!!saved.length && (
              <ul aria-label="Saved themes" className="mt-3 grid gap-2">
                {saved.map((theme) => (
                  <li key={theme.name} className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm">{theme.name}</span>
                    <Button
                      size="xs"
                      variant="outline"
                      aria-label={`Load ${theme.name}`}
                      onClick={() => {
                        try {
                          apply(parseTheme(theme.json))
                          setThemeName(theme.name)
                          setError("")
                          setNotice(`Loaded “${theme.name}”.`)
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "This saved theme could not be loaded.")
                        }
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      aria-label={`Remove saved theme ${theme.name}`}
                      onClick={() => {
                        try {
                          persist(saved.filter((entry) => entry.name !== theme.name))
                          setError("")
                          setNotice(`Removed “${theme.name}”.`)
                        } catch {
                          setError("Local storage is unavailable. The saved theme was not removed.")
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={download}>
                Download JSON
              </Button>
              <Button size="sm" variant="outline" onClick={() => importRef.current?.click()}>
                Import JSON
              </Button>
              <input ref={importRef} type="file" accept=".json,application/json" aria-label="Import theme JSON" className="sr-only" onChange={importFile} />
            </div>
          </div>
        </div>
        <div className="grid min-w-0 content-start gap-4 max-lg:order-first lg:sticky lg:top-20">
          <ThemePreview />
          <div className="min-w-0 rounded-xl border bg-card">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Use this motion theme</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                One root Cuts component plus CSS variables. Keep your existing supported shadcn components.
              </p>
            </div>
            <pre tabIndex={0} className="max-w-full overflow-x-auto p-4 font-mono text-[13px] leading-6">
              <code data-testid="theme-jsx">{code.jsx}</code>
              {code.css && (
                <>
                  {"\n\n"}
                  <code data-testid="theme-css">{code.css}</code>
                </>
              )}
            </pre>
            <div className="flex flex-wrap gap-2 border-t p-3">
              <Button size="sm" aria-label="Copy the code" onClick={() => copy("code")}>
                {copied === "code" ? "Copied" : "Copy the code"}
              </Button>
              <Button size="sm" variant="outline" aria-label="Share" onClick={() => copy("link")}>
                {copied === "link" ? "Link copied" : "Share"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  apply(decode(""))
                  setError("")
                  setNotice("Theme reset to Expressive.")
                }}
              >
                Reset
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 border-t p-3">
              <Button size="sm" variant="outline" onClick={() => copy("install")}>
                {copied === "install" ? "Copied" : "Copy install instructions"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => copy("agent")}>
                {copied === "agent" ? "Copied" : "Copy for coding agent"}
              </Button>
            </div>
            <details className="border-t px-4 py-3">
              <summary className="cursor-pointer text-sm text-muted-foreground">Full installation instructions</summary>
              <pre tabIndex={0} className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5">
                {toInstall(s)}
              </pre>
            </details>
          </div>
          {error ? (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p role="status" className="min-h-5 text-sm text-muted-foreground">
              {notice}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
