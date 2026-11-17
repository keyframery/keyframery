"use client"

/* Rows for the /create panel, in the same shape as the Customize panel under every component (a
   recessed well, name on the left, value on the right), drawn with Keyframery's own Select. These add
   what a theme picker needs: a swatch or a font sample beside each choice. */

import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/primitives/select"
import { rowStyles } from "@/lib/customize"
import { cn } from "@/lib/utils"

export type Choice<V extends string> = {
  value: V
  label: string
  /** CSS colours drawn as a swatch (one) or a strip (several). */
  swatch?: string[]
  /** A font-family to set the label in. */
  font?: string
  hint?: string
}

function Swatch({ colors, size = "md" }: { colors: string[]; size?: "sm" | "md" }) {
  if (colors.length > 1)
    return (
      <span aria-hidden className="flex h-3.5 overflow-hidden rounded-[4px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]">
        {colors.map((color, i) => (
          <span key={i} className={size === "sm" ? "w-2" : "w-2.5"} style={{ background: color }} />
        ))}
      </span>
    )
  return (
    <span
      aria-hidden
      className="size-3.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)]"
      style={{ background: colors[0] }}
    />
  )
}

export function ChoiceRow<V extends string>({
  id,
  label,
  value,
  choices,
  onChange,
}: {
  id: string
  label: string
  value: V
  choices: readonly Choice<V>[]
  onChange: (value: V) => void
}) {
  const current = choices.find((choice) => choice.value === value) ?? choices[0]
  return (
    <Select value={value} onValueChange={(next) => typeof next === "string" && onChange(next as V)}>
      <SelectTrigger data-control={id} aria-label={label} className={cn(rowStyles.well, rowStyles.focus, "cursor-pointer text-start")}>
        <span className={rowStyles.name}>{label}</span>
        <span className={cn(rowStyles.amount, "flex min-w-0 items-center gap-2 pe-2.5")}>
          {current.swatch ? <Swatch colors={current.swatch} size="sm" /> : null}
          <span className="truncate" style={current.font ? { fontFamily: current.font } : undefined}>
            {current.label}
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
        </span>
      </SelectTrigger>
      <SelectContent
        sideOffset={6}
        className={cn(
          "m-0 max-h-[min(var(--available-height),360px)] min-w-(--anchor-width) overflow-y-auto overscroll-contain border-0 p-1.5 outline-none",
          "rounded-[12px] bg-popover text-[13px] text-popover-foreground",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          "before:rounded-[8px] before:bg-accent",
        )}
      >
        {choices.map((choice) => (
          <SelectItem
            key={choice.value}
            value={choice.value}
            label={choice.label}
            className="relative flex h-8 cursor-default items-center gap-2.5 rounded-[8px] px-2 outline-none select-none data-highlighted:text-accent-foreground"
          >
            {choice.swatch ? <Swatch colors={choice.swatch} /> : null}
            <span className="truncate" style={choice.font ? { fontFamily: choice.font } : undefined}>
              {choice.label}
            </span>
            {choice.hint ? <span className="text-[12px] text-muted-foreground tabular-nums">{choice.hint}</span> : null}
            {choice.value === value ? <Check aria-hidden="true" className="ms-auto size-3.5 shrink-0" /> : <span className="ms-auto" />}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* A small heading inside the panel, with room for one action on the right. */
export function PanelHeading({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex h-7 items-center justify-between gap-3">
      <h2 className="text-[12px] font-medium tracking-[0.01em] text-muted-foreground">{children}</h2>
      {action}
    </div>
  )
}
