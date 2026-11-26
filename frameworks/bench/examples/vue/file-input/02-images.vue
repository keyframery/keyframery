<script setup lang="ts">
// Images only, with limits
// `accept`, `maxSize` and `maxFiles` turn files away before they're added. `onReject` says why.

import { ref } from "vue"

import { FileInput, FileInputDropzone, FileInputItem, FileInputList, FileInputTrigger } from "@/components/keyframery/file-input"

const error = ref<string | null>(null)
</script>

<template>
  <FileInput
    accept="image/*"
    :max-size="2_000_000"
    :max-files="3"
    multiple
    @value-change="error = null"
    @reject="(rejected) => error = `${rejected.length} file${rejected.length === 1 ? ' was' : 's were'} turned away: images up to 2 MB only.`"
    class="w-full max-w-[360px]"
  >
    <FileInputDropzone>
      <p class="mb-3 text-[13px] text-muted-foreground">PNG or JPEG, up to 2 MB each</p>
      <FileInputTrigger>Choose images</FileInputTrigger>
    </FileInputDropzone>
    <p v-if="error" class="text-[12px] text-destructive">{{ error }}</p>
    <FileInputList aria-label="Images">
      <FileInputItem />
    </FileInputList>
  </FileInput>
</template>
