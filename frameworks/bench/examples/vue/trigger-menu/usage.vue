<script setup lang="ts">
import { TriggerMenu, TriggerMenuContent, TriggerMenuInput, TriggerMenuItems, TriggerMenuList } from "@/components/keyframery/trigger-menu"

const people = [{ value: "maya", label: "Maya Chen" }]
</script>

<template>
  <TriggerMenu :triggers="[{ char: '@', items: people }]">
    <TriggerMenuInput aria-label="Message" />
    <TriggerMenuContent>
      <TriggerMenuList v-slot="{ state }">
        <TriggerMenuItems :items="state.items" />
      </TriggerMenuList>
    </TriggerMenuContent>
  </TriggerMenu>
</template>
