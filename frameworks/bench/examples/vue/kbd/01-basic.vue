<script setup lang="ts">
// Keys and combinations
// `KbdCombo` takes key names: `mod` shows ⌘ on a Mac and Ctrl elsewhere.

import { Kbd, KbdCombo } from "@/components/keyframery/kbd"
</script>

<template>
  <div class="flex flex-col items-start gap-3 text-[13px]">
    <span class="flex items-center gap-2">
      Close <Kbd>Esc</Kbd>
    </span>
    <span class="flex items-center gap-2">Search <KbdCombo :keys="['mod', 'k']" /></span>
    <span class="flex items-center gap-2">Command palette <KbdCombo :keys="['mod', 'shift', 'p']" /></span>
  </div>
</template>
