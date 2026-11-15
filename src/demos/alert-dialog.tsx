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

export const meta = { name: "Alert Dialog", group: "Overlays" }

/* The demo plays itself: the question unfolds with its icon popping in, then the delete runs and closes it. */
export const play = [
  { click: "[data-slot=alert-dialog-trigger]", wait: 2200 },
  { click: '[data-slot=alert-dialog-close][data-variant="destructive"]', wait: 2600 },
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

/* Four soft tiles standing in for the album's photos. */
const tiles = [
  "bg-foreground/[0.07]",
  "bg-foreground/[0.12]",
  "bg-foreground/[0.05]",
  "bg-foreground/[0.1]",
]

export default function AlertDialogDemo() {
  return (
    <div className="flex w-[340px] items-center gap-3.5 rounded-[14px] bg-muted/60 p-3">
      <div className="grid size-12 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-[10px]">
        {tiles.map((t) => (
          <span key={t} className={t} />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">Summer in Kyoto</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">214 photos · 3.2 GB</div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger variant="destructive">Delete</AlertDialogTrigger>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogMedia>
            <TrashIcon />
          </AlertDialogMedia>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “Summer in Kyoto”?</AlertDialogTitle>
            <AlertDialogDescription>
              All 214 photos leave this album and your shared link stops working. Photos you
              also keep in other albums stay there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>Keep album</AlertDialogClose>
            <AlertDialogClose
              variant="destructive"
              value="confirm"
              action={() => new Promise((done) => setTimeout(done, 1200))}
            >
              Delete album
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
