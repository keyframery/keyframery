<script setup lang="ts">
// Interactive
// `interactive` makes the whole card pressable: it lifts on hover and sinks on press. `spotlight` adds a soft light that follows the pointer.

import { ref } from "vue"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/keyframery/card"

const sections = [
  { id: "billing", title: "Billing", about: "Cards, invoices and tax details" },
  { id: "team", title: "Team", about: "Invite people and set roles" },
]

const opened = ref<string | null>(null)
</script>

<template>
  <div class="flex w-full max-w-[520px] flex-col gap-3">
    <div class="grid gap-3 sm:grid-cols-2">
      <Card
        v-for="s in sections"
        :key="s.id"
        interactive
        spotlight
        role="button"
        :tabindex="0"
        @click="opened = s.title"
        @keydown="(e) => (e.key === 'Enter' || e.key === ' ') && (opened = s.title)"
      >
        <CardHeader>
          <CardTitle>{{ s.title }}</CardTitle>
          <CardDescription>{{ s.about }}</CardDescription>
        </CardHeader>
      </Card>
    </div>
    <span class="text-[12px] text-muted-foreground">{{ opened ? `Opened ${opened}` : 'Press a card' }}</span>
  </div>
</template>
