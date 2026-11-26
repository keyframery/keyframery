<script setup lang="ts">
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/keyframery/reasoning"
</script>

<template>
  <div data-demo="reasoning-usage" class="w-[420px]">
    <Reasoning :duration="4">
      <ReasoningTrigger />
      <ReasoningContent>The 07:05 lands at 10:20, early enough to drop bags before lunch.</ReasoningContent>
    </Reasoning>
  </div>
</template>
