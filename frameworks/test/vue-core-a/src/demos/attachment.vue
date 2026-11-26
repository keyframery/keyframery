<script setup lang="ts">
/* Mirrors src/demos/attachment.tsx at its default controls (default size, horizontal). */
import { onBeforeUnmount, ref } from "vue"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentRemove,
  AttachmentTitle,
} from "@/components/keyframery/attachment"
import { Button } from "@/components/keyframery/button"

type Status = "idle" | "uploading" | "processing" | "error" | "done"
type Doc = { id: string; name: string; detail: string; status: Status; progress?: number; image?: string }
const initial: Doc[] = [
  { id: "id", name: "passport.jpg", detail: "1.2 MB", status: "done", image: "/demo/face-2.jpg" },
  { id: "payslip", name: "payslip-october.pdf", detail: "182 KB", status: "done" },
  { id: "reference", name: "reference-letter.heic", detail: "24 MB · over the 10 MB limit", status: "error" },
  { id: "bank", name: "bank-statement-q3.pdf", detail: "Not sent yet", status: "idle" },
]
const docs = ref<Doc[]>(initial)
let timers: ReturnType<typeof setTimeout>[] = []
onBeforeUnmount(() => timers.forEach(clearTimeout))
const update = (id: string, change: Partial<Doc>) => (docs.value = docs.value.map((d) => (d.id === id ? { ...d, ...change } : d)))
const attach = (el: HTMLElement) => {
  if (docs.value.some((d) => d.id === "tax")) return
  const speed = parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed")) || 1
  docs.value = [...docs.value, { id: "tax", name: "council-tax-bill.pdf", detail: "Uploading · 0%", status: "uploading", progress: 0 }]
  ;[18, 46, 71, 100].forEach((p, i) => {
    timers.push(setTimeout(() => update("tax", { progress: p, detail: `Uploading · ${p}%` }), (350 + i * 520) * speed))
  })
  timers.push(setTimeout(() => update("tax", { status: "done", detail: "96 KB" }), 2700 * speed))
}
const reset = () => {
  timers.forEach(clearTimeout)
  timers = []
  docs.value = initial
}
</script>

<template>
  <div class="@container w-full max-w-[460px]">
    <div class="rounded-[20px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] @max-[26rem]:p-4 dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="text-[15px] font-semibold tracking-tight">Documents</h3>
          <p class="mt-1 text-[12.5px] text-muted-foreground">Flat 3, 14 Elm Row · application for Dana Whitfield</p>
        </div>
        <Button size="sm" data-play="attach" @click="(e: MouseEvent) => attach(e.currentTarget as HTMLElement)">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip" aria-hidden="true"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" /></svg>
          Attach
        </Button>
      </div>

      <AttachmentGroup class="mt-4 -mx-1 min-h-[298px] flex-col items-stretch overflow-visible [--attachment-collapse-x:0] [--attachment-collapse-y:1] *:data-[slot=attachment]:w-auto">
        <Attachment
          v-for="doc in docs"
          :key="doc.id"
          :data-file="doc.id"
          :value="doc.id"
          :status="doc.status"
          :progress="doc.progress"
          size="default"
          orientation="horizontal"
          @remove="(id: string | undefined) => (docs = docs.filter((d) => d.id !== id))"
        >
          <AttachmentMedia :variant="doc.image ? 'image' : 'icon'">
            <img v-if="doc.image" :src="doc.image" alt="" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{{ doc.name }}</AttachmentTitle>
            <AttachmentDescription>{{ doc.detail }}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction v-if="doc.status === 'error'" :aria-label="`Try ${doc.name} again`">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
            </AttachmentAction>
            <AttachmentRemove :aria-label="`Remove ${doc.name}`" />
          </AttachmentActions>
          <AttachmentProgress />
        </Attachment>
      </AttachmentGroup>
      <button type="button" hidden data-play="reset" @click="reset" />
    </div>
  </div>
</template>
