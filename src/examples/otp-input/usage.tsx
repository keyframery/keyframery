import { OTPInput, OTPInputGroup, OTPInputSlot } from "@/components/ui/otp-input"

export default function Usage() {
  return (
    <OTPInput maxLength={4} aria-label="Code">
      <OTPInputGroup>
        <OTPInputSlot index={0} />
        <OTPInputSlot index={1} />
        <OTPInputSlot index={2} />
        <OTPInputSlot index={3} />
      </OTPInputGroup>
    </OTPInput>
  )
}
