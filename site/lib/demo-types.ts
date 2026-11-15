import type * as React from "react"

import type { PlayStep } from "@/lib/autoplay"

export type DemoModule = {
  default: React.ComponentType
  meta: { name: string; group: string }
  play?: PlayStep[]
}
