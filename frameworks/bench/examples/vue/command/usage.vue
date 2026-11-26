<script setup lang="ts">
import { Command, CommandInput, CommandItem, CommandList, CommandSearch } from "@/components/keyframery/command"
</script>

<template>
  <Command aria-label="Commands">
    <CommandSearch>
      <CommandInput placeholder="Type a command…" />
    </CommandSearch>
    <CommandList>
      <CommandItem value="new">New file</CommandItem>
      <CommandItem value="open">Open…</CommandItem>
    </CommandList>
  </Command>
</template>
