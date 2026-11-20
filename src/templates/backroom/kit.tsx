"use client"

/* Pieces every Backroom page shares: the page header, a labelled field, a select from data, the
   order and product status badges, a customer's avatar and a print's photo. All of them are made
   of Keyframery's UI SDK components, so a page built from them stays UI SDK end to end. */

import { ArrowLeft } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItems, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import type { Customer, Member, Order, PaymentStatus, Product, ProductStatus } from "./data"
import { initials } from "./format"
import { linkProps, useRouter } from "./router"

export const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

/* ------------------------------------------------------------------ the page header */

/** A page's title row: an optional way back, the heading (focused after a navigation), a line under it and the page's actions. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  badges,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  back?: { to: string; label: string }
  badges?: React.ReactNode
}) {
  const router = useRouter()
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 items-start gap-3">
        {back && router.exists(back.to) && (
          <Button variant="ghost" size="icon" aria-label={back.label} className="mt-0.5 shrink-0 rtl:-scale-x-100" render={<a {...linkProps(router, back.to)} />}>
            <ArrowLeft {...icon} />
          </Button>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 data-page-heading tabIndex={-1} className="text-[24px] leading-tight font-semibold tracking-tight outline-none">
              {title}
            </h1>
            {badges}
          </div>
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** The page's vertical rhythm, which follows the density setting. */
export const pageStack = "flex flex-col gap-[var(--br-section)] [--segmented-control-height:1.5rem] [--tabs-height:1.75rem]"

/* ------------------------------------------------------------------ fields */

/** A label, a control, an optional hint and an error that shows while `error` is set. */
export function LabelledField({
  label,
  hint,
  error,
  children,
  className,
  name,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string | null
  children: React.ReactNode
  className?: string
  name?: string
}) {
  return (
    <Field name={name} invalid={!!error} className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {hint && !error && <FieldDescription>{hint}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export type Option = { value: string; label: string; disabled?: boolean }

/** A select whose options come from data. `label` names the trigger for people and for agents. */
export function Choice({
  label,
  value,
  onChange,
  options,
  className,
  disabled,
  placeholder,
}: {
  label: string
  value: string | null
  onChange: (value: string) => void
  options: Option[]
  className?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <Select items={options} value={value} disabled={disabled} onValueChange={(next) => typeof next === "string" && onChange(next)}>
      <SelectTrigger aria-label={label} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItems items={options} />
      </SelectContent>
    </Select>
  )
}

/* ------------------------------------------------------------------ statuses */

export const PAYMENT: Record<PaymentStatus, { label: string; variant: "secondary" | "outline" | "destructive" | "success" }> = {
  paid: { label: "Paid", variant: "secondary" },
  pending: { label: "Payment due", variant: "outline" },
  partially_refunded: { label: "Partly refunded", variant: "outline" },
  refunded: { label: "Refunded", variant: "destructive" },
  voided: { label: "Voided", variant: "outline" },
}

export function PaymentBadge({ order }: { order: Order }) {
  const payment = PAYMENT[order.payment]
  return <Badge variant={payment.variant}>{payment.label}</Badge>
}

export function FulfilmentBadge({ order }: { order: Order }) {
  if (order.status === "cancelled")
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Cancelled
      </Badge>
    )
  const open = order.fulfilment === "unfulfilled"
  return (
    <Badge variant="outline" className={open ? "" : "text-muted-foreground"}>
      <span aria-hidden className={cn("size-1.5 rounded-full", open ? "bg-[var(--chart-4)]" : "bg-muted-foreground/50")} />
      {open ? "Unfulfilled" : "Fulfilled"}
    </Badge>
  )
}

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; variant: "success" | "outline" | "secondary" }> = {
  active: { label: "Active", variant: "success" },
  draft: { label: "Draft", variant: "outline" },
  archived: { label: "Archived", variant: "secondary" },
}

export const itemsIn = (order: Order) => order.lines.reduce((n, line) => n + line.quantity, 0)
export const stockOf = (product: Product) => product.variants.reduce((n, v) => n + v.stock, 0)

/* ------------------------------------------------------------------ people and prints */

export function PersonAvatar({ person, size = "sm" }: { person: Pick<Customer, "name" | "avatar"> | Pick<Member, "name" | "avatar"> | undefined; size?: "sm" | "md" | "lg" }) {
  return (
    <Avatar size={size}>
      {person?.avatar && <AvatarImage src={person.avatar} alt="" />}
      <AvatarFallback>{initials(person?.name ?? "")}</AvatarFallback>
    </Avatar>
  )
}

/** A print's photo as a small square. Decorative: the name always sits beside it. */
export function PrintPhoto({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" loading="lazy" decoding="async" className={cn("size-10 shrink-0 rounded-[8px] object-cover ring-1 ring-black/5 dark:ring-white/10", className)} />
}

/** How a text link looks: the words only, no surface at rest or on hover, an underline under the pointer.
    (A control gets a surface; a link doesn't.) */
export const linkLook =
  "h-auto rounded-[4px] px-0 py-0.5 font-semibold shadow-none! dark:shadow-none! not-data-disabled:hover:bg-transparent! not-data-disabled:active:bg-transparent! hover:underline underline-offset-4 decoration-foreground/30 focus-visible:ring-offset-1"

/** A link inside the admin drawn as text: an order number, a customer's name. */
export function InlineLink({ to, children, className, label }: { to: string; children: React.ReactNode; className?: string; label?: string }) {
  const router = useRouter()
  if (!router.exists(to)) return <span className={className}>{children}</span>
  return (
    <Button variant="ghost" size="sm" aria-label={label} className={cn(linkLook, "justify-start", className)} render={<a {...linkProps(router, to)} />}>
      {children}
    </Button>
  )
}

/** Downloads text as a file in the browser. */
export function downloadText(name: string, text: string, type = "text/csv") {
  /* A byte order mark so spreadsheet apps read € and accented names as UTF-8. */
  const url = URL.createObjectURL(new Blob(["\uFEFF", text], { type: `${type};charset=utf-8` }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const csvCell = (value: string | number) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
