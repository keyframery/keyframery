<script setup lang="ts">
// Sheet on phones
// `presentation="auto"` shows a dialog on wide screens and a sheet that slides up, and can be swiped away, on phones.

import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/keyframery/dialog"
</script>

<template>
  <Dialog presentation="auto">
    <DialogTrigger>Share</DialogTrigger>
    <DialogBackdrop />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share this list</DialogTitle>
        <DialogDescription>On a phone this slides up from the bottom of the screen.</DialogDescription>
      </DialogHeader>
      <DialogClose variant="icon" />
    </DialogContent>
  </Dialog>
</template>
