<script setup lang="ts">
/* Mirrors src/demos/message-scroller.tsx (default controls). */
import { ref } from "vue"
import { Attachment, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle } from "@/components/keyframery/attachment"
import { Bubble, BubbleContent } from "@/components/keyframery/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/keyframery/message"
import {
  createScrollAreaController,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/keyframery/message-scroller"

const L = "http://localhost:4610"
type Photo = { src: string; name: string; size: string }
type Turn = { id: string; from: "host" | "guest"; lines: string[]; photos?: Photo[]; footer?: string }
const history: Turn[] = [
  { id: "t1", from: "guest", lines: ["Hi Ana! Booked for 12 to 16 May. Is there parking at the cottage?"] },
  { id: "t2", from: "host", lines: ["Welcome! Yes, two spaces behind the gate.", "From the N268, take the dirt road after the windmill. It's 600 m, slow and bumpy but fine for any car."] },
  { id: "t3", from: "guest", lines: ["Great. Is there a supermarket nearby?"] },
  { id: "t4", from: "host", lines: ["Intermarché in Sagres, 8 minutes. Closes at 9pm.", "The fish market at the harbour is better before 10am."] },
  { id: "t5", from: "guest", lines: ["Noted. Can we check in a little early?"], footer: "Read 09:12" },
]
const incoming: Turn[] = [
  {
    id: "t6",
    from: "host",
    lines: ["Early check-in is fine, the cleaners finish at 1. This was the deck this morning:"],
    photos: [
      { src: L + "/demo/coast-2.jpg", name: "deck.jpg", size: "2.1 MB" },
      { src: L + "/demo/lake.jpg", name: "cove-path.jpg", size: "1.8 MB" },
    ],
  },
  { id: "t7", from: "host", lines: ["Key box is left of the blue door. Code 4471."] },
]
const field =
  "h-9 min-w-0 flex-1 rounded-full bg-background px-3.5 text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklab,var(--ring)_25%,transparent)] motion-reduce:transition-none"

const controller = createScrollAreaController()
const turns = ref<Turn[]>(history)
const draft = ref("")
let next = 0
let sent = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  turns.value = [...turns.value, { id: `me-${++sent}`, from: "guest", lines: [text], footer: "Sent" }]
  draft.value = ""
}
function arrive() {
  const turn = incoming[next]
  if (!turn) return
  next += 1
  turns.value = [...turns.value, turn]
}
function reset() {
  next = 0
  turns.value = history
  draft.value = ""
  requestAnimationFrame(() => controller.scrollToEnd({ behavior: "instant" }))
}
const svg = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const
</script>

<template>
  <div data-demo="message-scroller" class="@container w-full max-w-[420px]">
    <div class="flex h-[480px] flex-col overflow-hidden rounded-[20px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] @max-[26rem]:h-[460px] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <header class="flex items-center gap-3 border-b border-foreground/[0.06] px-4 py-3">
        <img :src="L + '/demo/face-1.jpg'" alt="" class="size-9 rounded-full object-cover" />
        <div class="min-w-0">
          <p class="text-[14px] leading-tight font-semibold tracking-tight">Ana Ferreira</p>
          <p class="truncate text-[12px] text-muted-foreground">Host · Cliff cottage, Sagres · 12–16 May</p>
        </div>
      </header>

      <MessageScroller :controller="controller" :stick-to-end="true" class="flex-1">
        <MessageScrollerViewport aria-label="Conversation with Ana">
          <MessageScrollerContent>
            <MessageScrollerItem v-for="turn in turns" :key="turn.id" :value="turn.id" :follow="turn.from === 'guest'">
              <Message :align="turn.from === 'guest' ? 'end' : 'start'">
                <MessageAvatar v-if="turn.from !== 'guest'"><img :src="L + '/demo/face-1.jpg'" alt="Ana" /></MessageAvatar>
                <MessageContent>
                  <Bubble v-for="line in turn.lines" :key="line" :variant="turn.from === 'guest' ? 'default' : 'muted'" :align="turn.from === 'guest' ? 'end' : 'start'">
                    <BubbleContent>{{ line }}</BubbleContent>
                  </Bubble>
                  <AttachmentGroup v-if="turn.photos" class="-mx-1 max-w-full">
                    <Attachment v-for="photo in turn.photos" :key="photo.name" orientation="vertical" class="w-36 @max-[26rem]:w-30">
                      <AttachmentMedia variant="image" class="aspect-[4/3]"><img :src="photo.src" alt="" /></AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{{ photo.name }}</AttachmentTitle>
                        <AttachmentDescription>{{ photo.size }}</AttachmentDescription>
                      </AttachmentContent>
                    </Attachment>
                  </AttachmentGroup>
                  <MessageFooter v-if="turn.footer">{{ turn.footer }}</MessageFooter>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>

      <form class="flex items-center gap-2 border-t border-foreground/[0.06] p-3" @submit.prevent="send">
        <input v-model="draft" data-play="composer" aria-label="Message Ana" placeholder="Message Ana" :class="field" />
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

      <button type="button" hidden data-play="reread" @click="controller.scrollToStart({ behavior: 'smooth' })" />
      <button type="button" hidden data-play="incoming" @click="arrive" />
      <button type="button" hidden data-play="reset" @click="reset" />
    </div>
  </div>
</template>
