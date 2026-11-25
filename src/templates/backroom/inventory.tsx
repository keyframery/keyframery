"use client"

/* Inventory: one row per variant (print × size × frame) with what can be sold, what is sold but not
   sent yet, what is on its way and when it counts as running low. Stock is adjusted in place, with a
   reason (received, damaged, correction, recount), through the store: the product page, the
   products list and the dashboard's stock card follow at once. The view (all, low, out of stock),
   the filters and the search live in the address, so a low-stock notification can open it filtered. */

import { SlidersHorizontal } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumnDef } from "@/components/ui/data-table"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MenuItem, MenuSeparator } from "@/components/ui/menu"
import { NumberInput, NumberInputControl, NumberInputGroup } from "@/components/ui/number-input"
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import type { Finish, Incoming, Product, Size, Variant } from "./data"
import { count, day, plural } from "./format"
import { Choice, icon, InlineLink, LabelledField, pageStack, PageHeader, PrintPhoto } from "./kit"
import { useRouter } from "./router"
import { committedUnits, lowStockAt, type StockReason, stockLevel, useStore } from "./store"

type Show = "all" | "low" | "out"

type Row = {
  id: string
  product: Product
  variant: Variant
  title: string
  available: number
  committed: number
  incoming: Incoming[]
  incomingUnits: number
  alertAt: number
  ownAlert: boolean
  level: "ok" | "low" | "out"
}

const SIZES: Size[] = ["30×40", "50×70", "70×100"]
const FINISHES: Finish[] = ["Unframed", "Oak frame", "Black frame"]

export const REASONS: { value: StockReason; label: string; field: string; hint: string }[] = [
  { value: "received", label: "Received", field: "Quantity received", hint: "Added to what's there." },
  { value: "damaged", label: "Damaged", field: "Quantity damaged", hint: "Taken off and written off." },
  { value: "correction", label: "Correction", field: "Change by", hint: "Use a minus to take away." },
  { value: "recount", label: "Recount", field: "Counted on the shelf", hint: "Replaces the number in stock." },
]

/** Where stock would land after an adjustment: the same arithmetic as the store's `adjustStock`. */
export function stockAfter(from: number, reason: StockReason, quantity: number) {
  const q = Math.round(quantity)
  return Math.max(0, reason === "received" ? from + Math.abs(q) : reason === "damaged" ? from - Math.abs(q) : reason === "correction" ? from + q : q)
}

export function InventoryPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const q = router.query
  const show: Show = q.get("show") === "low" ? "low" : q.get("show") === "out" ? "out" : "all"
  const [adjusting, setAdjusting] = React.useState<string | null>(null)
  const [alerting, setAlerting] = React.useState<Row | null>(null)

  const all = React.useMemo<Row[]>(() => {
    const committed = committedUnits(state)
    return state.products.flatMap((product) =>
      product.variants.map((variant) => {
        const incoming = state.incoming.filter((i) => i.variantId === variant.id)
        return {
          id: variant.id,
          product,
          variant,
          title: `${variant.size} cm · ${variant.finish}`,
          available: variant.stock,
          committed: committed.get(variant.id) ?? 0,
          incoming,
          incomingUnits: incoming.reduce((n, i) => n + i.quantity, 0),
          alertAt: lowStockAt(state, variant),
          ownAlert: variant.lowStockAt !== undefined,
          level: stockLevel(state, variant),
        }
      }),
    )
  }, [state])

  const counts = { all: all.length, low: all.filter((r) => r.level === "low").length, out: all.filter((r) => r.level === "out").length }
  const rows = show === "all" ? all : all.filter((r) => r.level === show)

  /* The print filter is kept in the address by product id, so a renamed print still matches. */
  const productIds = q.get("product")?.split(",").filter(Boolean) ?? []
  const filters = {
    product: productIds.map((id) => state.products.find((p) => p.id === id)?.name).filter((n): n is string => !!n),
    size: q.get("size")?.split(",").filter(Boolean) ?? [],
    finish: q.get("finish")?.split(",").filter(Boolean) ?? [],
  }
  const page = Math.max(0, Number(q.get("page") ?? 1) - 1)

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "product",
        header: "Print",
        searchable: true,
        hideable: false,
        sticky: true,
        accessor: (r) => r.product.name,
        sortValue: (r) => `${r.product.name} ${SIZES.indexOf(r.variant.size)}${FINISHES.indexOf(r.variant.finish)}`,
        filter: { options: state.products.map((p) => ({ value: p.name })) },
        cell: (r) => (
          <span className="flex min-w-0 items-center gap-3">
            <PrintPhoto src={r.product.photo} className="size-[calc(var(--br-row-tall,3.5rem)-1rem)]" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <InlineLink to={`/products/${r.product.id}`} className="max-w-full self-start truncate">
                {r.product.name}
              </InlineLink>
              {/* The size and frame have their own columns on a wide table; narrower, they sit under the name. */}
              <span className="truncate text-[12px] text-muted-foreground @min-[52rem]/data-table:hidden">{r.title}</span>
            </span>
          </span>
        ),
      },
      { id: "size", header: "Size", accessor: (r) => r.variant.size, hideBelow: "lg", filter: { options: SIZES.map((value) => ({ value })) }, cell: (r) => <span className="text-muted-foreground">{r.variant.size} cm</span> },
      { id: "finish", header: "Frame", accessor: (r) => r.variant.finish, hideBelow: "lg", filter: { title: "Frame", options: FINISHES.map((value) => ({ value })) }, cell: (r) => <span className="text-muted-foreground">{r.variant.finish}</span> },
      { id: "sku", header: "SKU", accessor: (r) => r.variant.sku, searchable: true, sortable: false, hideBelow: "md", cell: (r) => <span className="font-mono text-[12px] text-muted-foreground">{r.variant.sku}</span> },
      {
        id: "available",
        header: "Available",
        accessor: (r) => r.available,
        align: "end",
        hideable: false,
        cell: (r) => <AdjustStock row={r} open={adjusting === r.id} onOpenChange={(open) => setAdjusting(open ? r.id : null)} />,
      },
      {
        id: "committed",
        header: "Committed",
        accessor: (r) => r.committed,
        align: "end",
        hideBelow: "sm",
        cell: (r) => <span className={cn("tabular-nums", !r.committed && "text-muted-foreground")}>{count(r.committed)}</span>,
      },
      {
        id: "incoming",
        header: "Incoming",
        accessor: (r) => r.incomingUnits,
        align: "end",
        hideBelow: "md",
        cell: (r) =>
          r.incomingUnits ? (
            <span className="flex flex-col items-end gap-0.5">
              <span className="tabular-nums">{count(r.incomingUnits)}</span>
              <span className="text-[12px] text-muted-foreground tabular-nums">{day(r.incoming[0].expected)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground tabular-nums">0</span>
          ),
      },
      {
        id: "alert",
        header: "Low at",
        accessor: (r) => r.alertAt,
        align: "end",
        hideBelow: "lg",
        cell: (r) => (
          <span className={cn("tabular-nums", !r.ownAlert && "text-muted-foreground")} title={r.ownAlert ? "Its own level" : "The store's setting"}>
            {count(r.alertAt)}
            <span className="sr-only">{r.ownAlert ? ", its own level" : ", the store's setting"}</span>
          </span>
        ),
      },
    ],
    [state.products, adjusting],
  )

  const setShow = (next: Show) => router.setQuery({ show: next === "all" ? null : next, page: null }, { replace: true })

  return (
    <div className={pageStack}>
      <PageHeader
        title="Inventory"
        description={
          <>
            {plural(all.length, "variant")} across {plural(state.products.length, "print")} · <span className="tabular-nums">{counts.low}</span> running low, <span className="tabular-nums">{counts.out}</span> out of stock
          </>
        }
      />
      <DataTable<Row>
        label="Inventory"
        className="[--data-table-row-height:var(--br-row-tall,3.5rem)]"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        selectable={false}
        searchPlaceholder="Search prints or SKUs"
        search={q.get("q") ?? ""}
        onSearchChange={(next) => router.setQuery({ q: next || null, page: null }, { replace: true })}
        filters={filters}
        onFiltersChange={(next) =>
          router.setQuery(
            {
              product: next.product?.length ? state.products.filter((p) => next.product.includes(p.name)).map((p) => p.id).join(",") : null,
              size: next.size?.length ? next.size.join(",") : null,
              finish: next.finish?.length ? next.finish.join(",") : null,
              page: null,
            },
            { replace: true },
          )
        }
        defaultSort={{ id: "product", direction: "ascending" }}
        page={page}
        onPageChange={(next) => router.setQuery({ page: next ? String(next + 1) : null }, { replace: true })}
        defaultPageSize={20}
        pageSizes={[20, 50, 100]}
        toolbar={
          <SegmentedControl aria-label="Show" value={show} onValueChange={(v) => v && setShow(v as Show)} className="[--segmented-control-height:1.5rem]">
            <SegmentedControlItem value="all">All</SegmentedControlItem>
            <SegmentedControlItem value="low">
              Low <span className="text-muted-foreground tabular-nums">{counts.low}</span>
            </SegmentedControlItem>
            <SegmentedControlItem value="out">
              Out of stock <span className="text-muted-foreground tabular-nums">{counts.out}</span>
            </SegmentedControlItem>
          </SegmentedControl>
        }
        emptyTitle={show === "out" ? "Nothing is out of stock" : show === "low" ? "Nothing is running low" : "No variants match"}
        emptyDescription={show === "all" ? "Try another search, or clear the filters." : "Every variant here has more than its low-stock level."}
        rowActions={(r) => (
          <>
            <MenuItem value="adjust" onClick={() => setAdjusting(r.id)}>
              Adjust stock
            </MenuItem>
            {r.incoming.map((i) => (
              <MenuItem key={i.id} value={`receive-${i.id}`} onClick={() => actions.receiveIncoming(i.id)}>
                Receive {i.quantity} due {day(i.expected)}
              </MenuItem>
            ))}
            <MenuItem value="alert" onClick={() => setAlerting(r)}>
              Set low-stock level
            </MenuItem>
            <MenuSeparator />
            <MenuItem value="product" onClick={() => router.navigate(`/products/${r.product.id}`)}>
              View product
            </MenuItem>
          </>
        )}
      />
      <AlertDialog row={alerting} onClose={() => setAlerting(null)} />
    </div>
  )
}

/* ------------------------------------------------------------------ adjusting stock */

/** The Available cell: the number, and a popover to change it with a reason. */
function AdjustStock({ row, open, onOpenChange }: { row: Row; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { actions } = useStore()
  const [reason, setReason] = React.useState<StockReason>("received")
  const [quantity, setQuantity] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!open) return
    setReason(row.incomingUnits ? "received" : "recount")
    setQuantity(row.incomingUnits ? row.incomingUnits : row.available)
    setError(null)
  }, [open, row.incomingUnits, row.available])

  const meta = REASONS.find((r) => r.value === reason)!
  const to = quantity === null ? row.available : stockAfter(row.available, reason, quantity)
  const name = `${row.product.name}, ${row.title}`

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (quantity === null) return setError("Enter a number.")
    if (to === row.available) return setError(reason === "recount" ? "That's the number in stock already." : "Enter a number other than 0.")
    /* Receiving exactly what a shipment on its way holds books that shipment in, so it isn't counted twice. */
    const shipment = reason === "received" ? row.incoming.find((i) => i.quantity === Math.abs(Math.round(quantity))) : undefined
    actions.adjustStock(row.variant.id, reason, quantity, shipment?.id)
    onOpenChange(false)
  }

  return (
    <span className="flex items-center justify-end gap-2">
      {row.level !== "ok" && (
        <Badge variant="outline" className={row.level === "out" ? "text-destructive" : ""}>
          <span aria-hidden className={cn("size-1.5 rounded-full", row.level === "out" ? "bg-destructive" : "bg-[var(--chart-4)]")} />
          {row.level === "out" ? "Out" : "Low"}
        </Badge>
      )}
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger aria-label={`Adjust stock, ${name}, ${row.available} available`} render={<Button size="sm" className="min-w-14 justify-end px-2.5 tabular-nums" />}>
          {count(row.available)}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(320px,calc(100vw-16px))]">
          <form onSubmit={save} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <PopoverTitle className="text-[14px] font-semibold">Adjust stock</PopoverTitle>
              <PopoverDescription className="text-[12px] text-muted-foreground">{name}</PopoverDescription>
            </div>
            <LabelledField label="Reason">
              <Choice
                label="Reason"
                value={reason}
                onChange={(v) => {
                  setReason(v as StockReason)
                  setQuantity(v === "recount" ? row.available : v === "received" && row.incomingUnits ? row.incomingUnits : 1)
                  setError(null)
                }}
                options={REASONS.map(({ value, label }) => ({ value, label }))}
              />
            </LabelledField>
            <LabelledField
              label={meta.field}
              hint={reason === "received" && row.incoming.some((i) => i.quantity === quantity) ? `Books in the ${quantity} due ${day(row.incoming.find((i) => i.quantity === quantity)!.expected)}.` : meta.hint}
              error={error}
            >
              <NumberInput
                value={quantity}
                min={reason === "correction" ? undefined : 0}
                step={1}
                onValueChange={(next) => {
                  setQuantity(next)
                  setError(null)
                }}
              >
                <NumberInputGroup>
                  <NumberInputControl aria-label={meta.field} />
                </NumberInputGroup>
              </NumberInput>
            </LabelledField>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-[12px] text-muted-foreground tabular-nums" aria-live="polite">
                {count(row.available)} → <span className={cn("font-medium", to === row.available ? "" : "text-foreground")}>{count(to)}</span> available
              </span>
              <span className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" data-agent-confirm={to < row.available ? `Takes stock away from ${name}` : undefined}>
                  Save
                </Button>
              </span>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </span>
  )
}

/* ------------------------------------------------------------------ the low-stock level */

function AlertDialog({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const { state, actions } = useStore()
  const [own, setOwn] = React.useState(false)
  const [value, setValue] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (!row) return
    setOwn(row.ownAlert)
    setValue(row.alertAt)
  }, [row])

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!row) return
    actions.setLowStockAt(row.variant.id, own ? (value ?? 0) : null)
    onClose()
  }

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:440px]">
        <form onSubmit={save} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Low-stock level</DialogTitle>
            <DialogDescription>{row ? `${row.product.name}, ${row.title}. At this many or fewer, it shows as running low and you get a notification.` : ""}</DialogDescription>
          </DialogHeader>
          <label className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Its own level</span>
              <span className="text-[12px] text-muted-foreground">Off: the store's setting, {state.settings.lowStockAt} or fewer.</span>
            </span>
            <Switch checked={own} onCheckedChange={(next) => setOwn(next === true)} aria-label="Use its own low-stock level" />
          </label>
          {own && (
            <LabelledField label="Running low at">
              <NumberInput value={value} min={0} max={99} step={1} onValueChange={setValue}>
                <NumberInputGroup>
                  <NumberInputControl aria-label="Running low at" />
                </NumberInputGroup>
              </NumberInput>
            </LabelledField>
          )}
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit">
              <SlidersHorizontal {...icon} />
              Save level
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** For the dashboard: a print's stock state, with the way into Inventory. */
export const inventoryLink = (productId?: string, show?: Show) => `/inventory?${new URLSearchParams({ ...(productId ? { product: productId } : {}), ...(show && show !== "all" ? { show } : {}) })}`
