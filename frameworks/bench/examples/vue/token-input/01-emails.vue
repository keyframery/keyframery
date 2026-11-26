<script setup lang="ts">
// Emails as tokens
// The value is a list of text and tokens. Turn a typed address into a token when it's followed by a space or comma. Backspace removes a whole token.

import { ref } from "vue"

import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  type TokenInputValue,
} from "@/components/keyframery/token-input"

type Value = TokenInputValue
type Segment = Value[number]
const email = (address: string): Segment => ({ type: "email", value: address, label: address })
/* An address followed by a space, comma or semicolon becomes a token. */
function tokenize(value: Value): Value {
  const out: Segment[] = []
  for (const segment of value) {
    if (typeof segment !== "string") {
      out.push(segment)
      continue
    }
    segment.split(/([^\s,;]+@[^\s,;]+\.[a-z]{2,})[\s,;]+/i).forEach((part, i) => {
      if (i % 2) out.push(email(part))
      else if (part) out.push(part)
    })
  }
  return out
}

const value = ref<Value>([email("maya@example.com")])
</script>

<template>
  <div class="w-full max-w-[360px]">
    <TokenInput :value="value" @value-change="(next) => value = tokenize(next)">
      <template #token="{ token }">
        <TokenInputToken>{{ token.label }}<TokenInputTokenRemove /></TokenInputToken>
      </template>
      <TokenInputEditor aria-label="Invite" placeholder="Add emails, separated by commas" />
    </TokenInput>
  </div>
</template>
