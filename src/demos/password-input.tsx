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
        "flex items-center gap-1.5 text-[12px] leading-4 transition-colors duration-150 motion-reduce:transition-none " +
        (met ? "text-foreground" : "text-muted-foreground")
      }
    >
      <span className="relative grid size-3.5 place-items-center">
        <span
          className={
            "absolute size-1 rounded-full bg-muted-foreground/50 transition-[opacity,scale] duration-150 motion-reduce:transition-none " +
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
            className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          />
        </svg>
      </span>
      {label}
    </li>
  )
}

export default function PasswordInputDemo() {
  const [password, setPassword] = React.useState("")

  return (
    <form className="flex w-[340px] flex-col gap-5" onSubmit={(event) => event.preventDefault()}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Create your account</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">One login for every trip you plan.</p>
      </div>
      <Field name="password">
        <FieldLabel>Password</FieldLabel>
        <PasswordInput autoComplete="new-password" value={password} onValueChange={(value) => setPassword(value)}>
          <PasswordInputControl placeholder="At least 8 characters" />
          <PasswordInputCapsLock />
          <PasswordInputToggle aria-label="Show password" />
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
          <PasswordInputToggle aria-label="Show password" />
        </PasswordInput>
        <FieldDescription>Network “HollowFarm-Guest”, from the note on the fridge.</FieldDescription>
      </Field>
      <Field name="old" disabled>
        <FieldLabel>Current password</FieldLabel>
        <PasswordInput defaultValue="hunter-two">
          <PasswordInputControl />
          <PasswordInputToggle aria-label="Show password" />
        </PasswordInput>
      </Field>
    </form>
  )
}
