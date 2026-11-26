<script setup lang="ts">
/* One row of content. Render it as a link or a button with the `render` slot:
   <Item #render="{ props, children }"><button type="button" v-bind="props"><component :is="children" /></button></Item> */
import { computed, onMounted, ref, useAttrs, useSlots } from "vue"

import type { ItemSize, ItemVariant } from "@/components/keyframery/core/item-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { itemClass, ItemRoot } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ variant?: ItemVariant; size?: ItemSize; speed?: Speed }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
/* The core reads, when the row binds, whether it sits in an ItemGroup (closest() from its parent) to give it
   the listitem role. Vue binds a part before its ancestors are in the page, so a row wrapped in another element
   would miss its group: it joins once mounted (React's refs attach after the whole tree is in). */
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <ItemRoot v-if="mounted" v-bind="forwarded" :variant="variant" :size="size" :style="[speedStyle, attrs.style as any]" :class="cn(itemClass, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </ItemRoot>
</template>

<style>
/* kf-item: the keyframes this part animates with (React's <style href="kf-item">), shipped with the component. */
@keyframes kf-item-in{from{opacity:0;translate:0 10px;filter:blur(5px)}}@keyframes kf-item-image{from{opacity:0;scale:1.12;filter:blur(8px)}}@keyframes kf-item-line{from{scale:0 1}}
</style>
