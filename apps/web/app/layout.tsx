import { Analytics } from "@vercel/analytics/next"
import { RootProvider } from "fumadocs-ui/provider/next"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { CutsControl } from "@/app/cuts-control"
import { SearchDialog } from "@/components/site/search-dialog"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./global.css"

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://keyframery.com"),
  title: { default: "Keyframery: animations for shadcn/ui, in one line", template: "%s | Keyframery" },
  description: "Add one line and your shadcn/ui app animates: dialogs grow from the button you clicked, tabs slide, and lists, numbers and loading states move instead of jumping. Your components don't change.",
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
