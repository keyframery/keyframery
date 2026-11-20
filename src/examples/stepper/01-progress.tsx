// A read-only progress strip
// With `interactive={false}` the steps are text, not buttons, and the current one carries `aria-current="step"`. Pass every value to `completed` for a finished order.
import { Stepper, StepperList } from "@/components/ui/stepper"

const steps = [
  { value: "placed", label: "Placed", description: "18 Nov" },
  { value: "paid", label: "Paid", description: "18 Nov" },
  { value: "packed", label: "Packed", description: "19 Nov" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
]

export default function StepperProgress() {
  return (
    <Stepper aria-label="Order progress" interactive={false} steps={steps} value="paid" className="max-w-xl">
      <StepperList />
    </Stepper>
  )
}
