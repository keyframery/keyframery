<script setup lang="ts">
// Basic
// A header with a title, a description and an optional `CardAction` in the corner.

import { Button } from "@/components/keyframery/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/keyframery/card"
</script>

<template>
  <Card class="w-full max-w-[340px]">
    <CardHeader>
      <CardTitle>Team plan</CardTitle>
      <CardDescription>Renews on 1 August</CardDescription>
      <CardAction>
        <Button size="sm" variant="ghost">Change</Button>
      </CardAction>
    </CardHeader>
    <CardContent class="text-[13px] text-muted-foreground">8 of 10 seats used, 42 GB of 100 GB storage.</CardContent>
    <CardFooter class="justify-end gap-2">
      <Button size="sm">Invoices</Button>
      <Button size="sm" variant="primary">Add seats</Button>
    </CardFooter>
  </Card>
</template>
