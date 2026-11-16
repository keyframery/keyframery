import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/ui/password-input"

export default function Usage() {
  return (
    <PasswordInput>
      <PasswordInputControl aria-label="Password" />
      <PasswordInputToggle aria-label="Show password" />
    </PasswordInput>
  )
}
