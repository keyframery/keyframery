<script setup lang="ts">
/* The risk as a small badge; destructive at high risk. It steps aside (fades and shrinks to nothing)
   once the card is answered, so the answer takes its place. */
import { computed, useAttrs } from "vue"

import { Badge } from "@/components/keyframery/badge"
import type { ApprovalRisk } from "@/components/keyframery/core/approval-core"
import { cn } from "@/lib/utils"

import { parts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const riskWords: Record<ApprovalRisk, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" }
const base = cn(
  "transition-[opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-house group-data-resolved/approval:pointer-events-none group-data-resolved/approval:scale-[calc(1-0.1*var(--kf-flourish,1))] group-data-resolved/approval:opacity-0 motion-reduce:transition-none",
  "inline-flex",
)
</script>

<template>
  <parts.Risk v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <Badge :variant="state.risk === 'high' ? 'destructive' : 'outline'" class="[--badge-ink:var(--approval-accent)]">
        <slot :state="state">{{ riskWords[state.risk as ApprovalRisk] }}</slot>
      </Badge>
    </template>
  </parts.Risk>
</template>
