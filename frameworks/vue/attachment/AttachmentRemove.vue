<script setup lang="ts">
/* The remove action: the attachment leaves, then calls its onRemove. An x unless you give it content. */
import { useAttrs } from "vue"

import AttachmentAction from "./AttachmentAction.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <AttachmentAction data-action="remove" aria-label="Remove" v-bind="attrs">
    <slot>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m4.5 4.5 7 7m0-7-7 7" />
      </svg>
    </slot>
  </AttachmentAction>
</template>
