<script setup lang="ts">
// Loading at its own size
// While `loading`, each part keeps its geometry as a soft block; when it ends the numbers fade back in, one part after another.

import { ref } from "vue"

import { Switch } from "@/components/keyframery/switch"
import { Stat, StatComparison, StatDelta, StatLabel, StatValue } from "@/components/keyframery/stat"

const loading = ref(true)
</script>

<template>
  <div class="grid w-full max-w-[280px] gap-4">
    <label class="flex items-center gap-2 text-[13px]"><Switch v-model:checked="loading" />Loading</label>
    <Stat
      label="Orders"
      :value="1839"
      :format-value="(v) => v.toLocaleString('en-US')"
      :delta="0.031"
      :loading="loading"
    >
      <StatLabel />
      <StatValue />
      <StatDelta />
      <StatComparison>vs previous 30 days</StatComparison>
    </Stat>
  </div>
</template>
