<script setup lang="ts">
// With a form
// A header, your content and a footer of actions. `variant="icon"` is the small close key in the corner.

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/keyframery/dialog"
import { Input } from "@/components/keyframery/input"
</script>

<template>
  <Dialog>
    <DialogTrigger>Edit profile</DialogTrigger>
    <DialogBackdrop />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>This is how others see you on the team.</DialogDescription>
      </DialogHeader>
      <div class="mt-4 flex flex-col gap-3">
        <label class="flex flex-col gap-1.5 text-[13px] font-medium">
          Name<Input default-value="Maya Chen" />
        </label>
        <label class="flex flex-col gap-1.5 text-[13px] font-medium">
          Role<Input default-value="Product designer" />
        </label>
      </div>
      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <DialogClose variant="primary">Save</DialogClose>
      </DialogFooter>
      <DialogClose variant="icon" />
    </DialogContent>
  </Dialog>
</template>
