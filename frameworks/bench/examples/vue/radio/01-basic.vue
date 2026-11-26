<script setup lang="ts">
// Basic
// Arrow keys move the choice within the group. Wrap each radio in a `label`.

import { Radio, RadioGroup } from "@/components/keyframery/radio"
</script>

<template>
  <RadioGroup aria-label="Notifications" default-value="mentions" class="text-[13px]">
    <label class="flex items-center gap-2.5"><Radio value="all" />Everything</label>
    <label class="flex items-center gap-2.5"><Radio value="mentions" />Only mentions</label>
    <label class="flex items-center gap-2.5"><Radio value="none" />Nothing</label>
  </RadioGroup>
</template>
