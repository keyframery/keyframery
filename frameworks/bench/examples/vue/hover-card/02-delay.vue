<script setup lang="ts">
// Faster or slower
// `delay` is how long the pointer must rest before it opens, and `closeDelay` how long it lingers after.

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/keyframery/hover-card"
</script>

<template>
  <div class="flex gap-6 text-[14px]">
    <HoverCard :delay="150" :close-delay="100">
      <HoverCardTrigger href="#quick">Quick</HoverCardTrigger>
      <HoverCardContent>Opens after 150 ms.</HoverCardContent>
    </HoverCard>
    <HoverCard :delay="1000">
      <HoverCardTrigger href="#patient">Patient</HoverCardTrigger>
      <HoverCardContent>Opens after a full second.</HoverCardContent>
    </HoverCard>
  </div>
</template>
