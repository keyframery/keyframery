<script setup lang="ts">
/* The search field at the top of the list: a magnifier and bare text over a hairline. It takes focus
   when the list opens and is named "Search <label>". */
import { ComboboxInput } from "@ui-sdk/vue/combobox"
import { computed, nextTick, onMounted, ref, shallowRef, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { useFilter } from "./primitive"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ autoFocus?: boolean }>(), { autoFocus: true })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const { handle } = useFilter("FilterInput")
const label = computed(() => (attrs["aria-label"] as string | undefined) ?? `Search ${handle.state.label}`)
/* Like React's autoFocus: focus on mount, without an autofocus attribute in the page. */
const input = shallowRef<{ $el?: HTMLElement } | null>(null)
/* UI SDK's combobox input checks, when it binds, whether it sits in the popup (el.closest on the content):
   Vue binds it before the popup around it is in the page, so it would take the trigger out of the tab
   order as if it were inline. It joins once the popup is mounted, as React's refs attach. */
const ready = ref(false)
onMounted(async () => {
  ready.value = true
  await nextTick()
  if (props.autoFocus) input.value?.$el?.focus?.()
})
const base = "h-full min-w-0 flex-1 bg-transparent text-[13px] text-[color:var(--filter-ink,var(--foreground))] outline-none placeholder:text-muted-foreground"
</script>

<template>
  <div data-slot="filter-search" class="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 text-muted-foreground">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search" aria-hidden="true"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
    <ComboboxInput v-if="ready" ref="input" :aria-label="label" v-bind="forwarded" :class="cn(base, attrs.class as any)" />
  </div>
</template>
