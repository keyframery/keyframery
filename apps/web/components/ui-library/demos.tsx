"use client"

import * as React from "react"

import { CombinationOtp } from "@/components/keyframery/combination-otp"
import { PaginationContent, PeekPagination } from "@/components/keyframery/peek-pagination"
import type { UiSlug } from "@/lib/ui-library"
import { cn } from "@/lib/utils"

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

function PeekPaginationDemo({ size }: { size: Size }) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(4)
  const rows = INVOICES.slice((page - 1) * pageSize, page * pageSize)
  return (
    <Stage
      size={size}
      onReset={() => {
        setPage(1)
        setPageSize(4)
      }}
      hint="Point at a page, an arrow or the dots to see what's there. Drag across the dots to browse."
    >
      <div className="flex w-full max-w-[720px] flex-col gap-5">
        <PaginationContent page={page * 100 + pageSize} className="w-full">
          <ul aria-label={`Invoices, page ${page}`} className="divide-y rounded-xl border bg-card text-sm shadow-xs">
            {rows.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-20 font-mono text-[12.5px] text-muted-foreground">{inv.id}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{inv.client}</span>
                <span className="tabular-nums">${inv.amount.toLocaleString("en-US")}.00</span>
                <span className={cn("w-16 text-right text-xs", inv.status === "Overdue" ? "text-destructive" : inv.status === "Due" ? "text-foreground" : "text-muted-foreground")}>{inv.status}</span>
              </li>
            ))}
          </ul>
        </PaginationContent>
        <PeekPagination
          page={page}
          onPageChange={setPage}
          total={INVOICES.length}
          pageSize={pageSize}
          pageSizes={[4, 8, 12]}
          preview={(p) => (
            <ul className="space-y-1.5">
              {INVOICES.slice((p - 1) * pageSize, (p - 1) * pageSize + 3).map((inv) => (
                <li key={inv.id} className="flex items-center gap-2 text-xs">
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
      </div>
    </Stage>
  )
}

const DEMOS: Partial<Record<UiSlug, (props: { size: Size }) => React.ReactNode>> = {
  "combination-otp": CombinationOtpDemo,
  "peek-pagination": PeekPaginationDemo,
}

export function Demo({ slug, size = "default" }: { slug: UiSlug; size?: Size }) {
  const Component = DEMOS[slug]
  return Component ? <Component size={size} /> : null
}
