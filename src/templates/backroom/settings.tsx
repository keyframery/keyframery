"use client"

/* Settings: store details, your account, appearance, notifications, team and roles, and billing.
   One page with its sections beside it (a row on phones). Each form keeps a draft and saves on
   Save; switches save as they change. Removing a member and changing a plan ask first. */

import { CreditCard, Download, LogOut, MailPlus, ShieldCheck, Upload } from "lucide-react"
import * as React from "react"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileInput, FileInputTrigger } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@/components/ui/number-input"
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@/components/ui/password-input"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { AppearanceSections } from "./appearance"
import { auth, checkPassword, passwordRules } from "./auth"
import type { Member, Role, StoreSettings } from "./data"
import { ago, date, money, plural } from "./format"
import { Choice, csvCell, downloadText, icon, LabelledField, pageStack, PageHeader, PersonAvatar } from "./kit"
import { linkProps, useRouter } from "./router"
import { useShellState } from "./shell-state"
import { me, useStore } from "./store"

export const SETTINGS_SECTIONS = [
  { to: "/settings", label: "Store details", hint: "Name, contact details, address and tax" },
  { to: "/settings/account", label: "Account", hint: "Your profile, password and two-step sign-in" },
  { to: "/settings/appearance", label: "Appearance", hint: "Theme, layout, direction and motion" },
  { to: "/settings/notifications", label: "Notifications", hint: "Which emails the store sends you" },
  { to: "/settings/team", label: "Team and roles", hint: "Who can sign in, and what they can do" },
  { to: "/settings/billing", label: "Billing", hint: "Your plan, usage, card and invoices" },
] as const

export function SettingsPage({ section }: { section: string }) {
  const router = useRouter()
  const current = SETTINGS_SECTIONS.find((s) => s.to === `/settings${section ? `/${section}` : ""}`) ?? SETTINGS_SECTIONS[0]
  return (
    <div className={pageStack}>
      <PageHeader title="Settings" description={current.hint} />
      <div className="flex flex-col gap-[var(--br-section)]">
        {/* The sidebar lists these sections on wide screens; below that, a row of them sits here. */}
        <nav aria-label="Settings sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:hidden">
          {SETTINGS_SECTIONS.map((s) => {
            const active = s === current
            return (
              <Button
                key={s.to}
                variant="ghost"
                aria-current={active ? "page" : undefined}
                className={cn("shrink-0 justify-start", active && "bg-accent text-accent-foreground")}
                render={<a {...linkProps(router, s.to)} />}
              >
                {s.label}
              </Button>
            )
          })}
        </nav>
        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          {current.to === "/settings" && <StoreDetails />}
          {current.to === "/settings/account" && <Account />}
          {current.to === "/settings/appearance" && (
            <Card>
              <CardContent>
                <AppearanceSections className="max-w-[560px] [&>*:first-child]:pt-0" />
              </CardContent>
            </Card>
          )}
          {current.to === "/settings/notifications" && <Notifications />}
          {current.to === "/settings/team" && <Team />}
          {current.to === "/settings/billing" && <Billing />}
        </div>
      </div>
    </div>
  )
}

/** A card holding a form: its fields, and a footer with Save that wakes up once something changed. */
function FormCard({ title, description, dirty, onSave, onReset, children, saveLabel = "Save" }: { title: string; description?: string; dirty: boolean; onSave: () => void; onReset?: () => void; children: React.ReactNode; saveLabel?: string }) {
  return (
    <Card>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          onSave()
        }}
        className="flex flex-col gap-[inherit]"
      >
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
        <CardFooter className="justify-end gap-2 border-t border-border pt-4">
          {onReset && (
            <Button variant="ghost" disabled={!dirty} onClick={onReset}>
              Discard
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={!dirty}>
            {saveLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

/* ------------------------------------------------------------------ store details */

const TIMEZONES = ["Europe/Dublin", "Europe/London", "Europe/Lisbon", "Europe/Paris", "Europe/Amsterdam", "Europe/Berlin"].map((value) => ({ value, label: value.replace("Europe/", "").replace("_", " ") }))

function StoreDetails() {
  const { state, actions } = useStore()
  const [draft, setDraft] = React.useState<StoreSettings>(state.settings)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.settings)
  const set = (patch: Partial<StoreSettings>) => setDraft((d) => ({ ...d, ...patch }))
  const setAddress = (patch: Partial<StoreSettings["address"]>) => setDraft((d) => ({ ...d, address: { ...d.address, ...patch } }))

  const save = () => {
    const next: Record<string, string> = {}
    if (!draft.name.trim()) next.name = "The store needs a name."
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(draft.email)) next.email = "Enter an email address like hello@example.com."
    if (draft.vatNumber && !/^[A-Z]{2}[0-9A-Z]{8,12}$/.test(draft.vatNumber.replaceAll(" ", ""))) next.vatNumber = "A VAT number starts with the country code: IE1234567T."
    if (!/^[A-Z#-]{0,4}$/.test(draft.orderPrefix)) next.orderPrefix = "Up to four capital letters, # or -."
    setErrors(next)
    if (!Object.keys(next).length) actions.updateSettings({ ...draft, name: draft.name.trim() }, "Store details saved")
  }
  const text = (key: keyof StoreSettings, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
    <LabelledField label={label} error={errors[key]} hint={hint}>
      <Input value={String(draft[key] ?? "")} onChange={(event) => (set({ [key]: event.target.value } as Partial<StoreSettings>), setErrors((e) => ({ ...e, [key]: "" })))} {...props} />
    </LabelledField>
  )

  return (
    <>
      <FormCard title="Store" description="Shown on receipts, invoices and the emails customers get." dirty={dirty} onSave={save} onReset={() => (setDraft(state.settings), setErrors({}))}>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("name", "Store name")}
          {text("legalName", "Legal name", {}, "For invoices.")}
          {text("email", "Contact email", { type: "email" })}
          {text("phone", "Phone", { type: "tel" })}
        </div>
      </FormCard>
      <FormCard title="Address and tax" dirty={dirty} onSave={save} onReset={() => (setDraft(state.settings), setErrors({}))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <LabelledField label="Street address" className="sm:col-span-2">
            <Input value={draft.address.line1} onChange={(event) => setAddress({ line1: event.target.value })} />
          </LabelledField>
          <LabelledField label="Town or city">
            <Input value={draft.address.city} onChange={(event) => setAddress({ city: event.target.value })} />
          </LabelledField>
          <LabelledField label="Postcode">
            <Input value={draft.address.postcode} onChange={(event) => setAddress({ postcode: event.target.value })} />
          </LabelledField>
          {text("vatNumber", "VAT number", { spellCheck: false })}
          <LabelledField label="Time zone" hint="Order times and the dashboard's days follow it.">
            <Choice label="Time zone" value={draft.timezone} onChange={(timezone) => set({ timezone })} options={TIMEZONES} />
          </LabelledField>
          <LabelledField label="Currency" hint="Changing currency needs a new store.">
            <Input value="Euro (€)" disabled />
          </LabelledField>
          {text("orderPrefix", "Order number prefix", { spellCheck: false, placeholder: "#" }, `Orders read ${draft.orderPrefix || ""}1462.`)}
        </div>
      </FormCard>
    </>
  )
}

/* ------------------------------------------------------------------ account */

function Account() {
  const { state, actions } = useStore()
  const { setOpen } = useShellState()
  const person = me(state)
  const [profile, setProfile] = React.useState({ name: person?.name ?? "", email: person?.email ?? "", title: person?.title ?? "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" })
  const [pwErrors, setPwErrors] = React.useState<Record<string, string>>({})
  if (!person) return null
  const dirty = profile.name !== person.name || profile.email !== person.email || profile.title !== person.title

  const saveProfile = () => {
    const next: Record<string, string> = {}
    if (!profile.name.trim()) next.name = "Enter your name."
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(profile.email)) next.email = "Enter an email address like you@example.com."
    else if (state.team.some((m) => m.email === profile.email.toLowerCase() && m.id !== person.id)) next.email = "Someone on the team already uses this email."
    setErrors(next)
    if (!Object.keys(next).length) actions.updateMember(person.id, { name: profile.name.trim(), email: profile.email.trim().toLowerCase(), title: profile.title.trim() })
  }
  const savePassword = () => {
    const next: Record<string, string> = {}
    if (!checkPassword(person.email, pw.current)) next.current = "That isn't your current password."
    const failed = passwordRules.find((rule) => !rule.test(pw.next))
    if (failed) next.next = `The new password needs ${failed.label.toLowerCase()}.`
    else if (pw.next === pw.current) next.next = "Choose a password you haven't used here."
    if (pw.confirm !== pw.next) next.confirm = "The two new passwords don't match."
    setPwErrors(next)
    if (Object.keys(next).length) return
    auth.setPassword(person.email, pw.next)
    setPw({ current: "", next: "", confirm: "" })
    actions.setAccount({}, "Password changed")
  }
  const pass = (key: keyof typeof pw, label: string, autoComplete: string) => (
    <LabelledField label={label} error={pwErrors[key]}>
      <PasswordInput autoComplete={autoComplete} value={pw[key]} onValueChange={(value) => (setPw((p) => ({ ...p, [key]: value })), setPwErrors((e) => ({ ...e, [key]: "" })))}>
        <PasswordInputControl aria-label={label} />
        <PasswordInputToggle aria-label={`Show ${label.toLowerCase()}`} />
      </PasswordInput>
    </LabelledField>
  )

  return (
    <>
      <FormCard title="Profile" description="How the team sees you, on orders and in notes." dirty={dirty} onSave={saveProfile} onReset={() => setProfile({ name: person.name, email: person.email, title: person.title })}>
        <div className="flex items-center gap-4">
          <PersonAvatar person={person} size="lg" />
          <FileInput
            accept="image/jpeg,image/png,image/webp"
            maxSize={5_000_000}
            value={[]}
            onValueChange={(files) => files[0] && actions.updateMember(person.id, { avatar: URL.createObjectURL(files[0]) }, "Photo updated")}
          >
            <FileInputTrigger>
              <Upload {...icon} />
              Change photo
            </FileInputTrigger>
          </FileInput>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <LabelledField label="Name" error={errors.name}>
            <Input value={profile.name} autoComplete="name" onChange={(event) => setProfile((p) => ({ ...p, name: event.target.value }))} />
          </LabelledField>
          <LabelledField label="Email" error={errors.email}>
            <Input type="email" value={profile.email} autoComplete="email" onChange={(event) => setProfile((p) => ({ ...p, email: event.target.value }))} />
          </LabelledField>
          <LabelledField label="Job title" className="sm:col-span-2">
            <Input value={profile.title} onChange={(event) => setProfile((p) => ({ ...p, title: event.target.value }))} />
          </LabelledField>
        </div>
      </FormCard>

      <FormCard title="Password" description="At least 8 characters, with a number and a symbol." dirty={!!(pw.current || pw.next || pw.confirm)} onSave={savePassword} saveLabel="Change password">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">{pass("current", "Current password", "current-password")}</div>
          {pass("next", "New password", "new-password")}
          {pass("confirm", "Repeat the new password", "new-password")}
        </div>
      </FormCard>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <label className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-start gap-3">
              <ShieldCheck {...icon} className="mt-0.5 shrink-0 text-muted-foreground" />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">Two-step sign-in</span>
                <span className="text-[12px] text-muted-foreground">Ask for a six-digit code from your authenticator app after the password.</span>
              </span>
            </span>
            <Switch checked={state.account.twoStep} onCheckedChange={(next) => actions.setAccount({ twoStep: next === true }, next ? "Two-step sign-in is on" : "Two-step sign-in is off")} />
          </label>
          <div className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-start gap-3">
              <LogOut {...icon} className="mt-0.5 shrink-0 text-muted-foreground" />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">Sign out</span>
                <span className="text-[12px] text-muted-foreground">Signed in on this browser {ago(person.lastActive)}.</span>
              </span>
            </span>
            <Button onClick={() => setOpen("signOut", true)}>Sign out</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

/* ------------------------------------------------------------------ notifications */

const NOTICES: { key: keyof StoreSettings["notifications"]; title: string; hint: string }[] = [
  { key: "newOrder", title: "New orders", hint: "An email for every order, with what to pack." },
  { key: "lowStock", title: "Low stock", hint: "When a size or frame falls to the low-stock level." },
  { key: "refunds", title: "Refunds and disputes", hint: "When money goes back to a customer, or a payment is disputed." },
  { key: "weeklySummary", title: "Weekly summary", hint: "Monday morning: last week's sales, best sellers and stock." },
]

function Notifications() {
  const { state, actions } = useStore()
  const n = state.settings.notifications
  const [lowAt, setLowAt] = React.useState<number | null>(state.settings.lowStockAt)
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Email me about</CardTitle>
          <CardDescription>Sent to {me(state)?.email}. Changes save as you make them.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {NOTICES.map((notice) => (
            <label key={notice.key} className="flex items-center justify-between gap-4 py-3.5 text-[13px] first:pt-0 last:pb-0">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{notice.title}</span>
                <span className="text-[12px] text-muted-foreground">{notice.hint}</span>
              </span>
              <Switch
                checked={n[notice.key]}
                onCheckedChange={(next) => actions.updateSettings({ notifications: { ...n, [notice.key]: next === true } }, `${notice.title}: ${next ? "on" : "off"}`)}
              />
            </label>
          ))}
        </CardContent>
      </Card>
      <FormCard
        title="Low-stock level"
        description="A size or frame at or under this many counts as running low, here and in the email."
        dirty={lowAt !== state.settings.lowStockAt && lowAt !== null}
        onSave={() => lowAt !== null && actions.updateSettings({ lowStockAt: lowAt }, "Low-stock level saved")}
        onReset={() => setLowAt(state.settings.lowStockAt)}
      >
        <NumberInput value={lowAt} min={0} max={50} step={1} onValueChange={setLowAt} className="w-40">
          <NumberInputGroup>
            <NumberInputDecrement aria-label="Lower" />
            <NumberInputControl aria-label="Low-stock level" />
            <NumberInputIncrement aria-label="Higher" />
          </NumberInputGroup>
        </NumberInput>
      </FormCard>
    </>
  )
}

/* ------------------------------------------------------------------ team */

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "owner", label: "Owner", hint: "Everything, including billing and closing the store." },
  { value: "admin", label: "Admin", hint: "Everything except billing." },
  { value: "staff", label: "Staff", hint: "Orders, products and customers." },
  { value: "viewer", label: "Viewer", hint: "Can look at everything, change nothing." },
]

function Team() {
  const { state, actions } = useStore()
  const person = me(state)
  const [inviting, setInviting] = React.useState(false)
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const seats = state.plan.usage.find((u) => u.label === "Staff seats")
  const isOwner = person?.role === "owner"

  return (
    <>
      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>
            {plural(state.team.length, "person", "people")}
            {seats ? ` · ${seats.limit - state.team.length} of ${seats.limit} seats free` : ""}
          </CardDescription>
          <CardAction>
            <Button variant="primary" onClick={() => setInviting(true)} disabled={!!seats && state.team.length >= seats.limit}>
              <MailPlus {...icon} />
              Invite
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="overflow-x-auto px-[calc(var(--card-padding,1.25rem)-0.75rem)]">
          <Table aria-label="Team" className="w-full min-w-[620px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">Person</TableHead>
                <TableHead className="w-40 text-start">Role</TableHead>
                <TableHead className="hidden text-start md:table-cell">Last active</TableHead>
                <TableHead className="w-24 text-end">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.team.map((m) => {
                const self = m.id === person?.id
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span className="flex min-w-0 items-center gap-2.5">
                        <PersonAvatar person={m} size="md" />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="flex items-center gap-1.5 truncate font-medium">
                            {m.name}
                            {self && <span className="text-[12px] font-normal text-muted-foreground">(you)</span>}
                            {m.status === "invited" && <Badge variant="outline">Invited</Badge>}
                          </span>
                          <span className="truncate text-[12px] text-muted-foreground">{m.title || m.email}</span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Choice
                        label={`Role for ${m.name}`}
                        value={m.role}
                        disabled={self || m.role === "owner" || !isOwner}
                        onChange={(role) => actions.changeRole(m.id, role as Role)}
                        options={ROLES.map((r) => ({ value: r.value, label: r.label, disabled: r.value === "owner" }))}
                      />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{m.status === "invited" ? `Invited ${ago(m.lastActive)}` : ago(m.lastActive)}</TableCell>
                    <TableCell className="text-end">
                      {!self && m.role !== "owner" && (
                        <Button size="sm" variant="ghost" onClick={() => setRemoving(m)} disabled={!isOwner}>
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What each role can do</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-[120px_1fr]">
            {ROLES.map((r) => (
              <React.Fragment key={r.value}>
                <dt className="font-medium">{r.label}</dt>
                <dd className="text-muted-foreground">{r.hint}</dd>
              </React.Fragment>
            ))}
          </dl>
        </CardContent>
      </Card>

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
      <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>They're signed out at once and can't sign in again. Their notes and order history stay.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>Keep</AlertDialogClose>
            <AlertDialogClose
              variant="destructive"
              data-agent-confirm={`Removes ${removing?.name} from the team`}
              onClick={() => {
                if (removing) actions.removeMember(removing.id)
                setRemoving(null)
              }}
            >
              Remove
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useStore()
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<Role>("staff")
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (open) (setEmail(""), setRole("staff"), setError(null))
  }, [open])
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const address = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(address)) return setError("Enter an email address like name@example.com.")
    if (state.team.some((m) => m.email === address)) return setError("They're already on the team.")
    actions.inviteMember(address, role)
    onClose()
  }
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogBackdrop />
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Invite to the team</DialogTitle>
            <DialogDescription>They get an email with a link to set a password. It works for 7 days.</DialogDescription>
          </DialogHeader>
          <LabelledField label="Email" error={error}>
            <Input type="email" autoFocus value={email} onChange={(event) => (setEmail(event.target.value), setError(null))} placeholder="name@example.com" />
          </LabelledField>
          <LabelledField label="Role" hint={ROLES.find((r) => r.value === role)?.hint}>
            <Choice label="Role" value={role} onChange={(v) => setRole(v as Role)} options={ROLES.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))} />
          </LabelledField>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit">
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ billing */

const PLANS = [
  { name: "Starter", price: 1900, seats: 2, hint: "2 staff seats, 300 orders a month" },
  { name: "Growth", price: 4900, seats: 8, hint: "8 staff seats, 1,000 orders a month" },
  { name: "Studio", price: 9900, seats: 20, hint: "20 staff seats, unlimited orders, priority support" },
]

function Billing() {
  const { state, actions } = useStore()
  const [choosing, setChoosing] = React.useState(false)
  const [plan, setPlan] = React.useState(state.plan.name)
  const [card, setCard] = React.useState(false)
  const download = (id: string, at: string, amount: number) => {
    const s = state.settings
    const text = [
      ["Invoice", id],
      ["Date", date(at)],
      ["Billed to", s.legalName],
      ["Address", `${s.address.line1}, ${s.address.city} ${s.address.postcode}, ${s.address.country}`],
      ["VAT number", s.vatNumber],
      ["Description", `Backroom ${state.plan.name} plan, one month`],
      ["Amount (EUR)", (amount / 100).toFixed(2)],
      ["Paid with", `${state.account.card.brand} ending ${state.account.card.last4}`],
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
    downloadText(`${id}.csv`, text + "\r\n")
  }
  const seatsNeeded = state.team.length

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{state.plan.name} plan</CardTitle>
          <CardDescription>
            {money(state.plan.price)} a month · renews {date(state.plan.renews)}
          </CardDescription>
          <CardAction>
            <Button onClick={() => (setPlan(state.plan.name), setChoosing(true))}>Change plan</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {state.plan.usage.map((u) => (
            <Meter key={u.label} value={Math.min(u.used, u.limit)} max={u.limit} aria-label={u.label} className="flex flex-col gap-2">
              <span className="flex w-full justify-between gap-2 text-[12px]">
                <span className="font-medium">{u.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {u.used}
                  {u.unit ? ` ${u.unit}` : ""} of {u.limit}
                  {u.unit ? ` ${u.unit}` : ""}
                </span>
              </span>
              <MeterTrack>
                <MeterIndicator />
              </MeterTrack>
            </Meter>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>The plan is charged to this card each month.</CardDescription>
          <CardAction>
            <Button onClick={() => setCard(true)}>Replace card</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="grid size-10 place-items-center rounded-[10px] bg-muted">
              <CreditCard {...icon} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">
                {state.account.card.brand} ending {state.account.card.last4}
              </span>
              <span className="text-[12px] text-muted-foreground">Expires {state.account.card.expiry}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Each one shows your VAT number, for your accountant.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-[calc(var(--card-padding,1.25rem)-0.75rem)]">
          <Table aria-label="Invoices" className="w-full min-w-[480px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">Invoice</TableHead>
                <TableHead className="text-start">Date</TableHead>
                <TableHead className="text-start">Status</TableHead>
                <TableHead className="text-end">Amount</TableHead>
                <TableHead className="w-16 text-end">
                  <span className="sr-only">Download</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium tabular-nums">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground">{date(inv.date)}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "paid" ? "secondary" : "outline"}>{inv.status === "paid" ? "Paid" : "Due"}</Badge>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{money(inv.amount)}</TableCell>
                  <TableCell className="text-end">
                    <Button size="icon-sm" variant="ghost" aria-label={`Download ${inv.id}`} onClick={() => download(inv.id, inv.date, inv.amount)}>
                      <Download {...icon} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={choosing} onOpenChange={setChoosing}>
        <DialogBackdrop />
        <DialogContent className="[--dialog-width:500px]">
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>Change plan</DialogTitle>
              <DialogDescription>The new price starts on your next bill. Nothing is charged today.</DialogDescription>
            </DialogHeader>
            <RadioGroup aria-label="Plan" value={plan} onValueChange={(v) => setPlan(v as string)} className="flex flex-col gap-2">
              {PLANS.map((p) => {
                const tooSmall = p.seats < seatsNeeded
                return (
                  <label
                    key={p.name}
                    data-disabled={tooSmall ? "" : undefined}
                    className="flex cursor-pointer items-start gap-3 rounded-[12px] p-3 text-[13px] shadow-[inset_0_0_0_1px_var(--border)] has-data-checked:shadow-[inset_0_0_0_1.5px_var(--foreground)] data-disabled:cursor-not-allowed data-disabled:opacity-50"
                  >
                    <Radio value={p.name} disabled={tooSmall} className="mt-0.5" />
                    <span className="flex flex-1 flex-col gap-0.5">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[12px] text-muted-foreground">{tooSmall ? `Your team of ${seatsNeeded} needs more seats.` : p.hint}</span>
                    </span>
                    <span className="font-medium tabular-nums">{money(p.price)}/mo</span>
                  </label>
                )
              })}
            </RadioGroup>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <DialogClose
                variant="primary"
                disabled={plan === state.plan.name}
                data-agent-confirm={`Changes the store's plan to ${plan}`}
                onClick={() => {
                  const p = PLANS.find((x) => x.name === plan)
                  if (p) actions.changePlan(p.name, p.price, p.seats)
                }}
              >
                Switch to {plan}
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <CardDialog open={card} onClose={() => setCard(false)} />
    </>
  )
}

/** Replace card: checks the number (Luhn), the expiry and the code. A real store hands this to its payment provider. */
function CardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { actions } = useStore()
  const [form, setForm] = React.useState({ number: "", expiry: "", cvc: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    if (open) (setForm({ number: "", expiry: "", cvc: "" }), setErrors({}))
  }, [open])
  const luhn = (digits: string) => {
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      let d = Number(digits[digits.length - 1 - i])
      if (i % 2) d = d * 2 > 9 ? d * 2 - 9 : d * 2
      sum += d
    }
    return sum % 10 === 0
  }
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const digits = form.number.replace(/\D/g, "")
    const [mm, yy] = form.expiry.split("/").map((x) => Number(x))
    const next: Record<string, string> = {}
    if (digits.length < 13 || !luhn(digits)) next.number = "That card number isn't valid. Try 4242 4242 4242 4242."
    if (!mm || mm > 12 || !yy || new Date(2000 + yy, mm) < new Date()) next.expiry = "Enter a date in the future, like 08/29."
    if (!/^\d{3,4}$/.test(form.cvc)) next.cvc = "Three or four digits."
    setErrors(next)
    if (Object.keys(next).length) return
    const brand = digits.startsWith("4") ? "Visa" : /^5[1-5]/.test(digits) ? "Mastercard" : digits.startsWith("3") ? "American Express" : "Card"
    actions.setAccount({ card: { brand, last4: digits.slice(-4), expiry: `${String(mm).padStart(2, "0")}/${String(yy).padStart(2, "0")}` } }, "Card replaced")
    onClose()
  }
  const field = (key: keyof typeof form, label: string, props: React.ComponentProps<typeof Input>, className?: string) => (
    <LabelledField label={label} error={errors[key]} className={className}>
      <Input value={form[key]} onChange={(event) => (setForm((f) => ({ ...f, [key]: event.target.value })), setErrors((e) => ({ ...e, [key]: "" })))} {...props} />
    </LabelledField>
  )
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogBackdrop />
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Replace card</DialogTitle>
            <DialogDescription>The next bill goes to the new card.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {field("number", "Card number", { inputMode: "numeric", autoComplete: "cc-number", placeholder: "4242 4242 4242 4242", autoFocus: true }, "col-span-2")}
            {field("expiry", "Expires", { inputMode: "numeric", autoComplete: "cc-exp", placeholder: "MM/YY" })}
            {field("cvc", "Security code", { inputMode: "numeric", autoComplete: "cc-csc", placeholder: "123" })}
          </div>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit">
              Save card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
