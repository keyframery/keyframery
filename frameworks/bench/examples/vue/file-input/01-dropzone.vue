<script setup lang="ts">
// Dropzone and list
// Drop files on the zone or choose them. Each one gets a row with a remove button.

import {
  FileInput,
  FileInputDropzone,
  FileInputDropzoneIcon,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from "@/components/keyframery/file-input"
</script>

<template>
  <FileInput name="attachments" multiple :max-files="5" class="w-full max-w-[360px]">
    <FileInputDropzone v-slot="{ state: zone }">
      <FileInputDropzoneIcon />
      <p class="font-medium">{{ zone.dragAccept ? 'Release to add' : 'Drop files here' }}</p>
      <p class="mb-3 text-[12px] text-muted-foreground">Up to 5 files</p>
      <FileInputTrigger>Choose files</FileInputTrigger>
    </FileInputDropzone>
    <FileInputList aria-label="Attachments">
      <FileInputItem v-slot="{ state: { file } }">
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="truncate font-medium">{{ file.name }}</span>
          <span class="text-[11px] text-muted-foreground tabular-nums">{{ formatFileSize(file.size) }}</span>
        </span>
        <FileInputItemRemove />
      </FileInputItem>
    </FileInputList>
  </FileInput>
</template>
