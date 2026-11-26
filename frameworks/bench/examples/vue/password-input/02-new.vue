<script setup lang="ts">
// New password with rules
// `autoComplete="new-password"` lets password managers suggest one. Check the value as it changes.

import { ref } from "vue"

import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/keyframery/password-input"

const rules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^\w\s]/.test(p) },
]

const password = ref("")
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-2">
    <PasswordInput v-model:value="password" auto-complete="new-password">
      <PasswordInputControl aria-label="New password" placeholder="New password" />
      <PasswordInputToggle aria-label="Show password" />
    </PasswordInput>
    <ul class="flex gap-3 text-[12px]">
      <li
        v-for="rule in rules"
        :key="rule.label"
        :class="rule.test(password) ? 'text-foreground' : 'text-muted-foreground'"
      >
        {{ rule.test(password) ? '✓ ' : '' }}{{ rule.label }}
      </li>
    </ul>
  </div>
</template>
