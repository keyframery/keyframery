export type Adapter = {
  /** Selector for the elements this adapter owns. */
  match: string
  /** Runs once at start, for markup that was already in the page. */
  init?(): void
  added?(el: HTMLElement): void
  changed?(el: HTMLElement, attribute: string): void
  removed?(el: HTMLElement): void
  /** Runs once after every mutation batch. */
  flush?(): void
  /** Runs when the engine stops. */
  dispose?(): void
}

export const WATCHED_ATTRIBUTES = ["data-state", "data-open", "data-closed", "hidden", "data-active", "aria-selected", "data-cut", "data-cut-pace", "data-checked", "data-unchecked", "data-pressed", "aria-pressed", "aria-current", "data-selected-single", "aria-invalid", "data-invalid", "data-selected"]

const inGhost = (n: Element) => n.closest("[data-kf-ghost]") !== null

function eachMatch(node: Element, selector: string, fn: (el: HTMLElement) => void) {
  if (node.matches(selector)) fn(node as HTMLElement)
  node.querySelectorAll<HTMLElement>(selector).forEach(fn)
}

/** An adapter bug must never break the page: skip the cut, keep the library's own motion. */
function safely(fn: () => void) {
  try {
    fn()
  } catch (err) {
    console.warn("[keyframery] cut skipped:", err)
  }
}

export function observe(root: HTMLElement, adapters: Adapter[]): () => void {
  const perf = (globalThis as { __kfPerf?: number[] }).__kfPerf
  const mo = new MutationObserver((records) => {
    const t0 = performance.now()
    for (const r of records) {
      if (r.type === "childList") {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element) || inGhost(n)) return
          for (const a of adapters) if (a.added) eachMatch(n, a.match, (el) => safely(() => a.added!(el)))
        })
        r.removedNodes.forEach((n) => {
          if (!(n instanceof Element) || n.hasAttribute("data-kf-ghost")) return
          for (const a of adapters) if (a.removed) eachMatch(n, a.match, (el) => safely(() => a.removed!(el)))
        })
      } else if (r.target instanceof HTMLElement && !inGhost(r.target)) {
        const el = r.target
        for (const a of adapters) if (a.changed && el.matches(a.match)) safely(() => a.changed!(el, r.attributeName ?? ""))
      }
    }
    for (const a of adapters) if (a.flush) safely(() => a.flush!())
    perf?.push(performance.now() - t0)
  })
  mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: WATCHED_ATTRIBUTES })
  return () => mo.disconnect()
}
