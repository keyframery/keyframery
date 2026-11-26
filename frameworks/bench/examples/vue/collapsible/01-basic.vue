<script setup lang="ts">
// Basic
// The panel opens to its real height. The trigger's text can follow the state.

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/keyframery/collapsible"
</script>

<template>
  <Collapsible class="w-full max-w-[360px]">
    <CollapsibleTrigger v-slot="{ state }">{{ state.open ? 'Hide order details' : 'Show order details' }}</CollapsibleTrigger>
    <CollapsiblePanel>
      <dl class="grid grid-cols-2 gap-y-1.5 pt-2 text-[13px]">
        <dt class="text-muted-foreground">Order</dt>
        <dd>#40213</dd>
        <dt class="text-muted-foreground">Placed</dt>
        <dd>3 June</dd>
        <dt class="text-muted-foreground">Total</dt>
        <dd>£86.40</dd>
      </dl>
    </CollapsiblePanel>
  </Collapsible>
</template>
