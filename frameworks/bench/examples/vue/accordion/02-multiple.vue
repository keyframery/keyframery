<script setup lang="ts">
// Several open at once
// Pass `multiple` to let items open independently, and `defaultValue` to choose which start open.

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyframery/accordion"
</script>

<template>
  <Accordion multiple :default-value="['account', 'billing']" class="max-w-[420px]">
    <AccordionItem value="account">
      <AccordionHeader>
        <AccordionTrigger>Account</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Change your name, email and password.</AccordionPanel>
    </AccordionItem>
    <AccordionItem value="billing">
      <AccordionHeader>
        <AccordionTrigger>Billing</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>Update your card and download invoices.</AccordionPanel>
    </AccordionItem>
    <AccordionItem value="danger">
      <AccordionHeader>
        <AccordionTrigger>Delete account</AccordionTrigger>
      </AccordionHeader>
      <AccordionPanel>This removes everything, and can't be undone.</AccordionPanel>
    </AccordionItem>
  </Accordion>
</template>
