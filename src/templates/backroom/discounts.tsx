"use client"

/* Discounts: the store's codes, what each gives, who can use it, how often it has been used and
   whether it is running. Create and edit in a sheet from the side, import a CSV, pause, and delete
   with a confirmation (typing DELETE for several at once). Uses of TIDE10 come from the orders. */

import { Copy, Download, FileUp, Pause, Play, Plus, Shuffle, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/ui/data-table"
import { CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious, DatePicker, DatePickerContent, DatePickerField, DatePickerInput, DatePickerTrigger } from "@/components/ui/date-picker"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerBackdrop, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { FileInput, FileInputDropzone, FileInputTrigger } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { MenuItem, MenuSeparator } from "@/components/ui/menu"
import { NumberInput, NumberInputControl, NumberInputGroup } from "@/components/ui/number-input"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import { iso } from "./data"
import type { Discount, DiscountKind } from "./extras"
import { count, day, moneyWhole, plural } from "./format"
import { Choice, downloadText, icon, LabelledField, linkLook, pageStack, PageHeader } from "./kit"
import { toaster, useStore } from "./store"

type Status = "Active" | "Scheduled" | "Expired" | "Used up" | "Paused"

const STATUS_BADGE: Record<Status, "success" | "outline" | "secondary"> = { Active: "success", Scheduled: "outline", Expired: "secondary", "Used up": "secondary", Paused: "outline" }
const COLLECTIONS = ["all", "Coast", "Walks", "Places", "Kitchen"] as const

function statusOf(d: Discount, used: number): Status {
  const now = Date.now()
  if (d.paused) return "Paused"
  if (d.limit !== null && used >= d.limit) return "Used up"
  if (Date.parse(d.startsAt) > now) return "Scheduled"
  if (d.endsAt && Date.parse(d.endsAt) < now) return "Expired"
  return "Active"
}

/** "10% off", "€20 off", "Free shipping", with the minimum after it. */
export function describe(d: Pick<Discount, "kind" | "value" | "minimum" | "appliesTo">) {
  const what = d.kind === "percent" ? `${d.value}% off` : d.kind === "amount" ? `${moneyWhole(d.value)} off` : "Free shipping"
  const where = d.appliesTo === "all" ? "" : ` ${d.appliesTo} prints`
  const min = d.minimum ? ` over ${moneyWhole(d.minimum)}` : ""
  return `${what}${where}${min}`
}

type Row = Discount & { uses: number; status: Status; summary: string }

export function DiscountsPage() {
  const { state, actions } = useStore()
  const [selected, setSelected] = React.useState<string[]>([])
  const [editing, setEditing] = React.useState<Discount | "new" | null>(null)
  const [deleting, setDeleting] = React.useState<string[] | null>(null)
  const [importing, setImporting] = React.useState(false)

  const rows = React.useMemo<Row[]>(() => {
    const fromOrders = new Map<string, number>()
    for (const o of state.orders) if (o.discountCode && o.status !== "cancelled") fromOrders.set(o.discountCode, (fromOrders.get(o.discountCode) ?? 0) + 1)
    return state.discounts.map((d) => {
      const uses = d.used + (fromOrders.get(d.code) ?? 0)
      return { ...d, uses, status: statusOf(d, uses), summary: describe(d) }
    })
  }, [state.discounts, state.orders])

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "code",
        header: "Code",
        searchable: true,
        hideable: false,
        sticky: true,
        cell: (d) => (
          <Button variant="ghost" size="sm" className={cn(linkLook, "font-mono text-[12.5px] tracking-wide")} onClick={() => setEditing(d)} aria-label={`Edit ${d.code}`}>
            {d.code}
          </Button>
        ),
      },
      {
        id: "status",
        header: "Status",
        filter: { options: (["Active", "Scheduled", "Paused", "Expired", "Used up"] as Status[]).map((value) => ({ value })) },
        cell: (d) => <Badge variant={STATUS_BADGE[d.status]}>{d.status}</Badge>,
      },
      { id: "summary", header: "Discount", searchable: true, cell: (d) => <span className="text-muted-foreground">{d.summary}</span> },
      {
        id: "uses",
        header: "Used",
        align: "end",
        accessor: (d) => d.uses,
        cell: (d) => (
          <span className="tabular-nums">
            {count(d.uses)}
            {d.limit !== null && <span className="text-muted-foreground"> of {count(d.limit)}</span>}
          </span>
        ),
      },
      {
        id: "dates",
        header: "Runs",
        accessor: (d) => d.startsAt,
        hideBelow: "md",
        cell: (d) => (
          <span className="text-muted-foreground tabular-nums">
            {day(d.startsAt)}
            {d.endsAt ? ` to ${day(d.endsAt)}` : ", no end"}
          </span>
        ),
      },
    ],
    [],
  )

  const exportCsv = () => {
    const header = ["code", "kind", "value", "minimum", "applies_to", "starts", "ends", "limit"]
    const lines = state.discounts.map((d) => [d.code, d.kind, d.kind === "amount" ? (d.value / 100).toFixed(2) : d.value, (d.minimum / 100).toFixed(2), d.appliesTo, d.startsAt.slice(0, 10), d.endsAt?.slice(0, 10) ?? "", d.limit ?? ""].join(","))
    downloadText("discounts.csv", [header.join(","), ...lines].join("\r\n") + "\r\n")
    toaster.success(`Exported ${plural(state.discounts.length, "discount")}`, { description: "discounts.csv" })
  }
  const active = rows.filter((r) => r.status === "Active").length

  return (
    <div className={pageStack}>
      <PageHeader
        title="Discounts"
        description={`${plural(active, "code")} running now · ${plural(rows.length - active, "other")}`}
        actions={
          <>
            <Button onClick={() => setImporting(true)}>
              <FileUp {...icon} />
              Import
            </Button>
            <Button onClick={exportCsv}>
              <Download {...icon} />
              Export
            </Button>
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus {...icon} />
              Create discount
            </Button>
          </>
        }
      />
      <DataTable<Row>
        label="Discounts"
        data={rows}
        columns={columns}
        getRowId={(d) => d.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        defaultPageSize={20}
        pageSizes={[10, 20, 50]}
        searchPlaceholder="Search codes"
        emptyTitle="No discounts match"
        emptyDescription="Try another code, or clear the filters."
        rowActions={(d) => (
          <>
            <MenuItem value="edit" onClick={() => setEditing(d)}>
              Edit
            </MenuItem>
            <MenuItem
              value="copy"
              onClick={() => {
                void navigator.clipboard?.writeText(d.code)
                toaster.success(`Copied ${d.code}`)
              }}
            >
              Copy code
            </MenuItem>
            <MenuItem value="pause" onClick={() => actions.setDiscountPaused(d.id, !d.paused)}>
              {d.paused ? "Switch back on" : "Pause"}
            </MenuItem>
            <MenuSeparator />
            <MenuItem value="delete" destructive onClick={() => setDeleting([d.id])}>
              Delete
            </MenuItem>
          </>
        )}
        bulkActions={(ids) => (
          <>
            <DataTableBulkAction icon={<Pause {...icon} />} label="Pause" onClick={() => (ids.forEach((id) => actions.setDiscountPaused(id, true)), setSelected([]))} />
            <DataTableBulkAction icon={<Play {...icon} />} label="Switch on" onClick={() => (ids.forEach((id) => actions.setDiscountPaused(id, false)), setSelected([]))} />
            <DataTableBulkAction tone="destructive" icon={<Trash2 {...icon} />} label="Delete" onClick={() => setDeleting(ids)} />
          </>
        )}
      />
      <DiscountSheet discount={editing} onClose={() => setEditing(null)} />
      <DeleteDialog ids={deleting} onClose={(done) => (setDeleting(null), done && setSelected([]))} />
      <ImportDialog open={importing} onClose={() => setImporting(false)} />
    </div>
  )
}

/* ------------------------------------------------------------------ create and edit */

type Draft = { code: string; kind: DiscountKind; value: number | null; minimum: number | null; appliesTo: Discount["appliesTo"]; startsAt: string | null; endsAt: string | null; limited: boolean; limit: number | null }

const toDraft = (d?: Discount): Draft =>
  d
    ? { code: d.code, kind: d.kind, value: d.kind === "amount" ? d.value / 100 : d.value, minimum: d.minimum / 100, appliesTo: d.appliesTo, startsAt: d.startsAt.slice(0, 10), endsAt: d.endsAt?.slice(0, 10) ?? null, limited: d.limit !== null, limit: d.limit }
    : { code: "", kind: "percent", value: 10, minimum: 0, appliesTo: "all", startsAt: new Date().toISOString().slice(0, 10), endsAt: null, limited: false, limit: 100 }

const randomCode = () => {
  const words = ["HARBOUR", "TIDE", "SHORE", "GALWAY", "PRINTS", "COAST", "FRAME"]
  return `${words[Math.floor(Math.random() * words.length)]}${Math.floor(10 + Math.random() * 40)}`
}

function DateField({ label, value, onChange, min }: { label: string; value: string | null; onChange: (value: string | null) => void; min?: string }) {
  return (
    <DatePicker value={value} min={min} onValueChange={(v) => onChange(typeof v === "string" ? v : null)}>
      <DatePickerField>
        <DatePickerInput aria-label={label} />
        <DatePickerTrigger />
      </DatePickerField>
      <DatePickerContent>
        <CalendarHeader>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
        </CalendarHeader>
        <CalendarGrid />
      </DatePickerContent>
    </DatePicker>
  )
}

function DiscountSheet({ discount, onClose }: { discount: Discount | "new" | null; onClose: () => void }) {
  const { state, actions } = useStore()
  const existing = discount && discount !== "new" ? discount : undefined
  const [draft, setDraft] = React.useState<Draft>(toDraft())
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    if (discount) (setDraft(toDraft(existing)), setErrors({}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount])
  const set = (patch: Partial<Draft>) => (setDraft((d) => ({ ...d, ...patch })), setErrors({}))

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    const code = draft.code.trim().toUpperCase()
    const next: Record<string, string> = {}
    if (!/^[A-Z0-9-]{3,20}$/.test(code)) next.code = "3 to 20 letters, numbers or dashes."
    else if (state.discounts.some((d) => d.code === code && d.id !== existing?.id)) next.code = `${code} already exists.`
    if (draft.kind === "percent" && (!draft.value || draft.value <= 0 || draft.value > 90)) next.value = "Between 1% and 90%."
    if (draft.kind === "amount" && (!draft.value || draft.value <= 0)) next.value = "More than €0."
    if (!draft.startsAt) next.startsAt = "Choose a start date."
    if (draft.endsAt && draft.startsAt && draft.endsAt < draft.startsAt) next.endsAt = "The end comes before the start."
    if (draft.limited && (!draft.limit || draft.limit < 1)) next.limit = "At least one use."
    setErrors(next)
    if (Object.keys(next).length || !draft.startsAt) return
    actions.saveDiscount(
      {
        id: existing?.id ?? `d${Date.now().toString(36)}`,
        code,
        kind: draft.kind,
        value: draft.kind === "amount" ? Math.round((draft.value ?? 0) * 100) : draft.kind === "percent" ? Math.round(draft.value ?? 0) : 0,
        minimum: Math.round((draft.minimum ?? 0) * 100),
        appliesTo: draft.appliesTo,
        startsAt: iso(Date.parse(`${draft.startsAt}T00:00:00Z`)),
        endsAt: draft.endsAt ? iso(Date.parse(`${draft.endsAt}T23:59:00Z`)) : undefined,
        limit: draft.limited ? (draft.limit ?? null) : null,
        used: existing?.used ?? 0,
        paused: existing?.paused ?? false,
      },
      !existing,
    )
    onClose()
  }

  const preview = describe({ kind: draft.kind, value: draft.kind === "amount" ? Math.round((draft.value ?? 0) * 100) : (draft.value ?? 0), minimum: Math.round((draft.minimum ?? 0) * 100), appliesTo: draft.appliesTo })

  return (
    <Drawer open={!!discount} onOpenChange={(open) => !open && onClose()} side="end">
      <DrawerBackdrop />
      <DrawerContent aria-label={existing ? `Edit ${existing.code}` : "Create discount"} className="[--drawer-width:440px]">
        <form onSubmit={save} noValidate className="flex h-full min-h-0 flex-col">
          <DrawerHeader className="px-6 pt-6">
            <DrawerTitle>{existing ? `Edit ${existing.code}` : "Create discount"}</DrawerTitle>
            <DrawerDescription>{draft.code ? `${draft.code.toUpperCase()}: ${preview}` : "Customers type the code at checkout."}</DrawerDescription>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
            <LabelledField label="Code" error={errors.code}>
              <div className="flex gap-2">
                <Input value={draft.code} autoFocus spellCheck={false} placeholder="WINTER25" className="font-mono uppercase" onChange={(event) => set({ code: event.target.value.toUpperCase() })} />
                <Button onClick={() => set({ code: randomCode() })} aria-label="Make up a code">
                  <Shuffle {...icon} />
                </Button>
              </div>
            </LabelledField>
            <LabelledField label="What it gives" error={errors.value}>
              <SegmentedControl
                aria-label="Kind of discount"
                value={draft.kind}
                onValueChange={(v) => v && set({ kind: v as DiscountKind, value: v === "percent" ? 10 : v === "amount" ? 10 : 0 })}
                className="flex w-full [&>[data-slot=segmented-control-item]]:flex-1 [&_[data-slot=segmented-control-item-copy]]:flex-1"
              >
                <SegmentedControlItem value="percent">Percent</SegmentedControlItem>
                <SegmentedControlItem value="amount">Amount</SegmentedControlItem>
                <SegmentedControlItem value="shipping">Free shipping</SegmentedControlItem>
              </SegmentedControl>
              {draft.kind !== "shipping" && (
                <NumberInput
                  value={draft.value}
                  min={0}
                  max={draft.kind === "percent" ? 90 : undefined}
                  step={draft.kind === "percent" ? 5 : 5}
                  format={draft.kind === "percent" ? { style: "unit", unit: "percent" } : { style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
                  onValueChange={(v) => set({ value: v })}
                  className="mt-2"
                >
                  <NumberInputGroup>
                    <NumberInputControl aria-label={draft.kind === "percent" ? "Percent off" : "Euros off"} />
                  </NumberInputGroup>
                </NumberInput>
              )}
            </LabelledField>
            <div className="grid grid-cols-2 gap-3">
              <LabelledField label="Applies to">
                <Choice label="Applies to" value={draft.appliesTo} onChange={(v) => set({ appliesTo: v as Draft["appliesTo"] })} options={COLLECTIONS.map((c) => ({ value: c, label: c === "all" ? "Every print" : c }))} />
              </LabelledField>
              <LabelledField label="Order minimum">
                <NumberInput value={draft.minimum} min={0} step={10} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} onValueChange={(v) => set({ minimum: v })}>
                  <NumberInputGroup>
                    <NumberInputControl aria-label="Order minimum" />
                  </NumberInputGroup>
                </NumberInput>
              </LabelledField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LabelledField label="Starts" error={errors.startsAt}>
                <DateField label="Starts" value={draft.startsAt} onChange={(v) => set({ startsAt: v })} />
              </LabelledField>
              <LabelledField label="Ends" error={errors.endsAt} hint="Leave empty to keep it running.">
                <DateField label="Ends" value={draft.endsAt} min={draft.startsAt ?? undefined} onChange={(v) => set({ endsAt: v })} />
              </LabelledField>
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center justify-between gap-4 text-[13px]">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">Limit the number of uses</span>
                  <span className="text-[12px] text-muted-foreground">Across all customers. It stops once they're used up.</span>
                </span>
                <Switch checked={draft.limited} onCheckedChange={(next) => set({ limited: next === true })} />
              </label>
              {draft.limited && (
                <LabelledField label="Uses" error={errors.limit}>
                  <NumberInput value={draft.limit} min={1} step={10} onValueChange={(v) => set({ limit: v })} className="w-40">
                    <NumberInputGroup>
                      <NumberInputControl aria-label="Most uses" />
                    </NumberInputGroup>
                  </NumberInput>
                </LabelledField>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {existing ? "Save" : "Create discount"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

/* ------------------------------------------------------------------ delete */

function DeleteDialog({ ids, onClose }: { ids: string[] | null; onClose: (done: boolean) => void }) {
  const { state, actions } = useStore()
  const [typed, setTyped] = React.useState("")
  React.useEffect(() => setTyped(""), [ids])
  const many = (ids?.length ?? 0) > 1
  const codes = state.discounts.filter((d) => ids?.includes(d.id)).map((d) => d.code)
  const confirmed = !many || typed.trim() === "DELETE"
  return (
    <AlertDialog open={!!ids} onOpenChange={(open) => !open && onClose(false)}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{many ? `Delete ${codes.length} discounts?` : `Delete ${codes[0]}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            Customers can't use {many ? "these codes" : "this code"} any more. Orders that already used {many ? "them" : "it"} keep their discount.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {many && (
          <LabelledField label="Type DELETE to confirm">
            <Input value={typed} autoComplete="off" spellCheck={false} onChange={(event) => setTyped(event.target.value)} />
          </LabelledField>
        )}
        <AlertDialogFooter>
          <AlertDialogClose>Keep</AlertDialogClose>
          <AlertDialogClose
            variant="destructive"
            disabled={!confirmed}
            data-agent-confirm={`Deletes ${codes.join(", ")}`}
            onClick={() => {
              if (ids && confirmed) actions.deleteDiscounts(ids)
              onClose(true)
            }}
          >
            Delete
          </AlertDialogClose>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ------------------------------------------------------------------ import */

const TEMPLATE = "code,kind,value,minimum,applies_to,starts,ends,limit\r\nSPRING15,percent,15,0,all,2027-03-01,2027-03-31,200\r\nKITCHEN10,amount,10,50,Kitchen,2027-01-10,,\r\n"

/** Reads the CSV the Export button writes. Returns the discounts and a reason for each line it skipped. */
function parseCsv(text: string): { list: Discount[]; skipped: string[] } {
  const [head, ...lines] = text.trim().split(/\r?\n/)
  const keys = head.split(",").map((k) => k.trim().toLowerCase())
  const list: Discount[] = []
  const skipped: string[] = []
  lines.forEach((line, i) => {
    const cells = Object.fromEntries(line.split(",").map((v, j) => [keys[j], v.trim()]))
    const code = (cells.code ?? "").toUpperCase()
    const kind = cells.kind as DiscountKind
    const value = Number(cells.value)
    if (!/^[A-Z0-9-]{3,20}$/.test(code)) return skipped.push(`Line ${i + 2}: "${cells.code ?? ""}" isn't a code.`)
    if (!["percent", "amount", "shipping"].includes(kind)) return skipped.push(`Line ${i + 2}: kind must be percent, amount or shipping.`)
    if (kind !== "shipping" && !(value > 0)) return skipped.push(`Line ${i + 2}: ${code} needs a value above 0.`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cells.starts ?? "")) return skipped.push(`Line ${i + 2}: ${code} needs a start date like 2027-03-01.`)
    list.push({
      id: `d${Date.now().toString(36)}${i}`,
      code,
      kind,
      value: kind === "amount" ? Math.round(value * 100) : kind === "percent" ? Math.round(value) : 0,
      minimum: Math.round(Number(cells.minimum || 0) * 100),
      appliesTo: (["Coast", "Walks", "Places", "Kitchen"].includes(cells.applies_to) ? cells.applies_to : "all") as Discount["appliesTo"],
      startsAt: iso(Date.parse(`${cells.starts}T00:00:00Z`)),
      endsAt: /^\d{4}-\d{2}-\d{2}$/.test(cells.ends ?? "") ? iso(Date.parse(`${cells.ends}T23:59:00Z`)) : undefined,
      limit: cells.limit ? Number(cells.limit) : null,
      used: 0,
      paused: false,
    })
  })
  return { list, skipped }
}

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions } = useStore()
  const [parsed, setParsed] = React.useState<{ name: string; list: Discount[]; skipped: string[] } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (open) (setParsed(null), setError(null))
  }, [open])
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:500px]">
        <div className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Import discounts</DialogTitle>
            <DialogDescription>A CSV with one code per line, in the same columns Export writes. A code that already exists is replaced.</DialogDescription>
          </DialogHeader>
          <FileInput
            accept=".csv,text/csv"
            maxSize={1_000_000}
            value={[]}
            onValueChange={async (files) => {
              const file = files[0]
              if (!file) return
              const result = parseCsv(await file.text())
              setError(result.list.length ? null : "No discounts found. Check the file against the template.")
              setParsed({ name: file.name, ...result })
            }}
            onReject={() => setError("Choose a CSV file under 1 MB.")}
          >
            <FileInputDropzone className="py-6">
              <p className="mb-3 text-[13px] text-muted-foreground">{parsed ? `${parsed.name}: ${plural(parsed.list.length, "discount")} ready` : "Drop a CSV file here"}</p>
              <FileInputTrigger>Choose a file</FileInputTrigger>
            </FileInputDropzone>
          </FileInput>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          {parsed && parsed.skipped.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-[10px] bg-muted/70 p-3 text-[12px] text-muted-foreground">
              {parsed.skipped.slice(0, 4).map((s) => (
                <li key={s}>{s}</li>
              ))}
              {parsed.skipped.length > 4 && <li>and {parsed.skipped.length - 4} more lines skipped</li>}
            </ul>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => downloadText("discounts-template.csv", TEMPLATE)}>
              <Copy {...icon} />
              Download the template
            </Button>
            <div className="flex gap-2">
              <DialogClose>Cancel</DialogClose>
              <Button
                variant="primary"
                disabled={!parsed?.list.length}
                onClick={() => {
                  if (!parsed?.list.length) return
                  actions.importDiscounts(parsed.list)
                  onClose()
                }}
              >
                Import {parsed?.list.length ? count(parsed.list.length) : ""}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

