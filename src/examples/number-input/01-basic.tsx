// Stepper
// Buttons, arrow keys and typing all change it, kept between `min` and `max`. Shift and arrow keys step by ten.
import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@/components/ui/number-input"

export default function NumberInputBasic() {
  return (
    <NumberInput defaultValue={2} min={1} max={8} className="w-[160px]">
      <NumberInputGroup>
        <NumberInputDecrement aria-label="One guest fewer" />
        <NumberInputControl aria-label="Guests" />
        <NumberInputIncrement aria-label="One more guest" />
      </NumberInputGroup>
    </NumberInput>
  )
}
