"use client"

/* Keyframery fixture: per-element settings, sections, portals, nesting, code-opened dialogs. */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { T } from "./trigger"

function SmallDialog({ id, label, ...props }: { id: string; label: string } & Record<string, string>) {
  return (
    <Dialog>
      {T(DialogTrigger, <Button variant="outline" data-testid={`${id}-trigger`}>{label}</Button>)}
      <DialogContent data-testid={`${id}-dialog`} {...props}>
        <DialogTitle>{label}</DialogTitle>
        <DialogDescription>Fixture dialog.</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

function TwoTabs({ id, ...props }: { id: string } & Record<string, string>) {
  return (
    <Tabs defaultValue="a" data-testid={`${id}-tabs`} {...props}>
      <TabsList>
        <TabsTrigger value="a" data-testid={`${id}-tab-a`}>First</TabsTrigger>
        <TabsTrigger value="b" data-testid={`${id}-tab-b`}>Second</TabsTrigger>
      </TabsList>
      <TabsContent value="a" className="rounded-lg border p-4"><p>First panel</p></TabsContent>
      <TabsContent value="b" className="rounded-lg border p-4"><p>Second panel</p><div className="mt-3 h-16 rounded bg-muted" /></TabsContent>
    </Tabs>
  )
}

export function Cases() {
  const [late, setLate] = React.useState(false)
  return (
    <main className="grid min-h-dvh gap-10 bg-background p-8">
      <h1 className="text-lg font-semibold">Keyframery cases</h1>

      <section className="flex flex-wrap gap-3">
        <Button variant="outline" data-testid="late-trigger" onClick={() => setTimeout(() => setLate(true), 1800)}>
          Open in 1.8 s
        </Button>
        <Dialog open={late} onOpenChange={setLate}>
          <DialogContent data-testid="late-dialog">
            <DialogTitle>Opened by code</DialogTitle>
            <DialogDescription>No press started this one.</DialogDescription>
          </DialogContent>
        </Dialog>
        <SmallDialog id="fade" label="Fade dialog" data-cut="fade" />
        <SmallDialog id="center" label="Centre dialog" data-cut-origin="center" />
      </section>

      <section data-cut-pace="2" className="flex flex-wrap gap-3">
        <SmallDialog id="slow" label="Slow section dialog" />
      </section>

      <section data-cut="none" className="grid gap-3">
        <SmallDialog id="none" label="Stock dialog" />
        <TwoTabs id="none" />
      </section>

      <section>
        <TwoTabs id="whip" data-cut="whip" />
      </section>

      <section className="flex flex-wrap gap-3">
        <Sheet>
          {T(SheetTrigger, <Button variant="outline" data-testid="nested-sheet-trigger">Sheet with more inside</Button>)}
          <SheetContent data-testid="nested-sheet">
            <SheetTitle>Outer sheet</SheetTitle>
            <SheetDescription>Opens a dialog and another sheet.</SheetDescription>
            <div className="flex flex-col gap-3 p-4">
              <Dialog>
                {T(DialogTrigger, <Button variant="outline" data-testid="nested-dialog-trigger">Dialog from the sheet</Button>)}
                <DialogContent data-testid="nested-dialog">
                  <DialogTitle>Nested dialog</DialogTitle>
                  <DialogDescription>Opened from inside a sheet.</DialogDescription>
                </DialogContent>
              </Dialog>
              <Sheet>
                {T(SheetTrigger, <Button variant="outline" data-testid="nested-sheet2-trigger">Sheet from the sheet</Button>)}
                <SheetContent side="left" data-testid="nested-sheet2">
                  <SheetTitle>Inner sheet</SheetTitle>
                  <SheetDescription>Opened from inside a sheet.</SheetDescription>
                </SheetContent>
              </Sheet>
            </div>
          </SheetContent>
        </Sheet>
      </section>
    </main>
  )
}
