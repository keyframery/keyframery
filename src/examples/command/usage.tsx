import { Command, CommandInput, CommandItem, CommandList, CommandSearch } from "@/components/ui/command"

export default function Usage() {
  return (
    <Command aria-label="Commands">
      <CommandSearch>
        <CommandInput placeholder="Type a command…" />
      </CommandSearch>
      <CommandList>
        <CommandItem value="new">New file</CommandItem>
        <CommandItem value="open">Open…</CommandItem>
      </CommandList>
    </Command>
  )
}
