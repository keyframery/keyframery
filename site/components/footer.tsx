import Link from "next/link"

import { builtOnNetlify } from "@site/lib/hosting"
import { REPO } from "@site/lib/shared"

import { LogoMark } from "./logo"

const GROUPS: { title: string; links: [label: string, href: string][] }[] = [
  { title: "Product", links: [["Components", "/docs/components"], ["Motion styles", "/docs/motion-styles"], ["Installation", "/docs/installation"], ["Changelog", "/docs/changelog"], ["Blog", "/blog"]] },
  { title: "Developers", links: [["AI tools", "/docs/ai-tools"], ["Swap the import", "/docs/swap-the-import"], ["GitHub", REPO], ["llms.txt", "/llms.txt"]] },
  { title: "More", links: [["Accessibility", "/docs/accessibility"], ["Troubleshooting", "/docs/troubleshooting"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
]

const linkClass = "underline-offset-4 hover:text-foreground hover:underline"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <div>
          <Link href="/" prefetch={false} className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <LogoMark className="size-5" />
            Keyframery
          </Link>
          <p className="mt-3 max-w-[34ch] text-sm text-muted-foreground">The component library for UI SDK. Animated in plain CSS, with Agent view on every component.</p>
          <p className="mt-6 text-sm text-muted-foreground">
            Made by{" "}
            <a href="https://x.com/briyan_dev" className="text-foreground underline underline-offset-4">
              Briyan Hingrajiya
            </a>
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.title} className="min-w-0">
              <p className="text-sm font-medium">{g.title}</p>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {g.links.map(([label, href]) => (
                  <li key={href} className="min-w-0 break-words">
                    {href.startsWith("/") && href !== "/llms.txt" ? (
                      <Link href={href} prefetch={false} className={linkClass}>
                        {label}
                      </Link>
                    ) : (
                      <a href={href} className={linkClass}>
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <p className="mx-auto w-full max-w-[1200px] border-t px-4 py-6 text-[13px] text-muted-foreground sm:px-6">
        © 2026 Keyframery. Code under the MIT license. An independent project, built on Vercel's UI SDK and the shadcn CLI.
        {builtOnNetlify && (
          <>
            {" "}
            <a href="https://www.netlify.com" className={linkClass}>
              This site is powered by Netlify
            </a>
            .
          </>
        )}
      </p>
      {/* The sign-off: the wordmark set edge to edge, fading from top to bottom, with a band of light that
          sweeps down through it like a playhead. Decorative, so it's hidden from screen readers. */}
      <div aria-hidden="true" className="kf-wordmark">
        <span>Keyframery</span>
      </div>
    </footer>
  )
}
