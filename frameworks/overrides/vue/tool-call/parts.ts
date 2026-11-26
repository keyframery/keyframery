/* The tool call's root, made from the shared core definition (the same file React uses), and the
   classes the React primitive and ui layers put on each part. The body is UI SDK's collapsible,
   controlled by the tool call's own `open`, so the card is one component to an agent. */
import { Collapsible } from "@ui-sdk/vue/collapsible"
import { type PrimitiveHandle, usePart, usePrimitive } from "@ui-sdk/vue/primitive"
import { defineComponent, h, inject, type InjectionKey, type PropType, provide } from "vue"

import { toolCall, type ToolCallStatus } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"

const keyframes = [
  "@keyframes kf-tool-call-in{from{opacity:0;translate:0 calc(8px*var(--kf-flourish,1));filter:blur(calc(4px*var(--kf-flourish,1)))}}",
  "@keyframes kf-tool-call-shimmer{from{background-position:100% 0}to{background-position:0% 0}}",
  "@keyframes kf-tool-call-tick{from{stroke-dashoffset:1}}",
  "@keyframes kf-tool-call-pop{from{scale:calc(1 - 0.6*var(--kf-flourish,1));opacity:0}}",
  "@keyframes kf-tool-call-label{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}",
].join("")
if (typeof document !== "undefined" && !document.getElementById("kf-tool-call")) {
  const style = document.createElement("style")
  style.id = "kf-tool-call"
  style.textContent = keyframes
  document.head.append(style)
}

/* The instance, for the parts that hand changes back to it (the collapsible's open). */
const handleKey: InjectionKey<PrimitiveHandle<typeof toolCall>> = Symbol("kf-tool-call")

/** The tool call around this part: its `state` and `api` (`setOpen`, `toggle`). */
export function useToolCall() {
  const handle = inject(handleKey, null)
  if (!handle) throw new Error("Tool call parts must be inside <ToolCall>.")
  return handle
}

/* The card rises in when it arrives. */
export const rootMotion =
  "group/tool-call animate-[kf-tool-call-in_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"

/* The primitive root: the tool call's instance, its element, and the collapsible inside it. Internal:
   ToolCall renders it. */
export const ToolCallRoot = defineComponent({
  name: "ToolCallRoot",
  inheritAttrs: false,
  props: {
    name: { type: String, default: undefined },
    title: { type: String, default: undefined },
    status: { type: String as PropType<ToolCallStatus>, default: undefined },
    input: { type: null as unknown as PropType<unknown>, required: false },
    output: { type: null as unknown as PropType<unknown>, required: false },
    error: { type: String, default: undefined },
    duration: { type: Number, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    openOnError: { type: Boolean, default: undefined },
  },
  emits: ["openChange", "update:open"],
  setup(props, { attrs, slots, emit }) {
    const handle = usePrimitive(toolCall, () => ({
      name: props.name,
      title: props.title,
      status: props.status,
      input: props.input,
      output: props.output,
      error: props.error,
      duration: props.duration,
      open: props.open,
      defaultOpen: props.defaultOpen,
      openOnError: props.openOnError,
      onOpenChange: (open: boolean, details: unknown) => {
        emit("openChange", open, details)
        emit("update:open", open)
      },
    }))
    provide(handleKey, handle)
    return usePart(handle, "root", () => ({}), () => ({ ...attrs, class: cn(rootMotion, attrs.class as string) }), {
      tag: "div",
      children: (state) =>
        h(
          Collapsible,
          {
            open: state.open,
            class: "contents",
            onOpenChange: (next: boolean, details?: { event?: Event }) => handle.api.setOpen(next, details?.event, "trigger-press"),
          },
          { default: () => slots.default?.({ state }) },
        ),
    })
  },
})

/* Primitive + ui classes, per part. */
export const toolCallClass = cn(
  "@container w-full min-w-0 overflow-hidden rounded-[var(--tool-call-radius,12px)] bg-[var(--tool-call-face,var(--card))] text-[length:var(--tool-call-font,13px)] text-card-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
  "has-[[data-slot=collapsible-trigger]:focus-visible]:ring-2 has-[[data-slot=collapsible-trigger]:focus-visible]:ring-ring has-[[data-slot=collapsible-trigger]:focus-visible]:ring-offset-2 has-[[data-slot=collapsible-trigger]:focus-visible]:ring-offset-background",
)

export const triggerClass = cn(
  "group/tool-call-trigger transition-[scale,background-color,color] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.01*var(--kf-flourish,1))] motion-reduce:transition-none!",
  cn(
    "flex h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 ps-3 pe-3 text-start outline-none select-none",
    "hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)] active:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]",
    "*:data-[slot=tool-call-chevron]:text-[color:var(--tool-call-muted,var(--muted-foreground))]",
  ),
)

/* The collapsible primitive's panel (height and cascade), then the ui look. */
export const contentClass = cn(
  cn(
    "h-(--collapsible-panel-height) overflow-hidden",
    "transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
    "data-starting-style:h-0 data-ending-style:h-0 data-ending-style:duration-[calc(260ms*var(--kf-speed,1))]",
    "*:transition-[opacity,translate,filter] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
    "*:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)*var(--kf-flourish,1))+calc(40ms*var(--kf-speed,1)*var(--kf-flourish,1)))]",
    "data-starting-style:*:translate-y-[calc(0.5rem*var(--kf-flourish,1))] data-starting-style:*:opacity-0 data-starting-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-starting-style:*:transition-none",
    "data-ending-style:*:opacity-0 data-ending-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-ending-style:*:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:*:ease-house data-ending-style:*:[transition-delay:0ms]",
    "motion-reduce:transition-none! motion-reduce:*:transition-none",
  ),
  cn(
    "min-w-0 shadow-[inset_0_1px_0_rgb(0_0_0/0.06)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]",
    "flex flex-col gap-3 *:first:mt-3 *:last:mb-3",
  ),
)

export const iconClass = cn(
  "grid size-4 shrink-0 place-items-center text-[color:var(--tool-call-ink,var(--foreground))] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  "[&_[data-mark=done]]:text-[color:var(--tool-call-success,oklch(0.62_0.16_150))]",
  "[&_[data-mark=error]]:text-[color:var(--tool-call-error,var(--destructive))]",
  "[&_[data-mark=denied]]:text-[color:var(--tool-call-muted,var(--muted-foreground))] [&_[data-mark=pending]]:text-[color:var(--tool-call-muted,var(--muted-foreground))]",
)

/* The light runs across a running title. Its colour is the text's own, so it works on any theme. */
export const titleClass = cn(
  cn(
    "group-data-[status=running]/tool-call:bg-[linear-gradient(90deg,currentColor_0%,currentColor_38%,color-mix(in_oklch,currentColor_30%,transparent)_50%,currentColor_62%,currentColor_100%)]",
    "group-data-[status=running]/tool-call:bg-[length:250%_100%] group-data-[status=running]/tool-call:bg-clip-text group-data-[status=running]/tool-call:[-webkit-text-fill-color:transparent]",
    "group-data-[status=running]/tool-call:animate-[kf-tool-call-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
    "motion-reduce:animate-none! motion-reduce:bg-none! motion-reduce:[-webkit-text-fill-color:currentColor]!",
  ),
  cn(
    "min-w-0 truncate leading-[1.35] font-medium text-[color:var(--tool-call-ink,var(--foreground))]",
    "group-data-[status=pending]/tool-call:text-[color:var(--tool-call-muted,var(--muted-foreground))] group-data-[status=denied]/tool-call:text-[color:var(--tool-call-muted,var(--muted-foreground))]",
  ),
)

export const nameClass =
  "min-w-0 shrink-[2] truncate rounded-[5px] @max-[24rem]:hidden bg-[color-mix(in_oklab,var(--muted)_80%,transparent)] px-1.5 py-[3px] font-mono text-[11px] leading-none text-[color:var(--tool-call-muted,var(--muted-foreground))]"

export const statusClass = cn(
  "inline-grid",
  cn(
    "text-[12px] leading-none font-medium whitespace-nowrap text-[color:var(--tool-call-muted,var(--muted-foreground))]",
    "data-[status=error]:text-[color:var(--tool-call-error,var(--destructive))]",
    "in-data-[slot=badge]:text-[length:inherit] in-data-[slot=badge]:text-[color:inherit]",
  ),
)

export const statusLabelClass =
  "col-start-1 row-start-1 animate-[kf-tool-call-label_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"

export const durationClass = "text-[12px] leading-none whitespace-nowrap text-[color:var(--tool-call-muted,var(--muted-foreground))] tabular-nums"

export const sectionClass = "flex min-w-0 flex-col gap-1.5 px-3"

export const labelClass = "text-[11.5px] leading-none font-medium text-[color:var(--tool-call-muted,var(--muted-foreground))]"

export const markPop =
  "animate-[kf-tool-call-pop_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"
