"use client"

import { Bot, Download, ScanSearch, ShieldCheck } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, type ChartConfig } from "@/components/ui/chart"
import { DataTable, type DataTableColumnDef } from "@/components/ui/data-table"
import { Stat, StatComparison, StatGroup, StatIcon, StatLabel, StatValue } from "@/components/ui/stat"
import type { AgentsData, DownloadRow, EventRow, EventsData, InstallsData, TrafficData } from "@site/lib/admin/types"

import { ago, count, countryName, dateTime, Notices, PageHeader, pageStack, PeriodSwitch, plural, RankCard, tickEvery } from "./kit"

const muted = (text: React.ReactNode) => <span className="text-muted-foreground tabular-nums">{text}</span>
const num = (value: number, strong = false) => <span className={strong ? "font-medium tabular-nums" : "tabular-nums"}>{count(value)}</span>
const code = (text: string) => <span className="font-mono text-[12.5px]">{text}</span>

/* ---------------------------------------------------------------- installs */

export function InstallsView({ data }: { data: InstallsData }) {
  const { days, rows, buckets } = data
  const sum = (key: keyof Omit<DownloadRow, "item" | "last">) => rows.reduce((total, row) => total + row[key], 0)
  const installs = sum("installs")
  const columns = React.useMemo<DataTableColumnDef<DownloadRow>[]>(
    () => [
      { id: "item", searchable: true, header: "File", accessor: (r) => r.item, cell: (r) => code(r.item === "registry" ? "registry (directory check)" : r.item) },
      { id: "installs", header: "CLI and tools", accessor: (r) => r.installs, align: "end", cell: (r) => num(r.installs, true) },
      { id: "browser", header: "Browsers", accessor: (r) => r.browser, align: "end", hideBelow: "md", cell: (r) => num(r.browser) },
      { id: "checks", header: "Checks", accessor: (r) => r.checks, align: "end", hideBelow: "md", cell: (r) => num(r.checks) },
      { id: "bots", header: "Crawlers", accessor: (r) => r.bots, align: "end", hideBelow: "lg", cell: (r) => num(r.bots) },
      { id: "total", header: "All fetches", accessor: (r) => r.total, align: "end", cell: (r) => num(r.total) },
      { id: "last", header: "Last fetched", accessor: (r) => r.last, align: "end", hideBelow: "sm", cell: (r) => muted(r.last ? new Date(`${r.last}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : "") },
    ],
    [],
  )
  return (
    <div className={pageStack}>
      <PageHeader title="Installs" description={`Registry files fetched in the last ${days} days, by who fetched them. A fetch by the shadcn CLI or a coding tool is counted as an install.`} actions={<PeriodSwitch days={days} />} />
      <Notices sample={data.sample} error={data.error} />
      <StatGroup aria-label={`Registry downloads, last ${days} days`}>
        <Stat label="Installs" value={installs} formatValue={count}>
          <StatLabel />
          <StatIcon>
            <Download />
          </StatIcon>
          <StatValue />
          <StatComparison>{plural(rows.filter((r) => r.installs > 0).length, "component")} installed</StatComparison>
        </Stat>
        <Stat label="Directory checks" value={sum("checks")} formatValue={count}>
          <StatLabel />
          <StatIcon>
            <ShieldCheck />
          </StatIcon>
          <StatValue />
          <StatComparison>registry.json health checks and scripts</StatComparison>
        </Stat>
        <Stat label="Crawler fetches" value={sum("bots")} formatValue={count}>
          <StatLabel />
          <StatIcon>
            <Bot />
          </StatIcon>
          <StatValue />
          <StatComparison>search engines and AI crawlers</StatComparison>
        </Stat>
        <Stat label="Likely sweeps" value={data.sweeps?.visitors ?? 0} formatValue={count}>
          <StatLabel />
          <StatIcon>
            <ScanSearch />
          </StatIcon>
          <StatValue />
          <StatComparison>{data.sweeps ? "networks with 20+ files in one day" : "needs the event log"}</StatComparison>
        </Stat>
      </StatGroup>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Fetches by {days === 90 ? "week" : "day"}</CardTitle>
          <CardDescription>Stacked by who fetched the file.</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart
            aria-label={`Registry fetches, last ${days} days`}
            type="bar"
            stacked
            data={buckets.map((b) => ({ bucket: b.label, installs: b.installs, browser: b.browser, checks: b.checks, bots: b.bots }))}
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
            formatCategory={tickEvery(days, buckets.length)}
            className="[--chart-height:15rem]"
          />
        </CardContent>
      </Card>
      <DataTable<DownloadRow>
        label="Registry files"
        data={rows}
        columns={columns}
        getRowId={(r) => r.item}
        selectable={false}
        defaultSort={{ id: "installs", direction: "descending" }}
        defaultPageSize={20}
        pageSizes={[20, 50, 100]}
        searchPlaceholder="Search files"
        emptyTitle="No fetches in this period"
        emptyDescription="Try a longer period."
      />
    </div>
  )
}

/* ---------------------------------------------------------------- traffic */

type PageRow = TrafficData["pages"][number]

export function TrafficView({ data }: { data: TrafficData }) {
  const { days } = data
  const columns = React.useMemo<DataTableColumnDef<PageRow>[]>(
    () => [
      { id: "path", searchable: true, header: "Page", accessor: (r) => r.path, cell: (r) => <span className="block max-w-[44ch] truncate">{r.path}</span> },
      { id: "views", header: "Views", accessor: (r) => r.views, align: "end", cell: (r) => num(r.views, true) },
      { id: "visitors", header: "Visitors", accessor: (r) => r.visitors, align: "end", cell: (r) => num(r.visitors) },
      { id: "last", header: "Last view", accessor: (r) => r.last, align: "end", hideBelow: "sm", cell: (r) => muted(r.last ? ago(r.last) : "") },
    ],
    [],
  )
  return (
    <div className={pageStack}>
      <PageHeader title="Traffic" description={`Page views by people in a browser over the last ${days} days. No cookies; a visitor is a network on one UTC day.`} actions={<PeriodSwitch days={days} />} />
      <Notices sample={data.sample} error={data.error} eventLog={data.eventLog} />
      <DataTable<PageRow>
        label="Pages"
        data={data.pages}
        columns={columns}
        getRowId={(r) => r.path}
        selectable={false}
        defaultSort={{ id: "views", direction: "descending" }}
        defaultPageSize={20}
        pageSizes={[20, 50, 100]}
        searchPlaceholder="Search pages"
        emptyTitle="No page views in this period"
        emptyDescription="Try a longer period."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <RankCard title="Referring sites" description="On the first page of a visit" head={["Site", "Views"]} rows={data.referrers.slice(0, 15).map((r) => ({ key: r.host, label: r.host, value: r.views, detail: plural(r.visitors, "visitor") }))} empty="No other site has sent visitors in this period." />
        <RankCard title="Countries" description="Visitors by country" head={["Country", "Visitors"]} rows={data.countries.slice(0, 15).map((c) => ({ key: c.code, label: countryName(c.code), value: c.visitors }))} empty="Countries appear once people visit." />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- AI agents */

type ClientRow = AgentsData["clients"][number]
type AgentPage = AgentsData["pages"][number]

export function AgentsView({ data }: { data: AgentsData }) {
  const { days, buckets } = data
  const reads = data.clients.reduce((total, c) => total + c.reads, 0)
  const clientColumns = React.useMemo<DataTableColumnDef<ClientRow>[]>(
    () => [
      { id: "client", searchable: true, header: "Client", accessor: (r) => r.client, cell: (r) => <span className="font-medium">{r.client}</span> },
      { id: "type", header: "Type", accessor: (r) => (r.crawler ? "Crawler" : "Coding tool"), filter: { options: [{ value: "Crawler" }, { value: "Coding tool" }] }, cell: (r) => <Badge variant={r.crawler ? "secondary" : "outline"}>{r.crawler ? "Crawler" : "Coding tool"}</Badge> },
      { id: "reads", header: "Reads", accessor: (r) => r.reads, align: "end", cell: (r) => num(r.reads, true) },
      { id: "pages", header: "Pages", accessor: (r) => r.pages, align: "end", hideBelow: "sm", cell: (r) => num(r.pages) },
    ],
    [],
  )
  const pageColumns = React.useMemo<DataTableColumnDef<AgentPage>[]>(
    () => [
      { id: "path", searchable: true, header: "Markdown page", accessor: (r) => r.path, cell: (r) => <span className="block max-w-[48ch] truncate font-mono text-[12.5px]">{r.path}</span> },
      { id: "reads", header: "Reads", accessor: (r) => r.reads, align: "end", cell: (r) => num(r.reads, true) },
      { id: "clients", header: "Clients", accessor: (r) => r.clients, align: "end", hideBelow: "sm", cell: (r) => num(r.clients) },
    ],
    [],
  )
  return (
    <div className={pageStack}>
      <PageHeader title="AI agents" description={`Markdown reads in the last ${days} days: llms.txt, .md pages and Accept: text/markdown requests, by the client that asked.`} actions={<PeriodSwitch days={days} />} />
      <Notices sample={data.sample} error={data.error} />
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{plural(reads, "read")}</CardTitle>
          <CardDescription>By {days === 90 ? "week" : "day"}</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart
            aria-label={`AI agent reads, last ${days} days`}
            type="bar"
            data={buckets.map((b) => ({ bucket: b.label, agent: b.agent }))}
            config={{ agent: { label: "Reads", color: "var(--chart-1)" } } satisfies ChartConfig}
            categoryKey="bucket"
            categoryGap={days === 7 ? 0.45 : 0.3}
            formatValue={count}
            formatCategory={tickEvery(days, buckets.length)}
            className="[--chart-height:14rem]"
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <DataTable<ClientRow> label="Clients" data={data.clients} columns={clientColumns} getRowId={(r) => r.client} selectable={false} defaultSort={{ id: "reads", direction: "descending" }} defaultPageSize={10} pageSizes={[10, 25, 50]} searchPlaceholder="Search clients" emptyTitle="No reads in this period" emptyDescription="Try a longer period." />
        <DataTable<AgentPage> label="Pages read" data={data.pages} columns={pageColumns} getRowId={(r) => r.path} selectable={false} defaultSort={{ id: "reads", direction: "descending" }} defaultPageSize={10} pageSizes={[10, 25, 50]} searchPlaceholder="Search pages" emptyTitle="No reads in this period" emptyDescription="Try a longer period." />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- the event log */

const KIND_LABEL: Record<string, string> = { view: "Page view", install: "Download", agent: "Agent read", copy: "Copy" }

export function EventsView({ data }: { data: EventsData }) {
  const clients = React.useMemo(() => [...new Set(data.rows.map((r) => r.client))].sort(), [data.rows])
  const columns = React.useMemo<DataTableColumnDef<EventRow>[]>(
    () => [
      { id: "at", header: "When", accessor: (r) => r.at, cell: (r) => <span title={dateTime(r.at)} className="whitespace-nowrap text-muted-foreground tabular-nums">{ago(r.at)}</span> },
      { id: "kind", header: "Event", accessor: (r) => KIND_LABEL[r.kind] ?? r.kind, filter: { options: Object.values(KIND_LABEL).map((value) => ({ value })) }, cell: (r) => <Badge variant={r.kind === "install" ? "default" : r.kind === "copy" ? "success" : "secondary"}>{KIND_LABEL[r.kind] ?? r.kind}</Badge> },
      { id: "item", searchable: true, header: "What", accessor: (r) => `${r.item} ${r.detail ?? ""}`, cell: (r) => <span className="block max-w-[40ch] truncate">{r.item}{r.detail && <span className="text-muted-foreground"> · {r.detail}</span>}</span> },
      { id: "client", searchable: true, header: "Client", accessor: (r) => r.client, hideBelow: "md", filter: { options: clients.map((value) => ({ value })) }, cell: (r) => muted(r.client) },
      { id: "country", header: "Country", accessor: (r) => (r.country ? countryName(r.country) : "Unknown"), hideBelow: "lg", cell: (r) => muted(r.country ? countryName(r.country) : "Unknown") },
      { id: "referrer", header: "From", accessor: (r) => r.referrer ?? "", hideBelow: "lg", cell: (r) => muted(r.referrer ?? "") },
      { id: "visitor", header: "Visitor", accessor: (r) => r.visitor ?? "", hideBelow: "lg", cell: (r) => <span className="font-mono text-[12px] text-muted-foreground">{r.visitor?.slice(0, 8) ?? ""}</span> },
    ],
    [clients],
  )
  return (
    <div className={pageStack}>
      <PageHeader title="Event log" description="The latest 1,000 events, newest first. The visitor code changes every day and can't be turned back into an address." />
      <Notices sample={data.sample} error={data.error} eventLog={data.eventLog} />
      <DataTable<EventRow>
        label="Events"
        data={data.rows}
        columns={columns}
        getRowId={(r) => r.id}
        selectable={false}
        defaultSort={{ id: "at", direction: "descending" }}
        defaultPageSize={50}
        pageSizes={[25, 50, 100]}
        searchPlaceholder="Search pages, files and clients"
        emptyTitle="No events"
        emptyDescription={data.eventLog ? "Nothing has been recorded yet." : "Run db/analytics.sql to start the event log."}
      />
    </div>
  )
}
