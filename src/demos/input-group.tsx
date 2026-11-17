import { ArrowUp, Paperclip, TicketPercent } from "lucide-react"
import * as React from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupCount,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export const meta = { name: "Input Group", group: "Forms" }

const note = "Hi Marta! We land in Ljubljana at 21:10, so we'll reach the cabin around 22:30. Is late check-in okay?"

/* Types a value a few characters at a time, so the count rolls as it grows. */
function typeOut(into: string, text: string, every = 6, wait = 70) {
  const steps = []
  for (let i = every; i < text.length + every; i += every) steps.push({ type: text.slice(0, i), into, wait })
  return steps
}

/* The demo plays itself: focus lands in the note and the ring closes in, the note is typed so the count
   rolls and the send button pops in, then a promo code brings its Apply button. */
export const play = [
  { click: '[data-slot="input-group"]:has(textarea) [data-align="block-end"]', wait: 600 },
  ...typeOut("textarea", note),
  { wait: 900 },
  { click: '[data-slot="input-group"]:has(input) [data-align="inline-start"]', wait: 500 },
  ...typeOut("input", "BLED-SPRING", 2, 90),
  { wait: 1200 },
  { type: "", into: "input", wait: 500 },
  { type: "", into: "textarea", wait: 1200 },
]

export const controls = {
  count: { type: "select", label: "Count", options: ["used", "left"], default: "used" },
  invalid: { type: "switch", label: "Invalid code", default: false },
  disabled: { type: "switch", label: "Disabled", default: false },
  themeFace: { type: "color", label: "Field surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Field text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Addon text", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Field corners", min: 0, max: 20, step: 1, default: 10, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Input size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeHeight: { type: "slider", label: "Input height", min: 28, max: 52, step: 1, default: 36, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Side padding", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
} as const

export default function InputGroupDemo({
  count = "used",
  invalid = false,
  disabled = false,
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 10,
  themeFont = 13,
  themeHeight = 36,
  themeInsetX = 12,
}: {
  count?: "used" | "left"
  invalid?: boolean
  disabled?: boolean
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeHeight?: number
  themeInsetX?: number
}) {
  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--input-group-face": themeFace } : null),
    ...(themeInk ? { "--input-group-ink": themeInk } : null),
    ...(themeMuted ? { "--input-group-muted": themeMuted } : null),
    ...(themeRadius !== 10 ? { "--input-group-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--input-group-font": `${themeFont}px` } : null),
    ...(themeHeight !== 36 ? { "--input-group-height": `${themeHeight}px` } : null),
    ...(themeInsetX !== 12 ? { "--input-group-inset-x": `${themeInsetX}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[460px] rounded-[18px] bg-background p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-center gap-3">
        <img src="/demo/lake.jpg" alt="" className="h-12 w-16 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium tracking-tight">Larch cabin above Lake Bled</div>
          <div className="mt-1 truncate text-[12px] text-muted-foreground">14 to 17 May, hosted by Marta</div>
        </div>
        <img src="/demo/face-4.jpg" alt="Marta" className="size-8 shrink-0 rounded-full bg-muted object-cover" />
      </div>

      <InputGroup className="mt-4" aria-label="Message to Marta">
        <InputGroupTextarea
          aria-label="Message to Marta"
          placeholder="Ask Marta about check-in, parking or the sauna"
          maxLength={280}
          disabled={disabled}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-xs" aria-label="Attach a file" disabled={disabled}>
            <Paperclip />
          </InputGroupButton>
          <InputGroupCount show={count} className="ms-auto" />
          <InputGroupButton size="icon-xs" variant="primary" aria-label="Send" data-show="filled" className="rounded-full">
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <div className="mt-3 flex flex-col gap-1.5">
        <InputGroup aria-label="Promo code">
          <InputGroupAddon align="inline-start">
            <TicketPercent />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Promo code"
            placeholder="Promo code"
            autoComplete="off"
            spellCheck={false}
            className="uppercase placeholder:normal-case"
            aria-invalid={invalid || undefined}
            disabled={disabled}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="default" data-show="filled">
              Apply
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {invalid ? <p className="ps-1 text-[11.5px] leading-4 text-destructive">That code ended on 30 April</p> : null}
      </div>
    </div>
  )
}
