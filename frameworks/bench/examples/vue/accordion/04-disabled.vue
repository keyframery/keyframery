<script setup lang="ts">
// Disabled item
// Pass `disabled` to an item to keep it shut.

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyframery/accordion"
</script>

<template>
  <Accordion class="max-w-[420px]">
    <AccordionItem value="free">
      <AccordionHeader>
        <AccordionTrigger>Free plan</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Three projects and one member.</AccordionPanel>
    </AccordionItem>
    <AccordionItem value="team" disabled>
      <AccordionHeader>
        <AccordionTrigger>Team plan (coming soon)</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Unlimited projects and members.</AccordionPanel>
    </AccordionItem>
  </Accordion>
</template>
