<script setup lang="ts">
import { Approval } from "@/components/keyframery/approval"


function onApprove() {}

function onDeny() {}
</script>

<template>
  <Approval
    title="Issue a refund"
    description="£84.00 back to Priya Shah's Visa ending 4242."
    target="Press “Refund order #1048”"
    risk="high"
    @approve="onApprove"
    @deny="onDeny"
  />
</template>
