<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/keyframery/alert-dialog"
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger variant="destructive">Delete</AlertDialogTrigger>
    <AlertDialogBackdrop />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogClose>Cancel</AlertDialogClose>
        <AlertDialogClose variant="destructive">Delete</AlertDialogClose>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
