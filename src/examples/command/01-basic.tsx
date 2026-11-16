// Basic
// Fuzzy search over items, in groups. Each item can show its `shortcut`.
import { FilePlus, FolderOpen, Moon, Settings } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
  CommandSearch,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export default function CommandBasic() {
  return (
    <Command aria-label="Commands" className="h-[300px] w-full max-w-[420px] rounded-[14px] border">
      <CommandSearch>
        <CommandInput aria-label="Search commands" placeholder="Type a command…" />
      </CommandSearch>
      <CommandEmpty>Nothing matches.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          <CommandGroupLabel>Files</CommandGroupLabel>
          <CommandItem value="new" label="New file" shortcut="mod+n">
            <CommandItemIcon>
              <FilePlus />
            </CommandItemIcon>
            <CommandItemText>New file</CommandItemText>
            <CommandShortcut />
          </CommandItem>
          <CommandItem value="open" label="Open" shortcut="mod+o">
            <CommandItemIcon>
              <FolderOpen />
            </CommandItemIcon>
            <CommandItemText>Open…</CommandItemText>
            <CommandShortcut />
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandGroupLabel>App</CommandGroupLabel>
          <CommandItem value="theme" label="Toggle dark mode" keywords={["theme", "night"]}>
            <CommandItemIcon>
              <Moon />
            </CommandItemIcon>
            <CommandItemText>Toggle dark mode</CommandItemText>
          </CommandItem>
          <CommandItem value="settings" label="Settings" shortcut="mod+,">
            <CommandItemIcon>
              <Settings />
            </CommandItemIcon>
            <CommandItemText>Settings</CommandItemText>
            <CommandShortcut />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
