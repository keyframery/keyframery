<script setup lang="ts">
/* The text field: UI SDK's trigger menu input (so @ and / open suggestions at the caret) rendered as
   UI SDK's textarea (so it grows with its text and an agent can read and set it). `v-model:value`. */
import { computed, useAttrs } from "vue"
import { Textarea } from "@ui-sdk/vue/textarea"
import { TriggerMenuInput } from "@ui-sdk/vue/trigger-menu"

import { cn } from "@/lib/utils"
import { inputMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ value?: string; defaultValue?: string; autoResize?: boolean; controller?: unknown }>(),
  { autoResize: true },
)
const emit = defineEmits<{ valueChange: [value: string, details: unknown]; "update:value": [value: string] }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
function onValueChange(value: string, details: unknown) {
  emit("valueChange", value, details)
  emit("update:value", value)
}
</script>

<template>
  <TriggerMenuInput v-bind="forwarded" data-slot="prompt-composer-input" :class="cn(inputMotion, attrs.class as any)">
    <template #render="{ props: inputProps }">
      <Textarea
        v-bind="inputProps"
        :auto-resize="props.autoResize"
        :value="props.value"
        :default-value="props.defaultValue"
        :controller="props.controller as any"
        @value-change="onValueChange"
      />
    </template>
  </TriggerMenuInput>
</template>
