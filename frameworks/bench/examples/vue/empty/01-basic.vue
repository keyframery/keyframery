<script setup lang="ts">
// Basic
// The parts arrive in turn: the icon tile pops and its strokes draw, then the title, the description and each action rise in.

import { FolderOpen } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/keyframery/empty"
</script>

<template>
  <Empty class="max-w-[420px]">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FolderOpen />
      </EmptyMedia>
      <EmptyTitle>No invoices yet</EmptyTitle>
      <EmptyDescription>Invoices you send to clients will be listed here, newest first.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button size="sm" variant="primary">New invoice</Button>
      <Button size="sm">Import from CSV</Button>
    </EmptyContent>
  </Empty>
</template>
