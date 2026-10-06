"use client"

import * as React from "react"

import { LoadCut } from "@/components/keyframery/load-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Button } from "@/components/ui/button"
import { Command, CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { Screen } from "../screen"

type Status = "Pending" | "Processing" | "Paid"

export function Payments({ className }: { className?: string }) {
  const [status, setStatus] = React.useState<Status>("Pending")
  const [due, setDue] = React.useState("14 October")
  const [actions, setActions] = React.useState(false)
  const charge = () => {
    setStatus("Processing")
    setTimeout(() => setStatus("Paid"), 1400)
  }
  return (
    <Screen name="payments" title="Payments" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Invoice 1044, Northwind Studio</p>
          <p className="text-2xl font-semibold tracking-tight">$1,300.00</p>
        </div>
        <span className="rounded-full border px-2.5 py-0.5 text-sm" data-testid="invoice-status">
          <span className="sr-only">Status: </span>
          <ValueCut value={status} announce />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Due</span>
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" />}>{due}</PopoverTrigger>
          <PopoverContent className="w-56">
            <p className="mb-2 text-sm font-medium">Change the due date</p>
            <div className="grid gap-1">
              {["14 October", "21 October", "1 November"].map((d) => (
                <Button key={d} variant={d === due ? "secondary" : "ghost"} size="sm" className="justify-start" onClick={() => setDue(d)}>{d}</Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="sm" className="ml-auto" aria-label="Search actions" data-director="search" onClick={() => setActions(true)}>
          Actions <kbd className="ml-1 rounded border px-1 text-[11px] text-muted-foreground">⌘K</kbd>
        </Button>
      </div>
      <LoadCut loading={status === "Processing"} skeleton={<div className="mt-4 h-[72px] rounded-md bg-muted" />}>
        <div className="mt-4 rounded-md border p-3 text-sm">
          {status === "Paid" ? <p>Paid with Visa ending 4242. A receipt went to billing@northwind.studio.</p> : <p className="text-muted-foreground">No payment yet. Charging uses the card on file, Visa ending 4242.</p>}
        </div>
      </LoadCut>
      <Button className="mt-4 w-fit" disabled={status !== "Pending"} data-director="charge" onClick={charge}>
        {status === "Paid" ? "Charged" : "Charge $1,300.00"}
      </Button>
      <CommandDialog open={actions} onOpenChange={setActions} title="Invoice actions" description="Actions for invoice 1044">
        <Command>
          <CommandInput placeholder="Find an action" />
          <CommandList>
            <CommandGroup heading="Invoice 1044">
              <CommandItem onSelect={() => setActions(false)}>Send a reminder</CommandItem>
              <CommandItem onSelect={() => setActions(false)}>Download the PDF</CommandItem>
              <CommandItem onSelect={() => { setStatus("Pending"); setActions(false) }}>Mark as unpaid</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </Screen>
  )
}
