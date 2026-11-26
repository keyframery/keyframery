<script setup lang="ts">
/* Mirrors src/demos/native-select.tsx with its default controls. */
import { ref } from "vue"
import { Label } from "@/components/keyframery/label"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/keyframery/native-select"

const addresses = [
  { id: "home", label: "Home", city: "Bristol", country: "gb", delivery: "standard" },
  { id: "studio", label: "Studio", city: "Lisbon", country: "pt", delivery: "express" },
  { id: "parents", label: "Mum's", city: "Galway", country: "ie", delivery: "collect" },
]
const deliveries: Record<string, { label: string; price: string }> = {
  standard: { label: "Standard, 3 to 5 days", price: "£4.50" },
  express: { label: "Express, next working day", price: "£9.00" },
  collect: { label: "Collect from the Bristol studio", price: "Free" },
}
const address = ref("home")
const country = ref("gb")
const delivery = ref("standard")
function use(id: string) {
  const saved = addresses.find((a) => a.id === id)!
  address.value = id
  country.value = saved.country
  delivery.value = saved.delivery
}
</script>

<template>
  <div data-demo="native-select" class="@container w-full max-w-[440px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
    <div class="flex items-center gap-3">
      <img src="http://localhost:4610/demo/cup.jpg" alt="" class="size-12 shrink-0 rounded-[10px] bg-muted object-cover" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-[14px] font-medium tracking-tight">Speckled stoneware mugs, set of two</div>
        <div class="mt-1 text-[12px] text-muted-foreground">Fern &amp; Kiln, Bristol</div>
      </div>
      <span class="text-[13px] font-medium tabular-nums">£38.00</span>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-1.5">
      <span class="me-1 text-[12px] text-muted-foreground @max-[22rem]:hidden">Send to</span>
      <button
        v-for="a in addresses"
        :key="a.id"
        type="button"
        :data-address="a.id"
        :aria-pressed="address === a.id"
        class="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[12px] leading-none font-medium text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.08)] outline-none transition-[color,background-color,box-shadow,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96] aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:shadow-none dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] motion-reduce:transition-none"
        @click="use(a.id)"
      >
        {{ a.label }}
        <span class="font-normal opacity-70">{{ a.city }}</span>
      </button>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 @[400px]:grid-cols-[1fr_1.35fr]">
      <div class="flex flex-col gap-2">
        <Label for="kf-ns-country">Country</Label>
        <NativeSelect id="kf-ns-country" v-model:value="country" size="default" :disabled="false" wrapper-class-name="w-full">
          <NativeSelectOptGroup label="Most orders">
            <NativeSelectOption value="gb">United Kingdom</NativeSelectOption>
            <NativeSelectOption value="ie">Ireland</NativeSelectOption>
          </NativeSelectOptGroup>
          <NativeSelectOptGroup label="Europe">
            <NativeSelectOption value="fr">France</NativeSelectOption>
            <NativeSelectOption value="de">Germany</NativeSelectOption>
            <NativeSelectOption value="nl">Netherlands</NativeSelectOption>
            <NativeSelectOption value="pt">Portugal</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      </div>
      <div class="flex flex-col gap-2">
        <Label for="kf-ns-delivery">Delivery</Label>
        <NativeSelect id="kf-ns-delivery" v-model:value="delivery" size="default" :disabled="false" :invalid="false" wrapper-class-name="w-full">
          <NativeSelectOption v-for="(d, value) in deliveries" :key="value" :value="value">{{ d.label }}</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>

    <div class="mt-5 flex items-center justify-between border-t border-border pt-4 text-[13px]">
      <span class="text-muted-foreground">Delivery</span>
      <span class="font-medium tabular-nums">{{ deliveries[delivery].price }}</span>
    </div>
  </div>
</template>
