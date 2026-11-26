<script setup lang="ts">
// Plain, separator and border
// A plain marker is a line of text with an icon; `separator` puts it between two rules that draw
// out from the words; `border` underlines it with a rule that draws from the start.

import { UserPlus } from "@lucide/vue"

import { Marker, MarkerContent, MarkerIcon } from "@/components/keyframery/marker"
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col gap-5">
    <Marker>
      <MarkerIcon>
        <UserPlus />
      </MarkerIcon>
      <MarkerContent>Priya joined the channel</MarkerContent>
    </Marker>
    <Marker variant="separator">
      <MarkerContent>Monday 18 November</MarkerContent>
    </Marker>
    <Marker variant="border">
      <MarkerContent>Unread since 9:40</MarkerContent>
    </Marker>
  </div>
</template>
