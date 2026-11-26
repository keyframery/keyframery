<script setup lang="ts">
// Controlled
// Pass `open` and `onOpenChange` to open it from elsewhere.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/keyframery/collapsible"

const open = ref(false)
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col items-start gap-3">
    <Button size="sm" @click="open = !open">{{ open ? 'Close' : 'Open' }} from outside</Button>
    <Collapsible v-model:open="open" class="w-full">
      <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
      <CollapsiblePanel>
        <p class="pt-2 text-[13px] text-muted-foreground">Proxy, cache size and logging live here.</p>
      </CollapsiblePanel>
    </Collapsible>
  </div>
</template>
