"use client"

import * as React from "react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { CommandDialog, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Open the dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>The dialog grew out of the button you pressed. Close it and it returns there.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="demo-project">Project name</Label>
          <Input id="demo-project" defaultValue="Northwind" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button />}>Rename project</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Delete the project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Northwind?</AlertDialogTitle>
          <AlertDialogDescription>Its 14 pages and their history go with it. This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep the project</AlertDialogCancel>
          <AlertDialogAction>Delete the project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open the sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>The page stepped back so the sheet reads as on top of it.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Open the drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share</DrawerTitle>
          <DrawerDescription>Swipe it down to close. The swipe is the drawer&apos;s own.</DrawerDescription>
        </DrawerHeader>
        <div className="h-32" />
      </DrawerContent>
    </Drawer>
  )
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="rounded-lg border p-4 text-sm">Signed in as ada@studio.dev.</TabsContent>
      <TabsContent value="billing" className="rounded-lg border p-4 text-sm">Pro plan, renews on 1 November.<div className="mt-3 h-12 rounded bg-muted" /></TabsContent>
      <TabsContent value="team" className="rounded-lg border p-4 text-sm">4 members. Ada, Leo, Priya and Sam.</TabsContent>
    </Tabs>
  )
}

export function ToastDemo() {
  return (
    <>
      <Button variant="outline" onClick={() => toast("Link copied", { description: "Anyone with the link can view." })}>Copy the link</Button>
      <Button variant="outline" onClick={() => toast("Draft saved")}>Save the draft</Button>
    </>
  )
}

export function CommandDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open the command menu</Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Command menu" description="Search for a command">
        <Command>
          <CommandInput placeholder="Type a command" />
          <CommandList>
            <CommandEmpty>No command has that name.</CommandEmpty>
            <CommandGroup heading="Project">
              <CommandItem onSelect={() => setOpen(false)}>New page</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Invite a teammate</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Open settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

export function TunedDemo() {
  return (
    <>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Popover</PopoverTrigger>
        <PopoverContent className="w-56 text-sm">It grows from its trigger at Keyframery&apos;s pace.</PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>Tooltip</TooltipTrigger>
        <TooltipContent>Retimed to 180 ms</TooltipContent>
      </Tooltip>
      <Accordion className="w-full max-w-sm">
        <AccordionItem value="a">
          <AccordionTrigger>What changes?</AccordionTrigger>
          <AccordionContent>Only the timing and easing. The motion is the library&apos;s own.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}
