<script setup lang="ts">
// While something runs
// `toast.promise` shows a loading toast, then turns it into success or error when the promise settles.

import { Button } from "@/components/keyframery/button"
import { createToaster, ToastRegion } from "@/components/keyframery/toast"

const publish = () => new Promise((resolve) => setTimeout(resolve, 1800))

const toast = createToaster()
</script>

<template>
  <Button
    variant="primary"
    @click="toast.promise(publish, { loading: 'Publishing…', success: 'Published', error: `Couldn't publish` })"
  >
    Publish
  </Button>
  <ToastRegion :toaster="toast" side="top" align="center" />
</template>
