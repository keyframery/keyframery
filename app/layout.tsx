import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"

import { SiteProvider } from "@site/components/provider"
import { JsonLd, SITE_IMAGE, siteData } from "@site/lib/seo"
import { SITE } from "@site/lib/shared"

import "./globals.css"

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", preload: false, display: "swap" })

// Pages set their own title, description, canonical URL and social tags (site/lib/seo.tsx); these are the site-wide defaults.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Keyframery: the component library for UI SDK", template: "%s | Keyframery" },
  description: "Open-source components built on UI SDK, animated in plain CSS. Agent view shows what AI agents read on every component page.",
  applicationName: "Keyframery",
  authors: [{ name: "Briyan Hingrajiya" }],
  creator: "Briyan Hingrajiya",
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  openGraph: { type: "website", siteName: "Keyframery", url: SITE, images: SITE_IMAGE },
  twitter: { card: "summary_large_image", creator: "@briyan_dev", images: SITE_IMAGE },
}

/** Microsoft Clarity (heatmaps and session recordings) runs on production only, with the project ID from Vercel. */
const clarityId = process.env.VERCEL_ENV === "production" ? process.env.CLARITY_PROJECT_ID?.trim() : undefined
const clarity = clarityId && /^[a-z0-9]{1,32}$/i.test(clarityId) ? clarityId : null

/* Applied before the first paint: the motion style the visitor picked last time. */
const boot = `try{var m=localStorage.getItem("kf-motion-style");if(m&&/^(calm|springy|snappy|playful)$/.test(m))document.documentElement.setAttribute("data-motion",m)}catch(e){}`

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <JsonLd data={siteData()} />
        <SiteProvider>{children}</SiteProvider>
        {process.env.VERCEL_ENV === "production" && (
          <>
            <Script id="google-tag-loader" src="https://www.googletagmanager.com/gtag/js?id=G-R8KDF02XF8" strategy="lazyOnload" />
            <Script id="google-analytics" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-R8KDF02XF8');`}
            </Script>
            {clarity && (
              <Script id="microsoft-clarity" strategy="afterInteractive">
                {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",${JSON.stringify(clarity)});`}
              </Script>
            )}
          </>
        )}
      </body>
    </html>
  )
}
