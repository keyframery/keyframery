<script setup lang="ts">
/* Mirrors src/demos/badge.tsx at its default controls. */
import { computed, ref } from "vue"

import { Badge } from "@/components/keyframery/badge"

const key =
  "inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

const threads = [
  { id: "tap", from: "Priya Shah", initials: "PS", subject: "Train tickets attached", time: "09:41", add: 1 },
  { id: "ines", from: "Mum", initials: "M", subject: "Are you still coming Sunday?", time: "08:12", add: 3 },
  { id: "casa", from: "Gareth Price", initials: "GP", subject: "Re: boiler service", time: "Mon", add: 0 },
  { id: "bank", from: "Ellie Shaw", initials: "ES", subject: "Photos from the party", time: "Sun", add: 1 },
]
const unread = ref<Record<string, number>>({ tap: 1, ines: 2, casa: 0, bank: 1 })
const delayed = ref(false)
const total = computed(() => Object.values(unread.value).reduce((a, b) => a + b, 0))
const receive = () => {
  unread.value = Object.fromEntries(threads.map((t) => [t.id, unread.value[t.id] + t.add]))
  delayed.value = !delayed.value
}
const readAll = () => (unread.value = Object.fromEntries(threads.map((t) => [t.id, 0])))
</script>

<template>
  <div
    style="--badge-height: 20px; --badge-radius: 9999px; --badge-font: 11px; --badge-gap: 6px; --badge-padding: 8px; max-width: 420px"
    class="w-full rounded-[16px] bg-card text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]"
  >
    <div class="flex items-center gap-2 px-4 pt-4 pb-3">
      <h3 class="text-[15px] font-semibold tracking-tight">Inbox</h3>
      <Badge :count="total" :max="99" variant="default" />
      <div class="ml-auto flex gap-1.5">
        <button type="button" data-play="receive" :class="key" @click="receive">Get mail</button>
        <button type="button" data-play="read" :class="key" @click="readAll">Mark all read</button>
      </div>
    </div>
    <ul class="border-t border-border">
      <li v-for="t in threads" :key="t.id" class="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
        <span class="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{{ t.initials }}</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span :class="'truncate text-[13px] ' + (unread[t.id] ? 'font-semibold' : 'font-medium text-muted-foreground')">{{ t.from }}</span>
            <Badge v-if="t.id === 'tap'" :dot="true" :variant="delayed ? 'destructive' : 'success'">{{ delayed ? "Delayed 40 min" : "On time" }}</Badge>
            <Badge v-if="t.id === 'casa'" variant="outline">Booked</Badge>
          </div>
          <div class="mt-0.5 truncate text-[12px] text-muted-foreground">{{ t.subject }}</div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[11px] text-muted-foreground tabular-nums">{{ t.time }}</span>
          <span class="flex h-5 items-center">
            <Badge v-if="unread[t.id] > 0" variant="secondary" :count="unread[t.id]" :max="99" />
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>
