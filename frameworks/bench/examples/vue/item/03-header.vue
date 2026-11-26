<script setup lang="ts">
// Header and footer
// `ItemHeader` and `ItemFooter` take a full line above and below the row, for a picture or a status.

import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from "@/components/keyframery/item"
</script>

<template>
  <Item variant="muted" class="w-full max-w-[280px]">
    <ItemHeader>
      <img src="/demo/coast-2.jpg" alt="" class="aspect-[16/9] w-full rounded-[8px] object-cover" />
    </ItemHeader>
    <ItemContent>
      <ItemTitle>Porthcurno, Cornwall</ItemTitle>
      <ItemDescription>Cliff path to the Minack Theatre, 4.2 km</ItemDescription>
    </ItemContent>
    <ItemFooter class="text-[12px] text-muted-foreground">
      <span>Walked 2 Nov</span>
      <span class="tabular-nums">1 h 20 min</span>
    </ItemFooter>
  </Item>
</template>
