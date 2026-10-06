/** A stand-in copy of an element that is leaving, so no library has to keep the real one mounted. */

export type Snapshot = { clone: HTMLElement; rect: DOMRect }

export function snapshot(el: Element): Snapshot {
  const clone = el.cloneNode(true) as HTMLElement
  clone.removeAttribute("id")
  clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"))
  const slot = clone.getAttribute("data-slot")
  if (slot) clone.setAttribute("data-slot", `${slot}-ghost`)
  clone.setAttribute("data-kf-ghost", "")
  return { clone, rect: el.getBoundingClientRect() }
}

/**
 * Places the ghost over the element's last box, plays `keyframes`, and always removes it afterwards.
 * With `place.host` (an ancestor of the leaving element) the ghost lives inside it, absolutely positioned,
 * so it stays in the same stacking context: tabs inside a dialog keep their ghost above the dialog.
 */
export function playGhost(snap: Snapshot, keyframes: Keyframe[], options: KeyframeAnimationOptions, place: { host?: HTMLElement; z?: number } = {}): Animation {
  const host = place.host
  const g = snap.clone
  let left = snap.rect.left
  let top = snap.rect.top
  if (host) {
    const box = host.getBoundingClientRect()
    left = snap.rect.left - box.left - host.clientLeft + host.scrollLeft
    top = snap.rect.top - box.top - host.clientTop + host.scrollTop
    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative"
      host.setAttribute("data-kf-relative", "")
    }
  }
  Object.assign(g.style, {
    position: host ? "absolute" : "fixed",
    left: `${left}px`,
    top: `${top}px`,
    width: `${snap.rect.width}px`,
    height: `${snap.rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    pointerEvents: "none",
    zIndex: String(place.z ?? 1),
  })
  g.hidden = false
  g.setAttribute("aria-hidden", "true")
  g.inert = true
  ;(host ?? document.body).appendChild(g)
  const anim = g.animate(keyframes, { fill: "forwards", ...options })
  const done = () => {
    g.remove()
    if (host?.hasAttribute("data-kf-relative") && !host.querySelector(":scope > [data-kf-ghost]")) {
      host.style.removeProperty("position")
      host.removeAttribute("data-kf-relative")
    }
  }
  anim.finished.then(done, done)
  return anim
}
