<script setup lang="ts">
import { Kbd, KbdCombo } from "@/components/keyframery/kbd"
</script>

<template>
  <Kbd>Esc</Kbd>
  <KbdCombo :keys="['mod', 'k']" />
</template>
