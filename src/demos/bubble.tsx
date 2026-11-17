import * as React from "react"

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble"

export const meta = { name: "Bubble", group: "Chat" }

/* The demo plays itself: the client taps a quick reply, it pops in as their bubble, the chef's answer
   pops in after it, and a heart lands on the reply. Then the chat starts over. */
export const play = [
  { wait: 1000 },
  { click: '[data-reply="tarte"]', wait: 3600 },
  { click: '[data-play="reset"]', wait: 900 },
]

export const controls = {
  variant: { type: "select", label: "Chef's bubbles", options: ["muted", "secondary", "tinted", "outline"], default: "muted" },
  reactions: { type: "switch", label: "Reactions", default: true },
  side: { type: "select", label: "Reaction side", options: ["bottom", "top"], default: "bottom" },
  themeFace: { type: "color", label: "Incoming surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Incoming text", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Bubble corners", min: 0, max: 30, step: 1, default: 18, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Message size", min: 11, max: 20, step: 1, default: 14, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Side padding", min: 0, max: 32, step: 1, default: 14, unit: "px", group: "Layout" },
  themeInsetY: { type: "slider", label: "Vertical padding", min: 0, max: 24, step: 1, default: 8, unit: "px", group: "Layout" },
  themeMaxWidth: { type: "slider", label: "Bubble width", min: 50, max: 100, step: 1, default: 80, unit: "%", group: "Layout" },
} as const

type Variant = (typeof controls.variant.options)[number]

const replies = [
  { id: "tarte", text: "Shallot tarte tatin, please" },
  { id: "salad", text: "The beetroot salad" },
]

export default function BubbleDemo({
  variant = "muted",
  reactions = true,
  side = "bottom",
  themeFace = "",
  themeInk = "",
  themeRadius = 18,
  themeFont = 14,
  themeInsetX = 14,
  themeInsetY = 8,
  themeMaxWidth = 80,
}: {
  variant?: Variant
  reactions?: boolean
  side?: "bottom" | "top"
  themeFace?: string
  themeInk?: string
  themeRadius?: number
  themeFont?: number
  themeInsetX?: number
  themeInsetY?: number
  themeMaxWidth?: number
}) {
  const [picked, setPicked] = React.useState<string | null>(null)
  const [answered, setAnswered] = React.useState(false)
  const [hearted, setHearted] = React.useState(false)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const pick = (id: string, el: HTMLElement) => {
    const speed = parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed")) || 1
    setPicked(id)
    timers.current.push(setTimeout(() => setAnswered(true), 1100 * speed))
    timers.current.push(setTimeout(() => setHearted(true), 2000 * speed))
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPicked(null)
    setAnswered(false)
    setHearted(false)
  }

  const reply = replies.find((r) => r.id === picked)

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--bubble-face": themeFace } : null),
    ...(themeInk ? { "--bubble-ink": themeInk } : null),
    ...(themeRadius !== 18 ? { "--bubble-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 14 ? { "--bubble-font": `${themeFont}px` } : null),
    ...(themeInsetX !== 14 ? { "--bubble-inset-x": `${themeInsetX}px` } : null),
    ...(themeInsetY !== 8 ? { "--bubble-inset-y": `${themeInsetY}px` } : null),
    ...(themeMaxWidth !== 80 ? { "--bubble-max-width": `${themeMaxWidth}%` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[400px]">
      <div className="rounded-[20px] bg-background dark:[--bubble-cutout:var(--card)] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <header className="flex items-baseline justify-between gap-3 border-b border-foreground/[0.06] px-4 py-3">
          <p className="text-[14px] font-semibold tracking-tight">Inès Moreau, private chef</p>
          <p className="shrink-0 text-[12px] text-muted-foreground tabular-nums">Dinner for 8 · Sat</p>
        </header>

        <div className="flex h-[360px] flex-col [justify-content:safe_flex-end] gap-4 overflow-y-auto [scrollbar-width:thin] *:shrink-0 px-4 @max-[26rem]:h-[320px] pt-5 pb-4 [mask-image:linear-gradient(to_bottom,transparent,black_20px)]">
          <Bubble variant={variant}>
            <BubbleContent>Hello! I'm putting Saturday's menu together. How many of you, and any diets?</BubbleContent>
          </Bubble>
          <Bubble align="end" variant="default">
            <BubbleContent>We're 8, and Clara is vegetarian.</BubbleContent>
          </Bubble>
          <BubbleGroup>
            <Bubble variant={variant}>
              <BubbleContent>The shallots from Thursday's market are lovely.</BubbleContent>
            </Bubble>
            <Bubble variant={variant}>
              <BubbleContent>To start: shallot tarte tatin, or beetroot salad with whipped feta?</BubbleContent>
            </Bubble>
          </BubbleGroup>

          {reply && (
            <Bubble align="end" variant="default" className={reactions && hearted ? (side === "bottom" ? "mb-3" : "mt-3") : undefined}>
              <BubbleContent>{reply.text}</BubbleContent>
              {reactions && hearted && (
                <BubbleReactions side={side} align="start" aria-label="Inès loved this">
                  ❤️
                </BubbleReactions>
              )}
            </Bubble>
          )}

          {answered && (
            <Bubble variant={variant}>
              <BubbleContent>Perfect. I'll bring it warm at 7, with crème fraîche.</BubbleContent>
            </Bubble>
          )}
        </div>

        {/* Quick replies: bubbles that are buttons. */}
        <div
          aria-label="Quick replies"
          role="group"
          className="flex flex-wrap justify-end gap-2 border-t border-foreground/[0.06] px-4 py-3 transition-opacity duration-[calc(200ms*var(--kf-speed,1))] ease-house aria-disabled:opacity-40 motion-reduce:transition-none"
          aria-disabled={picked ? true : undefined}
        >
          {replies.map((r) => (
            <Bubble key={r.id} variant="outline" align="end" className="max-w-full">
              <BubbleContent
                render={<button type="button" data-reply={r.id} disabled={!!picked} />}
                onClick={(e: React.MouseEvent<HTMLElement>) => pick(r.id, e.currentTarget)}
                className="py-1.5 text-[13px] font-medium disabled:cursor-default"
              >
                {r.text}
              </BubbleContent>
            </Bubble>
          ))}
        </div>
        <button type="button" hidden data-play="reset" onClick={reset} />
      </div>
    </div>
  )
}
