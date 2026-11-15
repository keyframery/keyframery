import { Inter } from "next/font/google"

import { ForceDark } from "@site/components/landing/scenes"
import { ByHand, Closing, Faq, Hero, Moves, Skill, Styles, Wall, WhatItIs } from "@site/components/landing/sections"
import { JsonLd, pageMetadata, projectData } from "@site/lib/seo"

// Inter with optical sizing: the Display cut at headline sizes. Only the landing uses it.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-lp-display", display: "swap" })

const description =
  "Keyframery is an open-source set of 60 animated components for UI SDK, built with plain CSS. They keep UI SDK's parts and props: swap one import, or let your coding agent do it with the Keyframery skill. Four motion styles change how the whole app moves."

/** The search snippet: Google cuts descriptions at about 155 characters. */
const metaDescription = "60 animated components for UI SDK, in plain CSS. Same parts and props: swap one import, or let your coding agent do it. Four motion styles."

export const metadata = pageMetadata({ absolute: "Keyframery: animated components for UI SDK", description: metaDescription, path: "/" })

export default function Page() {
  return (
    <div className={`lp dark ${display.variable} flex flex-1 flex-col`}>
      <ForceDark />
      <JsonLd data={projectData(description)} />
      <Hero />
      <WhatItIs />
      <Moves />
      <Styles />
      <Skill />
      <ByHand />
      <Wall />
      <Faq />
      <Closing />
    </div>
  )
}
