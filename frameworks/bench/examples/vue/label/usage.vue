<script setup lang="ts">
import { Input } from "@/components/keyframery/input"
import { Label, LabelMarker } from "@/components/keyframery/label"
</script>

<template>
  <Label for="name">
    Name <LabelMarker>Required</LabelMarker>
  </Label>
  <Input id="name" required />
</template>
