<script setup lang="ts">
// Commands as data
// Pass `items` to `Command` and leave `CommandList` empty: it renders the commands, groups and separators for you, ranked as you type. A command with `items` opens a page of its own.

import { Command, type CommandData, CommandEmpty, CommandInput, CommandList, CommandSearch } from "@/components/keyframery/command"

const commands: CommandData = [
  {
    type: "group",
    label: "Notes",
    items: [
      { value: "new", label: "New note", shortcut: "mod+n" },
      { value: "pin", label: "Pin to top" },
    ],
  },
  { type: "separator" },
  {
    type: "group",
    label: "Settings",
    items: [
      { value: "theme", label: "Change theme…", items: ["Light", "Dark", "System"] },
      { value: "sign-out", label: "Sign out" },
    ],
  },
]
</script>

<template>
  <Command
    aria-label="Commands"
    :items="commands"
    class="h-[300px] w-full max-w-[420px] rounded-[14px] border"
  >
    <CommandSearch>
      <CommandInput aria-label="Search commands" placeholder="Type a command…" />
    </CommandSearch>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandList />
  </Command>
</template>
