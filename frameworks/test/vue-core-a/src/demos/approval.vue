<script setup lang="ts">
/* Mirrors src/demos/approval.tsx at its default controls (high risk, Always allow, no reason, description
   and target shown). The agent asks to refund the order and waits for the person. */
import { createAgent } from "@ui-sdk/vue/agent"
import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue"

import { Approval, createApprovals, type ApprovalRequest, type Approvals } from "@/components/keyframery/approval"
import { Badge } from "@/components/keyframery/badge"
import { Button } from "@/components/keyframery/button"

const settings = { risk: "high" as const }
let approvals: Approvals | undefined
let agent: ReturnType<typeof createAgent> | undefined
function bridge() {
  approvals ??= createApprovals({
    describe: (step) =>
      step.label === "Refund order #1048"
        ? { title: "Issue a refund", description: "£84.00 back to Priya Shah's Visa ending 4242. This can't be undone.", risk: settings.risk }
        : {},
  })
  agent ??= createAgent({ allow: approvals.allow })
  return { approvals, agent }
}

/* ?controls=askReason:true, like the React lab. */
const askReason = /askReason:true/.test(new URLSearchParams(location.search).get("controls") ?? "")
const refunded = shallowRef(false)
const reply = shallowRef<string | null>(null)
const requests = shallowRef<ApprovalRequest[]>(bridge().approvals.requests())
const request = computed(() => requests.value.at(-1))
let turn: AbortController | null = null
let stop: (() => void) | undefined

function ask() {
  const { agent } = bridge()
  turn?.abort()
  const controller = new AbortController()
  turn = controller
  refunded.value = false
  reply.value = null
  agent.act({ steps: [{ ref: "Refund order #1048", action: "press" }] }, { signal: controller.signal }).then((result) => {
    if (controller.signal.aborted) return
    reply.value = result.ok ? "Done. Priya will see £84.00 back on her card in 3 to 5 days." : "Okay, I won't refund it. Want me to resend the parcel instead?"
  })
}

onMounted(() => {
  stop = bridge().approvals.subscribe(() => (requests.value = bridge().approvals.requests()))
  requests.value = bridge().approvals.requests()
  ask()
})
onBeforeUnmount(() => {
  stop?.()
  turn?.abort()
})
</script>

<template>
  <div class="w-full max-w-[460px]">
    <div class="flex justify-end">
      <div class="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">Priya's parcel never arrived. Refund order #1048.</div>
    </div>

    <div class="@container mt-5 flex items-center gap-3 rounded-[12px] px-3 py-2.5 shadow-[0_0_0_1px_rgb(0_0_0/0.07)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
      <div class="min-w-0 flex-1">
        <div class="truncate text-[13px] font-medium">Order #1048</div>
        <div class="truncate text-[12px] text-muted-foreground">Priya Shah · 2 items</div>
      </div>
      <span class="text-[13px] font-medium tabular-nums @max-[20rem]:hidden">£84.00</span>
      <Badge :variant="refunded ? 'secondary' : 'success'" class="w-[68px] @max-[22rem]:hidden">{{ refunded ? "Refunded" : "Paid" }}</Badge>
      <Button
        size="sm"
        aria-label="Refund order #1048"
        data-agent-confirm="Refunds £84.00 to Priya Shah's Visa ending 4242"
        :disabled="refunded"
        @click="refunded = true"
      >
        Refund
      </Button>
    </div>

    <div class="mt-5 mb-2.5 flex items-center justify-between gap-3">
      <div class="text-[12px] font-medium text-muted-foreground">{{ request?.status === "pending" ? "Waiting for you" : "Agent" }}</div>
      <button
        type="button"
        data-action="ask"
        data-agent-hidden="true"
        class="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[calc(1-0.04*var(--kf-flourish,1))] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        @click="ask"
      >
        Ask again
      </button>
    </div>

    <Approval v-if="request" :key="request.id" :request="request" risk="high" allow-always :ask-reason="askReason" />

    <p
      :key="reply ?? 'none'"
      class="mt-3 min-h-[1lh] text-[13px] leading-snug text-foreground animate-[kf-approval-answer_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"
    >
      {{ reply }}
    </p>
  </div>
</template>
