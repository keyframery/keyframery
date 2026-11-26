<script setup lang="ts">
// Send and Stop
// Pass the chat's `status`: "submitted" turns Send into a spinner and "streaming" into Stop, which calls `onStop`. A model picker shows when you pass `models`.

import { onBeforeUnmount, ref } from "vue"

import { PromptComposer, type PromptComposerStatus } from "@/components/keyframery/prompt-composer"

const models = [
  { value: "fast", label: "Fast", description: "Quick lookups" },
  { value: "thorough", label: "Thorough", description: "Checks every order it names" },
]

const status = ref<PromptComposerStatus>("ready")
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

function onSubmit() {
  status.value = "submitted"
  timer = setTimeout(() => {
    status.value = "streaming"
    timer = setTimeout(() => status.value = "ready", 4000)
  }, 800)
}

function onStop() {
  clearTimeout(timer)
  status.value = "ready"
}
</script>

<template>
  <PromptComposer class="max-w-[480px]" :status="status" :models="models" @submit="onSubmit" @stop="onStop" />
</template>
