<script setup lang="ts">
/* Mirrors src/demos/marker.tsx (default controls). */
import { onBeforeUnmount, ref } from "vue"
import { Marker, MarkerContent, MarkerIcon } from "@/components/keyframery/marker"

type Stage = "idle" | "checking" | "moved"
const stage = ref<Stage>("idle")
const root = ref<HTMLDivElement>()
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
const speedOf = (el?: Element) => (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
function send() {
  clearTimeout(timer)
  stage.value = "checking"
  timer = setTimeout(() => (stage.value = "moved"), 2200 * speedOf(root.value))
}
function undo(e: MouseEvent) {
  e.preventDefault()
  clearTimeout(timer)
  stage.value = "idle"
}
const svg = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const
const them = "flex items-end gap-2 animate-[kf-marker-in_calc(480ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"
const themP = "max-w-[78%] rounded-[16px] rounded-bl-[6px] bg-muted px-3 py-2 text-[13px] leading-[1.4]"
const me = "flex justify-end animate-[kf-marker-in_calc(480ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"
const meP = "max-w-[78%] rounded-[16px] rounded-br-[6px] bg-primary px-3 py-2 text-[13px] leading-[1.4] text-primary-foreground"
</script>

<template>
  <div ref="root" data-demo="marker" class="@container w-full max-w-[400px]">
    <div class="overflow-hidden rounded-[18px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <img src="http://localhost:4610/demo/face-1.jpg" alt="" class="size-8 rounded-full bg-muted object-cover" />
        <div class="min-w-0">
          <div class="text-[13.5px] leading-tight font-semibold">Kemi at Oakwright</div>
          <div class="mt-0.5 truncate text-[12px] text-muted-foreground">Order 4471, oak dining table</div>
        </div>
      </div>
      <div class="flex min-h-[318px] flex-col gap-3 px-4 py-4 @max-[22rem]:px-3">
        <Marker variant="separator"><MarkerContent>Tuesday</MarkerContent></Marker>
        <div :class="them"><img src="http://localhost:4610/demo/face-1.jpg" alt="" class="size-6 shrink-0 rounded-full bg-muted object-cover" /><p :class="themP">Your table left the Leeds workshop this morning.</p></div>
        <Marker variant="default">
          <MarkerIcon>
            <svg v-bind="svg" class="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
          </MarkerIcon>
          <MarkerContent>Out for delivery, arriving 1 to 3pm</MarkerContent>
        </Marker>
        <Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker>
        <div v-if="stage !== 'idle'" :class="me"><p :class="meP">Could they come after 3? I'm out until then.</p></div>
        <Marker v-if="stage !== 'idle'" variant="default" live :pending="stage === 'checking'">
          <MarkerIcon :key="stage">
            <svg v-if="stage === 'checking'" v-bind="svg" class="lucide lucide-clock"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            <svg v-else v-bind="svg" class="lucide lucide-check text-[oklch(0.62_0.16_150)]"><path d="M20 6 9 17l-5-5" /></svg>
          </MarkerIcon>
          <MarkerContent>
            <template v-if="stage === 'checking'">Kemi is checking the driver's route</template>
            <template v-else>Delivery moved to 3 to 5pm. <a href="#undo" data-play="undo" @click="undo">Undo</a></template>
          </MarkerContent>
        </Marker>
        <div v-if="stage === 'moved'" :class="them"><img src="http://localhost:4610/demo/face-1.jpg" alt="" class="size-6 shrink-0 rounded-full bg-muted object-cover" /><p :class="themP">Done. Marcus will ring when he's ten minutes away.</p></div>
      </div>
      <div class="flex items-center gap-2 border-t border-border px-3 py-2.5">
        <button
          type="button"
          data-play="send"
          :disabled="stage !== 'idle'"
          class="h-8 min-w-0 cursor-pointer truncate rounded-full bg-muted px-3 text-[12.5px] font-medium text-foreground outline-none transition-[scale,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none"
          @click="send"
        >
          Ask to come after 3pm
        </button>
        <span class="ms-auto shrink-0 text-[12px] text-muted-foreground @max-[22rem]:hidden">Suggested reply</span>
      </div>
    </div>
  </div>
</template>
