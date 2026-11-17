import * as React from "react"

import {
  Form,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormStatus,
  FormSubmit,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export const meta = { name: "Form", group: "Forms" }

/* Sends the form empty (each field says what it needs), fills it in with an email that already has
   a booking (the server's answer lands on the email field), fixes the email, books, and starts over. */
export const play = [
  { wait: 700 },
  { click: '[data-play="send"]', wait: 1700 },
  { type: "Maya Okafor", into: '[data-play="name"]', wait: 500 },
  { type: "maya.okafor@gmail.com", into: '[data-play="email"]', wait: 500 },
  { type: "07700 900461", into: '[data-play="phone"]', wait: 700 },
  { click: '[data-play="send"]', wait: 2800 },
  { type: "maya@okafor.studio", into: '[data-play="email"]', wait: 900 },
  { click: '[data-play="send"]', wait: 3000 },
  { click: '[data-play="again"]', wait: 1200 },
]

export const controls = {
  phoneRequired: { type: "switch", label: "Phone required", default: true },
  resetOnSuccess: { type: "switch", label: "Clear on success", default: false },
  themeFace: { type: "color", label: "Submit surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Submit label", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Status colour", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Submit corners", min: 0, max: 24, step: 1, default: 10, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Submit size", min: 10, max: 20, step: 1, default: 13, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Form section gap", min: 4, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
  themeHeight: { type: "slider", label: "Submit height", min: 28, max: 52, step: 1, default: 36, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Submit padding", min: 8, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
} as const

const taken = "maya.okafor@gmail.com"

function speedOf(el: Element | null) {
  return (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
}

export default function FormDemo({
  phoneRequired = true,
  resetOnSuccess = false,
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 10,
  themeFont = 13,
  themeGap = 16,
  themeHeight = 36,
  themeInsetX = 16,
}: {
  phoneRequired?: boolean
  resetOnSuccess?: boolean
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themeHeight?: number
  themeInsetX?: number
}) {
  const root = React.useRef<HTMLDivElement>(null)

  /* Stands in for the letting agent's server. */
  const book = async (data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1100 * speedOf(root.current)))
    if (String(data.get("email")).trim().toLowerCase() === taken)
      return { errors: { email: "This email already has a viewing on Saturday. Use another, or reply to that confirmation." } }
    return { message: "Booked for Saturday 23 November at 11:00. Directions are on their way." }
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--form-face": themeFace } : null),
    ...(themeInk ? { "--form-ink": themeInk } : null),
    ...(themeMuted ? { "--form-muted": themeMuted } : null),
    ...(themeRadius !== 10 ? { "--form-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--form-font": `${themeFont}px` } : null),
    ...(themeGap !== 16 ? { "--form-gap": `${themeGap}px` } : null),
    ...(themeHeight !== 36 ? { "--form-height": `${themeHeight}px` } : null),
    ...(themeInsetX !== 16 ? { "--form-inset-x": `${themeInsetX}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} ref={root} className="@container w-full max-w-[420px]">
      <div className="rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)] @max-[24rem]:p-4">
        <div className="flex items-center gap-3">
          <img src="/demo/canal.jpg" alt="" className="size-12 shrink-0 rounded-[10px] bg-muted object-cover" />
          <div className="min-w-0">
            <div className="text-[15px] leading-tight font-semibold tracking-tight">Book a viewing</div>
            <div className="mt-1 truncate text-[12px] text-muted-foreground">Two-bed flat on the canal, Hackney Wick</div>
          </div>
        </div>

        <Form aria-label="Book a viewing" submit={book} resetOnSuccess={resetOnSuccess} className="mt-5">
          <div className="grid grid-cols-2 gap-3 @max-[24rem]:grid-cols-1">
            <FormItem name="name">
              <FormLabel>Full name</FormLabel>
              <Input data-play="name" autoComplete="name" required />
              <FormMessage match="valueMissing">Tell us who's coming.</FormMessage>
            </FormItem>
            <FormItem name="phone">
              <FormLabel>Phone</FormLabel>
              <Input data-play="phone" type="tel" autoComplete="tel" required={phoneRequired} />
              <FormMessage match="valueMissing">For the agent on the day.</FormMessage>
            </FormItem>
          </div>
          <FormItem name="email">
            <FormLabel>Email</FormLabel>
            <Input data-play="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            <FormDescription>We send the confirmation and directions here.</FormDescription>
            <FormMessage match="valueMissing">Enter an email for the confirmation.</FormMessage>
            <FormMessage match="typeMismatch">That doesn't look like an email address.</FormMessage>
            <FormMessage match="customError" />
          </FormItem>

          <div className="flex items-center gap-3 pt-1">
            <FormSubmit data-play="send" pendingLabel="Booking" successLabel="Booked">
              Book Saturday, 11:00
            </FormSubmit>
            <button
              type="reset"
              data-play="again"
              className="h-9 cursor-pointer rounded-[10px] px-3 text-[13px] font-medium text-muted-foreground outline-none transition-[color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Clear
            </button>
          </div>
          <FormStatus className="-mt-1" />
        </Form>
      </div>
    </div>
  )
}
