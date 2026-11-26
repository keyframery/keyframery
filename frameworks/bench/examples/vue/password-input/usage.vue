<script setup lang="ts">
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/keyframery/password-input"
</script>

<template>
  <PasswordInput>
    <PasswordInputControl aria-label="Password" />
    <PasswordInputToggle aria-label="Show password" />
  </PasswordInput>
</template>
