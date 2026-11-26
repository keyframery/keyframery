<script setup lang="ts">
/* Styled prompt composer: the animated primitive plus the Keyframery look. A field-like box with the
   files on top, the message in the middle and a quiet toolbar along the foot: attach, the model,
   your own actions (the `actions` slot), a count, and Send, a round primary key that becomes Stop
   while a reply comes in. A composition of Keyframery parts: Textarea and Trigger Menu for the text,
   File Input and Attachment for the files, Select for the model, Button and Tooltip for the actions.

   Theming variables: --prompt-composer-face, --prompt-composer-ink, --prompt-composer-send,
   --prompt-composer-radius, --prompt-composer-font, --prompt-composer-padding. */
import { computed, onBeforeUnmount, ref, useAttrs } from "vue"
import { createFileInputController, FileInput, FileInputTrigger as FileInputTriggerPart, formatFileSize } from "@ui-sdk/vue/file-input"

import type { PromptComposerStatus, PromptComposerSubmitOn } from "@/components/keyframery/core/prompt-composer-core"
import {
  Attachment,
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
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectTrigger, SelectValue } from "@/components/keyframery/select"
import { Tooltip, TooltipContent, TooltipShortcut, TooltipTrigger } from "@/components/keyframery/tooltip"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuList,
  TriggerMenuStatus,
  type TriggerDefinition,
  type TriggerMenuController,
  type TriggerMenuData,
} from "@/components/keyframery/trigger-menu"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { boxLook, chainRefs, dropLook, fieldLook, fileTriggerMotion, ghostIcon, modelTrigger, sendLook, withClick, withoutRef } from "./parts"
import PromptComposerAttachments from "./PromptComposerAttachments.vue"
import PromptComposerCount from "./PromptComposerCount.vue"
import PromptComposerDrop from "./PromptComposerDrop.vue"
import PromptComposerDropzone from "./PromptComposerDropzone.vue"
import PromptComposerInput from "./PromptComposerInput.vue"
import PromptComposerMenuRows from "./PromptComposerMenuRows.vue"
import PromptComposerRoot from "./PromptComposerRoot.vue"
import PromptComposerSend from "./PromptComposerSend.vue"
import PromptComposerToolbar from "./PromptComposerToolbar.vue"
import type { PromptComposerItem, PromptComposerModel, PromptComposerSubmit, PromptComposerUploadContext } from "./types"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    speed?: Speed
    value?: string
    defaultValue?: string
    /** `"ready"`, `"submitted"` (spinner), `"streaming"` (Send becomes Stop) or `"error"`. */
    status?: PromptComposerStatus
    placeholder?: string
    /** `"enter"`: Enter sends, Shift+Enter adds a line. `"mod+enter"`: Enter adds a line. Cmd/Ctrl+Enter always sends. */
    submitOn?: PromptComposerSubmitOn
    /** Shows a model picker in the toolbar. */
    models?: PromptComposerModel[]
    model?: string
    defaultModel?: string
    /** What @ suggests. */
    mentions?: PromptComposerItem[]
    /** What / suggests at the start of the message. */
    commands?: PromptComposerItem[]
    /** Which files can be attached, like `"image/*,.pdf"`. Pass `false` for no attachments. */
    accept?: string | false
    /** The most files at once. */
    maxFiles?: number
    /** Uploads a file as soon as it is attached; the card shows its progress, and Send waits for it. */
    upload?: (file: File, context: PromptComposerUploadContext) => Promise<void>
    /** The most lines before the text scrolls. */
    maxRows?: number
    /** The longest message. */
    maxLength?: number
    /** The count beside Send: characters, an estimate of tokens, or nothing. */
    counter?: "characters" | "tokens" | "none"
    /** Shown in the toolbar while `status` is "error" (or use the `error` slot). */
    errorMessage?: string
    disabled?: boolean
    /** Reaches the trigger menu, to open @ or / from a button. */
    menuController?: TriggerMenuController
    /** Stop was pressed while a reply was on its way (`@stop`). Without it Stop is disabled. */
    onStop?: () => void
    /** The composer's accessible name (`aria-label`). */
    ariaLabel?: string
  }>(),
  {
    defaultValue: "",
    status: "ready",
    placeholder: "Write a message…",
    submitOn: "enter",
    accept: undefined,
    maxRows: 8,
    counter: "characters",
    errorMessage: "Something went wrong. Send it again.",
    disabled: false,
    ariaLabel: "Message composer",
  },
)
const emit = defineEmits<{
  /** Send was asked for, with something to send. The composer empties itself afterwards. */
  submit: [message: PromptComposerSubmit]
  valueChange: [value: string]
  "update:value": [value: string]
  modelChange: [model: string]
  "update:model": [model: string]
}>()
defineSlots<{ actions?: () => unknown; error?: () => unknown }>()
const attrs = useAttrs()
const speedStyle = useSpeed(() => props.speed)
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

/* Controlled or not, like React's useControllable. */
const ownText = ref(props.defaultValue)
const text = computed(() => (props.value !== undefined ? props.value : ownText.value))
function setText(next: string) {
  if (props.value === undefined) ownText.value = next
  emit("valueChange", next)
  emit("update:value", next)
}
const ownModel = ref(props.defaultModel ?? props.models?.[0]?.value ?? "")
const chosenModel = computed(() => (props.model !== undefined ? props.model : ownModel.value))
function setModel(next: string) {
  if (props.model === undefined) ownModel.value = next
  emit("modelChange", next)
  emit("update:model", next)
}

type FileMeta = { id: string; status: "uploading" | "error" | "done"; progress: number; url?: string; error?: string; abort?: AbortController }

let nextId = 0
const ids = new WeakMap<File, string>()
const idOf = (file: File) => {
  let id = ids.get(file)
  if (!id) ids.set(file, (id = `kf-file-${++nextId}`))
  return id
}

const files = ref<File[]>([])
const meta = ref<Record<string, FileMeta>>({})
const fileInput = createFileInputController()

/* Free the previews when the composer goes. */
onBeforeUnmount(() => {
  for (const m of Object.values(meta.value)) {
    m.abort?.abort()
    if (m.url) URL.revokeObjectURL(m.url)
  }
})

const patch = (id: string, change: Partial<FileMeta>) => {
  if (meta.value[id]) meta.value = { ...meta.value, [id]: { ...meta.value[id], ...change } }
}

/* New files get an id, a preview if they are pictures, and an upload if there is one. */
function onFilesChange(next: File[]) {
  const added = next.filter((file) => !meta.value[idOf(file)])
  files.value = next
  if (!added.length) return
  const entries: Record<string, FileMeta> = {}
  for (const file of added) {
    const id = idOf(file)
    const abort = props.upload ? new AbortController() : undefined
    entries[id] = {
      id,
      status: props.upload ? "uploading" : "done",
      progress: 0,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      abort,
    }
    if (props.upload && abort) {
      props
        .upload(file, { signal: abort.signal, onProgress: (p) => patch(id, { progress: Math.max(0, Math.min(100, p)) }) })
        .then(() => patch(id, { status: "done", progress: 100 }))
        .catch((error: unknown) => {
          if (abort.signal.aborted) return
          patch(id, { status: "error", error: error instanceof Error ? error.message : "Upload failed" })
        })
    }
  }
  meta.value = { ...meta.value, ...entries }
}

/* After its card has left: drop the file and its preview. */
function removeFile(id: string | undefined) {
  const file = files.value.find((f) => idOf(f) === id)
  if (!file) return
  const m = meta.value[idOf(file)]
  m?.abort?.abort()
  if (m?.url) URL.revokeObjectURL(m.url)
  const { [idOf(file)]: _gone, ...rest } = meta.value
  meta.value = rest
  fileInput.removeFile(file)
}

const trimmed = computed(() => text.value.trim())
const uploading = computed(() => files.value.some((f) => meta.value[idOf(f)]?.status === "uploading"))
const failed = computed(() => files.value.some((f) => meta.value[idOf(f)]?.status === "error"))
const over = computed(() => props.maxLength !== undefined && text.value.length > props.maxLength)
const empty = computed(() => (!trimmed.value && files.value.length === 0) || uploading.value || failed.value || over.value)
const busy = computed(() => props.status === "submitted" || props.status === "streaming")

function send() {
  if (props.disabled || empty.value || busy.value) return
  emit("submit", { text: trimmed.value, attachments: files.value, ...(props.models?.length ? { model: chosenModel.value } : null) })
  setText("")
  for (const f of files.value) {
    const m = meta.value[idOf(f)]
    if (m?.url) URL.revokeObjectURL(m.url)
  }
  meta.value = {}
  fileInput.clear()
}
const stop = () => props.onStop?.()

/* Grouped trigger data for UI SDK, from the flat items given as props. */
function toData(items: PromptComposerItem[]): TriggerMenuData<string> {
  const plain = (item: PromptComposerItem) => ({ value: item.value, label: item.label, keywords: item.keywords })
  if (!items.some((item) => item.group)) return items.map(plain)
  const groups: { type: "group"; label: string; items: ReturnType<typeof plain>[] }[] = []
  for (const item of items) {
    const label = item.group ?? ""
    let group = groups.find((g) => g.label === label)
    if (!group) groups.push((group = { type: "group", label, items: [] }))
    group.items.push(plain(item))
  }
  return groups as TriggerMenuData<string>
}

/* The suggestions, and how to find a row's icon and detail again. */
const triggers = computed(() => {
  const list: TriggerDefinition<string>[] = []
  if (props.mentions?.length) list.push({ char: "@", spaces: 1, items: toData(props.mentions) })
  if (props.commands?.length) list.push({ char: "/", boundary: "start", items: toData(props.commands) })
  return list
})
const lookup = (trigger: string | null | undefined) => (v: string) => (trigger === "/" ? props.commands : props.mentions)?.find((item) => item.value === v)

const count = computed(() => {
  const length = text.value.length
  if (props.counter === "tokens") {
    const tokens = Math.ceil(length / 4)
    return `≈ ${tokens.toLocaleString()} ${tokens === 1 ? "token" : "tokens"}`
  }
  return props.maxLength !== undefined ? `${length.toLocaleString()} / ${props.maxLength.toLocaleString()}` : length.toLocaleString()
})
const near = computed(() => props.maxLength !== undefined && text.value.length >= props.maxLength * 0.9)

const sendLabel = computed(() => (busy.value ? "Stop" : "Send"))
const canPress = computed(() => (busy.value ? Boolean(props.onStop) && !props.disabled : !empty.value && !props.disabled))
const modelItems = computed(() => props.models?.map((m) => ({ value: m.value, label: m.label })))
</script>

<template>
  <FileInput
    multiple
    :accept="accept || undefined"
    :max-files="maxFiles"
    :value="files"
    :disabled="disabled || accept === false"
    :controller="fileInput"
    :class="cn('@container/prompt-composer w-full min-w-0', attrs.class as any)"
    :style="[speedStyle, attrs.style as any, { '--prompt-composer-rows': maxRows }]"
    v-bind="forwarded"
    @value-change="(next: readonly File[]) => onFilesChange([...next])"
  >
    <TriggerMenu :triggers="triggers" :controller="menuController">
      <PromptComposerRoot
        :aria-label="ariaLabel"
        :status="status"
        :submit-on="submitOn"
        :empty="empty"
        :disabled="disabled"
        class="w-full"
        @submit="send"
        @stop="stop"
      >
        <PromptComposerDropzone :class="boxLook">
          <PromptComposerAttachments>
            <AttachmentGroup aria-label="Attached files" class="pb-1.5">
              <Attachment
                v-for="file in files"
                :key="idOf(file)"
                :value="idOf(file)"
                size="sm"
                :status="meta[idOf(file)]?.status ?? 'done'"
                :progress="meta[idOf(file)]?.progress ?? 0"
                class="max-w-60"
                @remove="removeFile"
              >
                <AttachmentMedia :variant="meta[idOf(file)]?.url ? 'image' : 'icon'">
                  <img v-if="meta[idOf(file)]?.url" :src="meta[idOf(file)]!.url" alt="" />
                  <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9.25 1.75h-4.5a1.5 1.5 0 0 0-1.5 1.5v9.5a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-7.5ZM9.25 1.75v4h4" />
                  </svg>
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{{ file.name }}</AttachmentTitle>
                  <AttachmentDescription>{{
                    meta[idOf(file)]?.status === "uploading"
                      ? `Uploading · ${Math.round(meta[idOf(file)]!.progress)}%`
                      : meta[idOf(file)]?.status === "error"
                        ? (meta[idOf(file)]!.error ?? "Upload failed")
                        : formatFileSize(file.size)
                  }}</AttachmentDescription>
                </AttachmentContent>
                <AttachmentProgress />
                <AttachmentActions>
                  <AttachmentRemove :aria-label="`Remove ${file.name}`" />
                </AttachmentActions>
              </Attachment>
            </AttachmentGroup>
          </PromptComposerAttachments>

          <PromptComposerInput
            aria-label="Message"
            :placeholder="placeholder"
            :value="text"
            :disabled="disabled"
            :rows="1"
            :class="fieldLook"
            @value-change="(next: string) => setText(next)"
          />

          <PromptComposerToolbar class="flex min-w-0 items-center gap-1">
            <Tooltip v-if="accept !== false">
              <TooltipTrigger aria-label="Attach files">
                <template #render="{ props: tooltipProps }">
                  <FileInputTriggerPart v-bind="withoutRef(tooltipProps)" :class="fileTriggerMotion">
                    <template #render="{ props: triggerProps }">
                      <Button v-bind="withoutRef(triggerProps)" :ref="chainRefs(tooltipProps.ref as any, triggerProps.ref as any)" variant="ghost" size="icon" :class="ghostIcon">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="m13.25 7.4-5.1 5.1a3.18 3.18 0 0 1-4.5-4.5l5.43-5.43a2.12 2.12 0 0 1 3 3l-5.42 5.42a1.06 1.06 0 0 1-1.5-1.5l4.84-4.84" />
                        </svg>
                      </Button>
                    </template>
                  </FileInputTriggerPart>
                </template>
              </TooltipTrigger>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
            <Select
              v-if="models && models.length > 0"
              :value="chosenModel"
              :items="modelItems"
              :disabled="disabled"
              @value-change="(v: string | null) => v != null && setModel(v)"
            >
              <SelectTrigger aria-label="Model" :class="modelTrigger"><SelectValue /></SelectTrigger>
              <SelectContent class="w-64">
                <SelectItem v-for="m in models" :key="m.value" :value="m.value" :label="m.label" class="items-start py-2">
                  <span class="flex min-w-0 flex-1 flex-col gap-1">
                    <SelectItemText class="flex-none">{{ m.label }}</SelectItemText>
                    <span v-if="m.description" class="text-[12px] leading-4 text-muted-foreground">{{ m.description }}</span>
                  </span>
                  <SelectItemIndicator class="mt-px" />
                </SelectItem>
              </SelectContent>
            </Select>
            <slot name="actions" />

            <span class="ms-auto flex min-w-0 items-center gap-2.5 ps-2">
              <span v-if="status === 'error'" role="alert" class="truncate text-[12px] text-destructive">
                <slot name="error">{{ errorMessage }}</slot>
              </span>
              <PromptComposerCount
                v-else-if="counter !== 'none'"
                :near="near"
                :over="over"
                :aria-hidden="text.length === 0 || undefined"
                :class="
                  cn(
                    'truncate text-[12px] text-muted-foreground/80 tabular-nums @max-[24rem]/prompt-composer:hidden',
                    text.length === 0 && 'opacity-0',
                    'data-near:text-foreground data-over:text-destructive',
                  )
                "
                >{{ count }}</PromptComposerCount
              >
              <Tooltip :shortcut="busy ? undefined : submitOn === 'enter' ? 'enter' : 'mod+enter'">
                <TooltipTrigger>
                  <template #render="{ props: tooltipProps }">
                    <PromptComposerSend
                      v-bind="withClick(tooltipProps, () => (busy ? stop() : send()))"
                      :class="sendLook"
                      :aria-label="sendLabel"
                      data-composer-part="send"
                      :disabled="!canPress"
                      focusable-when-disabled
                    />
                  </template>
                </TooltipTrigger>
                <TooltipContent>{{ busy ? "Stop the reply" : "Send" }}<TooltipShortcut v-if="!busy" /></TooltipContent>
              </Tooltip>
            </span>
          </PromptComposerToolbar>

          <PromptComposerDrop :class="dropLook">
            <span class="flex items-center gap-2 text-[13px] font-medium text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M8 10.25V2.75M4.75 6 8 2.75 11.25 6M2.75 10.5v1.25c0 .83.67 1.5 1.5 1.5h7.5c.83 0 1.5-.67 1.5-1.5V10.5" />
              </svg>Drop files to attach</span
            >
          </PromptComposerDrop>
        </PromptComposerDropzone>
      </PromptComposerRoot>

      <TriggerMenuContent class="w-72">
        <TriggerMenuEmpty>Nothing matches</TriggerMenuEmpty>
        <TriggerMenuList>
          <template #default="{ state }">
            <PromptComposerMenuRows :items="state.items" :lookup="lookup(state.trigger)" />
          </template>
        </TriggerMenuList>
      </TriggerMenuContent>
      <TriggerMenuStatus />
    </TriggerMenu>
  </FileInput>
</template>
