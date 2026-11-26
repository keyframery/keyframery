<script setup lang="ts">
// Settings list
// A switch takes effect at once. For a choice that's saved with a form, a checkbox is clearer.

import { Switch } from "@/components/keyframery/switch"

const settings = [
  { label: "Replies", hint: "When someone answers you", on: true },
  { label: "Mentions", hint: "When someone tags you", on: true },
  { label: "Newsletter", hint: "Once a month", on: false },
]
</script>

<template>
  <ul class="w-full max-w-[320px] divide-y divide-border">
    <li v-for="s in settings" :key="s.label">
      <label class="flex cursor-pointer items-center justify-between gap-4 py-3">
        <span class="flex flex-col gap-1">
          <span class="text-[13px] leading-none font-medium">{{ s.label }}</span>
          <span class="text-[12px] leading-none text-muted-foreground">{{ s.hint }}</span>
        </span>
        <Switch :default-checked="s.on" />
      </label>
    </li>
  </ul>
</template>
