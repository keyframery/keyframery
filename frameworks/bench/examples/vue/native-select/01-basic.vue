<script setup lang="ts">
// Basic
// The browser's own picker, in a Keyframery field. Each new choice rises into the field and the chevron dips.

import { Label } from "@/components/keyframery/label"
import { NativeSelect, NativeSelectOption } from "@/components/keyframery/native-select"
</script>

<template>
  <div class="flex w-full max-w-[260px] flex-col gap-2">
    <Label for="ns-size">Shoe size</Label>
    <NativeSelect id="ns-size" name="size" default-value="" wrapper-class-name="w-full">
      <NativeSelectOption value="" disabled>Choose a size</NativeSelectOption>
      <NativeSelectOption value="40">EU 40</NativeSelectOption>
      <NativeSelectOption value="41">EU 41</NativeSelectOption>
      <NativeSelectOption value="42">EU 42</NativeSelectOption>
      <NativeSelectOption value="43">EU 43</NativeSelectOption>
    </NativeSelect>
  </div>
</template>
