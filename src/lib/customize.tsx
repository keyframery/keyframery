"use client"

/* The Customize panel under a component's preview. Every control is one row of the same shape: a
   recessed well with its name on the left and its value on the right, drawn with Keyframery's own
   slider, switch, select and colour picker. Used by the docs site and the lab. See
   `@/lib/controls` for how a demo declares its controls. */

import { Check, ChevronsUpDown, RotateCcw } from "lucide-react"
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@/components/primitives/slider"
import { Button } from "@/components/ui/button"
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerInput,
  ColorPickerPopover,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerTrigger,
} from "@/components/ui/color-picker"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/primitives/select"
import { Switch } from "@/components/ui/switch"
import type { Control, Controls, ControlValue, ControlValues } from "@/lib/controls"
import { cn } from "@/lib/utils"

const words = (value: string) => value.replace(/[-_]+/g, " ").replace(/^./, (first) => first.toUpperCase())

const trim = (value: number) => String(Math.round(value * 100) / 100)

/* One row: a well the height of a field, the name inset 12px from the left, the value 12px from the right. */
const well = cn(
  "relative flex h-9 w-full items-center rounded-[10px] bg-muted text-[13px] leading-none outline-none select-none",
  "shadow-[inset_0_1px_1px_rgb(0_0_0/0.05),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
  "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
)
const focus = "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/60 focus-visible:ring-2 focus-visible:ring-ring/60"
const name = "pointer-events-none relative z-10 truncate ps-3 pe-2 text-muted-foreground"
const amount = "pointer-events-none relative z-10 ms-auto shrink-0 pe-3 font-medium text-foreground tabular-nums"

/* The row's parts, for panels that build their own rows in the same shape (the /create page). */
export const rowStyles = { well, focus, name, amount }

/* A slider you scrub: the whole row is the track, and the fill behind the words is the value. A
   thin grip shows at the fill's edge while the pointer or the keyboard is on it. */
export function PreviewSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <Slider
      data-control={id}
      aria-label={label}
      className={cn(well, focus, "group/scrub overflow-hidden")}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : (next as number))}
    >
      {/* UI SDK positions the track, the fill and the thumb itself, so the track only needs a size. */}
      <SliderControl className="absolute inset-0 cursor-ew-resize touch-pan-y">
        <SliderTrack className="block h-9 w-full">
          <SliderIndicator className="bg-foreground/[0.09] dark:bg-foreground/[0.11]" />
          <SliderThumb aria-label={label} className="h-4 w-[3px] rounded-full bg-foreground/60 opacity-0 group-hover/scrub:opacity-100 has-[:focus-visible]:opacity-100 data-dragging:opacity-100" />
        </SliderTrack>
      </SliderControl>
      <span className={name}>{label}</span>
      <span className={amount}>
        {trim(value)}
        {unit}
      </span>
    </Slider>
  )
}

export function PreviewSwitch({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label data-control={id} className={cn(well, focus, "cursor-pointer")}>
      <span className={cn(name, "pointer-events-auto")}>{label}</span>
      <span className="relative z-10 ms-auto flex shrink-0 items-center pe-2.5">
        <Switch aria-label={label} checked={checked} onCheckedChange={(next) => onChange(Boolean(next))} />
      </span>
    </label>
  )
}

export function PreviewSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => typeof next === "string" && onChange(next)}>
      <SelectTrigger data-control={id} aria-label={label} className={cn(well, focus, "cursor-pointer text-start")}>
        <span className={name}>{label}</span>
        <span className={cn(amount, "flex items-center gap-1.5 pe-2.5")}>
          {words(value)}
          <ChevronsUpDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
        </span>
      </SelectTrigger>
      <SelectContent
        sideOffset={6}
        className={cn(
          "m-0 max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto overscroll-contain border-0 p-1.5 outline-none",
          "rounded-[12px] bg-popover text-[13px] text-popover-foreground",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          "before:rounded-[8px] before:bg-accent",
        )}
      >
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            label={words(option)}
            className="relative flex h-8 cursor-default items-center justify-between gap-6 rounded-[8px] px-2 outline-none select-none data-highlighted:text-accent-foreground"
          >
            {words(option)}
            {option === value ? <Check aria-hidden="true" className="size-3.5" /> : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* A colour. "" means the component's own colour: the row then says Default and shows no swatch. */
export function PreviewColor({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <ColorPicker aria-label={label} value={value || "#3b82f6"} onValueChange={(next) => onChange(String(next))} format="hex">
      <ColorPickerPopover>
      <ColorPickerTrigger data-control={id} className={cn(well, focus, "cursor-pointer gap-0 p-0 text-start font-normal")}>
        <span className={name}>{label}</span>
        <span className={cn(amount, "flex items-center gap-2 pe-2.5 uppercase")}>
          {value ? (
            <>
              {value.replace("#", "")}
              <span aria-hidden="true" className="size-4 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)]" style={{ background: value }} />
            </>
          ) : (
            <span className="font-normal text-muted-foreground normal-case">Default</span>
          )}
        </span>
      </ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea>
          <ColorPickerAreaThumb />
        </ColorPickerArea>
        <ColorPickerSlider channel="hue">
          <ColorPickerSliderThumb />
        </ColorPickerSlider>
        <ColorPickerInput aria-label="Hex" />
      </ColorPickerContent>
      </ColorPickerPopover>
    </ColorPicker>
  )
}

export function PreviewInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label data-control={id} className={cn(well, focus, "cursor-text")}>
      <span className={cn(name, "shrink-0")}>{label}</span>
      <input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="relative z-10 h-full min-w-0 flex-1 bg-transparent pe-3 text-end font-medium text-foreground outline-none"
      />
    </label>
  )
}

function Row({ id, control, value, onChange }: { id: string; control: Control; value: ControlValue; onChange: (value: ControlValue) => void }) {
  if (control.type === "slider")
    return <PreviewSlider id={id} label={control.label} value={value as number} min={control.min} max={control.max} step={control.step} unit={control.unit} onChange={onChange} />
  if (control.type === "switch") return <PreviewSwitch id={id} label={control.label} checked={value as boolean} onChange={onChange} />
  if (control.type === "select") return <PreviewSelect id={id} label={control.label} value={value as string} options={control.options} onChange={onChange} />
  if (control.type === "color") return <PreviewColor id={id} label={control.label} value={value as string} onChange={onChange} />
  return <PreviewInput id={id} label={control.label} value={value as string} onChange={onChange} />
}

const grid = "grid gap-2 @lg:grid-cols-2 @2xl:grid-cols-3"

/* `speed` is the duration multiplier every Keyframery component takes as its `speed` prop: 1 leaves
   the motion style's own pace alone, 0.5 halves every duration, 2 doubles it. Every component gets it. */
export function Customize({
  controls,
  values,
  onChange,
  speed,
  onSpeedChange,
  onReset,
  className,
}: {
  controls: Controls | undefined
  values: ControlValues
  onChange: (name: string, value: ControlValue) => void
  speed: number
  onSpeedChange: (speed: number) => void
  onReset: () => void
  className?: string
}) {
  const entries = Object.entries(controls ?? {})
  const changed = speed !== 1 || entries.some(([key, control]) => (values[key] ?? control.default) !== control.default)
  return (
    <section aria-label="Customize" data-customize className={cn("@container", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold tracking-tight text-foreground">Customize</span>
          <span className="text-[12px] text-muted-foreground tabular-nums">{entries.length + 1} controls</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!changed}
          className="h-7 gap-1.5 rounded-[8px] px-2 text-[12px] text-muted-foreground"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Reset
        </Button>
      </div>
      <div className={cn(grid, "mt-3")}>
        {entries.map(([key, control]) => (
          <Row key={key} id={key} control={control} value={values[key] ?? control.default} onChange={(next) => onChange(key, next)} />
        ))}
        <PreviewSlider id="speed" label="Animation speed" value={Number((1 / speed).toFixed(2))} min={0.5} max={2.5} step={0.1} unit="×" onChange={(rate) => onSpeedChange(1 / rate)} />
      </div>
    </section>
  )
}
