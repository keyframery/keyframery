import Link from "next/link"

import { LogoMark } from "./logo"

const GROUPS: { title: string; links: [label: string, href: string][] }[] = [
  { title: "Product", links: [["Docs", "/docs"], ["Cuts", "/cuts"], ["Theme", "/theme"], ["Pro", "/pro"]] },
  { title: "Developers", links: [["AI tools", "/docs/ai-tools"], ["GitHub", "https://github.com/keyframery/keyframery"], ["llms.txt", "/llms.txt"]] },
  { title: "Company", links: [["briyan@keyframery.com", "mailto:briyan@keyframery.com"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
]

const linkClass = "underline-offset-4 hover:text-foreground hover:underline"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <LogoMark className="size-5" />
            Keyframery
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">Animations for shadcn/ui.</p>
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
                    {href.startsWith("/") ? (
                      <Link href={href} className={linkClass}>
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
      <p className="mx-auto w-full max-w-[1200px] border-t px-4 py-6 text-[13px] text-muted-foreground">© 2026 Keyframery. Code under the MIT license.</p>
    </footer>
  )
}
