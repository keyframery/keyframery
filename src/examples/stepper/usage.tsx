import { Stepper, StepperList } from "@/components/ui/stepper"

export default function Usage() {
  return (
    <Stepper
      aria-label="Order progress"
      interactive={false}
      value="packed"
      steps={[
        { value: "placed", label: "Placed" },
        { value: "packed", label: "Packed" },
        { value: "shipped", label: "Shipped" },
      ]}
    >
      <StepperList />
    </Stepper>
  )
}
