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

/** Places the ghost over the element's last box, plays `keyframes`, and always removes it afterwards. */
export function playGhost(snap: Snapshot, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation {
  const g = snap.clone
  Object.assign(g.style, {
    position: "fixed",
    left: `${snap.rect.left}px`,
    top: `${snap.rect.top}px`,
    width: `${snap.rect.width}px`,
    height: `${snap.rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    pointerEvents: "none",
    zIndex: "1",
  })
  g.hidden = false
  g.setAttribute("aria-hidden", "true")
  g.inert = true
  document.body.appendChild(g)
  const anim = g.animate(keyframes, { fill: "forwards", ...options })
  const done = () => g.remove()
  anim.finished.then(done, done)
  return anim
}
