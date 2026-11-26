<script setup lang="ts">
// With a character count
// Pair `maxLength` with a count so people see how much room is left.

import { ref } from "vue"

import { Textarea } from "@/components/keyframery/textarea"

const limit = 160

const bio = ref("")
</script>

<template>
  <div class="flex w-full max-w-[320px] flex-col gap-1.5">
    <Textarea v-model:value="bio" aria-label="Bio" :maxlength="limit" placeholder="A line or two about you" />
    <span class="self-end text-[12px] text-muted-foreground tabular-nums">{{ bio.length }} / {{ limit }}</span>
  </div>
</template>
