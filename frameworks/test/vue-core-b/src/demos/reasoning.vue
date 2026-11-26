<script setup lang="ts">
/* Mirrors src/demos/reasoning.tsx (default controls). */
import { computed, onBeforeUnmount, ref } from "vue"
import { Markdown } from "@/components/keyframery/markdown"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/keyframery/reasoning"

const question = "Alfama flat at €148 a night (4th floor, no lift) or Príncipe Real at €171 (ground floor)? Mum is coming with us."
const thinking = `**Weighing the stairs against the price.** Alfama is €23 a night cheaper, so €69 over three nights.

It is a fourth floor with no lift, though, and the streets around it are steep cobbles. With Mum along, that counts every time they go out.

Príncipe Real:
- ground floor, no stairs at all
- flatter streets, five minutes from the Rato metro
- the extra €69 split four ways is about €17 each

That is an easy trade. Recommend Príncipe Real, and keep Alfama only as the budget option.`
const answer = `Book **Príncipe Real**. It costs about **€17 more each** for the three nights, but it is on the ground floor and the streets around it are flat, which Mum will thank you for by day two.

Alfama only wins if the budget is tight.`
const words = (text: string) => text.match(/\s*\S+/g) ?? []
type Phase = "done" | "thinking" | "answering"
const phase = ref<Phase>("done")
const thought = ref(thinking)
const said = ref(answer)
const runs = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
function stream(text: string, set: (s: string) => void, speed: number, done: () => void) {
  const all = words(text)
  let at = 0
  const tick = () => {
    at = Math.min(all.length, at + 1 + (at % 4 === 0 ? 1 : 0))
    set(all.slice(0, at).join(""))
    if (at >= all.length) {
      done()
      return
    }
    timer = setTimeout(tick, (42 + (at % 5) * 9) * speed)
  }
  tick()
}
function ask(e: MouseEvent) {
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  clearTimeout(timer)
  runs.value += 1
  thought.value = ""
  said.value = ""
  phase.value = "thinking"
  timer = setTimeout(
    () =>
      stream(thinking, (s) => (thought.value = s), speed * 1.6, () => {
        timer = setTimeout(() => {
          phase.value = "answering"
          timer = setTimeout(() => stream(answer, (s) => (said.value = s), speed, () => (phase.value = "done")), 420 * speed)
        }, 300 * speed)
      }),
    500 * speed,
  )
}
const duration = computed(() => (runs.value === 0 ? 5 : undefined))
const doneLabel = (seconds: number | undefined) => (seconds === undefined ? "Thought for a few seconds" : "Thought for {s}s".replace("{s}", String(seconds)))
</script>

<template>
  <div data-demo="reasoning" class="@container flex h-[440px] w-full max-w-[480px] flex-col">
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)]">
      <div class="flex justify-end">
        <div class="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">{{ question }}</div>
      </div>
      <Reasoning class="mt-5" :streaming="phase === 'thinking'" :duration="duration" :auto-close="true" :default-open="false">
        <ReasoningTrigger thinking-label="Thinking…" :done-label="doneLabel" />
        <ReasoningContent>{{ thought }}</ReasoningContent>
      </Reasoning>
      <Markdown class="mt-3" :streaming="phase === 'answering'" aria-label="Answer">{{ said }}</Markdown>
    </div>
    <div class="flex shrink-0 items-center justify-end pt-3">
      <button
        type="button"
        data-play="ask"
        :disabled="phase !== 'done'"
        class="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color,opacity] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.045] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[calc(1-0.04*var(--kf-flourish,1))] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        @click="ask"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-3.5">
          <path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71M13.25 2.75v2.5h-2.5" />
        </svg>
        Ask again
      </button>
    </div>
  </div>
</template>
