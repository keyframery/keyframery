<script setup lang="ts">
// Status
// `status` is "pending", "running", "approval", "done", "error" or "denied". The mark follows it: a dashed ring, a spinner, a pause, a tick that draws itself, a mark, a slash. Pass `startedAt` and a running call counts up.

import { ToolCall } from "@/components/keyframery/tool-call"

const startedAt = Date.now()
</script>

<template>
  <div class="flex w-full max-w-[420px] flex-col gap-2">
    <ToolCall
      name="find_order"
      title="Looked up order #1048"
      status="done"
      :input="{ order_id: '1048' }"
      :output="{ status: 'shipped' }"
      :duration="420"
    />
    <ToolCall
      name="send_email"
      title="Writing to Priya"
      status="running"
      :input="{ to: 'priya@example.com' }"
      :started-at="startedAt"
    />
    <ToolCall
      name="issue_refund"
      title="Refund £84.00"
      status="approval"
      :input="{ order_id: '1048', amount: 84 }"
    />
    <ToolCall name="cancel_order" title="Cancel order #1048" status="denied" :input="{ order_id: '1048' }" />
    <ToolCall
      name="notify_courier"
      title="Tell the courier"
      status="pending"
      :input="{ carrier: 'royal_mail' }"
    />
  </div>
</template>
