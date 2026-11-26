<script setup lang="ts">
// Risk
// `risk` is "low", "medium" or "high". It tints the shield and the label; at high risk Approve turns destructive and, with `autoFocus`, Deny takes the focus instead of Approve.

import { Approval } from "@/components/keyframery/approval"
</script>

<template>
  <div class="flex w-full max-w-[440px] flex-col gap-3">
    <Approval title="Rename the project" target="Set Project name to “Atlas”" risk="low" />
    <Approval title="Invite a teammate" target="Press “Send invite”" risk="medium" allow-always />
    <Approval
      title="Delete order #1048"
      description="It goes from the shop, the invoices and the reports."
      target="Press “Delete order”"
      risk="high"
    />
  </div>
</template>
