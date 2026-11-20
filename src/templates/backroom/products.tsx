"use client"

/* Products: the catalogue of prints (search, status and collection filters, stock warnings, units
   sold, bulk publish and archive) and the product editor, for a new print or an existing one:
   name, description, address in the shop, photo, collection, status, and every size and finish
   with its price and stock. Changes wait in a draft until Save. */

import { Archive, ArchiveRestore, CircleDot, ImageUp, Plus, Upload } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/ui/data-table"
import { FileInput, FileInputDropzone, FileInputTrigger } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { MenuItem, MenuSeparator } from "@/components/ui/menu"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { NumberInput, NumberInputControl, NumberInputGroup } from "@/components/ui/number-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import { type Collection, type Finish, iso, type Product, type ProductStatus, type Size, type Variant } from "./data"
import { ErrorPage } from "./errors"
import { count, money, moneyWhole, plural } from "./format"
import { Choice, icon, InlineLink, LabelledField, pageStack, PageHeader, PRODUCT_STATUS, PrintPhoto, stockOf } from "./kit"
import { linkProps, useRouter } from "./router"
import { useStore } from "./store"

const COLLECTIONS: Collection[] = ["Coast", "Walks", "Places", "Kitchen"]
const SIZES: Size[] = ["30×40", "50×70", "70×100"]
const FINISHES: Finish[] = ["Unframed", "Oak frame", "Black frame"]
const PRINT_PRICE: Record<Size, number> = { "30×40": 4500, "50×70": 8500, "70×100": 14500 }
const FRAME_PRICE: Record<Size, number> = { "30×40": 5500, "50×70": 8500, "70×100": 12500 }
const DAY = 86_400_000

/** Units of each product sold in the last 30 days, not counting cancelled orders. */
function useUnitsSold() {
  const { state } = useStore()
  return React.useMemo(() => {
    const since = Date.now() - 30 * DAY
    const units = new Map<string, number>()
    for (const o of state.orders) {
      if (o.status === "cancelled" || Date.parse(o.createdAt) < since) continue
      for (const line of o.lines) units.set(line.productId, (units.get(line.productId) ?? 0) + line.quantity)
    }
    return units
  }, [state.orders])
}

/* ------------------------------------------------------------------ the list */

type Row = Product & { stock: number; low: number; sold: number; from: number; to: number }

export function ProductsPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const sold = useUnitsSold()
  const [selected, setSelected] = React.useState<string[]>([])
  const lowAt = state.settings.lowStockAt

  const rows = React.useMemo<Row[]>(
    () =>
      state.products.map((p) => {
        const prices = p.variants.map((v) => v.price)
        return { ...p, stock: stockOf(p), low: p.variants.filter((v) => v.stock <= lowAt).length, sold: sold.get(p.id) ?? 0, from: Math.min(...prices), to: Math.max(...prices) }
      }),
    [state.products, sold, lowAt],
  )

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "name",
        header: "Print",
        searchable: true,
        hideable: false,
        sticky: true,
        accessor: (p) => `${p.name} ${p.handle}`,
        sortValue: (p) => p.name,
        cell: (p) => (
          <span className="flex min-w-0 items-center gap-3">
            <PrintPhoto src={p.photo} className="size-[calc(var(--br-row-tall,3.5rem)-1rem)]" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <InlineLink to={`/products/${p.id}`} className="self-start">
                {p.name}
              </InlineLink>
              <span className="text-[12px] text-muted-foreground">{plural(p.variants.length, "variant")}</span>
            </span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: (p) => PRODUCT_STATUS[p.status].label,
        filter: { options: Object.values(PRODUCT_STATUS).map(({ label }) => ({ value: label })) },
        cell: (p) => <Badge variant={PRODUCT_STATUS[p.status].variant}>{PRODUCT_STATUS[p.status].label}</Badge>,
      },
      { id: "collection", header: "Collection", hideBelow: "md", filter: { options: COLLECTIONS.map((value) => ({ value })) }, cell: (p) => <span className="text-muted-foreground">{p.collection}</span> },
      {
        id: "stock",
        header: "Inventory",
        accessor: (p) => p.stock,
        hideBelow: "sm",
        cell: (p) => (
          <span className="flex flex-col gap-1">
            <span className="tabular-nums">{count(p.stock)} in stock</span>
            {p.low > 0 && <span className="text-[12px] text-[color:var(--chart-4)]">{plural(p.low, "variant")} running low</span>}
          </span>
        ),
      },
      { id: "sold", header: "Sold, 30 days", accessor: (p) => p.sold, align: "end", hideBelow: "lg", cell: (p) => <span className="tabular-nums">{count(p.sold)}</span> },
      {
        id: "price",
        header: "Price",
        accessor: (p) => p.from,
        align: "end",
        cell: (p) => (
          <span className="tabular-nums">
            {moneyWhole(p.from)} to {moneyWhole(p.to)}
          </span>
        ),
      },
    ],
    [],
  )

  const setStatus = (ids: string[], status: ProductStatus) => {
    for (const p of state.products) if (ids.includes(p.id) && p.status !== status) actions.updateProduct(p.id, { status }, status === "archived" ? "Product archived" : status === "active" ? "Product published" : "Moved to drafts")
    setSelected([])
  }
  const active = state.products.filter((p) => p.status === "active").length

  return (
    <div className={pageStack}>
      <PageHeader
        title="Products"
        description={`${plural(active, "print")} on sale · ${plural(state.products.length - active, "other")} in drafts or archived`}
        actions={
          router.exists("/products/new") && (
            <Button variant="primary" render={<a {...linkProps(router, "/products/new")} />}>
              <Plus {...icon} />
              Add product
            </Button>
          )
        }
      />
      <DataTable<Row>
        label="Products"
        className="[--data-table-row-height:var(--br-row-tall,3.5rem)]"
        data={rows}
        columns={columns}
        getRowId={(p) => p.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        defaultSort={{ id: "sold", direction: "descending" }}
        defaultPageSize={20}
        pageSizes={[10, 20, 50]}
        searchPlaceholder="Search prints"
        emptyTitle="No prints match"
        emptyDescription="Try another name, or clear the filters."
        rowActions={(p) => (
          <>
            <MenuItem value="edit" onClick={() => router.navigate(`/products/${p.id}`)}>
              Edit
            </MenuItem>
            {p.status !== "active" && (
              <MenuItem value="publish" onClick={() => setStatus([p.id], "active")}>
                Publish
              </MenuItem>
            )}
            <MenuSeparator />
            {p.status === "archived" ? (
              <MenuItem value="restore" onClick={() => setStatus([p.id], "draft")}>
                Restore to drafts
              </MenuItem>
            ) : (
              <MenuItem value="archive" destructive onClick={() => setStatus([p.id], "archived")}>
                Archive
              </MenuItem>
            )}
          </>
        )}
        bulkActions={(ids) => (
          <>
            <DataTableBulkAction icon={<CircleDot {...icon} />} label="Publish" onClick={() => setStatus(ids, "active")} />
            <DataTableBulkAction tone="destructive" icon={<Archive {...icon} />} label="Archive" onClick={() => setStatus(ids, "archived")} />
          </>
        )}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ the editor */

const blankProduct = (): Product => ({
  id: "",
  handle: "",
  name: "",
  collection: "Coast",
  photo: "",
  description: "",
  status: "draft",
  createdAt: iso(Date.now()),
  variants: [],
})

const slugify = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
const sizeCode = (size: Size) => size.replace("×", "x")
const finishCode = (finish: Finish) => (finish === "Unframed" ? "u" : finish === "Oak frame" ? "o" : "b")

/** Every chosen size in every chosen finish, at the shop's usual prices. */
function variantsFor(id: string, name: string, sizes: Size[], finishes: Finish[]): Variant[] {
  const code = (slugify(name).replaceAll("-", "").slice(0, 6) || "NEW").toUpperCase()
  return SIZES.filter((s) => sizes.includes(s)).flatMap((size) =>
    FINISHES.filter((f) => finishes.includes(f)).map((finish) => ({
      id: `${id}-${sizeCode(size)}-${finishCode(finish)}`,
      productId: id,
      size,
      finish,
      sku: `TP-${code}-${size.replace("×", "")}-${finish === "Unframed" ? "U" : finish === "Oak frame" ? "OK" : "BK"}`,
      price: PRINT_PRICE[size] + (finish === "Unframed" ? 0 : FRAME_PRICE[size]),
      stock: finish === "Unframed" ? 20 : 4,
    })),
  )
}

export function ProductPage({ id }: { id: string | null }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const sold = useUnitsSold()
  const existing = id ? state.products.find((p) => p.id === id) : undefined
  const [draft, setDraft] = React.useState<Product>(() => existing ?? blankProduct())
  const [sizes, setSizes] = React.useState<Size[]>(["30×40", "50×70"])
  const [finishes, setFinishes] = React.useState<Finish[]>(["Unframed", "Oak frame"])
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [handleTouched, setHandleTouched] = React.useState(!!existing)

  if (id && !existing) return <ErrorPage code="404" />
  const isNew = !existing
  const dirty = isNew ? !!(draft.name || draft.description || draft.photo) : JSON.stringify(draft) !== JSON.stringify(existing)
  const set = (patch: Partial<Product>) => setDraft((d) => ({ ...d, ...patch }))
  const setVariant = (variantId: string, patch: Partial<Variant>) => setDraft((d) => ({ ...d, variants: d.variants.map((v) => (v.id === variantId ? { ...v, ...patch } : v)) }))

  const save = () => {
    const next: Record<string, string> = {}
    if (!draft.name.trim()) next.name = "Give the print a name."
    const handle = slugify(draft.handle || draft.name)
    if (!handle) next.handle = "Use letters or numbers."
    else if (state.products.some((p) => p.handle === handle && p.id !== draft.id)) next.handle = `Another print already uses /${handle}.`
    if (!draft.photo) next.photo = "Add a photo of the print."
    if (isNew && (!sizes.length || !finishes.length)) next.variants = "Choose at least one size and one finish."
    if (!isNew && draft.variants.some((v) => v.price <= 0)) next.variants = "Every variant needs a price above €0."
    setErrors(next)
    if (Object.keys(next).length) return
    if (isNew) {
      const newId = `p${Date.now().toString(36)}`
      const product: Product = { ...draft, id: newId, handle, name: draft.name.trim(), variants: variantsFor(newId, draft.name, sizes, finishes) }
      actions.createProduct(product)
      router.navigate(`/products/${newId}`, { replace: true })
    } else {
      actions.saveProduct({ ...draft, handle, name: draft.name.trim() })
    }
  }

  const units = existing ? (sold.get(existing.id) ?? 0) : 0
  const lowAt = state.settings.lowStockAt

  return (
    <div className={`${pageStack} pb-16`}>
      <PageHeader
        back={{ to: "/products", label: "Back to products" }}
        title={isNew ? "Add product" : existing.name}
        badges={existing && <Badge variant={PRODUCT_STATUS[existing.status].variant}>{PRODUCT_STATUS[existing.status].label}</Badge>}
        description={isNew ? "A new print for the shop. It starts as a draft until you publish it." : `${existing.collection} collection · ${plural(units, "unit")} sold in 30 days`}
        actions={
          existing && (
            <Button
              onClick={() => {
                const status: ProductStatus = existing.status === "archived" ? "draft" : "archived"
                actions.updateProduct(existing.id, { status }, status === "archived" ? "Product archived" : "Restored to drafts")
                set({ status })
              }}
            >
              {existing.status === "archived" ? <ArchiveRestore {...icon} /> : <Archive {...icon} />}
              {existing.status === "archived" ? "Restore" : "Archive"}
            </Button>
          )
        }
      />

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <LabelledField label="Name" error={errors.name}>
                <Input
                  value={draft.name}
                  placeholder="Harbour at dawn"
                  onChange={(event) => {
                    set({ name: event.target.value, ...(handleTouched ? null : { handle: slugify(event.target.value) }) })
                    setErrors((e) => ({ ...e, name: "" }))
                  }}
                />
              </LabelledField>
              <LabelledField label="Description" hint="One or two sentences. It shows under the photo in the shop.">
                <Textarea value={draft.description} rows={3} onChange={(event) => set({ description: event.target.value })} />
              </LabelledField>
              <LabelledField label="Address in the shop" error={errors.handle} hint={`tidelineprints.com/prints/${slugify(draft.handle || draft.name) || "…"}`}>
                <Input
                  value={draft.handle}
                  spellCheck={false}
                  onChange={(event) => {
                    setHandleTouched(true)
                    set({ handle: event.target.value })
                    setErrors((e) => ({ ...e, handle: "" }))
                  }}
                />
              </LabelledField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo</CardTitle>
              <CardDescription>A JPEG or PNG of the print itself, at least 2000 pixels on the long side.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              {draft.photo && <img src={draft.photo} alt={draft.name} className="aspect-[4/5] w-full rounded-[12px] object-cover ring-1 ring-black/5 sm:w-44 dark:ring-white/10" />}
              <FileInput
                accept="image/jpeg,image/png,image/webp"
                maxSize={20_000_000}
                value={[]}
                onValueChange={(files) => {
                  const file = files[0]
                  if (!file) return
                  set({ photo: URL.createObjectURL(file) })
                  setErrors((e) => ({ ...e, photo: "" }))
                }}
                onReject={() => setErrors((e) => ({ ...e, photo: "Use a JPEG, PNG or WebP under 20 MB." }))}
                className="flex-1"
              >
                <FileInputDropzone className="h-full min-h-40 justify-center">
                  <ImageUp size={22} strokeWidth={1.5} aria-hidden className="mb-2 text-muted-foreground" />
                  <p className="mb-3 text-[13px] text-muted-foreground">{draft.photo ? "Drop a new photo to replace it" : "Drop the photo here"}</p>
                  <FileInputTrigger>
                    <Upload {...icon} />
                    Choose a photo
                  </FileInputTrigger>
                </FileInputDropzone>
              </FileInput>
            </CardContent>
            {errors.photo && <p className="px-[var(--card-padding,1.25rem)] text-[12px] text-destructive">{errors.photo}</p>}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isNew ? "Sizes and finishes" : "Variants"}</CardTitle>
              <CardDescription>
                {isNew ? "Every size you pick comes in every finish you pick, at the shop's usual prices. You can change prices after." : `Stock at or under ${lowAt} counts as running low.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isNew ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <CheckboxGroup aria-label="Sizes" value={sizes} onValueChange={(v) => setSizes(v as Size[])} className="flex flex-col gap-2.5">
                    <span className="text-[13px] font-medium">Sizes</span>
                    {SIZES.map((size) => (
                      <label key={size} className="flex items-center gap-2.5 text-[13px]">
                        <Checkbox value={size} />
                        {size} cm <span className="text-muted-foreground">from {moneyWhole(PRINT_PRICE[size])}</span>
                      </label>
                    ))}
                  </CheckboxGroup>
                  <CheckboxGroup aria-label="Finishes" value={finishes} onValueChange={(v) => setFinishes(v as Finish[])} className="flex flex-col gap-2.5">
                    <span className="text-[13px] font-medium">Finishes</span>
                    {FINISHES.map((finish) => (
                      <label key={finish} className="flex items-center gap-2.5 text-[13px]">
                        <Checkbox value={finish} />
                        {finish}
                      </label>
                    ))}
                  </CheckboxGroup>
                </div>
              ) : (
                <div className="-mx-[var(--card-padding,1.25rem)] overflow-x-auto px-[calc(var(--card-padding,1.25rem)-0.75rem)]">
                  <Table aria-label="Variants" className="w-full min-w-[560px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-start">Size and finish</TableHead>
                        <TableHead className="hidden text-start md:table-cell">SKU</TableHead>
                        <TableHead className="w-32 text-start">Price</TableHead>
                        <TableHead className="w-28 text-start">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draft.variants.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>
                            <span className="flex flex-col gap-0.5">
                              <span className="font-medium">
                                {v.size} cm · {v.finish}
                              </span>
                              {v.stock <= lowAt && <span className="text-[12px] text-[color:var(--chart-4)]">{v.stock === 0 ? "Out of stock" : "Running low"}</span>}
                            </span>
                          </TableCell>
                          <TableCell className="hidden font-mono text-[12px] text-muted-foreground md:table-cell">{v.sku}</TableCell>
                          <TableCell>
                            <NumberInput value={v.price / 100} min={0} step={5} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} onValueChange={(n) => setVariant(v.id, { price: Math.round((n ?? 0) * 100) })}>
                              <NumberInputGroup>
                                <NumberInputControl aria-label={`Price, ${v.size} ${v.finish}`} />
                              </NumberInputGroup>
                            </NumberInput>
                          </TableCell>
                          <TableCell>
                            <NumberInput value={v.stock} min={0} step={1} onValueChange={(n) => setVariant(v.id, { stock: Math.max(0, Math.round(n ?? 0)) })}>
                              <NumberInputGroup>
                                <NumberInputControl aria-label={`Stock, ${v.size} ${v.finish}`} />
                              </NumberInputGroup>
                            </NumberInput>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {errors.variants && <p className="text-[12px] text-destructive">{errors.variants}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Only active prints show in the shop.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Choice label="Status" value={draft.status} onChange={(v) => set({ status: v as ProductStatus })} options={Object.entries(PRODUCT_STATUS).map(([value, { label }]) => ({ value, label }))} />
              <LabelledField label="Collection">
                <Choice label="Collection" value={draft.collection} onChange={(v) => set({ collection: v as Collection })} options={COLLECTIONS.map((c) => ({ value: c, label: c }))} />
              </LabelledField>
            </CardContent>
          </Card>
          {existing && (
            <Card>
              <CardHeader>
                <CardTitle>Stock</CardTitle>
                <CardDescription>{plural(stockOf(draft), "print")} across {plural(draft.variants.length, "variant")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {SIZES.map((size) => {
                  const inSize = draft.variants.filter((v) => v.size === size)
                  const stock = inSize.reduce((n, v) => n + v.stock, 0)
                  return (
                    <Meter key={size} value={Math.min(stock, 60)} max={60} aria-label={`${size} cm in stock`} className="flex flex-col gap-1.5">
                      <span className="flex w-full justify-between text-[12px]">
                        <span>{size} cm</span>
                        <span className="text-muted-foreground tabular-nums">{count(stock)}</span>
                      </span>
                      <MeterTrack>
                        <MeterIndicator />
                      </MeterTrack>
                    </Meter>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* The save bar: it rises while there are changes to keep. */}
      <div
        data-dirty={dirty || isNew ? "" : undefined}
        className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex translate-y-6 justify-center px-4 opacity-0 transition-[translate,opacity] duration-[calc(320ms*var(--kf-speed,1))] ease-[var(--ease-spring)] data-dirty:pointer-events-auto data-dirty:translate-y-0 data-dirty:opacity-100 motion-reduce:transition-none"
      >
        <div className="flex items-center gap-3 rounded-[14px] bg-popover py-2 ps-4 pe-2 text-[13px] text-popover-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.3)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_12px_32px_-8px_rgb(0_0_0/0.8)]">
          <span className="text-muted-foreground">{isNew ? "New print, not saved yet" : "Unsaved changes"}</span>
          {!isNew && (
            <Button size="sm" variant="ghost" onClick={() => (setDraft(existing), setErrors({}))} disabled={!dirty}>
              Discard
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={save} disabled={!isNew && !dirty}>
            {isNew ? "Save draft" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
