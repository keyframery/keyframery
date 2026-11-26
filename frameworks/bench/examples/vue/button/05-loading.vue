<script setup lang="ts">
// Loading
// Return a promise from `onClick` and the button shows a spinner until it settles. Screen readers hear `pendingAnnouncement`.

import { Button } from "@/components/keyframery/button"

const save = () => new Promise((resolve) => setTimeout(resolve, 1600))
</script>

<template>
  <Button variant="primary" @click="save" pending-announcement="Saving">Save changes</Button>
</template>
