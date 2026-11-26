<script setup lang="ts">
// Open on hover
// `openOnHover` opens it while the pointer rests on the trigger, after `delay`. A click still opens it too.

import { Popover, PopoverContent, PopoverTrigger } from "@/components/keyframery/popover"
</script>

<template>
  <Popover open-on-hover :delay="200">
    <PopoverTrigger>Hover me</PopoverTrigger>
    <PopoverContent class="w-60 text-[13px]">Stays open while the pointer is over it, so you can click inside.</PopoverContent>
  </Popover>
</template>
