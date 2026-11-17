import * as React from "react"

import { Button } from "@/components/ui/button"
import { createMotionStyle, MotionStyle, MotionStyleSwitcher } from "@/components/ui/motion-style"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"

export const meta = { name: "Motion Style", group: "Motion" }

/* In the lab the style stays inside this demo: a scoped preference, not saved, so the rest of the
   page keeps the style picked in the header. In an app, use `motionStyle` (the default), which
   goes on <html>. */
const demoMotion = createMotionStyle({ global: false, storageKey: null })

const item = (n: number) => `[aria-label="Motion style"] [data-slot="segmented-control-item"]:nth-of-type(${n})`

/* Cycles through the four styles; after each, the switch flips and the tabs jump, so you feel it. */
export const play = [
  { click: item(1), wait: 700 },
  { click: '[data-slot="switch"]', wait: 900 },
  { click: '[role="tab"]:nth-of-type(3)', wait: 1300 },
  { click: item(3), wait: 700 },
  { click: '[data-slot="switch"]', wait: 700 },
  { click: '[role="tab"]:nth-of-type(1)', wait: 1100 },
  { click: item(4), wait: 700 },
  { click: '[data-slot="switch"]', wait: 900 },
  { click: '[role="tab"]:nth-of-type(3)', wait: 1300 },
  { click: item(2), wait: 700 },
  { click: '[data-slot="switch"]', wait: 900 },
  { click: '[role="tab"]:nth-of-type(1)', wait: 1500 },
]

export const controls = {
  orientation: { type: "select", label: "Orientation", default: "horizontal", options: ["horizontal", "vertical"] },
  disabled: { type: "switch", label: "Disable switcher", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: true, group: "Behaviour" },
  required: {  type: "switch", label: "Required", default: false, group: "Behaviour"  },
  title: { type: "text", label: "Heading", default: "Focus hours" },
  description: { type: "text", label: "Description", default: "Silence notifications while you work" },
  saveLabel: { type: "text", label: "Save button", default: "Save" },
  today: { type: "text", label: "First schedule", default: "Today" },
  weekdays: { type: "text", label: "Second schedule", default: "Weekdays" },
  always: { type: "text", label: "Third schedule", default: "Every day" },
  width: { type: "slider", label: "Width", default: 380, min: 320, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Preview gap", default: 20, min: 8, max: 32, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Option height", default: 32, min: 28, max: 44, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Well corners", default: 12, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  keyRadius: { type: "slider", label: "Key corners", default: 9, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  track: { type: "color", label: "Well", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Selected key", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  selectedInk: { type: "color", label: "Selected text", default: "", group: "Colours" },
} as const

export default function MotionStyleDemo({
  orientation = "horizontal",
  disabled = false,
  readOnly = false,
  loop = true,
  required = false,
  title = "Focus hours",
  description = "Silence notifications while you work",
  saveLabel = "Save",
  today = "Today",
  weekdays = "Weekdays",
  always = "Every day",
  width = 380,
  gap = 20,
  height = 32,
  radius = 12,
  keyRadius = 9,
  track = "",
  keyColour = "",
  ink = "",
  selectedInk = "",
}: {
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  readOnly?: boolean
  loop?: boolean
  required?: boolean
  title?: string
  description?: string
  saveLabel?: string
  today?: string
  weekdays?: string
  always?: string
  width?: number
  gap?: number
  height?: number
  radius?: number
  keyRadius?: number
  track?: string
  keyColour?: string
  ink?: string
  selectedInk?: string
}) {
  const theme = {
    "--motion-style-height": `${height}px`,
    "--motion-style-radius": `${radius}px`,
    "--motion-style-key-radius": `${keyRadius}px`,
    ...(selectedInk ? { "--motion-style-selected-ink": selectedInk } : {}),
    ...(track ? { "--motion-style-track": track } : {}),
    ...(keyColour ? { "--motion-style-key": keyColour } : {}),
    ...(ink ? { "--motion-style-ink": ink } : {}),
  } as React.CSSProperties
  return (
    <MotionStyle preference={demoMotion}>
      <div style={{ ...theme, maxWidth: width, gap }} className="flex w-full max-w-[380px] flex-col items-center gap-5">
        <MotionStyleSwitcher preference={demoMotion} orientation={orientation} disabled={disabled} readOnly={readOnly} loop={loop} required={required} />
        <div className="w-full rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-tight">{title}</div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">{description}</div>
            </div>
            <Switch aria-label={title} />
          </div>
          <Tabs defaultValue="today" className="mt-5">
            <TabsList aria-label="Schedule">
              <TabsTab value="today">{today}</TabsTab>
              <TabsTab value="weekdays">{weekdays}</TabsTab>
              <TabsTab value="always">{always}</TabsTab>
            </TabsList>
          </Tabs>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">{saveLabel}</Button>
          </div>
        </div>
      </div>
    </MotionStyle>
  )
}
