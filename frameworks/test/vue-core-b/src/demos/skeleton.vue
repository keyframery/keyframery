<script setup lang="ts">
/* Mirrors src/demos/skeleton.tsx with its default controls. */
import { onBeforeUnmount, onMounted, ref } from "vue"
import { Skeleton, SkeletonSwap } from "@/components/keyframery/skeleton"

const key =
  "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"
const primaryKey =
  "inline-flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[9px] bg-primary px-3 text-[13px] leading-none font-medium text-primary-foreground outline-none select-none shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
const stats = [
  { label: "Trips", value: "24" },
  { label: "Countries", value: "11" },
  { label: "Followers", value: "1,208" },
]
const loading = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined
function reload() {
  loading.value = true
  clearTimeout(timer)
  const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kf-speed")) || 1
  timer = setTimeout(() => (loading.value = false), 1700 * speed)
}
onMounted(reload)
onBeforeUnmount(() => clearTimeout(timer))
const cols = { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }
</script>

<template>
  <div
    data-demo="skeleton"
    style="--skeleton-radius: 8px; --skeleton-demo-gap: 16px; max-width: 360px"
    class="w-full rounded-[16px] bg-card p-5 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]"
  >
    <div class="mb-4 flex items-center justify-between">
      <span class="text-[12px] font-medium text-muted-foreground">Traveller profile</span>
      <button type="button" data-play="reload" :class="key" :disabled="loading" @click="reload">
        <svg viewBox="0 0 16 16" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" />
        </svg>
        Reload
      </button>
    </div>
    <SkeletonSwap :loading="loading" content-class-name="space-y-[var(--skeleton-demo-gap)]">
      <template #fallback>
        <div class="space-y-[var(--skeleton-demo-gap)]">
          <div class="flex items-center gap-3">
            <Skeleton :shimmer="true" :style="{ width: '48px', height: '48px' }" class="rounded-full" />
            <div class="flex-1 space-y-2">
              <Skeleton :shimmer="true" class="h-3.5 w-32" />
              <Skeleton :shimmer="true" class="h-3 w-20" />
            </div>
          </div>
          <div class="space-y-2 py-0.5">
            <Skeleton :shimmer="true" class="h-3 w-full" />
            <Skeleton :shimmer="true" class="h-3 w-4/5" />
          </div>
          <div :style="cols" class="grid gap-2">
            <Skeleton v-for="s in stats" :key="s.label" :shimmer="true" class="h-[54px] rounded-[10px]" />
          </div>
          <Skeleton :shimmer="true" class="h-8 rounded-[9px]" />
        </div>
      </template>
      <div class="flex items-center gap-3">
        <span style="width: 48px; height: 48px" class="grid place-items-center rounded-full bg-muted text-[14px] font-semibold text-muted-foreground">AS</span>
        <div class="min-w-0">
          <div class="text-[15px] leading-5 font-semibold tracking-tight">Joe Ramsey</div>
          <div class="text-[12px] leading-4 text-muted-foreground">@joeramsey, Leeds</div>
        </div>
      </div>
      <p class="text-[13px] leading-5 text-muted-foreground">Slow trains, small hotels and the best noodles in every city. Sicily next, if the ferries run.</p>
      <div :style="cols" class="grid gap-2">
        <div v-for="s in stats" :key="s.label" class="rounded-[10px] bg-muted/70 px-3 py-2.5">
          <div class="text-[11px] font-medium text-muted-foreground">{{ s.label }}</div>
          <div class="mt-1 text-[15px] leading-5 font-semibold tracking-tight tabular-nums">{{ s.value }}</div>
        </div>
      </div>
      <div class="flex gap-2"><button type="button" :class="primaryKey">Follow</button></div>
    </SkeletonSwap>
  </div>
</template>
