<script setup lang="ts">
/* The box: a UI SDK drop zone, so files dropped on it or pasted into the text are attached.
   It leans toward files dragged over it. */
import { computed, useAttrs, useSlots } from "vue"
import { FileInputDropzone } from "@ui-sdk/vue/file-input"

import { cn } from "@/lib/utils"
import { dropzoneMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
</script>

<template>
  <FileInputDropzone data-composer-part="box" v-bind="forwarded" :class="cn(dropzoneMotion, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </FileInputDropzone>
</template>
