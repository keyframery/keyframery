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

const shortcuts = [
  { id: "search", label: "Search", keys: ["mod", "k"] },
  { id: "palette", label: "Command palette", keys: ["mod", "shift", "p"] },
  { id: "new", label: "New note", keys: ["mod", "alt", "n"] },
  { id: "close", label: "Close", keys: ["escape"] },
]

function Row({ id, label, keys }: (typeof shortcuts)[number]) {
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
        <KbdCombo keys={keys} pressed={pressed} listen />
      </button>
    </li>
  )
}

export default function KbdDemo() {
  return (
    <div className="w-full max-w-[340px] rounded-[16px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="px-3 pt-2 pb-1.5 text-[11px] font-medium text-muted-foreground">Keyboard shortcuts</div>
      <ul>
        {shortcuts.map((s) => (
          <Row key={s.id} {...s} />
        ))}
      </ul>
    </div>
  )
}
