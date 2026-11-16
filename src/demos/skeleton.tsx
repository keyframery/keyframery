import * as React from "react"

import { Skeleton, SkeletonSwap } from "@/components/ui/skeleton"

export const meta = { name: "Skeleton", group: "Feedback" }

/* Reloads the profile: the content drops back to skeletons, they shimmer, then the profile
   cascades back in out of a light blur. */
export const play = [{ click: "[data-play=reload]", wait: 3400 }]

const key =
  "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

const primaryKey =
  "inline-flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[9px] bg-primary px-3 text-[13px] leading-none font-medium text-primary-foreground outline-none select-none shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"

const stats = [
  { label: "Trips", value: "24" },
  { label: "Countries", value: "11" },
  { label: "Followers", value: "1,208" },
]

function useLoad(ms: number) {
  const [loading, setLoading] = React.useState(true)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const load = React.useCallback(() => {
    setLoading(true)
    clearTimeout(timer.current)
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kf-speed")) || 1
    timer.current = setTimeout(() => setLoading(false), ms * speed)
  }, [ms])
  React.useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [load])
  return [loading, load] as const
}

export default function SkeletonDemo() {
  const [loading, reload] = useLoad(1700)

  return (
    <div className="w-full max-w-[360px] rounded-[16px] bg-card p-5 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">Traveller profile</span>
        <button type="button" data-play="reload" className={key} disabled={loading} onClick={reload}>
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" />
          </svg>
          Reload
        </button>
      </div>

      <SkeletonSwap
        loading={loading}
        contentClassName="space-y-4"
        fallback={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2 py-0.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {stats.map((s) => (
                <Skeleton key={s.label} className="h-[54px] rounded-[10px]" />
              ))}
            </div>
            <Skeleton className="h-8 rounded-[9px]" />
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-[14px] font-semibold text-muted-foreground">
            AS
          </span>
          <div className="min-w-0">
            <div className="text-[15px] leading-5 font-semibold tracking-tight">Joe Ramsey</div>
            <div className="text-[12px] leading-4 text-muted-foreground">@joeramsey, Leeds</div>
          </div>
        </div>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Slow trains, small hotels and the best noodles in every city. Sicily next, if the ferries run.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[10px] bg-muted/70 px-3 py-2.5">
              <div className="text-[11px] font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-[15px] leading-5 font-semibold tracking-tight tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className={primaryKey}>
            Follow
          </button>
        </div>
      </SkeletonSwap>
    </div>
  )
}
