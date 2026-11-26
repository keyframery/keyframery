<script setup lang="ts">
// Types
// `toast.success`, `toast.error` and plain `toast`. Each gets its own mark, drawn as it arrives.

import { Button } from "@/components/keyframery/button"
import { createToaster, ToastRegion } from "@/components/keyframery/toast"

const toast = createToaster()
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Button @click="toast('Draft saved')">Default</Button>
    <Button @click="toast.success('Payment sent', { description: '£48.00 to Maya Chen' })">Success</Button>
    <Button @click="toast.error(`Couldn't upload`, { description: 'The file is over 10 MB.' })">Error</Button>
    <ToastRegion :toaster="toast" />
  </div>
</template>
