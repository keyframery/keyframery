"use client"

/* Styled token input: the animated primitive plus the Keyframery look. */

import {
  TokenInput as TokenInputRoot,
  TokenInputEditor as TokenInputEditorPart,
  TokenInputToken as TokenInputTokenPart,
  TokenInputTokenRemove as TokenInputTokenRemovePart,
  createTokenInputController,
  defaultCodec,
  fromText,
  toLabel,
  toText,
  type Token,
} from "@/components/primitives/token-input"
import * as React from "react"

import { cn } from "@/lib/utils"

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

/* Without a renderToken of its own, each token is a small key with its label and an x. */
function defaultRenderToken(token: Token) {
  return (
    <TokenInputToken>
      {token.label}
      <TokenInputTokenRemove />
    </TokenInputToken>
  )
}

/* Renders no element of its own. */
function TokenInput({
  renderToken = defaultRenderToken,
  ...props
}: React.ComponentProps<typeof TokenInputRoot>) {
  return <TokenInputRoot renderToken={renderToken} {...props} />
}

/* The field: text and tokens wrap inside one box that grows with them. */
function TokenInputEditor({
  className,
  ...props
}: React.ComponentProps<typeof TokenInputEditorPart>) {
  return (
    <TokenInputEditorPart
      className={cn(
        "relative min-h-9 w-full min-w-0 cursor-text rounded-[10px] bg-background px-2 py-[5px] text-[13px] leading-[26px] break-words whitespace-pre-wrap text-foreground outline-none",
        "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
        "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
        "transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
        "focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)]",
        "aria-invalid:ring-destructive/25 aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
        "data-empty:before:pointer-events-none data-empty:before:absolute data-empty:before:text-muted-foreground data-empty:before:content-[attr(aria-placeholder)]",
        "data-readonly:bg-muted/50",
        "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
        className,
      )}
      {...props}
    />
  )
}

/* A token is a small key; the primitive pops it in when it is added. */
function TokenInputToken({
  className,
  ...props
}: React.ComponentProps<typeof TokenInputTokenPart>) {
  return (
    <TokenInputTokenPart
      className={cn(
        "mx-[2px] inline-flex h-[22px] max-w-full items-center gap-1 rounded-[7px] bg-background pr-0.5 pl-2 align-middle text-[12px] leading-none font-medium whitespace-nowrap text-foreground select-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        "[&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
        /* Selected for removal or in the selection. */
        "data-selected:bg-primary data-selected:text-primary-foreground data-selected:[&>svg]:text-primary-foreground/70",
        "data-selected:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
        /* Loading. */
        "data-pending:opacity-60",
        /* Needs the user, like an address that doesn't look right. */
        "data-unresolved:bg-destructive/10 data-unresolved:text-destructive data-unresolved:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_35%,transparent)] dark:data-unresolved:bg-destructive/15",
        "data-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

function TokenInputTokenRemove({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TokenInputTokenRemovePart>) {
  return (
    <TokenInputTokenRemovePart
      className={cn(
        "grid size-[18px] cursor-pointer place-items-center rounded-[5px] text-muted-foreground",
        "hover:bg-foreground/[0.08] hover:text-foreground",
        "in-data-selected:text-primary-foreground/70 in-data-selected:hover:bg-primary-foreground/15 in-data-selected:hover:text-primary-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-40 data-readonly:hidden",
        "[&_svg]:size-3",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </TokenInputTokenRemovePart>
  )
}

export {
  createTokenInputController,
  defaultCodec,
  fromText,
  toLabel,
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  toText,
}
