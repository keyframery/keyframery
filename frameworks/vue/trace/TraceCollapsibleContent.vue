<script setup lang="ts">
/* The detail hangs off a hairline under the line's icon. Its children rise in one after another, so
   pass rows or blocks straight inside. */
import { computed, useAttrs } from "vue"

import { CollapsiblePanel } from "@/components/keyframery/collapsible"
import { cn } from "@/lib/utils"
import { traceContentClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <CollapsiblePanel v-bind="forwarded" :class="cn(traceContentClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </CollapsiblePanel>
</template>
