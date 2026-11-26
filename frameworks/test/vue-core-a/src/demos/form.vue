<script setup lang="ts">
/* Mirrors src/demos/form.tsx at its default controls (phone required, no reset on success). */
import { ref } from "vue"

import { Form, FormDescription, FormItem, FormLabel, FormMessage, FormStatus, FormSubmit } from "@/components/keyframery/form"
import { Input } from "@/components/keyframery/input"

const taken = "maya.okafor@gmail.com"
const root = ref<HTMLDivElement | null>(null)
const speedOf = (el: Element | null) => (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
/* Stands in for the letting agent's server. */
const book = async (data: FormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1100 * speedOf(root.value)))
  if (String(data.get("email")).trim().toLowerCase() === taken)
    return { errors: { email: "This email already has a viewing on Saturday. Use another, or reply to that confirmation." } }
  return { message: "Booked for Saturday 23 November at 11:00. Directions are on their way." }
}
</script>

<template>
  <div ref="root" class="@container w-full max-w-[420px]">
    <div class="rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)] @max-[24rem]:p-4">
      <div class="flex items-center gap-3">
        <img src="/demo/canal.jpg" alt="" class="size-12 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div class="min-w-0">
          <div class="text-[15px] leading-tight font-semibold tracking-tight">Book a viewing</div>
          <div class="mt-1 truncate text-[12px] text-muted-foreground">Two-bed flat on the canal, Hackney Wick</div>
        </div>
      </div>

      <Form aria-label="Book a viewing" :submit="book" :reset-on-success="false" class="mt-5">
        <div class="grid grid-cols-2 gap-3 @max-[24rem]:grid-cols-1">
          <FormItem name="name">
            <FormLabel>Full name</FormLabel>
            <Input data-play="name" autocomplete="name" required />
            <FormMessage match="valueMissing">Tell us who's coming.</FormMessage>
          </FormItem>
          <FormItem name="phone">
            <FormLabel>Phone</FormLabel>
            <Input data-play="phone" type="tel" autocomplete="tel" required />
            <FormMessage match="valueMissing">For the agent on the day.</FormMessage>
          </FormItem>
        </div>
        <FormItem name="email">
          <FormLabel>Email</FormLabel>
          <Input data-play="email" type="email" autocomplete="email" required placeholder="you@example.com" />
          <FormDescription>We send the confirmation and directions here.</FormDescription>
          <FormMessage match="valueMissing">Enter an email for the confirmation.</FormMessage>
          <FormMessage match="typeMismatch">That doesn't look like an email address.</FormMessage>
          <FormMessage match="customError" />
        </FormItem>

        <div class="flex items-center gap-3 pt-1">
          <FormSubmit data-play="send" pending-label="Booking" success-label="Booked">Book Saturday, 11:00</FormSubmit>
          <button
            type="reset"
            data-play="again"
            class="h-9 cursor-pointer rounded-[10px] px-3 text-[13px] font-medium text-muted-foreground outline-none transition-[color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Clear
          </button>
        </div>
        <FormStatus class="-mt-1" />
      </Form>
    </div>
  </div>
</template>
