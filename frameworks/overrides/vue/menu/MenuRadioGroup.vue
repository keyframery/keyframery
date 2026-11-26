<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuRadioGroup as Part } from "@ui-sdk/vue/menu"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots))
</script>

<template>
  <Part v-bind="attrs">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
