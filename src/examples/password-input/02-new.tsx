// New password with rules
// `autoComplete="new-password"` lets password managers suggest one. Check the value as it changes.
import * as React from "react"

import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/ui/password-input"

const rules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^\w\s]/.test(p) },
]

export default function PasswordInputNew() {
  const [password, setPassword] = React.useState("")
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-2">
      <PasswordInput autoComplete="new-password" value={password} onValueChange={setPassword}>
        <PasswordInputControl aria-label="New password" placeholder="New password" />
        <PasswordInputToggle aria-label="Show password" />
      </PasswordInput>
      <ul className="flex gap-3 text-[12px]">
        {rules.map((rule) => (
          <li key={rule.label} className={rule.test(password) ? "text-foreground" : "text-muted-foreground"}>
            {rule.test(password) ? "✓ " : ""}
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
