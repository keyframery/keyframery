<script setup lang="ts">
/* One action in the bulk bar: an `#icon` slot and a `label` (the label folds away on a narrow container and stays
   for screen readers). `tone="destructive"` for one that removes. A default slot replaces both. */
import { computed, useAttrs } from "vue"

import { ToolbarButton } from "@/components/keyframery/toolbar"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ tone?: "destructive"; label?: string }>(), { tone: undefined, label: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ToolbarButton
    :title="props.label"
    v-bind="forwarded"
    :class="
      cn(
        'px-2 text-foreground not-data-disabled:hover:text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground',
        props.tone === 'destructive' && 'text-destructive not-data-disabled:hover:text-destructive data-kf-toolbar-hl:text-destructive [&_svg]:text-destructive',
        typeof attrs.class === 'string' ? attrs.class : undefined,
      )
    "
  >
    <slot>
      <slot name="icon" />
      <span class="@max-[34rem]/data-table:sr-only">{{ props.label }}</span>
    </slot>
  </ToolbarButton>
</template>
