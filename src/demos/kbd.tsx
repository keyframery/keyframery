import * as React from "react"

import { KbdCombo } from "@/components/ui/kbd"

export const meta = { name: "Kbd", group: "Display" }

/* Each row presses its own shortcut when you click it, so the script can play them in turn. */
export const play = [
  { click: '[data-shortcut="search"]', wait: 1300 },
  { click: '[data-shortcut="palette"]', wait: 1500 },
  { click: '[data-shortcut="close"]', wait: 1300 },
  { click: '[data-shortcut="new"]', wait: 1700 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */
export const controls = {
  listen: { type: "switch", label: "Follow keyboard", default: true },
  held: { type: "switch", label: "Hold all keys", default: false },
  title: { type: "text", label: "Heading", default: "Keyboard shortcuts" },
  rows: { type: "slider", label: "Shortcuts", min: 1, max: 4, step: 1, default: 4 },
  gap: { type: "slider", label: "Gap", min: 0, max: 12, step: 1, default: 4, unit: "px", group: "Keys" },
  size: { type: "slider", label: "Key size", min: 20, max: 36, step: 1, default: 24, unit: "px", group: "Keys" },
  radius: { type: "slider", label: "Corners", min: 0, max: 14, step: 1, default: 6, unit: "px", group: "Keys" },
  font: { type: "slider", label: "Label size", min: 10, max: 16, step: 1, default: 12, unit: "px", group: "Keys" },
  face: { type: "color", label: "Key", default: "", group: "Colours" },
  ink: { type: "color", label: "Label", default: "", group: "Colours" },
} as const

const shortcuts = [
  { id: "search", label: "Search", keys: ["mod", "k"] },
  { id: "palette", label: "Command palette", keys: ["mod", "shift", "p"] },
  { id: "new", label: "New note", keys: ["mod", "alt", "n"] },
  { id: "close", label: "Close", keys: ["escape"] },
]

function Row({ id, label, keys, listen, held, gap }: (typeof shortcuts)[number] & { listen: boolean; held: boolean; gap: number }) {
  const [pressed, setPressed] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  /* Hold the keys long enough for the last one to sink, then let go. */
  const press = (e: React.MouseEvent<HTMLButtonElement>) => {
    const speed = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed")) || 1
    clearTimeout(timer.current)
    setPressed(true)
    timer.current = setTimeout(() => setPressed(false), (520 + keys.length * 70) * speed)
  }

  return (
    <li>
      <button
        type="button"
        data-shortcut={id}
        onClick={press}
        className="flex h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-[10px] px-3 text-left text-[13px] font-medium outline-none transition-[background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        {label}
        <KbdCombo keys={keys} pressed={pressed || held} listen={listen} style={{ gap }} />
      </button>
    </li>
  )
}

export default function KbdDemo({
  listen = true,
  held = false,
  title = "Keyboard shortcuts",
  rows = 4,
  gap = 4,
  size = 24,
  radius = 6,
  font = 12,
  face = "",
  ink = "",
}: {
  listen?: boolean
  held?: boolean
  title?: string
  rows?: number
  gap?: number
  size?: number
  radius?: number
  font?: number
  face?: string
  ink?: string
}) {
  /* The keys read these variables. A colour left empty keeps the theme's own. */
  const keys = {
    "--kbd-size": `${size}px`,
    "--kbd-radius": `${radius}px`,
    "--kbd-font": `${font}px`,
    ...(face ? { "--kbd-face": face } : null),
    ...(ink ? { "--kbd-ink": ink } : null),
  } as React.CSSProperties
  return (
    <div
      style={keys}
      className="w-full max-w-[340px] rounded-[16px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <div className="px-3 pt-2 pb-1.5 text-[11px] font-medium text-muted-foreground">{title}</div>
      <ul>
        {shortcuts.slice(0, rows).map((s) => (
          <Row key={s.id} {...s} listen={listen} held={held} gap={gap} />
        ))}
      </ul>
    </div>
  )
}
