import Link from "next/link"

import { PlaygroundStudio } from "@/components/docs/playground"

import { SectionHeading } from "./section-heading"

/** "Change anything with one prop": the docs' playground as one studio panel, inspector beside the stage. */
export function TryIt() {
  return (
    <section aria-labelledby="try-title" className="mx-auto w-full max-w-[1200px] px-4 pt-24 md:pt-36">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading id="try-title" title="Change anything with one prop">
          Pick how the dialog arrives, how fast, or switch it off, and copy the line that does it. Every component in the docs has the same controls.
        </SectionHeading>
        <div className="flex shrink-0 gap-5 text-[15px] font-medium md:pb-1">
          <Link href="/docs/components/dialog" className="underline underline-offset-4">
            Dialog docs
          </Link>
          <Link href="/theme" className="underline underline-offset-4">
            Motion themes
          </Link>
        </div>
      </div>
      <div className="mt-10">
        <PlaygroundStudio slug="dialog" />
      </div>
    </section>
  )
}
