import { Inter } from "next/font/google"

import { ForceDark } from "@site/components/landing/scenes"
import { AgentView, ByHand, Closing, Faq, Hero, Moves, Skill, Styles, WhatItIs } from "@site/components/landing/sections"
import { entries } from "@site/lib/catalog"
import { JsonLd, pageMetadata, projectData } from "@site/lib/seo"

// Inter with optical sizing: the Display cut at headline sizes. Only the landing uses it.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-lp-display", display: "swap" })

const description =
  `Keyframery is the open-source component library for UI SDK: ${entries.length} React components built on UI SDK, with motion in plain CSS, four motion styles, and Agent view on every component page to show what AI agents read.`

/** The search snippet: Google cuts descriptions at about 155 characters. */
const metaDescription = `${entries.length} free, open-source components built on Vercel's UI SDK, animated in plain CSS. Agent view shows what AI agents read on every component.`

export const metadata = pageMetadata({ absolute: "Keyframery: The Component Library for UI SDK", description: metaDescription, path: "/" })

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
