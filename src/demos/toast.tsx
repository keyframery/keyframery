import * as React from "react"

import { createToaster, ToastRegion } from "@/components/ui/toast"

export const meta = { name: "Toast", group: "Overlays" }

/* The demo plays itself: a toast springs in, then another stacks on it; hovering spreads the
   stack, and an error arrives on top. */
export const play = [
  { click: '[data-play="save"]', wait: 1300 },
  { click: '[data-play="remove"]', wait: 1300 },
  { hover: '[data-slot="toast-region"]', wait: 1400 },
  { unhover: '[data-slot="toast-region"]', wait: 900 },
  { click: '[data-play="book"]', wait: 2600 },
]

const key =
  "inline-flex h-8 cursor-pointer items-center gap-2 rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none " +
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] " +
  "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] " +
  "transition-[scale,translate] duration-[calc(100ms*var(--kf-speed,1))] ease-house active:translate-y-px active:scale-[0.985] motion-reduce:transition-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const controls = {
  side: { type: "select", label: "Side", options: ["top", "bottom"], default: "bottom" },
  align: { type: "select", label: "Align", options: ["start", "center", "end"], default: "end" },
  variant: { type: "select", label: "Variant", options: ["original", "default", "success", "info", "warning", "error", "loading"], default: "original" },
  expanded: { type: "switch", label: "Expanded", default: false, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  showAction: { type: "switch", label: "Show action", default: true, group: "Behaviour" },
  actionDismiss: { type: "switch", label: "Action dismiss", default: true, group: "Behaviour" },
  maxVisible: { type: "slider", label: "Visible toasts", min: 1, max: 5, step: 1, default: 3, unit: "", group: "Layout" },
  items: { type: "slider", label: "Toasts per click", min: 1, max: 3, step: 1, default: 1, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "The Zetter, Clerkenwell" },
  savedTitle: { type: "text", label: "Saved title", default: "Saved to London trip" },
  savedDescription: { type: "text", label: "Saved description", default: "The Zetter, Clerkenwell" },
  width: { type: "slider", label: "Toast width", min: 280, max: 480, step: 1, default: 360, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 4, max: 20, step: 1, default: 12, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 28, step: 1, default: 14, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Padding", min: 6, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  actionHeight: { type: "slider", label: "Action height", min: 24, max: 40, step: 1, default: 28, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export default function ToastDemo({
  side = "bottom",
  align = "end",
  variant = "original",
  expanded = false,
  dismissible = true,
  showAction = true,
  actionDismiss = true,
  maxVisible = 3,
  items = 1,
  title = "The Zetter, Clerkenwell",
  savedTitle = "Saved to London trip",
  savedDescription = "The Zetter, Clerkenwell",
  width = 360,
  gap = 12,
  radius = 14,
  padding = 12,
  actionHeight = 28,
  face = "",
  ink = "",
  accent = "",
}: {
  side?: "top" | "bottom"
  align?: "start" | "center" | "end"
  variant?: "original" | "default" | "success" | "info" | "warning" | "error" | "loading"
  expanded?: boolean
  dismissible?: boolean
  showAction?: boolean
  actionDismiss?: boolean
  maxVisible?: number
  items?: number
  title?: string
  savedTitle?: string
  savedDescription?: string
  width?: number
  gap?: number
  radius?: number
  padding?: number
  actionHeight?: number
  face?: string
  ink?: string
  accent?: string
} = {}) {
  const theme = {
    "--toast-width": `${width}px`,
    "--toast-gap": `${gap}px`,
    "--toast-radius": `${radius}px`,
    "--toast-padding": `${padding}px`,
    "--toast-action-height": `${actionHeight}px`,
    ...(face ? { "--toast-face": face } : {}),
    ...(ink ? { "--toast-ink": ink } : {}),
    ...(accent ? { "--toast-accent": accent } : {}),
  } as React.CSSProperties
  const [toast] = React.useState(() => createToaster())
  React.useEffect(() => () => void toast.dismiss(), [toast])
  const send = (kind: "default" | "success" | "error", message: string, options: { description: string; action?: { label: string; onAction: () => void; dismiss?: boolean } }) => {
    for (let i = 0; i < items; i++) toast(message, { ...options, type: variant === "original" ? kind : variant, dismissible })
  }

  return (
    <div className="flex w-full max-w-[380px] flex-col items-center gap-5 text-center">
      <div>
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <div className="mt-1 text-[13px] text-muted-foreground">3 nights from Friday, €412</div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className={key}
          data-play="save"
          onClick={() =>
            send("success", savedTitle, { description: savedDescription })
          }
        >
          Save to trip
        </button>
        <button
          type="button"
          className={key}
          data-play="remove"
          onClick={() => {
            send("default", "Removed from shortlist", {
              description: "Casa do Largo",
              action: showAction ? {
                dismiss: actionDismiss,
                label: "Undo",
                onAction: () => {
                  toast.success("Back on your shortlist")
                },
              } : undefined,
            })
          }}
        >
          Remove a stay
        </button>
        <button
          type="button"
          className={key}
          data-play="book"
          onClick={() =>
            send("error", "Couldn't book the room", {
              description: "The card was declined. Try another card or contact your bank.",
            })
          }
        >
          Book now
        </button>
      </div>
      <ToastRegion style={theme} toaster={toast} side={side} align={align} expanded={expanded} maxVisible={maxVisible} />
    </div>
  )
}
