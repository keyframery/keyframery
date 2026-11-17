"use client"

/* Animated drop-in for `@ui-sdk/react/token-input`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Token: pops in when added (scale 0.4 to 1 on `ease-pop`, with a short blur).
   - Token remove: Press. */

import {
  TokenInputToken as TokenInputTokenPart,
  TokenInputTokenRemove as TokenInputTokenRemovePart,
} from "@ui-sdk/react/token-input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/token-input"

function TokenInputToken({ className, ...props }: React.ComponentProps<typeof TokenInputTokenPart>) {
  return (
    <TokenInputTokenPart
      className={withClass(
        cn(
          "inline-block origin-center motion-reduce:transition-none! transition-[scale,opacity,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-pop",
          "starting:scale-[0.4] starting:opacity-0 starting:blur-[3px]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TokenInputTokenRemove({ className, ...props }: React.ComponentProps<typeof TokenInputTokenRemovePart>) {
  return (
    <TokenInputTokenRemovePart
      className={withClass("transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.8] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

export { TokenInputToken, TokenInputTokenRemove }
