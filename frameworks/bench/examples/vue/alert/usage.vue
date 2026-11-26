<script setup lang="ts">
import { CircleAlert } from "@lucide/vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/keyframery/alert"
</script>

<template>
  <Alert>
    <CircleAlert />
    <AlertTitle>Heads up</AlertTitle>
    <AlertDescription>Your card expires at the end of the month.</AlertDescription>
  </Alert>
</template>
