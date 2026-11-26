<script setup lang="ts">
// Composer
// A textarea with a row under it (`block-end`). The count rolls as you type, and the send button, marked `data-show="filled"`, pops in with the first character.

import { ArrowUp } from "@lucide/vue"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupCount,
  InputGroupTextarea,
} from "@/components/keyframery/input-group"
</script>

<template>
  <InputGroup class="max-w-[380px]">
    <InputGroupTextarea aria-label="Reply" placeholder="Write a reply" :maxlength="500" />
    <InputGroupAddon align="block-end">
      <InputGroupCount show="left" />
      <InputGroupButton
        variant="primary"
        size="icon-xs"
        aria-label="Send"
        data-show="filled"
        class="ms-auto rounded-full"
      >
        <ArrowUp />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
