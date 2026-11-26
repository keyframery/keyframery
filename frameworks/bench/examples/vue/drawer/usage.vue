<script setup lang="ts">
import { Drawer, DrawerBackdrop, DrawerContent, DrawerGrip, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/keyframery/drawer"
</script>

<template>
  <Drawer>
    <DrawerTrigger>Open</DrawerTrigger>
    <DrawerBackdrop />
    <DrawerContent>
      <DrawerGrip />
      <DrawerHeader>
        <DrawerTitle>Title</DrawerTitle>
      </DrawerHeader>
    </DrawerContent>
  </Drawer>
</template>
