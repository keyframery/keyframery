<script setup lang="ts">
/* The motion style switcher: Subtle (the default), Calm, Springy, Snappy or Playful for every Keyframery
   component. Dropping it anywhere applies the choice to <html> and remembers it. */
import { useAttrs } from "vue"
import PreferenceSwitcher from "./PreferenceSwitcher.vue"
import { motionLabels, motionStyle, type MotionStylePreference, type MotionStyleValue } from "./motion-style"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ preference?: MotionStylePreference; ariaLabel?: string }>(), {
  preference: () => motionStyle,
  ariaLabel: "Motion style",
})
const attrs = useAttrs()
</script>

<template>
  <PreferenceSwitcher v-bind="attrs" :preference="props.preference" :labels="motionLabels as Record<MotionStyleValue, string>" :aria-label="props.ariaLabel" />
</template>
