<script setup lang="ts">
// Controlled
// Pass `open` and `onOpenChange` to open it from code, like after a save.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/keyframery/dialog"

const open = ref(false)
const publish = () => new Promise((resolve) => setTimeout(resolve, 900)).then(() => open.value = true)
</script>

<template>
  <Button variant="primary" @click="publish">Publish</Button>
  <Dialog v-model:open="open">
    <DialogBackdrop />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>It's live</DialogTitle>
        <DialogDescription>Your post is published and shared with 1,204 followers.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose variant="primary">Done</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
