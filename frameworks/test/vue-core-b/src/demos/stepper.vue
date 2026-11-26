<script setup lang="ts">
/* Mirrors src/demos/stepper.tsx with its default controls. */
import { computed, ref } from "vue"
import { Stepper, StepperList, StepperPanel, type StepperStepData } from "@/components/keyframery/stepper"
import { Button } from "@/components/keyframery/button"
import { Field, FieldLabel } from "@/components/keyframery/field"
import { Input } from "@/components/keyframery/input"

const order: StepperStepData[] = [
  { value: "placed", label: "Placed", description: "18 Nov" },
  { value: "paid", label: "Paid", description: "18 Nov" },
  { value: "packed", label: "Packed", description: "19 Nov" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
]
const checkout = [
  { value: "contact", label: "Contact", description: "Email and phone" },
  { value: "shipping", label: "Shipping", description: "Address and speed" },
  { value: "payment", label: "Payment", description: "Card details" },
  { value: "review", label: "Review", description: "Place the order" },
]
const step = ref("contact")
const index = computed(() => checkout.findIndex((s) => s.value === step.value))
const steps = checkout.map((s) => ({ ...s, error: false }))
const setStep = (value: string) => (step.value = value)
</script>

<template>
  <div data-demo="stepper" style="--stepper-size: 28px" class="flex w-full max-w-[600px] flex-col gap-4">
    <div class="rounded-[16px] bg-background px-5 py-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="mb-3 flex items-baseline justify-between text-[12px] text-muted-foreground">
        <span class="font-medium text-foreground">Order #1048</span>
        <span>Arrives Fri 21 Nov</span>
      </div>
      <Stepper aria-label="Order progress" :interactive="false" :steps="order" value="packed">
        <StepperList />
      </Stepper>
    </div>
    <div
      data-demo="checkout"
      class="rounded-[16px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <Stepper aria-label="Checkout" :steps="steps" :value="step" :linear="true" :interactive="true" orientation="horizontal" :style="{ gap: '24px' }" @value-change="setStep">
        <StepperList />
        <div class="grid min-w-0 *:[grid-area:1/1]">
          <StepperPanel value="contact" class="flex flex-col gap-3">
            <Field name="email">
              <FieldLabel>Email</FieldLabel>
              <Input type="email" default-value="maya.okafor@northwind-studio.com" />
            </Field>
          </StepperPanel>
          <StepperPanel value="shipping" class="flex flex-col gap-3">
            <Field name="address">
              <FieldLabel>Address</FieldLabel>
              <Input default-value="18 Clerkenwell Close, London EC1R 0AA" />
            </Field>
          </StepperPanel>
          <StepperPanel value="payment" class="flex flex-col gap-3">
            <Field name="card">
              <FieldLabel>Card number</FieldLabel>
              <Input inputmode="numeric" default-value="4242 4242 4242 4242" />
            </Field>
          </StepperPanel>
          <StepperPanel value="review" class="flex flex-col gap-1 text-[13px]">
            <div class="font-medium">3 items · $184.00</div>
            <div class="text-muted-foreground">Ships to London by Royal Mail, arrives Friday.</div>
          </StepperPanel>
        </div>
        <div class="flex items-center justify-between gap-3 border-t border-border pt-4">
          <Button variant="ghost" data-stepper-action="back" :disabled="index === 0" @click="setStep(checkout[Math.max(0, index - 1)].value)">Back</Button>
          <Button variant="primary" data-stepper-action="next" @click="setStep(checkout[(index + 1) % checkout.length].value)">
            {{ index === checkout.length - 1 ? "Start over" : "Continue" }}
          </Button>
        </div>
      </Stepper>
    </div>
  </div>
</template>
