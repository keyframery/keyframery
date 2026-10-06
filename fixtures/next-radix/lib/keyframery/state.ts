export const OPEN =
  '[data-state="open"],[data-state="delayed-open"],[data-state="instant-open"],[data-open]:not([data-open="false"])'
export const CLOSED = '[data-state="closed"],[data-closed]:not([data-closed="false"])'
export const ACTIVE = '[data-state="active"],[data-active]:not([data-active="false"]),[aria-selected="true"]'

export type Phase = "open" | "closed"

export function phaseOf(el: Element): Phase | null {
  if (el.matches(OPEN)) return "open"
  if (el.matches(CLOSED)) return "closed"
  return null
}

export function isActive(el: Element): boolean {
  return el.matches(ACTIVE)
}

/** True while <Cuts /> is disabled, or when this element or an ancestor says data-cut="none". */
export function optedOut(el: Element): boolean {
  return !document.documentElement.hasAttribute("data-kf") || el.closest('[data-cut="none"]') !== null
}
