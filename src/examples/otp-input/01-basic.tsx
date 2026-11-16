// Six digits
// Typing moves along the slots, and a pasted or autofilled code fills them all. `onValueCommit` runs once every slot is filled.
import * as React from "react"

import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@/components/ui/otp-input"

export default function OTPInputBasic() {
  const [code, setCode] = React.useState<string | null>(null)
  return (
    <div className="flex flex-col items-center gap-3">
      <OTPInput maxLength={6} aria-label="Verification code" onValueChange={() => setCode(null)} onValueCommit={setCode}>
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
      <span className="text-[12px] text-muted-foreground tabular-nums">{code ? `Checking ${code}…` : "Enter the code we texted you"}</span>
    </div>
  )
}
