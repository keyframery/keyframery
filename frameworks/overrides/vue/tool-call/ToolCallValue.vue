<script setup lang="ts">
/* A value as a small code block: objects as pretty JSON, strings as they are. */
import { computed } from "vue"

import { CodeBlock, CodeBlockContent } from "@/components/keyframery/code-block"
import { serialize } from "@/components/keyframery/core/tool-call-core"
import { cn } from "@/lib/utils"

const props = defineProps<{ value: unknown; class?: string }>()
const code = computed(() => serialize(props.value))
</script>

<template>
  <CodeBlock
    :code="code"
    :language="typeof value === 'string' ? 'text' : 'json'"
    wrap
    size="sm"
    :class="cn('shadow-[0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]', props.class)"
  >
    <CodeBlockContent class="max-h-[var(--tool-call-code-height,220px)]" />
  </CodeBlock>
</template>
