"use client"

import * as React from "react"

import { login, type LoginState } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const [state, action, pending] = React.useActionState<LoginState, FormData>(login, { error: "" })
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="admin-password" className="text-sm font-medium">
        Password
      </label>
      <Input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus aria-invalid={Boolean(state.error)} />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Open admin"}
      </Button>
    </form>
  )
}
