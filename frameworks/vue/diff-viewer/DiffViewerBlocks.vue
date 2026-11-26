<script setup lang="ts">
/* Every block of the diff: folds, opened folds, hunk headers (fold, range, review) and hunks. */
import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import type { DiffBlock, DiffView } from "@/components/keyframery/core/diff-viewer-core"

import DiffViewerAccept from "./DiffViewerAccept.vue"
import DiffViewerExpanded from "./DiffViewerExpanded.vue"
import DiffViewerFold from "./DiffViewerFold.vue"
import DiffViewerGap from "./DiffViewerGap.vue"
import DiffViewerHunk from "./DiffViewerHunk.vue"
import DiffViewerHunkHeader from "./DiffViewerHunkHeader.vue"
import DiffViewerLines from "./DiffViewerLines.vue"
import DiffViewerReject from "./DiffViewerReject.vue"
import DiffViewerStatus from "./DiffViewerStatus.vue"
import DiffViewerUndo from "./DiffViewerUndo.vue"

const props = defineProps<{ blocks: DiffBlock[]; view: DiffView; expanded: string[]; review: boolean; language: CodeBlockLanguage; words: boolean }>()
const open = (block: DiffBlock) => !!block.gap && props.expanded.includes(block.gap.key)
const keyOf = (block: DiffBlock) => (block.type === "gap" ? block.gap.key : String(block.hunk.index))
</script>

<template>
  <template v-for="block in props.blocks" :key="keyOf(block)">
    <DiffViewerExpanded v-if="block.gap && open(block) && block.gap.lines" :key="`${block.gap.key}-open`" :value="block.gap.key">
      <DiffViewerLines :lines="block.gap.lines" :view="props.view" :language="props.language" :words="props.words" />
    </DiffViewerExpanded>
    <template v-if="block.type === 'gap'">
      <DiffViewerGap v-if="!(open(block) && block.gap.lines)" :value="block.gap.key">
        <DiffViewerFold :value="block.gap.key" />
      </DiffViewerGap>
    </template>
    <template v-else>
      <DiffViewerHunkHeader v-if="(block.gap && !open(block)) || props.review" :value="String(block.hunk.index)">
        <DiffViewerFold v-if="block.gap && !open(block)" :value="block.gap.key" />
        <span data-slot="diff-viewer-range">{{ block.hunk.range }}<span v-if="block.hunk.section" data-slot="diff-viewer-section">{{ " " + block.hunk.section }}</span></span>
        <span v-if="props.review" data-slot="diff-viewer-review">
          <DiffViewerReject :value="String(block.hunk.index)" />
          <DiffViewerAccept :value="String(block.hunk.index)" />
          <DiffViewerStatus :value="String(block.hunk.index)" />
          <DiffViewerUndo :value="String(block.hunk.index)" />
        </span>
      </DiffViewerHunkHeader>
      <DiffViewerHunk :value="String(block.hunk.index)">
        <DiffViewerLines :lines="block.hunk.lines" :view="props.view" :language="props.language" :words="props.words" />
      </DiffViewerHunk>
    </template>
  </template>
</template>
