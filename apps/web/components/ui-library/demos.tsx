"use client"

import * as React from "react"

import { CombinationOtp } from "@/components/keyframery/combination-otp"
import { PaginationContent, PeekPagination } from "@/components/keyframery/peek-pagination"
import { WavePhotoUpload, type WavePhotoUploadHandle } from "@/components/keyframery/wave-photo-upload"
import type { UiSlug } from "@/lib/ui-library"
import { cn } from "@/lib/utils"

import { RelayBentoDemo } from "./relay-bento-demo"
import { Choice, Stage } from "./stage"

type Size = "default" | "large"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Remounts the component on Reset, so every demo can be played again from the start. */
function useRun() {
  const [run, setRun] = React.useState(0)
  return [run, () => setRun((r) => r + 1)] as const
}

function CombinationOtpDemo({ size }: { size: Size }) {
  const [run, reset] = useRun()
  const [scale, setScale] = React.useState<"sm" | "md" | "lg">("md")
  return (
    <Stage
      size={size}
      onReset={reset}
      options={
        <Choice
          label="Size"
          value={scale}
          onChange={setScale}
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
          ]}
        />
      }
      hint={
        <>
          Type or paste <span className="font-medium text-foreground tabular-nums">482019</span>. Anything else jams the drums.
        </>
      }
    >
      <CombinationOtp
        key={run}
        size={scale}
        verify={async (code) => {
          await wait(450)
          return code === "482019"
        }}
      />
    </Stage>
  )
}

const CLIENTS = ["Northwind", "Acme Co", "Globex", "Initech", "Umbrella", "Hooli", "Stark & Co", "Wayne Ltd", "Soylent", "Tyrell", "Cyberdyne", "Wonka"]
const STATUS = ["Paid", "Paid", "Due", "Paid", "Overdue", "Due"] as const
// 1,200 invoices: 300 pages at four a page, so there's plenty to peek at.
const INVOICES = Array.from({ length: 1200 }, (_, n) => ({
  id: `INV-${1040 + n}`,
  client: CLIENTS[(n * 5) % CLIENTS.length],
  amount: 180 + ((n * 7919) % 4600),
  status: STATUS[(n * 7 + 3) % STATUS.length],
}))

type Invoice = (typeof INVOICES)[number]

/**
 * The Peek Pagination demo runs against a pretend server: every page takes a moment to arrive, like a real API. The
 * table and the peek card read one shared cache (the way TanStack Query or SWR would), so a page you've peeked at is
 * already there when you click it. The line under the pagination shows exactly that as it happens.
 */
function PeekPaginationDemo({ size }: { size: Size }) {
  const [run, reset] = useRun()
  return <PeekPaginationServer key={run} size={size} onReset={reset} />
}

function PeekPaginationServer({ size, onReset }: { size: Size; onReset: () => void }) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(4)
  // The first page arrives with the page, as if it were rendered on the server.
  const cache = React.useRef(new Map<string, Invoice[]>([["1:4", INVOICES.slice(0, 4)]]))
  const [rows, setRows] = React.useState<Invoice[] | null>(INVOICES.slice(0, 4))
  const [fetched, setFetched] = React.useState<number[]>([])
  const [instant, setInstant] = React.useState<number | null>(null)
  const opened = React.useRef(false)

  /** GET /invoices?page=…&size=… : 280–700 ms away, unless it's already in the cache. */
  const getPage = React.useCallback(async (p: number, perPage: number, signal?: AbortSignal) => {
    const key = `${p}:${perPage}`
    const hit = cache.current.get(key)
    if (hit) return hit
    await wait(280 + Math.random() * 420)
    if (signal?.aborted) throw new Error("Cancelled")
    const data = INVOICES.slice((p - 1) * perPage, p * perPage)
    cache.current.set(key, data)
    setFetched((list) => [...list.filter((n) => n !== p), p].slice(-5))
    return data
  }, [])

  // The table reads the same cache, so a page you peeked at opens without waiting.
  React.useEffect(() => {
    const hit = cache.current.get(`${page}:${pageSize}`)
    if (!opened.current) {
      opened.current = true
      return
    }
    if (hit) {
      setRows(hit)
      setInstant(page)
      return
    }
    setRows(null)
    setInstant(null)
    let live = true
    getPage(page, pageSize).then((data) => live && setRows(data))
    return () => {
      live = false
    }
  }, [page, pageSize, getPage])

  return (
    <Stage size={size} onReset={onReset} hint="Pages come from a pretend server that takes a moment. Point at one: the card fetches it, and clicking it is then instant.">
      <div className="flex w-full max-w-[720px] flex-col gap-5">
        <PaginationContent page={page * 100 + pageSize} className="w-full">
          <ul aria-label={`Invoices, page ${page}`} aria-busy={rows === null} className="divide-y rounded-xl border bg-card text-sm shadow-xs">
            {(rows ?? Array.from({ length: pageSize }, () => null)).map((inv, i) =>
              inv ? (
                <li key={inv.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-20 font-mono text-[12.5px] text-muted-foreground">{inv.id}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{inv.client}</span>
                  <span className="tabular-nums">${inv.amount.toLocaleString("en-US")}.00</span>
                  <span className={cn("w-16 text-right text-xs", inv.status === "Overdue" ? "text-destructive" : inv.status === "Due" ? "text-foreground" : "text-muted-foreground")}>{inv.status}</span>
                </li>
              ) : (
                <li key={i} className="flex h-[41px] items-center gap-3 px-4">
                  <span className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
                  <span className="h-2.5 w-28 animate-pulse rounded-full bg-muted" />
                  <span className="ml-auto h-2.5 w-14 animate-pulse rounded-full bg-muted" />
                </li>
              ),
            )}
          </ul>
        </PaginationContent>
        <PeekPagination
          page={page}
          onPageChange={setPage}
          total={INVOICES.length}
          pageSize={pageSize}
          pageSizes={[4, 8, 12]}
          peek={(p, signal) => getPage(p, pageSize, signal)}
          preview={(_, invoices) => (
            <ul className="space-y-1.5">
              {invoices.slice(0, 3).map((inv) => (
                <li key={inv.id} className="flex h-[18px] items-center gap-2 text-xs">
                  <span className={cn("size-1.5 shrink-0 rounded-full", inv.status === "Overdue" ? "bg-destructive" : inv.status === "Due" ? "bg-amber-500" : "bg-emerald-500")} />
                  <span className="min-w-0 flex-1 truncate text-foreground">{inv.client}</span>
                  <span className="text-muted-foreground tabular-nums">${inv.amount.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          )}
          onPageSizeChange={(next) => {
            // Keep the first invoice on screen in view.
            setPage(Math.floor(((page - 1) * pageSize) / next) + 1)
            setPageSize(next)
          }}
        />
        <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
          {fetched.length ? (
            <>
              Fetched while peeking: <span className="text-foreground tabular-nums">{fetched.map((n) => `page ${n}`).join(", ")}</span>
              {instant !== null && fetched.includes(instant) ? (
                <>
                  {" · "}
                  <span className="text-foreground">page {instant} opened instantly</span>, from the cache
                </>
              ) : null}
            </>
          ) : (
            "Nothing fetched yet. Rest the pointer on a page for a moment."
          )}
        </p>
      </div>
    </Stage>
  )
}

// Photos of Earth taken from the International Space Station (NASA, public domain).
export const SAMPLES = [
  { name: "horizon.jpg", label: "Horizon", src: "/ui/samples/horizon.jpg" },
  { name: "aurora.jpg", label: "Aurora", src: "/ui/samples/aurora.jpg" },
  { name: "sunrise.jpg", label: "Sunrise", src: "/ui/samples/sunrise.jpg" },
]

/** A sample photo as a File, just like one dropped from the desktop. */
export async function sampleFile(sample = SAMPLES[0]) {
  const blob = await (await fetch(sample.src)).blob()
  return new File([blob], sample.name, { type: blob.type || "image/jpeg" })
}

/** A pretend upload that moves in uneven steps, like a real one. One that fails drops out at 60%. */
export function pretendUpload(seconds: number, fails = false) {
  return async (_file: File, report: (fraction: number) => void, signal: AbortSignal) => {
    const steps = 20
    for (let i = 1; i <= steps; i++) {
      await wait(((seconds * 1000) / steps) * (0.4 + Math.random() * 1.2))
      if (signal.aborted) throw new Error("Cancelled")
      if (fails && i === steps * 0.6) throw new Error("The connection dropped")
      report(i / steps)
    }
  }
}

function WavePhotoUploadDemo({ size }: { size: Size }) {
  const [run, reset] = useRun()
  const [network, setNetwork] = React.useState<"slow" | "fast" | "fails">("slow")
  const photo = React.useRef<WavePhotoUploadHandle>(null)
  return (
    <Stage
      size={size}
      onReset={reset}
      options={
        <Choice
          label="Network"
          value={network}
          onChange={setNetwork}
          options={[
            { value: "slow", label: "Slow" },
            { value: "fast", label: "Fast" },
            { value: "fails", label: "Fails" },
          ]}
        />
      }
      hint="Drop or paste a photo of your own, or try one of these."
    >
      <div className="flex w-full flex-col items-center gap-4">
        <WavePhotoUpload key={run} ref={photo} upload={pretendUpload(network === "fast" ? 1.5 : 6, network === "fails")} />
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          Try
          {SAMPLES.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={async () => photo.current?.pick(await sampleFile(sample))}
              className="flex items-center gap-1.5 rounded-full bg-card py-1 pr-2.5 pl-1 font-medium text-foreground shadow-xs ring-1 ring-black/8 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:ring-white/10"
            >
              <span aria-hidden="true" className="size-5 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${sample.src})` }} />
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </Stage>
  )
}

function RelayBentoStage({ size }: { size: Size }) {
  const [run, reset] = useRun()
  const [checks, setChecks] = React.useState<"pass" | "fail">("pass")
  return (
    <Stage
      size={size}
      plain
      onReset={reset}
      options={
        <Choice
          label="Checks"
          value={checks}
          onChange={(value) => {
            setChecks(value)
            reset()
          }}
          options={[
            { value: "pass", label: "Pass" },
            { value: "fail", label: "Fail" },
          ]}
        />
      }
      hint="It plays by itself: each commit travels from tile to tile through the gaps. Point at a region or a bar for its numbers."
    >
      <RelayBentoDemo key={run} fail={checks === "fail"} className="max-w-[1040px]" />
    </Stage>
  )
}

const DEMOS: Partial<Record<UiSlug, (props: { size: Size }) => React.ReactNode>> = {
  "combination-otp": CombinationOtpDemo,
  "peek-pagination": PeekPaginationDemo,
  "wave-photo-upload": WavePhotoUploadDemo,
  "relay-bento": RelayBentoStage,
}

export function Demo({ slug, size = "default" }: { slug: UiSlug; size?: Size }) {
  const Component = DEMOS[slug]
  return Component ? <Component size={size} /> : null
}
