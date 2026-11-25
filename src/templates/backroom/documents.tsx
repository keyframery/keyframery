"use client"

/* An order's printable documents: the invoice and the packing slip, alone on the page (no sidebar),
   at A4 proportions, with a toolbar to go back, print and download a PDF. Printing prints the paper
   only, one order per page. Several packing slips at once come from the orders list's bulk actions
   (/orders/packing-slips?orders=1042,1043). The store's legal name, address and VAT number come from
   Settings, so the documents follow them. */

import { ArrowLeft, Download, Printer } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { cn } from "@/lib/utils"

import type { Customer, Order } from "./data"
import { ErrorPage } from "./errors"
import { storeSlug } from "./export"
import { date, money, plural } from "./format"
import { icon, itemsIn } from "./kit"
import { PdfDocument, type PdfImage, type PdfPage, PAGE, wrap } from "./pdf"
import { linkProps, useRouter } from "./router"
import { customerOf, orderByNumber, type State, toaster, useStore } from "./store"

const DAY = 86_400_000

/** The invoice's number: the order's, so the two are easy to match. */
export const invoiceNumber = (order: Order) => `INV-${order.number}`
/** Where wholesale customers pay an invoice. The account the payouts go to. */
const IBAN = "IE29 AIBK 9311 5212 3444 17"

const addressLines = (a: Order["address"]) => [a.line1, `${a.city} ${a.postcode}`.trim(), a.country]

/** What an invoice says about its payment: paid on a day, due by a day, refunded, or void. */
function paymentNote(order: Order) {
  if (order.status === "cancelled") return { label: "Cancelled", detail: order.refunded ? `Refunded in full, ${money(order.refunded)}` : "Payment voided" }
  if (order.payment === "pending") return { label: "Payment due", detail: `Due by ${date(Date.parse(order.createdAt) + 30 * DAY)}` }
  const paid = order.events.find((e) => e.kind === "paid")?.at ?? order.createdAt
  if (order.payment === "refunded") return { label: "Refunded", detail: `Paid ${date(paid)}, refunded in full` }
  if (order.payment === "partially_refunded") return { label: "Partly refunded", detail: `Paid ${date(paid)}` }
  return { label: "Paid", detail: `Paid ${date(paid)} by ${order.channel === "marketplace" ? "the marketplace" : "card"}` }
}

/* ------------------------------------------------------------------ the frame */

/* Printing shows the paper and nothing else, one sheet per page, with no margins of the browser's own. */
const printCss = `@page { size: A4; margin: 0 }
@media print {
  html, body { background: #fff !important; }
  body *:not(:has([data-print-root])):not([data-print-root]):not([data-print-root] *) { display: none !important; }
  [data-print-root] [data-print-hide] { display: none !important; }
  [data-print-root], [data-backroom] { background: #fff !important; min-height: 0 !important; padding: 0 !important; }
}`

/** Scales A4 paper down to fit a narrower window (and not at all on phones, where the paper reflows). */
function usePaperZoom() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState(1)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      setZoom(width < 640 ? 1 : Math.min(1, width / 794))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, zoom }
}

function DocumentFrame({
  title,
  back,
  switcher,
  onDownload,
  children,
}: {
  title: string
  back: { to: string; label: string }
  switcher?: React.ReactNode
  onDownload: () => Promise<void>
  children: React.ReactNode
}) {
  const router = useRouter()
  const { ref, zoom } = usePaperZoom()
  const [busy, setBusy] = React.useState(false)
  return (
    <div data-print-root="" className="min-h-svh bg-muted/40 print:bg-white">
      <style href="br-print" precedence="default">
        {printCss}
      </style>
      <header data-print-hide="" className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[880px] items-center gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="icon" aria-label={back.label} className="shrink-0 rtl:-scale-x-100" render={<a {...linkProps(router, back.to)} />}>
            <ArrowLeft {...icon} />
          </Button>
          <h1 data-page-heading tabIndex={-1} className="min-w-0 flex-1 truncate text-[14px] font-semibold outline-none">
            {title}
          </h1>
          {switcher}
          <Button
            aria-label="Download as PDF"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await onDownload()
              } catch {
                toaster.error("Couldn't make the PDF", { description: "Try Print, then Save as PDF." })
              } finally {
                setBusy(false)
              }
            }}
          >
            <Download {...icon} />
            <span className="max-sm:sr-only">Download</span>
          </Button>
          <Button variant="primary" onClick={() => window.print()} aria-label="Print">
            <Printer {...icon} />
            <span className="max-sm:sr-only">Print</span>
          </Button>
        </div>
      </header>
      <main ref={ref} className="mx-auto flex max-w-[880px] flex-col items-center gap-6 px-3 py-6 sm:px-6 sm:py-10 print:block print:max-w-none print:p-0">
        <div className="flex w-full flex-col items-center gap-6 print:block" style={{ zoom }}>
          {children}
        </div>
      </main>
    </div>
  )
}

/** One sheet of A4 paper. On phones it reflows to the screen's width instead. */
function Paper({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <article
      aria-label={label}
      className={cn(
        "flex w-full flex-col bg-card text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_28px_-12px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
        "rounded-[6px] px-6 py-7 text-[12px] leading-[1.5] sm:aspect-[210/297] sm:w-[210mm] sm:rounded-[2px] sm:px-[16mm] sm:py-[15mm] sm:text-[11.5px]",
        "print:m-0 print:aspect-auto print:h-[297mm] print:w-[210mm] print:break-after-page print:overflow-hidden print:rounded-none print:bg-white print:px-[16mm] print:py-[15mm] print:text-[11.5px] print:text-black print:shadow-none",
        className,
      )}
    >
      {children}
    </article>
  )
}

const muted = "text-muted-foreground print:text-neutral-500"
const rule = "border-border print:border-neutral-200"

function StoreBlock({ state }: { state: State }) {
  const s = state.settings
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[17px] leading-tight font-semibold tracking-tight">{s.name}</span>
      <span className={muted}>{s.legalName}</span>
      {addressLines(s.address).map((line) => (
        <span key={line} className={muted}>
          {line}
        </span>
      ))}
      <span className={muted}>
        {s.email} · {s.phone}
      </span>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className={cn("text-[10.5px] font-medium tracking-wide uppercase", muted)}>{label}</span>
      <span className="flex flex-col">{children}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ the invoice */

function InvoiceSheet({ state, order, customer }: { state: State; order: Order; customer: Customer | undefined }) {
  const note = paymentNote(order)
  const s = state.settings
  const balance = order.payment === "pending" && order.status !== "cancelled" ? order.total : 0
  return (
    <Paper label={`Invoice ${invoiceNumber(order)}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <StoreBlock state={state} />
        <div className="flex flex-col items-start gap-1 sm:items-end sm:text-end">
          <span className="text-[24px] leading-none font-semibold tracking-tight">Invoice</span>
          <span className="mt-1 font-medium tabular-nums">{invoiceNumber(order)}</span>
          <span className={cn("tabular-nums", muted)}>Issued {date(order.createdAt)}</span>
          <span className={cn("tabular-nums", muted)}>Order #{order.number}</span>
        </div>
      </div>

      <div className={cn("mt-8 grid gap-6 border-t pt-6 sm:grid-cols-3", rule)}>
        <Field label="Bill to">
          <span className="font-medium">{customer?.name ?? "Customer"}</span>
          {customer?.company && <span>{customer.company}</span>}
          {customer && addressLines(customer.address).map((line) => <span key={line}>{line}</span>)}
          {customer && <span className={muted}>{customer.email}</span>}
        </Field>
        <Field label="Ship to">
          <span className="font-medium">{customer?.name ?? "Customer"}</span>
          {addressLines(order.address).map((line) => (
            <span key={line}>{line}</span>
          ))}
          <span className={muted}>{order.shippingMethod}</span>
        </Field>
        <Field label={note.label === "Payment due" ? "Payment" : "Status"}>
          <span className="font-medium">{note.label}</span>
          <span className={muted}>{note.detail}</span>
        </Field>
      </div>

      <table className="mt-8 w-full border-collapse tabular-nums" aria-label="Items">
        <thead>
          <tr className={cn("border-b text-[10.5px] tracking-wide uppercase", rule, muted)}>
            <th className="pb-2 text-start font-medium">Item</th>
            <th className="w-12 pb-2 text-end font-medium">Qty</th>
            <th className="w-20 pb-2 text-end font-medium">Price</th>
            <th className="w-24 pb-2 text-end font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.variantId} className={cn("border-b align-top", rule)}>
              <td className="py-2.5 pe-3">
                <span className="block font-medium">{line.name}</span>
                <span className={cn("block", muted)}>{line.variantTitle}</span>
              </td>
              <td className="py-2.5 text-end">{line.quantity}</td>
              <td className="py-2.5 text-end">{money(line.price)}</td>
              <td className="py-2.5 text-end">{money(line.price * line.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 ms-auto grid w-full max-w-[280px] grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 tabular-nums">
        <dt className={muted}>Subtotal</dt>
        <dd className="text-end">{money(order.subtotal)}</dd>
        {order.discount > 0 && (
          <>
            <dt className={muted}>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
            <dd className="text-end">−{money(order.discount)}</dd>
          </>
        )}
        <dt className={muted}>Shipping</dt>
        <dd className="text-end">{money(order.shipping)}</dd>
        <div aria-hidden className={cn("col-span-2 my-0.5 border-t", rule)} />
        <dt className="font-semibold">Total</dt>
        <dd className="text-end font-semibold">{money(order.total)}</dd>
        <dt className={muted}>Includes VAT at 23%</dt>
        <dd className={cn("text-end", muted)}>{money(order.tax)}</dd>
        {order.refunded > 0 && (
          <>
            <dt className={muted}>Refunded</dt>
            <dd className="text-end">−{money(order.refunded)}</dd>
          </>
        )}
        <dt className="font-medium">{balance ? "Balance due" : "Amount paid"}</dt>
        <dd className="text-end font-medium">{money(balance || (order.status === "cancelled" ? 0 : order.total - order.refunded))}</dd>
      </dl>

      <div className={cn("mt-auto flex flex-col gap-1 border-t pt-5", rule, muted)}>
        {balance > 0 ? (
          <span>
            Please pay by bank transfer to {s.legalName}, IBAN {IBAN}, quoting {invoiceNumber(order)}.
          </span>
        ) : (
          <span>Thank you for your order.</span>
        )}
        <span>
          {s.legalName} · VAT {s.vatNumber} · Registered in Ireland
        </span>
      </div>
    </Paper>
  )
}

/* ------------------------------------------------------------------ the packing slip */

function PackingSlipSheet({ order, customer, state }: { order: Order; customer: Customer | undefined; state: State }) {
  const sku = (variantId: string) => state.products.flatMap((p) => p.variants).find((v) => v.id === variantId)?.sku
  return (
    <Paper label={`Packing slip for order ${order.number}`}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] leading-tight font-semibold tracking-tight">{state.settings.name}</span>
          <span className={muted}>{addressLines(state.settings.address).join(", ")}</span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end sm:text-end">
          <span className="text-[24px] leading-none font-semibold tracking-tight">Packing slip</span>
          <span className="mt-1 font-medium tabular-nums">Order #{order.number}</span>
          <span className={cn("tabular-nums", muted)}>Placed {date(order.createdAt)}</span>
        </div>
      </div>

      <div className={cn("mt-8 grid gap-6 border-t pt-6 sm:grid-cols-[minmax(0,1fr)_auto]", rule)}>
        <Field label="Ship to">
          <span className="mt-1 text-[18px] leading-snug font-semibold">{customer?.name ?? "Customer"}</span>
          {customer?.company && <span className="text-[15px] leading-snug">{customer.company}</span>}
          {addressLines(order.address).map((line) => (
            <span key={line} className="text-[15px] leading-snug">
              {line}
            </span>
          ))}
        </Field>
        <Field label="Shipping" className="sm:text-end">
          <span className="font-medium">{order.shippingMethod}</span>
          <span className={cn("tabular-nums", muted)}>{order.tracking ? `${order.tracking.carrier} ${order.tracking.number}` : "Tracking added on dispatch"}</span>
        </Field>
      </div>

      <table className="mt-8 w-full border-collapse" aria-label={`Items in order ${order.number}`}>
        <thead>
          <tr className={cn("border-b text-[10.5px] tracking-wide uppercase", rule, muted)}>
            <th className="w-9 pb-2 text-start font-medium">
              <span className="sr-only">Packed</span>
            </th>
            <th className="pb-2 text-start font-medium">Item</th>
            <th className="w-14 pb-2 text-end font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.variantId} className={cn("border-b", rule)}>
              <td className="py-3 align-middle">
                <Checkbox aria-label={`Packed: ${line.name}, ${line.variantTitle}`} className="print:shadow-[inset_0_0_0_1px_#999]" />
              </td>
              <td className="py-3">
                <span className="flex items-center gap-3">
                  <img src={line.photo} alt="" className="size-11 shrink-0 rounded-[4px] object-cover ring-1 ring-black/5 dark:ring-white/10" />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{line.name}</span>
                    <span className={muted}>{line.variantTitle}</span>
                    <span className={cn("font-mono text-[10.5px]", muted)}>{sku(line.variantId)}</span>
                  </span>
                </span>
              </td>
              <td className="py-3 text-end text-[16px] font-semibold tabular-nums">{line.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className={muted}>{plural(itemsIn(order), "item")} in this parcel</span>
        <span className={cn("tabular-nums", muted)}>Packed by ______________</span>
      </div>

      <div className={cn("mt-auto flex flex-col gap-1 border-t pt-5", rule, muted)}>
        <span>Thank you for buying from {state.settings.name}. Anything not right? Write to {state.settings.email} within 30 days.</span>
      </div>
    </Paper>
  )
}

/* ------------------------------------------------------------------ the PDF */

const MARGIN = 46
const RIGHT = PAGE.width - MARGIN

function pdfHeader(page: PdfPage, state: State, title: string, meta: string[]) {
  const s = state.settings
  page.text(s.name, MARGIN, 60, { size: 15, bold: true })
  let y = 76
  for (const line of [s.legalName, ...addressLines(s.address), `${s.email} · ${s.phone}`]) {
    page.text(line, MARGIN, y, { size: 9, gray: 0.42 })
    y += 12
  }
  page.text(title, RIGHT, 64, { size: 22, bold: true, align: "right" })
  meta.forEach((line, i) => page.text(line, RIGHT, 84 + i * 13, { size: 9.5, bold: i === 0, gray: i === 0 ? 0 : 0.42, align: "right" }))
  return Math.max(y, 84 + meta.length * 13) + 14
}

function pdfField(page: PdfPage, x: number, top: number, label: string, lines: { text: string; bold?: boolean; gray?: number; size?: number }[]) {
  page.text(label.toUpperCase(), x, top, { size: 7.5, gray: 0.42, bold: true })
  let y = top + 14
  for (const l of lines) {
    page.text(l.text, x, y, { size: l.size ?? 9.5, bold: l.bold, gray: l.gray ?? 0 })
    y += (l.size ?? 9.5) + 4
  }
  return y
}

function invoicePage(doc: PdfDocument, state: State, order: Order, customer: Customer | undefined) {
  const page = doc.addPage()
  const note = paymentNote(order)
  let y = pdfHeader(page, state, "Invoice", [invoiceNumber(order), `Issued ${date(order.createdAt)}`, `Order #${order.number}`])
  page.line(MARGIN, y, RIGHT, y)
  y += 22
  const col = (RIGHT - MARGIN) / 3
  const bill = [{ text: customer?.name ?? "Customer", bold: true }, ...(customer?.company ? [{ text: customer.company }] : []), ...(customer ? addressLines(customer.address).map((text) => ({ text })) : []), ...(customer ? [{ text: customer.email, gray: 0.42 }] : [])]
  const ship = [{ text: customer?.name ?? "Customer", bold: true }, ...addressLines(order.address).map((text) => ({ text })), { text: order.shippingMethod, gray: 0.42 }]
  const ends = [pdfField(page, MARGIN, y, "Bill to", bill), pdfField(page, MARGIN + col, y, "Ship to", ship), pdfField(page, MARGIN + col * 2, y, note.label === "Payment due" ? "Payment" : "Status", [{ text: note.label, bold: true }, { text: note.detail, gray: 0.42 }])]
  y = Math.max(...ends) + 18

  const qtyX = RIGHT - 190
  const priceX = RIGHT - 100
  page.text("ITEM", MARGIN, y, { size: 7.5, gray: 0.42, bold: true })
  page.text("QTY", qtyX, y, { size: 7.5, gray: 0.42, bold: true, align: "right" })
  page.text("PRICE", priceX, y, { size: 7.5, gray: 0.42, bold: true, align: "right" })
  page.text("AMOUNT", RIGHT, y, { size: 7.5, gray: 0.42, bold: true, align: "right" })
  y += 7
  page.line(MARGIN, y, RIGHT, y)
  for (const line of order.lines) {
    y += 16
    page.text(line.name, MARGIN, y, { size: 9.5, bold: true })
    page.text(String(line.quantity), qtyX, y, { size: 9.5, align: "right" })
    page.text(money(line.price), priceX, y, { size: 9.5, align: "right" })
    page.text(money(line.price * line.quantity), RIGHT, y, { size: 9.5, align: "right" })
    y += 12
    page.text(line.variantTitle, MARGIN, y, { size: 9, gray: 0.42 })
    y += 9
    page.line(MARGIN, y, RIGHT, y)
  }

  y += 18
  const labelX = RIGHT - 200
  const row = (label: string, value: string, opts: { bold?: boolean; gray?: number } = {}) => {
    page.text(label, labelX, y, { size: 9.5, gray: opts.gray ?? 0.42, bold: opts.bold })
    page.text(value, RIGHT, y, { size: 9.5, align: "right", bold: opts.bold, gray: opts.gray === undefined ? 0 : opts.gray })
    y += 15
  }
  row("Subtotal", money(order.subtotal))
  if (order.discount > 0) row(`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`, `−${money(order.discount)}`)
  row("Shipping", money(order.shipping))
  page.line(labelX, y - 9, RIGHT, y - 9)
  y += 3
  row("Total", money(order.total), { bold: true, gray: 0 })
  row("Includes VAT at 23%", money(order.tax), { gray: 0.42 })
  if (order.refunded > 0) row("Refunded", `−${money(order.refunded)}`)
  const balance = order.payment === "pending" && order.status !== "cancelled" ? order.total : 0
  row(balance ? "Balance due" : "Amount paid", money(balance || (order.status === "cancelled" ? 0 : order.total - order.refunded)), { bold: true, gray: 0 })

  const s = state.settings
  const footer = balance ? `Please pay by bank transfer to ${s.legalName}, IBAN ${IBAN}, quoting ${invoiceNumber(order)}.` : "Thank you for your order."
  page.line(MARGIN, PAGE.height - 78, RIGHT, PAGE.height - 78)
  wrap(footer, RIGHT - MARGIN, 9).forEach((l, i) => page.text(l, MARGIN, PAGE.height - 60 + i * 12, { size: 9, gray: 0.42 }))
  page.text(`${s.legalName} · VAT ${s.vatNumber} · Registered in Ireland`, MARGIN, PAGE.height - 44, { size: 9, gray: 0.42 })
}

async function photoBytes(src: string) {
  const response = await fetch(src)
  if (!response.ok) throw new Error(`${src}: ${response.status}`)
  return new Uint8Array(await response.arrayBuffer())
}

async function packingSlipPage(doc: PdfDocument, state: State, order: Order, customer: Customer | undefined) {
  const images = new Map<string, PdfImage | null>()
  for (const line of order.lines) if (!images.has(line.photo)) images.set(line.photo, doc.addJpeg(line.photo, await photoBytes(line.photo).catch(() => new Uint8Array())))
  const page = doc.addPage()
  const s = state.settings
  page.text(s.name, MARGIN, 60, { size: 15, bold: true })
  page.text(addressLines(s.address).join(", "), MARGIN, 76, { size: 9, gray: 0.42 })
  page.text("Packing slip", RIGHT, 64, { size: 22, bold: true, align: "right" })
  page.text(`Order #${order.number}`, RIGHT, 84, { size: 9.5, bold: true, align: "right" })
  page.text(`Placed ${date(order.createdAt)}`, RIGHT, 97, { size: 9.5, gray: 0.42, align: "right" })
  let y = 118
  page.line(MARGIN, y, RIGHT, y)
  y += 22
  page.text("SHIP TO", MARGIN, y, { size: 7.5, gray: 0.42, bold: true })
  page.text("SHIPPING", RIGHT, y, { size: 7.5, gray: 0.42, bold: true, align: "right" })
  page.text(order.shippingMethod, RIGHT, y + 16, { size: 9.5, bold: true, align: "right" })
  page.text(order.tracking ? `${order.tracking.carrier} ${order.tracking.number}` : "Tracking added on dispatch", RIGHT, y + 30, { size: 9.5, gray: 0.42, align: "right" })
  y += 22
  page.text(customer?.name ?? "Customer", MARGIN, y, { size: 16, bold: true })
  y += 6
  for (const line of [...(customer?.company ? [customer.company] : []), ...addressLines(order.address)]) {
    y += 17
    page.text(line, MARGIN, y, { size: 13 })
  }
  y += 28
  page.text("ITEM", MARGIN + 28, y, { size: 7.5, gray: 0.42, bold: true })
  page.text("QTY", RIGHT, y, { size: 7.5, gray: 0.42, bold: true, align: "right" })
  y += 7
  page.line(MARGIN, y, RIGHT, y)
  for (const line of order.lines) {
    const top = y + 10
    page.rect(MARGIN, top + 13, 12, 12, { stroke: 0.35 })
    const img = images.get(line.photo)
    if (img) page.image(img, MARGIN + 28, top, 38, 38)
    const sku = state.products.flatMap((p) => p.variants).find((v) => v.id === line.variantId)?.sku ?? ""
    page.text(line.name, MARGIN + 78, top + 12, { size: 10, bold: true })
    page.text(line.variantTitle, MARGIN + 78, top + 25, { size: 9, gray: 0.42 })
    page.text(sku, MARGIN + 78, top + 36, { size: 8, gray: 0.42 })
    page.text(String(line.quantity), RIGHT, top + 24, { size: 14, bold: true, align: "right" })
    y = top + 48
    page.line(MARGIN, y, RIGHT, y)
  }
  y += 20
  page.text(`${plural(itemsIn(order), "item")} in this parcel`, MARGIN, y, { size: 9.5, gray: 0.42 })
  page.text("Packed by ______________", RIGHT, y, { size: 9.5, gray: 0.42, align: "right" })
  page.line(MARGIN, PAGE.height - 66, RIGHT, PAGE.height - 66)
  page.text(`Thank you for buying from ${s.name}. Anything not right? Write to ${s.email} within 30 days.`, MARGIN, PAGE.height - 48, { size: 9, gray: 0.42 })
}

function downloadPdf(name: string, bytes: Uint8Array) {
  const url = URL.createObjectURL(new Blob([bytes.slice().buffer], { type: "application/pdf" }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  toaster.success("PDF downloaded", { description: name })
}

/* ------------------------------------------------------------------ the pages */

function DocumentSwitch({ order, current }: { order: Order; current: "invoice" | "packing-slip" }) {
  const router = useRouter()
  return (
    <SegmentedControl
      aria-label="Document"
      value={current}
      onValueChange={(v) => v && v !== current && router.navigate(`/orders/${order.number}/${v}`, { replace: true })}
      className="max-md:hidden [--segmented-control-height:1.5rem]"
    >
      <SegmentedControlItem value="invoice">Invoice</SegmentedControlItem>
      <SegmentedControlItem value="packing-slip">Packing slip</SegmentedControlItem>
    </SegmentedControl>
  )
}

export function InvoicePage({ number }: { number: number }) {
  const { state } = useStore()
  const order = Number.isFinite(number) ? orderByNumber(state, number) : undefined
  if (!order) return <ErrorPage code="404" standalone />
  const customer = customerOf(state, order.customerId)
  return (
    <DocumentFrame
      title={`Invoice ${invoiceNumber(order)}`}
      back={{ to: `/orders/${order.number}`, label: `Back to order ${order.number}` }}
      switcher={<DocumentSwitch order={order} current="invoice" />}
      onDownload={async () => {
        const doc = new PdfDocument(`Invoice ${invoiceNumber(order)}`)
        invoicePage(doc, state, order, customer)
        downloadPdf(`${storeSlug(state)}-invoice-${order.number}.pdf`, doc.save())
      }}
    >
      <InvoiceSheet state={state} order={order} customer={customer} />
    </DocumentFrame>
  )
}

/** One packing slip, or several (`numbers` from the orders list), one sheet each. */
export function PackingSlipPage({ numbers }: { numbers: number[] }) {
  const { state } = useStore()
  const orders = numbers.map((n) => orderByNumber(state, n)).filter((o): o is Order => !!o)
  if (!orders.length) return <ErrorPage code="404" standalone />
  const single = numbers.length === 1 ? orders[0] : null
  return (
    <DocumentFrame
      title={single ? `Packing slip · #${single.number}` : `Packing slips · ${plural(orders.length, "order")}`}
      back={single ? { to: `/orders/${single.number}`, label: `Back to order ${single.number}` } : { to: "/orders", label: "Back to orders" }}
      switcher={single ? <DocumentSwitch order={single} current="packing-slip" /> : undefined}
      onDownload={async () => {
        const doc = new PdfDocument(single ? `Packing slip #${single.number}` : `Packing slips, ${orders.length} orders`)
        for (const o of orders) await packingSlipPage(doc, state, o, customerOf(state, o.customerId))
        downloadPdf(`${storeSlug(state)}-packing-slip${single ? `-${single.number}` : `s-${orders.length}-orders`}.pdf`, doc.save())
      }}
    >
      {orders.map((o) => (
        <PackingSlipSheet key={o.number} order={o} customer={customerOf(state, o.customerId)} state={state} />
      ))}
    </DocumentFrame>
  )
}
