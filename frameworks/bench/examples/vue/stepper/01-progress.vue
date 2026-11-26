<script setup lang="ts">
// A read-only progress strip
// With `interactive={false}` the steps are text, not buttons, and the current one carries `aria-current="step"`. Pass every value to `completed` for a finished order.

import { Stepper, StepperList } from "@/components/keyframery/stepper"

const steps = [
  { value: "placed", label: "Placed", description: "18 Nov" },
  { value: "paid", label: "Paid", description: "18 Nov" },
  { value: "packed", label: "Packed", description: "19 Nov" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
]
</script>

<template>
  <Stepper aria-label="Order progress" :interactive="false" :steps="steps" value="paid" class="max-w-xl">
    <StepperList />
  </Stepper>
</template>
