<script setup lang="ts">
// Speed
// `speed` changes how fast it moves. Click each one and watch the label make way for the spinner.

import { Button } from "@/components/keyframery/button"

const wait = () => new Promise((resolve) => setTimeout(resolve, 1400))
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Button speed="fast" @click="wait">Fast</Button>
    <Button @click="wait">Normal</Button>
    <Button speed="slow" @click="wait">Slow</Button>
  </div>
</template>
