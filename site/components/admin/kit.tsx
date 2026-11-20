"use client"

import { CircleAlert, FlaskConical } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Period } from "@site/lib/admin/types"

/* ---------------------------------------------------------------- numbers and words */

const whole = new Intl.NumberFormat("en-US")
export const count = (value: number) => whole.format(Math.round(value))
export const percent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`
export const share = (part: number, total: number) => (total ? part / total : 0)
export const change = (now: number, before: number) => (before ? (now - before) / before : null)
export const plural = (value: number, word: string) => `${count(value)} ${word}${Math.round(value) === 1 ? "" : "s"}`

const regions = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null
export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "Unknown"
  try {
    return regions?.of(code) ?? code
  } catch {
    return code
  }
}

export function ago(iso: string, now = Date.now()): string {
  const ms = now - Date.parse(iso)
  if (!Number.isFinite(ms)) return ""
  const minutes = Math.round(ms / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${days} d ago` : new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })

export const icon = { "aria-hidden": true, className: "size-4" } as const

/* ---------------------------------------------------------------- page frame */

export const pageStack = "flex flex-col gap-4"

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-2">
      <div className="min-w-0">
        <h1 data-page-heading tabIndex={-1} className="text-[24px] leading-tight font-semibold tracking-[-0.02em] outline-none">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-5 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** 7, 30 or 90 days, kept in the address (?days=) so a reload or a shared link shows the same period. */
export function PeriodSwitch({ days }: { days: Period }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, start] = React.useTransition()
  const [value, setValue] = React.useState(String(days))
  React.useEffect(() => setValue(String(days)), [days])
  return (
    <SegmentedControl
      aria-label="Period"
      aria-busy={pending || undefined}
      value={value}
      onValueChange={(next) => {
        if (!next) return
        setValue(next)
        const query = new URLSearchParams(params.toString())
        if (next === "30") query.delete("days")
        else query.set("days", next)
        start(() => router.push(`${pathname}${query.size ? `?${query}` : ""}`, { scroll: false }))
      }}
    >
      <SegmentedControlItem value="7">7 days</SegmentedControlItem>
      <SegmentedControlItem value="30">30 days</SegmentedControlItem>
      <SegmentedControlItem value="90">90 days</SegmentedControlItem>
    </SegmentedControl>
  )
}

/** What the page is showing, when it is not simply the live data. */
export function Notices({ sample, error, eventLog = true }: { sample: boolean; error: string | null; eventLog?: boolean }) {
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Couldn't read the analytics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {sample && (
        <Alert>
          <FlaskConical />
          <AlertTitle>Sample data</AlertTitle>
          <AlertDescription>DATABASE_URL isn't set on this machine, so these figures are made up to show the layout. The live admin on keyframery.com reads the real database.</AlertDescription>
        </Alert>
      )}
      {!error && !sample && !eventLog && (
        <Alert>
          <CircleAlert />
          <AlertTitle>The event log isn't set up</AlertTitle>
          <AlertDescription>Page views and visitors come from the usage_events table. Run db/analytics.sql once in the Neon SQL editor and they start filling in.</AlertDescription>
        </Alert>
      )}
    </>
  )
}

/* ---------------------------------------------------------------- a short ranked list */

export function RankCard({
  title,
  description,
  action,
  head,
  rows,
  empty,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  head: [string, string]
  rows: { key: string; label: React.ReactNode; value: number; detail?: string }[]
  empty: string
  className?: string
}) {
  const top = Math.max(1, ...rows.map((row) => row.value))
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <Table aria-label={title} className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead>{head[0]}</TableHead>
                <TableHead className="w-28 text-end">{head[1]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="relative min-w-0">
                    {/* A bar behind the label shows the share at a glance. */}
                    <span aria-hidden className="absolute inset-y-1.5 start-0 rounded-[6px] bg-[color-mix(in_oklab,var(--chart-1)_12%,transparent)]" style={{ width: `${Math.max(2, (row.value / top) * 100)}%` }} />
                    <span className="relative block truncate px-2" title={typeof row.label === "string" ? row.label : undefined}>{row.label}</span>
                  </TableCell>
                  <TableCell className="text-end font-medium tabular-nums">
                    {count(row.value)}
                    {row.detail && <span className="ms-1.5 text-[12px] font-normal text-muted-foreground">{row.detail}</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>Nothing yet</EmptyTitle>
              <EmptyDescription>{empty}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

/** Chart labels: every label for 7 days and weeks, every fifth day (and the last) for 30. */
export const tickEvery = (days: Period, length: number) => (c: string, i: number) =>
  days === 30 ? (i % 5 === 0 || i === length - 1 ? c : "") : days === 90 ? c.replace("Week of ", "") : c
