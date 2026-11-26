"use client"

export * from "@/components/primitives/prompt-composer"

/* Theming variables (set on the composer or an ancestor; absent values preserve the theme):
   --prompt-composer-face: Box surface; default: bg-background (dark: bg-card).
   --prompt-composer-ink: Message text; default: text-foreground.
   --prompt-composer-send: Send button; default: bg-primary.
   --prompt-composer-radius: Box corners; default: rounded-[18px].
   --prompt-composer-font: Message size; default: text-[14px].
   --prompt-composer-padding: Box padding; default: p-2.
*/

/* Styled prompt composer: the animated primitive plus the Keyframery look. A field-like box with the
   files on top, the message in the middle and a quiet toolbar along the foot: attach, the model,
   your own actions, a count, and Send, a round primary key that becomes Stop while a reply comes in.
   It is a composition of Keyframery parts: Textarea and Trigger Menu for the text, File Input and
   Attachment for the files, Select for the model, Button and Tooltip for the actions. */

import * as React from "react"

import {
  PromptComposer as PromptComposerRoot,
  PromptComposerAttachments,
  PromptComposerCount,
  PromptComposerDrop,
  PromptComposerDropzone,
  PromptComposerInput,
  PromptComposerSend,
  PromptComposerToolbar,
  type PromptComposerStatus,
  type PromptComposerSubmitOn,
} from "@/components/primitives/prompt-composer"
import { FileInput, FileInputTrigger, createFileInputController, formatFileSize } from "@/components/primitives/file-input"
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
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipShortcut, TooltipTrigger } from "@/components/ui/tooltip"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuGroup,
  TriggerMenuGroupLabel,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
  TriggerMenuStatus,
  createTriggerMenuController,
  type TriggerDefinition,
  type TriggerMenuData,
} from "@/components/ui/trigger-menu"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/** Something @ or / suggests: a person, an order, a file, a command. */
type PromptComposerItem = {
  value: string
  /** What the menu shows and what is inserted after the trigger. */
  label: string
  /** A short detail at the end of the row. */
  description?: string
  icon?: React.ReactNode
  /** Rows with the same group are listed under it. */
  group?: string
  keywords?: string[]
}

type PromptComposerModel = {
  value: string
  label: string
  description?: string
}

type PromptComposerSubmit = {
  /** The message, trimmed. */
  text: string
  /** The files attached to it. */
  attachments: File[]
  /** The chosen model, when there is a model picker. */
  model?: string
}

type UploadContext = { onProgress: (percent: number) => void; signal: AbortSignal }

type FileMeta = { id: string; status: "uploading" | "error" | "done"; progress: number; url?: string; error?: string; abort?: AbortController }

type PromptComposerProps = Omit<React.ComponentProps<"div">, "onSubmit" | "defaultValue" | "children"> &
  SpeedProps & {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    /** Send was asked for, with something to send. The composer empties itself afterwards. */
    onSubmit?: (message: PromptComposerSubmit) => void
    /** Stop was pressed while a reply was on its way. */
    onStop?: () => void
    /** `"ready"`, `"submitted"` (spinner), `"streaming"` (Send becomes Stop) or `"error"`. */
    status?: PromptComposerStatus
    placeholder?: string
    /** `"enter"`: Enter sends, Shift+Enter adds a line. `"mod+enter"`: Enter adds a line. Cmd/Ctrl+Enter always sends. */
    submitOn?: PromptComposerSubmitOn
    /** Shows a model picker in the toolbar. */
    models?: PromptComposerModel[]
    model?: string
    defaultModel?: string
    onModelChange?: (model: string) => void
    /** What @ suggests. */
    mentions?: PromptComposerItem[]
    /** What / suggests at the start of the message. */
    commands?: PromptComposerItem[]
    /** Which files can be attached, like `"image/*,.pdf"`. Pass `false` for no attachments. */
    accept?: string | false
    /** The most files at once. */
    maxFiles?: number
    /** Uploads a file as soon as it is attached; the card shows its progress, and Send waits for it. */
    upload?: (file: File, context: UploadContext) => Promise<void>
    /** The most lines before the text scrolls. */
    maxRows?: number
    /** The longest message. */
    maxLength?: number
    /** The count beside Send: characters, an estimate of tokens, or nothing. */
    counter?: "characters" | "tokens" | "none"
    /** Your own buttons, after attach and the model. */
    actions?: React.ReactNode
    /** Shown in the toolbar while `status` is "error". */
    errorMessage?: React.ReactNode
    disabled?: boolean
    /** Reaches the text field, for a controller or focus. */
    inputRef?: React.Ref<HTMLTextAreaElement>
    /** Reaches the trigger menu, to open @ or / from a button. */
    menuController?: ReturnType<typeof createTriggerMenuController>
  }

let nextId = 0
const ids = new WeakMap<File, string>()
const idOf = (file: File) => {
  let id = ids.get(file)
  if (!id) ids.set(file, (id = `kf-file-${++nextId}`))
  return id
}

/* 16px glyphs, drawn like the rest of the library. */
const svg = (d: React.ReactNode) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
)
const PaperclipIcon = () => svg(<path d="m13.25 7.4-5.1 5.1a3.18 3.18 0 0 1-4.5-4.5l5.43-5.43a2.12 2.12 0 0 1 3 3l-5.42 5.42a1.06 1.06 0 0 1-1.5-1.5l4.84-4.84" />)
const FileIcon = () => svg(<path d="M9.25 1.75h-4.5a1.5 1.5 0 0 0-1.5 1.5v9.5a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-7.5ZM9.25 1.75v4h4" />)
const DropIcon = () => svg(<path d="M8 10.25V2.75M4.75 6 8 2.75 11.25 6M2.75 10.5v1.25c0 .83.67 1.5 1.5 1.5h7.5c.83 0 1.5-.67 1.5-1.5V10.5" />)

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

/* One suggestion row: icon, label, detail. */
function MenuRows({ items, lookup }: { items: TriggerMenuData<unknown> | undefined; lookup: (value: string) => PromptComposerItem | undefined }) {
  return (items ?? []).map((entry, index) => {
    if (typeof entry === "string") return null
    if ("type" in entry && entry.type === "separator") return null
    if ("type" in entry && entry.type === "group") {
      return (
        <TriggerMenuGroup key={`group-${entry.label ?? index}`}>
          {entry.label && <TriggerMenuGroupLabel>{entry.label}</TriggerMenuGroupLabel>}
          <MenuRows items={entry.items} lookup={lookup} />
        </TriggerMenuGroup>
      )
    }
    const value = String(entry.value)
    const item = lookup(value)
    return (
      <TriggerMenuItem<unknown> key={value} value={entry.value} label={entry.label} keywords={entry.keywords}>
        {item?.icon && <TriggerMenuItemIcon>{item.icon}</TriggerMenuItemIcon>}
        <span className="min-w-0 flex-1 truncate">{entry.label}</span>
        {item?.description && (
          <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums group-data-highlighted/item:text-current/70">{item.description}</span>
        )}
      </TriggerMenuItem>
    )
  })
}

function useControllable<T>(value: T | undefined, fallback: T, onChange?: (value: T) => void) {
  const [own, setOwn] = React.useState(fallback)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setOwn(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [current, set] as const
}

function PromptComposer({
  speed,
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  status = "ready",
  placeholder = "Write a message…",
  submitOn = "enter",
  models,
  model,
  defaultModel,
  onModelChange,
  mentions,
  commands,
  accept,
  maxFiles,
  upload,
  maxRows = 8,
  maxLength,
  counter = "characters",
  actions,
  errorMessage = "Something went wrong. Send it again.",
  disabled = false,
  inputRef,
  menuController,
  className,
  style,
  "aria-label": ariaLabel = "Message composer",
  ...props
}: PromptComposerProps) {
  const [text, setText] = useControllable(value, defaultValue, onValueChange)
  const [chosenModel, setChosenModel] = useControllable(model, defaultModel ?? models?.[0]?.value ?? "", onModelChange)
  const [files, setFiles] = React.useState<File[]>([])
  const [meta, setMeta] = React.useState<Record<string, FileMeta>>({})
  const fileInput = React.useMemo(() => createFileInputController(), [])
  const metaRef = React.useRef(meta)
  metaRef.current = meta

  /* Free the previews when the composer goes. */
  React.useEffect(
    () => () => {
      for (const m of Object.values(metaRef.current)) {
        m.abort?.abort()
        if (m.url) URL.revokeObjectURL(m.url)
      }
    },
    [],
  )

  const patch = (id: string, change: Partial<FileMeta>) => setMeta((all) => (all[id] ? { ...all, [id]: { ...all[id], ...change } } : all))

  /* New files get an id, a preview if they are pictures, and an upload if there is one. */
  const onFilesChange = (next: File[]) => {
    const added = next.filter((file) => !metaRef.current[idOf(file)])
    setFiles(next)
    if (!added.length) return
    const entries: Record<string, FileMeta> = {}
    for (const file of added) {
      const id = idOf(file)
      const abort = upload ? new AbortController() : undefined
      entries[id] = {
        id,
        status: upload ? "uploading" : "done",
        progress: 0,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        abort,
      }
      if (upload && abort) {
        upload(file, { signal: abort.signal, onProgress: (p) => patch(id, { progress: Math.max(0, Math.min(100, p)) }) })
          .then(() => patch(id, { status: "done", progress: 100 }))
          .catch((error: unknown) => {
            if (abort.signal.aborted) return
            patch(id, { status: "error", error: error instanceof Error ? error.message : "Upload failed" })
          })
      }
    }
    setMeta((all) => ({ ...all, ...entries }))
  }

  /* After its card has left: drop the file and its preview. */
  const removeFile = (id: string | undefined) => {
    const file = files.find((f) => idOf(f) === id)
    if (!file) return
    const m = metaRef.current[idOf(file)]
    m?.abort?.abort()
    if (m?.url) URL.revokeObjectURL(m.url)
    setMeta((all) => {
      const { [idOf(file)]: _gone, ...rest } = all
      return rest
    })
    fileInput.removeFile(file)
  }

  const trimmed = text.trim()
  const uploading = files.some((f) => meta[idOf(f)]?.status === "uploading")
  const failed = files.some((f) => meta[idOf(f)]?.status === "error")
  const over = maxLength !== undefined && text.length > maxLength
  const empty = (!trimmed && files.length === 0) || uploading || failed || over
  const busy = status === "submitted" || status === "streaming"

  const send = () => {
    if (disabled || empty || busy) return
    onSubmit?.({ text: trimmed, attachments: files, ...(models?.length ? { model: chosenModel } : null) })
    setText("")
    for (const f of files) {
      const m = metaRef.current[idOf(f)]
      if (m?.url) URL.revokeObjectURL(m.url)
    }
    setMeta({})
    fileInput.clear()
  }

  /* The suggestions, and how to find a row's icon and detail again. */
  const triggers = React.useMemo(() => {
    const list: TriggerDefinition<string>[] = []
    if (mentions?.length) list.push({ char: "@", spaces: 1, items: toData(mentions) })
    if (commands?.length) list.push({ char: "/", boundary: "start", items: toData(commands) })
    return list
  }, [mentions, commands])
  const lookup = (trigger: string | null) => (v: string) => (trigger === "/" ? commands : mentions)?.find((item) => item.value === v)

  const count =
    counter === "tokens"
      ? `≈ ${Math.ceil(text.length / 4).toLocaleString()} ${Math.ceil(text.length / 4) === 1 ? "token" : "tokens"}`
      : maxLength !== undefined
        ? `${text.length.toLocaleString()} / ${maxLength.toLocaleString()}`
        : text.length.toLocaleString()
  const near = maxLength !== undefined && text.length >= maxLength * 0.9

  const sendLabel = busy ? "Stop" : "Send"
  const canPress = busy ? Boolean(onStop) && !disabled : !empty && !disabled

  const field = (
    <PromptComposerInput
      ref={inputRef}
      aria-label="Message"
      placeholder={placeholder}
      value={text}
      onValueChange={(next) => setText(next)}
      disabled={disabled}
      rows={1}
      className={cn(
        "block w-full min-w-0 resize-none border-0 bg-transparent px-2 pt-1.5 pb-1 text-[length:var(--prompt-composer-font,14px)] leading-[1.45] text-[color:var(--prompt-composer-ink,var(--foreground))] outline-none",
        "min-h-[calc(1.45em+0.625rem)] max-h-[calc(var(--prompt-composer-rows,8)*1.45em+0.625rem)] overflow-y-auto [scrollbar-width:thin]",
        "placeholder:text-muted-foreground/80 disabled:cursor-not-allowed",
      )}
    />
  )

  return (
    <Speed speed={speed}>
      <FileInput
        multiple
        accept={accept || undefined}
        maxFiles={maxFiles}
        value={files}
        onValueChange={(next) => onFilesChange([...next])}
        disabled={disabled || accept === false}
        controller={fileInput}
        className={cn("@container/prompt-composer w-full min-w-0", className)}
        style={{ ...style, "--prompt-composer-rows": maxRows } as React.CSSProperties}
        {...props}
      >
        <TriggerMenu<string> triggers={triggers} controller={menuController}>
          <PromptComposerRoot
            aria-label={ariaLabel}
            status={status}
            submitOn={submitOn}
            empty={empty}
            disabled={disabled}
            onSubmit={send}
            onStop={() => onStop?.()}
            className="w-full"
          >
            <PromptComposerDropzone
              className={cn(
                "flex flex-col gap-1 rounded-[var(--prompt-composer-radius,18px)] bg-[var(--prompt-composer-face,var(--background))] p-[var(--prompt-composer-padding,0.5rem)] dark:bg-[var(--prompt-composer-face,var(--card))]",
                "[--line:rgb(0_0_0/0.1)] dark:[--line:rgb(255_255_255/0.1)]",
                "shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:shadow-[0_0_0_1px_var(--line),0_8px_24px_-12px_rgb(0_0_0/0.6)]",
                "hover:[--line:rgb(0_0_0/0.16)] dark:hover:[--line:rgb(255_255_255/0.16)]",
                "has-[textarea:focus-visible]:[--line:var(--ring)] has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/20",
                "data-dragging:[--line:color-mix(in_oklab,var(--foreground)_35%,transparent)]",
                "group-data-disabled/prompt-composer:opacity-60",
              )}
            >
              <PromptComposerAttachments>
                <AttachmentGroup aria-label="Attached files" className="pb-1.5">
                  {files.map((file) => {
                    const m = meta[idOf(file)]
                    const id = idOf(file)
                    return (
                      <Attachment
                        key={id}
                        value={id}
                        size="sm"
                        status={m?.status ?? "done"}
                        progress={m?.progress ?? 0}
                        onRemove={removeFile}
                        className="max-w-60"
                      >
                        <AttachmentMedia variant={m?.url ? "image" : "icon"}>{m?.url ? <img src={m.url} alt="" /> : <FileIcon />}</AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{file.name}</AttachmentTitle>
                          <AttachmentDescription>
                            {m?.status === "uploading" ? `Uploading · ${Math.round(m.progress)}%` : m?.status === "error" ? (m.error ?? "Upload failed") : formatFileSize(file.size)}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentProgress />
                        <AttachmentActions>
                          <AttachmentRemove aria-label={`Remove ${file.name}`} />
                        </AttachmentActions>
                      </Attachment>
                    )
                  })}
                </AttachmentGroup>
              </PromptComposerAttachments>

              {field}

              <PromptComposerToolbar className="flex min-w-0 items-center gap-1">
                {accept !== false && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <FileInputTrigger
                          render={<Button variant="ghost" size="icon" className="bg-none text-muted-foreground shadow-none hover:text-foreground dark:bg-none dark:shadow-none" />}
                        />
                      }
                      aria-label="Attach files"
                    >
                      <PaperclipIcon />
                    </TooltipTrigger>
                    <TooltipContent>Attach files</TooltipContent>
                  </Tooltip>
                )}
                {models && models.length > 0 && (
                  <Select<string> value={chosenModel} onValueChange={(v) => v != null && setChosenModel(v)} items={models.map((m) => ({ value: m.value, label: m.label }))} disabled={disabled}>
                    <SelectTrigger
                      aria-label="Model"
                      className={cn(
                        "h-8 w-auto max-w-44 shrink-0 gap-1 rounded-[9px] bg-transparent px-2.5 text-[13px] font-medium text-muted-foreground shadow-none dark:bg-transparent dark:shadow-none",
                        "hover:bg-accent hover:text-foreground hover:shadow-none dark:hover:shadow-none data-open:bg-accent data-open:text-foreground data-open:shadow-none dark:data-open:shadow-none",
                        "[&>svg:last-child]:size-3.5",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-64">
                      {models.map((m) => (
                        <SelectItem key={m.value} value={m.value} label={m.label} className="items-start py-2">
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <SelectItemText className="flex-none">{m.label}</SelectItemText>
                            {m.description && <span className="text-[12px] leading-4 text-muted-foreground">{m.description}</span>}
                          </span>
                          <SelectItemIndicator className="mt-px" />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {actions}

                <span className="ms-auto flex min-w-0 items-center gap-2.5 ps-2">
                  {status === "error" ? (
                    <span role="alert" className="truncate text-[12px] text-destructive">
                      {errorMessage}
                    </span>
                  ) : (
                    counter !== "none" && (
                      <PromptComposerCount
                        near={near}
                        over={over}
                        aria-hidden={text.length === 0 || undefined}
                        className={cn(
                          "truncate text-[12px] text-muted-foreground/80 tabular-nums @max-[24rem]/prompt-composer:hidden",
                          text.length === 0 && "opacity-0",
                          "data-near:text-foreground data-over:text-destructive",
                        )}
                      >
                        {count}
                      </PromptComposerCount>
                    )
                  )}
                  <Tooltip shortcut={busy ? undefined : submitOn === "enter" ? "enter" : "mod+enter"}>
                    <TooltipTrigger
                      render={
                        <PromptComposerSend
                          className={cn(
                            "size-8 shrink-0 cursor-pointer rounded-full bg-[var(--prompt-composer-send,var(--primary))] text-primary-foreground outline-none",
                            "shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_1px_2px_rgb(0_0_0/0.22)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.5)]",
                            "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--prompt-composer-send,var(--primary)),var(--background)_12%)]",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "data-disabled:cursor-not-allowed data-disabled:opacity-35 data-disabled:shadow-none",
                            "[&_svg]:size-4",
                          )}
                          aria-label={sendLabel}
                          data-composer-part="send"
                          disabled={!canPress}
                          focusableWhenDisabled
                          onClick={busy ? () => onStop?.() : send}
                        />
                      }
                    />
                    <TooltipContent>
                      {busy ? "Stop the reply" : "Send"}
                      {!busy && <TooltipShortcut />}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </PromptComposerToolbar>

              <PromptComposerDrop className="grid place-items-center rounded-[inherit] outline-1 -outline-offset-[5px] outline-dashed outline-foreground/25 bg-[color-mix(in_oklab,var(--prompt-composer-face,var(--background))_88%,transparent)] backdrop-blur-[2px] dark:bg-[color-mix(in_oklab,var(--prompt-composer-face,var(--card))_88%,transparent)]">
                <span className="flex items-center gap-2 text-[13px] font-medium text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground">
                  <DropIcon />
                  Drop files to attach
                </span>
              </PromptComposerDrop>
            </PromptComposerDropzone>
          </PromptComposerRoot>

          <TriggerMenuContent className="w-72">
            <TriggerMenuEmpty>Nothing matches</TriggerMenuEmpty>
            <TriggerMenuList>{(state) => <MenuRows items={state.items} lookup={lookup(state.trigger)} />}</TriggerMenuList>
          </TriggerMenuContent>
          <TriggerMenuStatus />
        </TriggerMenu>
      </FileInput>
    </Speed>
  )
}

export { PromptComposer, createTriggerMenuController as createPromptComposerMenuController }
export type { PromptComposerItem, PromptComposerModel, PromptComposerProps, PromptComposerSubmit }
