"use client"

/* Payouts: the money card payments bring in, on its way to the bank. The next payout and what is
   in transit on top, every payout below, and a payout's own page: each payment, refund and card fee
   it carries, adding up exactly to what reached the bank, with a CSV export. All of it is worked out
   from the store's orders (see `buildPayouts` in data.ts), so a refund made today comes off the next
   payout. */

import { Download, Landmark } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type DataTableColumnDef } from "@/components/ui/data-table"
import { MenuItem } from "@/components/ui/menu"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { NOW, type Payout, type PayoutStatus } from "./data"
import { ErrorPage } from "./errors"
import { storeSlug } from "./export"
import { date, day, money, plural, time, weekday } from "./format"
import { csvCell, downloadText, icon, InlineLink, pageStack, PageHeader } from "./kit"
import { useRouter } from "./router"
import { customerOf, payoutsOf, type State, toaster, useStore } from "./store"

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string }> = {
  paid: { label: "Paid" },
  in_transit: { label: "In transit" },
  scheduled: { label: "Scheduled" },
}

export function PayoutBadge({ status }: { status: PayoutStatus }) {
  if (status === "paid") return <Badge variant="secondary">Paid</Badge>
  return (
    <Badge variant="outline">
      <span aria-hidden className={status === "in_transit" ? "size-1.5 rounded-full bg-[var(--chart-1)]" : "size-1.5 rounded-full bg-muted-foreground/50"} />
      {PAYOUT_STATUS[status].label}
    </Badge>
  )
}

const longDay = (iso: string) => `${weekday(iso)} ${day(iso)}`
const payments = (p: Payout) => p.lines.filter((l) => l.kind === "charge").length

/* ------------------------------------------------------------------ CSV */

const euros = (cents: number) => (cents / 100).toFixed(2)

function payoutCsv(state: State, list: Payout[]) {
  const header = ["Payout", "Status", "Sent (UTC)", "Arrives (UTC)", "Bank", "Type", "Order", "Customer", "Taken (UTC)", "Gross", "Fee", "Net", "Currency"]
  const rows = list.flatMap((p) =>
    p.lines.map((l) => [
      p.id,
      PAYOUT_STATUS[p.status].label,
      p.initiatedAt.slice(0, 16).replace("T", " "),
      p.arrivesAt.slice(0, 16).replace("T", " "),
      p.bank,
      l.kind === "charge" ? "Payment" : "Refund",
      `#${l.orderNumber}`,
      customerOf(state, l.customerId)?.name ?? "",
      l.at.slice(0, 16).replace("T", " "),
      euros(l.gross),
      euros(-l.fee),
      euros(l.net),
      "EUR",
    ]),
  )
  return { text: [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n", rows: rows.length }
}

function exportPayouts(state: State, list: Payout[], what: string) {
  const { text, rows } = payoutCsv(state, list)
  const name = `${storeSlug(state)}-payouts-${what}.csv`
  downloadText(name, text)
  toaster.success(`Exported ${plural(rows, "line")}`, { description: name })
}

/* ------------------------------------------------------------------ the list */

type Row = Payout & { payments: number }

export function PayoutsPage() {
  const { state } = useStore()
  const router = useRouter()
  const q = router.query
  const list = payoutsOf(state)
  const rows = React.useMemo<Row[]>(() => list.map((p) => ({ ...p, payments: payments(p) })), [list])
  const next = list.find((p) => p.status === "scheduled")
  const moving = list.find((p) => p.status === "in_transit")
  const month = new Date(NOW).toISOString().slice(0, 7)
  const thisMonth = list.filter((p) => p.status === "paid" && p.arrivesAt.startsWith(month))

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "date",
        header: "Date",
        accessor: (p) => p.initiatedAt,
        hideable: false,
        sticky: true,
        cell: (p) => (
          <InlineLink to={`/payouts/${p.id}`} label={`Payout of ${day(p.initiatedAt)}`} className="tabular-nums">
            {longDay(p.initiatedAt)}
          </InlineLink>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: (p) => PAYOUT_STATUS[p.status].label,
        filter: { options: Object.values(PAYOUT_STATUS).map(({ label }) => ({ value: label })) },
        cell: (p) => <PayoutBadge status={p.status} />,
      },
      { id: "arrives", header: "Arrives", accessor: (p) => p.arrivesAt, hideBelow: "md", cell: (p) => <span className="text-muted-foreground tabular-nums">{longDay(p.arrivesAt)}</span> },
      { id: "bank", header: "Bank", accessor: (p) => p.bank, sortable: false, hideBelow: "lg", cell: (p) => <span className="text-muted-foreground">{p.bank}</span> },
      { id: "payments", header: "Payments", accessor: (p) => p.payments, align: "end", hideBelow: "lg", cell: (p) => <span className="tabular-nums">{p.payments}</span> },
      { id: "fees", header: "Fees", accessor: (p) => p.fees, align: "end", hideBelow: "md", cell: (p) => <span className="text-muted-foreground tabular-nums">−{money(p.fees)}</span> },
      { id: "amount", header: "Amount", accessor: (p) => p.amount, align: "end", cell: (p) => <span className="font-medium tabular-nums">{money(p.amount)}</span> },
    ],
    [],
  )

  const sortParam = q.get("sort")
  const sort = sortParam ? { id: sortParam.replace(/^-/, ""), direction: sortParam.startsWith("-") ? ("descending" as const) : ("ascending" as const) } : { id: "date", direction: "descending" as const }

  return (
    <div className={pageStack}>
      <PageHeader
        title="Payouts"
        description={`Card payments from the online store, paid out every Wednesday and Saturday to ${list[0]?.bank ?? "your bank"}`}
        actions={
          <Button onClick={() => exportPayouts(state, list, "all")}>
            <Download {...icon} />
            Export
          </Button>
        }
      />

      <Card className="py-0">
        <CardContent className="grid px-0 sm:grid-cols-3">
          {next && (
            <BalanceCell label="Next payout" to={`/payouts/${next.id}`} linkLabel={`Next payout, ${money(next.amount)}`} amount={next.amount} big>
              {longDay(next.initiatedAt)}, in the bank {longDay(next.arrivesAt)} · {plural(payments(next), "payment")} so far
            </BalanceCell>
          )}
          {moving && (
            <BalanceCell label="On its way" to={`/payouts/${moving.id}`} linkLabel={`Payout on its way, ${money(moving.amount)}`} amount={moving.amount}>
              Sent {longDay(moving.initiatedAt)}, arriving {longDay(moving.arrivesAt)}
            </BalanceCell>
          )}
          <BalanceCell label={`Paid out in ${new Date(NOW).toLocaleString("en-IE", { month: "long", timeZone: "UTC" })}`} amount={thisMonth.reduce((s, p) => s + p.amount, 0)}>
            {plural(thisMonth.length, "payout")} to {list[0]?.bank}
          </BalanceCell>
        </CardContent>
      </Card>

      <DataTable<Row>
        label="Payouts"
        data={rows}
        columns={columns}
        getRowId={(p) => p.id}
        selectable={false}
        searchPlaceholder="Search payouts"
        filters={{ status: q.get("status")?.split(",").filter(Boolean) ?? [] }}
        onFiltersChange={(f) => router.setQuery({ status: f.status?.length ? f.status.join(",") : null, page: null }, { replace: true })}
        sort={sort}
        onSortChange={(s) => router.setQuery({ sort: s && !(s.id === "date" && s.direction === "descending") ? `${s.direction === "descending" ? "-" : ""}${s.id}` : null, page: null }, { replace: true })}
        page={Math.max(0, Number(q.get("page") ?? 1) - 1)}
        onPageChange={(p) => router.setQuery({ page: p ? String(p + 1) : null }, { replace: true })}
        defaultPageSize={20}
        pageSizes={[10, 20, 50]}
        emptyTitle="No payouts match"
        emptyDescription="Clear the filter to see every payout."
        rowActions={(p) => (
          <>
            <MenuItem value="view" onClick={() => router.navigate(`/payouts/${p.id}`)}>
              View payout
            </MenuItem>
            <MenuItem value="export" onClick={() => exportPayouts(state, [p], p.id.replace("po-", ""))}>
              Export as CSV
            </MenuItem>
          </>
        )}
      />
    </div>
  )
}

function BalanceCell({ label, amount, children, to, linkLabel, big }: { label: string; amount: number; children: React.ReactNode; to?: string; linkLabel?: string; big?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-border px-[var(--card-padding,1.25rem)] py-5 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-s">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {to ? (
        <InlineLink to={to} label={linkLabel} className={big ? "self-start text-[26px] leading-tight tracking-tight tabular-nums" : "self-start text-[20px] leading-tight tracking-tight tabular-nums"}>
          {money(amount)}
        </InlineLink>
      ) : (
        <span className="text-[20px] leading-tight font-semibold tracking-tight tabular-nums">{money(amount)}</span>
      )}
      <span className="text-[12px] text-muted-foreground">{children}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ a payout */

export function PayoutPage({ id }: { id: string }) {
  const { state } = useStore()
  const payout = payoutsOf(state).find((p) => p.id === id)
  if (!payout) return <ErrorPage code="404" />

  const charges = payout.lines.filter((l) => l.kind === "charge")
  const refunds = payout.lines.filter((l) => l.kind === "refund")
  const lines = [...payout.lines].reverse()
  const sentence =
    payout.status === "scheduled"
      ? `Goes out ${longDay(payout.initiatedAt)}, in the bank ${longDay(payout.arrivesAt)}. Still collecting payments.`
      : payout.status === "in_transit"
        ? `Sent ${longDay(payout.initiatedAt)} to ${payout.bank}, arriving ${longDay(payout.arrivesAt)}`
        : `Sent ${longDay(payout.initiatedAt)}, arrived ${longDay(payout.arrivesAt)} in ${payout.bank}`

  return (
    <div className={pageStack}>
      <PageHeader
        back={{ to: "/payouts", label: "Back to payouts" }}
        title={<span className="tabular-nums">{money(payout.amount)}</span>}
        badges={<PayoutBadge status={payout.status} />}
        description={sentence}
        actions={
          <Button onClick={() => exportPayouts(state, [payout], payout.id.replace("po-", ""))}>
            <Download {...icon} />
            Export
          </Button>
        }
      />

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 gap-3 self-start">
          <CardHeader>
            <CardTitle>Payments and refunds</CardTitle>
            <CardDescription>
              {payout.from ? `Taken from ${date(payout.from)}` : "Taken since the shop opened"}
              {payout.to ? ` to ${date(Date.parse(payout.to) - 1)}` : " until it goes out"}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto px-[calc(var(--card-padding,1.25rem)-0.75rem)]">
            {lines.length ? (
              <Table aria-label="Payments and refunds in this payout" className="w-full min-w-[620px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">Order</TableHead>
                    <TableHead className="text-start">Customer</TableHead>
                    <TableHead className="text-start">Taken</TableHead>
                    <TableHead className="text-end">Amount</TableHead>
                    <TableHead className="text-end">Fee</TableHead>
                    <TableHead className="text-end">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <InlineLink to={`/orders/${l.orderNumber}`} label={`Order ${l.orderNumber}`} className="tabular-nums">
                            #{l.orderNumber}
                          </InlineLink>
                          {l.kind === "refund" && <Badge variant="outline">Refund</Badge>}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customerOf(state, l.customerId)?.name}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {day(l.at)}, {time(l.at)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{l.gross < 0 ? `−${money(-l.gross)}` : money(l.gross)}</TableCell>
                      <TableCell className="text-end text-muted-foreground tabular-nums">{l.fee ? `−${money(l.fee)}` : money(0)}</TableCell>
                      <TableCell className="text-end font-medium tabular-nums">{l.net < 0 ? `−${money(-l.net)}` : money(l.net)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium">
                      {plural(payout.lines.length, "line")}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{money(payout.charges - payout.refunds)}</TableCell>
                    <TableCell className="text-end text-muted-foreground tabular-nums">−{money(payout.fees)}</TableCell>
                    <TableCell className="text-end font-semibold tabular-nums">{money(payout.amount)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <p className="px-3 py-6 text-[13px] text-muted-foreground">No card payments yet. They show here as they come in.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2.5 text-[13px] tabular-nums">
                <dt className="text-muted-foreground">Payments ({charges.length})</dt>
                <dd className="text-end">{money(payout.charges)}</dd>
                <dt className="text-muted-foreground">Refunds ({refunds.length})</dt>
                <dd className="text-end">{payout.refunds ? `−${money(payout.refunds)}` : money(0)}</dd>
                <dt className="text-muted-foreground">Card fees (1.5% + €0.25)</dt>
                <dd className="text-end">−{money(payout.fees)}</dd>
                <div aria-hidden className="col-span-2 my-0.5 border-t border-border" />
                <dt className="font-semibold">{payout.status === "scheduled" ? "Payout so far" : "Payout"}</dt>
                <dd className="text-end font-semibold">{money(payout.amount)}</dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bank account</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-muted text-muted-foreground">
                <Landmark {...icon} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-medium">{payout.bank}</span>
                <span className="truncate text-[12px] text-muted-foreground">{state.settings.legalName}, EUR</span>
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
