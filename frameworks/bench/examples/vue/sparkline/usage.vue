<script setup lang="ts">
import { Sparkline } from "@/components/keyframery/sparkline"
</script>

<template>
  <Sparkline :data="[12, 14, 13, 18, 21, 19, 24]" label="Revenue" period="last 7 days" />
</template>
