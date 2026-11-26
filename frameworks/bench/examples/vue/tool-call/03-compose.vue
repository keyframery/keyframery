<script setup lang="ts">
// Your own card
// Pass parts as children to lay the card out yourself. The trigger is the body's collapsible: an agent opens the card with its `setOpen`, and the tool call reads the name, status, input and output to it.

import {
  ToolCall,
  ToolCallContent,
  ToolCallIcon,
  ToolCallLabel,
  ToolCallName,
  ToolCallSection,
  ToolCallStatusText,
  ToolCallTitle,
  ToolCallTrigger,
  ToolCallValue,
} from "@/components/keyframery/tool-call"

const input = { query: "linen shirt", size: "M", in_stock: true }
</script>

<template>
  <ToolCall
    class="max-w-[420px]"
    name="search_products"
    title="Searching the shop"
    status="running"
    :input="input"
    default-open
  >
    <ToolCallTrigger>
      <ToolCallIcon />
      <ToolCallTitle>Searching the shop</ToolCallTitle>
      <ToolCallName>search_products</ToolCallName>
      <ToolCallStatusText class="ms-auto" />
    </ToolCallTrigger>
    <ToolCallContent>
      <ToolCallSection kind="input">
        <ToolCallLabel>Looking for</ToolCallLabel>
        <ToolCallValue :value="input" />
      </ToolCallSection>
    </ToolCallContent>
  </ToolCall>
</template>
