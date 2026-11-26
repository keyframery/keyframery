<script setup lang="ts">
/* Animated breadcrumb on UI SDK's core (src/components/primitives/breadcrumb.tsx) with the Keyframery look
   (src/components/ui/breadcrumb.tsx): quiet links in the muted colour, the current page in the foreground,
   small chevrons between them.
   - Cascade: on first render the crumbs and separators arrive one after another from the left.
   - Direction: a crumb added later slides in from the right with a blur, right away.
   - Draw: each separator's chevron draws itself as it arrives.
   - A link's underline grows from its start on hover or keyboard focus.
   The cascade, the slide-in and the chevron draw scale with --kf-flourish. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue }>()
const attrs = useAttrs()
const label = computed(() => (attrs["aria-label"] as string | undefined) ?? "Breadcrumb")
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :aria-label="label" v-bind="attrs">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
