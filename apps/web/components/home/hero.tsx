import Link from "next/link"

import { InstallCommand } from "@/components/site/install-command"

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pt-14 pb-8 md:pt-20">
      <h1 className="max-w-[14ch] text-[44px] leading-[1.02] font-semibold tracking-[-0.03em] md:text-[64px]">Your UI is full of jump cuts.</h1>
      <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
        A dialog pops in. A tab swaps. A list item appears from nowhere. Keyframery gives shadcn/ui the cuts a film editor would make, with one
        line. Your components stay yours.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <InstallCommand command="npx shadcn add @keyframery/cuts" />
        <Link href="/docs/installation" className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90">
          Get started
        </Link>
      </div>
    </section>
  )
}
