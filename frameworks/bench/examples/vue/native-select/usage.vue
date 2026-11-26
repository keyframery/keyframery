<script setup lang="ts">
import { NativeSelect, NativeSelectOption } from "@/components/keyframery/native-select"
</script>

<template>
  <NativeSelect aria-label="Status" default-value="todo">
    <NativeSelectOption value="todo">To do</NativeSelectOption>
    <NativeSelectOption value="doing">In progress</NativeSelectOption>
    <NativeSelectOption value="done">Done</NativeSelectOption>
  </NativeSelect>
</template>
