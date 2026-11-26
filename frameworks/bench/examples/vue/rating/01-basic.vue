<script setup lang="ts">
// Basic
// Click a star, or use the arrow keys. Screen readers hear “3 stars”.

import { ref } from "vue"

import { Rating } from "@/components/keyframery/rating"

const words = ["Poor", "Fair", "Good", "Great", "Perfect"]

const score = ref<number | null>(null)
</script>

<template>
  <div class="flex items-center gap-3">
    <Rating v-model:value="score" aria-label="Your rating" />
    <span class="text-[13px] text-muted-foreground">{{ score ? words[score - 1] : 'Tap a star' }}</span>
  </div>
</template>
