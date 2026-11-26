<script setup lang="ts">
// From the side
// `side="right"` slides it in from the edge, for a cart or a details panel.

import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/keyframery/drawer"
</script>

<template>
  <Drawer side="right">
    <DrawerTrigger>Open cart</DrawerTrigger>
    <DrawerBackdrop />
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Your cart</DrawerTitle>
      </DrawerHeader>
      <p class="px-5 py-4 text-[13px] text-muted-foreground">2 items, £48.00</p>
      <div class="px-5">
        <DrawerClose variant="primary">Check out</DrawerClose>
      </div>
    </DrawerContent>
  </Drawer>
</template>
