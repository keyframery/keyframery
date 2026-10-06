import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { Suspense } from "react"
import { FixtureToaster } from "@/components/kf-fixture/extra"
import { KfCuts } from "@/components/kf-fixture/kf-cuts"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
          <FixtureToaster />
          <Suspense>
            <KfCuts />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
