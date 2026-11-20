// Vertical, non-linear, with an error
// `orientation="vertical"` hangs the line under each indicator. `linear={false}` lets any step be chosen; a step with `error` shows it wherever it is.
import { Stepper, StepperList } from "@/components/ui/stepper"

const steps = [
  { value: "details", label: "Details", description: "Name and logo" },
  { value: "domain", label: "Domain", description: "DNS records not found", error: true },
  { value: "email", label: "Email", description: "Sender address" },
  { value: "launch", label: "Launch" },
]

export default function StepperVertical() {
  return (
    <Stepper aria-label="Store setup" orientation="vertical" linear={false} steps={steps} defaultValue="email" className="max-w-xs">
      <StepperList />
    </Stepper>
  )
}
