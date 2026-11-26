<script setup lang="ts">
// Dismissible
// `AlertClose` dismisses it: the alert fades and folds its height away, so the page closes up. Control it with `open` and `onOpenChange`.

import { ref } from "vue"
import { Info } from "@lucide/vue"

import { Alert, AlertClose, AlertDescription, AlertTitle } from "@/components/keyframery/alert"
import { Button } from "@/components/keyframery/button"

const open = ref(true)
</script>

<template>
  <div class="flex w-full max-w-[420px] flex-col gap-3">
    <Alert v-model:open="open">
      <Info />
      <AlertTitle>New: split the bill</AlertTitle>
      <AlertDescription>Everyone at the table can now pay their own share from the receipt.</AlertDescription>
      <AlertClose />
    </Alert>
    <Button v-if="!open" size="sm" class="self-start" @click="open = true">Show again</Button>
  </div>
</template>
