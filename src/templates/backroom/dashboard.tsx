"use client"

/* The dashboard: how the store is doing over a period (7, 30 or 90 days) against the period
   before. Every number comes from the store's orders through the selectors in store.tsx, so a
   refund or a cancelled order on another page shows here at once.

   Overview: revenue, orders, average order and refund rate; revenue by channel; best sellers;
   the latest orders. Analytics: sessions, the way from a visit to a purchase, where visitors come
   from and on what. The period and the tab are in the address (?tab=analytics), and Export
   downloads the period's orders as a CSV file. */

import { Download, Laptop, Receipt, RotateCcw, ShoppingBag, Smartphone, Tablet, Wallet } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfig } from "@/components/ui/chart"
import { Item } from "@/components/ui/item"
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Skeleton, SkeletonSwap } from "@/components/ui/skeleton"
import { Sparkline } from "@/components/ui/sparkline"
import { Stat, StatChart, StatComparison, StatDelta, StatGroup, StatIcon, StatLabel, StatValue } from "@/components/ui/stat"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"

import { DEVICE_LABEL, type Device, type Order, type PaymentStatus, SOURCE_LABEL, type Source } from "./data"
import { downloadOrdersCsv } from "./export"
import { ago, count, day, initials, money, moneyShort, moneyWhole, percent, plural } from "./format"
import { linkLook } from "./kit"
import { linkProps, useRouter } from "./router"
import { analytics, CHANNEL_LABEL, customerOf, lowStock, overview, type Period, range, toaster, useStore } from "./store"

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const
const PERIODS: Period[] = [7, 30, 90]

/* Same height for every control in the title row: 32px. */
const controlRow = "[--segmented-control-height:1.5rem] [--tabs-height:1.75rem]"

export function Dashboard() {
  const { state, actions } = useStore()
  const router = useRouter()
  const period = state.period
  const tab = router.query.get("tab") === "analytics" ? "analytics" : "overview"
  const loading = usePeriodLoading(period)
  const [from, to] = range(period)

  const exportCsv = () => {
    const { rows, name } = downloadOrdersCsv(state, period)
    toaster.success(`Exported ${plural(rows, "order")}`, { description: name })
  }

  return (
    <div className={`flex flex-col gap-[var(--br-section)] ${controlRow}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 data-page-heading tabIndex={-1} className="text-[24px] leading-tight font-semibold tracking-tight outline-none">
            Dashboard
          </h1>
          <p className="text-[13px] text-muted-foreground">
            <span className="tabular-nums">
              {day(from)} to {day(to - 1)}
            </span>
            , compared with the {period} days before
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl aria-label="Period" value={String(period)} onValueChange={(v) => v && actions.setPeriod(Number(v) as Period)}>
            {PERIODS.map((p) => (
              <SegmentedControlItem key={p} value={String(p)}>
                {p} days
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <Button onClick={exportCsv} aria-label={`Export the last ${period} days of orders as CSV`}>
            <Download {...icon} />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => router.setQuery({ tab: v === "analytics" ? "analytics" : null })} className="flex flex-col gap-[var(--br-gap)]">
        <TabsList aria-label="Dashboard views" className="self-start">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="analytics">Analytics</TabsTab>
        </TabsList>
        <TabsPanels>
          <TabsPanel value="overview">
            <Overview period={period} loading={loading} />
          </TabsPanel>
          <TabsPanel value="analytics">
            <Analytics period={period} loading={loading} />
          </TabsPanel>
        </TabsPanels>
      </Tabs>
    </div>
  )
}

/** True for a moment after the period changes, so the figures show their placeholders at their own size. */
function usePeriodLoading(period: Period) {
  const [loading, setLoading] = React.useState(false)
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setLoading(true)
    const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kf-speed")) || 1
    const timer = setTimeout(() => setLoading(false), 700 * speed)
    return () => clearTimeout(timer)
  }, [period])
  return loading
}

/* ------------------------------------------------------------------ overview */

const bucketLabel = (period: Period, from: number) => (period === 90 ? `Week of ${day(from)}` : day(from))

function Overview({ period, loading }: { period: Period; loading: boolean }) {
  const { state } = useStore()
  const data = React.useMemo(() => overview(state, period), [state, period])
  const labels = data.buckets.map((b) => bucketLabel(period, b.from))
  const versus = `vs previous ${period} days`

  const stats = [
    { label: "Revenue", icon: Wallet, value: data.revenue, format: moneyWhole, series: data.buckets.map((b) => b.revenue / 100), daily: (v: number) => moneyWhole(v * 100) },
    { label: "Orders", icon: ShoppingBag, value: data.orders, format: count, series: data.buckets.map((b) => b.orders), daily: (v: number) => plural(v, "order") },
    { label: "Average order", icon: Receipt, value: data.average, format: money, series: data.buckets.map((b) => b.average / 100), daily: (v: number) => money(v * 100) },
    { label: "Refund rate", icon: RotateCcw, value: data.refundRate, format: (v: number) => percent(v), series: data.buckets.map((b) => b.refundRate), daily: (v: number) => percent(v), downIsGood: true },
  ]

  const chartData = data.buckets.map((b) => ({
    bucket: bucketLabel(period, b.from),
    online: Math.round(b.byChannel.online / 100),
    marketplace: Math.round(b.byChannel.marketplace / 100),
    wholesale: Math.round(b.byChannel.wholesale / 100),
  }))
  const chartConfig = {
    online: { label: CHANNEL_LABEL.online, color: "var(--chart-1)" },
    marketplace: { label: CHANNEL_LABEL.marketplace, color: "var(--chart-2)" },
    wholesale: { label: CHANNEL_LABEL.wholesale, color: "var(--chart-4)" },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-[var(--br-gap)]">
      <StatGroup aria-label={`Store, last ${period} days`}>
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value.value} formatValue={s.format} delta={s.value.delta} downIsGood={s.downIsGood} loading={loading}>
            <StatLabel />
            <StatIcon>
              <s.icon />
            </StatIcon>
            <StatValue />
            <StatDelta />
            <StatComparison>{versus}</StatComparison>
            <StatChart>
              <Sparkline type="area" data={s.series} labels={labels} label={`${s.label} per ${period === 90 ? "week" : "day"}`} period={`last ${period} days`} formatValue={s.daily} downIsGood={s.downIsGood} />
            </StatChart>
          </Stat>
        ))}
      </StatGroup>

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by channel</CardTitle>
            <CardDescription>
              Net of refunds, by {period === 90 ? "week" : "day"}, in euros
            </CardDescription>
            <CardAction className="text-end">
              <div className="text-[18px] leading-none font-semibold tracking-tight tabular-nums">{loading ? <Skeleton className="ms-auto h-[18px] w-20" /> : moneyWhole(data.revenue.value)}</div>
              <div className="mt-1.5 text-[12px] text-muted-foreground">{plural(data.orders.value, "order")}</div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <SkeletonSwap loading={loading} fallback={<ChartSkeleton bars={chartData.length} />}>
              <Chart
                aria-label={`Revenue by channel, last ${period} days`}
                type="bar"
                stacked
                data={chartData}
                config={chartConfig}
                categoryKey="bucket"
                categoryGap={period === 7 ? 0.45 : period === 30 ? 0.3 : 0.35}
                formatValue={(v) => moneyWhole(v * 100)}
                formatTick={(v) => moneyShort(v * 100)}
                formatCategory={(c, i) => (period === 30 ? (i % 5 === 0 || i === chartData.length - 1 ? c : "") : period === 90 ? c.replace("Week of ", "") : c)}
                className="[--chart-height:18rem]"
              />
            </SkeletonSwap>
          </CardContent>
        </Card>

        <BestSellers rows={data.bestSellers} labels={labels} period={period} loading={loading} />
      </div>

      <div className="grid gap-[var(--br-gap)] xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentOrders orders={data.recent} />
        </div>
        <StockToWatch />
      </div>
    </div>
  )
}

function ChartSkeleton({ bars }: { bars: number }) {
  /* The chart's own geometry: an axis column, bars on a baseline, the legend on top. */
  const heights = [52, 64, 48, 70, 58, 76, 61, 68, 55, 72, 66, 80, 59, 74, 63]
  return (
    <div aria-hidden className="flex h-[18rem] flex-col gap-3">
      <div className="flex justify-center gap-4 pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex min-h-0 flex-1 items-end gap-[3%] border-b border-border ps-10 pb-px">
        {Array.from({ length: Math.min(bars, 30) }, (_, i) => (
          <Skeleton key={i} className="flex-1 rounded-b-none" style={{ height: `${heights[i % heights.length]}%` }} />
        ))}
      </div>
      <div className="h-3" />
    </div>
  )
}

function BestSellers({ rows, labels, period, loading }: { rows: ReturnType<typeof overview>["bestSellers"]; labels: string[]; period: Period; loading: boolean }) {
  const router = useRouter()
  const step = Math.max(1, Math.ceil(labels.length / BEST_SELLER_BARS))
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Best sellers</CardTitle>
        <CardDescription>Prints by units sold, last {period} days</CardDescription>
      </CardHeader>
      <CardContent className="px-[calc(var(--card-padding,1.25rem)-0.5rem)]">
        <ol className="flex flex-col" aria-label="Best sellers">
          {rows.map((row, i) => {
            const to = `/products/${row.product.id}`
            const content = (
              <>
                <span className="w-3 shrink-0 text-center text-[12px] text-muted-foreground tabular-nums">{i + 1}</span>
                <img src={row.product.photo} alt="" className="size-10 shrink-0 rounded-[9px] object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[13px] leading-none font-medium">{row.product.name}</span>
                  <span className="truncate text-[12px] leading-none text-muted-foreground tabular-nums">
                    {loading ? <Skeleton className="h-3 w-16" /> : `${plural(row.units, "unit")} · ${moneyWhole(row.revenue)}`}
                  </span>
                </span>
                <span className="w-24 shrink-0">
                  {!loading && (
                    <Sparkline
                      type="bar"
                      data={grouped(row.perBucket, step)}
                      labels={labels.filter((_, i) => i % step === 0)}
                      label={`${row.product.name}, units per ${step > 1 ? `${step} ${period === 90 ? "weeks" : "days"}` : period === 90 ? "week" : "day"}`}
                      period={`last ${period} days`}
                      formatValue={(v) => plural(v, "unit")}
                      className="[--sparkline-height:1.75rem]"
                    />
                  )}
                </span>
              </>
            )
            return (
              <li key={row.product.id}>
                <Item
                  size="sm"
                  className="gap-3 rounded-[10px] px-2 py-2"
                  render={router.exists(to) ? <a {...linkProps(router, to)} aria-label={`${row.product.name}, ${plural(row.units, "unit")}`} /> : undefined}
                >
                  {content}
                </Item>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ stock */

/** Variants out of stock or at their low-stock level, from the store: an adjustment in Inventory shows here at once. */
function StockToWatch() {
  const { state } = useStore()
  const router = useRouter()
  const rows = lowStock(state)
  const out = rows.filter((r) => r.level === "out").length
  const all = "/inventory?show=low"
  return (
    <Card className="min-w-0 gap-3">
      <CardHeader>
        <CardTitle>Stock to watch</CardTitle>
        <CardDescription>{rows.length ? `${plural(out, "variant")} out, ${rows.length - out} running low` : "Every variant is above its low-stock level"}</CardDescription>
        {router.exists("/inventory") && (
          <CardAction>
            <Button size="sm" render={<a {...linkProps(router, out && rows.length === out ? "/inventory?show=out" : all)} />}>
              Inventory
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-[calc(var(--card-padding,1.25rem)-0.5rem)]">
        <ul className="flex flex-col" aria-label="Stock to watch">
          {rows.slice(0, 5).map(({ product, variant, level }) => {
            const to = `/inventory?product=${product.id}&show=${level}`
            return (
              <li key={variant.id}>
                <Item
                  size="sm"
                  className="gap-3 rounded-[10px] px-2 py-2"
                  render={router.exists("/inventory") ? <a {...linkProps(router, to)} aria-label={`${product.name}, ${variant.size} cm ${variant.finish}, ${level === "out" ? "out of stock" : `${variant.stock} left`}`} /> : undefined}
                >
                  <img src={product.photo} alt="" className="size-10 shrink-0 rounded-[9px] object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[13px] leading-none font-medium">{product.name}</span>
                    <span className="truncate text-[12px] leading-none text-muted-foreground">
                      {variant.size} cm · {variant.finish}
                    </span>
                  </span>
                  <span className={`shrink-0 text-[12px] tabular-nums ${level === "out" ? "text-destructive" : "text-muted-foreground"}`}>{level === "out" ? "Out of stock" : `${variant.stock} left`}</span>
                </Item>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ recent orders */

const PAYMENT: Record<PaymentStatus, { label: string; variant: "secondary" | "outline" | "destructive" | "success" }> = {
  paid: { label: "Paid", variant: "secondary" },
  pending: { label: "Payment due", variant: "outline" },
  partially_refunded: { label: "Partly refunded", variant: "outline" },
  refunded: { label: "Refunded", variant: "destructive" },
  voided: { label: "Voided", variant: "outline" },
}

export function OrderStatusBadges({ order }: { order: Order }) {
  const payment = PAYMENT[order.payment]
  return (
    <span className="flex items-center gap-1.5">
      {order.status === "cancelled" ? (
        <Badge variant="outline" className="text-muted-foreground">
          Cancelled
        </Badge>
      ) : (
        <>
          <Badge variant={payment.variant}>{payment.label}</Badge>
          <Badge variant="outline" className={order.fulfilment === "unfulfilled" ? "" : "text-muted-foreground"}>
            <span aria-hidden className={`size-1.5 rounded-full ${order.fulfilment === "unfulfilled" ? "bg-[var(--chart-4)]" : "bg-muted-foreground/50"}`} />
            {order.fulfilment === "unfulfilled" ? "Unfulfilled" : "Fulfilled"}
          </Badge>
        </>
      )}
    </span>
  )
}

function RecentOrders({ orders }: { orders: Order[] }) {
  const { state } = useStore()
  const router = useRouter()
  const all = "/orders"
  return (
    <Card className="min-w-0 gap-3">
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>The six newest, from every channel</CardDescription>
        {router.exists(all) && (
          <CardAction>
            <Button size="sm" render={<a {...linkProps(router, all)} />}>
              All orders
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto px-[calc(var(--card-padding,1.25rem)-0.75rem)]">
        <Table aria-label="Recent orders" className="w-full min-w-[640px] [--table-height:var(--br-row-tall,3.5rem)]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">Order</TableHead>
              <TableHead className="text-start">Customer</TableHead>
              <TableHead className="hidden text-start md:table-cell">Channel</TableHead>
              <TableHead className="text-start">Status</TableHead>
              <TableHead className="text-end">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const c = customerOf(state, o.customerId)
              const to = `/orders/${o.number}`
              const items = o.lines.reduce((n, l) => n + l.quantity, 0)
              return (
                <TableRow key={o.number}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {router.exists(to) ? (
                        <Button variant="ghost" size="sm" className={`${linkLook} self-start`} render={<a {...linkProps(router, to)} />}>
                          #{o.number}
                        </Button>
                      ) : (
                        <span className="text-[13px] leading-none font-semibold tabular-nums">#{o.number}</span>
                      )}
                      <span className="text-[12px] leading-none text-muted-foreground tabular-nums">{ago(o.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar size="sm">
                        {c?.avatar && <AvatarImage src={c.avatar} alt="" />}
                        <AvatarFallback>{initials(c?.name ?? "")}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-[13px] leading-none font-medium">{c?.name}</span>
                        <span className="truncate text-[12px] leading-none text-muted-foreground">{c?.company ?? `${c?.address.city}, ${c?.address.country}`}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{CHANNEL_LABEL[o.channel]}</TableCell>
                  <TableCell>
                    <OrderStatusBadges order={o} />
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[13px] leading-none font-medium tabular-nums">{money(o.total)}</span>
                      <span className="text-[12px] leading-none text-muted-foreground">{plural(items, "item")}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ analytics */

const DEVICE_ICON: Record<Device, typeof Smartphone> = { mobile: Smartphone, desktop: Laptop, tablet: Tablet }

function Analytics({ period, loading }: { period: Period; loading: boolean }) {
  const { state } = useStore()
  const data = React.useMemo(() => analytics(state, period), [state, period])
  const { now, before } = data
  const labels = data.buckets.map((b) => bucketLabel(period, b.from))
  const versus = `vs previous ${period} days`
  const change = (a: number, b: number) => (b ? (a - b) / b : null)

  const steps = [
    { label: "Sessions", value: now.sessions, delta: change(now.sessions, before.sessions), share: 1, of: "visits to the shop" },
    { label: "Added to cart", value: now.addedToCart, delta: change(now.addedToCart, before.addedToCart), share: now.addedToCart / now.sessions, of: "of sessions" },
    { label: "Reached checkout", value: now.reachedCheckout, delta: change(now.reachedCheckout, before.reachedCheckout), share: now.reachedCheckout / now.sessions, of: "of sessions" },
    { label: "Purchased", value: now.purchased, delta: change(now.purchased, before.purchased), share: now.purchased / now.sessions, of: "of sessions" },
  ]

  const sources = (Object.keys(SOURCE_LABEL) as Source[]).map((k) => ({ key: k, label: SOURCE_LABEL[k], value: now.sources[k] })).sort((a, b) => b.value - a.value)
  const devices = (Object.keys(DEVICE_LABEL) as Device[]).map((k) => ({ key: k, label: DEVICE_LABEL[k], value: now.devices[k], before: before.devices[k] }))
  const deviceConfig = {
    sessions: { label: "Sessions" },
    mobile: { label: DEVICE_LABEL.mobile, color: "var(--chart-1)" },
    desktop: { label: DEVICE_LABEL.desktop, color: "var(--chart-2)" },
    tablet: { label: DEVICE_LABEL.tablet, color: "var(--chart-4)" },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-[var(--br-gap)]">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Visits to the online store, by {period === 90 ? "week" : "day"}
          </CardDescription>
          <CardAction className="text-end">
            <div className="text-[18px] leading-none font-semibold tracking-tight tabular-nums">{loading ? <Skeleton className="ms-auto h-[18px] w-16" /> : count(now.sessions)}</div>
            <div className="mt-1.5 text-[12px] text-muted-foreground tabular-nums">{percent(data.conversion.value, 2)} converted</div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <SkeletonSwap loading={loading} fallback={<Skeleton className="h-[16rem] w-full rounded-[12px]" />}>
            <Chart
              aria-label={`Sessions, last ${period} days`}
              type="area"
              data={data.buckets.map((b, i) => ({ bucket: labels[i], sessions: b.sessions, purchased: b.purchased }))}
              config={{ sessions: { label: "Sessions", color: "var(--chart-1)" } } satisfies ChartConfig}
              categoryKey="bucket"
              formatValue={(v) => count(v)}
              formatCategory={(c, i) => (period === 30 ? (i % 5 === 0 || i === data.buckets.length - 1 ? c : "") : period === 90 ? c.replace("Week of ", "") : c)}
              className="[--chart-height:16rem]"
            />
          </SkeletonSwap>
        </CardContent>
      </Card>

      <StatGroup aria-label={`From visit to purchase, last ${period} days`}>
        {steps.map((s, i) => (
          <Stat key={s.label} label={s.label} value={s.value} formatValue={count} delta={s.delta} loading={loading}>
            <StatLabel>
              <span className="me-1.5 text-muted-foreground/70 tabular-nums">{i + 1}</span>
              {s.label}
            </StatLabel>
            <StatValue />
            <StatDelta />
            <StatComparison>{versus}</StatComparison>
            <StatChart className="mt-4">
              <Meter value={Math.round(s.share * 1000) / 10} max={100} aria-label={`${s.label}, share of sessions`} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-[12px]">
                  <MeterLabel className="text-muted-foreground">{i === 0 ? s.of : `${percent(s.share, s.share < 0.1 ? 1 : 0)} ${s.of}`}</MeterLabel>
                </div>
                <MeterTrack>
                  <MeterIndicator />
                </MeterTrack>
              </Meter>
            </StatChart>
          </Stat>
        ))}
      </StatGroup>

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader>
            <CardTitle>Where visitors come from</CardTitle>
            <CardDescription>Sessions by source, last {period} days</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4" aria-label="Sessions by source">
              {sources.map((s) => (
                <li key={s.key}>
                  <Meter value={s.value} max={now.sessions} aria-label={`${s.label}, sessions`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
                    <MeterLabel className="text-[13px] font-medium">{s.label}</MeterLabel>
                    <span className="flex items-baseline gap-2 text-[12px] tabular-nums">
                      <span className="text-muted-foreground">{loading ? "—" : count(s.value)}</span>
                      <MeterValue className="w-10 text-end font-medium text-foreground">{(state) => percent(s.value / now.sessions, 0)}</MeterValue>
                    </span>
                    <MeterTrack className="col-span-2">
                      <MeterIndicator />
                    </MeterTrack>
                  </Meter>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>What people shop on</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SkeletonSwap loading={loading} fallback={<Skeleton className="mx-auto size-[11rem] rounded-full" />}>
              <Chart
                aria-label={`Sessions by device, last ${period} days`}
                type="donut"
                data={devices.map((d) => ({ device: d.key, sessions: d.value }))}
                config={deviceConfig}
                categoryKey="device"
                formatValue={(v) => count(v)}
                className="[--chart-height:11rem]"
              />
            </SkeletonSwap>
            <ul className="flex flex-col divide-y divide-border" aria-label="Sessions by device">
              {devices.map((d) => {
                const Glyph = DEVICE_ICON[d.key]
                const delta = change(d.value / now.sessions, d.before / before.sessions)
                return (
                  <li key={d.key} className="flex items-center gap-3 py-2.5 text-[13px]">
                    <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: deviceConfig[d.key].color }} />
                    <Glyph {...icon} className="text-muted-foreground" />
                    <span className="flex-1 font-medium">{d.label}</span>
                    <span className="text-muted-foreground tabular-nums">{count(d.value)}</span>
                    <span className="w-12 text-end font-medium tabular-nums">{percent(d.value / now.sessions, 0)}</span>
                    <span className="hidden w-14 text-end text-[12px] text-muted-foreground tabular-nums sm:inline">
                      {delta === null ? "" : `${delta >= 0 ? "+" : "−"}${(Math.abs(delta) * 100).toFixed(1)}%`}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* A print sells a few a day at most, so 30 daily bars in a small chart read as scattered slivers.
   Best sellers group the period into about ten bars instead. */
const BEST_SELLER_BARS = 10
const grouped = (values: number[], step: number) => Array.from({ length: Math.ceil(values.length / step) }, (_, i) => values.slice(i * step, i * step + step).reduce((a, b) => a + b, 0))
