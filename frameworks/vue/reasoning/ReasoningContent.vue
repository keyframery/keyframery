<script setup lang="ts">
/* The thinking: opens to its real height and its content rises in. Plain text in the default slot is
   rendered as Keyframery's streaming markdown (it streams with the reasoning's `streaming`); other
   content renders as it is. While it streams, the newest line stays in view. */
import { Comment, computed, inject, onUpdated, ref, Text, useAttrs, useSlots, type VNode } from "vue"
import { CollapsiblePanel } from "@ui-sdk/vue/collapsible"

import { Markdown } from "@/components/keyframery/markdown"
import { cn } from "@/lib/utils"
import { contentClass, markdownClass, ReasoningContext } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const context = inject(ReasoningContext, computed(() => ({ streaming: false })))
const streaming = computed(() => context.value.streaming)

/* The slot as a string when it holds only text, like React's `typeof children === "string"`. */
function textOf(nodes: VNode[] | undefined): string | undefined {
  if (!nodes) return undefined
  let text = ""
  for (const node of nodes) {
    if (node.type === Comment) continue
    if (node.type !== Text || typeof node.children !== "string") return undefined
    text += node.children
  }
  return text
}

const scroller = ref<HTMLDivElement>()
const follow = () => {
  const el = scroller.value
  if (el && streaming.value) el.scrollTop = el.scrollHeight
}
onUpdated(follow)
</script>

<template>
  <CollapsiblePanel v-bind="forwarded" :class="cn(contentClass, attrs.class as any)">
    <div ref="scroller" data-slot="reasoning-scroll">
      <template v-for="text in [textOf(slots.default?.())]" :key="0">
        <Markdown v-if="text !== undefined" :content="text" :streaming="streaming" :caret="false" :class="markdownClass" @vue:updated="follow" />
        <slot v-else />
      </template>
    </div>
  </CollapsiblePanel>
</template>
