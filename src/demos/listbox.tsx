import * as React from "react"

import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/ui/listbox"

export const meta = { name: "Listbox", group: "Menus" }

/* The demo plays itself: toppings are added and removed (the check draws, the box pops) while the
   highlight glides between rows; then the crust changes and changes back. */
const topping = (n: number) => `[aria-labelledby="toppings-label"] > [data-slot=listbox-item]:nth-child(${n})`
const crust = (n: number) => `[aria-labelledby="crust-label"] > [data-slot=listbox-item]:nth-child(${n})`
export const play = [
  { click: topping(3), wait: 800 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 600 },
  { key: " ", wait: 900 },
  { key: " ", wait: 600 },
  { key: "ArrowUp", wait: 450 },
  { key: "ArrowUp", wait: 600 },
  { key: " ", wait: 900 },
  { click: crust(1), wait: 900 },
  { key: "ArrowDown", wait: 700 },
  { click: crust(3), wait: 1200 },
]

const crusts = [
  { value: "thin", label: "Thin and crisp" },
  { value: "classic", label: "Classic" },
  { value: "sourdough", label: "Sourdough, 48h" },
]

const toppings = [
  { value: "basil", label: "Fresh basil", price: 0.5 },
  { value: "burrata", label: "Burrata", price: 3 },
  { value: "mushroom", label: "Wild mushrooms", price: 2 },
  { value: "olive", label: "Black olives", price: 1 },
  { value: "nduja", label: "’Nduja", price: 2.5 },
  { value: "anchovy", label: "Anchovies", price: 2, disabled: true },
]

const base = 9
const euro = (n: number) => `€${n.toFixed(2)}`

export default function ListboxDemo() {
  const [picked, setPicked] = React.useState<string[]>(["basil", "burrata"])
  const total = base + toppings.filter((t) => picked.includes(t.value)).reduce((sum, t) => sum + t.price, 0)

  return (
    <div className="@container w-full max-w-[460px]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">Build your pizza</h3>
        <span className="text-[13px] font-medium tabular-nums">{euro(total)}</span>
      </div>
      <div className="mt-4 grid grid-cols-[160px_1fr] gap-3 @max-[26rem]:grid-cols-1 @max-[26rem]:gap-4">
        <div>
          <div id="crust-label" className="mb-2 text-[12px] font-medium text-muted-foreground">
            Crust
          </div>
          <Listbox aria-labelledby="crust-label" defaultValue="sourdough">
            {crusts.map((c) => (
              <ListboxItem key={c.value} value={c.value}>
                {c.label}
                <ListboxItemIndicator />
              </ListboxItem>
            ))}
          </Listbox>
        </div>
        <div>
          <div id="toppings-label" className="mb-2 flex justify-between text-[12px] font-medium text-muted-foreground">
            Toppings
            <span className="tabular-nums">{picked.length} chosen</span>
          </div>
          <Listbox
            aria-labelledby="toppings-label"
            multiple
            value={picked}
            onValueChange={(value) => setPicked(value)}
          >
            {toppings.map((t) => (
              <ListboxItem key={t.value} value={t.value} label={t.label} disabled={t.disabled}>
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {t.disabled ? "Out today" : `+${euro(t.price)}`}
                </span>
                <ListboxItemIndicator className="ms-1" />
              </ListboxItem>
            ))}
          </Listbox>
        </div>
      </div>
    </div>
  )
}
