<script setup lang="ts">
import { Form, FormItem, FormLabel, FormMessage, FormSubmit } from "@/components/keyframery/form"
import { Input } from "@/components/keyframery/input"
</script>

<template>
  <Form :submit="async (data) => console.log(data.get('email'))">
    <FormItem name="email">
      <FormLabel>Email</FormLabel>
      <Input type="email" required />
      <FormMessage />
    </FormItem>
    <FormSubmit>Subscribe</FormSubmit>
  </Form>
</template>
