import type { Metadata } from "next"
import Link from "next/link"

// One title and one robots rule: without this file the layout's "index, follow" and Next's own noindex both appear.
export const metadata: Metadata = {
  title: { absolute: "Page not found | Keyframery" },
  robots: { index: false, follow: true },
}

const LINKS: [label: string, href: string][] = [
  ["Quick start", "/docs/installation"],
  ["All components", "/docs/compatibility"],
  ["Examples", "/cuts"],
  ["Blog", "/blog"],
]

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-[560px] flex-1 content-center px-4 py-24">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-[-0.02em]">This page doesn&apos;t exist</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        The link may be old, or the page moved when the docs were reorganised. These are the places most people are looking for:
      </p>
      <ul className="mt-6 grid gap-2">
        {LINKS.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="underline underline-offset-4 hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Back to keyframery.com
        </Link>
      </p>
    </main>
  )
}
