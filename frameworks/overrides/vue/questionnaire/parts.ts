/* Shared pieces of the Vue questionnaire: the instance and item name handed down, the motion and
   look classes (the React primitive's, then the React ui layer's) and the digit roll. The behaviour
   is the shared core definition (the same file React uses). */
import { h, inject, type InjectionKey } from "vue"
import type { PrimitiveHandle } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"

const keyframes = "@keyframes kf-questionnaire-error{from{opacity:0;translate:0 -4px;filter:blur(calc(3px*var(--kf-flourish,1)))}}"
if (typeof document !== "undefined" && !document.getElementById("kf-questionnaire")) {
  const style = document.createElement("style")
  style.id = "kf-questionnaire"
  style.textContent = keyframes
  document.head.append(style)
}

/* The instance, for the parts that render one of UI SDK's own controls and hand its changes back:
   the radio group's value-change calls the questionnaire's `answer`. Behaviour stays in core. */
export const handleKey: InjectionKey<PrimitiveHandle<typeof questionnaire>> = Symbol("kf-questionnaire")
export function useQuestionnaire() {
  const handle = inject(handleKey, null)
  if (!handle) throw new Error("Questionnaire parts must be inside <Questionnaire>.")
  return handle
}

/* The item's name, for the parts inside it (passed down explicitly, like the React primitive). */
export const itemKey: InjectionKey<() => string> = Symbol("kf-questionnaire-item")
export function useItemName(part: string) {
  const name = inject(itemKey, null)
  if (!name) throw new Error(`${part} must be inside <QuestionnaireItem>.`)
  return name
}

export const rootClass = "flex w-full min-w-0 flex-col gap-[var(--questionnaire-gap,1.25rem)]"

export const progressClass = cn(
  "after:origin-left after:[scale:var(--questionnaire-progress,0)_1] rtl:after:origin-right",
  "after:transition-[scale] after:duration-[calc(620ms*var(--kf-speed,1))] after:ease-spring motion-reduce:after:transition-none",
  "relative pb-3 text-[12px] leading-[1.2] font-medium text-[color:var(--questionnaire-muted,var(--muted-foreground))] tabular-nums",
  "before:absolute before:inset-x-0 before:bottom-0 before:h-[3px] before:rounded-full before:bg-muted before:content-['']",
  "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-[var(--questionnaire-accent,var(--primary))] after:content-['']",
)

export const itemsClass = "grid min-w-0 [&>*]:[grid-area:1/1]"

/* Direction and Cascade. Outside QuestionnaireItems an inactive item is simply hidden. */
export const itemClass = cn(
  "min-w-0 not-data-active:hidden in-data-[slot=questionnaire-items]:not-data-active:block",
  "transition-[opacity,translate,filter,visibility] duration-[calc(480ms*var(--kf-speed,1))] ease-spring",
  "data-[position=after]:invisible data-[position=after]:translate-x-[calc(2rem*var(--kf-flourish,1))] data-[position=after]:opacity-0 data-[position=after]:blur-[calc(6px*var(--kf-flourish,1))]",
  "data-[position=before]:invisible data-[position=before]:-translate-x-[calc(2rem*var(--kf-flourish,1))] data-[position=before]:opacity-0 data-[position=before]:blur-[calc(6px*var(--kf-flourish,1))]",
  "not-data-active:duration-[calc(220ms*var(--kf-speed,1))] not-data-active:ease-house",
  "rtl:data-[position=after]:-translate-x-[calc(2rem*var(--kf-flourish,1))] rtl:data-[position=before]:translate-x-[calc(2rem*var(--kf-flourish,1))]",
  "*:transition-[opacity,translate,filter] *:duration-[calc(460ms*var(--kf-speed,1))] *:ease-spring",
  "data-active:*:[transition-delay:calc(((min(sibling-index(),8)-1)*calc(45ms*var(--kf-speed,1))+calc(70ms*var(--kf-speed,1)))*var(--kf-flourish,1))]",
  "not-data-active:*:translate-y-[calc(0.5rem*var(--kf-flourish,1))] not-data-active:*:opacity-0 not-data-active:*:blur-[calc(4px*var(--kf-flourish,1))] not-data-active:*:duration-[calc(160ms*var(--kf-speed,1))]",
  "motion-reduce:transition-none! motion-reduce:*:transition-none!",
  "m-0 min-w-0 border-0 p-0 outline-none",
)

export const titleClass = "float-left mb-1 w-full p-0 text-[15px] leading-snug font-semibold tracking-tight text-pretty"
export const descriptionClass =
  "clear-left text-[length:var(--questionnaire-font,13px)] leading-snug text-pretty text-[color:var(--questionnaire-muted,var(--muted-foreground))]"
export const choicesClass = "clear-left mt-4 min-w-0"

/* The primitive radio group's gliding ring, anchored to the chosen row. */
export const radioGroupMotion = cn(
  "relative isolate [anchor-scope:--kf-radio] [--kf-radio-pad:5px]",
  "before:pointer-events-none before:absolute before:-z-10 before:rounded-full before:content-['']",
  "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
  "before:[position-anchor:--kf-radio]",
  "before:top-[calc(anchor(top)-var(--kf-radio-pad))] before:right-[calc(anchor(right)-var(--kf-radio-pad))]",
  "before:bottom-[calc(anchor(bottom)-var(--kf-radio-pad))] before:left-[calc(anchor(left)-var(--kf-radio-pad))]",
  "before:transition-[top,right,bottom,left,opacity] before:duration-[calc(460ms*var(--kf-speed,1))] before:ease-spring",
  "not-has-data-checked:before:opacity-0",
  "motion-reduce:before:transition-none!",
)
export const radioGlide =
  "[&_[data-slot=questionnaire-choice][data-checked]]:[anchor-name:--kf-radio] [&_[data-slot=radio]]:data-checked:[anchor-name:none]"
export const groupClass = cn(
  "grid gap-2 outline-none [--kf-radio-pad:0px]",
  "before:z-10 before:rounded-[var(--questionnaire-radius,12px)] before:bg-transparent before:shadow-[0_0_0_1.5px_var(--questionnaire-accent,var(--primary))]",
)

export const choiceClass = cn(
  "transition-[scale] duration-[calc(240ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.015*var(--kf-flourish,1))] motion-reduce:transition-none!",
  "relative flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--questionnaire-radius,12px)] bg-[var(--questionnaire-face,var(--background))] px-[var(--questionnaire-inset-x,0.75rem)] py-2.5 text-[length:var(--questionnaire-font,13px)] select-none",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-[var(--questionnaire-face,var(--card))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
  "transition-[box-shadow,background-color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
  "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.15),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.15)]",
  "data-checked:bg-[color-mix(in_oklab,var(--background),var(--foreground)_2.5%)] dark:data-checked:bg-accent/60",
  "data-[type=checkbox]:data-checked:shadow-[0_0_0_1.5px_var(--questionnaire-accent,var(--primary))]",
  "data-invalid:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_55%,transparent)]",
  "*:data-[slot=questionnaire-choice-label]:flex *:data-[slot=questionnaire-choice-label]:min-w-0 *:data-[slot=questionnaire-choice-label]:flex-1 *:data-[slot=questionnaire-choice-label]:flex-col *:data-[slot=questionnaire-choice-label]:gap-1 *:data-[slot=questionnaire-choice-label]:leading-snug",
  "*:data-[slot=questionnaire-choice-shortcut]:ms-auto *:data-[slot=questionnaire-choice-shortcut]:grid *:data-[slot=questionnaire-choice-shortcut]:size-5 *:data-[slot=questionnaire-choice-shortcut]:shrink-0 *:data-[slot=questionnaire-choice-shortcut]:place-items-center *:data-[slot=questionnaire-choice-shortcut]:rounded-[5px]",
  "*:data-[slot=questionnaire-choice-shortcut]:font-sans *:data-[slot=questionnaire-choice-shortcut]:text-[10.5px] *:data-[slot=questionnaire-choice-shortcut]:font-medium *:data-[slot=questionnaire-choice-shortcut]:text-[color:var(--questionnaire-muted,var(--muted-foreground))]",
  "*:data-[slot=questionnaire-choice-shortcut]:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_0_rgb(0_0_0/0.08)] dark:*:data-[slot=questionnaire-choice-shortcut]:shadow-[0_0_0_1px_rgb(255_255_255/0.12)]",
  "data-checked:*:data-[slot=questionnaire-choice-shortcut]:text-foreground",
)

export const errorClass = cn(
  "animate-[kf-questionnaire-error_calc(380ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
  "mt-2.5 text-[12.5px] text-destructive",
)
export const actionsClass = "flex min-h-9 items-center justify-end gap-2 *:data-[slot=questionnaire-previous]:*:me-auto"
export const actionClass = "contents data-hidden:hidden"

/* Roll: each digit is a column of 0 to 9 that slides to its value. */
export function roll(value: number) {
  return h("span", { class: "inline-flex h-[1lh] overflow-hidden align-top tabular-nums" }, [
    h("span", { class: "sr-only" }, String(value)),
    ...String(value)
      .split("")
      .map((digit, index) =>
        h(
          "span",
          {
            key: index,
            "aria-hidden": "true",
            style: { "--d": Number(digit) },
            class:
              "flex flex-col [translate:0_calc(var(--d)*-1lh)] transition-[translate] duration-[calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring motion-reduce:transition-none",
          },
          Array.from({ length: 10 }, (_, d) => h("span", { key: d, class: "h-[1lh]" }, String(d))),
        ),
      ),
  ])
}

/* Button's arrow (React's ButtonArrow), drawn on hover through the button's --kf-nudge. */
export function buttonArrow() {
  return h(
    "svg",
    {
      "data-slot": "button-arrow",
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      class: "overflow-visible",
    },
    [
      h("path", {
        d: "M3.5 8h8",
        pathLength: 1,
        class:
          "[stroke-dasharray:1] [stroke-dashoffset:calc(1-var(--kf-nudge,0)*var(--kf-flourish,1))] opacity-[calc(var(--kf-nudge,0)*var(--kf-flourish,1))] [transition:stroke-dashoffset_calc(320ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(120ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[transition:none]!",
      }),
      h("path", {
        d: "M8 4.5 11.5 8 8 11.5",
        class: "[translate:calc(var(--kf-nudge,0)*var(--kf-flourish,1)*3px-2.5px)_0] [transition:translate_calc(320ms*var(--kf-speed,1))_var(--ease-spring)] motion-reduce:[transition:none]!",
      }),
    ],
  )
}
