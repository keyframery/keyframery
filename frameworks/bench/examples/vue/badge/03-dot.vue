<script setup lang="ts">
// Status dot
// `dot` adds a coloured dot before the label, for a status.

import { Badge } from "@/components/keyframery/badge"
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Badge dot variant="success">Online</Badge>
    <Badge dot variant="destructive">Delayed</Badge>
    <Badge dot variant="outline">Draft</Badge>
  </div>
</template>
