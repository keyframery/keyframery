import { Approval } from "@/components/ui/approval"

export default function Usage() {
  return (
    <Approval
      title="Issue a refund"
      description="£84.00 back to Priya Shah's Visa ending 4242."
      target="Press “Refund order #1048”"
      risk="high"
      onApprove={() => {}}
      onDeny={() => {}}
    />
  )
}
