"use client"

/* Animated drop-in for `@ui-sdk/react/tree`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - Glide: the selected row's key springs from row to row when the selection moves. It is the tree's
     `::after`; give it a surface with `after:` classes. A lighter hover highlight glides under the
     pointer and keyboard focus as the tree's `::before`. Both default to a tint of the text colour.
   - The chevron turns on a spring.
   - Height and Cascade: a branch opens to its height and its rows fall in one after another. */

import {
  Tree as TreeRoot,
  TreeGroup as TreeGroupPart,
  TreeItemIndicator as TreeItemIndicatorPart,
  type TreeMode,
  type TreeProps,
} from "@ui-sdk/react/tree"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/tree"

const ROW = '[data-slot="tree-label"]'
const MARK = "data-kf-tree-hl"

/* Moves the hover mark to `row`, or hides the highlight where it is (so it can glide on from there). */
function mark(root: HTMLElement, row: Element | null) {
  if (!row || row.hasAttribute("data-disabled")) {
    root.setAttribute("data-kf-idle", "")
    return
  }
  for (const old of root.querySelectorAll(`[${MARK}]`)) if (old !== row) old.removeAttribute(MARK)
  row.setAttribute(MARK, "")
  root.removeAttribute("data-kf-idle")
  if (!root.hasAttribute("data-kf-glide")) setTimeout(() => root.setAttribute("data-kf-glide", ""), 40)
}

/* The row under the pointer, or the row of the focused item (focus stays on the item). */
function rowFrom(root: HTMLElement, target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const row =
    target.closest(ROW) ??
    (target.matches('[data-slot="tree-item"]') ? target.querySelector(`:scope > ${ROW}`) : null)
  return row && root.contains(row) ? row : null
}

function Tree<Mode extends TreeMode = "single">({
  className,
  onPointerOver,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: TreeProps<Mode>) {
  /* Hold the selection's glide until the rows are laid out, so the key is simply there on load. */
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])
  const hovering = React.useRef(false)

  return (
    <TreeRoot
      data-kf-ready={ready || undefined}
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-tree-hl,--kf-tree-sel]",
          /* Which row each highlight rests on. A row can hold both. */
          "[&_[data-kf-tree-hl]]:[anchor-name:--kf-tree-hl]",
          "[&_[data-slot=tree-label]:is([data-selected],[data-current])]:[anchor-name:--kf-tree-sel]",
          "[&_[data-slot=tree-label][data-kf-tree-hl]:is([data-selected],[data-current])]:[anchor-name:--kf-tree-hl,--kf-tree-sel]",
          /* Hover highlight. */
          "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_6%,transparent)]",
          "before:[position-anchor:--kf-tree-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:transition-[opacity,scale] before:duration-[calc(200ms*var(--kf-speed,1))] before:ease-house",
          "data-kf-glide:before:[transition:top_calc(360ms*var(--kf-speed,1))_var(--ease-spring),right_calc(360ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(360ms*var(--kf-speed,1))_var(--ease-spring),left_calc(360ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),scale_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-kf-idle:before:scale-[0.96] data-kf-idle:before:opacity-0 not-has-[[data-kf-tree-hl]]:before:opacity-0",
          /* Selection key. It hides while its row is inside a closing branch. */
          "after:pointer-events-none after:absolute after:-z-10 after:bg-[color-mix(in_oklch,currentColor_10%,transparent)]",
          "after:[position-anchor:--kf-tree-sel] after:top-[anchor(top)] after:right-[anchor(right)] after:bottom-[anchor(bottom)] after:left-[anchor(left)]",
          "after:transition-[opacity] after:duration-[calc(200ms*var(--kf-speed,1))] after:ease-house",
          "data-kf-ready:after:[transition:top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),right_calc(380ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(380ms*var(--kf-speed,1))_var(--ease-spring),left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
          "not-has-[[data-slot=tree-label]:is([data-selected],[data-current])]:after:opacity-0",
          "has-[[data-ending-style]_[data-slot=tree-label]:is([data-selected],[data-current])]:after:opacity-0",
          "motion-reduce:before:[transition:none]! motion-reduce:after:[transition:none]!",
        ),
        className,
      )}
      onPointerOver={(event) => {
        onPointerOver?.(event)
        hovering.current = true
        const row = rowFrom(event.currentTarget, event.target)
        if (row) mark(event.currentTarget, row)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        hovering.current = false
        const root = event.currentTarget
        mark(root, rowFrom(root, root.querySelector(":focus-visible")))
      }}
      onFocus={(event) => {
        onFocus?.(event)
        const target = event.target as Element
        if (!hovering.current && target.matches(":focus-visible")) mark(event.currentTarget, rowFrom(event.currentTarget, target))
      }}
      onBlur={(event) => {
        onBlur?.(event)
        const root = event.currentTarget
        if (!hovering.current && !root.contains(event.relatedTarget as Node | null)) mark(root, null)
      }}
      {...props}
    />
  )
}

function TreeItemIndicator({ className, ...props }: React.ComponentProps<typeof TreeItemIndicatorPart>) {
  return (
    <TreeItemIndicatorPart
      className={withClass(
        cn(
          "[transition:rotate_calc(520ms*var(--kf-speed,1))_var(--ease-pop),color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] data-expanded:rotate-90",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Opens to its height while its rows cascade in; closes a little faster, all at once. */
function TreeGroup({ className, ...props }: React.ComponentProps<typeof TreeGroupPart>) {
  return (
    <TreeGroupPart
      className={withClass(
        cn(
          "h-(--tree-group-height,auto) [clip-path:inset(-4px_-100vw)]",
          "transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
          "data-starting-style:h-0 data-ending-style:h-0 data-ending-style:duration-[calc(260ms*var(--kf-speed,1))]",
          "*:transition-[opacity,translate,filter] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
          "*:[transition-delay:calc((min(sibling-index(),10)-1)*calc(36ms*var(--kf-speed,1))+calc(30ms*var(--kf-speed,1)))]",
          "data-starting-style:*:translate-y-2 data-starting-style:*:opacity-0 data-starting-style:*:blur-[4px] data-starting-style:*:transition-none",
          "data-ending-style:*:opacity-0 data-ending-style:*:blur-[2px] data-ending-style:*:duration-[calc(200ms*var(--kf-speed,1))] data-ending-style:*:ease-house data-ending-style:*:[transition-delay:0ms]",
          "motion-reduce:transition-none! motion-reduce:*:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Tree, TreeGroup, TreeItemIndicator }
