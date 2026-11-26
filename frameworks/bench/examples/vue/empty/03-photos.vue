<script setup lang="ts">
// With pictures
// The default `EmptyMedia` holds anything, like a small stack of photos; each one pops in after the last.

import { Button } from "@/components/keyframery/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/keyframery/empty"
</script>

<template>
  <Empty class="max-w-[420px]">
    <EmptyHeader>
      <EmptyMedia class="-space-x-3">
        <img src="/demo/face-1.jpg" alt="" class="size-10 rounded-full object-cover ring-2 ring-background" />
        <img
          src="/demo/face-3.jpg"
          alt=""
          class="relative z-10 size-10 rounded-full object-cover ring-2 ring-background"
        />
        <img src="/demo/face-4.jpg" alt="" class="size-10 rounded-full object-cover ring-2 ring-background" />
      </EmptyMedia>
      <EmptyTitle>Nobody else on this board</EmptyTitle>
      <EmptyDescription>Invite the people you plan the trip with so they can add their own ideas.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button size="sm" variant="primary">Invite people</Button>
    </EmptyContent>
  </Empty>
</template>
