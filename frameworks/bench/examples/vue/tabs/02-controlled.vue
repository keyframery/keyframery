<script setup lang="ts">
// Controlled
// Pass `value` and `onValueChange`, for example to keep the tab in the URL.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/keyframery/tabs"

const tab = ref("details")
</script>

<template>
  <Tabs v-model:value="tab" class="w-full max-w-[380px]">
    <TabsList aria-label="Checkout">
      <TabsTab value="details">Details</TabsTab>
      <TabsTab value="payment">Payment</TabsTab>
    </TabsList>
    <TabsPanels class="h-[90px] pt-1">
      <TabsPanel value="details">
        <Button size="sm" variant="primary" @click="tab = 'payment'">Continue to payment</Button>
      </TabsPanel>
      <TabsPanel value="payment" class="text-[13px] text-muted-foreground">Card details go here.</TabsPanel>
    </TabsPanels>
  </Tabs>
</template>
