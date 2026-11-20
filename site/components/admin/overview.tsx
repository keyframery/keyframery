"use client"

import { Bot, ClipboardCopy, Download, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfig } from "@/components/ui/chart"
import { Meter, MeterIndicator, MeterLabel, MeterTrack } from "@/components/ui/meter"
import { Sparkline } from "@/components/ui/sparkline"
import { Stat, StatChart, StatComparison, StatDelta, StatGroup, StatIcon, StatLabel, StatValue } from "@/components/ui/stat"
import type { OverviewData } from "@site/lib/admin/types"

import { change, count, countryName, Notices, PageHeader, pageStack, percent, PeriodSwitch, plural, RankCard, share, tickEvery } from "./kit"

export function OverviewView({ data }: { data: OverviewData }) {
  const { days, buckets, totals, funnel } = data
  const now = totals.current
  const before = totals.previous
  const labels = buckets.map((b) => b.label)
  const per = days === 90 ? "week" : "day"
  const versus = `vs previous ${days} days`

  const stats = [
    { label: "Visitors", Icon: Users, value: now.visitors, delta: change(now.visitors, before.visitors), series: buckets.map((b) => b.visitors), unit: "visitor" },
    { label: "Installs", Icon: Download, value: now.installs, delta: change(now.installs, before.installs), series: buckets.map((b) => b.installs), unit: "install" },
    { label: "Copies", Icon: ClipboardCopy, value: now.copies, delta: change(now.copies, before.copies), series: buckets.map((b) => b.copies), unit: "copy" },
    { label: "AI agent reads", Icon: Bot, value: now.agent, delta: change(now.agent, before.agent), series: buckets.map((b) => b.agent), unit: "read" },
  ]

  const traffic = buckets.map((b) => ({ bucket: b.label, views: b.views, visitors: b.visitors }))
  const downloads = buckets.map((b) => ({ bucket: b.label, installs: b.installs, browser: b.browser, checks: b.checks, bots: b.bots }))
  const ticks = tickEvery(days, buckets.length)

  const steps = [
    { label: "Visited the site", value: funnel.visits },
    { label: "Copied a command or prompt", value: funnel.copied },
    { label: "Installed from the CLI, same day", value: funnel.installed },
  ]

  return (
    <div className={pageStack}>
      <PageHeader
        title="Overview"
        description={
          data.eventsSince
            ? `Last ${days} days, in UTC. Visitors and page views since the event log began on ${new Date(`${data.eventsSince}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" })}.`
            : `Last ${days} days, in UTC.`
        }
        actions={<PeriodSwitch days={days} />}
      />
      <Notices sample={data.sample} error={data.error} eventLog={data.eventLog} />

      <StatGroup aria-label={`Keyframery, last ${days} days`}>
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} formatValue={count} delta={s.delta}>
            <StatLabel />
            <StatIcon>
              <s.Icon />
            </StatIcon>
            <StatValue />
            <StatDelta />
            <StatComparison>{versus}</StatComparison>
            <StatChart>
              <Sparkline type="area" data={s.series} labels={labels} label={`${s.label} per ${per}`} period={`last ${days} days`} formatValue={(v) => plural(v, s.unit)} />
            </StatChart>
          </Stat>
        ))}
      </StatGroup>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Visitors and page views</CardTitle>
            <CardDescription>People in a browser, by {per}. Crawlers are left out.</CardDescription>
            <CardAction className="text-end">
              <div className="text-[18px] leading-none font-semibold tracking-tight tabular-nums">{count(now.views)}</div>
              <div className="mt-1.5 text-[12px] text-muted-foreground">page views</div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Chart
              aria-label={`Visitors and page views, last ${days} days`}
              type="area"
              data={traffic}
              config={{ views: { label: "Page views", color: "var(--chart-2)" }, visitors: { label: "Visitors", color: "var(--chart-1)" } } satisfies ChartConfig}
              categoryKey="bucket"
              formatValue={count}
              formatCategory={ticks}
              className="[--chart-height:16rem]"
            />
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Registry downloads</CardTitle>
            <CardDescription>Every /r/*.json fetch, by who fetched it, by {per}.</CardDescription>
            <CardAction className="text-end">
              <div className="text-[18px] leading-none font-semibold tracking-tight tabular-nums">{count(now.installs + now.browser + now.checks + now.bots)}</div>
              <div className="mt-1.5 text-[12px] text-muted-foreground">fetches</div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Chart
              aria-label={`Registry downloads, last ${days} days`}
              type="bar"
              stacked
              data={downloads}
              config={
                {
                  installs: { label: "CLI and coding tools", color: "var(--chart-1)" },
                  browser: { label: "Browsers", color: "var(--chart-2)" },
                  checks: { label: "Checks and scripts", color: "var(--chart-3)" },
                  bots: { label: "Crawlers", color: "var(--chart-4)" },
                } satisfies ChartConfig
              }
              categoryKey="bucket"
              categoryGap={days === 7 ? 0.45 : 0.3}
              formatValue={count}
              formatCategory={ticks}
              className="[--chart-height:16rem]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>From visit to install</CardTitle>
            <CardDescription>Visits linked by the day's visitor code: same network, same UTC day.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {steps.map((step) => (
              <Meter key={step.label} value={step.value} max={Math.max(1, funnel.visits)} aria-label={step.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
                <MeterLabel className="truncate text-[13px]">{step.label}</MeterLabel>
                <span className="text-[13px] font-medium tabular-nums">{`${count(step.value)} · ${percent(share(step.value, funnel.visits), share(step.value, funnel.visits) < 0.1 ? 1 : 0)}`}</span>
                <MeterTrack className="col-span-2">
                  <MeterIndicator />
                </MeterTrack>
              </Meter>
            ))}
          </CardContent>
        </Card>
        <RankCard
          title="Top pages"
          description="By page views"
          head={["Page", "Views"]}
          rows={data.pages.map((p) => ({ key: p.path, label: p.path, value: p.views }))}
          empty="Page views appear here once people visit."
          action={<Button size="sm" variant="ghost" render={<Link href={`/admin/traffic${days === 30 ? "" : `?days=${days}`}`} />}>All pages</Button>}
        />
        <RankCard
          title="Most installed"
          description="CLI and coding-tool downloads"
          head={["Component", "Installs"]}
          rows={data.downloads.map((d) => ({ key: d.item, label: d.item, value: d.count }))}
          empty="Installs appear here after the first shadcn add."
          action={<Button size="sm" variant="ghost" render={<Link href={`/admin/installs${days === 30 ? "" : `?days=${days}`}`} />}>All installs</Button>}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankCard title="Where visitors come from" description="The referring site, on the first page of a visit" head={["Site", "Views"]} rows={data.referrers.map((r) => ({ key: r.host, label: r.host, value: r.views }))} empty="No other site has sent visitors in this period." />
        <RankCard title="Countries" description="Visitors, from Cloudflare's country header" head={["Country", "Visitors"]} rows={data.countries.map((c) => ({ key: c.code, label: countryName(c.code), value: c.visitors }))} empty="Countries appear once people visit." />
      </div>
    </div>
  )
}
