<script setup lang="ts">
// Pressed with the keyboard
// `listen` sinks the keys while someone presses them for real. Try ⌘K or Ctrl+K.

import { KbdCombo } from "@/components/keyframery/kbd"
</script>

<template>
  <span class="flex items-center gap-2 text-[13px]">Press <KbdCombo :keys="['mod', 'k']" listen /></span>
</template>
