<script setup lang="ts">
/* Mirrors src/demos/card.tsx at its default controls. */
import { ref } from "vue"

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/keyframery/card"

const key =
  "inline-flex h-8 cursor-pointer items-center justify-center rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

const plans = [
  { id: "solo", name: "Solo", price: "€0", note: "One trip at a time", seats: "1 traveller" },
  { id: "team", name: "Team", price: "€24", note: "Shared trips and budgets", seats: "Up to 15 people" },
]
const stats = [
  ["Booked", "5 of 6"],
  ["Budget", "€4,150"],
  ["Lift passes", "6"],
  ["Lessons", "3"],
]
const plan = ref("solo")
const pressed = ref<string | null>(null)
function flash(id: string, e: MouseEvent) {
  if (e.isTrusted) return
  const speed = parseFloat(getComputedStyle(e.currentTarget as HTMLElement).getPropertyValue("--kf-speed")) || 1
  pressed.value = id
  setTimeout(() => (pressed.value === id ? (pressed.value = null) : null), 160 * speed)
}
const checkedClass =
  "gap-3 py-4 shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_4px_12px_-6px_rgb(0_0_0/0.12)] [&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_16px_32px_-12px_rgb(0_0_0/0.24)] dark:shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_6px_16px_-6px_rgb(0_0_0/0.6)] dark:[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1.5px_color-mix(in_oklch,var(--foreground)_78%,transparent),0_18px_36px_-12px_rgb(0_0_0/0.8)]"
</script>

<template>
  <div style="--card-radius: 16px; --card-padding: 20px; max-width: 640px" class="@container w-full">
    <div class="flex items-start gap-4 @max-[36rem]:flex-col @max-[36rem]:gap-3">
      <Card interactive spotlight data-play="trip" class="w-[316px] shrink-0 @max-[36rem]:w-full">
        <CardHeader>
          <CardTitle>Ski week</CardTitle>
          <CardDescription>Les Arcs, 8 to 15 Feb</CardDescription>
          <CardAction>
            <span class="inline-flex h-5 items-center rounded-full bg-muted px-2 text-[11px] font-medium text-muted-foreground">In 23 days</span>
          </CardAction>
        </CardHeader>
        <CardContent class="grid grid-cols-2 gap-2">
          <div v-for="[label, value] in stats" :key="label" class="rounded-[10px] bg-muted/70 px-3 py-2.5">
            <div class="text-[11px] font-medium text-muted-foreground">{{ label }}</div>
            <div class="mt-1 text-[15px] font-semibold tracking-tight tabular-nums">{{ value }}</div>
          </div>
        </CardContent>
        <CardFooter class="justify-between">
          <span class="text-[12px] text-muted-foreground">Jo paid the chalet</span>
          <button type="button" :class="key">Itinerary</button>
        </CardFooter>
      </Card>

      <div role="radiogroup" aria-label="Plan" class="flex flex-1 flex-col gap-3 @max-[36rem]:w-full">
        <Card
          v-for="p in plans"
          :key="p.id"
          interactive
          role="radio"
          :aria-checked="plan === p.id"
          :tabindex="plan === p.id ? 0 : -1"
          :data-play="`plan-${p.id}`"
          :data-pressed="pressed === p.id || undefined"
          :class="plan === p.id ? checkedClass : 'gap-3 py-4'"
          @click="(e: MouseEvent) => { flash(p.id, e); plan = p.id }"
          @keydown="(e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); plan = p.id } }"
        >
          <CardHeader class="px-4">
            <CardTitle>{{ p.name }}</CardTitle>
            <CardDescription>{{ p.note }}</CardDescription>
            <CardAction>
              <span
                aria-hidden="true"
                :class="'grid size-[18px] place-items-center rounded-full transition-[background-color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none ' + (plan === p.id ? 'bg-primary text-primary-foreground' : 'shadow-[inset_0_0_0_1.5px_var(--input)]')"
              >
                <svg
                  viewBox="0 0 16 16"
                  :class="'size-3 transition-[scale,opacity] duration-[calc(300ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none ' + (plan === p.id ? 'scale-100 opacity-100' : 'scale-[0.6] opacity-0')"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3.5 8.5l3 3 6-7" />
                </svg>
              </span>
            </CardAction>
          </CardHeader>
          <CardContent class="flex items-baseline justify-between px-4">
            <span>
              <span class="text-[22px] font-semibold tracking-tight tabular-nums">{{ p.price }}</span>
              <span class="ml-1 text-muted-foreground">a month</span>
            </span>
            <span class="text-[12px] text-muted-foreground">{{ p.seats }}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
