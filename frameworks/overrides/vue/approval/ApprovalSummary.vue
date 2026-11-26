<script setup lang="ts">
/* "Approved · 2s ago" in the payoff green, or "Denied" in muted ink: rises into place once there is an
   answer. With no slot it shows the mark, the answer and how long ago, kept current. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import AnswerMark from "./AnswerMark.vue"
import ApprovalAgo from "./ApprovalAgo.vue"
import { parts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "animate-[kf-approval-answer_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_calc(80ms*var(--kf-speed,1))_backwards] motion-reduce:animate-none",
  "flex h-5 items-center gap-1 text-[12.5px] leading-none font-medium whitespace-nowrap [&_[data-slot=approval-mark]]:size-3.5",
  "data-[status=approved]:text-[color:var(--approval-success,color-mix(in_oklch,oklch(0.62_0.16_150)_85%,var(--foreground)))] dark:data-[status=approved]:text-[color:var(--approval-success,oklch(0.62_0.16_150))]",
  "data-[status=denied]:text-muted-foreground [&_[data-slot=approval-ago]]:font-normal [&_[data-slot=approval-ago]]:text-muted-foreground",
)
</script>

<template>
  <parts.Summary v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <AnswerMark :status="state.status" />
        <span>{{ state.status === "approved" ? "Approved" : "Denied" }}</span>
        <ApprovalAgo v-if="state.resolvedAt !== undefined" :at="state.resolvedAt" />
      </slot>
    </template>
  </parts.Summary>
</template>
