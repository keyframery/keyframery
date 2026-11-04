import { Inter } from "next/font/google"

import { ByHand, Closing, Faq, Features, Hero, Skill, WhatItIs } from "@/components/landing/sections"
import { JsonLd, pageMetadata, projectData } from "@/lib/seo"

// Inter with optical sizing: the Display cut at headline sizes. Only the landing uses it.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-lp-display", display: "swap" })

const description =
  "Keyframery is an open-source motion layer for shadcn/ui. Install the skill and your coding agent adds it, or add one line yourself: dialogs, tabs, toasts, lists, numbers and loading states animate."

export const metadata = pageMetadata({ absolute: "Keyframery: the shadcn/ui animation library, in one line", description, path: "/", markdown: "/index.md" })

export default function Page() {
  return (
    <main className={`lp dark ${display.variable} flex flex-1 flex-col`}>
      <JsonLd data={projectData(description)} />
      <Hero />
      <WhatItIs />
      <Features />
      <Skill />
      <ByHand />
      <Faq />
      <Closing />
    </main>
  )
}
