<script setup lang="ts">
// One choice
// An always-open list. Arrow keys move and select, and typing jumps to an item.

import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/keyframery/listbox"

const plans = ["Free", "Pro", "Team", "Enterprise"]
</script>

<template>
  <Listbox aria-label="Plan" default-value="Pro" class="w-full max-w-[220px]">
    <ListboxItem v-for="plan in plans" :key="plan" :value="plan">
      {{ plan }}<ListboxItemIndicator />
    </ListboxItem>
  </Listbox>
</template>
