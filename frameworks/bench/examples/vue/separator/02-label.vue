<script setup lang="ts">
// With a label
// Put a `SeparatorLabel` between two separators for an “or” line.

import { Button } from "@/components/keyframery/button"
import { Separator, SeparatorLabel } from "@/components/keyframery/separator"
</script>

<template>
  <div class="flex w-full max-w-[280px] flex-col gap-3">
    <Button variant="primary">Continue with Google</Button>
    <div class="flex items-center">
      <Separator decorative />
      <SeparatorLabel>or</SeparatorLabel>
      <Separator decorative />
    </div>
    <Button>Continue with email</Button>
  </div>
</template>
