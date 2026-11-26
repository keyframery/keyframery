<script setup lang="ts">
// Your own labels
// `thinkingLabel` and `doneLabel` on the trigger change its words; `doneLabel` gets the seconds. Set `autoClose={false}` to leave the thinking open once it ends.

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/keyframery/reasoning"
</script>

<template>
  <Reasoning class="max-w-[380px]" :duration="14" default-open :auto-close="false">
    <ReasoningTrigger
      thinking-label="Checking the menu…"
      :done-label="(seconds) => `Checked the menu in ${seconds} seconds`"
    />
    <ReasoningContent>Two of the six mains are vegetarian, and the risotto can be made without butter. That covers *both* of your guests.</ReasoningContent>
  </Reasoning>
</template>
