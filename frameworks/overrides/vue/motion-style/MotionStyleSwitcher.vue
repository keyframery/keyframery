<script setup lang="ts">
/* The motion style switcher: a segmented control whose key stretches between the styles. It applies the
   choice to <html> itself, so dropping it anywhere is enough. Built on the preferences switcher; its theme
   variables are aliased here under motion-style names. */
import { useAttrs } from "vue"
import { MotionStyleSwitcher as MotionStyleSwitcherPart } from "@/components/keyframery/preferences"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const theme = {
  "--preferences-track": "var(--motion-style-track,var(--muted))",
  "--preferences-key": "var(--motion-style-key,var(--kf-preferences-key))",
  "--preferences-ink": "var(--motion-style-ink,var(--muted-foreground))",
  "--preferences-selected-ink": "var(--motion-style-selected-ink,var(--foreground))",
  "--preferences-height": "var(--motion-style-height,2rem)",
  "--preferences-radius": "var(--motion-style-radius,12px)",
  "--preferences-key-radius": "var(--motion-style-key-radius,9px)",
  "--preferences-gap": "var(--motion-style-gap,0.125rem)",
}
</script>

<template>
  <MotionStyleSwitcherPart v-bind="attrs" :style="[theme, attrs.style as any]" />
</template>
