<script setup lang="ts">
/* Mirrors src/demos/empty.tsx at its default controls (icon media, announce). */
import { computed, ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/keyframery/empty"

const recipes = [
  { id: "buns", name: "Cardamom morning buns", meta: "1 hr 20 · makes 12", photo: "/demo/food-1.jpg", tags: "cardamom butter flour" },
  { id: "fool", name: "Raspberry fool", meta: "15 min · serves 4", photo: "/demo/food-2.jpg", tags: "raspberry cream sugar" },
  { id: "onions", name: "Quick-pickled red onions", meta: "10 min · one jar", photo: "/demo/food-3.jpg", tags: "onion vinegar peppercorn" },
]
const query = ref("")
const found = computed(() => {
  const q = query.value.trim().toLowerCase()
  return recipes.filter((r) => !q || `${r.name} ${r.tags}`.toLowerCase().includes(q))
})
</script>

<template>
  <div class="@container w-full max-w-[420px]">
    <div class="flex h-[400px] flex-col rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="px-3 pt-3 pb-2 text-[15px] font-semibold tracking-tight">Saved recipes</div>
      <label class="mx-1 flex h-9 items-center gap-2 rounded-[10px] bg-background px-3 text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] transition-shadow duration-[calc(150ms*var(--kf-speed,1))] ease-house focus-within:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklch,var(--ring)_25%,transparent)] motion-reduce:transition-none dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" class="size-4">
          <circle cx="7.25" cy="7.25" r="4.25" />
          <path d="m10.5 10.5 3 3" />
        </svg>
        <input
          v-model="query"
          data-play="search"
          placeholder="Search 48 recipes"
          aria-label="Search recipes"
          class="h-full min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <ul v-if="found.length" class="mt-2">
        <li v-for="r in found" :key="r.id" class="flex items-center gap-3 rounded-[12px] px-3 py-2.5">
          <img :src="r.photo" alt="" class="size-11 shrink-0 rounded-[10px] object-cover" />
          <div class="min-w-0">
            <div class="truncate text-[13px] leading-tight font-medium">{{ r.name }}</div>
            <div class="mt-1 text-[12px] leading-tight text-muted-foreground">{{ r.meta }}</div>
          </div>
        </li>
      </ul>
      <Empty v-else announce class="p-[var(--empty-padding,1.5rem)]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cooking-pot" aria-hidden="true">
              <path d="M2 12h20" />
              <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
              <path d="m4 8 16-4" />
              <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
            </svg>
          </EmptyMedia>
          <EmptyTitle>No recipes with “{{ query.trim() }}”</EmptyTitle>
          <EmptyDescription>None of your 48 saved recipes use it yet. Try the paella from Casa Rufino's book.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" data-play="clear" @click="query = ''">Clear search</Button>
          <Button size="sm" variant="primary">Browse cookbooks</Button>
        </EmptyContent>
      </Empty>
    </div>
  </div>
</template>
