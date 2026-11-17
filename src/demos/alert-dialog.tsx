import * as React from "react"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const controls = {
  triggerVariant: { type: "select", label: "Trigger variant", default: "destructive", options: ["default", "destructive"] },
  variant: { type: "select", label: "Variant", default: "destructive", options: ["default", "primary", "destructive"] },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: false, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  icon: { type: "switch", label: "Icon", default: true, group: "Behaviour" },
  album: { type: "text", label: "Album", default: "Bruges, 2024" },
  trigger: { type: "text", label: "Trigger", default: "Delete" },
  title: { type: "text", label: "Title", default: "Delete “Bruges, 2024”?" },
  description: { type: "text", label: "Description", default: "All 214 photos leave this album and your shared link stops working. Photos you also keep in other albums stay there." },
  cancel: { type: "text", label: "Cancel", default: "Keep album" },
  confirm: { type: "text", label: "Confirm", default: "Delete album" },
  width: { type: "slider", label: "Width", default: 400, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 18, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 32, min: 28, max: 44, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 8, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  action: { type: "color", label: "Action", default: "", group: "Colours" },
} as const

export const meta = { name: "Alert Dialog", group: "Overlays" }

/* The demo plays itself: the question unfolds with its icon popping in, then the delete runs and closes it. */
export const play = [
  { click: "[data-slot=alert-dialog-trigger]", wait: 2200 },
  { click: '[data-play=confirm]', wait: 2600 },
]

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.1a1 1 0 0 0 1 .9h3.8a1 1 0 0 0 1-.9l.6-8.1" />
    </svg>
  )
}

export default function AlertDialogDemo({
  triggerVariant = "destructive",
  variant = "destructive",
  disabled = false,
  focusableWhenDisabled = false,
  dismissible = true,
  keepMounted = false,
  icon = true,
  album = "Bruges, 2024",
  trigger = "Delete",
  title = "Delete “Bruges, 2024”?",
  description = "All 214 photos leave this album and your shared link stops working. Photos you also keep in other albums stay there.",
  cancel = "Keep album",
  confirm = "Delete album",
  width = 400,
  radius = 18,
  height = 32,
  gap = 8,
  face = "",
  ink = "",
  action = "",
}: {
  triggerVariant?: "default" | "destructive"
  variant?: "default" | "primary" | "destructive"
  disabled?: boolean
  focusableWhenDisabled?: boolean
  dismissible?: boolean
  keepMounted?: boolean
  icon?: boolean
  album?: string
  trigger?: string
  title?: string
  description?: string
  cancel?: string
  confirm?: string
  width?: number
  radius?: number
  height?: number
  gap?: number
  face?: string
  ink?: string
  action?: string
}) {
  const theme = {
    "--alert-dialog-width": `${width}px`,
    "--alert-dialog-radius": `${radius}px`,
    "--alert-dialog-height": `${height}px`,
    "--alert-dialog-gap": `${gap}px`,
    ...(face ? { "--alert-dialog-face": face } : null),
    ...(ink ? { "--alert-dialog-ink": ink } : null),
    ...(action ? { "--alert-dialog-action": action } : null),
  } as React.CSSProperties
  return (
    <div style={theme} className="flex w-full max-w-[340px] items-center gap-3.5 rounded-[14px] bg-muted/60 p-3">
      <img src="/demo/canal.jpg" alt="" className="size-12 shrink-0 rounded-[10px] bg-muted object-cover" />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">{album}</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">214 photos, 3.2 GB</div>
      </div>
      <AlertDialog dismissible={dismissible}>
        <AlertDialogTrigger variant={triggerVariant} disabled={disabled} focusableWhenDisabled={focusableWhenDisabled}>{trigger}</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent style={theme} keepMounted={keepMounted}>
          {icon && <AlertDialogMedia>
            <TrashIcon />
          </AlertDialogMedia>}
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>{cancel}</AlertDialogClose>
            <AlertDialogClose
              variant={variant}
              data-play="confirm"
              value="confirm"
              action={() => new Promise((done) => setTimeout(done, 1200))}
            >
              {confirm}
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
