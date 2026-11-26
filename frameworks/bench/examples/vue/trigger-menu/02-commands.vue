<script setup lang="ts">
// Slash commands
// Each trigger has its own list. `insert` decides the text that goes in.

import { TriggerMenu, TriggerMenuContent, TriggerMenuInput, TriggerMenuItems, TriggerMenuList } from "@/components/keyframery/trigger-menu"

const people = [
  { value: "maya", label: "Maya Chen" },
  { value: "tom", label: "Tom Okafor" },
]
const commands = [
  { value: "date", label: "date" },
  { value: "todo", label: "todo" },
  { value: "table", label: "table" },
]
</script>

<template>
  <div class="w-full max-w-[360px]">
    <TriggerMenu :triggers="[
          { char: '@', items: people },
          { char: '/', items: commands, insert: (item) => `/${item.label} ` },
        ]">
      <TriggerMenuInput aria-label="Note" placeholder="Type / for commands or @ for people" />
      <TriggerMenuContent class="w-56">
        <TriggerMenuList v-slot="{ state }">
          <TriggerMenuItems :items="state.items" />
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  </div>
</template>
