import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@/components/ui/number-input"

export default function Usage() {
  return (
    <NumberInput defaultValue={1} min={0}>
      <NumberInputGroup>
        <NumberInputDecrement aria-label="Decrease" />
        <NumberInputControl aria-label="Quantity" />
        <NumberInputIncrement aria-label="Increase" />
      </NumberInputGroup>
    </NumberInput>
  )
}
