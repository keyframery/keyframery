<script setup lang="ts">
import { Stat } from "@/components/keyframery/stat"

const formatValue = (v: number) => `$${v.toLocaleString("en-US")}`
</script>

<template>
  <div data-demo="stat-usage" class="w-full max-w-[280px]">
    <Stat label="Revenue" :value="48210" :format-value="formatValue" :delta="0.124" />
  </div>
</template>
