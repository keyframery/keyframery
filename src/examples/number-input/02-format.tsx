// Currency and percent
// `format` takes `Intl.NumberFormat` options. People type a plain number; the field shows it formatted.
import { NumberInput, NumberInputControl, NumberInputGroup } from "@/components/ui/number-input"

export default function NumberInputFormat() {
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <NumberInput defaultValue={1250} min={0} format={{ style: "currency", currency: "EUR" }}>
        <NumberInputGroup>
          <NumberInputControl aria-label="Budget" />
        </NumberInputGroup>
      </NumberInput>
      <NumberInput defaultValue={0.2} min={0} max={1} format={{ style: "percent" }}>
        <NumberInputGroup>
          <NumberInputControl aria-label="Discount" />
        </NumberInputGroup>
      </NumberInput>
    </div>
  )
}
