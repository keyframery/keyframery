<script setup lang="ts">
import { Stepper, StepperList } from "@/components/keyframery/stepper"

const steps = [
  { value: "placed", label: "Placed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
]
</script>

<template>
  <div data-demo="stepper-usage" class="w-full max-w-[420px]">
    <Stepper aria-label="Order progress" :interactive="false" value="packed" :steps="steps">
      <StepperList />
    </Stepper>
  </div>
</template>
