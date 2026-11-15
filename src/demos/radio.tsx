import { Radio, RadioGroup } from "@/components/ui/radio"

export const meta = { name: "Radio", group: "Forms" }

/* The demo plays itself: far jumps, so the selection ring glides across several cards. */
export const play = [
  { click: 'label:nth-of-type(1) [data-slot="radio"]', wait: 1400 },
  { click: 'label:nth-of-type(3) [data-slot="radio"]', wait: 1400 },
  { click: 'label:nth-of-type(2) [data-slot="radio"]', wait: 1400 },
]

const speeds = [
  { value: "standard", label: "Standard", when: "Arrives Thu 21 – Mon 25 Nov", price: "Free" },
  { value: "express", label: "Express", when: "Arrives Tue 19 Nov", price: "€6.90" },
  { value: "next-day", label: "Next day", when: "Order in 2 h 14 min for tomorrow", price: "€12.50" },
  { value: "pickup", label: "Pick up in store", when: "Not available for this order", price: "Free", disabled: true },
]

export default function RadioDemo() {
  return (
    <div className="w-[380px]">
      <h3 id="delivery" className="text-[15px] font-semibold tracking-tight">Delivery</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">Pour-over set and a linen apron</p>
      <RadioGroup
        aria-labelledby="delivery"
        defaultValue="express"
        className="mt-4 gap-2 [--kf-radio-pad:0px] before:z-10 before:rounded-[12px] before:shadow-[0_0_0_1.5px_var(--primary),0_2px_8px_-2px_rgb(0_0_0/0.14)] dark:before:shadow-[0_0_0_1.5px_var(--primary)]"
      >
        {speeds.map((speed) => (
          <label
            key={speed.value}
            className={[
              "flex cursor-pointer items-center gap-3 rounded-[12px] bg-background px-3.5 py-3",
              "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
              "transition-shadow duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.14)]",
              /* The card of the checked option is what the selection ring glides to. */
              "has-data-checked:[anchor-name:--kf-radio]",
              "has-data-disabled:cursor-not-allowed has-data-disabled:opacity-60 has-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.08)]",
            ].join(" ")}
          >
            <Radio value={speed.value} disabled={speed.disabled} className="data-checked:[anchor-name:none]" />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[13px] leading-none font-medium">{speed.label}</span>
              <span className="text-[12px] leading-none text-muted-foreground">{speed.when}</span>
            </span>
            <span className="text-[13px] font-medium tabular-nums">{speed.price}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
