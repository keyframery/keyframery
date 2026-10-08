import type { Metadata } from "next"
import { Suspense } from "react"

import { ThemeBuilder } from "@/components/theme/theme-builder"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Motion theme builder for shadcn/ui",
  description: "Build a motion theme for shadcn/ui: start from Quiet, Crisp or Expressive, tune pace, easing and cuts on a live app, then save it or copy the code.",
  path: "/theme",
  markdown: "/theme.md",
})

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16">
      <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">Motion theme builder</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-muted-foreground">Start with a profile, try a real workflow, then make it yours. Everything on this page, including the dialogs, uses your settings. Save the theme or copy its code into your app.</p>
      <div className="mt-10">
        <Suspense>
          <ThemeBuilder />
        </Suspense>
      </div>
    </main>
  )
}
