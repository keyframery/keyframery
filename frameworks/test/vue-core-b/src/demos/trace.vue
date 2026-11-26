<script setup lang="ts">
/* Mirrors src/demos/trace.tsx with its default controls (status icons, durations, failed step closed). */
import { onBeforeUnmount, ref } from "vue"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
  type TraceStatus,
} from "@/components/keyframery/trace"

const steps = [
  { id: "places", running: "Reading your saved places in Lisbon", done: "Read 14 saved places in Lisbon", took: "1.2s",
    detail: ["Time Out Market, LX Factory and Miradouro da Senhora do Monte are close together, so they go on Saturday.", "Pastéis de Belém is the only one west of the river bend: Sunday morning."] },
  { id: "flights", running: "Checking flights from Manchester", done: "Found the 07:05 on Friday, back Monday 19:40", took: "2.4s" },
  { id: "ramiro", running: "Booking Cervejaria Ramiro for Saturday", done: "Couldn't book Cervejaria Ramiro for Saturday", failed: true, took: "3.1s",
    detail: ["Fully booked from 19:00 to 22:30. They hold the bar for walk-ins; the queue is usually about 40 minutes.", "Put on the waitlist for 19:30 instead."] },
  { id: "hotels", running: "Comparing 6 hotels in Alfama", done: "Picked Memmo Alfama, €212 a night", took: "4.0s" },
  { id: "plan", running: "Writing the day-by-day plan", done: "Wrote a plan for 4 days", took: "2.2s" },
] as { id: string; running: string; done: string; failed?: boolean; took: string; detail?: string[] }[]

const run = ref(0)
const at = ref(3)
let timers: ReturnType<typeof setTimeout>[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))
function replan(e: MouseEvent) {
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  timers.forEach(clearTimeout)
  run.value++
  at.value = 0
  timers = steps.map((_, i) => setTimeout(() => (at.value = i + 1), (700 + i * 900) * speed))
}
const statusOf = (i: number): TraceStatus | undefined => (i < at.value ? (steps[i].failed ? "error" : undefined) : i === at.value ? "running" : "pending")
</script>

<template>
  <div data-demo="trace" class="@container w-full max-w-[460px]">
    <div class="flex justify-end">
      <div class="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">
        Plan a long weekend in Lisbon, 14 to 17 March. Two of us, flying from Manchester.
      </div>
    </div>
    <div class="mt-5 flex items-center justify-between gap-3">
      <div class="text-[12px] font-medium text-muted-foreground">{{ at >= steps.length ? "Done" : "Working on it" }}</div>
      <button
        type="button"
        data-action="replan"
        class="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        @click="replan"
      >
        Plan again
      </button>
    </div>
    <Trace :key="run" class="mt-3" aria-label="What the assistant did">
      <template v-for="(step, i) in steps" :key="step.id">
        <TraceCollapsible v-if="step.detail" :data-step="step.id" :disabled="i >= at" :default-open="false">
          <TraceCollapsibleTrigger>
            <TraceLine :status="statusOf(i)">
              <TraceIcon />
              <TraceTitle>{{ i < at ? step.done : step.running }}</TraceTitle>
              <TraceDescription v-if="i < at" class="@max-[26rem]:hidden">{{ step.took }}</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <p v-for="p in step.detail" :key="p">{{ p }}</p>
          </TraceCollapsibleContent>
        </TraceCollapsible>
        <div v-else :data-step="step.id" class="w-fit max-w-full">
          <TraceLine :status="statusOf(i)">
            <TraceIcon />
            <TraceTitle>{{ i < at ? step.done : step.running }}</TraceTitle>
            <TraceDescription v-if="i < at" class="@max-[26rem]:hidden">{{ step.took }}</TraceDescription>
          </TraceLine>
        </div>
      </template>
    </Trace>
  </div>
</template>
