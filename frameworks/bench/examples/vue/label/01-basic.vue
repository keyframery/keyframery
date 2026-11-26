<script setup lang="ts">
// Required and optional
// `LabelMarker` adds a quiet note after the text.

import { Input } from "@/components/keyframery/input"
import { Label, LabelMarker } from "@/components/keyframery/label"
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <Label for="full-name">
        Full name <LabelMarker>Required</LabelMarker>
      </Label>
      <Input id="full-name" required />
    </div>
    <div class="flex flex-col gap-1.5">
      <Label for="company">
        Company <LabelMarker>Optional</LabelMarker>
      </Label>
      <Input id="company" />
    </div>
  </div>
</template>
