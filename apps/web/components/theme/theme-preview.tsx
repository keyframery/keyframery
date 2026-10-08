"use client"

import { ArrowUpRight, Check, LoaderCircle, Plus, Trash2 } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { ListCut } from "@/components/keyframery/list-cut"
import { LoadCut } from "@/components/keyframery/load-cut"
import { MatchCut } from "@/components/keyframery/match-cut"
import { StateCut } from "@/components/keyframery/state-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type RecordItem = { id: number; name: string; status: "Draft" | "Ready" }

/** A complete interaction sequence, shared by the homepage and theme builder. */
export function ThemePreview({ compact = false }: { compact?: boolean } = {}) {
  const instance = React.useId()
  const [records, setRecords] = React.useState<RecordItem[]>([
    { id: 1, name: "Website launch", status: "Ready" },
    { id: 2, name: "Product update", status: "Draft" },
  ])
  const [createOpen, setCreateOpen] = React.useState(false)
  const [stage, setStage] = React.useState<"edit" | "saving" | "saved">("edit")
  const [name, setName] = React.useState("Spring campaign")
  const [selected, setSelected] = React.useState<RecordItem | null>(null)
  const [loading, setLoading] = React.useState(false)
  const nextId = React.useRef(3)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    },
    [],
  )

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (stage !== "edit" || !name.trim()) return
    setStage("saving")
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null
      const record: RecordItem = { id: nextId.current++, name: name.trim(), status: "Draft" }
      setRecords((prev) => [record, ...prev])
      setStage("saved")
      toast("Record created", { description: `${record.name} is ready to review.` })
    }, 650)
  }

  return (
    <section aria-label="Live motion workflow" className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Launch workspace</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Create a record, change its status, open its details.</p>
        </div>
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open)
            if (open) setStage("edit")
            else if (saveTimer.current) {
              clearTimeout(saveTimer.current)
              saveTimer.current = null
            }
          }}
        >
          <DialogTrigger render={<Button size="sm" />}>
            <Plus /> Create record
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a record</DialogTitle>
              <DialogDescription>Follow one action from dialog to saving state to a new list item.</DialogDescription>
            </DialogHeader>
            <StateCut state={stage}>
              {stage === "edit" ? (
                <form onSubmit={save} className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor={`${instance}-record-name`} className="text-sm font-medium">
                      Record name
                    </label>
                    <Input id={`${instance}-record-name`} value={name} maxLength={80} onChange={(event) => setName(event.target.value)} required />
                  </div>
                  <Button type="submit" disabled={!name.trim()}>
                    Save record
                  </Button>
                </form>
              ) : stage === "saving" ? (
                <div role="status" className="flex items-center gap-3 rounded-lg border bg-muted/40 p-5">
                  <LoaderCircle className="size-4" aria-hidden="true" /> Saving your record…
                </div>
              ) : (
                <div className="grid gap-4">
                  <p role="status" className="flex items-center gap-2">
                    <Check className="size-4" aria-hidden="true" /> Record created
                  </p>
                  <p className="text-sm text-muted-foreground">Your list and record count have updated together.</p>
                  <DialogClose render={<Button />}>View records</DialogClose>
                </div>
              )}
            </StateCut>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 p-4">
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
          <span className="text-sm text-muted-foreground">Records in this workspace</span>
          <span data-testid="preview-record-count" className="text-xl font-semibold tabular-nums">
            <ValueCut value={records.length} announce />
          </span>
        </div>
        <Tabs defaultValue="records">
          <TabsList>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="records" className="min-w-0">
            <ListCut className="grid gap-2" aria-label="Workspace records">
              {records.map((record) => (
                <ListCut.Item
                  key={record.id}
                  id={record.id}
                  className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border p-3"
                  data-testid="preview-record"
                >
                  <MatchCut id={`${instance}-record-${record.id}`} className="min-w-0 flex-1 rounded-md">
                    <button
                      type="button"
                      onClick={() => setSelected(record)}
                      className="flex max-w-full items-center gap-1.5 text-left text-sm font-medium hover:underline"
                    >
                      <span className="truncate">{record.name}</span>
                      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                    </button>
                  </MatchCut>
                  <Button
                    size="xs"
                    variant="secondary"
                    aria-label={`Change status for ${record.name}`}
                    onClick={() =>
                      setRecords((prev) =>
                        prev.map((item) => (item.id === record.id ? { ...item, status: item.status === "Draft" ? "Ready" : "Draft" } : item)),
                      )
                    }
                  >
                    <ValueCut value={record.status} announce />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Remove ${record.name}`}
                    onClick={() => setRecords((prev) => prev.filter((item) => item.id !== record.id))}
                  >
                    <Trash2 />
                  </Button>
                </ListCut.Item>
              ))}
            </ListCut>
            {!records.length && (
              <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Create a record to start your workspace.</p>
            )}
          </TabsContent>
          <TabsContent value="activity">
            <LoadCut
              loading={loading}
              skeleton={
                <div aria-label="Loading activity" className="grid gap-2 rounded-lg border p-4">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              }
            >
              <div className="grid gap-2 rounded-lg border p-4 text-sm">
                <p>Workspace synced</p>
                <p className="text-muted-foreground">{records.length} records available. Changes stay in this preview.</p>
              </div>
            </LoadCut>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              disabled={loading}
              onClick={() => {
                setLoading(true)
                timers.current.push(setTimeout(() => setLoading(false), 1200))
              }}
            >
              Reload activity
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Sheet>
            <SheetTrigger render={<Button size="sm" variant="outline" />}>Open sheet</SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Workspace details</SheetTitle>
                <SheetDescription>Preview the sheet entrance and the page behind it.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-2 px-4 text-sm">
                <p>Launch workspace</p>
                <p className="text-muted-foreground">{records.length} records · shared motion theme</p>
              </div>
            </SheetContent>
          </Sheet>
          <Drawer showSwipeHandle>
            <DrawerTrigger render={<Button size="sm" variant="outline" />}>Open drawer</DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Workspace actions</DrawerTitle>
                <DrawerDescription>Drag to dismiss. The drawer keeps its native gesture.</DrawerDescription>
              </DrawerHeader>
              <p className="p-4 text-sm text-muted-foreground">Preview the drawer and the page depth behind it.</p>
              <DrawerFooter>
                <DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Button size="sm" variant="ghost" onClick={() => toast("Workspace saved", { description: "This message follows your action." })}>
            Show toast
          </Button>
        </div>
        {!compact && (
          <p className="text-xs leading-5 text-muted-foreground">
            Dialog, tabs, sheet and toast use your component cuts. ListCut, ValueCut, MatchCut, LoadCut and StateCut inherit your pace and easing. Browser
            reduced-motion preferences are respected.
          </p>
        )}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record details</DialogTitle>
            <DialogDescription>The list record grows into its detailed view.</DialogDescription>
          </DialogHeader>
          {selected && (
            <MatchCut id={`${instance}-record-${selected.id}`} className="grid gap-3 rounded-lg border bg-muted/30 p-5">
              <p className="font-semibold">{selected.name}</p>
              <p className="text-sm text-muted-foreground">Status: {records.find((record) => record.id === selected.id)?.status ?? selected.status}</p>
              <p className="text-sm text-muted-foreground">One motion theme carries this interaction from the list into the dialog.</p>
            </MatchCut>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
