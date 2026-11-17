import type * as React from "react"

import type { PlayStep } from "@/lib/autoplay"
import type { Controls } from "@/lib/controls"

export type DemoModule = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each demo types its own optional props
  default: React.ComponentType<any>
  meta: { name: string; group: string }
  play?: PlayStep[]
  /** What the Customize panel under the preview offers. The demo takes the same names as props. */
  controls?: Controls
}
