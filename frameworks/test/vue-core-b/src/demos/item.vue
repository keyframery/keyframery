<script setup lang="ts">
/* Mirrors src/demos/item.tsx with its default controls (variant default, size default, media image). */
import { ref } from "vue"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/keyframery/item"

const lab = "http://localhost:4610"
const box = [
  { id: "raspberries", title: "Raspberries", note: "Wye Valley, 250 g punnet", price: "£3.40", photo: "/demo/food-2.jpg" },
  { id: "grapes", title: "Red grapes", note: "Last of the season, 500 g", price: "£2.90", photo: "/demo/food-4.jpg" },
  { id: "garlic", title: "Smoked garlic", note: "Two bulbs, with Tellicherry pepper", price: "£4.10", photo: "/demo/food-3.jpg" },
  { id: "tea", title: "Assam, second flush", note: "Loose leaf, 100 g tin", price: "£6.50", photo: "/demo/food-5.jpg" },
]
const addons = [
  { id: "beans", title: "House espresso", note: "Whole beans, roasted Monday", price: "£7.80", photo: "/demo/food-1.jpg" },
  { id: "extra", title: "Second punnet", note: "Raspberries, picked Wednesday", price: "£3.40", photo: "/demo/food-6.jpg" },
]
const tabs = [
  { id: "box", label: "In the box" },
  { id: "addons", label: "Add-ons" },
] as const
const tab = ref<"box" | "addons">("box")
</script>

<template>
  <div data-demo="item" class="@container w-full max-w-[420px]">
    <div class="rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-end justify-between gap-3 px-3.5 pt-3 pb-2.5 @max-[26rem]:flex-col @max-[26rem]:items-start">
        <div class="min-w-0">
          <div class="text-[15px] font-semibold tracking-tight">Thursday's market box</div>
          <div class="mt-1 text-[12px] text-muted-foreground">Delivered 21 Nov, 7 to 9am</div>
        </div>
        <div class="flex shrink-0 gap-0.5 rounded-[10px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5)]">
          <button
            v-for="t in tabs"
            :key="t.id"
            type="button"
            :data-tab="t.id"
            :aria-pressed="tab === t.id"
            class="h-7 cursor-pointer rounded-[8px] px-2.5 text-[12px] font-medium text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.08)] dark:aria-pressed:bg-accent motion-reduce:transition-none @max-[22rem]:px-2"
            @click="tab = t.id"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <ItemGroup :key="tab" :aria-label="tab === 'box' ? 'In the box' : 'Add-ons'">
        <template v-for="(row, i) in tab === 'box' ? box : addons" :key="row.id">
          <ItemSeparator v-if="i > 0" />
          <Item :data-row="row.id" variant="default" size="default">
            <template #render="{ props, children }">
              <button type="button" v-bind="props"><component :is="children" /></button>
            </template>
            <ItemMedia variant="image"><img :src="lab + row.photo" alt="" /></ItemMedia>
            <ItemContent>
              <ItemTitle>{{ row.title }}</ItemTitle>
              <ItemDescription class="@max-[22rem]:line-clamp-1">{{ row.note }}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <span class="text-[13px] font-medium tabular-nums">{{ row.price }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right @max-[22rem]:hidden" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </ItemActions>
          </Item>
        </template>
      </ItemGroup>
    </div>
  </div>
</template>
