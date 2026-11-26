<script setup lang="ts">
/* Keyframery's Button, sized for a group: xs (24px) by default, ghost unless you pick a variant. */
import { computed, useAttrs } from "vue"

import { Button } from "@/components/keyframery/button"
import { cn } from "@/lib/utils"

type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ size?: InputGroupButtonSize; variant?: "primary" | "ghost" | "destructive" | "default"; type?: "button" | "submit" | "reset" }>(),
  { size: "xs", variant: "ghost", type: "button" },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const buttonSizes: Record<InputGroupButtonSize, { size: "sm" | "icon-sm"; className: string }> = {
  xs: { size: "sm", className: "h-6 rounded-[7px] px-2 text-[12px]" },
  sm: { size: "sm", className: "" },
  "icon-xs": { size: "icon-sm", className: "size-6 rounded-[7px]" },
  "icon-sm": { size: "icon-sm", className: "" },
}
</script>

<template>
  <Button
    :type="props.type"
    :variant="props.variant"
    :size="buttonSizes[props.size].size"
    :data-size="props.size"
    v-bind="forwarded"
    :class="cn(buttonSizes[props.size].className, attrs.class as any)"
  >
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </Button>
</template>
