<script setup lang="ts">
// Count
// Pass `count` and the digits roll to each new number. Past `max` it shows 99+.

import { ref } from "vue"

import { Badge } from "@/components/keyframery/badge"
import { Button } from "@/components/keyframery/button"

const count = ref(3)
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="flex items-center gap-2 text-[14px] font-medium">
      Inbox<Badge :count="count" :max="99" />
    </span>
    <Button size="sm" @click="count = count + 7">Get mail</Button>
    <Button size="sm" variant="ghost" @click="count = 0">Clear</Button>
  </div>
</template>
