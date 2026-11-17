"use client"

/* The landing's Agent view: the real booking form with its live UI SDK snapshot open beside it. The demo's own
   autoplay is left out, so the snapshot holds still until a visitor types or runs an action. */

import { AgentPreview } from "@/components/agent-preview"
import * as form from "@/demos/form"
import { DemoFrame } from "@site/components/demo"
import type { DemoModule } from "@site/lib/demo-types"

const still: DemoModule = { ...form, play: undefined }

export function AgentViewDemo() {
  return (
    <AgentPreview label="the booking form" defaultEnabled>
      <DemoFrame demo={still} slug="form" className="min-h-[440px]" pad={24} replay={false} />
    </AgentPreview>
  )
}
