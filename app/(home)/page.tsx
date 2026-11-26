import { Inter } from "next/font/google"

import { ForceDark } from "@site/components/landing/scenes"
import { AgentView, ByHand, Closing, Faq, Hero, Moves, Skill, Styles, WhatItIs } from "@site/components/landing/sections"
import { entries } from "@site/lib/catalog"
import { JsonLd, pageMetadata, projectData } from "@site/lib/seo"

// Inter with optical sizing: the Display cut at headline sizes. Only the landing uses it.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-lp-display", display: "swap" })

const description =
  `Keyframery is the open-source component library for UI SDK: ${entries.length} React components built on UI SDK, with motion in plain CSS that is quiet by default and lively in four more styles, and Agent view on every component page to show what AI agents read.`

/** The search snippet: Google cuts descriptions at about 155 characters. No counts: Google keeps old snippets for days. */
const metaDescription =
  "Free, open-source React components built on Vercel's UI SDK, animated in plain CSS. Install with the shadcn CLI, theme with your tokens, see what agents read."

export const metadata = pageMetadata({ absolute: "Keyframery: Animated Component Library for Vercel UI SDK", description: metaDescription, path: "/" })

export default function Page() {
  return (
    <div className={`lp dark ${display.variable} flex flex-1 flex-col`}>
      <ForceDark />
      <JsonLd data={projectData(description)} />
      <Hero />
      <WhatItIs />
      <AgentView />
      <Moves />
      <Styles />
      <Skill />
      <ByHand />
      <Faq />
      <Closing />
    </div>
  )
}
