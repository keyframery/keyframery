import * as React from "react"

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress"

export const meta = { name: "Progress", group: "Display" }

/* Uploads in steps to the green finish, then starts over: the fill springs and the value rolls. */
export const play = [
  { click: "[data-play=more]", wait: 1300 },
  { click: "[data-play=more]", wait: 1300 },
  { click: "[data-play=more]", wait: 1300 },
  { click: "[data-play=more]", wait: 2000 },
  { click: "[data-play=reset]", wait: 1500 },
]

const total = 24

const key =
  "inline-flex h-8 cursor-pointer items-center rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow,opacity] duration-100 active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

export default function ProgressDemo() {
  const [done, setDone] = React.useState(9)
  const finished = done >= total
  const minutes = Math.ceil((total - done) / 6)

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">Grandad’s 80th</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">Shared album</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Adding photos from Ellie’s phone</p>

      <div className="mt-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Progress value={(done / total) * 100}>
          <ProgressLabel>{finished ? "All photos uploaded" : "Uploading photos"}</ProgressLabel>
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <p className="mt-2 text-[12px] text-muted-foreground tabular-nums">
          {done} of {total} photos
          {finished ? " · 186 MB" : ` · about ${minutes} min left`}
        </p>

        <div className="my-4 h-px bg-border" />

        <Progress value={finished ? 100 : null}>
          <ProgressLabel className="font-normal text-muted-foreground">
            {finished ? "Thumbnails ready" : "Making thumbnails"}
          </ProgressLabel>
          <ProgressTrack className="h-1">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            data-play="more"
            className={key}
            disabled={finished}
            onClick={() => setDone((d) => Math.min(total, d + 5))}
          >
            Upload 5 more
          </button>
          <button type="button" data-play="reset" className={key} onClick={() => setDone(0)}>
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
