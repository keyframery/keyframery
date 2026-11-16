"use client"

/* Styled keyboard keys: the animated primitive plus the Keyframery look. A small key with a 1px ledge
   under it; pressed, it sinks into the ledge and the face takes a soft inner shadow. */

import * as React from "react"

import { Kbd as KbdPrimitive, KbdCombo as KbdComboPrimitive } from "@/components/primitives/kbd"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

const key = cn(
  "h-6 min-w-6 items-center justify-center rounded-[6px] px-1.5 font-sans text-[12px] leading-none font-medium text-muted-foreground tabular-nums select-none",
  "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_0_0_rgb(0_0_0/0.1),inset_0_0_0_0_transparent]",
  "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_0_0_rgb(0_0_0/0.6),inset_0_1px_0_0_rgb(255_255_255/0.07)]",
  "data-pressed:bg-muted data-pressed:text-foreground data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_0_0_0_rgb(0_0_0/0.1),inset_0_1px_2px_0_rgb(0_0_0/0.12)]",
  "dark:data-pressed:bg-muted dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_0_0_rgb(0_0_0/0.6),inset_0_1px_3px_0_rgb(0_0_0/0.5)]",
)

function Kbd({ speed, className, ...props }: React.ComponentProps<typeof KbdPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <KbdPrimitive className={cn(key, className)} {...props} />
    </Speed>
  )
}

function KbdCombo({ className, kbdClassName, ...props }: React.ComponentProps<typeof KbdComboPrimitive>) {
  return <KbdComboPrimitive className={cn("gap-1", className)} kbdClassName={cn(key, kbdClassName)} {...props} />
}

export { Kbd, KbdCombo }
export { keyLabel } from "@/components/primitives/kbd"
