import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const meta = { name: "Select", group: "Menus" }

/* The demo plays itself: the cabin list unfolds, the highlight glides, a cabin is chosen and its
   name rises into the field; then the same for the currency, and back again. */
export const play = [
  { click: "#kf-cabin", wait: 900 },
  { key: "ArrowDown", wait: 450 },
  { key: "Enter", wait: 1300 },
  { click: "#kf-currency", wait: 900 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 450 },
  { key: "Enter", wait: 1300 },
  { click: "#kf-cabin", wait: 900 },
  { key: "ArrowUp", wait: 450 },
  { key: "Enter", wait: 1100 },
  { click: "#kf-currency", wait: 900 },
  { key: "Home", wait: 450 },
  { key: "Enter", wait: 1300 },
]

const cabins = [
  { value: "economy", label: "Economy", price: "€640" },
  { value: "premium", label: "Premium economy", price: "€1,120" },
  { value: "business", label: "Business", price: "€2,980" },
  { value: "first", label: "First", price: "Sold out", disabled: true },
]

const currencies = [
  { value: "eur", label: "Euro", code: "EUR", symbol: "€" },
  { value: "usd", label: "US dollar", code: "USD", symbol: "$" },
  { value: "gbp", label: "Pound sterling", code: "GBP", symbol: "£" },
  { value: "jpy", label: "Japanese yen", code: "JPY", symbol: "¥" },
]

function Symbol({ children }: { children: string }) {
  return <span className="text-[13px] leading-none font-medium">{children}</span>
}

export default function SelectDemo() {
  return (
    <div className="w-full max-w-[400px] rounded-[16px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">London to Singapore</h3>
        <span className="text-[12px] text-muted-foreground tabular-nums">Thu 9 Oct · 1 stop</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Choose a cabin and how you would like to pay.</p>
      <div className="mt-4 grid grid-cols-[1fr_150px] gap-3">
        <Select defaultValue="premium" items={cabins}>
          <div>
            <SelectLabel>Cabin</SelectLabel>
            <SelectTrigger id="kf-cabin">
              <SelectValue />
            </SelectTrigger>
          </div>
          <SelectContent className="w-64">
            {cabins.map((cabin) => (
              <SelectItem key={cabin.value} value={cabin.value} disabled={cabin.disabled}>
                <SelectItemText>{cabin.label}</SelectItemText>
                <span className="text-[12px] text-muted-foreground tabular-nums">{cabin.price}</span>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="eur" items={currencies.map((c) => ({ value: c.value, label: c.code }))}>
          <div>
            <SelectLabel>Currency</SelectLabel>
            <SelectTrigger id="kf-currency">
              <SelectValue>
                {(state) => {
                  const c = currencies.find((x) => x.value === state.value)
                  return (
                    <span className="flex items-center gap-2">
                      <span className="w-3 text-center text-muted-foreground">{c?.symbol}</span>
                      {state.label}
                    </span>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
          </div>
          <SelectContent className="w-56">
            {currencies.map((c) => (
              <SelectItem key={c.value} value={c.value} label={c.code}>
                <SelectItemIcon>
                  <Symbol>{c.symbol}</Symbol>
                </SelectItemIcon>
                <SelectItemText>{c.label}</SelectItemText>
                <span className="text-[12px] text-muted-foreground">{c.code}</span>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
