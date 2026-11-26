<script setup lang="ts">
// A multi-step form
// Linear by default: Continue moves on, and the step buttons go back to any step already reached. Panels arrive from the side you moved toward.

import { computed, ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Stepper, StepperList, StepperPanel } from "@/components/keyframery/stepper"

const steps = [
  { value: "account", label: "Account" },
  { value: "team", label: "Team" },
  { value: "billing", label: "Billing" },
]

const step = ref("account")
const index = computed(() => steps.findIndex((s) => s.value === step.value))
</script>

<template>
  <Stepper v-model:value="step" aria-label="Set up workspace" :steps="steps" class="max-w-lg">
    <StepperList />
    <div class="grid text-[13px] *:[grid-area:1/1]">
      <StepperPanel value="account">Choose a name and a password.</StepperPanel>
      <StepperPanel value="team">Invite the people you work with.</StepperPanel>
      <StepperPanel value="billing">Add a card. You won't be charged during the trial.</StepperPanel>
    </div>
    <div class="flex justify-between">
      <Button variant="ghost" :disabled="index === 0" @click="step = steps[index - 1].value">Back</Button>
      <Button variant="primary" :disabled="index === steps.length - 1" @click="step = steps[index + 1].value">Continue</Button>
    </div>
  </Stepper>
</template>
