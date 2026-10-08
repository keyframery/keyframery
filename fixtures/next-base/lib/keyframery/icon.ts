export const STROKES = "path,circle,rect,line,polyline,polygon,ellipse"

export function strokesOf(svg: Element): SVGGeometryElement[] {
  return [...svg.querySelectorAll<SVGGeometryElement>(STROKES)]
}

/** Outline icons (lucide, tabler) can redraw their strokes; filled ones (phosphor's fill weight) can't. */
export function isOutline(svg: Element): boolean {
  return (svg.getAttribute("fill") ?? getComputedStyle(svg).fill) === "none"
}

/** One stroke draws itself. A pathLength of 1 lets a single dash cover any shape exactly. */
export function draw(el: SVGGeometryElement, duration: number, delay = 0, easing = "cubic-bezier(0.65, 0, 0.35, 1)"): Animation {
  el.setAttribute("pathLength", "1")
  el.style.strokeDasharray = "1"
  const anim = el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay, easing, fill: "backwards" })
  const clean = () => {
    el.style.strokeDasharray = ""
    el.removeAttribute("pathLength")
  }
  anim.finished.then(clean, clean)
  return anim
}

/** Every stroke of an icon redraws, one after another. */
export function redraw(svg: Element, duration: number, delay = 0): Animation[] {
  return strokesOf(svg).map((part, i) => draw(part, duration, delay + i * (duration / 6)))
}

/** A short scale punch, for icons that can't redraw. */
export function punch(svg: Element, duration: number, delay = 0): Animation {
  return svg.animate([{ scale: "1" }, { scale: "1.2", offset: 0.4 }, { scale: "1" }], { duration, delay, easing: "ease-out" })
}
