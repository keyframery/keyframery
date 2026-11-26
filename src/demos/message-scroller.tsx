import { ArrowUp } from "lucide-react"
import * as React from "react"

import { Attachment, AttachmentContent, AttachmentDescription, AttachmentGroup, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message"
import {
  createScrollAreaController,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

export const meta = { name: "Message Scroller", group: "AI" }

/* The demo plays itself: the guest scrolls back up to reread the directions, the host sends photos
   and the key-box code meanwhile (the jump key rises and its count rolls), the guest jumps back down,
   then writes and sends a reply, which the view follows. */
export const play = [
  { wait: 900 },
  { click: '[data-play="reread"]', wait: 1300 },
  { click: '[data-play="incoming"]', wait: 1500 },
  { click: '[data-play="incoming"]', wait: 1700 },
  { click: '[data-slot="scroll-area-scroll-to-end"]', wait: 1500 },
  { type: "Perfect, we land at 3. See you around 6!", into: '[data-play="composer"]', wait: 700 },
  { click: '[data-play="send"]', wait: 2400 },
  { click: '[data-play="reset"]', wait: 600 },
]

export const controls = {
  stickToEnd: { type: "switch", label: "Stick to end", default: true },
  follow: { type: "switch", label: "Follow my messages", default: true },
  themeFace: { type: "color", label: "Jump button surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Jump button text", default: "", group: "Colours" },
  themeUnread: { type: "color", label: "Unread surface", default: "", group: "Colours" },
  themeFont: { type: "slider", label: "Jump label size", min: 10, max: 18, step: 0.5, default: 12.5, unit: "px", group: "Layout" },
  themeHeight: { type: "slider", label: "Jump button height", min: 28, max: 44, step: 1, default: 32, unit: "px", group: "Layout" },
  themeIconSize: { type: "slider", label: "Jump icon", min: 10, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Message spacing", min: 4, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
  themePadding: { type: "slider", label: "Conversation inset", min: 4, max: 28, step: 1, default: 16, unit: "px", group: "Layout" },
} as const

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
      { src: "/demo/coast-2.jpg", name: "deck.jpg", size: "2.1 MB" },
      { src: "/demo/lake.jpg", name: "cove-path.jpg", size: "1.8 MB" },
    ],
  },
  { id: "t7", from: "host", lines: ["Key box is left of the blue door. Code 4471."] },
]

const field =
  "h-9 min-w-0 flex-1 rounded-full bg-background px-3.5 text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklab,var(--ring)_25%,transparent)] motion-reduce:transition-none"

function TurnView({ turn }: { turn: Turn }) {
  const mine = turn.from === "guest"
  return (
    <Message align={mine ? "end" : "start"}>
      {!mine && (
        <MessageAvatar>
          <img src="/demo/face-1.jpg" alt="Ana" />
        </MessageAvatar>
      )}
      <MessageContent>
        {turn.lines.map((line) => (
          <Bubble key={line} variant={mine ? "default" : "muted"} align={mine ? "end" : "start"}>
            <BubbleContent>{line}</BubbleContent>
          </Bubble>
        ))}
        {turn.photos && (
          <AttachmentGroup className="-mx-1 max-w-full">
            {turn.photos.map((photo) => (
              <Attachment key={photo.name} orientation="vertical" className="w-36 @max-[26rem]:w-30">
                <AttachmentMedia variant="image" className="aspect-[4/3]">
                  <img src={photo.src} alt="" />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{photo.name}</AttachmentTitle>
                  <AttachmentDescription>{photo.size}</AttachmentDescription>
                </AttachmentContent>
              </Attachment>
            ))}
          </AttachmentGroup>
        )}
        {turn.footer && <MessageFooter>{turn.footer}</MessageFooter>}
      </MessageContent>
    </Message>
  )
}

export default function MessageScrollerDemo({
  stickToEnd = true, follow = true,
  themeFace = "",
  themeInk = "",
  themeUnread = "",
  themeFont = 12.5,
  themeHeight = 32,
  themeIconSize = 14,
  themeGap = 16,
  themePadding = 16,
}: {
  stickToEnd?: boolean; follow?: boolean
  themeFace?: string
  themeInk?: string
  themeUnread?: string
  themeFont?: number
  themeHeight?: number
  themeIconSize?: number
  themeGap?: number
  themePadding?: number
}) {
  const [controller] = React.useState(createScrollAreaController)
  const [turns, setTurns] = React.useState(history)
  const [draft, setDraft] = React.useState("")
  const next = React.useRef(0)
  const sent = React.useRef(0)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setTurns((all) => [...all, { id: `me-${++sent.current}`, from: "guest", lines: [text], footer: "Sent" }])
    setDraft("")
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--message-scroller-face": themeFace } : null),
    ...(themeInk ? { "--message-scroller-ink": themeInk } : null),
    ...(themeUnread ? { "--message-scroller-unread-face": themeUnread } : null),
    ...(themeFont !== 12.5 ? { "--message-scroller-font": `${themeFont}px` } : null),
    ...(themeHeight !== 32 ? { "--message-scroller-height": `${themeHeight}px` } : null),
    ...(themeIconSize !== 14 ? { "--message-scroller-icon-size": `${themeIconSize}px` } : null),
    ...(themeGap !== 16 ? { "--message-scroller-gap": `${themeGap}px` } : null),
    ...(themePadding !== 16 ? { "--message-scroller-padding": `${themePadding}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[420px]">
      <div className="flex h-[480px] flex-col overflow-hidden rounded-[20px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] @max-[26rem]:h-[460px] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <header className="flex items-center gap-3 border-b border-foreground/[0.06] px-4 py-3">
          <img src="/demo/face-1.jpg" alt="" className="size-9 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="text-[14px] leading-tight font-semibold tracking-tight">Ana Ferreira</p>
            <p className="truncate text-[12px] text-muted-foreground">Host · Cliff cottage, Sagres · 12–16 May</p>
          </div>
        </header>

        <MessageScroller controller={controller} stickToEnd={stickToEnd} className="flex-1">
          <MessageScrollerViewport aria-label="Conversation with Ana">
            <MessageScrollerContent>
              {turns.map((turn) => (
                <MessageScrollerItem key={turn.id} value={turn.id} follow={turn.from === "guest" && follow}>
                  <TurnView turn={turn} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>

        <form
          className="flex items-center gap-2 border-t border-foreground/[0.06] p-3"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <input
            data-play="composer"
            aria-label="Message Ana"
            placeholder="Message Ana"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={field}
          />
          <button
            type="submit"
            data-play="send"
            aria-label="Send"
            disabled={!draft.trim()}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] outline-none transition-[scale,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.92] disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none"
          >
            <ArrowUp className="size-4" strokeWidth={2} />
          </button>
        </form>

        {/* The script's own hands: what a person would do by scrolling, and the host's side. */}
        <button type="button" hidden data-play="reread" onClick={() => controller.scrollToStart({ behavior: "smooth" })} />
        <button
          type="button"
          hidden
          data-play="incoming"
          onClick={() => {
            const turn = incoming[next.current]
            if (!turn) return
            next.current += 1
            setTurns((all) => [...all, turn])
          }}
        />
        <button
          type="button"
          hidden
          data-play="reset"
          onClick={() => {
            next.current = 0
            setTurns(history)
            setDraft("")
            requestAnimationFrame(() => controller.scrollToEnd({ behavior: "instant" }))
          }}
        />
      </div>
    </div>
  )
}
