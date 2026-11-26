<script setup lang="ts">
import { Inbox } from "@lucide/vue"

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/keyframery/empty"
</script>

<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Inbox />
      </EmptyMedia>
      <EmptyTitle>No messages</EmptyTitle>
      <EmptyDescription>New messages will show up here.</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
