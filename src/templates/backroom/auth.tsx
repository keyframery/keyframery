"use client"

/* Sign in, two-step code, sign up, forgot password and reset password. Full screen, outside the
   shell, each with validation, a busy state and plain error messages.

   ─── Replace `auth` with your sign-in service ───────────────────────────────────────────────────
   Every page talks only to the `auth` object below. It checks the sample team in memory: every
   member's password is `tideline-2026`, and the two-step code is `246810`. To go live, keep the
   same five functions and call your backend (Auth.js, Clerk, Supabase, your own API) from them. */

import { ArrowLeft, MailCheck } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@/components/ui/otp-input"
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

import { LabelledField, linkLook } from "./kit"
import { linkProps, useRouter } from "./router"
import { type State, toaster, useStore } from "./store"

/* ------------------------------------------------------------------ the service */

const DEMO_PASSWORD = "tideline-2026"
const DEMO_CODE = "246810"
/** Passwords changed this session (Settings › Account, Reset password), by email. */
const changed = new Map<string, string>()
const wait = (ms = 650) => new Promise((resolve) => setTimeout(resolve, ms))

export const passwordRules = [
  { label: "8 characters", test: (p: string) => p.length >= 8 },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^\w\s]/.test(p) },
]

/** Whether a password is right for an email. Used by Settings › Account too. */
export const checkPassword = (email: string, password: string) => password === (changed.get(email.toLowerCase()) ?? DEMO_PASSWORD)

type Result<T = object> = ({ ok: true } & T) | { ok: false; field?: string; error: string }

export const auth = {
  async signIn(state: State, email: string, password: string): Promise<Result<{ memberId: string; needsCode: boolean }>> {
    await wait()
    const member = state.team.find((m) => m.email === email.trim().toLowerCase())
    if (!member || !checkPassword(member.email, password)) return { ok: false, error: "That email and password don't match. Check both, or reset your password." }
    if (member.status === "invited") return { ok: false, field: "email", error: "This invitation hasn't been accepted yet. Open the link in the email." }
    return { ok: true, memberId: member.id, needsCode: state.account.twoStep }
  },
  async verifyCode(memberId: string, code: string): Promise<Result> {
    await wait(500)
    return code === DEMO_CODE && memberId ? { ok: true } : { ok: false, error: "That code isn't right, or it has expired. Codes change every 30 seconds." }
  },
  async register(state: State, name: string, email: string, password: string): Promise<Result> {
    await wait(800)
    if (state.team.some((m) => m.email === email)) return { ok: false, field: "email", error: "There's already an account with this email. Sign in instead." }
    changed.set(email, password)
    return { ok: true }
  },
  async requestReset(email: string): Promise<Result> {
    await wait()
    // Always answer the same way, so the page doesn't reveal who has an account.
    return email ? { ok: true } : { ok: false, field: "email", error: "Enter your email." }
  },
  async resetPassword(email: string, token: string, password: string): Promise<Result> {
    await wait()
    if (token !== "demo") return { ok: false, error: "This link has expired. Ask for a new one." }
    changed.set(email.toLowerCase(), password)
    return { ok: true }
  },
  /** Settings › Account: a new password for the signed-in person. */
  setPassword(email: string, password: string) {
    changed.set(email.toLowerCase(), password)
  },
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim())

/* ------------------------------------------------------------------ the frame */

function AuthFrame({ title, description, children, footer }: { title: string; description: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  const { state } = useStore()
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2.5">
          <img src="/demo/coast-1.jpg" alt="" className="size-8 rounded-[9px] object-cover ring-1 ring-black/10" />
          <span className="text-[14px] font-semibold tracking-tight">{state.settings.name}</span>
        </div>
        <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center gap-7 py-12">
          <div className="flex flex-col gap-2">
            <h1 data-page-heading tabIndex={-1} className="text-[26px] leading-tight font-semibold tracking-tight outline-none">
              {title}
            </h1>
            <p className="text-[14px] text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer && <div className="text-[13px] text-muted-foreground">{footer}</div>}
        </div>
        <p className="text-[12px] text-muted-foreground">© 2026 {state.settings.legalName}</p>
      </main>
      <aside aria-hidden className="relative hidden overflow-hidden lg:block">
        <img src="/demo/coast-5.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <figure className="absolute inset-x-10 bottom-10 flex flex-col gap-3 text-white">
          <blockquote className="max-w-[440px] text-[20px] leading-snug font-medium tracking-tight">
            "Every print is made to order in the studio in Galway, and every order goes out from this desk."
          </blockquote>
          <figcaption className="text-[13px] text-white/75">Pebble shore, from the Coast collection</figcaption>
        </figure>
      </aside>
    </div>
  )
}

function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  const router = useRouter()
  return (
    <Button variant="ghost" size="sm" className={cn(linkLook, "font-medium text-foreground")} render={<a {...linkProps(router, to)} />}>
      {children}
    </Button>
  )
}

function Password({ label, value, onChange, autoComplete, error, hint, autoFocusOnArrival }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string; error?: string; hint?: React.ReactNode; autoFocusOnArrival?: boolean }) {
  return (
    <LabelledField label={label} error={error} hint={hint}>
      <PasswordInput autoComplete={autoComplete} value={value} onValueChange={onChange} data-page-autofocus={autoFocusOnArrival ? "" : undefined}>
        <PasswordInputControl aria-label={label} />
        <PasswordInputToggle aria-label={`Show ${label.toLowerCase()}`} />
      </PasswordInput>
    </LabelledField>
  )
}

function Rules({ password }: { password: string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]" aria-label="Password rules">
      {passwordRules.map((rule) => {
        const met = rule.test(password)
        return (
          <li key={rule.label} className={cn("flex items-center gap-1.5 transition-colors", met ? "text-foreground" : "text-muted-foreground")}>
            <span aria-hidden className={cn("size-1.5 rounded-full transition-colors", met ? "bg-[oklch(0.62_0.16_150)]" : "bg-muted-foreground/40")} />
            {rule.label}
            <span className="sr-only">{met ? ", done" : ", not yet"}</span>
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ sign in */

export function SignInPage() {
  const { state } = useStore()
  const router = useRouter()
  const [email, setEmail] = React.useState(router.query.get("email") ?? "")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [busy, setBusy] = React.useState(false)
  const { actions } = useStore()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!isEmail(email)) next.email = "Enter your email, like you@example.com."
    if (!password) next.password = "Enter your password."
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const result = await auth.signIn(state, email, password)
    setBusy(false)
    if (!result.ok) return setErrors({ [result.field ?? "password"]: result.error })
    if (result.needsCode) return router.navigate(`/verify?member=${result.memberId}`)
    actions.signIn(result.memberId)
    router.navigate("/")
  }

  return (
    <AuthFrame
      title="Sign in"
      description={`to the ${state.settings.name} admin`}
      footer={
        <>
          New to Backroom? <AuthLink to="/sign-up">Create an account</AuthLink>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <LabelledField label="Email" error={errors.email}>
          <Input type="email" autoComplete="username" autoFocus data-page-autofocus value={email} onChange={(event) => (setEmail(event.target.value), setErrors({}))} />
        </LabelledField>
        <Password
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(value) => (setPassword(value), setErrors({}))}
          error={errors.password}
        />
        <div className="-mt-1 flex justify-end">
          <AuthLink to={`/forgot-password${isEmail(email) ? `?email=${encodeURIComponent(email)}` : ""}`}>Forgot your password?</AuthLink>
        </div>
        <Button variant="primary" size="lg" type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="flex items-center justify-between gap-3 rounded-[12px] bg-muted/70 px-3.5 py-3 text-[12px]">
        <span className="text-muted-foreground">
          Sample login: <span className="font-medium text-foreground">niamh@tidelineprints.com</span>, password <span className="font-medium text-foreground">{DEMO_PASSWORD}</span>
        </span>
        <Button size="sm" onClick={() => (setEmail("niamh@tidelineprints.com"), setPassword(DEMO_PASSWORD), setErrors({}))}>
          Fill in
        </Button>
      </div>
    </AuthFrame>
  )
}

/* ------------------------------------------------------------------ two-step code */

export function VerifyPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const memberId = router.query.get("member") ?? ""
  const member = state.team.find((m) => m.id === memberId)
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [resendIn, setResendIn] = React.useState(30)
  React.useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const check = async (value: string) => {
    if (value.length < 6 || busy) return
    setBusy(true)
    const result = await auth.verifyCode(memberId, value)
    setBusy(false)
    if (!result.ok) return (setError(result.error), setCode(""))
    actions.signIn(memberId)
    router.navigate("/")
  }

  if (!member)
    return (
      <AuthFrame title="This sign-in has expired" description="Start again with your email and password.">
        <Button variant="primary" size="lg" render={<a {...linkProps(router, "/sign-in")} />}>
          Back to sign in
        </Button>
      </AuthFrame>
    )

  return (
    <AuthFrame
      title="Enter your code"
      description={<>Open your authenticator app and enter the six-digit code for {member.email}.</>}
      footer={
        <AuthLink to="/sign-in">
          <ArrowLeft {...{ size: 14, strokeWidth: 1.75, "aria-hidden": true }} className="rtl:-scale-x-100" /> Use a different account
        </AuthLink>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void check(code)
        }}
      >
        <LabelledField label="Code" error={error}>
          <OTPInput maxLength={6} value={code} autoFocus data-page-autofocus onValueChange={(value) => (setCode(value), setError(null))} onValueCommit={(value) => void check(value)} aria-label="Six-digit code">
            <OTPInputGroup>
              <OTPInputSlot index={0} />
              <OTPInputSlot index={1} />
              <OTPInputSlot index={2} />
            </OTPInputGroup>
            <OTPInputSeparator />
            <OTPInputGroup>
              <OTPInputSlot index={3} />
              <OTPInputSlot index={4} />
              <OTPInputSlot index={5} />
            </OTPInputGroup>
          </OTPInput>
        </LabelledField>
        <Button variant="primary" size="lg" type="submit" disabled={busy || code.length < 6} className="w-full">
          {busy ? "Checking…" : "Verify"}
        </Button>
      </form>
      <div className="flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
        <span>
          Sample code: <span className="font-medium text-foreground">{DEMO_CODE}</span>
        </span>
        <Button
          size="sm"
          variant="ghost"
          disabled={resendIn > 0}
          onClick={() => {
            setResendIn(30)
            toaster.success("A new code is on its way", { description: `By text to the phone ending ${member.id === "m1" ? "48" : "12"}` })
          }}
        >
          {resendIn > 0 ? `Send by text in ${resendIn}s` : "Send by text instead"}
        </Button>
      </div>
    </AuthFrame>
  )
}

/* ------------------------------------------------------------------ sign up */

export function SignUpPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const [form, setForm] = React.useState({ name: "", email: "", password: "" })
  const [agreed, setAgreed] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [busy, setBusy] = React.useState(false)
  const set = (key: keyof typeof form, value: string) => (setForm((f) => ({ ...f, [key]: value })), setErrors((e) => ({ ...e, [key]: "" })))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Enter your name."
    if (!isEmail(form.email)) next.email = "Enter your email, like you@example.com."
    const failed = passwordRules.find((rule) => !rule.test(form.password))
    if (failed) next.password = `Your password needs ${failed.label.toLowerCase()}.`
    if (!agreed) next.terms = "Agree to the terms to continue."
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const email = form.email.trim().toLowerCase()
    const result = await auth.register(state, form.name.trim(), email, form.password)
    setBusy(false)
    if (!result.ok) return setErrors({ [result.field ?? "email"]: result.error })
    actions.register(form.name.trim(), email)
    router.navigate("/")
  }

  return (
    <AuthFrame
      title="Create your account"
      description="Run your shop's orders, prints and customers in one place. Free for 14 days."
      footer={
        <>
          Already have an account? <AuthLink to="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <LabelledField label="Your name" error={errors.name}>
          <Input autoComplete="name" autoFocus data-page-autofocus value={form.name} onChange={(event) => set("name", event.target.value)} />
        </LabelledField>
        <LabelledField label="Work email" error={errors.email}>
          <Input type="email" autoComplete="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
        </LabelledField>
        <div className="flex flex-col gap-2">
          <Password label="Password" autoComplete="new-password" value={form.password} onChange={(value) => set("password", value)} error={errors.password} />
          <Rules password={form.password} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-2.5 text-[13px]">
            <Checkbox checked={agreed} onCheckedChange={(next) => (setAgreed(next === true), setErrors((e) => ({ ...e, terms: "" })))} className="mt-0.5" />
            <span className="text-muted-foreground">I agree to the terms of service and the privacy policy.</span>
          </label>
          {errors.terms && <p className="text-[12px] text-destructive">{errors.terms}</p>}
        </div>
        <Button variant="primary" size="lg" type="submit" disabled={busy} className="w-full">
          {busy ? "Creating your account…" : "Create account"}
        </Button>
      </form>
    </AuthFrame>
  )
}

/* ------------------------------------------------------------------ forgot and reset */

export function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState(router.query.get("email") ?? "")
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isEmail(email)) return setError("Enter your email, like you@example.com.")
    setBusy(true)
    const result = await auth.requestReset(email)
    setBusy(false)
    if (!result.ok) return setError(result.error)
    setSent(true)
  }

  if (sent)
    return (
      <AuthFrame
        title="Check your email"
        description={
          <>
            If there's an account for <span className="font-medium text-foreground">{email.trim()}</span>, a link to reset the password is on its way. It works for one hour.
          </>
        }
        footer={<AuthLink to="/sign-in">Back to sign in</AuthLink>}
      >
        <div className="flex items-start gap-3 rounded-[12px] bg-muted/70 p-3.5 text-[13px]">
          <MailCheck size={18} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-muted-foreground" />
          <span className="flex flex-col gap-2">
            <span className="text-muted-foreground">This sample store has no real email. Open the link the email would hold:</span>
            <Button size="sm" className="self-start" render={<a {...linkProps(router, `/reset-password?token=demo&email=${encodeURIComponent(email.trim())}`)} />}>
              Open the reset link
            </Button>
          </span>
        </div>
        <Button variant="ghost" onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </AuthFrame>
    )

  return (
    <AuthFrame title="Reset your password" description="Enter the email you sign in with and we'll send you a link." footer={<AuthLink to="/sign-in">Back to sign in</AuthLink>}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <LabelledField label="Email" error={error}>
          <Input type="email" autoComplete="username" autoFocus data-page-autofocus value={email} onChange={(event) => (setEmail(event.target.value), setError(null))} />
        </LabelledField>
        <Button variant="primary" size="lg" type="submit" disabled={busy} className="w-full">
          {busy ? "Sending…" : "Send the link"}
        </Button>
      </form>
    </AuthFrame>
  )
}

export function ResetPasswordPage() {
  const router = useRouter()
  const email = router.query.get("email") ?? ""
  const token = router.query.get("token") ?? ""
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [busy, setBusy] = React.useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    const failed = passwordRules.find((rule) => !rule.test(password))
    if (failed) next.password = `Your password needs ${failed.label.toLowerCase()}.`
    if (confirm !== password) next.confirm = "The two passwords don't match."
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    const result = await auth.resetPassword(email, token, password)
    setBusy(false)
    if (!result.ok) return setErrors({ password: result.error })
    toaster.success("Password changed", { description: "Sign in with your new password." })
    router.navigate(`/sign-in?email=${encodeURIComponent(email)}`)
  }

  if (!token)
    return (
      <AuthFrame title="This link doesn't work" description="It may be incomplete or too old. Ask for a new one." footer={<AuthLink to="/sign-in">Back to sign in</AuthLink>}>
        <Button variant="primary" size="lg" render={<a {...linkProps(router, "/forgot-password")} />}>
          Send a new link
        </Button>
      </AuthFrame>
    )

  return (
    <AuthFrame title="Choose a new password" description={email ? `For ${email}.` : "For your account."} footer={<AuthLink to="/sign-in">Back to sign in</AuthLink>}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Password autoFocusOnArrival label="New password" autoComplete="new-password" value={password} onChange={(value) => (setPassword(value), setErrors({}))} error={errors.password} />
          <Rules password={password} />
        </div>
        <Password label="Repeat the password" autoComplete="new-password" value={confirm} onChange={(value) => (setConfirm(value), setErrors({}))} error={errors.confirm} />
        <Button variant="primary" size="lg" type="submit" disabled={busy} className="w-full">
          {busy ? "Saving…" : "Save and sign in"}
        </Button>
      </form>
    </AuthFrame>
  )
}
