/* UI SDK parts for kbd, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { kbd, kbdCombo } from "@/components/keyframery/core/kbd-core"
import { cn } from "@/lib/utils"

export const { Root: KbdRoot } = createParts(kbd, { root: "kbd" })
export const { Root: KbdComboRoot } = createParts(kbdCombo, { root: "span" })

/* Press: sinks fast, pops back with a little overshoot. The shrink scales with --kf-flourish; the 1px
   sink stays. */
export const kbdMotion = cn(
  "inline-flex origin-bottom",
  "transition-[translate,scale,box-shadow,background-color] duration-[calc(320ms*var(--kf-speed,1))] ease-pop",
  "data-pressed:translate-y-px data-pressed:scale-[calc(1-0.07*var(--kf-flourish,1))] data-pressed:duration-[calc(90ms*var(--kf-speed,1))] data-pressed:ease-house",
  "motion-reduce:transition-none!",
)

/* The Keyframery look. Theming: --kbd-face, --kbd-ink, --kbd-size, --kbd-radius, --kbd-font. */
export const kbdKey = cn(
  "h-[var(--kbd-size,1.5rem)] min-w-[var(--kbd-size,1.5rem)] items-center justify-center rounded-[var(--kbd-radius,6px)] px-1.5 font-sans text-[length:var(--kbd-font,12px)] leading-none font-medium text-[color:var(--kbd-ink,var(--muted-foreground))] tabular-nums select-none",
  "bg-[var(--kbd-face,var(--background))] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_0_0_rgb(0_0_0/0.1),inset_0_0_0_0_transparent]",
  "dark:bg-[var(--kbd-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_0_0_rgb(0_0_0/0.6),inset_0_1px_0_0_rgb(255_255_255/0.07)]",
  "data-pressed:bg-[color-mix(in_oklab,var(--kbd-face,var(--muted)),var(--foreground)_6%)] data-pressed:text-[color:var(--kbd-ink,var(--foreground))] data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_0_0_0_rgb(0_0_0/0.1),inset_0_1px_2px_0_rgb(0_0_0/0.12)]",
  "dark:data-pressed:bg-[color-mix(in_oklab,var(--kbd-face,var(--muted)),var(--foreground)_6%)] dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_0_0_rgb(0_0_0/0.6),inset_0_1px_3px_0_rgb(0_0_0/0.5)]",
)
