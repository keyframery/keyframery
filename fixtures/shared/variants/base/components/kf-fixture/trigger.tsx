import * as React from "react"

/** Base UI triggers take the element through `render`. */
export function T(Trigger: React.ElementType, el: React.ReactElement) {
  return <Trigger render={el} />
}
