<script setup lang="ts">
/* Applies the motion style: mount it once (global), or around the content a scoped one styles. */
import { Preferences } from "@ui-sdk/vue/preferences"
import { motionStyle, type MotionStylePreference } from "./motion-style"

const props = withDefaults(defineProps<{ preference?: MotionStylePreference; nonce?: string }>(), { preference: () => motionStyle })
</script>

<template>
  <Preferences :preferences="[props.preference]" :nonce="props.nonce">
    <slot />
  </Preferences>
</template>
