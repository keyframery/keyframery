<script setup lang="ts">
import { createLocalStorage, createPreference } from "@ui-sdk/core"

import { Preferences, PreferenceSwitcher } from "@/components/keyframery/preferences"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("files-view"),
})
</script>

<template>
  <Preferences :preferences="[view]">
    <PreferenceSwitcher :preference="view" aria-label="View" />
    <ul class="grid gap-2 in-data-[view=grid]:grid-cols-2">
      <li>Q3 roadmap.pdf</li>
      <li>Launch checklist.md</li>
    </ul>
  </Preferences>
</template>
