import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Stepper, StepperList, StepperPanel, type StepperStepData } from "@/components/ui/stepper"

export const meta = { name: "Stepper", group: "Navigation" }

/* Go on twice, step back to Contact from its indicator, then on again. */
export const play = [
  { wait: 900 },
  { click: '[data-stepper-action="next"]', wait: 1300 },
  { click: '[data-stepper-action="next"]', wait: 1500 },
  { click: '[data-demo="checkout"] [data-slot="stepper-item"]:first-child [data-slot="stepper-step"]', wait: 1500 },
  { click: '[data-stepper-action="next"]', wait: 1300 },
  { click: '[data-stepper-action="next"]', wait: 1300 },
  { click: '[data-stepper-action="next"]', wait: 1800 },
]

export const controls = {
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  linear: { type: "switch", label: "Linear", default: true },
  interactive: { type: "switch", label: "Interactive", default: true },
  strip: { type: "switch", label: "Order progress strip", default: true },
  descriptions: { type: "switch", label: "Descriptions", default: true },
  error: { type: "select", label: "Step in error", options: ["none", "shipping", "payment"], default: "none" },
  start: { type: "select", label: "Order is at", options: ["placed", "paid", "packed", "shipped", "delivered"], default: "packed" },
  size: { type: "slider", label: "Indicator size", min: 22, max: 36, step: 1, default: 28, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Space before panel", min: 12, max: 40, step: 2, default: 24, unit: "px", group: "Layout" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  errorColor: { type: "color", label: "Error", default: "", group: "Colours" },
} as const

const order: StepperStepData[] = [
  { value: "placed", label: "Placed", description: "18 Nov" },
  { value: "paid", label: "Paid", description: "18 Nov" },
  { value: "packed", label: "Packed", description: "19 Nov" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
]

const checkout = [
  { value: "contact", label: "Contact", description: "Email and phone" },
  { value: "shipping", label: "Shipping", description: "Address and speed" },
  { value: "payment", label: "Payment", description: "Card details" },
  { value: "review", label: "Review", description: "Place the order" },
]

export default function StepperDemo({
  orientation = "horizontal",
  linear = true,
  interactive = true,
  strip = true,
  descriptions = true,
  error = "none",
  start = "packed",
  size = 28,
  gap = 24,
  accent = "",
  track = "",
  errorColor = "",
}: {
  orientation?: "horizontal" | "vertical"
  linear?: boolean
  interactive?: boolean
  strip?: boolean
  descriptions?: boolean
  error?: "none" | "shipping" | "payment"
  start?: "placed" | "paid" | "packed" | "shipped" | "delivered"
  size?: number
  gap?: number
  accent?: string
  track?: string
  errorColor?: string
}) {
  const [step, setStep] = React.useState("contact")
  const index = checkout.findIndex((s) => s.value === step)
  const steps = checkout.map((s) => ({ ...s, description: descriptions ? s.description : undefined, error: s.value === error }))

  const style = {
    "--stepper-size": `${size}px`,
    ...(accent ? { "--stepper-accent": accent } : null),
    ...(track ? { "--stepper-track": track } : null),
    ...(errorColor ? { "--stepper-error": errorColor } : null),
  } as React.CSSProperties

  return (
    <div style={style} className="flex w-full max-w-[600px] flex-col gap-4">
      {strip && (
        <div className="rounded-[16px] bg-background px-5 py-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
          <div className="mb-3 flex items-baseline justify-between text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Order #1048</span>
            <span>Arrives Fri 21 Nov</span>
          </div>
          <Stepper
            aria-label="Order progress"
            interactive={false}
            steps={order.map((s) => ({ ...s, description: descriptions ? s.description : undefined }))}
            value={start}
            completed={start === "delivered" ? order.map((s) => s.value) : undefined}
          >
            <StepperList />
          </Stepper>
        </div>
      )}
      <div
        data-demo="checkout"
        className="rounded-[16px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
      >
        <Stepper
          aria-label="Checkout"
          steps={steps}
          value={step}
          onValueChange={setStep}
          linear={linear}
          interactive={interactive}
          orientation={orientation}
          style={{ gap }}
        >
          <StepperList />
          <div className="grid min-w-0 *:[grid-area:1/1]">
            <StepperPanel value="contact" className="flex flex-col gap-3">
              <Field name="email">
                <FieldLabel>Email</FieldLabel>
                <Input type="email" defaultValue="maya.okafor@northwind-studio.com" />
              </Field>
            </StepperPanel>
            <StepperPanel value="shipping" className="flex flex-col gap-3">
              <Field name="address">
                <FieldLabel>Address</FieldLabel>
                <Input defaultValue="18 Clerkenwell Close, London EC1R 0AA" />
              </Field>
            </StepperPanel>
            <StepperPanel value="payment" className="flex flex-col gap-3">
              <Field name="card">
                <FieldLabel>Card number</FieldLabel>
                <Input inputMode="numeric" defaultValue="4242 4242 4242 4242" />
              </Field>
            </StepperPanel>
            <StepperPanel value="review" className="flex flex-col gap-1 text-[13px]">
              <div className="font-medium">3 items · $184.00</div>
              <div className="text-muted-foreground">Ships to London by Royal Mail, arrives Friday.</div>
            </StepperPanel>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button variant="ghost" data-stepper-action="back" disabled={index === 0} onClick={() => setStep(checkout[Math.max(0, index - 1)].value)}>
              Back
            </Button>
            <Button
              variant="primary"
              data-stepper-action="next"
              onClick={() => setStep(checkout[(index + 1) % checkout.length].value)}
            >
              {index === checkout.length - 1 ? "Start over" : "Continue"}
            </Button>
          </div>
        </Stepper>
      </div>
    </div>
  )
}
