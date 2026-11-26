<script setup lang="ts">
import { Filter } from "@/components/keyframery/filter"
</script>

<template>
  <Filter
    label="Status"
    :options="[
        { value: 'paid', label: 'Paid', count: 12 },
        { value: 'pending', label: 'Pending', count: 4 },
      ]"
  />
</template>
