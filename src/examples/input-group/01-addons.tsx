// Text on both sides
// Addons sit before (`inline-start`) or after (`inline-end`) the input. Pressing their text focuses it.
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

export default function InputGroupAddons() {
  return (
    <InputGroup className="max-w-[320px]">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Shop address" defaultValue="fernandkiln" spellCheck={false} />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.shop</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}
