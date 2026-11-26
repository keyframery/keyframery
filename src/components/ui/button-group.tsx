"use client"

export * from "@/components/primitives/button-group"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --button-group-face: Counter surface; default: bg-muted.
   --button-group-ink: Counter text; default: text-muted-foreground.
   --button-group-line: Separator; default: bg-border.
   --button-group-radius: Counter corners; default: rounded-[9px].
   --button-group-font: Counter size; default: text-[13px].
   --button-group-gap: Nested group gap; default: 0.5rem.
   --button-group-inset-x: Counter padding; default: px-3.
*/

/* Styled button group: the animated primitive plus the Keyframery look. Keyframery's Buttons (and
   Inputs, NativeSelects, menu triggers) placed inside join into one strip: shared hairlines, square
   inner corners, the outer corners kept. Groups inside a group sit apart with a gap. */

import * as React from "react"

import {
  ButtonGroup as ButtonGroupPrimitive,
  ButtonGroupSeparator as ButtonGroupSeparatorPrimitive,
  ButtonGroupText as ButtonGroupTextPrimitive,
} from "@/components/primitives/button-group"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function ButtonGroup({ speed, className, ...props }: React.ComponentProps<typeof ButtonGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ButtonGroupPrimitive
        className={withClass(
          cn(
            "flex w-fit items-stretch",
            "has-[>[data-slot=button-group]]:gap-[var(--button-group-gap,0.5rem)]",
            /* A focused or highlighted segment sits above its neighbours, so its ring is whole. */
            "[&>*]:focus-visible:z-10 [&>*:hover]:z-[5]",
            /* Joined segments keep one hairline between them, and only the outer corners. */
            "data-[orientation=horizontal]:[&>*:not([data-slot=button-group]):not(:first-child)]:-ms-px",
            "data-[orientation=horizontal]:[&>*:not([data-slot=button-group]):not(:first-child)]:rounded-s-none",
            "data-[orientation=horizontal]:[&>*:not([data-slot=button-group]):not(:last-child)]:rounded-e-none",
            "data-[orientation=vertical]:flex-col data-[orientation=vertical]:[&>*:not([data-slot=button-group])]:w-auto!",
            "data-[orientation=vertical]:[&>*:not([data-slot=button-group]):not(:first-child)]:-mt-px",
            "data-[orientation=vertical]:[&>*:not([data-slot=button-group]):not(:first-child)]:rounded-t-none",
            "data-[orientation=vertical]:[&>*:not([data-slot=button-group]):not(:last-child)]:rounded-b-none",
            /* A pressed segment sinks a little less than a lone button, so the strip stays joined.
               The sink scales with --kf-flourish. */
            "[&>[data-slot=button]:active]:scale-[calc(1-0.025*var(--kf-flourish,1))]!",
            "*:data-[slot=input]:flex-1 *:data-[slot=native-select]:min-w-0",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* Words or an icon that belong to the group, on a well: a unit, a currency, a label. */
function ButtonGroupText({ className, ...props }: React.ComponentProps<typeof ButtonGroupTextPrimitive>) {
  return (
    <ButtonGroupTextPrimitive
      className={withClass(
        cn(
          "flex shrink-0 items-center gap-[var(--button-group-gap,0.375rem)] rounded-[var(--button-group-radius,9px)] bg-[var(--button-group-face,var(--muted))] px-[var(--button-group-inset-x,0.75rem)] text-[length:var(--button-group-font,13px)] leading-none font-medium whitespace-nowrap text-[color:var(--button-group-ink,var(--muted-foreground))]",
          "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A hairline between segments, for a split button whose two halves share one surface. */
function ButtonGroupSeparator({ className, ...props }: React.ComponentProps<typeof ButtonGroupSeparatorPrimitive>) {
  return (
    <ButtonGroupSeparatorPrimitive
      className={withClass(
        cn(
          "bg-[var(--button-group-line,var(--border))]",
          "data-[orientation=vertical]:my-2 data-[orientation=vertical]:w-px data-[orientation=horizontal]:mx-2 data-[orientation=horizontal]:h-px",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
