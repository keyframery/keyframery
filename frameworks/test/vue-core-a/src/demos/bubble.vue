<script setup lang="ts">
/* Mirrors src/demos/bubble.tsx at its default controls (muted, reactions, bottom). */
import { computed, onBeforeUnmount, ref } from "vue"

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/keyframery/bubble"

const replies = [
  { id: "tarte", text: "Shallot tarte tatin, please" },
  { id: "salad", text: "The beetroot salad" },
]
const picked = ref<string | null>(null)
const answered = ref(false)
const hearted = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))
const pick = (id: string, el: HTMLElement) => {
  const speed = parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed")) || 1
  picked.value = id
  timers.push(setTimeout(() => (answered.value = true), 1100 * speed))
  timers.push(setTimeout(() => (hearted.value = true), 2000 * speed))
}
const reset = () => {
  timers.forEach(clearTimeout)
  timers = []
  picked.value = null
  answered.value = false
  hearted.value = false
}
const reply = computed(() => replies.find((r) => r.id === picked.value))
</script>

<template>
  <div class="@container w-full max-w-[400px]">
    <div class="rounded-[20px] bg-background dark:[--bubble-cutout:var(--card)] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <header class="flex items-baseline justify-between gap-3 border-b border-foreground/[0.06] px-4 py-3">
        <p class="text-[14px] font-semibold tracking-tight">Inès Moreau, private chef</p>
        <p class="shrink-0 text-[12px] text-muted-foreground tabular-nums">Dinner for 8 · Sat</p>
      </header>

      <div class="flex h-[360px] flex-col [justify-content:safe_flex-end] gap-4 overflow-y-auto [scrollbar-width:thin] *:shrink-0 px-4 @max-[26rem]:h-[320px] pt-5 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_20px)]">
        <Bubble variant="muted"><BubbleContent>Hello! I'm putting Saturday's menu together. How many of you, and any diets?</BubbleContent></Bubble>
        <Bubble align="end" variant="default"><BubbleContent>We're 8, and Clara is vegetarian.</BubbleContent></Bubble>
        <BubbleGroup>
          <Bubble variant="muted"><BubbleContent>The shallots from Thursday's market are lovely.</BubbleContent></Bubble>
          <Bubble variant="muted"><BubbleContent>To start: shallot tarte tatin, or beetroot salad with whipped feta?</BubbleContent></Bubble>
        </BubbleGroup>

        <Bubble v-if="reply" align="end" variant="default" :class="hearted ? 'mb-3' : undefined">
          <BubbleContent>{{ reply.text }}</BubbleContent>
          <BubbleReactions v-if="hearted" side="bottom" align="start" aria-label="Inès loved this">❤️</BubbleReactions>
        </Bubble>

        <Bubble v-if="answered" variant="muted"><BubbleContent>Perfect. I'll bring it warm at 7, with crème fraîche.</BubbleContent></Bubble>
      </div>

      <div
        aria-label="Quick replies"
        role="group"
        class="flex flex-wrap justify-end gap-2 border-t border-foreground/[0.06] px-4 py-3 transition-opacity duration-[calc(200ms*var(--kf-speed,1))] ease-house aria-disabled:opacity-40 motion-reduce:transition-none"
        :aria-disabled="picked ? true : undefined"
      >
        <Bubble v-for="r in replies" :key="r.id" variant="outline" align="end" class="max-w-full">
          <BubbleContent class="py-1.5 text-[13px] font-medium disabled:cursor-default">
            <template #render="{ props: p, children }">
              <button v-bind="p" type="button" :data-reply="r.id" :disabled="!!picked" @click="(e: MouseEvent) => pick(r.id, e.currentTarget as HTMLElement)"><component :is="children" /></button>
            </template>
            {{ r.text }}
          </BubbleContent>
        </Bubble>
      </div>
      <button type="button" hidden data-play="reset" @click="reset" />
    </div>
  </div>
</template>
