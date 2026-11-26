<script setup lang="ts">
/* A line's text, cut into coloured tokens; changed words carry `data-changed`. Internal to the rows. */
import { computed } from "vue"

import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import { type DiffLine, segmentsOf } from "@/components/keyframery/core/diff-viewer-core"

const props = defineProps<{ line: DiffLine; language: CodeBlockLanguage; words: boolean }>()
const spoken = { added: "Added: ", removed: "Removed: ", context: "" } as const
const segments = computed(() => segmentsOf(props.line, props.language, props.words))
const blank = computed(() => segments.value.length === 0 || (segments.value.length === 1 && segments.value[0]?.text === ""))
</script>

<template>
  <span data-slot="diff-viewer-line-content"><span v-if="spoken[props.line.kind]" class="sr-only">{{ spoken[props.line.kind] }}</span><template v-if="blank">{{ "​" }}</template><span v-for="(segment, i) in segments" v-else :key="i" :data-token="segment.kind" :data-changed="segment.changed ? '' : undefined">{{ segment.text }}</span></span>
</template>
