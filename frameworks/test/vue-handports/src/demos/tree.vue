<script setup lang="ts">
/* Mirrors src/demos/tree.tsx at its defaults. */
import { ref } from "vue"
import { Tree } from "@kf/tree"
import Albums, { type Album } from "./parts/Albums.vue"

const library: Album[] = [
  { value: "favourites", label: "Favourites", count: 48 },
  { value: "2026", label: "2026", count: 707, children: [
    { value: "lisbon", label: "Ski week", count: 268, children: [
      { value: "lisbon/arrival", label: "Arrival day", count: 84 },
      { value: "lisbon/slopes", label: "On the slopes", count: 126 },
      { value: "lisbon/dinner", label: "Team dinner", count: 58 },
    ] },
    { value: "kyoto", label: "Mum's 60th", count: 342, children: [
      { value: "kyoto/temples", label: "Temples", count: 190 },
      { value: "kyoto/market", label: "Nishiki market", count: 152 },
    ] },
    { value: "garden", label: "Garden", count: 97 },
  ] },
  { value: "2025", label: "2025", count: 986, children: [
    { value: "iceland", label: "Iceland road trip", count: 412 },
    { value: "wedding", label: "Maya’s wedding", count: 318 },
    { value: "flat", label: "The new flat", count: 256 },
  ] },
]
const theme = { "--tree-height": "28px", "--tree-radius": "8px", "--tree-indent": "22px" }
const checked = ref<string[]>([])
</script>

<template>
  <div :style="{ ...theme, maxWidth: '300px' }" class="h-[464px] w-full">
    <div class="rounded-[14px] bg-card p-2 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-baseline justify-between px-2 pt-2 pb-2.5">
        <h3 class="text-[15px] font-semibold tracking-tight">Photos</h3>
        <span class="text-[12px] text-muted-foreground tabular-nums">1,693 items</span>
      </div>
      <Tree mode="single" activation="manual" :checkable="false" :checked="checked" @checked-change="(v: any) => (checked = v)" check-strategy="leaf"
        :expand-on-press="true" :disabled="false" :focusable-when-disabled="true" :keep-mounted="false" :hidden-until-found="false" :current="null"
        aria-label="Photo library" :default-expanded="['2026', 'lisbon']" default-value="lisbon/slopes">
        <Albums :albums="library" :checkable="false" />
      </Tree>
    </div>
  </div>
</template>
