<script setup lang="ts">
/* Mirrors src/examples/tool-call/usage.tsx. */
import { ToolCall } from "@/components/keyframery/tool-call"
</script>

<template>
  <div data-demo="tool-call-usage" class="w-full max-w-[460px]">
    <ToolCall
      name="find_order"
      title="Looked up order #1048"
      status="done"
      :input="{ order_id: '1048' }"
      :output="{ status: 'shipped', carrier: 'Royal Mail' }"
      :duration="420"
    />
  </div>
</template>
