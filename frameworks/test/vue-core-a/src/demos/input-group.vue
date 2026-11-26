<script setup lang="ts">
/* Mirrors src/demos/input-group.tsx at its default controls. */
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupCount, InputGroupInput, InputGroupTextarea } from "@/components/keyframery/input-group"
</script>

<template>
  <div class="@container w-full max-w-[460px] rounded-[18px] bg-background p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
    <div class="flex items-center gap-3">
      <img src="/demo/lake.jpg" alt="" class="h-12 w-16 shrink-0 rounded-[10px] bg-muted object-cover" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-[14px] font-medium tracking-tight">Larch cabin above Lake Bled</div>
        <div class="mt-1 truncate text-[12px] text-muted-foreground">14 to 17 May, hosted by Marta</div>
      </div>
      <img src="/demo/face-4.jpg" alt="Marta" class="size-8 shrink-0 rounded-full bg-muted object-cover" />
    </div>

    <InputGroup class="mt-4" aria-label="Message to Marta">
      <InputGroupTextarea aria-label="Message to Marta" placeholder="Ask Marta about check-in, parking or the sauna" :maxlength="280" :disabled="false" />
      <InputGroupAddon align="block-end">
        <InputGroupButton size="icon-xs" aria-label="Attach a file" :disabled="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip" aria-hidden="true">
            <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
          </svg>
        </InputGroupButton>
        <InputGroupCount show="used" class="ms-auto" />
        <InputGroupButton size="icon-xs" variant="primary" aria-label="Send" data-show="filled" class="rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up" aria-hidden="true">
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>

    <div class="mt-3 flex flex-col gap-1.5">
      <InputGroup aria-label="Promo code">
        <InputGroupAddon align="inline-start">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket-percent" aria-hidden="true">
            <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M9 9h.01" />
            <path d="m15 9-6 6" />
            <path d="M15 15h.01" />
          </svg>
        </InputGroupAddon>
        <InputGroupInput aria-label="Promo code" placeholder="Promo code" autocomplete="off" :spellcheck="false" class="uppercase placeholder:normal-case" :disabled="false" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="default" data-show="filled">Apply</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  </div>
</template>
