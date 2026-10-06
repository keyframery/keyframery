"use client"

import * as React from "react"

import { LoadCut } from "@/components/keyframery/load-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Screen } from "../screen"

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]
const DATA: Record<string, { revenue: number; visitors: number; bars: number[] }> = {
  "7d": { revenue: 14210, visitors: 3820, bars: [42, 55, 48, 61, 70, 66, 74] },
  "30d": { revenue: 61480, visitors: 16240, bars: [38, 44, 52, 49, 58, 63, 71] },
  "90d": { revenue: 184920, visitors: 47100, bars: [30, 41, 47, 56, 60, 68, 79] },
}

export function Dashboard({ className }: { className?: string }) {
  const [range, setRange] = React.useState("30d")
  const [shown, setShown] = React.useState(DATA["30d"])
  const [loading, setLoading] = React.useState(false)
  const pick = (value: string) => {
    setRange(value)
    setLoading(true)
    setTimeout(() => {
      setShown(DATA[value])
      setLoading(false)
    }, 700)
  }
  return (
    <Screen name="dashboard" title="Dashboard" className={className}>
      <Tabs defaultValue="overview">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" data-director="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <Select items={RANGES} value={range} onValueChange={(v) => pick(String(v))}>
            <SelectTrigger aria-label="Range" size="sm" data-director="range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TabsContent value="overview" className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold tracking-tight"><ValueCut value={shown.revenue} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} locale="en-US" /></p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Visitors</p>
              <p className="text-2xl font-semibold tracking-tight"><ValueCut value={shown.visitors} locale="en-US" /></p>
            </div>
          </div>
          <LoadCut loading={loading} skeleton={<div className="mt-4 h-24 rounded-md bg-muted" />}>
            <div className="mt-4 flex h-24 items-end gap-1.5" role="img" aria-label="Visitors per day">
              {shown.bars.map((h, i) => (
                <span key={i} className="flex-1 rounded-sm bg-foreground/80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </LoadCut>
        </TabsContent>
        <TabsContent value="analytics" className="mt-3">
          <p className="text-sm font-medium">Top pages</p>
          <ul className="mt-2 grid gap-1.5 text-sm">
            {[["/pricing", "4,120"], ["/docs/installation", "3,880"], ["/blog/jump-cuts", "2,410"], ["/changelog", "1,050"]].map(([p, n]) => (
              <li key={p} className="flex justify-between"><span className="font-mono text-[13px]">{p}</span><span className="text-muted-foreground">{n}</span></li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="reports" className="mt-3">
          <p className="text-sm text-muted-foreground">Three reports are ready: September revenue, churn by plan, and signups by source.</p>
        </TabsContent>
      </Tabs>
    </Screen>
  )
}
