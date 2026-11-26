<script setup lang="ts">
/* A tool call: one call an agent made, as a card. With no content it renders the whole card from its
   props; pass parts to compose your own. */
import { computed, useAttrs } from "vue"

import type { ToolCallStatus } from "@/components/keyframery/core/tool-call-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import ToolCallCard from "./ToolCallCard.vue"
import { ToolCallRoot, toolCallClass } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** The tool's name, like `"search_orders"`. */
    name?: string
    /** A short human title, like "Looking up order #1048". It names the card. */
    title?: string
    /** Where the call is. @defaultValue "done" */
    status?: ToolCallStatus
    /** The call's arguments. Any value: objects are shown as pretty JSON. */
    input?: unknown
    /** What the tool returned. */
    output?: unknown
    /** Why it failed, with `status="error"`. */
    error?: string
    /** How long it took, in milliseconds. */
    duration?: number
    /** Whether the body is open. Set it (or `v-model:open`) to control the card yourself. */
    open?: boolean
    /** Whether the body starts open, when you don't control it. A failed call starts open. */
    defaultOpen?: boolean
    /** Open the body on its own when the call fails. @defaultValue true */
    openOnError?: boolean
    /** When the call started (epoch ms): a running call shows the time since. */
    startedAt?: number
    speed?: Speed
  }>(),
  { open: undefined, defaultOpen: undefined, openOnError: undefined },
)
const emit = defineEmits<{ openChange: [open: boolean, details: unknown]; "update:open": [open: boolean] }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
</script>

<template>
    <ToolCallRoot
      v-bind="forwarded"
      :name="name"
      :title="title"
      :status="status"
      :input="input"
      :output="output"
      :error="error"
      :duration="duration"
      :open="open"
      :default-open="defaultOpen"
      :open-on-error="openOnError"
      :style="[speedStyle, attrs.style as any]"
      :class="cn(toolCallClass, attrs.class as any)"
      @open-change="(open: boolean, details: unknown) => emit('openChange', open, details)"
      @update:open="(open: boolean) => emit('update:open', open)"
    >
      <template #default="scope">
        <slot v-bind="scope">
          <ToolCallCard
            :name="props.name"
            :title="props.title"
            :status="props.status"
            :input="props.input"
            :output="props.output"
            :error="props.error"
            :duration="props.duration"
            :started-at="props.startedAt"
          />
        </slot>
      </template>
    </ToolCallRoot>
</template>

<style>
/* kf-tool-call: the keyframes this part animates with (React's <style href="kf-tool-call">), shipped with the component. */
@keyframes kf-tool-call-in{from{opacity:0;translate:0 calc(8px*var(--kf-flourish,1));filter:blur(calc(4px*var(--kf-flourish,1)))}}@keyframes kf-tool-call-shimmer{from{background-position:100% 0}to{background-position:0% 0}}@keyframes kf-tool-call-tick{from{stroke-dashoffset:1}}@keyframes kf-tool-call-pop{from{scale:calc(1 - 0.6*var(--kf-flourish,1));opacity:0}}@keyframes kf-tool-call-label{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}
</style>
