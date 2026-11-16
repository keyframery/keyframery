// In a dialog
// Put it in a `Dialog` for a command palette. `shortcut` on the trigger opens it with ⌘K or Ctrl+K.
import { Dialog, DialogBackdrop, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandSearch } from "@/components/ui/command"

const pages = ["Dashboard", "Projects", "Team", "Billing", "Settings"]

export default function CommandDialog() {
  return (
    <Dialog>
      <DialogTrigger shortcut="mod+k">Search… ⌘K</DialogTrigger>
      <DialogBackdrop />
      <DialogContent className="p-0">
        <Command aria-label="Go to" className="h-[320px]">
          <CommandSearch>
            <CommandInput aria-label="Go to a page" placeholder="Go to…" />
          </CommandSearch>
          <CommandEmpty>No pages match.</CommandEmpty>
          <CommandList>
            {pages.map((page) => (
              <CommandItem key={page} value={page}>
                {page}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
