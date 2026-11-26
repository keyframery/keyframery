import "./bench.css"

import { createApp, defineComponent, h, onErrorCaptured, ref, shallowRef, watch, type Component } from "vue"

/* Every Vue example, loaded on demand. #/<slug>/<example> renders one alone on a plain page, in the same frame as
   the React bench; #/ lists them (also as JSON on window.__benchIndex for the parity script). An example whose
   component isn't built yet fails to load: the page then says so (data-bench-error) instead of crashing. */
const modules = import.meta.glob<{ default: Component }>("../../examples/vue/*/*.vue")
const index: Record<string, string[]> = {}
const loaders: Record<string, () => Promise<{ default: Component }>> = {}
for (const [file, load] of Object.entries(modules)) {
  const m = file.match(/examples\/vue\/([^/]+)\/([^/]+)\.vue$/)
  if (!m) continue
  ;(index[m[1]] ??= []).push(m[2])
  loaders[`${m[1]}/${m[2]}`] = load
}
for (const list of Object.values(index)) list.sort((a, b) => (a === "usage" ? -1 : b === "usage" ? 1 : a.localeCompare(b)))
;(window as unknown as { __benchIndex: unknown }).__benchIndex = index
/* Vite reports why a module failed (an unresolved import, a compile error) on its socket, not to import(): keep it. */
const viteErrors: string[] = ((window as unknown as { __viteErrors: string[] }).__viteErrors = [])
import.meta.hot?.on("vite:error", (p: { err: { message: string } }) => viteErrors.push(p.err.message))

const ready = (v: string) => requestAnimationFrame(() => document.documentElement.setAttribute("data-bench-ready", v))

const Example = defineComponent({
  props: { id: { type: String, required: true } },
  setup(props) {
    const C = shallowRef<Component | null>(null)
    const error = ref<string | null>(null)
    onErrorCaptured((e) => {
      error.value = `render: ${(e as Error).message}`
      ready("error")
      return false
    })
    const load = () => {
      C.value = null
      error.value = null
      const l = loaders[props.id]
      if (!l) {
        error.value = `no Vue example ${props.id}`
        return ready("error")
      }
      l().then(
        (m) => {
          C.value = m.default
          ready("ok")
        },
        (e: Error) =>
          /* Give Vite's own message a moment to arrive; it names the missing file or export. */
          setTimeout(() => {
            error.value = `load: ${[e.message, ...viteErrors].join("\n")}`
            ready("error")
          }, 150),
      )
    }
    watch(() => props.id, load, { immediate: true })
    return () => (error.value ? h("pre", { "data-bench-error": "load", class: "text-[12px] whitespace-pre-wrap text-destructive" }, error.value) : C.value ? h(C.value) : null)
  },
})

const Bench = defineComponent({
  setup() {
    const id = ref(location.hash.replace(/^#\/?/, ""))
    addEventListener("hashchange", () => (id.value = location.hash.replace(/^#\/?/, "")))
    return () => {
      if (!id.value.includes("/")) {
        return h("main", { class: "mx-auto max-w-[900px] p-10 text-[13px]" }, [
          h("h1", { class: "mb-4 font-semibold" }, `Vue bench: ${Object.keys(index).length} components`),
          ...Object.entries(index).map(([slug, list]) => h("p", { key: slug }, [h("b", slug), ...list.map((e) => h("a", { class: "ml-2 underline", href: `#/${slug}/${e}` }, e))])),
        ])
      }
      return h("main", { "data-bench-stage": "", class: "flex min-h-screen justify-center bg-background px-10 py-16 text-foreground" }, [
        h("div", { "data-bench-example": id.value, class: "flex w-[640px] justify-center" }, [h(Example, { id: id.value, key: id.value })]),
      ])
    }
  },
})

createApp(Bench).mount("#app")
