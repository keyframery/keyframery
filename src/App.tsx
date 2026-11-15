import * as React from "react"

import { type PlayStep, useAutoplay } from "@/lib/autoplay"

export type { PlayStep }

type DemoModule = {
  default: React.ComponentType
  meta: { name: string; group: string }
  play?: PlayStep[]
}

function Playing({ demo, tall }: { demo: (typeof demos)[number]; tall?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useAutoplay(ref, demo.play)
  return (
    <div ref={ref} data-demo={demo.slug}>
      <Stage tall={tall}>
        <demo.default />
      </Stage>
    </div>
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

function Stage({ children, tall }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <div
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
      <header className="mx-auto flex max-w-[1180px] items-center gap-4 px-8 pt-8 pb-6 text-[13px]">
        <a href="#/" className="font-semibold tracking-tight">
          Keyframery UI
        </a>
        <span className="text-muted-foreground">
          {single ? single.meta.name : `${demos.length} components`}
        </span>
        <div role="group" aria-label="Motion style" className="ml-auto flex gap-0.5 rounded-full bg-foreground/5 p-0.5">
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
          className="rounded-full px-3 py-1.5 font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>
      <main className="mx-auto max-w-[1180px] px-8 pb-24">
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
