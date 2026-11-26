<script setup lang="ts">
/* Mirrors src/demos/prompt-composer.tsx with its default controls. */
import { h, onBeforeUnmount, ref } from "vue"
import { Button } from "@/components/keyframery/button"
import {
  createPromptComposerMenuController,
  PromptComposer,
  type PromptComposerItem,
  type PromptComposerStatus,
  type PromptComposerSubmit,
} from "@/components/keyframery/prompt-composer"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/keyframery/tooltip"
import { chainRefs, withoutRef } from "@/components/keyframery/prompt-composer/parts"
import { AtSign, ListChecks, Package, PenLine, RotateCcw, Truck, UserRound } from "./lucide-prompt"

const icon = (Glyph: any) => h(Glyph, { strokeWidth: 1.75 })
const mentions: PromptComposerItem[] = [
  { value: "4821", label: "Order #4821", description: "Shipped", group: "Orders", icon: icon(Package), keywords: ["4821", "amara"] },
  { value: "4819", label: "Order #4819", description: "Packing", group: "Orders", icon: icon(Package), keywords: ["4819", "theo"] },
  { value: "4807", label: "Order #4807", description: "Refunded", group: "Orders", icon: icon(Package), keywords: ["4807"] },
  { value: "amara", label: "Amara Okafor", description: "3 orders", group: "Customers", icon: icon(UserRound) },
  { value: "theo", label: "Theo Lindqvist", description: "1 order", group: "Customers", icon: icon(UserRound) },
]
const commands: PromptComposerItem[] = [
  { value: "track", label: "track", description: "Where a parcel is", icon: icon(Truck) },
  { value: "refund", label: "refund", description: "Start a refund", icon: icon(RotateCcw) },
  { value: "summarize", label: "summarize", description: "Today's orders", icon: icon(ListChecks) },
  { value: "draft-reply", label: "draft-reply", description: "Write to a customer", icon: icon(PenLine) },
]
const modelList = [
  { value: "fast", label: "Fast", description: "Quick lookups and short answers" },
  { value: "balanced", label: "Balanced", description: "Everyday questions about orders" },
  { value: "deep", label: "Thorough", description: "Slower; checks every order it names" },
]

function fakeUpload(_file: File, { onProgress, signal }: { onProgress: (percent: number) => void; signal: AbortSignal }) {
  const speed = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--kf-speed")) || 1
  return new Promise<void>((resolve, reject) => {
    const steps = [22, 48, 71, 100]
    const timers = steps.map((p, i) =>
      setTimeout(() => {
        onProgress(p)
        if (p === 100) resolve()
      }, (250 + i * 260) * speed),
    )
    signal.addEventListener("abort", () => {
      timers.forEach(clearTimeout)
      reject(signal.reason)
    })
  })
}

type Turn = { id: number; from: "you" | "assistant"; text: string; files?: { name: string; url?: string }[]; stopped?: boolean }
const opening: Turn[] = [
  { id: 1, from: "you", text: "/summarize today" },
  { id: 2, from: "assistant", text: "38 orders today, £2,914 in sales. Three are waiting on stock, and #4807 was refunded this morning." },
]
const answer =
  "That's the stoneware mug from Order #4821, delivered on Tuesday, so it's inside the 30-day window. I can send a replacement today with next-day delivery, or refund £18 to Amara's card. Which would you like?"

const turns = ref<Turn[]>(opening)
const status = ref<PromptComposerStatus>("ready")
const text = ref("")
const run = ref(0)
const menu = createPromptComposerMenuController()
const root = ref<HTMLDivElement>()
let timers: ReturnType<typeof setTimeout>[] = []
const clear = () => {
  timers.forEach(clearTimeout)
  timers = []
}
onBeforeUnmount(clear)
const speed = () => (root.value && parseFloat(getComputedStyle(root.value).getPropertyValue("--kf-speed"))) || 1

function submit(message: PromptComposerSubmit) {
  clear()
  const s = speed()
  const reply = Date.now()
  turns.value = [...turns.value.slice(-2), { id: reply - 1, from: "you", text: message.text, files: message.attachments.map((f) => ({ name: f.name, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined })) }]
  status.value = "submitted"
  const words = answer.split(" ")
  timers.push(
    setTimeout(() => {
      status.value = "streaming"
      turns.value = [...turns.value, { id: reply, from: "assistant", text: "" }]
      words.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            turns.value = turns.value.map((t) => (t.id === reply ? { ...t, text: words.slice(0, i + 1).join(" ") } : t))
            if (i === words.length - 1) status.value = "ready"
          }, i * 85 * s),
        )
      })
    }, 900 * s),
  )
}
function stop() {
  clear()
  status.value = "ready"
  turns.value = turns.value.map((t, i) => (i === turns.value.length - 1 && t.from === "assistant" ? { ...t, stopped: true } : t))
}
async function dropSlip() {
  const box = root.value?.querySelector('[data-composer-part="box"]')
  if (!box) return
  const blob = await fetch("http://localhost:4610/demo/cup.jpg").then((r) => r.blob())
  const transfer = new DataTransfer()
  transfer.items.add(new File([blob], "chipped-mug.jpg", { type: "image/jpeg" }))
  for (const type of ["dragenter", "dragover", "drop"]) box.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }))
}
function reset() {
  clear()
  status.value = "ready"
  text.value = ""
  turns.value = opening
  run.value++
}
</script>

<template>
  <div ref="root" data-demo="prompt-composer" class="@container flex w-full max-w-[540px] flex-col">
    <div class="flex h-[210px] flex-col justify-end gap-3.5 overflow-hidden pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_44px)]">
      <template v-for="turn in turns" :key="turn.id">
        <div v-if="turn.from === 'you'" class="flex flex-col items-end gap-1.5">
          <template v-for="file in turn.files" :key="file.name">
            <img v-if="file.url" :src="file.url" :alt="file.name" class="size-16 rounded-[12px] object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" />
            <span v-else class="rounded-[10px] bg-muted px-2.5 py-1.5 text-[12px] text-muted-foreground">{{ file.name }}</span>
          </template>
          <div class="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13.5px] leading-snug whitespace-pre-wrap">{{ turn.text }}</div>
        </div>
        <p v-else class="max-w-[92%] text-[13.5px] leading-relaxed text-foreground/90">
          {{ turn.text }}<span v-if="turn.stopped" class="ms-1.5 text-[12px] text-muted-foreground">Stopped</span>
        </p>
      </template>
    </div>

    <PromptComposer
      :key="run"
      v-model:value="text"
      :status="status"
      placeholder="Ask about an order, or type @ or /"
      submit-on="enter"
      counter="tokens"
      :max-rows="6"
      :disabled="false"
      accept="image/*,.pdf,.csv"
      :upload="fakeUpload"
      :models="modelList"
      default-model="balanced"
      :mentions="mentions"
      :commands="commands"
      :menu-controller="menu"
      @submit="submit"
      @stop="stop"
    >
      <template #actions>
        <Tooltip>
          <TooltipTrigger aria-label="Mention an order or customer" data-play="mention" :disabled="false" @click="void menu.open({ trigger: '@' })">
            <template #render="{ props: tooltipProps }">
              <Button v-bind="withoutRef(tooltipProps)" variant="ghost" size="icon" class="bg-none text-muted-foreground shadow-none hover:text-foreground dark:bg-none dark:shadow-none">
                <template #render="{ props: buttonProps, children }">
                  <button v-bind="withoutRef(buttonProps)" :ref="chainRefs(tooltipProps.ref as any, buttonProps.ref as any)"><component :is="children" /></button>
                </template>
                <AtSign :stroke-width="1.75" />
              </Button>
            </template>
          </TooltipTrigger>
          <TooltipContent>Mention an order or customer</TooltipContent>
        </Tooltip>
      </template>
    </PromptComposer>

    <button type="button" hidden data-agent-hidden data-play="drop" @click="void dropSlip()" />
    <button type="button" hidden data-agent-hidden data-play="reset" @click="reset" />
  </div>
</template>
