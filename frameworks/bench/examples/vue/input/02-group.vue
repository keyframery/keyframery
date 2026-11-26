<script setup lang="ts">
// With an icon and a clear button
// `InputGroup` lays an icon or text over the input's edges. `InputClear` empties it and appears only when there's something to clear.

import { Search } from "@lucide/vue"

import { Input, InputClear, InputGroup } from "@/components/keyframery/input"
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-3">
    <InputGroup>
      <Search />
      <Input aria-label="Search" default-value="Lisbon" placeholder="Search" />
      <InputClear aria-label="Clear" />
    </InputGroup>
    <InputGroup class="gap-0">
      <span>acme.com/</span>
      <Input aria-label="Page address" default-value="pricing" :spellcheck="false" />
    </InputGroup>
  </div>
</template>
