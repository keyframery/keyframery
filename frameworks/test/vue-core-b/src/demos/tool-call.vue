<script setup lang="ts">
/* Mirrors src/demos/tool-call.tsx with its default controls (names, durations, courier fails, open on failure). */
import { onBeforeUnmount, ref } from "vue"
import { ToolCall, type ToolCallStatus } from "@/components/keyframery/tool-call"

type Call = { name: string; title: string; doing: string; input: unknown; output?: unknown; error?: string; took: number }
const list: Call[] = [
  { name: "find_order", title: "Looked up order #1048", doing: "Looking up order #1048", input: { order_id: "1048" },
    output: { status: "shipped", carrier: "Royal Mail", shipped: "2026-11-18", items: ["Linen shirt", "Canvas tote"], total: "£84.00" }, took: 420 },
  { name: "track_parcel", title: "Couldn't reach the courier", doing: "Checking the courier", input: { carrier: "royal_mail", tracking: "RM 2048 1196 GB" },
    error: "Royal Mail's tracking page didn't answer within 10 seconds.", took: 10_000 },
  { name: "send_email", title: "Emailed Priya an update", doing: "Writing to Priya", input: { to: "priya@example.com", subject: "Your order #1048", template: "parcel_delayed" },
    output: { sent: true, id: "msg_8f2c41" }, took: 1260 },
]
const run = ref(0)
const at = ref(2)
const startedAt = ref(Date.now())
let timers: ReturnType<typeof setTimeout>[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))
function rerun(e: MouseEvent) {
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  timers.forEach(clearTimeout)
  run.value++
  at.value = 0
  startedAt.value = Date.now()
  timers = list.map((_, i) => setTimeout(() => { at.value = i + 1; startedAt.value = Date.now() }, (900 + i * 1300) * speed))
}
const statusOf = (i: number): ToolCallStatus => (i < at.value ? (list[i].error ? "error" : "done") : i === at.value ? "running" : "pending")
</script>

<template>
  <div data-demo="tool-call" class="w-full max-w-[460px]">
    <div class="flex justify-end">
      <div class="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">
        Where's my order #1048? It was meant to arrive on Friday.
      </div>
    </div>
    <div class="mt-5 flex items-center justify-between gap-3">
      <div class="text-[12px] font-medium text-muted-foreground">{{ at >= list.length ? "Used 3 tools" : "Working on it" }}</div>
      <button
        type="button"
        data-action="rerun"
        data-agent-hidden
        class="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[calc(1-0.04*var(--kf-flourish,1))] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        @click="rerun"
      >
        Run again
      </button>
    </div>
    <div :key="run" class="mt-3 flex flex-col gap-2">
      <ToolCall
        v-for="(call, i) in list"
        :key="call.name"
        :data-call="call.name"
        :name="call.name"
        :title="i < at ? call.title : call.doing"
        :status="statusOf(i)"
        :input="call.input"
        :output="i < at ? call.output : undefined"
        :error="i < at ? call.error : undefined"
        :duration="i < at && !call.error ? call.took : undefined"
        :started-at="statusOf(i) === 'running' ? startedAt : undefined"
        :default-open="i === 0 ? false : undefined"
        :open-on-error="true"
      />
    </div>
  </div>
</template>
