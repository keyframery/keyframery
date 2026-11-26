<script setup lang="ts">
// In a dialog
// Put it in a `Dialog` for a command palette. `shortcut` on the trigger opens it with ⌘K or Ctrl+K.

import { Dialog, DialogBackdrop, DialogContent, DialogTrigger } from "@/components/keyframery/dialog"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandSearch } from "@/components/keyframery/command"

const pages = ["Dashboard", "Projects", "Team", "Billing", "Settings"]
</script>

<template>
  <Dialog>
    <DialogTrigger shortcut="mod+k">Search… ⌘K</DialogTrigger>
    <DialogBackdrop />
    <DialogContent class="p-0">
      <Command aria-label="Go to" class="h-[320px]">
        <CommandSearch>
          <CommandInput aria-label="Go to a page" placeholder="Go to…" />
        </CommandSearch>
        <CommandEmpty>No pages match.</CommandEmpty>
        <CommandList>
          <CommandItem v-for="page in pages" :key="page" :value="page">{{ page }}</CommandItem>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
