/* UI SDK parts for prompt-composer, made once from the shared core definition (the same file React
   uses), and the classes of React's primitive (motion) and ui (look) layers. */
import { createParts } from "@ui-sdk/vue/primitive"

import { promptComposer } from "@/components/keyframery/core/prompt-composer-core"
import { cn } from "@/lib/utils"

export const {
  Root: PromptComposerRootPart,
  Attachments: PromptComposerAttachmentsPart,
  Toolbar: PromptComposerToolbarPart,
  Drop: PromptComposerDropPart,
  Count: PromptComposerCountPart,
} = createParts(promptComposer, { root: "div", attachments: "div", toolbar: "div", drop: "div", count: "span" })

/* ---- primitive (motion) ---- */

export const rootMotion = "group/prompt-composer relative"

export const dropzoneMotion = cn(
  "group/prompt-composer-box relative isolate",
  "[transition:scale_calc(420ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(180ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(180ms*var(--kf-speed,1))_var(--ease-house)]",
  "data-dragging:scale-[calc(1+0.012*var(--kf-flourish,1))]",
  "motion-reduce:[transition:none]!",
)

export const dropMotion = cn(
  "pointer-events-none absolute inset-0 z-20 opacity-0",
  "transition-opacity duration-[calc(160ms*var(--kf-speed,1))] ease-house",
  "group-data-dragging/prompt-composer-box:opacity-100 group-data-dragging/prompt-composer-box:duration-[calc(220ms*var(--kf-speed,1))]",
  "*:translate-y-[calc(0.375rem*var(--kf-flourish,1))] *:transition-[translate] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
  "group-data-dragging/prompt-composer-box:*:translate-y-0",
  "motion-reduce:transition-none! motion-reduce:*:transition-none!",
)

export const attachmentsMotion = cn(
  "grid grid-rows-[0fr] [transition:grid-template-rows_calc(320ms*var(--kf-speed,1))_var(--ease-house)]",
  "has-[[data-slot=attachment]:not([data-removing])]:grid-rows-[1fr] has-[[data-slot=attachment]:not([data-removing])]:[transition-duration:calc(380ms*var(--kf-speed,1))]",
  "motion-reduce:[transition:none]!",
)

export const inputMotion = "transition-[color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"

export const countMotion = "transition-[color,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"

/* React's primitive Button (motion only), used by Send with no pending indicator. */
export const buttonMotion = cn(
  "group/kf-button relative",
  "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]",
  "not-data-disabled:not-data-pending:active:scale-[calc(1-0.04*var(--kf-flourish,1))] not-data-disabled:not-data-pending:active:[transition-duration:calc(150ms*var(--kf-speed,1)),calc(150ms*var(--kf-speed,1)),calc(150ms*var(--kf-speed,1)),calc(150ms*var(--kf-speed,1)),calc(90ms*var(--kf-speed,1))]",
  "not-data-disabled:hover:[--kf-nudge:1] not-data-disabled:data-hovered:[--kf-nudge:1] focus-visible:[--kf-nudge:1]",
  "motion-reduce:[transition:none]!",
)
export const buttonLabel = cn(
  "inline-flex flex-1 items-center [justify-content:inherit] [gap:inherit]",
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none!",
  "group-data-pending/kf-button:-translate-y-[calc(0.5rem+0.5rem*var(--kf-flourish,1))] group-data-pending/kf-button:opacity-0 group-data-pending/kf-button:blur-[calc(3px*var(--kf-flourish,1))]",
  "group-data-pending/kf-button:duration-[calc(240ms*var(--kf-speed,1))] group-data-pending/kf-button:ease-house",
)

/* React's primitive FileInputTrigger (motion only). */
export const fileTriggerMotion = cn(
  "[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(260ms*var(--kf-speed,1))_var(--ease-pop),box-shadow_calc(120ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(120ms*var(--kf-speed,1))_var(--ease-house)] active:scale-[calc(1-0.04*var(--kf-flourish,1))]",
  "motion-reduce:[transition:none]!",
)

/* One glyph of the send button. All three are there; `--kf-glyph` (1 shown, 0 hidden) follows the
   root's `data-status`. A glyph leaves quickly and the next one arrives a beat later. */
export const glyph = cn(
  "absolute inset-0 grid place-items-center",
  "opacity-(--kf-glyph) [scale:calc(1-(1-var(--kf-glyph))*(0.1+0.4*var(--kf-flourish,1)))] [rotate:calc((1-var(--kf-glyph))*-45deg*var(--kf-flourish,1))] [filter:blur(calc((1-var(--kf-glyph))*3px*var(--kf-flourish,1)))]",
  "[transition-property:opacity,scale,rotate,filter] [transition-timing-function:var(--ease-house),var(--ease-pop),var(--ease-spring),var(--ease-house)]",
  "[transition-duration:calc((140ms+var(--kf-glyph)*80ms)*var(--kf-speed,1)),calc((160ms+var(--kf-glyph)*260ms)*var(--kf-speed,1)),calc((160ms+var(--kf-glyph)*260ms)*var(--kf-speed,1)),calc((140ms+var(--kf-glyph)*100ms)*var(--kf-speed,1))]",
  "[transition-delay:calc(var(--kf-glyph)*60ms*var(--kf-speed,1))]",
  "motion-reduce:[transition:none]!",
)
export const glyphSend = cn(glyph, "[--kf-glyph:1] group-data-[status=submitted]/prompt-composer:[--kf-glyph:0] group-data-[status=streaming]/prompt-composer:[--kf-glyph:0]")
export const glyphWait = cn(glyph, "[--kf-glyph:0] group-data-[status=submitted]/prompt-composer:[--kf-glyph:1]")
export const glyphStop = cn(glyph, "[--kf-glyph:0] group-data-[status=streaming]/prompt-composer:[--kf-glyph:1]")

/* ---- ui (look) ---- */

export const boxLook = cn(
  "flex flex-col gap-1 rounded-[var(--prompt-composer-radius,18px)] bg-[var(--prompt-composer-face,var(--background))] p-[var(--prompt-composer-padding,0.5rem)] dark:bg-[var(--prompt-composer-face,var(--card))]",
  "[--line:rgb(0_0_0/0.1)] dark:[--line:rgb(255_255_255/0.1)]",
  "shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:shadow-[0_0_0_1px_var(--line),0_8px_24px_-12px_rgb(0_0_0/0.6)]",
  "hover:[--line:rgb(0_0_0/0.16)] dark:hover:[--line:rgb(255_255_255/0.16)]",
  "has-[textarea:focus-visible]:[--line:var(--ring)] has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/20",
  "data-dragging:[--line:color-mix(in_oklab,var(--foreground)_35%,transparent)]",
  "group-data-disabled/prompt-composer:opacity-60",
)

export const fieldLook = cn(
  "block w-full min-w-0 resize-none border-0 bg-transparent px-2 pt-1.5 pb-1 text-[length:var(--prompt-composer-font,14px)] leading-[1.45] text-[color:var(--prompt-composer-ink,var(--foreground))] outline-none",
  "min-h-[calc(1.45em+0.625rem)] max-h-[calc(var(--prompt-composer-rows,8)*1.45em+0.625rem)] overflow-y-auto [scrollbar-width:thin]",
  "placeholder:text-muted-foreground/80 disabled:cursor-not-allowed",
)

export const ghostIcon = "bg-none text-muted-foreground shadow-none hover:text-foreground dark:bg-none dark:shadow-none"

export const modelTrigger = cn(
  "h-8 w-auto max-w-44 shrink-0 gap-1 rounded-[9px] bg-transparent px-2.5 text-[13px] font-medium text-muted-foreground shadow-none dark:bg-transparent dark:shadow-none",
  "hover:bg-accent hover:text-foreground hover:shadow-none dark:hover:shadow-none data-open:bg-accent data-open:text-foreground data-open:shadow-none dark:data-open:shadow-none",
  "[&>svg:last-child]:size-3.5",
)

export const sendLook = cn(
  "size-8 shrink-0 cursor-pointer rounded-full bg-[var(--prompt-composer-send,var(--primary))] text-primary-foreground outline-none",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_1px_2px_rgb(0_0_0/0.22)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.5)]",
  "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--prompt-composer-send,var(--primary)),var(--background)_12%)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:cursor-not-allowed data-disabled:opacity-35 data-disabled:shadow-none",
  "[&_svg]:size-4",
)

export const dropLook =
  "grid place-items-center rounded-[inherit] outline-1 -outline-offset-[5px] outline-dashed outline-foreground/25 bg-[color-mix(in_oklab,var(--prompt-composer-face,var(--background))_88%,transparent)] backdrop-blur-[2px] dark:bg-[color-mix(in_oklab,var(--prompt-composer-face,var(--card))_88%,transparent)]"

/* ---- composing parts on one element ----
   React nests parts through `render` props (TooltipTrigger > FileInputTrigger > Button). In Vue a
   part binds to the root element of the component its props are spread on, and FileInputTrigger's root
   is a fragment (the button and its hidden input), with no element there. So the tooltip's and the
   trigger's props travel down without their `ref`, and the Button (one element) takes both refs. */
type Ref = ((el: unknown) => void) | undefined
export function withoutRef(props: Record<string, unknown>) {
  const { ref: _ref, ...rest } = props
  return rest
}
const chained = new WeakMap<object, unknown>()
/** One stable ref function that hands the element to each part's ref, for the innermost element. */
export function chainRefs(...refs: Ref[]) {
  const list = refs.filter((r): r is NonNullable<Ref> => typeof r === "function")
  let node: any = chained
  for (const r of list) {
    let next = node.get(r)
    if (!next) node.set(r, (next = new WeakMap()))
    node = next
  }
  let fn = node.fn as ((el: unknown) => void) | undefined
  if (!fn) node.fn = fn = (el: unknown) => list.forEach((r) => r(el))
  return fn
}
/** Click handlers from a part and our own, as one function (a part's `onClick` is a prop, not a list). */
export function withClick(props: Record<string, unknown>, own: (event: MouseEvent) => void) {
  const theirs = props.onClick as ((event: MouseEvent) => void) | undefined
  return { ...props, onClick: (event: MouseEvent) => (own(event), theirs?.(event)) }
}
