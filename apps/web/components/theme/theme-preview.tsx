"use client"

import * as React from "react"
import { toast } from "sonner"

import { LoadCut } from "@/components/keyframery/load-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** A small wall that shows the current settings. */
export function ThemePreview() {
  const [n, setN] = React.useState(2480)
  const [loading, setLoading] = React.useState(false)
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open a dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your dialog cut</DialogTitle>
              <DialogDescription>Change a setting and open me again.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Open a sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Your sheet cut</SheetTitle>
              <SheetDescription>The page behind follows the sheet setting.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Button variant="outline" onClick={() => toast("Saved", { description: "Your toast cut." })}>Show a toast</Button>
      </div>
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Overview</TabsTrigger>
          <TabsTrigger value="b">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="mt-2 rounded-lg border p-3 text-sm">
          Visitors: <ValueCut value={n} locale="en-US" />{" "}
          <Button variant="ghost" size="sm" onClick={() => setN((v) => v + 37)}>Add visitors</Button>
        </TabsContent>
        <TabsContent value="b" className="mt-2 rounded-lg border p-3 text-sm">
          <LoadCut loading={loading} skeleton={<div className="h-16 rounded bg-muted" />}>
            <p>12 events today.</p>
            <div className="mt-2 h-10 rounded bg-muted/60" />
          </LoadCut>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 900) }}>Reload</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
