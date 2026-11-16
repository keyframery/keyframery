// Emails as tokens
// The value is a list of text and tokens. Turn a typed address into a token when it's followed by a space or comma. Backspace removes a whole token.
import * as React from "react"

import { TokenInput, TokenInputEditor, TokenInputToken, TokenInputTokenRemove } from "@/components/ui/token-input"

type Value = React.ComponentProps<typeof TokenInput>["defaultValue"] & {}

type Segment = Value[number]

const email = (address: string): Segment => ({ type: "email", value: address, label: address })

/* An address followed by a space, comma or semicolon becomes a token. */
function tokenize(value: Value): Value {
  const out: Segment[] = []
  for (const segment of value) {
    if (typeof segment !== "string") {
      out.push(segment)
      continue
    }
    segment.split(/([^\s,;]+@[^\s,;]+\.[a-z]{2,})[\s,;]+/i).forEach((part, i) => {
      if (i % 2) out.push(email(part))
      else if (part) out.push(part)
    })
  }
  return out
}

export default function TokenInputEmails() {
  const [value, setValue] = React.useState<Value>([email("maya@example.com")])
  return (
    <div className="w-full max-w-[360px]">
      <TokenInput
        value={value}
        onValueChange={(next) => setValue(tokenize(next))}
        renderToken={(token) => (
          <TokenInputToken>
            {token.label}
            <TokenInputTokenRemove />
          </TokenInputToken>
        )}
      >
        <TokenInputEditor aria-label="Invite" placeholder="Add emails, separated by commas" />
      </TokenInput>
    </div>
  )
}
