import * as React from "react"

/** Radix triggers take the element through `asChild`. */
export function T(Trigger: React.ElementType, el: React.ReactElement) {
  return <Trigger asChild>{el}</Trigger>
}
