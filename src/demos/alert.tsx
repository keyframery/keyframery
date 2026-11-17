import { CircleAlert, Clock3 } from "lucide-react"
import * as React from "react"

import { Alert, AlertClose, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export const meta = { name: "Alert", group: "Feedback" }

/* The demo plays itself: checking in raises the alert (its icon pops and draws, the lines rise in
   after it), then it is dismissed and folds away. */
export const play = [
  { click: '[data-play="check-in"]', wait: 2800 },
  { click: '[data-slot="alert-close"]', wait: 1500 },
]

export const controls = {
  variant: { type: "select", label: "Variant", options: ["destructive", "default"], default: "destructive" },
  dismissible: { type: "switch", label: "Dismissible", default: true },
  themeFace: { type: "color", label: "Alert surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Alert text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Description", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Corners", min: 0, max: 32, step: 1, default: 14, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Body size", min: 10, max: 20, step: 1, default: 13, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Content gap", min: 0, max: 32, step: 1, default: 4, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Side padding", min: 0, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
  themeInsetY: { type: "slider", label: "Vertical padding", min: 0, max: 32, step: 1, default: 14, unit: "px", group: "Layout" },
} as const

const messages = {
  destructive: {
    icon: CircleAlert,
    title: "Your passport expires too soon",
    body: "Portugal needs three months left on it after you fly home. Yours ends on 2 January.",
  },
  default: {
    icon: Clock3,
    title: "Check-in opens tomorrow at 07:25",
    body: "We'll text +44 7700 900 412 the moment it does, so you can pick from the seats still free.",
  },
}

export default function AlertDemo({
  variant = "destructive",
  dismissible = true,
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 14,
  themeFont = 13,
  themeGap = 4,
  themeInsetX = 16,
  themeInsetY = 14,
}: {
  variant?: "destructive" | "default"
  dismissible?: boolean
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themeInsetX?: number
  themeInsetY?: number
}) {
  const [open, setOpen] = React.useState(true)
  const [round, setRound] = React.useState(0)
  const message = messages[variant]
  const Icon = message.icon

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--alert-face": themeFace } : null),
    ...(themeInk ? { "--alert-ink": themeInk } : null),
    ...(themeMuted ? { "--alert-muted": themeMuted } : null),
    ...(themeRadius !== 14 ? { "--alert-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--alert-font": `${themeFont}px` } : null),
    ...(themeGap !== 4 ? { "--alert-gap": `${themeGap}px` } : null),
    ...(themeInsetX !== 16 ? { "--alert-inset-x": `${themeInsetX}px` } : null),
    ...(themeInsetY !== 14 ? { "--alert-inset-y": `${themeInsetY}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[440px]">
      <div className="rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Frankfurt to Lisbon</div>
            <div className="mt-1 text-[12px] text-muted-foreground">LH 1172 · Thu 21 Nov · 07:25</div>
          </div>
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] leading-none font-medium text-muted-foreground">Economy</span>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-muted/60 px-3 py-2.5">
          <img src="/demo/face-2.jpg" alt="" className="size-8 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] leading-tight font-medium">Inês Carvalho</div>
            <div className="mt-0.5 text-[12px] leading-tight text-muted-foreground">Seat 14A · 1 bag</div>
          </div>
        </div>

        <Alert
          key={round}
          variant={variant}
          open={open}
          onOpenChange={setOpen}
          className="mt-3"
        >
          <Icon />
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>{message.body}</AlertDescription>
          {dismissible && <AlertClose />}
        </Alert>

        <div className="mt-4 flex flex-col-reverse gap-2 @[360px]:flex-row @[360px]:items-center @[360px]:justify-end">
          <Button variant="ghost">Update passport</Button>
          <Button
            variant="primary"
            data-play="check-in"
            onClick={() => {
              setOpen(true)
              setRound((r) => r + 1)
            }}
          >
            Check in
          </Button>
        </div>
      </div>
    </div>
  )
}
