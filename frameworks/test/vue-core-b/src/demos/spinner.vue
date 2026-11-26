<script setup lang="ts">
/* Mirrors src/demos/spinner.tsx (default controls). */
import { computed, onBeforeUnmount, ref } from "vue"
import { Button } from "@/components/keyframery/button"
import { Spinner } from "@/components/keyframery/spinner"

const albums = [
  { id: "lisbon", name: "Bruges, November", count: "214 photos", photo: "http://localhost:4610/demo/canal.jpg" },
  { id: "coast", name: "Cornish coast walk", count: "86 photos", photo: "http://localhost:4610/demo/coast-3.jpg" },
  { id: "supper", name: "Harvest in the Douro", count: "41 photos", photo: "http://localhost:4610/demo/food-4.jpg" },
]
type Status = "waiting" | "uploading" | "done"
const status = ref<Record<string, Status>>({})
let timers: ReturnType<typeof setTimeout>[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))
const busy = computed(() => Object.values(status.value).some((s) => s !== "done"))
function backUp(e: MouseEvent) {
  if (busy.value) return
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  timers.forEach(clearTimeout)
  status.value = Object.fromEntries(albums.map((a) => [a.id, "waiting" as Status]))
  albums.forEach((album, i) => {
    timers.push(setTimeout(() => (status.value = { ...status.value, [album.id]: "uploading" }), (250 + i * 650) * speed))
    timers.push(setTimeout(() => (status.value = { ...status.value, [album.id]: "done" }), (1700 + i * 900) * speed))
  })
}
</script>

<template>
  <div data-demo="spinner" class="@container w-full max-w-[400px]">
    <div class="rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
        <div class="min-w-0">
          <div class="text-[15px] font-semibold tracking-tight">Back up albums</div>
          <div class="mt-1 text-[12px] text-muted-foreground">To your Mac mini at home</div>
        </div>
        <Button variant="primary" size="sm" data-play="backup" :aria-busy="busy || undefined" class="gap-2" @click="backUp">
          <Spinner v-if="busy" variant="ring" size="sm" label="Backing up" />
          {{ busy ? "Backing up" : "Back up now" }}
        </Button>
      </div>
      <ul class="mt-1">
        <li v-for="album in albums" :key="album.id" class="flex items-center gap-3 rounded-[12px] px-3 py-2.5">
          <img :src="album.photo" alt="" class="size-10 shrink-0 rounded-[9px] object-cover" />
          <div class="min-w-0 flex-1">
            <div class="truncate text-[13px] leading-tight font-medium">{{ album.name }}</div>
            <div class="mt-1 text-[12px] leading-tight text-muted-foreground tabular-nums">
              {{ status[album.id] === "uploading" ? "Uploading…" : status[album.id] === "done" ? "Backed up just now" : album.count }}
            </div>
          </div>
          <span class="grid size-6 shrink-0 place-items-center text-muted-foreground">
            <Spinner v-if="status[album.id] === 'uploading'" variant="ring" size="md" :label="`Uploading ${album.name}`" />
            <span v-if="status[album.id] === 'done'" class="text-[oklch(0.62_0.16_150)] animate-[kf-spinner-in_calc(420ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4"><path d="M3.5 8.5l3 3 6-7" /></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
