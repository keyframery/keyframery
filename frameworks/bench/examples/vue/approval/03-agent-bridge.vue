<script setup lang="ts">
// With UI SDK's agent bridge
// `createApprovals()` gives you an `allow` for `createAgent` and `registerTools`. A step on a control marked `data-agent-confirm` becomes a request; render a card for each and the bridge waits until the person answers, or the agent's signal aborts (that denies it). The card's buttons are hidden from agents, so the agent can read the card but never answer it.

import { onBeforeUnmount, ref, shallowRef } from "vue"
import { createAgent, registerTools } from "@ui-sdk/vue/agent"

import { Approval, createApprovals } from "@/components/keyframery/approval"
import { Button } from "@/components/keyframery/button"

const approvals = createApprovals()
const agent = typeof window === "undefined" ? undefined : createAgent({ allow: approvals.allow })
if (agent) registerTools(agent, { allow: approvals.allow })

const requests = shallowRef(approvals.requests())
onBeforeUnmount(approvals.subscribe(() => (requests.value = approvals.requests())))
const deleted = ref(false)
</script>

<template>
  <div class="flex w-full max-w-[440px] flex-col gap-3">
    <div class="flex items-center gap-2">
      <Button
        size="sm"
        data-agent-confirm="Deletes order #1048 for good"
        :disabled="deleted"
        @click="deleted = true"
      >
        {{ deleted ? 'Deleted' : 'Delete order #1048' }}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        data-agent-hidden="true"
        @click="agent?.act({ steps: [{ ref: 'Delete order #1048', action: 'press' }] })"
      >
        Let the agent try
      </Button>
    </div>
    <Approval
      v-for="request in requests"
      :key="request.id"
      :request="request"
      title="Delete an order"
      allow-always
    />
  </div>
</template>
