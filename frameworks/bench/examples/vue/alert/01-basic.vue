<script setup lang="ts">
// Basic
// An icon placed straight inside the alert pops into its tile and draws; the title and description rise in after it.

import { Clock3 } from "@lucide/vue"

import { Alert, AlertDescription, AlertTitle } from "@/components/keyframery/alert"
</script>

<template>
  <Alert class="max-w-[420px]">
    <Clock3 />
    <AlertTitle>Your table is held until 20:15</AlertTitle>
    <AlertDescription>Padella, Borough Market. After that it goes to the next party on the list.</AlertDescription>
  </Alert>
</template>
