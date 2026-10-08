import type { Metadata } from "next"
import { Suspense } from "react"

import { ThemeBuilder } from "@/components/theme/theme-builder"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Motion theme builder for shadcn/ui",
  description: "Build a motion theme for shadcn/ui: pick a cut for each component, tune pace, easing, travel and blur, see it live, and copy the code.",
  path: "/theme",
})

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">Motion theme builder</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-muted-foreground">Pick a cut for each component and tune the variables. Everything on this page, including the dialogs, uses your settings. Copy the code when it feels right.</p>
      <div className="mt-10">
        <Suspense>
          <ThemeBuilder />
        </Suspense>
      </div>
    </main>
  )
}
