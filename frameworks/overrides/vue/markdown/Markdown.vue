<script setup lang="ts">
/* Streaming markdown: the answer's text, drawn block by block. Pass the string as `content` (or as
   plain text in the default slot); set `streaming` while it is still arriving.
   - Steady: every block is drawn from its own source and kept as it is while later text arrives, so
     finished blocks never re-render or move; only the last block grows.
   - Rise: a new block fades up out of a soft blur as it arrives (scales with --kf-flourish).
   - Caret: while `streaming`, a slim caret sits at the end of the text and pulses softly. */
import { computed, type Slots, useAttrs, useSlots, type VNode } from "vue"

import { type MarkdownBlock, parseMarkdown } from "@/components/keyframery/core/markdown-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import MarkdownBlockView from "./MarkdownBlock.vue"
import MarkdownCaret from "./MarkdownCaret.vue"
import MarkdownCodeBlock from "./MarkdownCodeBlock.vue"
import { keepFinished, look, type MarkdownComponents, parts, rootMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** The markdown. Plain text in the default slot works too; `content` wins when both are given. */
    content?: string | null
    /** True while the text is still arriving: its end reads as unfinished, and the caret shows. */
    streaming?: boolean
    /** Show the caret while streaming. Default true. */
    caret?: boolean
    /** Your own elements, by tag name, and `codeBlock` for fenced code. Keep the object stable. */
    components?: MarkdownComponents
    speed?: Speed
  }>(),
  { content: undefined, streaming: false, caret: true, components: undefined },
)
const slots: Slots = useSlots()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)

const text = (nodes: VNode[] | undefined): string =>
  (nodes ?? []).map((node) => (typeof node.children === "string" ? node.children : Array.isArray(node.children) ? text(node.children as VNode[]) : "")).join("")
/* Parsed during render (slot text is not reactive outside it), keeping every finished block's object. */
let previous: MarkdownBlock[] = []
let parsed: { source: string; streaming: boolean } | undefined
function parse(): MarkdownBlock[] {
  const source = props.content ?? text(slots.default?.()) ?? ""
  if (parsed && parsed.source === source && parsed.streaming === props.streaming) return previous
  parsed = { source, streaming: props.streaming }
  previous = keepFinished(parseMarkdown(source, { streaming: props.streaming }), previous)
  return previous
}
const ctx = computed(() => ({ components: props.components ? { codeBlock: MarkdownCodeBlock, ...props.components } : { codeBlock: MarkdownCodeBlock } }))
const mark = computed(() => props.streaming && props.caret)
</script>

<template>
  <parts.Root v-bind="forwarded" :streaming="streaming" :style="[speedStyle, attrs.style as any]" :class="cn(rootMotion, look, attrs.class as any)">
    <template v-for="blocks in [parse()]" :key="0">
      <MarkdownBlockView v-for="(block, i) in blocks" :key="i" :block="block" :ctx="ctx" :caret="mark && i === blocks.length - 1" />
      <p v-if="mark && !blocks.length" data-slot="markdown-paragraph"><MarkdownCaret /></p>
    </template>
  </parts.Root>
</template>

<style>
/* kf-markdown: the keyframes this part animates with (React's <style href="kf-markdown">), shipped with the component. */
@keyframes kf-markdown-rise{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}@keyframes kf-markdown-caret{50%{opacity:0.2}}
</style>
