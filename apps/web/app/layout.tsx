import { Analytics } from "@vercel/analytics/next"
import { RootProvider } from "fumadocs-ui/provider/next"
import type { Metadata } from "next"
import { Geist_Mono, Schibsted_Grotesk } from "next/font/google"

import { CutsControl } from "@/app/cuts-control"
import { SearchDialog } from "@/components/site/search-dialog"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./global.css"

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://keyframery.com"),
  title: { default: "Keyframery: film cuts for shadcn/ui", template: "%s | Keyframery" },
  description: "Your UI is full of jump cuts. Keyframery gives every shadcn dialog, sheet, tab and toast a real cut, with one line.",
  openGraph: { type: "website", siteName: "Keyframery", url: "https://keyframery.com" },
  twitter: { card: "summary_large_image" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog }}>
          <TooltipProvider>
            <CutsControl>{children}</CutsControl>
          </TooltipProvider>
          <Toaster />
        </RootProvider>
        {/* Vercel serves the analytics script; elsewhere it would 404. */}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  )
}
