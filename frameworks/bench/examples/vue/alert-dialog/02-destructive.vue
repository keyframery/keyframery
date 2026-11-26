<script setup lang="ts">
// Destructive, with an icon
// `AlertDialogMedia` holds an icon above the title. Use the destructive variant for what can't be undone.

import { Trash2 } from "@lucide/vue"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/keyframery/alert-dialog"
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger variant="destructive">Delete album</AlertDialogTrigger>
    <AlertDialogBackdrop />
    <AlertDialogContent>
      <AlertDialogMedia>
        <Trash2 />
      </AlertDialogMedia>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete “Lisbon, 2025”?</AlertDialogTitle>
        <AlertDialogDescription>All 86 photos leave this album, and the shared link stops working.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogClose>Keep album</AlertDialogClose>
        <AlertDialogClose variant="destructive">Delete</AlertDialogClose>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
