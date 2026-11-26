<script setup lang="ts">
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/keyframery/dialog"
</script>

<template>
  <Dialog>
    <DialogTrigger>Open</DialogTrigger>
    <DialogBackdrop />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogHeader>
      <DialogClose variant="icon" />
    </DialogContent>
  </Dialog>
</template>
