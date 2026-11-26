import { ArrowUp, CheckCheck } from "lucide-react"
import * as React from "react"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@/components/ui/message"

export const meta = { name: "Message", group: "AI" }

/* The demo plays itself: you send the reply that is typed in, it rises in on your side, and Maya's
   answer arrives a moment later: avatar, name, bubble and time landing one after another. */
export const play = [
  { wait: 1000 },
  { click: '[data-play="send"]', wait: 3400 },
  { click: '[data-play="reset"]', wait: 900 },
]

export const controls = {
  align: { type: "select", label: "Your messages", options: ["end", "start"], default: "end" },
  variant: { type: "select", label: "Their bubbles", options: ["muted", "secondary", "tinted", "outline"], default: "muted" },
  avatars: { type: "switch", label: "Avatars", default: true },
  themeFace: { type: "color", label: "Incoming bubble surface", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Sender and receipt", default: "", group: "Colours" },
  themeFont: { type: "slider", label: "Sender size", min: 10, max: 18, step: 1, default: 12, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Avatar gap", min: 4, max: 24, step: 1, default: 10, unit: "px", group: "Layout" },
  themeTurnGap: { type: "slider", label: "Turn spacing", min: 4, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
  themeContentGap: { type: "slider", label: "Bubble spacing", min: 0, max: 16, step: 1, default: 4, unit: "px", group: "Layout" },
  themeAvatarSize: { type: "slider", label: "Avatar size", min: 24, max: 48, step: 1, default: 32, unit: "px", group: "Layout" },
} as const

type Variant = (typeof controls.variant.options)[number]

type Post = { id: string; who: "maya" | "theo" | "priya" | "you"; time: string; lines: string[]; footer?: boolean }

const people = {
  maya: { name: "Maya Lindqvist", photo: "/demo/face-3.jpg" },
  theo: { name: "Theo Okafor", photo: "/demo/face-4.jpg" },
  priya: { name: "Priya Raman", photo: "/demo/face-2.jpg" },
  you: { name: "You", photo: "" },
}

const start: Post[] = [
  { id: "p0", who: "priya", time: "6:51", lines: ["Forecast says dry until 3pm, then showers."] },
  { id: "p1", who: "maya", time: "7:02", lines: ["Trailhead car park fills by 8.", "Meet at 7:40 by the ranger hut?"] },
  { id: "p2", who: "theo", time: "7:05", lines: ["I'll bring the spare poles and the stove."] },
]
const draftText = "I can drive three from Elm Street."
const answer: Post = { id: "p4", who: "maya", time: "7:09", lines: ["Perfect, save me a seat. Bring a layer, it's 4° at the top."] }

function PostView({ post, align, variant, avatars }: { post: Post; align: "start" | "end"; variant: Variant; avatars: boolean }) {
  const mine = post.who === "you"
  const person = people[post.who]
  return (
    <Message align={mine ? align : "start"}>
      {avatars && !mine && (
        <MessageAvatar>
          <img src={person.photo} alt="" />
        </MessageAvatar>
      )}
      <MessageContent>
        {!mine && (
          <MessageHeader>
            {person.name}
            <time>{post.time}</time>
          </MessageHeader>
        )}
        {post.lines.map((line) => (
          <Bubble key={line} variant={mine ? "default" : variant} align={mine ? align : "start"}>
            <BubbleContent>{line}</BubbleContent>
          </Bubble>
        ))}
        {post.footer && (
          <MessageFooter>
            <CheckCheck aria-hidden /> {post.time} · Seen by Maya, Theo
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  )
}

export default function MessageDemo({
  align = "end",
  variant = "muted",
  avatars = true,
  themeFace = "",
  themeMuted = "",
  themeFont = 12,
  themeGap = 10,
  themeTurnGap = 16,
  themeContentGap = 4,
  themeAvatarSize = 32,
}: {
  align?: "end" | "start"
  variant?: Variant
  avatars?: boolean
  themeFace?: string
  themeMuted?: string
  themeFont?: number
  themeGap?: number
  themeTurnGap?: number
  themeContentGap?: number
  themeAvatarSize?: number
}) {
  const [posts, setPosts] = React.useState(start)
  const [draft, setDraft] = React.useState(draftText)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const send = (el: HTMLElement) => {
    if (!draft.trim()) return
    const speed = parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed")) || 1
    setPosts((all) => [...all, { id: `you-${all.length}`, who: "you", time: "7:08", lines: [draft.trim()], footer: true }])
    setDraft("")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPosts((all) => [...all, answer]), 1500 * speed)
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--message-face": themeFace } : null),
    ...(themeMuted ? { "--message-muted": themeMuted } : null),
    ...(themeFont !== 12 ? { "--message-font": `${themeFont}px` } : null),
    ...(themeGap !== 10 ? { "--message-gap": `${themeGap}px` } : null),
    ...(themeTurnGap !== 16 ? { "--message-turn-gap": `${themeTurnGap}px` } : null),
    ...(themeContentGap !== 4 ? { "--message-content-gap": `${themeContentGap}px` } : null),
    ...(themeAvatarSize !== 32 ? { "--message-avatar-size": `${themeAvatarSize}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[440px]">
      <div className="overflow-hidden rounded-[20px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <header className="flex items-center justify-between gap-3 border-b border-foreground/[0.06] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-tight">Saturday: Ridge loop</p>
            <p className="truncate text-[12px] text-muted-foreground">14 km · 820 m up · 6 going</p>
          </div>
          <div className="flex shrink-0 -space-x-2">
            {[people.maya.photo, people.theo.photo, "/demo/face-2.jpg"].map((src) => (
              <img key={src} src={src} alt="" className="size-7 rounded-full object-cover ring-2 ring-background dark:ring-card" />
            ))}
          </div>
        </header>

        <MessageGroup className="h-[380px] justify-end overflow-hidden px-4 pt-4 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_48px)] @max-[26rem]:h-[340px]">
          {posts.map((post) => (
            <PostView key={post.id} post={post} align={align} variant={variant} avatars={avatars} />
          ))}
        </MessageGroup>

        <form
          className="flex items-center gap-2 border-t border-foreground/[0.06] p-3"
          onSubmit={(e) => {
            e.preventDefault()
            send(e.currentTarget)
          }}
        >
          <input
            aria-label="Message the group"
            placeholder="Message the group"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-9 min-w-0 flex-1 rounded-full bg-background px-3.5 text-[13.5px] outline-none placeholder:text-muted-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklab,var(--ring)_25%,transparent)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]"
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
        <button
          type="button"
          hidden
          data-play="reset"
          onClick={() => {
            clearTimeout(timer.current)
            setPosts(start)
            setDraft(draftText)
          }}
        />
      </div>
    </div>
  )
}
