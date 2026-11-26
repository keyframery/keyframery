<script setup lang="ts">
// Split button
// A main action and a menu of the others share one key. `ButtonGroupSeparator` draws the line between them.

import { ChevronDown } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/keyframery/button-group"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/keyframery/menu"
</script>

<template>
  <ButtonGroup aria-label="Publish">
    <Button variant="primary">Publish now</Button>
    <ButtonGroupSeparator class="bg-primary-foreground/25" />
    <Menu>
      <MenuTrigger>
        <template #render="{ props }">
          <Button v-bind="props" variant="primary" size="icon" aria-label="More ways to publish">
            <ChevronDown />
          </Button>
        </template>
      </MenuTrigger>
      <MenuContent align="end" class="w-52">
        <MenuItem value="schedule">Schedule for later</MenuItem>
        <MenuItem value="draft">Save as draft</MenuItem>
        <MenuItem value="preview">Share a preview link</MenuItem>
      </MenuContent>
    </Menu>
  </ButtonGroup>
</template>
