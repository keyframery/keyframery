<script setup lang="ts">
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/keyframery/item"
</script>

<template>
  <div data-demo="item-usage" class="w-[360px]">
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Weekly backup</ItemTitle>
        <ItemDescription>Every Sunday at 2am</ItemDescription>
      </ItemContent>
      <ItemActions>On</ItemActions>
    </Item>
  </div>
</template>
