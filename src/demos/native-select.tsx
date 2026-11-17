import * as React from "react"

import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"

export const meta = { name: "Native Select", group: "Forms" }

/* The demo plays itself: picking a saved address fills both selects, and each new choice rises in. */
export const play = [
  { click: '[data-address="studio"]', wait: 1800 },
  { click: '[data-address="home"]', wait: 1800 },
  { click: '[data-address="parents"]', wait: 1800 },
]

export const controls = {
  size: { type: "select", label: "Size", options: ["default", "sm"], default: "default" },
  invalid: { type: "switch", label: "Invalid", default: false },
  disabled: { type: "switch", label: "Disabled", default: false },
  themeFace: { type: "color", label: "Field surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Selected value", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Placeholder and arrow", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Field corners", min: 0, max: 20, step: 1, default: 10, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Value size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeHeight: { type: "slider", label: "Field height", min: 28, max: 52, step: 1, default: 36, unit: "px", group: "Layout" },
  themeInsetStart: { type: "slider", label: "Start padding", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
} as const

const addresses = [
  { id: "home", label: "Home", city: "Bristol", country: "gb", delivery: "standard" },
  { id: "studio", label: "Studio", city: "Lisbon", country: "pt", delivery: "express" },
  { id: "parents", label: "Mum's", city: "Galway", country: "ie", delivery: "collect" },
]

const deliveries: Record<string, { label: string; price: string }> = {
  standard: { label: "Standard, 3 to 5 days", price: "£4.50" },
  express: { label: "Express, next working day", price: "£9.00" },
  collect: { label: "Collect from the Bristol studio", price: "Free" },
}

export default function NativeSelectDemo({
  size = "default",
  invalid = false,
  disabled = false,
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 10,
  themeFont = 13,
  themeHeight = 36,
  themeInsetStart = 12,
}: {
  size?: "default" | "sm"
  invalid?: boolean
  disabled?: boolean
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeHeight?: number
  themeInsetStart?: number
}) {
  const [address, setAddress] = React.useState("home")
  const [country, setCountry] = React.useState("gb")
  const [delivery, setDelivery] = React.useState("standard")

  const use = (id: string) => {
    const saved = addresses.find((a) => a.id === id)!
    setAddress(id)
    setCountry(saved.country)
    setDelivery(saved.delivery)
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--native-select-face": themeFace } : null),
    ...(themeInk ? { "--native-select-ink": themeInk } : null),
    ...(themeMuted ? { "--native-select-muted": themeMuted } : null),
    ...(themeRadius !== 10 ? { "--native-select-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--native-select-font": `${themeFont}px` } : null),
    ...(themeHeight !== 36 ? { "--native-select-height": `${themeHeight}px` } : null),
    ...(themeInsetStart !== 12 ? { "--native-select-inset-start": `${themeInsetStart}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[440px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-center gap-3">
        <img src="/demo/cup.jpg" alt="" className="size-12 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium tracking-tight">Speckled stoneware mugs, set of two</div>
          <div className="mt-1 text-[12px] text-muted-foreground">Fern &amp; Kiln, Bristol</div>
        </div>
        <span className="text-[13px] font-medium tabular-nums">£38.00</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-[12px] text-muted-foreground @max-[22rem]:hidden">Send to</span>
        {addresses.map((a) => (
          <button
            key={a.id}
            type="button"
            data-address={a.id}
            aria-pressed={address === a.id}
            onClick={() => use(a.id)}
            className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[12px] leading-none font-medium text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.08)] outline-none transition-[color,background-color,box-shadow,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96] aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:shadow-none dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] motion-reduce:transition-none"
          >
            {a.label}
            <span className="font-normal opacity-70">{a.city}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 @[400px]:grid-cols-[1fr_1.35fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="kf-ns-country">Country</Label>
          <NativeSelect
            id="kf-ns-country"
            value={country}
            onValueChange={setCountry}
            size={size}
            disabled={disabled}
            wrapperClassName="w-full"
          >
            <NativeSelectOptGroup label="Most orders">
              <NativeSelectOption value="gb">United Kingdom</NativeSelectOption>
              <NativeSelectOption value="ie">Ireland</NativeSelectOption>
            </NativeSelectOptGroup>
            <NativeSelectOptGroup label="Europe">
              <NativeSelectOption value="fr">France</NativeSelectOption>
              <NativeSelectOption value="de">Germany</NativeSelectOption>
              <NativeSelectOption value="nl">Netherlands</NativeSelectOption>
              <NativeSelectOption value="pt">Portugal</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="kf-ns-delivery">Delivery</Label>
          <NativeSelect
            id="kf-ns-delivery"
            value={delivery}
            onValueChange={setDelivery}
            size={size}
            disabled={disabled}
            invalid={invalid}
            wrapperClassName="w-full"
          >
            {Object.entries(deliveries).map(([value, d]) => (
              <NativeSelectOption key={value} value={value}>
                {d.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {invalid ? <p className="text-[11.5px] leading-4 text-destructive">Not available for this postcode yet</p> : null}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[13px]">
        <span className="text-muted-foreground">Delivery</span>
        <span className="font-medium tabular-nums">{deliveries[delivery].price}</span>
      </div>
    </div>
  )
}
