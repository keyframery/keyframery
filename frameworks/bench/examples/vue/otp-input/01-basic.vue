<script setup lang="ts">
// Six digits
// Typing moves along the slots, and a pasted or autofilled code fills them all. `onValueCommit` runs once every slot is filled.

import { ref } from "vue"

import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@/components/keyframery/otp-input"

const code = ref<string | null>(null)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <OTPInput
      :max-length="6"
      aria-label="Verification code"
      @value-change="code = null"
      @value-commit="(v) => (code = v)"
    >
      <OTPInputGroup>
        <OTPInputSlot :index="0" />
        <OTPInputSlot :index="1" />
        <OTPInputSlot :index="2" />
      </OTPInputGroup>
      <OTPInputSeparator />
      <OTPInputGroup>
        <OTPInputSlot :index="3" />
        <OTPInputSlot :index="4" />
        <OTPInputSlot :index="5" />
      </OTPInputGroup>
    </OTPInput>
    <span class="text-[12px] text-muted-foreground tabular-nums">{{ code ? `Checking ${code}…` : 'Enter the code we texted you' }}</span>
  </div>
</template>
