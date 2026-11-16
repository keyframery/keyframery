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

export const meta = { name: "Dialog", group: "Overlays" }

/* The demo plays itself: the sheet unfolds, its sections cascade in, then it saves and closes. */
export const play = [
  { click: "[data-slot=dialog-trigger]", wait: 2400 },
  { click: '[data-slot=dialog-close][data-variant="primary"]', wait: 1500 },
]

const field = [
  "h-9 w-full rounded-[10px] bg-background px-3 text-[13px] text-foreground outline-none",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
  "transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)]",
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

export default function DialogDemo() {
  return (
    <div className="flex w-full max-w-[340px] items-center gap-3 rounded-[14px] bg-muted/60 p-3 pl-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">Hen weekend</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">Margate, 9 people</div>
      </div>
      <Dialog>
        <DialogTrigger>Edit trip</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit trip</DialogTitle>
            <DialogDescription>Everyone on the trip sees these details.</DialogDescription>
          </DialogHeader>
          <div className="mt-5 grid gap-4">
            <div>
              <Label htmlFor="trip-name">Name</Label>
              <input id="trip-name" className={field} defaultValue="Hen weekend" />
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
            <DialogClose>Cancel</DialogClose>
            <DialogClose variant="primary" value="save">
              Save changes
            </DialogClose>
          </DialogFooter>
          <DialogClose variant="icon" />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn2(...parts: string[]) {
  return parts.join(" ")
}
