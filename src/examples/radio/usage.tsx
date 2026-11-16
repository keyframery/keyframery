import { Radio, RadioGroup } from "@/components/ui/radio"

export default function Usage() {
  return (
    <RadioGroup aria-label="Size" defaultValue="m">
      <label>
        <Radio value="s" /> Small
      </label>
      <label>
        <Radio value="m" /> Medium
      </label>
    </RadioGroup>
  )
}
