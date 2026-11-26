<script setup lang="ts">
import { ToolCall } from "@/components/keyframery/tool-call"
</script>

<template>
  <ToolCall
    name="find_order"
    title="Looked up order #1048"
    status="done"
    :input="{ order_id: '1048' }"
    :output="{ status: 'shipped', carrier: 'Royal Mail' }"
    :duration="420"
  />
</template>
