<script setup lang="ts">
/* Mirrors src/demos/button-group.tsx at its default controls (horizontal, md). */
import { computed, ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/keyframery/button-group"

const messages = [
  { from: "Lena Okafor", photo: "/demo/face-2.jpg", time: "09:42", subject: "Call sheet for the Lisbon shoot", body: "We're on the Alfama rooftop from 6:30 for first light. Vans leave the hotel at 5:45." },
  { from: "Tomás Reyes", photo: "/demo/face-3.jpg", time: "08:15", subject: "Drone permit came through", body: "Approved for the river front on Thursday morning only. Scan attached, keep it on you." },
]
const page = ref(0)
const message = computed(() => messages[page.value])
</script>

<template>
  <div class="@container w-full max-w-[560px] rounded-[18px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
    <div class="flex items-start justify-between gap-2 border-b border-border p-3">
      <ButtonGroup aria-label="Message actions" orientation="horizontal">
        <Button size="md" data-action="archive" aria-label="Archive" class="@max-[26rem]:px-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive" aria-hidden="true"><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>
          <span class="@max-[26rem]:sr-only">Archive</span>
        </Button>
        <Button size="md" data-action="snooze" aria-label="Snooze" class="@max-[26rem]:px-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-3" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6h4" /></svg>
          <span class="@max-[26rem]:sr-only">Snooze</span>
        </Button>
        <Button size="icon" data-action="delete" aria-label="Delete" variant="destructive">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash lucide-trash-2" aria-hidden="true"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
        </Button>
      </ButtonGroup>

      <div class="flex items-start gap-[var(--button-group-gap,0.5rem)]">
        <ButtonGroup aria-label="Pages">
          <ButtonGroupText class="tabular-nums @max-[26rem]:px-[var(--button-group-inset-x,0.5rem)]">
            <span class="@max-[26rem]:hidden">{{ page + 3 }} of 128</span>
            <span class="hidden @max-[26rem]:inline">{{ page + 3 }}/128</span>
          </ButtonGroupText>
          <Button size="icon" data-action="previous" aria-label="Previous message" @click="page = 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <Button size="icon" data-action="next" aria-label="Next message" @click="page = 1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Reply">
          <Button size="md" variant="primary" class="@max-[26rem]:px-2" aria-label="Reply">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-reply" aria-hidden="true"><path d="M20 18v-2a4 4 0 0 0-4-4H4" /><path d="m9 17-5-5 5-5" /></svg>
            <span class="@max-[26rem]:sr-only">Reply</span>
          </Button>
          <ButtonGroupSeparator class="bg-[var(--button-group-line,color-mix(in_oklab,var(--primary-foreground)_25%,transparent))]" />
          <Button size="icon" variant="primary" aria-label="More ways to reply" class="w-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <div :key="page" class="flex gap-3 p-5">
      <img :src="message.photo" alt="" class="size-10 shrink-0 rounded-full bg-muted object-cover" />
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-3">
          <span class="truncate text-[13px] font-medium">{{ message.from }}</span>
          <span class="shrink-0 text-[12px] text-muted-foreground tabular-nums">{{ message.time }}</span>
        </div>
        <div class="mt-1 truncate text-[15px] font-semibold tracking-tight">{{ message.subject }}</div>
        <p class="mt-2 text-[13px] leading-5 text-muted-foreground">{{ message.body }}</p>
      </div>
    </div>
  </div>
</template>
