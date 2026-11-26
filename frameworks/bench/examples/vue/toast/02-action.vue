<script setup lang="ts">
// With an undo
// Give it an `action` for one quick follow-up, like undo. Hovering the stack pauses every toast's timer.

import { Button } from "@/components/keyframery/button"
import { createToaster, ToastRegion } from "@/components/keyframery/toast"

const toast = createToaster()
</script>

<template>
  <Button
    variant="destructive"
    @click="toast('Email archived', {
            action: { label: 'Undo', onAction: () => toast.success('Moved back to the inbox') },
          })"
  >
    Archive
  </Button>
  <ToastRegion :toaster="toast" />
</template>
