<script setup lang="ts">
// Basic
// Buttons inside join into one strip, and one highlight glides between them under the pointer or keyboard focus.

import { Minus, Plus } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { ButtonGroup, ButtonGroupText } from "@/components/keyframery/button-group"
</script>

<template>
  <ButtonGroup aria-label="Guests">
    <Button size="icon" aria-label="One fewer guest">
      <Minus />
    </Button>
    <ButtonGroupText class="w-20 justify-center tabular-nums">2 guests</ButtonGroupText>
    <Button size="icon" aria-label="One more guest">
      <Plus />
    </Button>
  </ButtonGroup>
</template>
