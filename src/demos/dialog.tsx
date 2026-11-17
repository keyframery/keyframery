import * as React from "react"

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const controls = {
  variant: { type: "select", label: "Variant", default: "primary", options: ["default", "primary", "destructive", "icon"] },
  modal: { type: "select", label: "Modal", default: "modal", options: ["modal", "trap-focus", "non-modal"], group: "Behaviour" },
  presentation: { type: "select", label: "Presentation", default: "dialog", options: ["dialog", "sheet", "auto"], group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: false, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  closeOnOutsidePress: { type: "switch", label: "Close on outside press", default: true, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  showClose: { type: "switch", label: "Show close", default: true, group: "Behaviour" },
  editLabel: { type: "text", label: "Edit label", default: "Edit trip" },
  description: { type: "text", label: "Description", default: "Everyone on the trip sees these details." },
  cancel: { type: "text", label: "Cancel", default: "Cancel" },
  save: { type: "text", label: "Save", default: "Save changes" },
  tripName: { type: "text", label: "Trip name", default: "Hen weekend" },
  width: { type: "slider", label: "Width", default: 440, min: 300, max: 600, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 18, min: 0, max: 32, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 8, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  action: { type: "color", label: "Action", default: "", group: "Colours" },
} as const

export const meta = { name: "Dialog", group: "Overlays" }

/* The demo plays itself: the sheet unfolds, its sections cascade in, then it saves and closes. */
export const play = [
  { click: "[data-slot=dialog-trigger]", wait: 2400 },
  { click: '[data-play=save]', wait: 1500 },
]

const field = [
  "h-9 w-full rounded-[10px] bg-background px-3 text-[13px] text-foreground outline-none",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
  "transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)]",
  "dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
  "focus:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklab,var(--ring),transparent_75%)]",
  "motion-reduce:transition-none",
].join(" ")

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
      {children}
    </label>
  )
}

export default function DialogDemo({
  variant = "primary",
  modal = "modal",
  presentation = "dialog",
  disabled = false,
  focusableWhenDisabled = false,
  dismissible = true,
  closeOnOutsidePress = true,
  keepMounted = false,
  showClose = true,
  editLabel = "Edit trip",
  description = "Everyone on the trip sees these details.",
  cancel = "Cancel",
  save = "Save changes",
  tripName = "Hen weekend",
  width = 440,
  radius = 18,
  gap = 8,
  face = "",
  ink = "",
  action = "",
}: {
  variant?: "default" | "primary" | "destructive" | "icon"
  modal?: "modal" | "trap-focus" | "non-modal"
  presentation?: "dialog" | "sheet" | "auto"
  disabled?: boolean
  focusableWhenDisabled?: boolean
  dismissible?: boolean
  closeOnOutsidePress?: boolean
  keepMounted?: boolean
  showClose?: boolean
  editLabel?: string
  description?: string
  cancel?: string
  save?: string
  tripName?: string
  width?: number
  radius?: number
  gap?: number
  face?: string
  ink?: string
  action?: string
}) {
  const theme = {
    "--dialog-width": `${width}px`,
    "--dialog-radius": `${radius}px`,
    "--dialog-gap": `${gap}px`,
    ...(face ? { "--dialog-face": face } : null),
    ...(ink ? { "--dialog-ink": ink } : null),
    ...(action ? { "--dialog-action": action } : null),
  } as React.CSSProperties
  return (
    <div style={theme} className="flex w-full max-w-[340px] items-center gap-3 rounded-[14px] bg-muted/60 p-3 pl-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">{tripName}</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">Margate, 9 people</div>
      </div>
      <Dialog modal={modal === "modal" ? true : modal === "trap-focus" ? "trap-focus" : false} presentation={presentation} dismissible={dismissible} closeOnOutsidePress={closeOnOutsidePress}>
        <DialogTrigger disabled={disabled} focusableWhenDisabled={focusableWhenDisabled}>{editLabel}</DialogTrigger>
        <DialogBackdrop />
        <DialogContent style={theme} keepMounted={keepMounted}>
          <DialogHeader>
            <DialogTitle>{editLabel}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4">
            <div>
              <Label htmlFor="trip-name">Name</Label>
              <input id="trip-name" className={field} key={tripName} defaultValue={tripName} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trip-from">Arrive</Label>
                <input id="trip-from" className={cn2(field, "tabular-nums")} defaultValue="14 May 2026" />
              </div>
              <div>
                <Label htmlFor="trip-to">Leave</Label>
                <input id="trip-to" className={cn2(field, "tabular-nums")} defaultValue="17 May 2026" />
              </div>
            </div>
            <div>
              <Label htmlFor="trip-stay">Where you're staying</Label>
              <input id="trip-stay" className={field} defaultValue="The Sands, Margate" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>{cancel}</DialogClose>
            <DialogClose variant={variant} data-play="save" aria-label={save} value="save">
              {variant === "icon" ? <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3.5 8 3 3 6-6" /></svg> : save}
            </DialogClose>
          </DialogFooter>
          {showClose && variant !== "icon" && <DialogClose variant="icon" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn2(...parts: string[]) {
  return parts.join(" ")
}
