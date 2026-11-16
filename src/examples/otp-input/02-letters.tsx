// Letters and digits
// `pattern="alphanumeric"` accepts letters too, for codes like A7K2.
import { OTPInput, OTPInputGroup, OTPInputSlot } from "@/components/ui/otp-input"

export default function OTPInputLetters() {
  return (
    <OTPInput maxLength={4} pattern="alphanumeric" aria-label="Room code">
      <OTPInputGroup>
        <OTPInputSlot index={0} />
        <OTPInputSlot index={1} />
        <OTPInputSlot index={2} />
        <OTPInputSlot index={3} />
      </OTPInputGroup>
    </OTPInput>
  )
}
