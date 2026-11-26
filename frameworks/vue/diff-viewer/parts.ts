/* The diff viewer's parts, made once from the core definition (the React primitive's createParts and usePart, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { diffViewer } from "@/components/keyframery/core/diff-viewer-core"

export const parts = createParts(diffViewer, {
  root: "div",
  header: "div",
  title: "div",
  stats: "div",
  actions: "div",
  "view-switch": "div",
  "view-option": "button",
  copy: "button",
  content: "div",
  hunk: "div",
  "hunk-header": "div",
  gap: "div",
  fold: "button",
  expanded: "div",
  accept: "button",
  reject: "button",
  status: "span",
  undo: "button",
})

/* Hunks (and the row above each) rise in on mount, a beat apart. Not again after a view switch:
   then the whole body arrives by the switch. */
export const cascade =
  "animate-[kf-diff-in_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_both] [animation-delay:calc(var(--diff-hunk-index,0)*calc(70ms*var(--kf-speed,1))*var(--kf-flourish,1)+calc(80ms*var(--kf-speed,1))*var(--kf-flourish,1))] group-data-switched/diff-viewer:animate-none motion-reduce:animate-none!"

export const press =
  "transition-[color,background-color,box-shadow,scale] duration-[calc(160ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.05*var(--kf-flourish,1))] motion-reduce:transition-none"
export const arrive =
  "transition-[opacity,translate] duration-[calc(300ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none starting:opacity-0 starting:translate-y-[calc(4px+4px*var(--kf-flourish,1))]"
