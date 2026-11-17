import * as React from "react"

import { Skeleton, SkeletonSwap } from "@/components/ui/skeleton"

export const meta = { name: "Skeleton", group: "Feedback" }

/* Reloads the profile: the content drops back to skeletons, they shimmer, then the profile
   cascades back in out of a light blur. */
export const play = [{ click: "[data-play=reload]", wait: 3400 }]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */

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

export const controls = {
  loading: { type: "switch", label: "Hold loading", default: false, group: "Behaviour" },
  shimmer: { type: "switch", label: "Shimmer", default: true, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Traveller profile" },
  name: { type: "text", label: "Name", default: "Joe Ramsey" },
  handle: { type: "text", label: "Handle", default: "@joeramsey, Leeds" },
  bio: { type: "text", label: "Bio", default: "Slow trains, small hotels and the best noodles in every city. Sicily next, if the ferries run." },
  action: { type: "text", label: "Action", default: "Follow" },
  reloadLabel: { type: "text", label: "Reload label", default: "Reload" },
  items: { type: "slider", label: "Stats", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", min: 300, max: 480, step: 1, default: 360, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 8, max: 28, step: 1, default: 16, unit: "px", group: "Layout" },
  avatarSize: { type: "slider", label: "Avatar size", min: 32, max: 64, step: 1, default: 48, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 24, step: 1, default: 8, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  sweep: { type: "color", label: "Sweep", default: "", group: "Colours" },
} as const

export default function SkeletonDemo({
  loading = false,
  shimmer = true,
  title = "Traveller profile",
  name = "Joe Ramsey",
  handle = "@joeramsey, Leeds",
  bio = "Slow trains, small hotels and the best noodles in every city. Sicily next, if the ferries run.",
  action = "Follow",
  reloadLabel = "Reload",
  items = 3,
  width = 360,
  gap = 16,
  avatarSize = 48,
  radius = 8,
  face = "",
  sweep = "",
}: {
  loading?: boolean
  shimmer?: boolean
  title?: string
  name?: string
  handle?: string
  bio?: string
  action?: string
  reloadLabel?: string
  items?: number
  width?: number
  gap?: number
  avatarSize?: number
  radius?: number
  face?: string
  sweep?: string
} = {}) {
  const theme = {
    "--skeleton-radius": `${radius}px`,
    "--skeleton-demo-gap": `${gap}px`,
    ...(face ? { "--skeleton-face": face } : {}),
    ...(sweep ? { "--skeleton-sweep": sweep } : {}),
  } as React.CSSProperties
  const [fetching, reload] = useLoad(1700)
  const isLoading = loading || fetching

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full rounded-[16px] bg-card p-5 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">{title}</span>
        <button type="button" data-play="reload" className={key} disabled={isLoading} onClick={reload}>
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" />
          </svg>
          {reloadLabel}
        </button>
      </div>

      <SkeletonSwap
        loading={isLoading}
        contentClassName="space-y-[var(--skeleton-demo-gap)]"
        fallback={
          <div className="space-y-[var(--skeleton-demo-gap)]">
            <div className="flex items-center gap-3">
              <Skeleton shimmer={shimmer} style={{ width: avatarSize, height: avatarSize }} className="rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton shimmer={shimmer} className="h-3.5 w-32" />
                <Skeleton shimmer={shimmer} className="h-3 w-20" />
              </div>
            </div>
            <div className="space-y-2 py-0.5">
              <Skeleton shimmer={shimmer} className="h-3 w-full" />
              <Skeleton shimmer={shimmer} className="h-3 w-4/5" />
            </div>
            <div style={{ gridTemplateColumns: `repeat(${items}, minmax(0, 1fr))` }} className="grid gap-2">
              {stats.slice(0, items).map((s) => (
                <Skeleton shimmer={shimmer} key={s.label} className="h-[54px] rounded-[10px]" />
              ))}
            </div>
            <Skeleton shimmer={shimmer} className="h-8 rounded-[9px]" />
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <span style={{ width: avatarSize, height: avatarSize }} className="grid place-items-center rounded-full bg-muted text-[14px] font-semibold text-muted-foreground">
            AS
          </span>
          <div className="min-w-0">
            <div className="text-[15px] leading-5 font-semibold tracking-tight">{name}</div>
            <div className="text-[12px] leading-4 text-muted-foreground">{handle}</div>
          </div>
        </div>
        <p className="text-[13px] leading-5 text-muted-foreground">
          {bio}
        </p>
        <div style={{ gridTemplateColumns: `repeat(${items}, minmax(0, 1fr))` }} className="grid gap-2">
          {stats.slice(0, items).map((s) => (
            <div key={s.label} className="rounded-[10px] bg-muted/70 px-3 py-2.5">
              <div className="text-[11px] font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-[15px] leading-5 font-semibold tracking-tight tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className={primaryKey}>
            {action}
          </button>
        </div>
      </SkeletonSwap>
    </div>
  )
}
