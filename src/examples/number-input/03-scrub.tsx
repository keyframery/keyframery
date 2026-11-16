// Drag the label to change it
// Wrap the label in `NumberInputScrubArea` and dragging it sideways changes the value, as in design tools.
import { NumberInput, NumberInputControl, NumberInputGroup, NumberInputScrubArea } from "@/components/ui/number-input"

export default function NumberInputScrub() {
  return (
    <NumberInput defaultValue={24} min={0} max={200} className="w-[160px]">
      <NumberInputScrubArea pixelsPerStep={4}>
        <span className="cursor-ew-resize text-[13px] font-medium">Corner radius</span>
      </NumberInputScrubArea>
      <NumberInputGroup>
        <NumberInputControl aria-label="Corner radius" />
      </NumberInputGroup>
    </NumberInput>
  )
}
