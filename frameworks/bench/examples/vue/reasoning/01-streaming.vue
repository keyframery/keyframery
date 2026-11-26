<script setup lang="ts">
// While it thinks
// Set `streaming` while the model thinks: the trigger reads "Thinking…" with a light passing through it, and the thinking opens on its own. When `streaming` ends it closes and reads "Thought for 6s", timed for you unless you pass `duration`. A reader who toggles it keeps their choice.

import { onBeforeUnmount, ref } from "vue"

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/keyframery/reasoning"

const thinking = `The parcel left **Leeds on Tuesday** and has had no scan since.

- Royal Mail treats 10 working days as lost
- it has been 7, so a resend is quicker than a claim`

const words = thinking.match(/\s*\S+/g) ?? []

const at = ref(0)
const timer = setInterval(() => (at.value = at.value >= words.length + 40 ? 0 : at.value + 1), 90)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <Reasoning class="max-w-[380px]" :streaming="at < words.length">
    <ReasoningTrigger />
    <ReasoningContent>{{ words.slice(0, at).join("") }}</ReasoningContent>
  </Reasoning>
</template>
