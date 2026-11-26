<script setup lang="ts">
// In a button
// Put it in the button while the work runs. It pops in, and `label` tells screen readers what is happening.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Spinner } from "@/components/keyframery/spinner"

const sending = ref(false)

function onClick() {
  sending.value = true
  setTimeout(() => sending.value = false, 2000)
}
</script>

<template>
  <Button variant="primary" @click="onClick">
    <Spinner v-if="sending" size="sm" label="Sending invoice" />{{ sending ? 'Sending' : 'Send invoice' }}
  </Button>
</template>
