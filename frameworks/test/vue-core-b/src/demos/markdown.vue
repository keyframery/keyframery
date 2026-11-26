<script setup lang="ts">
/* Mirrors src/demos/markdown.tsx (default controls). */
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { Markdown } from "@/components/keyframery/markdown"

const question = "We spent €1,284 on the Lisbon weekend. How do we split it fairly between the four of us?"
const intro = `## Who owes what

The weekend came to **€1,284**, so each share is **€321**. Maya paid for the flat, so she is owed the most.`
const table = `| Person | Paid | Share | Settles |
| :-- | --: | --: | --: |
| Maya | €612 | €321 | gets €291 |
| Theo | €388 | €321 | gets €67 |
| Priya | €184 | €321 | pays €137 |
| You | €100 | €321 | pays €221 |`
const transfers = `### The fewest transfers

1. You send Maya **€221**.
2. Priya sends Maya €70 and Theo €67.
   - Both can go through [Wise](https://wise.com) with no fee.

> Three transfers settle everything, and Maya never has to send money back.`
const code = `To keep it current as receipts come in, put this in a \`Settles\` column:

\`\`\`sheets
=SUMIF(Expenses!B:B, A2, Expenses!C:C) - SUM(Expenses!C:C) / 4
\`\`\``
const tasks = `- [x] Flat and flights logged
- [ ] Add *Saturday's dinner* at Ramiro`
const chunk = (text: string) => text.match(/\s*\S+/g) ?? []
const rate = 40
const answer = [intro, table, transfers, code, tasks].join("\n\n")

const shown = ref<string | null>(null)
const scroller = ref<HTMLDivElement>()
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
const streaming = computed(() => shown.value !== null)
const text = computed(() => shown.value ?? answer)

function regenerate(e: MouseEvent) {
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  const words = chunk(answer)
  clearTimeout(timer)
  let at = 0
  shown.value = ""
  scroller.value?.scrollTo({ top: 0 })
  const tick = () => {
    at = Math.min(words.length, at + 1 + (at % 3 === 0 ? 1 : 0) + (at % 7 === 0 ? 1 : 0))
    if (at >= words.length) {
      shown.value = null
      return
    }
    shown.value = words.slice(0, at).join("")
    timer = setTimeout(tick, ((1000 / rate) * 1.6 + (at % 5) * 6) * Math.max(0.5, speed))
  }
  timer = setTimeout(tick, 320 * speed)
}
watch([text, streaming], () => nextTick(() => {
  const el = scroller.value
  if (el && streaming.value) el.scrollTop = el.scrollHeight
}), { flush: "post" })
</script>

<template>
  <div data-demo="markdown" class="@container flex w-full max-w-[520px] flex-col">
    <div class="flex justify-end">
      <div class="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">{{ question }}</div>
    </div>
    <div
      ref="scroller"
      class="mt-4 h-[400px] overflow-y-auto overscroll-contain pe-1 [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-28px),transparent)] @max-[26rem]:h-[460px]"
    >
      <Markdown :streaming="streaming" :caret="true" class="py-4" aria-label="Answer">{{ text }}</Markdown>
    </div>
    <div class="mt-2 flex items-center gap-1 text-[12px] text-muted-foreground">
      <span class="me-auto">{{ streaming ? "Writing…" : "Answered in 4.1s" }}</span>
      <button
        type="button"
        data-play="regenerate"
        :disabled="streaming"
        class="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 leading-none font-medium outline-none transition-[scale,color,background-color,opacity] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.045] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[calc(1-0.04*var(--kf-flourish,1))] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        @click="regenerate"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-3.5">
          <path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71M13.25 2.75v2.5h-2.5" />
        </svg>
        Regenerate
      </button>
    </div>
  </div>
</template>
