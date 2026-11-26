<script setup lang="ts">
/* One row: a unified line (old number, new number, sign, code) or a split row (two cells). Internal to DiffViewerLines. */
import { computed } from "vue"

import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import type { DiffLine, SplitRow } from "@/components/keyframery/core/diff-viewer-core"

import LineText from "./DiffViewerLineText.vue"

const props = defineProps<{ line?: DiffLine; split?: SplitRow; language: CodeBlockLanguage; words: boolean }>()
const signs = { added: "+", removed: "−", context: " " } as const
const cells = computed(() =>
  props.split
    ? ([
        { side: "old", line: props.split.left, number: props.split.left?.old },
        { side: "new", line: props.split.right, number: props.split.right?.new },
      ] as const)
    : [],
)
</script>

<template>
  <div v-if="props.line" data-slot="diff-viewer-line" :data-kind="props.line.kind">
    <span data-slot="diff-viewer-line-number" data-side="old" aria-hidden="true">{{ props.line.old }}</span>
    <span data-slot="diff-viewer-line-number" data-side="new" aria-hidden="true">{{ props.line.new }}</span>
    <span data-slot="diff-viewer-line-sign" aria-hidden="true">{{ signs[props.line.kind] }}</span>
    <LineText :line="props.line" :language="props.language" :words="props.words" />
  </div>
  <div v-else data-slot="diff-viewer-row">
    <div v-for="cell in cells" :key="cell.side" data-slot="diff-viewer-cell" :data-side="cell.side" :data-kind="cell.line ? cell.line.kind : 'empty'">
      <span data-slot="diff-viewer-line-number" :data-side="cell.side" aria-hidden="true">{{ cell.line ? cell.number : null }}</span>
      <span data-slot="diff-viewer-line-sign" aria-hidden="true">{{ cell.line ? signs[cell.line.kind] : null }}</span>
      <LineText v-if="cell.line" :line="cell.line" :language="props.language" :words="props.words" />
      <span v-else data-slot="diff-viewer-line-content" />
    </div>
  </div>
</template>
