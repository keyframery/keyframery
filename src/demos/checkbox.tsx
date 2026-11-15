import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox"

export const meta = { name: "Checkbox", group: "Forms" }

/* The demo plays itself: items check and uncheck, so boxes pop and checks draw, and the
   parent goes from mixed to checked and back. */
export const play = [
  { click: '[data-item="charger"] [data-slot="checkbox"]', wait: 1000 },
  { click: '[data-item="jacket"] [data-slot="checkbox"]', wait: 1300 },
  { click: '[data-item="charger"] [data-slot="checkbox"]', wait: 1000 },
  { click: '[data-item="jacket"] [data-slot="checkbox"]', wait: 1300 },
]

const items = [
  { value: "passport", label: "Passport", hint: "Expires March 2029" },
  { value: "charger", label: "Phone charger", hint: "EU plug adapter too" },
  { value: "sunscreen", label: "Sunscreen", hint: "Under 100 ml for the carry-on" },
  { value: "jacket", label: "Rain jacket", hint: "Showers on Thursday" },
]

const row = "flex cursor-pointer items-start gap-3 rounded-[10px] px-2.5 py-2 transition-colors duration-150 hover:bg-muted/60 has-data-disabled:cursor-not-allowed has-data-disabled:hover:bg-transparent motion-reduce:transition-none"

export default function CheckboxDemo() {
  return (
    <div className="w-[340px]">
      <h3 className="px-2.5 text-[15px] font-semibold tracking-tight">Packing for Lisbon</h3>
      <p className="mt-1 px-2.5 text-[12px] text-muted-foreground">Flight leaves Friday at 07:40</p>
      <CheckboxGroup
        aria-label="Packing list"
        defaultValue={["passport", "sunscreen"]}
        allValues={items.map((item) => item.value)}
        className="mt-4 gap-0.5"
      >
        <label className={row}>
          <Checkbox parent className="mt-px" />
          <span className="text-[13px] leading-[18px] font-medium">Everything packed</span>
        </label>
        <div className="mx-2.5 my-1 h-px bg-border" />
        {items.map((item) => (
          <label key={item.value} data-item={item.value} className={row}>
            <Checkbox value={item.value} className="mt-px" />
            <span className="flex flex-col gap-1">
              <span className="text-[13px] leading-[18px] font-medium">{item.label}</span>
              <span className="text-[12px] leading-none text-muted-foreground">{item.hint}</span>
            </span>
          </label>
        ))}
      </CheckboxGroup>
      <label className={row + " mt-0.5 opacity-100"}>
        <Checkbox disabled defaultChecked className="mt-px" />
        <span className="flex flex-col gap-1">
          <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">Boarding pass</span>
          <span className="text-[12px] leading-none text-muted-foreground">Added to your wallet by the airline</span>
        </span>
      </label>
    </div>
  )
}
