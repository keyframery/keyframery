<script setup lang="ts">
/* Mirrors src/demos/alert.tsx at its default controls (destructive, dismissible). */
import { ref } from "vue"

import { Alert, AlertClose, AlertDescription, AlertTitle } from "@/components/keyframery/alert"
import { Button } from "@/components/keyframery/button"

const open = ref(true)
const round = ref(0)
</script>

<template>
  <div class="@container w-full max-w-[440px]">
    <div class="rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-[15px] font-semibold tracking-tight">Frankfurt to Lisbon</div>
          <div class="mt-1 text-[12px] text-muted-foreground">LH 1172 · Thu 21 Nov · 07:25</div>
        </div>
        <span class="rounded-full bg-muted px-2 py-1 text-[11px] leading-none font-medium text-muted-foreground">Economy</span>
      </div>

      <div class="mt-4 flex items-center gap-3 rounded-[12px] bg-muted/60 px-3 py-2.5">
        <img src="/demo/face-2.jpg" alt="" class="size-8 rounded-full object-cover" />
        <div class="min-w-0 flex-1">
          <div class="text-[13px] leading-tight font-medium">Inês Carvalho</div>
          <div class="mt-0.5 text-[12px] leading-tight text-muted-foreground">Seat 14A · 1 bag</div>
        </div>
      </div>

      <Alert :key="round" variant="destructive" v-model:open="open" class="mt-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-exclamation-point lucide-alert-circle lucide-circle-alert" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <AlertTitle>Your passport expires too soon</AlertTitle>
        <AlertDescription>Portugal needs three months left on it after you fly home. Yours ends on 2 January.</AlertDescription>
        <AlertClose />
      </Alert>

      <div class="mt-4 flex flex-col-reverse gap-2 @[360px]:flex-row @[360px]:items-center @[360px]:justify-end">
        <Button variant="ghost">Update passport</Button>
        <Button variant="primary" data-play="check-in" @click="() => { open = true; round++ }">Check in</Button>
      </div>
    </div>
  </div>
</template>
