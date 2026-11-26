import * as React from "react"

import {
  DiffViewer,
  DiffViewerActions,
  DiffViewerContent,
  DiffViewerCopyButton,
  DiffViewerHeader,
  DiffViewerStats,
  DiffViewerTitle,
  DiffViewerViewSwitch,
} from "@/components/ui/diff-viewer"

export const meta = { name: "Diff Viewer", group: "AI" }

/* Split the view, open a fold, accept the first change and reject the last, back to unified, then
   start the review over. */
export const play = [
  { click: '[data-slot="diff-viewer-view-option"][data-value="split"]', wait: 2000 },
  { click: '[data-slot="diff-viewer-fold"][data-fold="g1"]', wait: 1800 },
  { click: '[data-slot="diff-viewer-view-option"][data-value="unified"]', wait: 1600 },
  { click: '[data-slot="diff-viewer-accept"]', wait: 1200 },
  { click: '[data-slot="diff-viewer-hunk-header"][data-hunk="2"] [data-slot="diff-viewer-reject"]', wait: 2200 },
  { click: '[data-action="restart"]', wait: 2600 },
]

export const controls = {
  view: { type: "select", label: "View", options: ["unified", "split"], default: "unified" },
  review: { type: "switch", label: "Accept and reject", default: true },
  wordDiff: { type: "switch", label: "Changed words", default: true },
  lineNumbers: { type: "switch", label: "Line numbers", default: true },
  context: { type: "slider", label: "Context lines", min: 0, max: 8, step: 1, default: 3 },
  themeAdded: { type: "color", label: "Added lines", default: "", group: "Colours" },
  themeRemoved: { type: "color", label: "Removed lines", default: "", group: "Colours" },
  themeFace: { type: "color", label: "Sheet", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Sheet corners", min: 0, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Code size", min: 10, max: 16, step: 0.5, default: 12.5, unit: "px", group: "Layout" },
  themeMaxHeight: { type: "slider", label: "Body height", min: 200, max: 720, step: 10, default: 420, unit: "px", group: "Layout" },
} as const

const before = `import type { Request } from "./http"
import { redis } from "./redis"

/** Requests allowed per window, by plan. */
const LIMITS = {
  free: 60,
  pro: 600,
  team: 3000,
} as const

type Plan = keyof typeof LIMITS

export type RateLimitResult = {
  ok: boolean
  remaining: number
}

function keyFor(req: Request) {
  return \`ratelimit:\${req.user?.id ?? req.ip}\`
}

/** The caller's plan. Signed-out traffic counts as free. */
export function planFor(req: Request): Plan {
  const plan = req.user?.plan
  if (plan === "pro" || plan === "team") return plan
  return "free"
}

export function isOverLimit(result: RateLimitResult) {
  return !result.ok
}

/**
 * Counts this request against the caller's window.
 * Windows are fixed: they reset on the minute.
 */
export async function rateLimit(req: Request, plan: Plan): Promise<RateLimitResult> {
  const key = keyFor(req)
  const limit = LIMITS[plan]
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60)
  return { ok: count <= limit, remaining: limit - count }
}

export function headers(result: RateLimitResult) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
  }
}

export function isExempt(req: Request) {
  return req.headers.get("x-internal-token") === process.env.INTERNAL_TOKEN
}

export async function reset(req: Request) {
  await redis.del(keyFor(req))
}

export function describe(plan: Plan) {
  return \`\${LIMITS[plan]} requests per minute\`
}

export function remainingLabel(result: RateLimitResult) {
  if (result.remaining <= 0) return "Limit reached"
  return \`\${result.remaining} left\`
}
`

const after = `import type { Request } from "./http"
import { redis } from "./redis"

/** Requests allowed per window, by plan. */
const LIMITS = {
  free: 60,
  pro: 600,
  team: 3000,
} as const

type Plan = keyof typeof LIMITS

const WINDOW_MS = 60_000

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfter: number
}

function keyFor(req: Request) {
  return \`ratelimit:\${req.user?.id ?? req.ip}\`
}

/** The caller's plan. Signed-out traffic counts as free. */
export function planFor(req: Request): Plan {
  const plan = req.user?.plan
  if (plan === "pro" || plan === "team") return plan
  return "free"
}

export function isOverLimit(result: RateLimitResult) {
  return !result.ok
}

/**
 * Counts this request against the caller's window.
 * The window slides: it covers the last 60 seconds, not the clock minute.
 */
export async function rateLimit(req: Request, plan: Plan): Promise<RateLimitResult> {
  const key = keyFor(req)
  const limit = LIMITS[plan]
  const now = Date.now()
  await redis.zremrangebyscore(key, 0, now - WINDOW_MS)
  const count = (await redis.zcard(key)) + 1
  if (count <= limit) await redis.zadd(key, now, \`\${now}:\${crypto.randomUUID()}\`)
  await redis.pexpire(key, WINDOW_MS)
  const oldest = Number((await redis.zrange(key, 0, 0, "WITHSCORES"))[1] ?? now)
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter: Math.ceil((oldest + WINDOW_MS - now) / 1000) }
}

export function headers(result: RateLimitResult) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    ...(result.ok ? {} : { "Retry-After": String(result.retryAfter) }),
  }
}

export function isExempt(req: Request) {
  return req.headers.get("x-internal-token") === process.env.INTERNAL_TOKEN
}

export async function reset(req: Request) {
  await redis.del(keyFor(req))
}

export function describe(plan: Plan) {
  return \`\${LIMITS[plan]} requests per minute\`
}

export function remainingLabel(result: RateLimitResult) {
  if (result.ok) return \`\${result.remaining} left\`
  return \`Limit reached, try again in \${result.retryAfter}s\`
}
`

export default function DiffViewerDemo({
  view = "unified",
  review = true,
  wordDiff = true,
  lineNumbers = true,
  context = 3,
  themeAdded = "",
  themeRemoved = "",
  themeFace = "",
  themeRadius = 14,
  themeFont = 12.5,
  themeMaxHeight = 420,
}: {
  view?: "unified" | "split"
  review?: boolean
  wordDiff?: boolean
  lineNumbers?: boolean
  context?: number
  themeAdded?: string
  themeRemoved?: string
  themeFace?: string
  themeRadius?: number
  themeFont?: number
  themeMaxHeight?: number
}) {
  /* Restarting the review mounts a fresh viewer: folds closed, decisions cleared. */
  const [run, setRun] = React.useState(0)
  const [shown, setShown] = React.useState(view)
  const [decided, setDecided] = React.useState(0)
  React.useEffect(() => setShown(view), [view])

  const theme = {
    ...(themeAdded ? { "--diff-viewer-added": themeAdded } : null),
    ...(themeRemoved ? { "--diff-viewer-removed": themeRemoved } : null),
    ...(themeFace ? { "--diff-viewer-face": themeFace } : null),
    ...(themeRadius !== 14 ? { "--diff-viewer-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 12.5 ? { "--diff-viewer-font": `${themeFont}px` } : null),
    "--diff-viewer-max-height": `${themeMaxHeight}px`,
  } as React.CSSProperties

  const count = () => setDecided((n) => n + 1)

  return (
    <div style={theme} className="w-full max-w-[860px]">
      <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-tight">Use a sliding window for rate limits</div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Proposed by the agent · {decided === 0 ? "awaiting review" : `${decided} of 3 reviewed`}
          </p>
        </div>
        <button
          type="button"
          data-action="restart"
          onClick={() => {
            setRun((n) => n + 1)
            setDecided(0)
            setShown(view)
          }}
          className="h-7 shrink-0 cursor-pointer rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-colors duration-[calc(150ms*var(--kf-speed,1))] hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Start over
        </button>
      </div>

      <DiffViewer
        key={run}
        before={before}
        after={after}
        filename="src/lib/rate-limit.ts"
        view={shown}
        onViewChange={setShown}
        review={review}
        wordDiff={wordDiff}
        lineNumbers={lineNumbers}
        context={context}
        onAccept={count}
        onReject={count}
        onUndo={() => setDecided((n) => Math.max(0, n - 1))}
      >
        <DiffViewerHeader>
          <DiffViewerTitle />
          <DiffViewerStats />
          <DiffViewerActions>
            <DiffViewerViewSwitch />
            <DiffViewerCopyButton />
          </DiffViewerActions>
        </DiffViewerHeader>
        <DiffViewerContent />
      </DiffViewer>
    </div>
  )
}
