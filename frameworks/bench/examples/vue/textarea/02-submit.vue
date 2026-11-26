<script setup lang="ts">
// Send with a shortcut
// `submitShortcut="mod+enter"` runs `onSubmit` on ⌘ Enter or Ctrl Enter, for chat and comment boxes.

import { ref } from "vue"

import { Textarea } from "@/components/keyframery/textarea"

const sent = ref<string[]>([])
const text = ref("")

function onSubmit() {
  if (text.value.trim()) sent.value = [...sent.value, text.value.trim()]
  text.value = ""
}
</script>

<template>
  <div class="flex w-full max-w-[320px] flex-col gap-2">
    <ul class="space-y-1 text-[13px]">
      <li v-for="(m, i) in sent" :key="i" class="rounded-[10px] bg-muted px-3 py-2">{{ m }}</li>
    </ul>
    <Textarea
      v-model:value="text"
      aria-label="Comment"
      placeholder="Write a comment, then press ⌘ Enter"
      submit-shortcut="mod+enter"
      @submit="onSubmit"
    />
  </div>
</template>
