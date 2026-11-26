<script setup lang="ts">
// Asking why, and the answer
// `askReason` opens a field before Deny goes through; `onDeny` gets what was typed. Once answered the card closes to one line: "Approved · 2s ago" or "Denied". Control it with `status`.

import { ref } from "vue"

import { Approval } from "@/components/keyframery/approval"

const reason = ref<string>()
</script>

<template>
  <div class="flex w-full max-w-[440px] flex-col gap-3">
    <Approval
      title="Cancel the Lisbon booking"
      description="Memmo Alfama, 14 to 17 March. Free to cancel until Friday."
      target="Press “Cancel booking”"
      risk="medium"
      ask-reason
      @deny="(why) => reason = why ?? ''"
    />
    <p v-if="reason !== undefined" class="text-[12.5px] text-muted-foreground">Reason given: {{ reason || 'none' }}</p>
    <Approval title="Issue a refund" risk="high" status="approved" :resolved-at="Date.now() - 12_000" />
  </div>
</template>
