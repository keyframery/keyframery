"use client"

import { LockKeyhole } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/ui/password-input"
import { LogoMark } from "@site/components/logo"

type State = { error: string | null }

/** The one door into /admin: the password from KEYFRAMERY_ADMIN_PASSWORD. */
export function SignInForm({ action, ready }: { action: (state: State, form: FormData) => Promise<State>; ready: boolean }) {
  const [state, submit, pending] = React.useActionState(action, { error: null })
  const [password, setPassword] = React.useState("")
  return (
    <main className="grid min-h-svh place-items-center bg-[color-mix(in_oklab,var(--muted)_55%,var(--background))] px-4 py-10 dark:bg-card">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark className="size-7" />
          <span className="text-[15px] font-semibold tracking-tight">Keyframery admin</span>
        </div>
        <form action={submit} className="flex flex-col gap-5 rounded-[18px] bg-background p-6 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_-20px_rgb(0_0_0/0.25)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
          <div>
            <h1 className="flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em]">
              <LockKeyhole aria-hidden className="size-4.5 text-muted-foreground" />
              Sign in
            </h1>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">Analytics for keyframery.com. Only the owner has the password.</p>
          </div>
          <Field name="password" invalid={!!state.error} className="flex flex-col gap-1.5">
            <FieldLabel>Password</FieldLabel>
            <PasswordInput name="password" value={password} onValueChange={setPassword} autoComplete="current-password" disabled={!ready}>
              <PasswordInputControl aria-label="Password" autoFocus />
              <PasswordInputToggle aria-label="Show password" />
            </PasswordInput>
            {state.error && <FieldError>{state.error}</FieldError>}
          </Field>
          <Button type="submit" variant="primary" size="lg" disabled={pending || !ready || !password} className="w-full">
            {pending ? "Checking…" : "Sign in"}
          </Button>
          {!ready && <p className="text-[12.5px] text-destructive">The admin password isn't set on this server, so nobody can sign in.</p>}
        </form>
      </div>
    </main>
  )
}
