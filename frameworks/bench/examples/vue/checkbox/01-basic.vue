<script setup lang="ts">
// Basic
// Wrap it in a `label` so the text toggles it too.

import { Checkbox } from "@/components/keyframery/checkbox"
</script>

<template>
  <div class="flex flex-col gap-3 text-[13px]">
    <label class="flex items-center gap-2.5"><Checkbox default-checked />Email me about replies</label>
    <label class="flex items-center gap-2.5"><Checkbox />Email me about new followers</label>
    <label class="flex items-center gap-2.5 text-muted-foreground">
      <Checkbox disabled />Weekly digest (paused)
    </label>
  </div>
</template>
