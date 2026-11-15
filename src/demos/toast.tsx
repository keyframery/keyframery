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
  "transition-[scale,translate] duration-100 active:translate-y-px active:scale-[0.985] motion-reduce:transition-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export default function ToastDemo() {
  const [toast] = React.useState(() => createToaster())
  React.useEffect(() => () => void toast.dismiss(), [toast])

  return (
    <div className="flex w-[380px] flex-col items-center gap-5 text-center">
      <div>
        <div className="text-[15px] font-semibold tracking-tight">The Zetter, Clerkenwell</div>
        <div className="mt-1 text-[13px] text-muted-foreground">3 nights from Friday, €412</div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className={key}
          data-play="save"
          onClick={() =>
            toast.success("Saved to London trip", { description: "The Zetter, Clerkenwell" })
          }
        >
          Save to trip
        </button>
        <button
          type="button"
          className={key}
          data-play="remove"
          onClick={() => {
            toast("Removed from shortlist", {
              description: "Casa do Largo",
              action: {
                label: "Undo",
                onAction: () => {
                  toast.success("Back on your shortlist")
                },
              },
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
            toast.error("Couldn't book the room", {
              description: "The card was declined. Try another card or contact your bank.",
            })
          }
        >
          Book now
        </button>
      </div>
      <ToastRegion toaster={toast} side="bottom" align="end" />
    </div>
  )
}
