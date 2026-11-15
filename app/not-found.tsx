import Link from "next/link"

import { SiteFooter } from "@site/components/footer"
import { LogoMark } from "@site/components/logo"

export const metadata = { title: "Page not found", robots: { index: false, follow: true } }

export default function NotFound() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-4 py-32 text-center">
        <LogoMark className="size-10" />
        <p className="mt-8 font-mono text-[13px] text-muted-foreground">404</p>
        <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.025em]">This page isn&apos;t here</h1>
        <p className="mt-3 text-[16px] text-muted-foreground">It may have moved when Keyframery became a component library for UI SDK.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/docs/components" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            Browse components
          </Link>
          <Link href="/" className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
            Home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
