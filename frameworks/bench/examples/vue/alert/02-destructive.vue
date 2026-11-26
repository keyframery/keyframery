<script setup lang="ts">
// Destructive
// `variant="destructive"` tints the icon tile, the title and the hairline for something that went wrong.

import { CircleAlert } from "@lucide/vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/keyframery/alert"
</script>

<template>
  <Alert variant="destructive" class="max-w-[420px]">
    <CircleAlert />
    <AlertTitle>Payment declined</AlertTitle>
    <AlertDescription>Your bank turned down the card ending 0412. Try another card or call them.</AlertDescription>
  </Alert>
</template>
