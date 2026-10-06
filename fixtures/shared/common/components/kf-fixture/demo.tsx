"use client"

/* Keyframery fixture: the 8 automatic components, written the way the shadcn docs write them. */

import * as React from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BaseToastButton } from "./extra"
import { T } from "./trigger"

export function Demo() {
  const [cmd, setCmd] = React.useState(false)
  return (
    <main className="min-h-dvh bg-background p-8">
      <h1 className="text-lg font-semibold">Keyframery fixture</h1>
      <p className="mb-8 text-sm text-muted-foreground">Stock shadcn components.</p>

      <div className="flex flex-wrap items-start gap-3">
        <Dialog>
          {T(DialogTrigger, <Button variant="outline" data-testid="dialog-trigger">Edit profile</Button>)}
          <DialogContent data-testid="dialog">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Change your display name.</DialogDescription>
            </DialogHeader>
            <Input defaultValue="Ada" aria-label="Display name" />
            <DialogFooter>
              {T(DialogClose, <Button variant="outline" data-testid="dialog-cancel">Cancel</Button>)}
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          {T(AlertDialogTrigger, <Button variant="destructive" data-testid="alert-trigger">Delete project</Button>)}
          <AlertDialogContent data-testid="alert">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
              <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="alert-cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Sheet>
          {T(SheetTrigger, <Button variant="outline" data-testid="sheet-trigger">Open sheet</Button>)}
          <SheetContent data-testid="sheet">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>The page behind should step back.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Sheet>
          {T(SheetTrigger, <Button variant="outline" data-testid="sheet-bottom-trigger">Bottom sheet</Button>)}
          <SheetContent side="bottom" data-testid="sheet-bottom">
            <SheetHeader>
              <SheetTitle>Share</SheetTitle>
              <SheetDescription>From the bottom edge.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Drawer>
          {T(DrawerTrigger, <Button variant="outline" data-testid="drawer-trigger">Open drawer</Button>)}
          <DrawerContent data-testid="drawer">
            <DrawerHeader>
              <DrawerTitle>Drawer</DrawerTitle>
              <DrawerDescription>Its own swipe motion is left alone.</DrawerDescription>
            </DrawerHeader>
            <div className="h-40" />
          </DrawerContent>
        </Drawer>

        <Button variant="outline" data-testid="command-trigger" onClick={() => setCmd(true)}>
          Search ⌘K
        </Button>
        <CommandDialog open={cmd} onOpenChange={setCmd}>
          <Command>
            <CommandInput placeholder="Type a command…" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Go to">
                <CommandItem>Dashboard</CommandItem>
                <CommandItem>Settings</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>

        <Button data-testid="toast-trigger" onClick={() => toast("Saved", { description: "Your changes are live." })}>
          Save changes
        </Button>
        <BaseToastButton />
      </div>

      <div className="mt-12 max-w-xl">
        <Tabs defaultValue="overview" data-testid="tabs">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="rounded-lg border p-4">
            <p className="font-medium">Overview</p>
            <p className="text-sm text-muted-foreground">Revenue is up 12% this week.</p>
          </TabsContent>
          <TabsContent value="analytics" className="rounded-lg border p-4">
            <p className="font-medium">Analytics</p>
            <p className="text-sm text-muted-foreground">1,284 visitors, 3.2% conversion.</p>
            <div className="mt-3 h-24 rounded-md bg-muted" />
          </TabsContent>
          <TabsContent value="reports" className="rounded-lg border p-4">
            <p className="font-medium">Reports</p>
            <p className="text-sm text-muted-foreground">Three reports ready to download.</p>
          </TabsContent>
        </Tabs>
        <p data-testid="below-tabs" className="mt-6 text-sm text-muted-foreground">
          Text below the tabs (watch for jumps).
        </p>
      </div>
    </main>
  )
}
