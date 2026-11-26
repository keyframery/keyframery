<script setup lang="ts">
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/keyframery/trace"
</script>

<template>
  <Trace>
    <TraceLine>
      <TraceIcon />
      <TraceTitle>Read the order history</TraceTitle>
    </TraceLine>
    <TraceLine status="running">
      <TraceIcon />
      <TraceTitle>Drafting the refund email</TraceTitle>
    </TraceLine>
  </Trace>
</template>
