<script setup lang="ts">
/* UI SDK's Separator, drawn out from its centre as it arrives, in step with the rows around it. */
import { computed, useAttrs } from "vue"
import { Separator as SeparatorPart } from "@ui-sdk/vue/separator"

import { cn } from "@/lib/utils"
import { itemSeparatorClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <SeparatorPart v-bind="forwarded" orientation="horizontal" :class="cn(itemSeparatorClass, attrs.class as any)" />
</template>
