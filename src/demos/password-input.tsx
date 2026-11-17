import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  PasswordInput,
  PasswordInputCapsLock,
  PasswordInputControl,
  PasswordInputToggle,
} from "@/components/ui/password-input"

export const meta = { name: "Password Input", group: "Forms" }

/* Types a value one character at a time. */
function typeOut(into: string, text: string, step = 90) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into, wait: step }))
}

const field = 'form > [data-slot="field"]:nth-child(2)'

/* The demo plays itself: type a password, reveal it (the eye pops, the text comes into
   focus), hide it again. */
export const play = [
  { type: "", into: `${field} input`, wait: 200 },
  { click: `${field} [data-slot="field-label"]`, wait: 600 },
  ...typeOut(`${field} input`, "lisboa2024!", 110),
  { wait: 700 },
  { click: `${field} [data-slot="password-input-toggle"]`, wait: 2400 },
  { click: `${field} [data-slot="password-input-toggle"]`, wait: 1400 },
]

const rules = [
  { label: "8 characters", test: (v: string) => v.length >= 8 },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "A symbol", test: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
]

function Rule({ label, met }: { label: string; met: boolean }) {
  return (
    <li
      className={
        "flex items-center gap-1.5 text-[12px] leading-4 transition-colors duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none " +
        (met ? "text-foreground" : "text-muted-foreground")
      }
    >
      <span className="relative grid size-3.5 place-items-center">
        <span
          className={
            "absolute size-1 rounded-full bg-muted-foreground/50 transition-[opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none " +
            (met ? "scale-50 opacity-0" : "")
          }
        />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="oklch(0.62 0.16 150)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3.5"
        >
          <path
            d="m3.5 8.5 3 3 6-7"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={met ? 0 : 1}
            className="transition-[stroke-dashoffset] duration-[calc(300ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none"
          />
        </svg>
      </span>
      {label}
    </li>
  )
}

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  initialVisible: { type: "switch", label: "Reveal password", default: false, group: "Behaviour" },
  invalid: { type: "switch", label: "Invalid", default: false, group: "Behaviour" },
  toggle: { type: "switch", label: "Eye toggle", default: true, group: "Behaviour" },
  capsLock: { type: "switch", label: "Caps Lock warning", default: true, group: "Behaviour" },
  title: { type: "text", label: "Heading", default: "Create your account" },
  label: { type: "text", label: "Password label", default: "Password" },
  placeholder: { type: "text", label: "Placeholder", default: "At least 8 characters" },
  initialPassword: { type: "text", label: "Password", default: "" },
  width: { type: "slider", label: "Width", default: 340, min: 260, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Field gap", default: 20, min: 8, max: 32, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Field height", default: 36, min: 28, max: 52, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 10, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Field", default: "", group: "Colours" },
  ink: { type: "color", label: "Password", default: "", group: "Colours" },
  toggleColour: { type: "color", label: "Eye", default: "", group: "Colours" },
  focus: { type: "color", label: "Focus", default: "", group: "Colours" },
  errorColour: { type: "color", label: "Invalid", default: "", group: "Colours" },
} as const

export default function PasswordInputDemo({
  disabled = false,
  readOnly = false,
  required = false,
  initialVisible = false,
  invalid = false,
  toggle = true,
  capsLock = true,
  title = "Create your account",
  label = "Password",
  placeholder = "At least 8 characters",
  initialPassword = "",
  width = 340,
  gap = 20,
  height = 36,
  radius = 10,
  surface = "",
  ink = "",
  toggleColour = "",
  focus = "",
  errorColour = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  initialVisible?: boolean
  invalid?: boolean
  toggle?: boolean
  capsLock?: boolean
  title?: string
  label?: string
  placeholder?: string
  initialPassword?: string
  width?: number
  gap?: number
  height?: number
  radius?: number
  surface?: string
  ink?: string
  toggleColour?: string
  focus?: string
  errorColour?: string
}) {
  const theme = {
    "--password-input-height": `${height}px`,
    "--password-input-radius": `${radius}px`,
    ...(toggleColour ? { "--password-input-toggle": toggleColour } : {}),
    ...(errorColour ? { "--password-input-invalid": errorColour } : {}),
    ...(surface ? { "--password-input-surface": surface } : {}),
    ...(ink ? { "--password-input-ink": ink } : {}),
    ...(focus ? { "--password-input-focus": focus } : {}),
  } as React.CSSProperties
  const [password, setPassword] = React.useState(initialPassword)
  const [visible, setVisible] = React.useState(initialVisible)
  React.useEffect(() => setPassword(initialPassword), [initialPassword])
  React.useEffect(() => setVisible(initialVisible), [initialVisible])

  return (
    <form style={{ ...theme, maxWidth: width, gap }} className="flex w-full max-w-[340px] flex-col gap-5" onSubmit={(event) => event.preventDefault()}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">One login for every trip you plan.</p>
      </div>
      <Field name="password" invalid={invalid || undefined}>
        <FieldLabel>{label}</FieldLabel>
        <PasswordInput disabled={disabled} readOnly={readOnly} required={required} visible={visible} onVisibleChange={setVisible} autoComplete="new-password" value={password} onValueChange={(value) => setPassword(value)}>
          <PasswordInputControl placeholder={placeholder} />
          {capsLock && <PasswordInputCapsLock />}
          {toggle && <PasswordInputToggle aria-label="Show password" />}
        </PasswordInput>
        <ul className="mt-0.5 flex gap-4">
          {rules.map((rule) => (
            <Rule key={rule.label} label={rule.label} met={rule.test(password)} />
          ))}
        </ul>
      </Field>
      <Field name="wifi">
        <FieldLabel>Guest Wi-Fi</FieldLabel>
        <PasswordInput readOnly defaultValue="hollowfarm-2024">
          <PasswordInputControl />
          {toggle && <PasswordInputToggle aria-label="Show password" />}
        </PasswordInput>
        <FieldDescription>Network “HollowFarm-Guest”, from the note on the fridge.</FieldDescription>
      </Field>
      <Field name="old" disabled>
        <FieldLabel>Current password</FieldLabel>
        <PasswordInput defaultValue="hunter-two">
          <PasswordInputControl />
          {toggle && <PasswordInputToggle aria-label="Show password" />}
        </PasswordInput>
      </Field>
    </form>
  )
}
