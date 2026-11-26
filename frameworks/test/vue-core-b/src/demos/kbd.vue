<script setup lang="ts">
/* Mirrors src/demos/kbd.tsx (default controls) and src/examples/kbd/usage.tsx. */
import { onBeforeUnmount, reactive } from "vue"
import { Kbd, KbdCombo } from "@/components/keyframery/kbd"

const shortcuts = [
  { id: "search", label: "Search", keys: ["mod", "k"] },
  { id: "palette", label: "Command palette", keys: ["mod", "shift", "p"] },
  { id: "new", label: "New note", keys: ["mod", "alt", "n"] },
  { id: "close", label: "Close", keys: ["escape"] },
]
const pressed = reactive<Record<string, boolean>>({})
const timers: Record<string, ReturnType<typeof setTimeout>> = {}
onBeforeUnmount(() => Object.values(timers).forEach(clearTimeout))
function press(e: MouseEvent, id: string, n: number) {
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  clearTimeout(timers[id])
  pressed[id] = true
  timers[id] = setTimeout(() => (pressed[id] = false), (520 + n * 70) * speed)
}
</script>

<template>
  <div data-demo="kbd" class="w-full max-w-[340px]">
    <div
      style="--kbd-size: 24px; --kbd-radius: 6px; --kbd-font: 12px"
      class="w-full max-w-[340px] rounded-[16px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <div class="px-3 pt-2 pb-1.5 text-[11px] font-medium text-muted-foreground">Keyboard shortcuts</div>
      <ul>
        <li v-for="s in shortcuts" :key="s.id">
          <button
            type="button"
            :data-shortcut="s.id"
            class="flex h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-[10px] px-3 text-left text-[13px] font-medium outline-none transition-[background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            @click="press($event, s.id, s.keys.length)"
          >
            {{ s.label }}
            <KbdCombo :keys="s.keys" :pressed="!!pressed[s.id]" :listen="true" :style="{ gap: '4px' }" />
          </button>
        </li>
      </ul>
    </div>
  </div>
  <div data-usage class="flex gap-2"><Kbd>Esc</Kbd><KbdCombo :keys="['mod', 'k']" /></div>
</template>
