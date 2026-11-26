<script setup lang="ts">
/* Mirrors src/demos/code-block.tsx at its default controls. */
import { computed, ref } from "vue"

import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/keyframery/code-block"

const code = `import { addMinutes, format, isBefore } from "date-fns"

// Loaves leave the oven at 7:10 and 11:40.
const BAKES = ["07:10", "11:40"] as const

export function pickupSlots(order: Order, now = new Date()) {
  const ready = nextBake(BAKES, order.items, now)
  const slots: Slot[] = []
  for (let t = ready; isBefore(t, closing(now)); t = addMinutes(t, 20)) {
    slots.push({ time: t, label: format(t, "h:mm a") })
  }
  return slots.slice(0, 6)
}
`
const steps = [
  { id: "bakes", label: "Bake times", lines: [3, 4] },
  { id: "slots", label: "Every 20 min", lines: [7, 8, 9, 10, 11] },
  { id: "trim", label: "First six", lines: [12] },
]
const step = ref("slots")
const highlight = computed(() => [...(steps.find((s) => s.id === step.value)?.lines ?? [])])
const stepClass = (on: boolean) =>
  [
    "h-7 rounded-[9px] px-2.5 text-[12px] leading-none font-medium whitespace-nowrap outline-none transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
    on
      ? "bg-background text-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08)]"
      : "text-muted-foreground hover:text-foreground",
  ].join(" ")
</script>

<template>
  <div class="@container w-full max-w-[600px]">
    <div class="mb-3 flex items-center justify-between gap-3 @max-[30rem]:flex-col @max-[30rem]:items-start">
      <div class="min-w-0">
        <div class="text-[15px] font-semibold tracking-tight">Pickup times for pre-orders</div>
        <p class="mt-1 text-[12px] text-muted-foreground">Rye &amp; Sons bakery, order app</p>
      </div>
      <div
        role="group"
        aria-label="Walk through the code"
        class="flex shrink-0 gap-0.5 rounded-[11px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
      >
        <button v-for="s in steps" :key="s.id" type="button" :data-step="s.id" :aria-pressed="step === s.id" :class="stepClass(step === s.id)" @click="step = s.id">{{ s.label }}</button>
      </div>
    </div>

    <CodeBlock :code="code" language="ts" :line-numbers="true" :wrap="false" :highlight="highlight" size="default">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 2.75H5A1.25 1.25 0 0 0 3.75 4v8c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25V6L9 2.75Z" />
            <path d="M9 2.75V6h3.25" />
          </svg>
          lib/pickup-slots.ts
        </CodeBlockTitle>
        <CodeBlockActions>
          <span class="me-1 text-[11.5px] text-muted-foreground @max-[30rem]:hidden">TypeScript</span>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent aria-label="pickup-slots.ts" />
    </CodeBlock>
  </div>
</template>
