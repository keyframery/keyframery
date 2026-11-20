"use client"

/* Customers: everyone who has bought (search, retail or wholesale, tags, email consent, what each
   has spent) and a customer's own page (lifetime figures, every order, contact details, tags,
   email consent and a private note), with Add and Edit. Figures are worked out from the orders,
   so a refund or a new order changes them at once. */

import { Download, Mail, Pencil, Plus, ShoppingBag, UserPlus, X } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { MenuItem } from "@/components/ui/menu"
import { Stat, StatGroup, StatLabel, StatValue } from "@/components/ui/stat"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import { type Customer, iso, type Order } from "./data"
import { ErrorPage } from "./errors"
import { ago, count, date, money, moneyWhole, plural, when } from "./format"
import { csvCell, downloadText, FulfilmentBadge, icon, InlineLink, itemsIn, LabelledField, pageStack, PageHeader, PaymentBadge, PersonAvatar } from "./kit"
import { linkProps, useRouter } from "./router"
import { toaster, useStore } from "./store"

/** What a customer has bought: kept orders, net of refunds. */
function historyOf(orders: Order[], customerId: string) {
  const mine = orders.filter((o) => o.customerId === customerId).sort((a, b) => b.number - a.number)
  const kept = mine.filter((o) => o.status !== "cancelled")
  const spent = kept.reduce((sum, o) => sum + o.total - o.refunded, 0)
  return { orders: mine, count: kept.length, spent, average: kept.length ? Math.round(spent / kept.length) : 0, last: mine[0]?.createdAt }
}

/* ------------------------------------------------------------------ the list */

type Row = Customer & { orderCount: number; spent: number; last?: string; kind: "Retail" | "Wholesale" }

export function CustomersPage() {
  const { state } = useStore()
  const router = useRouter()
  const [selected, setSelected] = React.useState<string[]>([])
  const [adding, setAdding] = React.useState(false)

  const rows = React.useMemo<Row[]>(
    () =>
      state.customers.map((c) => {
        const h = historyOf(state.orders, c.id)
        return { ...c, orderCount: h.count, spent: h.spent, last: h.last, kind: c.company ? "Wholesale" : "Retail" }
      }),
    [state.customers, state.orders],
  )
  const tags = React.useMemo(() => [...new Set(state.customers.flatMap((c) => c.tags))].sort(), [state.customers])

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "name",
        header: "Customer",
        accessor: (c) => `${c.name} ${c.email} ${c.company ?? ""}`,
        sortValue: (c) => c.name,
        searchable: true,
        hideable: false,
        sticky: true,
        cell: (c) => (
          <span className="flex min-w-0 items-center gap-2.5">
            <PersonAvatar person={c} size="md" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <InlineLink to={`/customers/${c.id}`} className="h-6 self-start">
                {c.name}
              </InlineLink>
              <span className="truncate text-[12px] text-muted-foreground">{c.company ?? c.email}</span>
            </span>
          </span>
        ),
      },
      { id: "kind", header: "Type", hideBelow: "lg", filter: { options: [{ value: "Retail" }, { value: "Wholesale" }] }, cell: (c) => <span className="text-muted-foreground">{c.kind}</span> },
      { id: "location", header: "Location", accessor: (c) => `${c.address.city}, ${c.address.country}`, hideBelow: "md", cell: (c) => <span className="text-muted-foreground">{`${c.address.city}, ${c.address.country}`}</span> },
      {
        id: "tags",
        header: "Tags",
        accessor: (c) => c.tags,
        hideBelow: "lg",
        filter: { options: tags.map((value) => ({ value })) },
        cell: (c) => (
          <span className="flex flex-wrap gap-1">
            {c.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </span>
        ),
      },
      {
        id: "marketing",
        header: "Email",
        accessor: (c) => (c.marketing ? "Subscribed" : "Not subscribed"),
        hideBelow: "lg",
        filter: { title: "Email consent", options: [{ value: "Subscribed" }, { value: "Not subscribed" }] },
        cell: (c) => <span className={c.marketing ? "" : "text-muted-foreground"}>{c.marketing ? "Subscribed" : "No"}</span>,
      },
      { id: "orders", header: "Orders", accessor: (c) => c.orderCount, align: "end", cell: (c) => <span className="tabular-nums">{count(c.orderCount)}</span> },
      { id: "spent", header: "Spent", accessor: (c) => c.spent, align: "end", cell: (c) => <span className="font-medium tabular-nums">{moneyWhole(c.spent)}</span> },
      { id: "last", header: "Last order", accessor: (c) => c.last ?? "", hideBelow: "sm", cell: (c) => <span className="text-muted-foreground tabular-nums">{c.last ? ago(c.last) : "None yet"}</span> },
    ],
    [tags],
  )

  const exportCustomers = (list: Row[]) => {
    const header = ["Name", "Email", "Phone", "Company", "City", "Country", "Tags", "Email consent", "Orders", "Spent (EUR)", "Customer since"]
    const lines = list.map((c) => [c.name, c.email, c.phone ?? "", c.company ?? "", c.address.city, c.address.country, c.tags.join("; "), c.marketing ? "Yes" : "No", c.orderCount, (c.spent / 100).toFixed(2), c.createdAt.slice(0, 10)])
    const name = `customers-${list.length}.csv`
    downloadText(name, [header, ...lines].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n")
    toaster.success(`Exported ${plural(list.length, "customer")}`, { description: name })
  }
  const wholesale = state.customers.filter((c) => c.company).length

  return (
    <div className={pageStack}>
      <PageHeader
        title="Customers"
        description={`${plural(state.customers.length, "customer")} · ${count(wholesale)} shops and galleries buy wholesale`}
        actions={
          <>
            <Button onClick={() => exportCustomers(rows)}>
              <Download {...icon} />
              Export
            </Button>
            <Button variant="primary" onClick={() => setAdding(true)}>
              <UserPlus {...icon} />
              Add customer
            </Button>
          </>
        }
      />
      <DataTable<Row>
        label="Customers"
        className="[--data-table-row-height:var(--br-row-tall,3.5rem)]"
        data={rows}
        columns={columns}
        getRowId={(c) => c.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        defaultSort={{ id: "spent", direction: "descending" }}
        defaultPageSize={20}
        pageSizes={[10, 20, 50, 100]}
        searchPlaceholder="Search by name, email or shop"
        emptyTitle="No customers match"
        emptyDescription="Try another name, or clear the filters."
        rowActions={(c) => (
          <>
            <MenuItem value="view" onClick={() => router.navigate(`/customers/${c.id}`)}>
              View customer
            </MenuItem>
            {router.exists("/orders/new") && (
              <MenuItem value="order" onClick={() => router.navigate(`/orders/new?customer=${c.id}`)}>
                Create order
              </MenuItem>
            )}
            <MenuItem
              value="copy"
              onClick={() => {
                void navigator.clipboard?.writeText(c.email)
                toaster.success("Email copied", { description: c.email })
              }}
            >
              Copy email
            </MenuItem>
          </>
        )}
        bulkActions={(ids) => <DataTableBulkAction icon={<Download {...icon} />} label="Export" onClick={() => exportCustomers(rows.filter((r) => ids.includes(r.id)))} />}
      />
      <CustomerDialog open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}

/* ------------------------------------------------------------------ add and edit */

type Form = { name: string; email: string; phone: string; company: string; line1: string; city: string; postcode: string; country: string }

function CustomerDialog({ open, onClose, customer }: { open: boolean; onClose: () => void; customer?: Customer }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const empty: Form = { name: "", email: "", phone: "", company: "", line1: "", city: "", postcode: "", country: "Ireland" }
  const [form, setForm] = React.useState<Form>(empty)
  const [errors, setErrors] = React.useState<Partial<Record<keyof Form, string>>>({})
  React.useEffect(() => {
    if (!open) return
    setErrors({})
    setForm(customer ? { name: customer.name, email: customer.email, phone: customer.phone ?? "", company: customer.company ?? "", ...customer.address } : empty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = "Enter their name."
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) next.email = "Enter an email address like name@example.com."
    else if (state.customers.some((c) => c.email === email && c.id !== customer?.id)) next.email = "A customer with this email already exists."
    if (!form.city.trim()) next.city = "Enter the town or city."
    if (!form.country.trim()) next.country = "Enter the country."
    setErrors(next)
    if (Object.keys(next).length) return
    const fields = {
      name: form.name.trim(),
      email,
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      address: { line1: form.line1.trim(), city: form.city.trim(), postcode: form.postcode.trim(), country: form.country.trim() },
    }
    if (customer) actions.updateCustomer(customer.id, fields)
    else {
      const id = `c${Date.now().toString(36)}`
      actions.createCustomer({ id, ...fields, createdAt: iso(Date.now()), tags: fields.company ? ["Wholesale"] : [], note: "", marketing: false })
      router.navigate(`/customers/${id}`)
    }
    onClose()
  }

  const field = (key: keyof Form, label: string, props: React.ComponentProps<typeof Input> = {}, className?: string) => (
    <LabelledField label={label} error={errors[key]} className={className}>
      <Input value={form[key]} onChange={(event) => (setForm((f) => ({ ...f, [key]: event.target.value })), setErrors((e) => ({ ...e, [key]: undefined })))} {...props} />
    </LabelledField>
  )

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:520px]">
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <DialogHeader>
            <DialogTitle>{customer ? `Edit ${customer.name}` : "Add customer"}</DialogTitle>
            <DialogDescription>{customer ? "Changes show on their orders and invoices from now on." : "Add someone who ordered by phone, by email or in person."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("name", "Name", { autoFocus: true, autoComplete: "off" }, "sm:col-span-2")}
            {field("email", "Email", { type: "email", autoComplete: "off" })}
            {field("phone", "Phone", { type: "tel", autoComplete: "off" })}
            {field("company", "Shop or gallery (wholesale)", {}, "sm:col-span-2")}
            {field("line1", "Street address", {}, "sm:col-span-2")}
            {field("city", "Town or city")}
            {field("postcode", "Postcode")}
            {field("country", "Country", {}, "sm:col-span-2")}
          </div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit">
              {customer ? "Save" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ a customer */

export function CustomerPage({ id }: { id: string }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const customer = state.customers.find((c) => c.id === id)
  const [editing, setEditing] = React.useState(false)
  const [note, setNote] = React.useState(customer?.note ?? "")
  const [tag, setTag] = React.useState("")
  if (!customer) return <ErrorPage code="404" />

  const h = historyOf(state.orders, customer.id)
  const addTag = () => {
    const t = tag.trim()
    if (!t || customer.tags.some((x) => x.toLowerCase() === t.toLowerCase())) return setTag("")
    actions.updateCustomer(customer.id, { tags: [...customer.tags, t] }, "Tag added")
    setTag("")
  }

  return (
    <div className={pageStack}>
      <PageHeader
        back={{ to: "/customers", label: "Back to customers" }}
        lead={<PersonAvatar person={customer} size="lg" />}
        title={customer.name}
        badges={customer.company && <Badge variant="secondary">Wholesale</Badge>}
        description={`${customer.company ? `${customer.company} · ` : ""}${customer.address.city}, ${customer.address.country} · customer since ${date(customer.createdAt)}`}
        actions={
          <>
            <Button render={<a href={`mailto:${customer.email}`} />}>
              <Mail {...icon} />
              Email
            </Button>
            <Button onClick={() => setEditing(true)}>
              <Pencil {...icon} />
              Edit
            </Button>
            {router.exists("/orders/new") && (
              <Button variant="primary" render={<a {...linkProps(router, `/orders/new?customer=${customer.id}`)} />}>
                <Plus {...icon} />
                Create order
              </Button>
            )}
          </>
        }
      />

      <StatGroup aria-label={`${customer.name} in figures`}>
        <Stat label="Lifetime value" value={h.spent / 100} formatValue={(v) => moneyWhole(Math.round(v * 100))}>
          <StatLabel />
          <StatValue />
        </Stat>
        <Stat label="Orders" value={h.count} formatValue={count}>
          <StatLabel />
          <StatValue />
        </Stat>
        <Stat label="Average order" value={h.average / 100} formatValue={(v) => money(Math.round(v * 100))}>
          <StatLabel />
          <StatValue />
        </Stat>
        <Stat label="Last order" value={h.last ? Math.round((Date.now() - Date.parse(h.last)) / 86_400_000) : 0} formatValue={(v) => (h.last ? (v < 1 ? "Today" : `${plural(v, "day")} ago`) : "None")}>
          <StatLabel />
          <StatValue />
        </Stat>
      </StatGroup>

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card className="gap-3">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>{plural(h.orders.length, "order")}, newest first</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto px-[calc(var(--card-padding,1.25rem)-0.75rem)]">
              {h.orders.length ? (
                <Table aria-label={`Orders from ${customer.name}`} className="w-full min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-start">Order</TableHead>
                      <TableHead className="text-start">Date</TableHead>
                      <TableHead className="text-start">Status</TableHead>
                      <TableHead className="hidden text-end md:table-cell">Items</TableHead>
                      <TableHead className="text-end">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {h.orders.slice(0, 12).map((o) => (
                      <TableRow key={o.number}>
                        <TableCell>
                          <InlineLink to={`/orders/${o.number}`} label={`Order ${o.number}`}>
                            #{o.number}
                          </InlineLink>
                        </TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{when(o.createdAt)}</TableCell>
                        <TableCell>
                          <span className="flex gap-1.5">
                            <PaymentBadge order={o} />
                            <FulfilmentBadge order={o} />
                          </span>
                        </TableCell>
                        <TableCell className="hidden text-end tabular-nums md:table-cell">{itemsIn(o)}</TableCell>
                        <TableCell className="text-end font-medium tabular-nums">{money(o.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyTitle>No orders yet</EmptyTitle>
                    <EmptyDescription>Their first order will show here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
            {h.orders.length > 12 && router.exists("/orders") && (
              <CardContent>
                <Button size="sm" render={<a {...linkProps(router, `/orders?q=${encodeURIComponent(customer.email)}`)} />}>
                  <ShoppingBag {...icon} />
                  All {count(h.orders.length)} orders
                </Button>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Note</CardTitle>
              <CardDescription>Only the team sees it.</CardDescription>
              <CardAction>
                <Button size="sm" disabled={note === customer.note} onClick={() => actions.updateCustomer(customer.id, { note }, "Note saved")}>
                  Save note
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Textarea aria-label="Note about this customer" value={note} rows={3} placeholder="Framing preferences, gallery contact, anything worth remembering" onChange={(event) => setNote(event.target.value)} />
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
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
                <DescriptionListItem>
                  <DescriptionListTerm>Phone</DescriptionListTerm>
                  <DescriptionListDetails>
                    <DescriptionListValue>{customer.phone ?? "Not given"}</DescriptionListValue>
                  </DescriptionListDetails>
                </DescriptionListItem>
                <DescriptionListItem>
                  <DescriptionListTerm>Address</DescriptionListTerm>
                  <DescriptionListDetails>
                    <DescriptionListValue>
                      {[customer.address.line1, `${customer.address.city} ${customer.address.postcode}`.trim(), customer.address.country].filter(Boolean).join(", ")}
                    </DescriptionListValue>
                    <DescriptionListActions>
                      <DescriptionListCopy />
                    </DescriptionListActions>
                  </DescriptionListDetails>
                </DescriptionListItem>
              </DescriptionList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Group customers in the list and in exports.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {customer.tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                  {customer.tags.map((t) => (
                    <li key={t}>
                      <Badge variant="outline" className="gap-1 pe-0.5">
                        {t}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove the ${t} tag`}
                          className="size-4 rounded-full [&_svg]:size-3"
                          onClick={() => actions.updateCustomer(customer.id, { tags: customer.tags.filter((x) => x !== t) }, "Tag removed")}
                        >
                          <X {...icon} />
                        </Button>
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  addTag()
                }}
              >
                <Input aria-label="New tag" placeholder="Add a tag" value={tag} onChange={(event) => setTag(event.target.value)} />
                <Button type="submit" disabled={!tag.trim()}>
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <label className="flex items-center justify-between gap-4 text-[13px]">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">Email newsletter</span>
                  <span className="text-[12px] text-muted-foreground">{customer.marketing ? "Agreed to receive the newsletter." : "Has not agreed to marketing email."}</span>
                </span>
                <Switch checked={customer.marketing} onCheckedChange={(next) => actions.updateCustomer(customer.id, { marketing: next === true }, next ? "Subscribed to the newsletter" : "Unsubscribed")} />
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
      <CustomerDialog open={editing} onClose={() => setEditing(false)} customer={customer} />
    </div>
  )
}
