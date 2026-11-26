<script setup lang="ts">
import { Search } from "@lucide/vue"

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/keyframery/input-group"
</script>

<template>
  <InputGroup>
    <InputGroupAddon>
      <Search />
    </InputGroupAddon>
    <InputGroupInput aria-label="Search" placeholder="Search" />
  </InputGroup>
</template>
