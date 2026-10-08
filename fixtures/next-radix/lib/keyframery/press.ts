export type Press = { el: Element; rect: DOMRect; t: number; kind: "pointer" | "key"; key?: string }

export type PressTracker = {
  /** The last press, if it happened within `maxAgeMs`. */
  last(maxAgeMs?: number): Press | null
  /** Called on every press, before the library handles it (capture phase). */
  onPress(fn: (press: Press, target: Element) => void): () => void
  dispose(): void
}

const PRESSABLE = 'button,a,input,textarea,[role="button"],[role="menuitem"],[role="tab"],[role="option"],[data-slot$="-trigger"]'
const KEYS = new Set(["Enter", " ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"])

export function createPressTracker(doc: Document = document): PressTracker {
  let last: Press | null = null
  const subs = new Set<(press: Press, target: Element) => void>()

  const handle = (e: Event) => {
    const target = e.target instanceof Element ? e.target : null
    if (!target) return
    if (e instanceof KeyboardEvent && !KEYS.has(e.key)) return
    const el = target.closest(PRESSABLE) ?? target
    const kind = e instanceof KeyboardEvent ? "key" : "pointer"
    const press: Press = { el, rect: el.getBoundingClientRect(), t: performance.now(), kind, key: e instanceof KeyboardEvent ? e.key : undefined }
    last = press
    subs.forEach((fn) => fn(press, target))
  }

  doc.addEventListener("pointerdown", handle, true)
  doc.addEventListener("keydown", handle, true)

  return {
    last(maxAgeMs = 1500) {
      return last && performance.now() - last.t < maxAgeMs ? last : null
    },
    onPress(fn) {
      subs.add(fn)
      return () => {
        subs.delete(fn)
      }
    },
    dispose() {
      doc.removeEventListener("pointerdown", handle, true)
      doc.removeEventListener("keydown", handle, true)
      subs.clear()
    },
  }
}
