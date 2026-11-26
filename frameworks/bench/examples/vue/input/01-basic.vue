<script setup lang="ts">
// Basic
// Any native input type. Pair it with a `label`, or use it inside a [Field](/docs/components/field).

import { Input } from "@/components/keyframery/input"
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-3">
    <label class="flex flex-col gap-1.5 text-[13px] font-medium">
      Email<Input type="email" placeholder="you@example.com" />
    </label>
    <label class="flex flex-col gap-1.5 text-[13px] font-medium">Password<Input type="password" /></label>
  </div>
</template>
