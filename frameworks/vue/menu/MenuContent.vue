<script setup lang="ts">
/* The menu's sheet: unfolds from the trigger on a spring, its rows cascade in, and one highlight glides
   from row to row. Without content it renders the root's `items`. */
import { computed, useAttrs, useSlots } from "vue"
import { useMenuPart } from "./context"
import MenuSheet from "./MenuSheet.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots))
useMenuPart("content")
</script>

<template>
  <MenuSheet v-bind="attrs">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </MenuSheet>
</template>
