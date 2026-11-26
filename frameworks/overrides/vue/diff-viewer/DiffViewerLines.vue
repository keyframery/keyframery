<script setup lang="ts">
/* The rows of one hunk or fold, in either view. A very long run (a rewritten file) paints its first rows
   at once and the rest a moment later, so the page never stops answering; long runs go in chunks the
   browser skips styling and laying out while they are off screen. */
import { computed, onBeforeUnmount, shallowRef, watch } from "vue"

import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import { type DiffLine, type DiffView, type SplitRow, splitRows } from "@/components/keyframery/core/diff-viewer-core"

import Row from "./DiffViewerRow.vue"

const props = defineProps<{ lines: DiffLine[]; view: DiffView; language: CodeBlockLanguage; words: boolean }>()

const firstPaint = 240
const chunk = 64

const splitCache = new WeakMap<DiffLine[], SplitRow[]>()
function splitOf(lines: DiffLine[]) {
  let rows = splitCache.get(lines)
  if (!rows) splitCache.set(lines, (rows = splitRows(lines)))
  return rows
}

const ready = shallowRef<DiffLine[] | null>(props.lines.length > firstPaint ? null : props.lines)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => [props.lines, ready.value] as const,
  ([all, now]) => {
    if (now === all) return
    clearTimeout(timer)
    timer = setTimeout(() => (ready.value = all))
  },
  { immediate: true },
)
onBeforeUnmount(() => clearTimeout(timer))

const lines = computed(() => (ready.value === props.lines ? props.lines : props.lines.slice(0, firstPaint)))
type Row = { line?: DiffLine; split?: SplitRow }
const rows = computed<Row[]>(() => (props.view === "split" ? splitOf(lines.value).map((split) => ({ split })) : lines.value.map((line) => ({ line }))))
/* Short runs render flat; long ones in chunks of 64. */
const chunks = computed(() => {
  if (rows.value.length <= chunk * 2) return null
  const out: { key: number; rows: Row[] }[] = []
  for (let i = 0; i < rows.value.length; i += chunk) out.push({ key: i, rows: rows.value.slice(i, i + chunk) })
  return out
})
</script>

<template>
  <template v-if="chunks">
    <div v-for="group in chunks" :key="group.key" data-slot="diff-viewer-chunk" class="[content-visibility:auto] [contain-intrinsic-size:auto_calc(64*1.7em)]">
      <Row v-for="(row, i) in group.rows" :key="i" :line="row.line" :split="row.split" :language="props.language" :words="props.words" />
    </div>
  </template>
  <Row v-for="(row, i) in rows" v-else :key="i" :line="row.line" :split="row.split" :language="props.language" :words="props.words" />
</template>
