<script setup lang="ts">
/* Mirrors src/demos/diff-viewer.tsx at its default controls. */
import { ref } from "vue"

import {
  DiffViewer,
  DiffViewerActions,
  DiffViewerContent,
  DiffViewerCopyButton,
  DiffViewerHeader,
  DiffViewerStats,
  DiffViewerTitle,
  DiffViewerViewSwitch,
} from "@/components/keyframery/diff-viewer"

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


const run = ref(0)
const shown = ref<"unified" | "split">("unified")
const decided = ref(0)
const count = () => decided.value++
function restart() {
  run.value++
  decided.value = 0
  shown.value = "unified"
}
</script>

<template>
  <div style="--diff-viewer-max-height: 420px" class="w-full max-w-[860px]">
    <div class="mb-3 flex items-end justify-between gap-3 px-0.5">
      <div class="min-w-0">
        <div class="text-[15px] font-semibold tracking-tight">Use a sliding window for rate limits</div>
        <p class="mt-1 text-[12px] text-muted-foreground">Proposed by the agent · {{ decided === 0 ? "awaiting review" : `${decided} of 3 reviewed` }}</p>
      </div>
      <button
        type="button"
        data-action="restart"
        class="h-7 shrink-0 cursor-pointer rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-colors duration-[calc(150ms*var(--kf-speed,1))] hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        @click="restart"
      >
        Start over
      </button>
    </div>

    <DiffViewer
      :key="run"
      :before="before"
      :after="after"
      filename="src/lib/rate-limit.ts"
      :view="shown"
      :review="true"
      :word-diff="true"
      :line-numbers="true"
      :context="3"
      @update:view="(v: 'unified' | 'split') => (shown = v)"
      @accept="count"
      @reject="count"
      @undo="() => (decided = Math.max(0, decided - 1))"
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
</template>
