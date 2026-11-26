import * as React from "react"
import { createRoot } from "react-dom/client"

import "./bench.css"

/* Every React example in the repo, loaded on demand. #/<slug>/<example> renders one alone on a plain page;
   #/ lists them (also as JSON on window.__benchIndex for the parity script). */
const modules = import.meta.glob<{ default: React.ComponentType }>("../../../../src/examples/*/*.tsx")
const index: Record<string, string[]> = {}
const loaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {}
for (const [file, load] of Object.entries(modules)) {
  const m = file.match(/examples\/([^/]+)\/([^/]+)\.tsx$/)
  if (!m) continue
  ;(index[m[1]] ??= []).push(m[2])
  loaders[`${m[1]}/${m[2]}`] = load
}
for (const list of Object.values(index)) list.sort((a, b) => (a === "usage" ? -1 : b === "usage" ? 1 : a.localeCompare(b)))
;(window as unknown as { __benchIndex: unknown }).__benchIndex = index

class Boundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) return <pre data-bench-error="render">{String(this.state.error.message)}</pre>
    return this.props.children
  }
}

function Example({ id }: { id: string }) {
  const [state, setState] = React.useState<{ C: React.ComponentType | null; error: string | null }>({ C: null, error: null })
  React.useEffect(() => {
    const load = loaders[id]
    if (!load) return setState({ C: null, error: `no React example ${id}` })
    load().then(
      (m) => setState({ C: m.default, error: null }),
      (e: Error) => setState({ C: null, error: e.message }),
    )
  }, [id])
  React.useEffect(() => {
    if (state.C || state.error) requestAnimationFrame(() => document.documentElement.setAttribute("data-bench-ready", state.error ? "error" : "ok"))
  }, [state])
  if (state.error) return <pre data-bench-error="load">{state.error}</pre>
  if (!state.C) return null
  const C = state.C
  return (
    <Boundary>
      <C />
    </Boundary>
  )
}

function useHash() {
  const [hash, setHash] = React.useState(location.hash)
  React.useEffect(() => {
    const on = () => setHash(location.hash)
    addEventListener("hashchange", on)
    return () => removeEventListener("hashchange", on)
  }, [])
  return hash.replace(/^#\/?/, "")
}

function Bench() {
  const id = useHash()
  if (!id.includes("/")) {
    return (
      <main className="mx-auto max-w-[900px] p-10 text-[13px]">
        <h1 className="mb-4 font-semibold">React bench: {Object.keys(index).length} components</h1>
        {Object.entries(index).map(([slug, list]) => (
          <p key={slug}>
            <b>{slug}</b> {list.map((e) => <a key={e} className="ml-2 underline" href={`#/${slug}/${e}`}>{e}</a>)}
          </p>
        ))}
      </main>
    )
  }
  return (
    <main data-bench-stage className="flex min-h-screen justify-center bg-background px-10 py-16 text-foreground">
      <div data-bench-example={id} className="flex w-[640px] justify-center">
        <Example key={id} id={id} />
      </div>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(<Bench />)
