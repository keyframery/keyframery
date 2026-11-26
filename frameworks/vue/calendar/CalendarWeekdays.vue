<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { CalendarWeekdays as Part } from "@ui-sdk/vue/calendar"
import CalendarWeekday from "./CalendarWeekday.vue"

const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
</script>

<template>
  <Part v-bind="attrs">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <CalendarWeekday :index="s.index" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
