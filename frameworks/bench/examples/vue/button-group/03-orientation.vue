<script setup lang="ts">
// Vertical and nested
// `orientation="vertical"` stacks the buttons. Groups inside a group keep a gap between them.

import { Minus, Plus } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { ButtonGroup } from "@/components/keyframery/button-group"
</script>

<template>
  <ButtonGroup aria-label="Map controls">
    <ButtonGroup orientation="vertical" aria-label="Zoom">
      <Button size="icon" aria-label="Zoom in">
        <Plus />
      </Button>
      <Button size="icon" aria-label="Zoom out">
        <Minus />
      </Button>
    </ButtonGroup>
    <ButtonGroup orientation="vertical" aria-label="Map type">
      <Button size="sm">Map</Button>
      <Button size="sm">Satellite</Button>
    </ButtonGroup>
  </ButtonGroup>
</template>
