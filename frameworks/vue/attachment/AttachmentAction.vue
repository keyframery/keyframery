<script setup lang="ts">
/* One action: a Keyframery button, ghost and small unless you say otherwise. On a picture tile it sits on a key so it
   reads over the image. Mark it data-action="remove" to remove the attachment with it, or use AttachmentRemove. */
import { computed, useAttrs } from "vue"

import { Button } from "@/components/keyframery/button"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ variant?: "primary" | "ghost" | "destructive" | "default"; size?: "md" | "sm" | "lg" | "icon-sm" | "icon" | "icon-lg" }>(),
  { variant: undefined, size: "icon-sm" },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "text-[color:var(--attachment-muted,var(--muted-foreground))] hover:text-[color:var(--attachment-ink,var(--foreground))]",
  "group-data-[orientation=vertical]/attachment:bg-background/90 group-data-[orientation=vertical]/attachment:text-[color:var(--attachment-ink,var(--foreground))] group-data-[orientation=vertical]/attachment:backdrop-blur-sm",
  "group-data-[orientation=vertical]/attachment:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.2)]",
  "group-data-[size=xs]/attachment:size-5 group-data-[size=xs]/attachment:rounded-[6px]",
)
</script>

<template>
  <Button data-slot="attachment-action" :variant="props.variant ?? 'ghost'" :size="props.size" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </Button>
</template>
