<script setup lang="ts">
// One value at a time
// With `multiple={false}` choosing a value replaces the last one and closes the list. The value is still a list, of one.

import { Filter } from "@/components/keyframery/filter"
</script>

<template>
  <Filter
    label="Plan"
    :multiple="false"
    hide-search
    :options="[
        { value: 'free', label: 'Free', count: 1204 },
        { value: 'pro', label: 'Pro', count: 318 },
        { value: 'team', label: 'Team', count: 46 },
      ]"
  />
</template>
