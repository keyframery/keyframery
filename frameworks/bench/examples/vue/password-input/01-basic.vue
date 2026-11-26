<script setup lang="ts">
// Show and hide
// The toggle reveals the password. `PasswordInputCapsLock` warns while Caps Lock is on.

import { PasswordInput, PasswordInputCapsLock, PasswordInputControl, PasswordInputToggle } from "@/components/keyframery/password-input"
</script>

<template>
  <label class="flex w-full max-w-[300px] flex-col gap-1.5 text-[13px] font-medium">
    Password
    <PasswordInput>
      <PasswordInputControl />
      <PasswordInputCapsLock />
      <PasswordInputToggle aria-label="Show password" />
    </PasswordInput>
  </label>
</template>
