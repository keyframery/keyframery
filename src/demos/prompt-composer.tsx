import { AtSign, ListChecks, Package, PenLine, RotateCcw, Truck, UserRound } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  createPromptComposerMenuController,
  PromptComposer,
  type PromptComposerItem,
  type PromptComposerStatus,
  type PromptComposerSubmit,
} from "@/components/ui/prompt-composer"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const meta = { name: "Prompt Composer", group: "AI" }

/* The demo plays itself: a photo of a chipped mug is dropped in and pops onto the box, a question is typed,
   @ opens the orders at the caret and one is chosen, then Send turns into a spinner and Stop while
   the answer streams in, and back to Send. */
export const play = [
  { wait: 900 },
  { click: '[data-play="drop"]', wait: 1300 },
  { type: "Amara says her mug from ", into: '[data-slot="prompt-composer"] textarea[aria-label="Message"]', wait: 500 },
  { click: '[data-play="mention"]', wait: 1100 },
  { key: "ArrowDown", wait: 500 },
  { key: "ArrowUp", wait: 600 },
  { key: "Enter", wait: 700 },
  { type: "Amara says her mug from @Order #4821 arrived chipped. Can we send a new one?", into: '[data-slot="prompt-composer"] textarea[aria-label="Message"]', wait: 1100 },
  { click: '[data-composer-part="send"]', wait: 6200 },
  { click: '[data-play="reset"]', wait: 900 },
]

export const controls = {
  submitOn: { type: "select", label: "Send with", options: ["enter", "mod+enter"], default: "enter" },
  counter: { type: "select", label: "Counter", options: ["characters", "tokens", "none"], default: "tokens" },
  models: { type: "switch", label: "Model picker", default: true },
  attachments: { type: "switch", label: "Attachments", default: true },
  disabled: { type: "switch", label: "Disabled", default: false },
  placeholder: { type: "text", label: "Placeholder", default: "Ask about an order, or type @ or /" },
  maxRows: { type: "slider", label: "Rows before scrolling", min: 2, max: 12, step: 1, default: 6, unit: "", group: "Layout" },
  themeFace: { type: "color", label: "Box surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Message text", default: "", group: "Colours" },
  themeSend: { type: "color", label: "Send button", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Box corners", min: 0, max: 28, step: 1, default: 18, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Message size", min: 12, max: 18, step: 1, default: 14, unit: "px", group: "Layout" },
  themePadding: { type: "slider", label: "Box padding", min: 4, max: 16, step: 1, default: 8, unit: "px", group: "Layout" },
} as const

const icon = (Glyph: typeof Package) => <Glyph strokeWidth={1.75} />

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

/* Stands in for the store's upload: a file goes up in a few steps, at the demo's speed. */
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

export default function PromptComposerDemo({
  submitOn = "enter",
  counter = "tokens",
  models = true,
  attachments = true,
  disabled = false,
  placeholder = "Ask about an order, or type @ or /",
  maxRows = 6,
  themeFace = "",
  themeInk = "",
  themeSend = "",
  themeRadius = 18,
  themeFont = 14,
  themePadding = 8,
}: {
  submitOn?: "enter" | "mod+enter"
  counter?: "characters" | "tokens" | "none"
  models?: boolean
  attachments?: boolean
  disabled?: boolean
  placeholder?: string
  maxRows?: number
  themeFace?: string
  themeInk?: string
  themeSend?: string
  themeRadius?: number
  themeFont?: number
  themePadding?: number
}) {
  const [turns, setTurns] = React.useState(opening)
  const [status, setStatus] = React.useState<PromptComposerStatus>("ready")
  const [text, setText] = React.useState("")
  const [run, setRun] = React.useState(0)
  const menu = React.useMemo(() => createPromptComposerMenuController(), [])
  const root = React.useRef<HTMLDivElement>(null)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  React.useEffect(() => clear, [])

  const speed = () => (root.current && parseFloat(getComputedStyle(root.current).getPropertyValue("--kf-speed"))) || 1

  /* Sent: a moment of waiting, then the answer streams in a few words at a time. */
  const submit = (message: PromptComposerSubmit) => {
    clear()
    const s = speed()
    const reply = Date.now()
    setTurns((all) => [...all.slice(-2), { id: reply - 1, from: "you", text: message.text, files: message.attachments.map((f) => ({ name: f.name, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined })) }])
    setStatus("submitted")
    const words = answer.split(" ")
    timers.current.push(
      setTimeout(() => {
        setStatus("streaming")
        setTurns((all) => [...all, { id: reply, from: "assistant", text: "" }])
        words.forEach((_, i) => {
          timers.current.push(
            setTimeout(() => {
              setTurns((all) => all.map((t) => (t.id === reply ? { ...t, text: words.slice(0, i + 1).join(" ") } : t)))
              if (i === words.length - 1) setStatus("ready")
            }, i * 85 * s),
          )
        })
      }, 900 * s),
    )
  }

  const stop = () => {
    clear()
    setStatus("ready")
    setTurns((all) => all.map((t, i) => (i === all.length - 1 && t.from === "assistant" ? { ...t, stopped: true } : t)))
  }

  /* For the self-playing loop: drop the customer's photo on the box, and start over. */
  const dropSlip = async () => {
    const box = root.current?.querySelector('[data-composer-part="box"]')
    if (!box) return
    const blob = await fetch("/demo/cup.jpg").then((r) => r.blob())
    const transfer = new DataTransfer()
    transfer.items.add(new File([blob], "chipped-mug.jpg", { type: "image/jpeg" }))
    for (const type of ["dragenter", "dragover", "drop"]) box.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }))
  }
  const reset = () => {
    clear()
    setStatus("ready")
    setText("")
    setTurns(opening)
    setRun((r) => r + 1)
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--prompt-composer-face": themeFace } : null),
    ...(themeInk ? { "--prompt-composer-ink": themeInk } : null),
    ...(themeSend ? { "--prompt-composer-send": themeSend } : null),
    ...(themeRadius !== 18 ? { "--prompt-composer-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 14 ? { "--prompt-composer-font": `${themeFont}px` } : null),
    ...(themePadding !== 8 ? { "--prompt-composer-padding": `${themePadding}px` } : null),
  } as React.CSSProperties

  return (
    <div ref={root} style={theme} className="@container flex w-full max-w-[540px] flex-col">
      <div className="flex h-[210px] flex-col justify-end gap-3.5 overflow-hidden pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_44px)]">
        {turns.map((turn) =>
          turn.from === "you" ? (
            <div key={turn.id} className="flex flex-col items-end gap-1.5">
              {turn.files?.map((file) =>
                file.url ? (
                  <img key={file.name} src={file.url} alt={file.name} className="size-16 rounded-[12px] object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]" />
                ) : (
                  <span key={file.name} className="rounded-[10px] bg-muted px-2.5 py-1.5 text-[12px] text-muted-foreground">
                    {file.name}
                  </span>
                ),
              )}
              <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13.5px] leading-snug whitespace-pre-wrap">{turn.text}</div>
            </div>
          ) : (
            <p key={turn.id} className="max-w-[92%] text-[13.5px] leading-relaxed text-foreground/90">
              {turn.text}
              {turn.stopped && <span className="ms-1.5 text-[12px] text-muted-foreground">Stopped</span>}
            </p>
          ),
        )}
      </div>

      <PromptComposer
        key={run}
        value={text}
        onValueChange={setText}
        status={status}
        onSubmit={submit}
        onStop={stop}
        placeholder={placeholder}
        submitOn={submitOn}
        counter={counter}
        maxRows={maxRows}
        disabled={disabled}
        accept={attachments ? "image/*,.pdf,.csv" : false}
        upload={fakeUpload}
        models={models ? modelList : undefined}
        defaultModel="balanced"
        mentions={mentions}
        commands={commands}
        menuController={menu}
        actions={
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon" className="bg-none text-muted-foreground shadow-none hover:text-foreground dark:bg-none dark:shadow-none" />}
              aria-label="Mention an order or customer"
              data-play="mention"
              disabled={disabled}
              onClick={() => void menu.open({ trigger: "@" })}
            >
              <AtSign strokeWidth={1.75} />
            </TooltipTrigger>
            <TooltipContent>Mention an order or customer</TooltipContent>
          </Tooltip>
        }
      />

      <button type="button" hidden data-agent-hidden data-play="drop" onClick={() => void dropSlip()} />
      <button type="button" hidden data-agent-hidden data-play="reset" onClick={reset} />
    </div>
  )
}
