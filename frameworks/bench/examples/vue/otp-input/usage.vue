<script setup lang="ts">
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@/components/keyframery/otp-input"
</script>

<template>
  <OTPInput :max-length="4" aria-label="Code">
    <OTPInputGroup>
      <OTPInputSlot :index="0" />
      <OTPInputSlot :index="1" />
      <OTPInputSlot :index="2" />
      <OTPInputSlot :index="3" />
    </OTPInputGroup>
  </OTPInput>
</template>
