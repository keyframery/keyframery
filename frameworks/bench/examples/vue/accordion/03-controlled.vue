<script setup lang="ts">
// Controlled
// Pass `value` and `onValueChange` to open items from your own state.

import { ref } from "vue"

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyframery/accordion"
import { Button } from "@/components/keyframery/button"

const steps = ["Details", "Delivery", "Payment"]

const open = ref<string[]>(["Details"])
const next = () => {
    const i = steps.indexOf(open.value[0] ?? "")
    open.value = [steps[(i + 1) % steps.length]]
  }
</script>

<template>
  <div class="w-full max-w-[420px] space-y-3">
    <Accordion v-model:value="open" class="w-full">
      <AccordionItem v-for="step in steps" :key="step" :value="step">
        <AccordionHeader>
          <AccordionTrigger>{{ step }}</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>Fill in your {{ step.toLowerCase() }} here.</AccordionPanel>
      </AccordionItem>
    </Accordion>
    <Button size="sm" @click="next">Next step</Button>
  </div>
</template>
