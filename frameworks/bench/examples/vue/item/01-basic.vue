<script setup lang="ts">
// An item with an action
// Media, a title and a description on the left, whatever the row does on the right.

import { Button } from "@/components/keyframery/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/keyframery/item"
</script>

<template>
  <Item variant="outline" class="w-full max-w-[400px]">
    <ItemMedia variant="image">
      <img src="/demo/face-2.jpg" alt="" />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Megan Holt</ItemTitle>
      <ItemDescription>Asked to join the Thursday book club</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button size="sm" variant="primary">Let in</Button>
    </ItemActions>
  </Item>
</template>
