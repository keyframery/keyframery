<script setup lang="ts">
// Variants

import { Badge } from "@/components/keyframery/badge"
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="success">Paid</Badge>
    <Badge variant="destructive">Overdue</Badge>
  </div>
</template>
