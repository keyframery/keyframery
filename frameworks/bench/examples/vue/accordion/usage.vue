<script setup lang="ts">
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyframery/accordion"
</script>

<template>
  <Accordion>
    <AccordionItem value="returns">
      <AccordionHeader>
        <AccordionTrigger>Can I return it?</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Yes, within 30 days of delivery.</AccordionPanel>
    </AccordionItem>
  </Accordion>
</template>
