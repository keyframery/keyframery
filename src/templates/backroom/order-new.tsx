"use client"

/* Create order: a four-step form for an order taken by phone, email or at a fair. Customer, then
   prints, then shipping, then a review with how it's paid. The prices, shipping and VAT follow the
   same rules as the store's own orders (data.ts), and the new order lands in the list, the
   dashboard and the customer's history. */

import { Minus, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox, ComboboxContent, ComboboxControl, ComboboxEmpty, ComboboxInput, ComboboxItems, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Separator } from "@/components/ui/separator"
import { Stepper, StepperList, StepperPanel } from "@/components/ui/stepper"

import { type Address, type Channel, type Customer, type OrderLine, type Product, variantTitle } from "./data"
import { money, plural } from "./format"
import { Choice, icon, LabelledField, pageStack, PageHeader, PersonAvatar, PrintPhoto } from "./kit"
import { useRouter } from "./router"
import { CHANNEL_LABEL, useStore } from "./store"

const STEPS = [
  { value: "customer", label: "Customer" },
  { value: "items", label: "Prints" },
  { value: "shipping", label: "Shipping" },
  { value: "review", label: "Review" },
]

type Ship = "standard" | "collect"

/** Shipping as the shop charges it: wholesale goes by insured courier, retail is free from €150. */
function shippingFor(country: string, subtotal: number, channel: Channel, ship: Ship) {
  if (ship === "collect") return { cost: 0, method: "Collected from the studio" }
  if (channel === "wholesale") return { cost: 1800, method: "Courier, insured" }
  if (subtotal >= 15000) return { cost: 0, method: country === "Ireland" ? "An Post, tracked (free)" : "DHL Express (free)" }
  return country === "Ireland" ? { cost: 600, method: "An Post, tracked" } : { cost: 1200, method: "DHL Express" }
}

export function NewOrderPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const [step, setStep] = React.useState("customer")
  const [customerId, setCustomerId] = React.useState<string | null>(router.query.get("customer"))
  const [lines, setLines] = React.useState<OrderLine[]>([])
  const [address, setAddress] = React.useState<Address | null>(null)
  const [ship, setShip] = React.useState<Ship>("standard")
  const [paid, setPaid] = React.useState<"paid" | "invoice">("paid")
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const customer = state.customers.find((c) => c.id === customerId)
  const channel: Channel = customer?.company ? "wholesale" : "online"
  const to = address ?? customer?.address ?? null
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const shipping = shippingFor(to?.country ?? "Ireland", subtotal, channel, ship)
  const total = subtotal + shipping.cost
  const index = STEPS.findIndex((s) => s.value === step)

  /* Each step checks its own part before the next one opens. */
  const check = (at: string) => {
    const next: Record<string, string> = {}
    if (at === "customer" && !customer) next.customer = "Choose who the order is for."
    if (at === "items" && !lines.length) next.items = "Add at least one print."
    if (at === "shipping" && ship === "standard" && to) {
      if (!to.line1.trim()) next.line1 = "Enter the street address."
      if (!to.city.trim()) next.city = "Enter the town or city."
      if (!to.country.trim()) next.country = "Enter the country."
    }
    setErrors(next)
    return !Object.keys(next).length
  }
  const go = (value: string) => {
    const target = STEPS.findIndex((s) => s.value === value)
    if (target > index && !STEPS.slice(index, target).every((s) => check(s.value))) return
    setErrors({})
    setStep(value)
  }

  const create = () => {
    if (!customer || !to || !STEPS.slice(0, 3).every((s) => check(s.value))) return
    const now = new Date().toISOString()
    const number = actions.createOrder({
      customerId: customer.id,
      createdAt: now,
      channel,
      lines,
      subtotal,
      discount: 0,
      shipping: shipping.cost,
      shippingMethod: shipping.method,
      tax: Math.round((total * 23) / 123),
      total,
      refunded: 0,
      payment: paid === "paid" ? "paid" : "pending",
      fulfilment: "unfulfilled",
      status: "open",
      address: to,
    })
    router.navigate(`/orders/${number}`)
  }

  return (
    <div className={pageStack}>
      <PageHeader back={{ to: "/orders", label: "Back to orders" }} title="Create order" description="For an order taken by phone, by email or at a fair." />
      <Stepper aria-label="Create order" steps={STEPS} value={step} onValueChange={go} className="flex flex-col gap-[var(--br-section)]">
        <Card className="py-4">
          <CardContent>
            <StepperList />
          </CardContent>
        </Card>
        <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="min-w-0">
            <div className="grid *:[grid-area:1/1]">
              <StepperPanel value="customer">
                <CustomerStep customerId={customerId} onChange={(id) => (setCustomerId(id), setAddress(null), setErrors({}))} error={errors.customer} />
              </StepperPanel>
              <StepperPanel value="items">
                <ItemsStep lines={lines} setLines={(next) => (setLines(next), setErrors({}))} wholesale={channel === "wholesale"} error={errors.items} />
              </StepperPanel>
              <StepperPanel value="shipping">
                <ShippingStep
                  ship={ship}
                  setShip={setShip}
                  address={to}
                  setAddress={(next) => (setAddress(next), setErrors({}))}
                  errors={errors}
                  options={[
                    { value: "standard", label: shippingFor(to?.country ?? "Ireland", subtotal, channel, "standard").method, cost: shippingFor(to?.country ?? "Ireland", subtotal, channel, "standard").cost },
                    { value: "collect", label: "Collected from the studio", cost: 0 },
                  ]}
                />
              </StepperPanel>
              <StepperPanel value="review">
                <CardHeader>
                  <CardTitle>How is it paid?</CardTitle>
                  <CardDescription>Mark it paid if you took the money, or send an invoice due in 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup aria-label="Payment" value={paid} onValueChange={(v) => setPaid(v as "paid" | "invoice")} className="grid gap-2 sm:grid-cols-2">
                    <RadioTile value="paid" title="Paid" hint="Card on the phone, cash or bank transfer." />
                    <RadioTile value="invoice" title="Send an invoice" hint={customer ? `To ${customer.email}` : "To the customer"} />
                  </RadioGroup>
                </CardContent>
              </StepperPanel>
            </div>
            <CardContent className="mt-2 flex items-center justify-between border-t border-border pt-4">
              <Button variant="ghost" disabled={index === 0} onClick={() => go(STEPS[index - 1].value)}>
                Back
              </Button>
              {index < STEPS.length - 1 ? (
                <Button variant="primary" onClick={() => go(STEPS[index + 1].value)}>
                  Continue
                </Button>
              ) : (
                <Button variant="primary" onClick={create}>
                  Create order · {money(total)}
                </Button>
              )}
            </CardContent>
          </Card>
          <Summary customer={customer} channel={channel} lines={lines} subtotal={subtotal} shipping={shipping} total={total} />
        </div>
      </Stepper>
    </div>
  )
}

/* ------------------------------------------------------------------ the steps */

function CustomerStep({ customerId, onChange, error }: { customerId: string | null; onChange: (id: string | null) => void; error?: string }) {
  const { state } = useStore()
  const items = React.useMemo(
    () => [...state.customers].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.id, label: c.company ? `${c.name}, ${c.company}` : c.name })),
    [state.customers],
  )
  const chosen = state.customers.find((c) => c.id === customerId)
  return (
    <>
      <CardHeader>
        <CardTitle>Who is it for?</CardTitle>
        <CardDescription>Wholesale customers get trade prices and insured courier delivery.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LabelledField label="Customer" error={error}>
          <Combobox items={items} value={customerId} onValueChange={(v) => onChange(typeof v === "string" ? v : null)}>
            <ComboboxControl>
              <ComboboxInput placeholder="Search by name or shop" aria-label="Customer" />
              <ComboboxTrigger aria-label="Show customers" />
            </ComboboxControl>
            <ComboboxContent>
              <ComboboxEmpty>No customer has that name.</ComboboxEmpty>
              <ComboboxList>{(list) => <ComboboxItems items={list.items} />}</ComboboxList>
            </ComboboxContent>
          </Combobox>
        </LabelledField>
        {chosen && <CustomerCard customer={chosen} />}
      </CardContent>
    </>
  )
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] bg-muted/60 p-3">
      <PersonAvatar person={customer} size="lg" />
      <div className="flex min-w-0 flex-col gap-0.5 text-[13px]">
        <span className="font-medium">{customer.name}</span>
        <span className="truncate text-muted-foreground">
          {customer.email} · {customer.address.city}, {customer.address.country}
        </span>
      </div>
    </div>
  )
}

function ItemsStep({ lines, setLines, wholesale, error }: { lines: OrderLine[]; setLines: (next: OrderLine[]) => void; wholesale: boolean; error?: string }) {
  const { state } = useStore()
  const active = state.products.filter((p) => p.status === "active")
  const [productId, setProductId] = React.useState(active[0]?.id ?? "")
  const product = active.find((p) => p.id === productId) as Product | undefined
  const [variantId, setVariantId] = React.useState(product?.variants[0].id ?? "")
  const variant = product?.variants.find((v) => v.id === variantId) ?? product?.variants[0]
  const priceOf = (cents: number) => (wholesale ? Math.round((cents * 0.6) / 100) * 100 : cents)

  const add = () => {
    if (!product || !variant) return
    const existing = lines.find((l) => l.variantId === variant.id)
    if (existing) return setLines(lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l)))
    setLines([...lines, { productId: product.id, variantId: variant.id, name: product.name, variantTitle: variantTitle(variant), photo: product.photo, quantity: wholesale ? 2 : 1, price: priceOf(variant.price) }])
  }
  const change = (line: OrderLine, by: number) => setLines(lines.flatMap((l) => (l === line ? (l.quantity + by > 0 ? [{ ...l, quantity: l.quantity + by }] : []) : [l])))

  return (
    <>
      <CardHeader>
        <CardTitle>Prints</CardTitle>
        <CardDescription>{wholesale ? "Trade price: 40% off, unframed sizes sell best." : "Retail prices, VAT included."}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-end">
          <LabelledField label="Print">
            <Choice
              label="Print"
              value={productId}
              onChange={(id) => {
                setProductId(id)
                setVariantId(active.find((p) => p.id === id)?.variants[0].id ?? "")
              }}
              options={active.map((p) => ({ value: p.id, label: p.name }))}
            />
          </LabelledField>
          <LabelledField label="Size and finish">
            <Choice
              label="Size and finish"
              value={variant?.id ?? null}
              onChange={setVariantId}
              options={(product?.variants ?? []).map((v) => ({ value: v.id, label: `${variantTitle(v)} · ${money(priceOf(v.price))}`, disabled: v.stock === 0 }))}
            />
          </LabelledField>
          <Button onClick={add} disabled={!variant || variant.stock === 0}>
            <Plus {...icon} />
            Add
          </Button>
        </div>
        {error && <p className="text-[12px] text-destructive">{error}</p>}
        {lines.length ? (
          <ul className="flex flex-col" aria-label="Prints in this order">
            {lines.map((line, i) => (
              <li key={line.variantId}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center gap-3">
                  <PrintPhoto src={line.photo} />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-[13px]">
                    <span className="truncate font-medium">{line.name}</span>
                    <span className="truncate text-[12px] text-muted-foreground">
                      {line.variantTitle} · {money(line.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon-sm" variant="ghost" aria-label={`One fewer ${line.name}`} onClick={() => change(line, -1)}>
                      <Minus {...icon} />
                    </Button>
                    <span className="w-6 text-center text-[13px] tabular-nums" aria-label={`${line.quantity} of ${line.name}`}>
                      {line.quantity}
                    </span>
                    <Button size="icon-sm" variant="ghost" aria-label={`One more ${line.name}`} onClick={() => change(line, 1)}>
                      <Plus {...icon} />
                    </Button>
                  </div>
                  <span className="w-20 text-end text-[13px] font-medium tabular-nums">{money(line.price * line.quantity)}</span>
                  <Button size="icon-sm" variant="ghost" aria-label={`Remove ${line.name}`} onClick={() => setLines(lines.filter((l) => l !== line))}>
                    <Trash2 {...icon} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No prints yet</EmptyTitle>
              <EmptyDescription>Pick a print and a size above, then Add.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </>
  )
}

function ShippingStep({
  ship,
  setShip,
  address,
  setAddress,
  errors,
  options,
}: {
  ship: Ship
  setShip: (ship: Ship) => void
  address: Address | null
  setAddress: (next: Address) => void
  errors: Record<string, string>
  options: { value: Ship; label: string; cost: number }[]
}) {
  const a = address ?? { line1: "", city: "", postcode: "", country: "Ireland" }
  const field = (key: keyof Address, label: string, className?: string) => (
    <LabelledField label={label} error={errors[key]} className={className}>
      <Input value={a[key]} disabled={ship === "collect"} onChange={(event) => setAddress({ ...a, [key]: event.target.value })} />
    </LabelledField>
  )
  return (
    <>
      <CardHeader>
        <CardTitle>Shipping</CardTitle>
        <CardDescription>The customer's address is filled in; change it for a gift.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <RadioGroup aria-label="Delivery" value={ship} onValueChange={(v) => setShip(v as Ship)} className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <RadioTile key={option.value} value={option.value} title={option.label} hint={option.cost ? money(option.cost) : "Free"} />
          ))}
        </RadioGroup>
        <div className="grid gap-3 sm:grid-cols-2">
          {field("line1", "Street address", "sm:col-span-2")}
          {field("city", "Town or city")}
          {field("postcode", "Postcode")}
          {field("country", "Country", "sm:col-span-2")}
        </div>
      </CardContent>
    </>
  )
}

/** A radio as a tile: the whole tile is the label, the radio sits in its corner. */
function RadioTile({ value, title, hint }: { value: string; title: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[12px] p-3 text-[13px] shadow-[inset_0_0_0_1px_var(--border)] transition-shadow has-data-checked:shadow-[inset_0_0_0_1.5px_var(--foreground)]">
      <Radio value={value} className="mt-0.5" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-[12px] text-muted-foreground">{hint}</span>
      </span>
    </label>
  )
}

/* ------------------------------------------------------------------ the summary */

function Summary({
  customer,
  channel,
  lines,
  subtotal,
  shipping,
  total,
}: {
  customer?: Customer
  channel: Channel
  lines: OrderLine[]
  subtotal: number
  shipping: { cost: number; method: string }
  total: number
}) {
  const count = lines.reduce((n, l) => n + l.quantity, 0)
  return (
    <Card className="h-fit lg:sticky lg:top-20">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>{customer ? `${customer.name} · ${CHANNEL_LABEL[channel]}` : "No customer yet"}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2.5 text-[13px] tabular-nums">
          <dt className="text-muted-foreground">{plural(count, "print")}</dt>
          <dd className="text-end">{money(subtotal)}</dd>
          <dt className="text-muted-foreground">{shipping.method}</dt>
          <dd className="text-end">{shipping.cost ? money(shipping.cost) : "Free"}</dd>
          <dt className="text-muted-foreground">VAT included (23%)</dt>
          <dd className="text-end">{money(Math.round((total * 23) / 123))}</dd>
          <div aria-hidden className="col-span-2 my-0.5 border-t border-border" />
          <dt className="font-semibold">Total</dt>
          <dd className="text-end font-semibold">{money(total)}</dd>
        </dl>
      </CardContent>
    </Card>
  )
}

