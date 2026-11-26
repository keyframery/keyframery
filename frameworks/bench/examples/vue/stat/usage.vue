<script setup lang="ts">
import { Stat } from "@/components/keyframery/stat"
</script>

<template>
  <Stat
    label="Revenue"
    :value="48210"
    :format-value="(v) => `$${v.toLocaleString('en-US')}`"
    :delta="0.124"
  />
</template>
