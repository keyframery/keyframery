import { RootProvider } from "fumadocs-ui/provider/next"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import { CutsControl } from "@/app/cuts-control"
import { ClarityAnalytics } from "@/components/site/clarity-analytics"
import { SearchDialog } from "@/components/site/search-dialog"
import { WebMcp } from "@/components/site/web-mcp"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { configuredClarityId } from "@/lib/clarity"
import { JsonLd, SITE, siteData } from "@/lib/seo"

import "./global.css"

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// Analytics: keyframery.com runs through Cloudflare, which injects its Web Analytics beacon into every page ("Automatic setup").
// Don't add the beacon script here too: two beacons split the counts across two sites.

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
      <body className="flex min-h-screen flex-col" data-clarity-mask="true">
        <JsonLd data={siteData()} />
        {/* The agent discovery catalog (ARD); React moves this link into <head>. */}
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />
        <WebMcp />
        <ClarityAnalytics projectId={configuredClarityId()} />
        <RootProvider search={{ SearchDialog }}>
          <TooltipProvider>
            <CutsControl>{children}</CutsControl>
          </TooltipProvider>
          <Toaster />
        </RootProvider>
        {process.env.VERCEL_ENV === "production" && (
          <>
            <Script
              id="google-tag-loader"
              src="https://www.googletagmanager.com/gtag/js?id=G-R8KDF02XF8"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-R8KDF02XF8');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
