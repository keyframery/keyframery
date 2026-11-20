"use client"

/* Orders: the list (search, filters, sorting, paging, bulk actions, all kept in the address) and an
   order's own page (progress, items, payment, the customer, the timeline, and the fulfil, refund,
   cancel and mark-as-paid flows). Every change goes through the store, so the dashboard and the
   sidebar's badge follow at once. */

import { Ban, CircleCheck, CircleDashed, Copy, Download, Mail, MoreHorizontal, Plus, Receipt, RotateCcw, Truck } from "lucide-react"
import * as React from "react"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/ui/data-table"
import {
  DescriptionList,
  DescriptionListActions,
  DescriptionListCopy,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
} from "@/components/ui/description-list"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Menu, MenuContent, MenuItem, MenuItemIcon, MenuSeparator, MenuTrigger } from "@/components/ui/menu"
import { NumberInput, NumberInputControl, NumberInputGroup } from "@/components/ui/number-input"
import { Separator } from "@/components/ui/separator"
import { Stepper, StepperList } from "@/components/ui/stepper"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@/components/ui/timeline"

import type { Order } from "./data"
import { ErrorPage } from "./errors"
import { ordersToCsv, storeSlug } from "./export"
import { date, day, money, plural, time, when } from "./format"
import { Choice, downloadText, FulfilmentBadge, icon, InlineLink, itemsIn, LabelledField, pageStack, PageHeader, PAYMENT, PaymentBadge, PersonAvatar, PrintPhoto } from "./kit"
import { linkProps, useRouter } from "./router"
import { CHANNEL_LABEL, customerOf, orderByNumber, toaster, unfulfilledCount, useStore } from "./store"

/* ------------------------------------------------------------------ the list */

type Row = Order & { customerName: string; customerEmail: string; avatar?: string }

const FILTER_KEYS = ["payment", "fulfilment", "channel"] as const
const fulfilmentLabel = (o: Order) => (o.status === "cancelled" ? "Cancelled" : o.fulfilment === "unfulfilled" ? "Unfulfilled" : "Fulfilled")

export function OrdersPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const q = router.query
  const [selected, setSelected] = React.useState<string[]>([])
  const [fulfilling, setFulfilling] = React.useState<Order | null>(null)
  const [cancelling, setCancelling] = React.useState<Order | null>(null)

  const rows = React.useMemo<Row[]>(
    () =>
      [...state.orders]
        .sort((a, b) => b.number - a.number)
        .map((o) => {
          const c = customerOf(state, o.customerId)
          return { ...o, customerName: c?.name ?? "Guest", customerEmail: c?.email ?? "", avatar: c?.avatar }
        }),
    [state],
  )

  /* The table's state lives in the address, so a filtered list can be shared, reloaded and gone back to. */
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, q.get(key)?.split(",").filter(Boolean) ?? []]))
  const sortParam = q.get("sort")
  const sort = sortParam ? { id: sortParam.replace(/^-/, ""), direction: sortParam.startsWith("-") ? ("descending" as const) : ("ascending" as const) } : { id: "number", direction: "descending" as const }
  const page = Math.max(0, Number(q.get("page") ?? 1) - 1)

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "number",
        header: "Order",
        accessor: (o) => `#${o.number}`,
        sortValue: (o) => o.number,
        searchable: true,
        hideable: false,
        sticky: true,
        cell: (o) => <InlineLink to={`/orders/${o.number}`} label={`Order ${o.number}`}>#{o.number}</InlineLink>,
      },
      { id: "date", header: "Date", accessor: (o) => o.createdAt, hideBelow: "md", cell: (o) => <span className="text-muted-foreground tabular-nums">{when(o.createdAt)}</span> },
      {
        id: "customer",
        header: "Customer",
        accessor: (o) => `${o.customerName} ${o.customerEmail}`,
        sortValue: (o) => o.customerName,
        searchable: true,
        cell: (o) => (
          <span className="flex min-w-0 items-center gap-2">
            <PersonAvatar person={{ name: o.customerName, avatar: o.avatar }} />
            <span className="truncate font-medium">{o.customerName}</span>
          </span>
        ),
      },
      {
        id: "channel",
        header: "Channel",
        accessor: (o) => CHANNEL_LABEL[o.channel],
        hideBelow: "lg",
        filter: { options: Object.values(CHANNEL_LABEL).map((value) => ({ value })) },
        cell: (o) => <span className="text-muted-foreground">{CHANNEL_LABEL[o.channel]}</span>,
      },
      {
        id: "payment",
        header: "Payment",
        accessor: (o) => PAYMENT[o.payment].label,
        filter: { options: Object.values(PAYMENT).map(({ label }) => ({ value: label })) },
        cell: (o) => <PaymentBadge order={o} />,
      },
      {
        id: "fulfilment",
        header: "Fulfilment",
        accessor: fulfilmentLabel,
        hideBelow: "sm",
        filter: {
          options: [
            { value: "Unfulfilled", icon: <CircleDashed {...icon} /> },
            { value: "Fulfilled", icon: <CircleCheck {...icon} /> },
            { value: "Cancelled", icon: <Ban {...icon} /> },
          ],
        },
        cell: (o) => <FulfilmentBadge order={o} />,
      },
      { id: "items", header: "Items", accessor: itemsIn, align: "end", hideBelow: "lg" },
      { id: "total", header: "Total", accessor: (o) => o.total, align: "end", cell: (o) => <span className="font-medium tabular-nums">{money(o.total)}</span> },
    ],
    [],
  )

  const exportOrders = (orders: Order[], what: string) => {
    const { text, rows: n } = ordersToCsv(state, orders)
    const name = `${storeSlug(state)}-orders-${what}.csv`
    downloadText(name, text)
    toaster.success(`Exported ${plural(n, "order")}`, { description: name })
  }
  const pick = (ids: string[]) => state.orders.filter((o) => ids.includes(String(o.number)))
  const open = unfulfilledCount(state)

  return (
    <div className={pageStack}>
      <PageHeader
        title="Orders"
        description={
          <>
            {plural(state.orders.length, "order")} in the last six months · <span className="tabular-nums">{open}</span> waiting to be sent
          </>
        }
        actions={
          <>
            <Button onClick={() => exportOrders(state.orders, "all")}>
              <Download {...icon} />
              Export
            </Button>
            {router.exists("/orders/new") && (
              <Button variant="primary" render={<a {...linkProps(router, "/orders/new")} />}>
                <Plus {...icon} />
                Create order
              </Button>
            )}
          </>
        }
      />
      <DataTable<Row>
        label="Orders"
        data={rows}
        columns={columns}
        getRowId={(o) => String(o.number)}
        selectable
        searchPlaceholder="Search by order, name or email"
        search={q.get("q") ?? ""}
        onSearchChange={(next) => router.setQuery({ q: next || null, page: null }, { replace: true })}
        filters={filters}
        onFiltersChange={(next) => router.setQuery({ ...Object.fromEntries(FILTER_KEYS.map((key) => [key, next[key]?.length ? next[key].join(",") : null])), page: null }, { replace: true })}
        sort={sort}
        onSortChange={(next) => router.setQuery({ sort: next && !(next.id === "number" && next.direction === "descending") ? `${next.direction === "descending" ? "-" : ""}${next.id}` : null, page: null }, { replace: true })}
        page={page}
        onPageChange={(next) => router.setQuery({ page: next ? String(next + 1) : null }, { replace: true })}
        defaultPageSize={20}
        pageSizes={[10, 20, 50, 100]}
        selected={selected}
        onSelectedChange={setSelected}
        emptyTitle="No orders match"
        emptyDescription="Try another search, or clear the filters."
        rowActions={(o) => (
          <>
            <MenuItem value="view" onClick={() => router.navigate(`/orders/${o.number}`)}>
              View order
            </MenuItem>
            <MenuItem value="fulfil" disabled={o.status === "cancelled" || o.fulfilment === "fulfilled"} onClick={() => setFulfilling(o)}>
              Fulfil order
            </MenuItem>
            <MenuItem
              value="copy"
              onClick={() => {
                void navigator.clipboard?.writeText(`#${o.number}`)
                toaster.success(`Copied #${o.number}`)
              }}
            >
              Copy order number
            </MenuItem>
            <MenuSeparator />
            <MenuItem value="cancel" destructive disabled={o.status === "cancelled"} onClick={() => setCancelling(o)}>
              Cancel order
            </MenuItem>
          </>
        )}
        bulkActions={(ids) => {
          const chosen = pick(ids)
          const sendable = chosen.filter((o) => o.status === "open" && o.fulfilment === "unfulfilled")
          return (
            <>
              <DataTableBulkAction
                icon={<Truck {...icon} />}
                label={sendable.length ? `Fulfil ${sendable.length}` : "Fulfil"}
                disabled={!sendable.length}
                onClick={() => {
                  sendable.forEach((o) => actions.fulfilOrder(o.number, { carrier: o.address.country === "Ireland" ? "An Post" : "DHL", tracking: trackingFor(o), notify: true }))
                  setSelected([])
                }}
              />
              <DataTableBulkAction icon={<Download {...icon} />} label="Export" onClick={() => exportOrders(chosen, `${chosen.length}-selected`)} />
            </>
          )
        }}
      />
      <FulfilDialog order={fulfilling} onClose={() => setFulfilling(null)} />
      <CancelDialog order={cancelling} onClose={() => setCancelling(null)} />
    </div>
  )
}

/** A believable tracking number for a bulk fulfilment: An Post's "CE…IE", DHL's ten digits. */
function trackingFor(o: Order) {
  const n = String(o.number * 7919).padStart(9, "0").slice(-9)
  return o.address.country === "Ireland" ? `CE${n}IE` : `${n}${o.number % 10}`
}

/* ------------------------------------------------------------------ an order */

const STEPS = [
  { value: "placed", label: "Placed" },
  { value: "paid", label: "Paid" },
  { value: "sent", label: "Sent" },
  { value: "delivered", label: "Delivered" },
]

/** The step the order is waiting on: everything before it is done. A delivered order rests on its last step. */
function progressOf(o: Order) {
  const reached = o.events.some((e) => e.kind === "delivered") ? 3 : o.fulfilment === "fulfilled" ? 2 : o.payment !== "pending" && o.payment !== "voided" ? 1 : 0
  return STEPS[Math.min(reached + 1, STEPS.length - 1)].value
}

export function OrderPage({ number }: { number: number }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const order = Number.isFinite(number) ? orderByNumber(state, number) : undefined
  const [panel, setPanel] = React.useState<"fulfil" | "refund" | "cancel" | null>(null)
  if (!order) return <ErrorPage code="404" />

  const customer = customerOf(state, order.customerId)
  const customerOrders = state.orders.filter((o) => o.customerId === order.customerId)
  const cancelled = order.status === "cancelled"
  const refundable = cancelled ? 0 : order.total - order.refunded
  const canFulfil = !cancelled && order.fulfilment === "unfulfilled"

  return (
    <div className={pageStack}>
      <PageHeader
        back={{ to: "/orders", label: "Back to orders" }}
        title={<span className="tabular-nums">#{order.number}</span>}
        badges={
          <>
            <PaymentBadge order={order} />
            <FulfilmentBadge order={order} />
          </>
        }
        description={
          <>
            {date(order.createdAt)} at {time(order.createdAt)} · {CHANNEL_LABEL[order.channel]}
          </>
        }
        actions={
          <>
            <Button disabled={refundable <= 0} onClick={() => setPanel("refund")}>
              <RotateCcw {...icon} />
              Refund
            </Button>
            {canFulfil && (
              <Button variant="primary" onClick={() => setPanel("fulfil")}>
                <Truck {...icon} />
                Fulfil order
              </Button>
            )}
            <Menu>
              <MenuTrigger render={<Button size="icon" aria-label="More actions" />}>
                <MoreHorizontal {...icon} />
              </MenuTrigger>
              <MenuContent align="end" className="w-56">
                {order.payment === "pending" && !cancelled && (
                  <MenuItem value="paid" onClick={() => actions.markPaid(order.number)}>
                    <MenuItemIcon>
                      <Receipt {...icon} />
                    </MenuItemIcon>
                    Mark as paid
                  </MenuItem>
                )}
                <MenuItem
                  value="copy-link"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.origin + router.href(`/orders/${order.number}`))
                    toaster.success("Link copied", { description: `Order #${order.number}` })
                  }}
                >
                  <MenuItemIcon>
                    <Copy {...icon} />
                  </MenuItemIcon>
                  Copy link to order
                </MenuItem>
                {customer && (
                  <MenuItem value="email" render={<a href={`mailto:${customer.email}?subject=${encodeURIComponent(`Your order #${order.number}`)}`} />}>
                    <MenuItemIcon>
                      <Mail {...icon} />
                    </MenuItemIcon>
                    Email the customer
                  </MenuItem>
                )}
                <MenuSeparator />
                <MenuItem value="cancel" destructive disabled={cancelled} onClick={() => setPanel("cancel")}>
                  <MenuItemIcon>
                    <Ban {...icon} />
                  </MenuItemIcon>
                  Cancel order
                </MenuItem>
              </MenuContent>
            </Menu>
          </>
        }
      />

      {!cancelled && (
        <Card className="py-4">
          <CardContent>
            <Stepper aria-label="Order progress" interactive={false} value={progressOf(order)} steps={STEPS}>
              <StepperList />
            </Stepper>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>{plural(itemsIn(order), "print")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              {order.lines.map((line, i) => (
                <React.Fragment key={line.variantId}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="flex items-center gap-3">
                    <PrintPhoto src={line.photo} className="size-12" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <InlineLink to={`/products/${line.productId}`} className="self-start">
                        {line.name}
                      </InlineLink>
                      <span className="text-[12px] text-muted-foreground">{line.variantTitle}</span>
                    </div>
                    <span className="text-[13px] text-muted-foreground tabular-nums">
                      {money(line.price)} × {line.quantity}
                    </span>
                    <span className="w-20 text-end text-[13px] font-medium tabular-nums">{money(line.price * line.quantity)}</span>
                  </div>
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>{PAYMENT[order.payment].label}</CardDescription>
              {order.payment === "pending" && !cancelled && (
                <CardAction>
                  <Button size="sm" onClick={() => actions.markPaid(order.number)}>
                    Mark as paid
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2.5 text-[13px] tabular-nums">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-end">{money(order.subtotal)}</dd>
                {order.discount > 0 && (
                  <>
                    <dt className="text-muted-foreground">Discount{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
                    <dd className="text-end">−{money(order.discount)}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Shipping · {order.shippingMethod}</dt>
                <dd className="text-end">{money(order.shipping)}</dd>
                <dt className="text-muted-foreground">VAT included (23%)</dt>
                <dd className="text-end">{money(order.tax)}</dd>
                <div aria-hidden className="col-span-2 my-0.5 border-t border-border" />
                <dt className="font-semibold">Total</dt>
                <dd className="text-end font-semibold">{money(order.total)}</dd>
                {order.refunded > 0 && (
                  <>
                    <dt className="text-muted-foreground">Refunded</dt>
                    <dd className="text-end text-destructive">−{money(order.refunded)}</dd>
                    <dt className="font-medium">Net</dt>
                    <dd className="text-end font-medium">{money(order.total - order.refunded)}</dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          <OrderTimeline order={order} />
        </div>

        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <PersonAvatar person={customer} size="lg" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <InlineLink to={`/customers/${customer.id}`} className="self-start">
                      {customer.name}
                    </InlineLink>
                    <span className="text-[12px] text-muted-foreground">
                      {plural(customerOrders.length, "order")}
                      {customer.company ? ` · ${customer.company}` : ""}
                    </span>
                  </div>
                </div>
                <DescriptionList aria-label="Contact">
                  <DescriptionListItem>
                    <DescriptionListTerm>Email</DescriptionListTerm>
                    <DescriptionListDetails>
                      <DescriptionListValue className="truncate">{customer.email}</DescriptionListValue>
                      <DescriptionListActions>
                        <DescriptionListCopy />
                      </DescriptionListActions>
                    </DescriptionListDetails>
                  </DescriptionListItem>
                  {customer.phone && (
                    <DescriptionListItem>
                      <DescriptionListTerm>Phone</DescriptionListTerm>
                      <DescriptionListDetails>
                        <DescriptionListValue>{customer.phone}</DescriptionListValue>
                      </DescriptionListDetails>
                    </DescriptionListItem>
                  )}
                </DescriptionList>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
              <CardDescription>{order.shippingMethod}</CardDescription>
            </CardHeader>
            <CardContent>
              <DescriptionList aria-label="Shipping">
                <DescriptionListItem>
                  <DescriptionListTerm>Address</DescriptionListTerm>
                  <DescriptionListDetails>
                    <DescriptionListValue>
                      {order.address.line1}, {order.address.city} {order.address.postcode}, {order.address.country}
                    </DescriptionListValue>
                    <DescriptionListActions>
                      <DescriptionListCopy />
                    </DescriptionListActions>
                  </DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Tracking</DescriptionListTerm>
                  <DescriptionListDetails>
                    <DescriptionListValue>{order.tracking ? `${order.tracking.carrier} ${order.tracking.number}` : cancelled ? "Not sent" : "Not sent yet"}</DescriptionListValue>
                    {order.tracking && (
                      <DescriptionListActions>
                        <DescriptionListCopy />
                      </DescriptionListActions>
                    )}
                  </DescriptionListDetails>
                </DescriptionListItem>
              </DescriptionList>
            </CardContent>
          </Card>
        </div>
      </div>

      <FulfilDialog order={panel === "fulfil" ? order : null} onClose={() => setPanel(null)} />
      <RefundDialog order={panel === "refund" ? order : null} onClose={() => setPanel(null)} />
      <CancelDialog order={panel === "cancel" ? order : null} onClose={() => setPanel(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------ the timeline */

function OrderTimeline({ order }: { order: Order }) {
  const { actions } = useStore()
  const [note, setNote] = React.useState("")
  const events = [...order.events].reverse()
  const add = () => {
    const text = note.trim()
    if (!text) return
    actions.addOrderNote(order.number, text)
    setNote("")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Everything that happened to this order, newest first</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Textarea
            aria-label="Add a note"
            placeholder="Add a note for the team"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) add()
            }}
            className="min-h-[72px]"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-muted-foreground">Only the team sees notes.</span>
            <Button size="sm" disabled={!note.trim()} onClick={add}>
              Add note
            </Button>
          </div>
        </div>
        <Timeline aria-label={`Order ${order.number} timeline`}>
          {events.map((event, i) => (
            <TimelineItem key={event.id} status={i === 0 ? "current" : "complete"}>
              <TimelineMarker />
              {i < events.length - 1 && <TimelineConnector />}
              <TimelineTitle>{event.text}</TimelineTitle>
              <TimelineTime>
                {day(event.at)}, {time(event.at)}
              </TimelineTime>
              {event.by && <TimelineDescription>{event.by}</TimelineDescription>}
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ the flows */

const CARRIERS = [
  { value: "An Post", label: "An Post, tracked" },
  { value: "DHL", label: "DHL Express" },
  { value: "DPD", label: "DPD" },
]

export function FulfilDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { actions } = useStore()
  const [carrier, setCarrier] = React.useState("An Post")
  const [tracking, setTracking] = React.useState("")
  const [notify, setNotify] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!order) return
    setCarrier(order.address.country === "Ireland" ? "An Post" : "DHL")
    setTracking("")
    setNotify(true)
    setError(null)
  }, [order])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!order) return
    const value = tracking.trim().toUpperCase()
    if (value.length < 8) return setError("Enter the tracking number from the label: at least 8 letters and digits.")
    actions.fulfilOrder(order.number, { carrier, tracking: value, notify })
    onClose()
  }

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:460px]">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>Fulfil order #{order?.number}</DialogTitle>
            <DialogDescription>{order ? `${plural(itemsIn(order), "print")} to ${order.address.city}, ${order.address.country}.` : ""}</DialogDescription>
          </DialogHeader>
          <LabelledField label="Carrier">
            <Choice label="Carrier" value={carrier} onChange={setCarrier} options={CARRIERS} />
          </LabelledField>
          <LabelledField label="Tracking number" error={error} hint="From the shipping label.">
            <Input
              value={tracking}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder={carrier === "An Post" ? "CE123456789IE" : "1234567890"}
              onChange={(event) => {
                setTracking(event.target.value)
                setError(null)
              }}
            />
          </LabelledField>
          <label className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Email the customer</span>
              <span className="text-[12px] text-muted-foreground">Sends the tracking link.</span>
            </span>
            <Switch checked={notify} onCheckedChange={(next) => setNotify(next === true)} />
          </label>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit">
              <Truck {...icon} />
              Fulfil order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const REASONS = ["The customer asked", "Damaged in transit", "Wrong item sent", "Print quality", "Goodwill"].map((value) => ({ value, label: value }))

function RefundDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { actions } = useStore()
  const refundable = order ? order.total - order.refunded : 0
  const [amount, setAmount] = React.useState<number | null>(null)
  const [reason, setReason] = React.useState(REASONS[0].value)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!order) return
    setAmount((order.total - order.refunded) / 100)
    setReason(REASONS[0].value)
    setError(null)
  }, [order])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!order) return
    const cents = Math.round((amount ?? 0) * 100)
    if (cents <= 0) return setError("Enter an amount above €0.")
    if (cents > refundable) return setError(`You can refund up to ${money(refundable)}.`)
    actions.refundOrder(order.number, cents, reason)
    onClose()
  }

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:460px]">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>Refund order #{order?.number}</DialogTitle>
            <DialogDescription>Up to {money(refundable)} can go back to the customer's card.</DialogDescription>
          </DialogHeader>
          <LabelledField label="Amount" error={error}>
            <NumberInput
              value={amount}
              min={0}
              step={1}
              format={{ style: "currency", currency: "EUR" }}
              onValueChange={(next) => {
                setAmount(next)
                setError(null)
              }}
            >
              <NumberInputGroup>
                <NumberInputControl aria-label="Refund amount" />
              </NumberInputGroup>
            </NumberInput>
          </LabelledField>
          <LabelledField label="Reason">
            <Choice label="Reason" value={reason} onChange={setReason} options={REASONS} />
          </LabelledField>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="destructive" type="submit" data-agent-confirm={`Refunds money on order #${order?.number}`}>
              Refund {amount ? money(Math.round(amount * 100)) : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const CANCEL_REASONS = ["The customer changed their mind", "Out of stock", "Payment declined", "Suspected fraud", "Other"].map((value) => ({ value, label: value }))

export function CancelDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { actions } = useStore()
  const [reason, setReason] = React.useState(CANCEL_REASONS[0].value)
  const paid = order?.payment === "paid"
  return (
    <AlertDialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order #{order?.number}?</AlertDialogTitle>
          <AlertDialogDescription>
            {paid ? `The ${order ? money(order.total) : ""} payment goes back to the customer in full.` : "Its payment is voided."} This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <LabelledField label="Reason">
          <Choice label="Reason for cancelling" value={reason} onChange={setReason} options={CANCEL_REASONS} />
        </LabelledField>
        <AlertDialogFooter>
          <AlertDialogClose>Keep order</AlertDialogClose>
          <AlertDialogClose
            variant="destructive"
            data-agent-confirm={`Cancels order #${order?.number}`}
            onClick={() => {
              if (order) actions.cancelOrder(order.number, reason)
              onClose()
            }}
          >
            Cancel order
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

