"use client"

export * from "@/components/primitives/code-block"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --code-block-face: Code sheet; default: bg-card.
   --code-block-ink: Code text; default: text-card-foreground.
   --code-block-muted: Comments and hints; default: text-muted-foreground.
   --code-block-radius: Sheet corners; default: rounded-[14px].
   --code-block-font: Code size; default: text-[12.5px].
   --code-block-inset-x: Line padding; default: px-3.5.
   --code-block-inset-y: Code padding; default: py-3.
*/

/* Styled code block: the animated primitive plus the Keyframery look. A quiet sheet with a filename
   row, the code on a slightly sunk ground, tokens coloured from the theme's own tokens (keywords in
   the ring colour, strings warm, comments muted), and a small key for copying. */

import * as React from "react"

import {
  CodeBlock as CodeBlockRoot,
  CodeBlockActions as CodeBlockActionsPrimitive,
  CodeBlockContent as CodeBlockContentPrimitive,
  CodeBlockCopyButton as CodeBlockCopyButtonPrimitive,
  CodeBlockFooter as CodeBlockFooterPrimitive,
  CodeBlockHeader as CodeBlockHeaderPrimitive,
  CodeBlockLine as CodeBlockLinePrimitive,
  CodeBlockTitle as CodeBlockTitlePrimitive,
} from "@/components/primitives/code-block"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Token colours, all from theme tokens. */
const tokens = cn(
  "[&_[data-token=keyword]]:text-ring",
  "[&_[data-token=tag]]:text-ring",
  "[&_[data-token=string]]:text-[color-mix(in_oklab,var(--destructive)_72%,var(--foreground))]",
  "[&_[data-token=number]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=comment]]:text-[color:var(--code-block-muted,var(--muted-foreground))] [&_[data-token=comment]]:italic",
  "[&_[data-token=function]]:text-foreground [&_[data-token=function]]:font-medium",
  "[&_[data-token=type]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=property]]:text-[color-mix(in_oklab,var(--ring)_40%,var(--foreground))]",
  "[&_[data-token=attribute]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=variable]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=punctuation]]:text-[color:var(--code-block-muted,var(--muted-foreground))]",
)

function CodeBlock({
  speed,
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof CodeBlockRoot> &
  SpeedProps & {
    /** `"destructive"` for an error or failed output. */
    variant?: "default" | "destructive"
    /** `"sm"` has tighter padding and 12px code, for tool output. */
    size?: "default" | "sm"
  }) {
  return (
    <Speed speed={speed}>
      <CodeBlockRoot
        data-variant={variant}
        data-size={size}
        className={withClass(
          cn(
            "flex w-full min-w-0 flex-col overflow-hidden rounded-[var(--code-block-radius,14px)] bg-[var(--code-block-face,var(--card))] text-[13px] text-[color:var(--code-block-ink,var(--card-foreground))]",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]",
            "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.7)]",
            "has-[>[data-slot=code-block-content]:focus-visible]:ring-2 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring",
            "data-[size=sm]:rounded-[12px] data-[size=sm]:text-[12px]",
            "data-[variant=destructive]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_35%,transparent)]",
            tokens,
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function CodeBlockHeader({ className, ...props }: React.ComponentProps<typeof CodeBlockHeaderPrimitive>) {
  return (
    <CodeBlockHeaderPrimitive
      className={withClass(
        cn(
          "flex h-10 min-w-0 shrink-0 items-center gap-2 border-b border-border/70 ps-3.5 pe-1.5 text-[color:var(--code-block-muted,var(--muted-foreground))]",
          "group-data-[size=sm]/code-block:h-8 group-data-[size=sm]/code-block:ps-3",
          "group-data-[variant=destructive]/code-block:text-destructive",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A filename or a label, with an optional 14px icon before it. It truncates. */
function CodeBlockTitle({ className, ...props }: React.ComponentProps<typeof CodeBlockTitlePrimitive>) {
  return (
    <CodeBlockTitlePrimitive
      className={withClass(
        cn(
          "flex min-w-0 items-center gap-1.5 truncate text-[length:var(--code-block-font,12.5px)] leading-none font-medium text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-[color:var(--code-block-muted,var(--muted-foreground))]",
          "group-data-[variant=destructive]/code-block:text-destructive",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Buttons at the end of the header. As a direct child of CodeBlock it floats over the code's corner
   and shows on hover or focus. */
function CodeBlockActions({ className, ...props }: React.ComponentProps<typeof CodeBlockActionsPrimitive>) {
  return (
    <CodeBlockActionsPrimitive
      className={withClass(
        cn(
          "ms-auto flex shrink-0 items-center gap-1",
          "[[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-2 [[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:z-10",
          "[[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:duration-[calc(150ms*var(--kf-speed,1))]",
          "group-hover/code-block:[[data-slot=code-block]>&]:opacity-100 group-focus-within/code-block:[[data-slot=code-block]>&]:opacity-100 group-data-copied/code-block:[[data-slot=code-block]>&]:opacity-100",
          "pointer-coarse:[[data-slot=code-block]>&]:opacity-100 motion-reduce:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A small key. Copied, the tick takes the payoff green. */
function CodeBlockCopyButton({ className, ...props }: React.ComponentProps<typeof CodeBlockCopyButtonPrimitive>) {
  return (
    <CodeBlockCopyButtonPrimitive
      className={withClass(
        cn(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[8px] text-[color:var(--code-block-muted,var(--muted-foreground))] outline-none",
          "hover:bg-foreground/[0.06] hover:text-foreground",
          "[[data-slot=code-block]>[data-slot=code-block-actions]>&]:bg-background [[data-slot=code-block]>[data-slot=code-block-actions]>&]:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.06)]",
          "dark:[[data-slot=code-block]>[data-slot=code-block-actions]>&]:bg-accent dark:[[data-slot=code-block]>[data-slot=code-block-actions]>&]:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
          "data-copied:text-[oklch(0.62_0.16_150)] data-copied:hover:text-[oklch(0.62_0.16_150)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* With no children it renders a styled line for every line of the code. */
function CodeBlockContent({ className, children, ...props }: React.ComponentProps<typeof CodeBlockContentPrimitive>) {
  return (
    <CodeBlockContentPrimitive
      className={withClass(
        cn(
          "min-h-0 min-w-0 overflow-auto py-[var(--code-block-inset-y,0.75rem)] font-mono text-[length:var(--code-block-font,12.5px)] leading-[1.7] outline-none [scrollbar-width:thin]",
          "bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] dark:bg-[color-mix(in_oklab,var(--muted)_35%,var(--card))]",
          "group-data-[size=sm]/code-block:py-2 group-data-[size=sm]/code-block:text-[11.5px]",
          "data-wrap:whitespace-pre-wrap data-wrap:break-words",
        ),
        className,
      )}
      {...props}
    >
      {children ??
        ((state) => (
          <code data-slot="code-block-code" className="block min-w-max in-data-wrap:min-w-0">
            {state.numbers.map((number) => (
              <CodeBlockLine key={number} value={number} />
            ))}
          </code>
        ))}
    </CodeBlockContentPrimitive>
  )
}

/* A line: gutter number, then the code. Highlighted lines get a band and a ring-coloured edge;
   added and removed lines a tint and a + or − in the gutter, so a diff doesn't rest on colour. */
function CodeBlockLine({ className, ...props }: React.ComponentProps<typeof CodeBlockLinePrimitive>) {
  return (
    <CodeBlockLinePrimitive
      className={withClass(
        cn(
          "grid grid-cols-[1fr] px-[var(--code-block-inset-x,0.875rem)] group-data-[size=sm]/code-block:px-3",
          "in-data-numbered:grid-cols-[2.25rem_1fr] in-data-numbered:ps-1",
          "*:data-[slot=code-block-line-number]:pe-3 *:data-[slot=code-block-line-number]:text-end *:data-[slot=code-block-line-number]:text-muted-foreground/60 *:data-[slot=code-block-line-number]:tabular-nums",
          "*:data-[slot=code-block-line-number]:transition-colors *:data-[slot=code-block-line-number]:duration-[calc(200ms*var(--kf-speed,1))]",
          "data-[variant=highlighted]:*:data-[slot=code-block-line-number]:text-foreground",
          "before:bg-[color-mix(in_oklab,var(--ring)_9%,transparent)] dark:before:bg-[color-mix(in_oklab,var(--ring)_14%,transparent)]",
          "before:shadow-[inset_2px_0_0_var(--ring)]",
          "data-[variant=added]:before:bg-[oklch(0.62_0.16_150/0.1)] data-[variant=added]:before:shadow-[inset_2px_0_0_oklch(0.62_0.16_150)]",
          "data-[variant=removed]:before:bg-[color-mix(in_oklab,var(--destructive)_9%,transparent)] data-[variant=removed]:before:shadow-[inset_2px_0_0_var(--destructive)]",
          "after:absolute after:start-1.5 after:top-0 after:text-[color:var(--code-block-muted,var(--muted-foreground))] after:select-none",
          "data-[variant=added]:after:content-['+'] data-[variant=removed]:after:text-destructive data-[variant=removed]:after:content-['−']",
          "in-data-wrap:*:data-[slot=code-block-line-content]:min-w-0",
        ),
        className,
      )}
      {...props}
    />
  )
}

function CodeBlockFooter({ className, ...props }: React.ComponentProps<typeof CodeBlockFooterPrimitive>) {
  return (
    <CodeBlockFooterPrimitive
      className={withClass("flex min-w-0 shrink-0 items-center gap-2 border-t border-border/70 px-[var(--code-block-inset-x,0.875rem)] py-2 text-[12px] text-[color:var(--code-block-muted,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
}
export { tokenize, type CodeBlockLanguage, type CodeToken, type CodeTokenKind } from "@/components/primitives/code-block"
