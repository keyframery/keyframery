import Link from "next/link"

import { InstallCommand } from "@/components/site/install-command"
import { INSTALL } from "@/lib/kinds"
import { PRO_ENABLED } from "@/lib/pro"

import { WaitlistForm } from "./waitlist-form"

export function Closing() {
  return (
    <section aria-labelledby="start-title" className="mx-auto w-full max-w-[1200px] px-4 pt-20 pb-16 md:pt-24 md:pb-20">
      {/* No box: the closing is the hero's line again, on the same fading dots. */}
      <div className="relative isolate flex flex-col items-center overflow-hidden rounded-3xl border bg-card px-5 py-12 text-center md:py-16">
        <div aria-hidden="true" className="dot-field pointer-events-none absolute inset-0 -z-10" />
        <h2 id="start-title" className="text-[36px] leading-[1.05] font-semibold tracking-[-0.035em] md:text-[56px]">
          Start with one line
        </h2>
        <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-muted-foreground md:text-lg">
          Install it, render <code className="font-mono text-[15px] text-foreground">{"<Cuts />"}</code> in your layout, then open any dialog in your app.
        </p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <InstallCommand command={INSTALL} />
          <Link
            href="/docs/installation"
            className="inline-flex h-11 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background outline-none hover:bg-foreground/85 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Add to my app
          </Link>
        </div>
        <p className="mt-5 text-[13px] text-muted-foreground">Free, open source and ready for your next project.</p>
      </div>
      {PRO_ENABLED && (
        <div className="mt-12 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-16">
          <div>
            <p className="text-[17px] font-semibold tracking-tight">Pro is coming</p>
            <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              Ready-made app screens and page templates built on every cut. We&apos;ll email you once, on launch day.
            </p>
          </div>
          <WaitlistForm source="home" />
        </div>
      )}
    </section>
  )
}
