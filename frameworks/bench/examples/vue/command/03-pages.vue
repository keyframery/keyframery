<script setup lang="ts">
// Nested pages
// An item with `page` opens a second list inside the palette. Backspace in an empty search goes back.

import { ref } from "vue"

import { Command, CommandInput, CommandItem, CommandList, CommandPage, CommandSearch } from "@/components/keyframery/command"

const pages = ref<string[]>([])
</script>

<template>
  <Command
    v-model:pages="pages"
    aria-label="Commands"
    @action="pages = []"
    class="h-[260px] w-full max-w-[400px] rounded-[14px] border"
  >
    <CommandSearch>
      <CommandInput aria-label="Search" :placeholder="pages.length ? 'Choose a theme…' : 'Type a command…'" />
    </CommandSearch>
    <CommandList>
      <CommandPage>
        <CommandItem value="theme" page="theme">Change theme…</CommandItem>
        <CommandItem value="language">Change language</CommandItem>
      </CommandPage>
      <CommandPage value="theme">
        <CommandItem value="light">Light</CommandItem>
        <CommandItem value="dark">Dark</CommandItem>
        <CommandItem value="system">Match the system</CommandItem>
      </CommandPage>
    </CommandList>
  </Command>
</template>
