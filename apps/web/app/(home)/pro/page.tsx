import type { Metadata } from "next"

import { WaitlistForm } from "@/components/home/waitlist-form"

export const metadata: Metadata = { title: "Pro", description: "Keyframery Pro: ready-made screens and templates built on the cuts. Join the waitlist." }

const SCREENS = [
  { name: "Dashboard", what: "Tabs, live stats and a date range that loads without a jump" },
  { name: "Inbox", what: "Rows that open into the message and archive with an L-cut" },
  { name: "Chat", what: "Messages that fly from the composer and replies that rise in" },
  { name: "Settings", what: "Dialogs, sheets and confirmations that grow from their buttons" },
  { name: "Checkout", what: "A cart, a payment step and a status that punches in when it's paid" },
]

export default function Page() {
  return (
    <main className="mx-auto grid w-full max-w-[1200px] flex-1 gap-12 px-4 py-20 md:grid-cols-[1fr_1fr] md:gap-16">
      <div>
        <h1 className="text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">Pro is coming</h1>
        <p className="mt-5 max-w-[56ch] text-lg text-muted-foreground">
          The library stays free and open source. Pro will add ready-made app screens and page templates that already use every cut. It will be a
          one-time license per developer.
        </p>
        <div className="mt-10">
          <WaitlistForm source="pro" />
        </div>
      </div>
      <section aria-labelledby="pro-screens">
        <h2 id="pro-screens" className="text-lg font-semibold tracking-tight">What's in it</h2>
        <dl className="mt-4 divide-y border-y">
          {SCREENS.map((s) => (
            <div key={s.name} className="grid gap-1 py-3.5 sm:grid-cols-[8rem_1fr] sm:gap-4">
              <dt className="font-medium">{s.name}</dt>
              <dd className="text-muted-foreground">{s.what}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">Each screen comes in Base UI and Radix, and you copy it into your app like any shadcn block.</p>
      </section>
    </main>
  )
}
