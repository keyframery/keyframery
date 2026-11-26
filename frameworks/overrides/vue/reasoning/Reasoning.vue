<script setup lang="ts">
/* Reasoning: the "thinking" a model did before it answered, behind a disclosure. It opens on its own
   while `streaming`, closes when the thinking ends (`autoClose`), unless the reader toggled it in the
   meantime; a reader's toggle wins until the next stream. Controlled with `open` / `v-model:open`:
   streaming starting and ending still asks for a change through `openChange`. */
import { computed, provide, ref, useAttrs, watch } from "vue"
import { Collapsible, type CollapsibleOpenChangeReason } from "@ui-sdk/vue/collapsible"
import type { ChangeDetails } from "@ui-sdk/core"

import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { parts, ReasoningContext, rootClass } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** True while the model is still thinking: the trigger shimmers and the thinking shows. */
    streaming?: boolean
    /** How long it thought, in seconds. Without it, the time between `streaming` turning on and off. */
    duration?: number
    /** Close on its own when the thinking ends, unless the reader toggled it. Default true. */
    autoClose?: boolean
    /** Open at first, when not streaming. */
    defaultOpen?: boolean
    /** Controlled open state. */
    open?: boolean
    speed?: Speed
  }>(),
  { streaming: false, duration: undefined, autoClose: true, defaultOpen: false, open: undefined },
)
const emit = defineEmits<{
  /** The new open state, from the reader or from streaming starting and ending (no details then). */
  openChange: [open: boolean, details?: ChangeDetails<CollapsibleOpenChangeReason>]
  "update:open": [open: boolean]
}>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)

const auto = ref(props.streaming || props.defaultOpen)
const chosen = ref<boolean | undefined>(undefined)
/* React decides this during render; a sync watcher lands it in the same tick. */
watch(
  () => props.streaming,
  (streaming) => {
    if (streaming) {
      chosen.value = undefined
      auto.value = true
    } else if (props.autoClose && chosen.value === undefined) auto.value = false
  },
  { flush: "sync" },
)
/* A controlled owner hears about the automatic changes too. */
watch(auto, (value) => {
  emit("openChange", value)
  emit("update:open", value)
})
const open = computed(() => props.open ?? chosen.value ?? auto.value)
function onOpenChange(next: boolean, details: ChangeDetails<CollapsibleOpenChangeReason>) {
  chosen.value = next
  emit("openChange", next, details)
  emit("update:open", next)
}
provide(ReasoningContext, computed(() => ({ streaming: props.streaming })))
</script>

<template>
  <parts.Root v-bind="forwarded" :streaming="streaming" :duration="duration" :style="[speedStyle, attrs.style as any]" :class="cn(rootClass, attrs.class as any)">
    <Collapsible :open="open" @open-change="onOpenChange"><slot /></Collapsible>
  </parts.Root>
</template>

<style>
/* kf-reasoning: the keyframes this part animates with (React's <style href="kf-reasoning">), shipped with the component. */
@keyframes kf-reasoning-shimmer{from{background-position:100% 0}to{background-position:0% 0}}
</style>
