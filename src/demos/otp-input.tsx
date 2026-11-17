import * as React from "react"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@/components/ui/otp-input"

export const meta = { name: "OTP Input", group: "Forms" }

const code = '[data-slot="otp-input"] input'

/* Types a code one digit at a time. */
function typeOut(text: string, step = 260) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into: code, wait: step }))
}

/* The demo plays itself: focus, fill the code digit by digit (the ring glides along and
   the slots pulse once when it is complete), then a mistyped code, then clear. */
export const play = [
  { type: "", into: code, wait: 300 },
  { click: '[data-slot="field-label"]', wait: 700 },
  ...typeOut("246810"),
  { wait: 1800 },
  { type: "", into: code, wait: 600 },
  ...typeOut("482913", 200),
  { wait: 1800 },
  { type: "", into: code, wait: 900 },
]

/* The code the "server" accepts. Anything else is turned away. */
const sent = "246810"

export const controls = {
  length: { type: "slider", label: "Code length", default: 6, min: 4, max: 8, step: 1, unit: "", group: "Behaviour" },
  pattern: { type: "select", label: "Characters", default: "digits", options: ["digits", "letters", "alphanumeric"] },
  inputMode: { type: "select", label: "Touch keyboard", default: "numeric", options: ["numeric", "text", "tel", "decimal", "none"] },
  textAlign: { type: "select", label: "Text alignment", default: "default", options: ["default", "start", "center", "end"] },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  separator: { type: "switch", label: "Group separator", default: true, group: "Behaviour" },
  invalid: { type: "switch", label: "Invalid", default: false, group: "Behaviour" },
  title: { type: "text", label: "Heading", default: "Check your phone" },
  phone: { type: "text", label: "Phone", default: "+44 7700 900 418" },
  slotWidth: { type: "slider", label: "Slot width", default: 40, min: 28, max: 48, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Slot height", default: 44, min: 32, max: 56, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Slot gap", default: 6, min: 2, max: 12, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 10, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Slot", default: "", group: "Colours" },
  active: { type: "color", label: "Active slot", default: "", group: "Colours" },
  ink: { type: "color", label: "Digits", default: "", group: "Colours" },
  focus: { type: "color", label: "Focus ring", default: "", group: "Colours" },
  errorColour: { type: "color", label: "Invalid", default: "", group: "Colours" },
} as const

export default function OTPInputDemo({
  length = 6,
  pattern = "digits",
  inputMode = "numeric",
  textAlign = "default",
  disabled = false,
  readOnly = false,
  required = false,
  separator = true,
  invalid = false,
  title = "Check your phone",
  phone = "+44 7700 900 418",
  slotWidth = 40,
  height = 44,
  gap = 6,
  radius = 10,
  surface = "",
  active = "",
  ink = "",
  focus = "",
  errorColour = "",
}: {
  length?: number
  pattern?: "digits" | "letters" | "alphanumeric"
  inputMode?: "numeric" | "text" | "tel" | "decimal" | "none"
  textAlign?: "default" | "start" | "center" | "end"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  separator?: boolean
  invalid?: boolean
  title?: string
  phone?: string
  slotWidth?: number
  height?: number
  gap?: number
  radius?: number
  surface?: string
  active?: string
  ink?: string
  focus?: string
  errorColour?: string
}) {
  const theme = {
    "--otp-input-width": `${slotWidth}px`,
    "--otp-input-height": `${height}px`,
    "--otp-input-radius": `${radius}px`,
    ...(errorColour ? { "--otp-input-invalid": errorColour } : {}),
    ...(surface ? { "--otp-input-surface": surface } : {}),
    ...(active ? { "--otp-input-active": active } : {}),
    ...(ink ? { "--otp-input-ink": ink } : {}),
    ...(focus ? { "--otp-input-focus": focus } : {}),
  } as React.CSSProperties
  const [wrong, setWrong] = React.useState(false)

  return (
    <div style={{ ...theme, maxWidth: Math.max(340, length * slotWidth + (length - 2) * gap + 8) }} className="flex w-full max-w-[340px] flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          We sent a {length}-digit code to <span className="text-foreground tabular-nums">{phone}</span>.
        </p>
      </div>
      <Field invalid={wrong || invalid || undefined} className="gap-2.5">
        <FieldLabel className="sr-only">Verification code</FieldLabel>
        <OTPInput
          maxLength={length}
          pattern={pattern}
          inputMode={inputMode}
          textAlign={textAlign === "default" ? undefined : textAlign}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onValueChange={() => setWrong(false)}
          onValueCommit={(code) => setWrong(code !== sent.padEnd(length, "0").slice(0, length))}
        >
          <OTPInputGroup style={{ gap }}>
            {Array.from({ length: Math.ceil(length / 2) }, (_, index) => <OTPInputSlot key={index} index={index} />)}
          </OTPInputGroup>
          {separator && <OTPInputSeparator />}
          <OTPInputGroup style={{ gap }}>
            {Array.from({ length: Math.floor(length / 2) }, (_, offset) => <OTPInputSlot key={offset} index={Math.ceil(length / 2) + offset} />)}
          </OTPInputGroup>
        </OTPInput>
        <FieldError>That code didn't match. Check the latest message.</FieldError>
      </Field>
      <p className="text-[12px] text-muted-foreground">
        Didn't get it?{" "}
        <button
          type="button"
          className="cursor-pointer rounded-[4px] font-medium text-foreground underline decoration-foreground/25 underline-offset-[3px] outline-none transition-[text-decoration-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          Send a new code
        </button>
      </p>
    </div>
  )
}
