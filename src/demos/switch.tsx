import { Switch } from "@/components/ui/switch"

export const meta = { name: "Switch", group: "Forms" }

/* The demo plays itself: switches flip both ways, so the thumb stretches in each direction. */
export const play = [
  { click: 'li:nth-child(2) [role="switch"]', wait: 1100 },
  { click: 'li:nth-child(1) [role="switch"]', wait: 1100 },
  { click: 'li:nth-child(2) [role="switch"]', wait: 1100 },
  { click: 'li:nth-child(1) [role="switch"]', wait: 1500 },
]

const settings = [
  { id: "orders", label: "Order updates", hint: "Shipping, delivery and returns", on: true },
  { id: "price", label: "Price drops", hint: "On items in your wishlist", on: false },
  { id: "digest", label: "Weekly picks", hint: "Every Sunday morning", on: true },
  { id: "sms", label: "Text messages", hint: "Add a phone number first", on: false, disabled: true },
]

export default function SwitchDemo() {
  return (
    <div className="w-[360px]">
      <h3 className="text-[15px] font-semibold tracking-tight">Notifications</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">Choose what we email you about</p>
      <ul className="mt-4 divide-y divide-border">
        {settings.map((s) => (
          <li key={s.id}>
            <label
              className={[
                "flex cursor-pointer items-center justify-between gap-4 py-3",
                s.disabled ? "cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span className="flex flex-col gap-1">
                <span className={"text-[13px] leading-none font-medium" + (s.disabled ? " text-muted-foreground" : "")}>
                  {s.label}
                </span>
                <span className="text-[12px] leading-none text-muted-foreground">{s.hint}</span>
              </span>
              <Switch defaultChecked={s.on} disabled={s.disabled} />
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
