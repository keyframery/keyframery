<script setup lang="ts">
// Controlled
// Pass `checked` and `onCheckedChange` to drive something else with it.

import { ref } from "vue"

import { Switch } from "@/components/keyframery/switch"

const on = ref(false)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <label class="flex items-center gap-3 text-[13px] font-medium">
      <Switch v-model:checked="on" />Focus mode
    </label>
    <span class="text-[12px] text-muted-foreground">{{ on ? 'Notifications are paused.' : `You'll get notifications.` }}</span>
  </div>
</template>
