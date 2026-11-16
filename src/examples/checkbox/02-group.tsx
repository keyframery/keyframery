// Group with select all
// In a `CheckboxGroup` with `allValues`, a checkbox marked `parent` checks them all. It shows a dash when only some are.
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox"

const toppings = [
  { value: "cheese", label: "Extra cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
]

export default function CheckboxGroupExample() {
  return (
    <CheckboxGroup aria-label="Toppings" defaultValue={["cheese"]} allValues={toppings.map((t) => t.value)} className="text-[13px]">
      <label className="flex items-center gap-2.5 font-medium">
        <Checkbox parent />
        All toppings
      </label>
      {toppings.map((t) => (
        <label key={t.value} className="flex items-center gap-2.5 pl-6">
          <Checkbox value={t.value} />
          {t.label}
        </label>
      ))}
    </CheckboxGroup>
  )
}
