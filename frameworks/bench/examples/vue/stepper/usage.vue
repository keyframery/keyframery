<script setup lang="ts">
import { Stepper, StepperList } from "@/components/keyframery/stepper"
</script>

<template>
  <Stepper
    aria-label="Order progress"
    :interactive="false"
    value="packed"
    :steps="[
        { value: 'placed', label: 'Placed' },
        { value: 'packed', label: 'Packed' },
        { value: 'shipped', label: 'Shipped' },
      ]"
  >
    <StepperList />
  </Stepper>
</template>
