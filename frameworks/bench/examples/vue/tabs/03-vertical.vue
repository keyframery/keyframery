<script setup lang="ts">
// Vertical
// `orientation="vertical"` lists the tabs down the side. Up and down arrows move between them.

import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/keyframery/tabs"
</script>

<template>
  <Tabs default-value="general" orientation="vertical" class="flex w-full max-w-[420px] flex-row gap-4">
    <TabsList aria-label="Settings">
      <TabsTab value="general">General</TabsTab>
      <TabsTab value="members">Members</TabsTab>
      <TabsTab value="billing">Billing</TabsTab>
    </TabsList>
    <TabsPanels class="flex-1 text-[13px] text-muted-foreground">
      <TabsPanel value="general">Name, logo and time zone.</TabsPanel>
      <TabsPanel value="members">Invite people and set roles.</TabsPanel>
      <TabsPanel value="billing">Plan, cards and invoices.</TabsPanel>
    </TabsPanels>
  </Tabs>
</template>
