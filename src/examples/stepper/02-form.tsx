// A multi-step form
// Linear by default: Continue moves on, and the step buttons go back to any step already reached. Panels arrive from the side you moved toward.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Stepper, StepperList, StepperPanel } from "@/components/ui/stepper"

const steps = [
  { value: "account", label: "Account" },
  { value: "team", label: "Team" },
  { value: "billing", label: "Billing" },
]

export default function StepperForm() {
  const [step, setStep] = React.useState("account")
  const index = steps.findIndex((s) => s.value === step)
  return (
    <Stepper aria-label="Set up workspace" steps={steps} value={step} onValueChange={setStep} className="max-w-lg">
      <StepperList />
      <div className="grid text-[13px] *:[grid-area:1/1]">
        <StepperPanel value="account">Choose a name and a password.</StepperPanel>
        <StepperPanel value="team">Invite the people you work with.</StepperPanel>
        <StepperPanel value="billing">Add a card. You won't be charged during the trial.</StepperPanel>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" disabled={index === 0} onClick={() => setStep(steps[index - 1].value)}>Back</Button>
        <Button variant="primary" disabled={index === steps.length - 1} onClick={() => setStep(steps[index + 1].value)}>Continue</Button>
      </div>
    </Stepper>
  )
}
