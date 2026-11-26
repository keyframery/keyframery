<script setup lang="ts">
// Letters and digits
// `pattern="alphanumeric"` accepts letters too, for codes like A7K2.

import { OTPInput, OTPInputGroup, OTPInputSlot } from "@/components/keyframery/otp-input"
</script>

<template>
  <OTPInput :max-length="4" pattern="alphanumeric" aria-label="Room code">
    <OTPInputGroup>
      <OTPInputSlot :index="0" />
      <OTPInputSlot :index="1" />
      <OTPInputSlot :index="2" />
      <OTPInputSlot :index="3" />
    </OTPInputGroup>
  </OTPInput>
</template>
