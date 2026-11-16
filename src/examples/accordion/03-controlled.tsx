// Controlled
// Pass `value` and `onValueChange` to open items from your own state.
import * as React from "react"

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const steps = ["Details", "Delivery", "Payment"]

export default function AccordionControlled() {
  const [open, setOpen] = React.useState<string[]>(["Details"])
  const next = () => {
    const i = steps.indexOf(open[0] ?? "")
    setOpen([steps[(i + 1) % steps.length]])
  }
  return (
    <div className="w-full max-w-[420px] space-y-3">
      <Accordion value={open} onValueChange={setOpen} className="w-full">
        {steps.map((step) => (
          <AccordionItem key={step} value={step}>
            <AccordionHeader>
              <AccordionTrigger>{step}</AccordionTrigger>
            </AccordionHeader>
            <AccordionPanel>Fill in your {step.toLowerCase()} here.</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Button size="sm" onClick={next}>
        Next step
      </Button>
    </div>
  )
}
