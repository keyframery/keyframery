import * as React from "react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@/components/ui/otp-input"

export const meta = { name: "OTP Input", group: "Forms" }

const code = '[data-slot="otp-input"] input'

/* Types a code one digit at a time. */
function typeOut(text: string, step = 260) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into: code, wait: step }))
}

/* The demo plays itself: focus, fill the code digit by digit (the ring glides along and
   the slots pulse once when it is complete), then a mistyped code, then clear. */
export const play = [
  { type: "", into: code, wait: 300 },
  { click: '[data-slot="field-label"]', wait: 700 },
  ...typeOut("246810"),
  { wait: 1800 },
  { type: "", into: code, wait: 600 },
  ...typeOut("482913", 200),
  { wait: 1800 },
  { type: "", into: code, wait: 900 },
]

/* The code the "server" accepts. Anything else is turned away. */
const sent = "246810"

export default function OTPInputDemo() {
  const [wrong, setWrong] = React.useState(false)

  return (
    <div className="flex w-[340px] flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Check your phone</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          We sent a 6-digit code to <span className="text-foreground tabular-nums">+44 7700 900 418</span>.
        </p>
      </div>
      <Field invalid={wrong || undefined} className="gap-2.5">
        <FieldLabel className="sr-only">Verification code</FieldLabel>
        <OTPInput
          maxLength={6}
          pattern="digits"
          inputMode="numeric"
          onValueChange={() => setWrong(false)}
          onValueCommit={(code) => setWrong(code !== sent)}
        >
          <OTPInputGroup>
            <OTPInputSlot index={0} />
            <OTPInputSlot index={1} />
            <OTPInputSlot index={2} />
          </OTPInputGroup>
          <OTPInputSeparator />
          <OTPInputGroup>
            <OTPInputSlot index={3} />
            <OTPInputSlot index={4} />
            <OTPInputSlot index={5} />
          </OTPInputGroup>
        </OTPInput>
        <FieldError>That code didn't match. Check the latest message.</FieldError>
      </Field>
      <p className="text-[12px] text-muted-foreground">
        Didn't get it?{" "}
        <button
          type="button"
          className="cursor-pointer rounded-[4px] font-medium text-foreground underline decoration-foreground/25 underline-offset-[3px] outline-none transition-[text-decoration-color] duration-150 hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          Send a new code
        </button>
      </p>
    </div>
  )
}
