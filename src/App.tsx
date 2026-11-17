import * as React from "react"
import { RotateCw } from "lucide-react"

import { AgentPreview } from "@/components/agent-preview"
import { Button } from "@/components/ui/button"
import { type PlayStep, useAutoplay } from "@/lib/autoplay"
import { type Controls, type ControlValues, parseValues } from "@/lib/controls"
import { Customize } from "@/lib/customize"
import { Speed } from "@/lib/keyframery"

export type { PlayStep }

type DemoModule = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each demo types its own optional props
  default: React.ComponentType<any>
  meta: { name: string; group: string }
  play?: PlayStep[]
  controls?: Controls
}

/* `?controls=variant:primary,disabled:true` starts the single view with those values, for
   screenshots. `?speed=0.6` does the same for the duration slider. */
const query = new URLSearchParams(window.location.search)

function Playing({ demo, tall }: { demo: (typeof demos)[number]; tall?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [run, setRun] = React.useState(0)
  useAutoplay(ref, demo.play, run)
  const [values, setValues] = React.useState<ControlValues>(() => parseValues(demo.controls, tall ? query.get("controls") : null))
  const [speed, setSpeed] = React.useState(() => (tall && Number(query.get("speed"))) || 1)
  const preview = (
    <div ref={ref} data-demo={demo.slug} className="relative">
      <Button data-agent-hidden variant="ghost" size="icon" onClick={() => setRun((now) => now + 1)} aria-label="Replay the demo" title="Replay animation"
        className="absolute top-3 right-3 z-20 size-8 rounded-[10px] border border-border/70 bg-background/90 text-muted-foreground shadow-sm hover:text-foreground">
        <RotateCw aria-hidden className="size-3.5" />
      </Button>
      <Stage tall={tall}>
        <Speed speed={speed === 1 ? undefined : speed}>
          <demo.default key={run} {...values} />
        </Speed>
      </Stage>
    </div>
  )
  return (
    <>
      {tall ? <AgentPreview label={demo.meta.name} className="overflow-hidden rounded-[18px] border border-border bg-background">{preview}</AgentPreview> : preview}
      {/* The single view shows the same Customize panel the docs page does. */}
      {tall && !phoneWidth ? (
        <Customize
          className="mt-4 rounded-[18px] bg-background px-6 py-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
          controls={demo.controls}
          values={values}
          onChange={(name, value) => setValues((now) => ({ ...now, [name]: value }))}
          speed={speed}
          onSpeedChange={setSpeed}
          onReset={() => {
            setValues(parseValues(demo.controls, null))
            setSpeed(1)
          }}
        />
      ) : null}
    </>
  )
}

/* Every file in src/demos registers itself here. */
const modules = import.meta.glob<DemoModule>("./demos/*.tsx", { eager: true })
const demos = Object.entries(modules)
  .map(([file, mod]) => ({ slug: file.replace("./demos/", "").replace(".tsx", ""), ...mod }))
  .sort((a, b) => a.meta.name.localeCompare(b.meta.name))

const groups = [...new Set(demos.map((d) => d.meta.group))].sort()

function useHash() {
  const [hash, setHash] = React.useState(() => window.location.hash)
  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return hash
}

/* ?w=390 draws the stage at a phone's width (16px gutters), to check each demo's narrow layout. */
const phoneWidth = Number(new URLSearchParams(window.location.search).get("w")) || 0

function Stage({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <div
      data-agent-preview-content
      style={phoneWidth ? { width: phoneWidth, padding: 16, marginInline: "auto", borderRadius: 0 } : undefined}
      className={
        "flex items-center justify-center rounded-[18px] bg-background p-10 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)] " +
        (tall ? "min-h-[560px]" : "min-h-[320px]")
      }
    >
      {children}
    </div>
  )
}

export function App() {
  const hash = useHash()
  const params = new URLSearchParams(window.location.search)
  const [dark, setDark] = React.useState(params.get("theme") === "dark")
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  const [motion, setMotion] = React.useState(params.get("motion") ?? "springy")
  React.useEffect(() => {
    if (motion === "springy") document.documentElement.removeAttribute("data-motion")
    else document.documentElement.setAttribute("data-motion", motion)
  }, [motion])

  const slug = hash.replace(/^#\/?/, "")
  const single = demos.find((d) => d.slug === slug)

  return (
    <div className="min-h-screen bg-[oklch(0.975_0_0)] text-foreground dark:bg-[oklch(0.125_0_0)]">
      <header className={"mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-3 px-8 pt-8 pb-6 text-[13px]" + (phoneWidth ? " hidden" : "")}>
        <a href="#/" className="shrink-0 font-semibold tracking-tight">
          Keyframery UI
        </a>
        <span className="text-muted-foreground">
          {single ? single.meta.name : `${demos.length} components`}
        </span>
        <div role="group" aria-label="Motion style" className="order-3 flex gap-0.5 rounded-full bg-foreground/5 p-0.5 sm:order-none sm:ml-auto">
          {["calm", "springy", "snappy", "playful"].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={motion === m}
              onClick={() => setMotion(m)}
              className="rounded-full px-2.5 py-1 font-medium capitalize text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
            >
              {m}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          className="ml-auto rounded-full px-3 py-1.5 font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground sm:ml-0"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>
      <main className={phoneWidth ? "pb-24" : "mx-auto max-w-[1180px] px-8 pb-24"}>
        {single ? (
          <Playing key={single.slug} demo={single} tall />
        ) : (
          groups.map((group) => (
            <section key={group} className="mb-12">
              <h2 className="mb-4 text-[12px] font-medium text-muted-foreground">{group}</h2>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {demos
                  .filter((d) => d.meta.group === group)
                  .map((d) => (
                    <div key={d.slug}>
                      <Playing demo={d} />
                      <a
                        href={`#/${d.slug}`}
                        className="mt-2.5 inline-block text-[13px] font-medium text-muted-foreground hover:text-foreground"
                      >
                        {d.meta.name}
                      </a>
                    </div>
                  ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  )
}
