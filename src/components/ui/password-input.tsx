"use client"

/* Styled password input: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  PasswordInput as PasswordInputPrimitive,
  PasswordInputControl as PasswordInputControlPrimitive,
  PasswordInputToggle as PasswordInputTogglePrimitive,
  createPasswordInputController,
} from "@/components/primitives/password-input"
import { cn } from "@/lib/utils"

/* The root is the field: the native input, a Caps Lock mark and the toggle sit inside one box.
   The hairline's colour is one variable, so hover, focus and invalid each change a single value. */
function PasswordInput({ className, ...props }: React.ComponentProps<typeof PasswordInputPrimitive>) {
  return (
    <PasswordInputPrimitive
      className={cn(
        "group/password flex h-9 w-full min-w-0 cursor-text items-center gap-1 rounded-[10px] bg-background ps-3 pe-1 text-[13px] text-muted-foreground",
        "outline-0 outline-ring",
        "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
        "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
        "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
        "has-[input:focus-visible]:outline-[3px] has-[input:focus-visible]:outline-ring/30 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)]",
        "has-aria-invalid:outline-destructive has-aria-invalid:has-[input:focus-visible]:outline-destructive/30 has-aria-invalid:[--field-line:var(--destructive)] dark:has-aria-invalid:[--field-line:var(--destructive)]",
        "data-readonly:bg-muted/50",
        "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
        className,
      )}
      {...props}
    />
  )
}

function PasswordInputControl({
  className,
  ...props
}: React.ComponentProps<typeof PasswordInputControlPrimitive>) {
  return (
    <PasswordInputControlPrimitive
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none select-text placeholder:text-muted-foreground/70",
        "data-disabled:cursor-not-allowed data-disabled:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

const icon = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const

function EyeIcon() {
  return (
    <svg {...icon} className="size-4">
      <path d="M1.75 8S4 3.75 8 3.75 14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg {...icon} className="size-4">
      <path d="M6.6 3.9A6 6 0 0 1 8 3.75C12 3.75 14.25 8 14.25 8a11 11 0 0 1-1.7 2.3M4.3 4.9C2.6 6 1.75 8 1.75 8S4 12.25 8 12.25a6 6 0 0 0 2.9-.75" />
      <path d="M6.6 6.6a2 2 0 0 0 2.8 2.8" />
      <path d="m2.5 2.5 11 11" />
    </svg>
  )
}

/* One icon per state, so the primitive pops each one in as it changes. */
function PasswordInputToggle({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PasswordInputTogglePrimitive>) {
  return (
    <PasswordInputTogglePrimitive
      className={cn(
        "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none",
        "hover:bg-foreground/[0.06] hover:text-foreground aria-pressed:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children ?? ((state) => (state.visible ? <EyeOffIcon /> : <EyeIcon />))}
    </PasswordInputTogglePrimitive>
  )
}

/* Place inside PasswordInput, before the toggle. It is out of the page until Caps Lock
   is on while the field has focus, then it pops in from its starting style. */
function PasswordInputCapsLock({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="password-input-caps-lock"
      title="Caps Lock is on"
      className={cn(
        "hidden size-5 shrink-0 place-items-center rounded-[6px] bg-muted text-foreground",
        "group-data-capslock/password:grid",
        "[transition:opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),scale_calc(380ms*var(--kf-speed,1))_var(--ease-pop),display_calc(380ms*var(--kf-speed,1))] transition-discrete",
        "starting:scale-50 starting:opacity-0 motion-reduce:transition-none!",
        className,
      )}
      {...props}
    >
      <svg {...icon} className="size-3.5">
        <path d="M8 2.75 3.25 8h2.5v2.25h4.5V8h2.5L8 2.75Z" />
        <path d="M5.75 13h4.5" />
      </svg>
      <span className="sr-only">Caps Lock is on</span>
    </span>
  )
}

export {
  PasswordInput,
  PasswordInputCapsLock,
  PasswordInputControl,
  PasswordInputToggle,
  createPasswordInputController,
}
