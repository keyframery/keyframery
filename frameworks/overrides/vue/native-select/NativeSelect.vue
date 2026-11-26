<script setup lang="ts">
/* The whole field: wrapper, select, label and chevron. Attributes for the <select> (`name`, `id`,
   `aria-label`, `required`, `class`) go to the select; the options go in the default slot; the
   `icon` slot replaces the chevron. `v-model` / `v-model:value` bind the value. */
import { computed, useAttrs } from "vue"

import type { NativeSelectValueChangeReason } from "@/components/keyframery/core/native-select-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import NativeSelectControl from "./NativeSelectControl.vue"
import NativeSelectIcon from "./NativeSelectIcon.vue"
import NativeSelectValue from "./NativeSelectValue.vue"
import NativeSelectRoot from "./NativeSelectRoot.vue"
import { field, iconLook, rootMotion, valueLook, wrapperLook } from "./parts"
import type { ChangeDetails } from "@ui-sdk/core"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    value?: string
    modelValue?: string
    defaultValue?: string
    size?: "sm" | "default"
    disabled?: boolean
    invalid?: boolean
    speed?: Speed
    /** Class names for the wrapper that holds the select, its label and the chevron. */
    wrapperClassName?: string
    /** Class names for the label drawn over the select. */
    valueClassName?: string
    /** Class names for the chevron. */
    iconClassName?: string
  }>(),
  { disabled: undefined, invalid: undefined },
)
const emit = defineEmits<{
  valueChange: [value: string, details: ChangeDetails<NativeSelectValueChangeReason>]
  "update:value": [value: string]
  "update:modelValue": [value: string]
}>()
defineSlots<{ default?: () => unknown; icon?: () => unknown }>()
const attrs = useAttrs()
const speedStyle = useSpeed(() => props.speed)
const controlAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
function onValueChange(value: string, details: ChangeDetails<NativeSelectValueChangeReason>) {
  emit("valueChange", value, details)
}
</script>

<template>
  <NativeSelectRoot
    :value="value ?? modelValue"
    :default-value="defaultValue"
    :size="size"
    :disabled="disabled"
    :invalid="invalid"
    :style="speedStyle"
    :class="cn(rootMotion, wrapperLook, wrapperClassName)"
    @value-change="onValueChange"
    @update:value="(v: string) => { emit('update:value', v); emit('update:modelValue', v) }"
  >
    <NativeSelectControl v-bind="controlAttrs" :class="cn(field, attrs.class as any)"><slot /></NativeSelectControl>
    <NativeSelectValue :class="cn(valueLook, valueClassName)" />
    <NativeSelectIcon :class="cn(iconLook, iconClassName)">
      <template #default="{ state }">
        <slot name="icon">
          <span
            :key="state.changes"
            :class="
              cn(
                'grid place-items-center',
                state.changes > 0 &&
                  'animate-[kf-native-select-dip_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)] motion-reduce:animate-none',
              )
            "
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
            </svg>
          </span>
        </slot>
      </template>
    </NativeSelectIcon>
  </NativeSelectRoot>
</template>

<style>
/* kf-native-select: the keyframes this part animates with (React's <style href="kf-native-select">), shipped with the component. */
@keyframes kf-native-select-in{from{opacity:0;translate:0 .75em;filter:blur(3px)}}@keyframes kf-native-select-out{to{opacity:0;translate:0 -.75em;filter:blur(3px)}}@keyframes kf-native-select-dip{40%{translate:0 3px}}
</style>
