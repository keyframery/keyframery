<script setup lang="ts">
// Disabled and invalid
// `disabled` dims it. `aria-invalid` marks an error, in red.

import { Input } from "@/components/keyframery/input"
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-3">
    <Input disabled default-value="Locked after payment" aria-label="Reference" />
    <Input aria-invalid="true" default-value="maya@" aria-label="Email" />
  </div>
</template>
