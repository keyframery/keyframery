import type { Metadata } from "next"

import { WaitlistForm } from "@/components/home/waitlist-form"

export const metadata: Metadata = { title: "Pro", description: "Keyframery Pro: ready-made screens and templates built on the cuts. Join the waitlist." }

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-20">
      <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">Pro is coming</h1>
      <p className="mt-5 max-w-[60ch] text-lg text-muted-foreground">
        The library stays free and open source. Pro will add ready-made app screens and page templates that already use every cut: dashboards,
        inboxes, settings, checkout. It will be a one-time license per developer.
      </p>
      <div className="mt-10">
        <WaitlistForm source="pro" />
      </div>
    </main>
  )
}
