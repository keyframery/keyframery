import { RootProvider } from "fumadocs-ui/provider/next"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import { CutsControl } from "@/app/cuts-control"
import { SearchDialog } from "@/components/site/search-dialog"
import { WebMcp } from "@/components/site/web-mcp"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { JsonLd, SITE, siteData } from "@/lib/seo"

import "./global.css"

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

/** Cloudflare Web Analytics: cookieless page views, visits, referrers and Core Web Vitals. The token is public by design. */
const CF_BEACON = '{"token": "2d1c5de994f6404b8b35cbcf7218ca94"}'

// Pages set their own title, description, canonical URL and social tags (lib/seo.tsx); these are the site-wide defaults.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Keyframery: the shadcn/ui animation library, in one line", template: "%s | Keyframery" },
  description: "Add one line and your shadcn/ui app animates: dialogs grow from the button you clicked, tabs slide, and lists and loading states move.",
  applicationName: "Keyframery",
  authors: [{ name: "Briyan Hingrajiya", url: "https://x.com/briyan_dev" }],
  creator: "Briyan Hingrajiya",
  // Let search and AI answers quote as much as they need, and show large previews.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: "Keyframery", url: SITE },
  twitter: { card: "summary_large_image", creator: "@briyan_dev" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={siteData()} />
        {/* The agent discovery catalog (ARD); React moves this link into <head>. */}
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />
        <WebMcp />
        <RootProvider search={{ SearchDialog }}>
          <TooltipProvider>
            <CutsControl>{children}</CutsControl>
          </TooltipProvider>
          <Toaster />
        </RootProvider>
        {/* Only on the live site, so local runs and tests aren't counted. */}
        {process.env.VERCEL_ENV === "production" ? <Script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={CF_BEACON} strategy="afterInteractive" /> : null}
      </body>
    </html>
  )
}
