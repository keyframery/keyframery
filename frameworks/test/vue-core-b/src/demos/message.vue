<script setup lang="ts">
/* Mirrors src/demos/message.tsx (default controls). */
import { onBeforeUnmount, ref } from "vue"
import { Bubble, BubbleContent } from "@/components/keyframery/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/keyframery/message"

type Post = { id: string; who: "maya" | "theo" | "priya" | "you"; time: string; lines: string[]; footer?: boolean }
const L = "http://localhost:4610"
const people = {
  maya: { name: "Maya Lindqvist", photo: L + "/demo/face-3.jpg" },
  theo: { name: "Theo Okafor", photo: L + "/demo/face-4.jpg" },
  priya: { name: "Priya Raman", photo: L + "/demo/face-2.jpg" },
  you: { name: "You", photo: "" },
}
const start: Post[] = [
  { id: "p0", who: "priya", time: "6:51", lines: ["Forecast says dry until 3pm, then showers."] },
  { id: "p1", who: "maya", time: "7:02", lines: ["Trailhead car park fills by 8.", "Meet at 7:40 by the ranger hut?"] },
  { id: "p2", who: "theo", time: "7:05", lines: ["I'll bring the spare poles and the stove."] },
]
const draftText = "I can drive three from Elm Street."
const answer: Post = { id: "p4", who: "maya", time: "7:09", lines: ["Perfect, save me a seat. Bring a layer, it's 4° at the top."] }
const posts = ref(start)
const draft = ref(draftText)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))
function send(e: Event) {
  if (!draft.value.trim()) return
  const speed = parseFloat(getComputedStyle(e.currentTarget as Element).getPropertyValue("--kf-speed")) || 1
  posts.value = [...posts.value, { id: `you-${posts.value.length}`, who: "you", time: "7:08", lines: [draft.value.trim()], footer: true }]
  draft.value = ""
  clearTimeout(timer)
  timer = setTimeout(() => (posts.value = [...posts.value, answer]), 1500 * speed)
}
function reset() {
  clearTimeout(timer)
  posts.value = start
  draft.value = draftText
}
const svg = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const
</script>

<template>
  <div data-demo="message" class="@container w-full max-w-[440px]">
    <div class="overflow-hidden rounded-[20px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <header class="flex items-center justify-between gap-3 border-b border-foreground/[0.06] px-4 py-3">
        <div class="min-w-0">
          <p class="text-[14px] font-semibold tracking-tight">Saturday: Ridge loop</p>
          <p class="truncate text-[12px] text-muted-foreground">14 km · 820 m up · 6 going</p>
        </div>
        <div class="flex shrink-0 -space-x-2">
          <img v-for="src in [people.maya.photo, people.theo.photo, L + '/demo/face-2.jpg']" :key="src" :src="src" alt="" class="size-7 rounded-full object-cover ring-2 ring-background dark:ring-card" />
        </div>
      </header>

      <MessageGroup class="h-[380px] justify-end overflow-hidden px-4 pt-4 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_48px)] @max-[26rem]:h-[340px]">
        <Message v-for="post in posts" :key="post.id" :align="post.who === 'you' ? 'end' : 'start'">
          <MessageAvatar v-if="post.who !== 'you'"><img :src="people[post.who].photo" alt="" /></MessageAvatar>
          <MessageContent>
            <MessageHeader v-if="post.who !== 'you'">{{ people[post.who].name }}<time>{{ post.time }}</time></MessageHeader>
            <Bubble v-for="line in post.lines" :key="line" :variant="post.who === 'you' ? 'default' : 'muted'" :align="post.who === 'you' ? 'end' : 'start'">
              <BubbleContent>{{ line }}</BubbleContent>
            </Bubble>
            <MessageFooter v-if="post.footer">
              <svg v-bind="svg" class="lucide lucide-check-check"><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></svg> {{ post.time }} · Seen by Maya, Theo
            </MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>

      <form class="flex items-center gap-2 border-t border-foreground/[0.06] p-3" @submit.prevent="send">
        <input
          v-model="draft"
          aria-label="Message the group"
          placeholder="Message the group"
          class="h-9 min-w-0 flex-1 rounded-full bg-background px-3.5 text-[13.5px] outline-none placeholder:text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklab,var(--ring)_25%,transparent)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]"
        />
        <button
          type="submit"
          data-play="send"
          aria-label="Send"
          :disabled="!draft.trim()"
          class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] outline-none transition-[scale,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.92] disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none"
        >
          <svg v-bind="svg" class="lucide lucide-arrow-up size-4"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
        </button>
      </form>
      <button type="button" hidden data-play="reset" @click="reset" />
    </div>
  </div>
</template>
