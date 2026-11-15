"use client"

/* Animated drop-in for `@ui-sdk/react/label`: same part, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Label as LabelPart } from "@ui-sdk/react/label"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/label"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const INVALID = '[aria-invalid="true"],[data-invalid]'

/* UI SDK's label carries no state of its own, so the label watches the control it names (its
   `htmlFor` target, or the control it wraps) and mirrors two facts as attributes for CSS:
   `data-focused` while focus is anywhere inside that control, `data-invalid` while the control, or
   a part of it, is marked invalid. It changes nothing about naming, focus or presses. */
function useControlState(htmlFor: string | undefined) {
  const [node, setNode] = React.useState<HTMLLabelElement | null>(null)
  const [focused, setFocused] = React.useState(false)
  const [invalid, setInvalid] = React.useState(false)

  React.useEffect(() => {
    if (!node) return
    const doc = node.ownerDocument
    const control = () => (htmlFor ? doc.getElementById(htmlFor) : null) ?? node
    const readFocus = () => {
      const active = doc.activeElement
      setFocused(!!active && active !== doc.body && (control().contains(active) || node.contains(active)))
    }
    const readInvalid = () => {
      const el = control()
      setInvalid(el.matches(INVALID) || !!el.querySelector(INVALID))
    }
    readFocus()
    readInvalid()
    doc.addEventListener("focusin", readFocus)
    doc.addEventListener("focusout", readFocus)
    const target = htmlFor ? doc.getElementById(htmlFor) : node
    const observer = new MutationObserver(readInvalid)
    if (target) observer.observe(target, { attributes: true, subtree: true, attributeFilter: ["aria-invalid", "data-invalid"] })
    return () => {
      doc.removeEventListener("focusin", readFocus)
      doc.removeEventListener("focusout", readFocus)
      observer.disconnect()
    }
  }, [node, htmlFor])

  return { setNode, focused, invalid }
}

/* The label's colour shifts on the house ease when its control takes focus or turns invalid. A
   `LabelMarker` inside it pops (ease-pop) at the same moment. */
function Label({ className, ref, htmlFor, ...props }: React.ComponentProps<typeof LabelPart>) {
  const { setNode, focused, invalid } = useControlState(htmlFor)
  const merged = React.useCallback(
    (el: HTMLLabelElement | null) => {
      setNode(el)
      if (typeof ref === "function") ref(el)
      else if (ref) ref.current = el
    },
    [ref, setNode],
  )
  return (
    <LabelPart
      ref={merged}
      htmlFor={htmlFor}
      data-focused={focused || undefined}
      data-invalid={invalid || undefined}
      className={withClass(
        "group/kf-label transition-[color] duration-[calc(180ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

/* Extra: a required or optional marker. It rests small and quiet, and pops up to full size when
   the control is focused or invalid, and lifts a pixel while invalid. */
function LabelMarker({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="label-marker"
      className={cn(
        "inline-block origin-left scale-[0.82] opacity-60",
        "transition-[scale,opacity,translate] duration-[calc(420ms*var(--kf-speed,1))] ease-pop",
        "group-data-focused/kf-label:scale-100 group-data-focused/kf-label:opacity-100",
        "group-data-invalid/kf-label:scale-100 group-data-invalid/kf-label:opacity-100 group-data-invalid/kf-label:-translate-y-px",
        "motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

export { Label, LabelMarker }
