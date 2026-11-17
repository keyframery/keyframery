import * as React from "react"

import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerGrip,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export const controls = {
  side: { type: "select", label: "Side", default: "bottom", options: ["bottom", "top", "left", "right", "start", "end"], group: "Behaviour" },
  modal: { type: "select", label: "Modal", default: "modal", options: ["modal", "trap-focus", "non-modal"], group: "Behaviour" },
  variant: { type: "select", label: "Variant", default: "primary", options: ["default", "primary"] },
  driver: { type: "select", label: "Driver", default: "auto", options: ["auto", "pointer", "scroll-snap"], group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  closeOnOutsidePress: { type: "switch", label: "Close on outside press", default: true, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable when disabled", default: false, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Your order" },
  description: { type: "text", label: "Description", default: "Pickup at Rua Augusta 24, ready in about 15 minutes." },
  trigger: { type: "text", label: "Trigger", default: "View order" },
  browse: { type: "text", label: "Browse", default: "Keep browsing" },
  count: { type: "slider", label: "Count", default: 4, min: 1, max: 4, step: 1 },
  width: { type: "slider", label: "Width", default: 480, min: 300, max: 600, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 18, min: 0, max: 32, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 8, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export const meta = { name: "Drawer", group: "Overlays" }

/* The demo plays itself: the order rises on the drawer's own spring with its sections cascading
   in, then Keep browsing lets it fall away. */
export const play = [
  { click: "[data-slot=drawer-trigger]", wait: 2600 },
  { click: '[data-play=browse]', wait: 1600 },
]

const items = [
  { qty: 2, name: "Flat white", note: "Oat milk", price: 7.6 },
  { qty: 1, name: "Pastel de nata", note: "Warm", price: 2.2 },
  { qty: 1, name: "Sourdough loaf", note: "Sliced", price: 6.5 },
  { qty: 1, name: "Granola bowl", note: "Greek yoghurt, berries", price: 9.4 },
]

const euro = (n: number) => `€${n.toFixed(2)}`
const service = 1.2
export default function DrawerDemo({
  side = "bottom",
  modal = "modal",
  variant = "primary",
  driver = "auto",
  dismissible = true,
  closeOnOutsidePress = true,
  disabled = false,
  focusableWhenDisabled = false,
  keepMounted = false,
  title = "Your order",
  description = "Pickup at Rua Augusta 24, ready in about 15 minutes.",
  trigger = "View order",
  browse = "Keep browsing",
  count = 4,
  width = 480,
  radius = 18,
  gap = 8,
  face = "",
  ink = "",
  accent = "",
}: {
  side?: "bottom" | "top" | "left" | "right" | "start" | "end"
  modal?: "modal" | "trap-focus" | "non-modal"
  variant?: "default" | "primary"
  driver?: "auto" | "pointer" | "scroll-snap"
  dismissible?: boolean
  closeOnOutsidePress?: boolean
  disabled?: boolean
  focusableWhenDisabled?: boolean
  keepMounted?: boolean
  title?: string
  description?: string
  trigger?: string
  browse?: string
  count?: number
  width?: number
  radius?: number
  gap?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const subtotal = items.slice(0, count).reduce((sum, item) => sum + item.price, 0)
  const total = subtotal + service
  const theme = {
    ...(width !== 480 ? { "--drawer-width": `${width}px` } : null),
    "--drawer-radius": `${radius}px`,
    "--drawer-gap": `${gap}px`,
    ...(face ? { "--drawer-face": face } : null),
    ...(ink ? { "--drawer-ink": ink } : null),
    ...(accent ? { "--drawer-accent": accent } : null),
  } as React.CSSProperties
  return (
    <div style={theme} className="flex w-full max-w-[340px] items-center gap-3 rounded-[14px] bg-muted/60 p-3 pl-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">Café Lumen</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">{items.slice(0, count).reduce((sum, item) => sum + item.qty, 0)} items · {euro(total)}</div>
      </div>
      <Drawer side={side} modal={modal === "modal" ? true : modal === "trap-focus" ? "trap-focus" : false} driver={driver} dismissible={dismissible} closeOnOutsidePress={closeOnOutsidePress}>
        <DrawerTrigger disabled={disabled} focusableWhenDisabled={focusableWhenDisabled}>{trigger}</DrawerTrigger>
        <DrawerBackdrop />
        <DrawerContent style={theme} keepMounted={keepMounted}>
          <DrawerGrip />
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <ul className="mt-4 px-5">
            {items.slice(0, count).map((item) => (
              <li key={item.name} className="flex items-baseline gap-3 py-2 text-[13px]">
                <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{item.qty}×</span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="block text-[12px] text-muted-foreground">{item.note}</span>
                </span>
                <span className="tabular-nums">{euro(item.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mx-5 mt-2 space-y-1.5 border-t border-border pt-3 text-[13px] tabular-nums">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd>{euro(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Service</dt>
              <dd>{euro(service)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-[15px] font-semibold tracking-tight">
              <dt>Total</dt>
              <dd>{euro(total)}</dd>
            </div>
          </dl>
          <DrawerFooter>
            <DrawerClose variant={variant} value="pay">
              Pay {euro(total)}
            </DrawerClose>
            <DrawerClose data-play="browse">{browse}</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
