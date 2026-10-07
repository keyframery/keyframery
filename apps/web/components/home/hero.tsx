import Link from "next/link"

import { InstallCommand } from "@/components/site/install-command"

import { BeforeAfter } from "./before-after"

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pt-14 text-center md:pt-20">
        <h1 id="hero-title" className="text-[40px] leading-[1.04] font-semibold tracking-[-0.035em] text-balance sm:text-[52px] md:text-[68px]">
          Add one line. <span className="md:block">Your shadcn/ui app animates.</span>
        </h1>
        <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-pretty text-muted-foreground md:text-lg">
          <span className="md:block">Dialogs grow from the button you clicked. Tabs slide instead of snapping.</span>{" "}
          <span className="md:block">Lists, numbers and loading states move instead of jumping.</span>{" "}
          <span className="md:block">Your components don&apos;t change.</span>
        </p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <InstallCommand command="npx shadcn add @keyframery/cuts" />
          <Link
            href="/docs/installation"
            className="inline-flex h-11 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background outline-none hover:bg-foreground/85 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Get started
          </Link>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Works with Base UI and Radix, in Next.js, Vite and React Router.</p>
      </div>
      <BeforeAfter />
    </section>
  )
}
