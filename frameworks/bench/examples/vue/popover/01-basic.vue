<script setup lang="ts">
// With a title and a form
// A popover holds interactive content. Focus moves into it, and Escape or a click outside closes it.

import { Input } from "@/components/keyframery/input"
import { Popover, PopoverArrow, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/keyframery/popover"
</script>

<template>
  <Popover>
    <PopoverTrigger>Set a reminder</PopoverTrigger>
    <PopoverContent class="w-72">
      <PopoverArrow />
      <PopoverTitle>Reminder</PopoverTitle>
      <PopoverDescription>We'll nudge you about this task.</PopoverDescription>
      <div class="mt-3 flex gap-2">
        <Input aria-label="Remind me in" default-value="2 hours" />
        <PopoverClose variant="primary">Save</PopoverClose>
      </div>
    </PopoverContent>
  </Popover>
</template>
