// With a button
// `InputGroupButton` is Keyframery's Button, sized to sit inside the field. Here it copies a link.
import { Check, Copy } from "lucide-react"
import * as React from "react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

export default function InputGroupWithButton() {
  const [copied, setCopied] = React.useState(false)
  const link = "https://cal.example/ines/30min"
  return (
    <InputGroup className="max-w-[340px]">
      <InputGroupInput aria-label="Booking link" readOnly value={link} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={copied ? "Copied" : "Copy link"}
          onClick={() => {
            navigator.clipboard?.writeText(link)
            setCopied(true)
          }}
        >
          {copied ? <Check /> : <Copy />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
