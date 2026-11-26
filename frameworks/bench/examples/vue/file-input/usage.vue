<script setup lang="ts">
import { FileInput, FileInputDropzone, FileInputItem, FileInputList, FileInputTrigger } from "@/components/keyframery/file-input"
</script>

<template>
  <FileInput multiple>
    <FileInputDropzone>
      <FileInputTrigger>Choose files</FileInputTrigger>
    </FileInputDropzone>
    <FileInputList>
      <FileInputItem />
    </FileInputList>
  </FileInput>
</template>
