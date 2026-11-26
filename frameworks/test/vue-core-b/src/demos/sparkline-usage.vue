<script setup lang="ts">
import { Sparkline } from "@/components/keyframery/sparkline"
</script>

<template>
  <div data-demo="sparkline-usage" class="w-full max-w-[240px]">
    <Sparkline :data="[12, 14, 13, 18, 21, 19, 24]" label="Revenue" period="last 7 days" />
  </div>
</template>
