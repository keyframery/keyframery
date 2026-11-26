<script setup lang="ts">
/* The row of files above the text. It opens to its height when the first file arrives and closes
   as the last one leaves, so the text below moves instead of jumping. Put the files inside. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { attachmentsMotion, PromptComposerAttachmentsPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <PromptComposerAttachmentsPart v-bind="forwarded" :class="cn(attachmentsMotion, attrs.class as any)">
    <template #default="scope">
      <div class="min-h-0 overflow-hidden"><slot v-bind="scope" /></div>
    </template>
  </PromptComposerAttachmentsPart>
</template>
