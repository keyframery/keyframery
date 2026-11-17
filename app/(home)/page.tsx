import { Inter } from "next/font/google"

import { ForceDark } from "@site/components/landing/scenes"
import { ByHand, Closing, Faq, Hero, Moves, Skill, Styles, WhatItIs } from "@site/components/landing/sections"
import { entries } from "@site/lib/catalog"
import { JsonLd, pageMetadata, projectData } from "@site/lib/seo"

// Inter with optical sizing: the Display cut at headline sizes. Only the landing uses it.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-lp-display", display: "swap" })

const description =
  `Keyframery is an open-source set of ${entries.length} animated components built on UI SDK components and core, with motion in plain CSS. Keep UI SDK parts and props, customize colours and sizes, and choose from four motion styles.`

/** The search snippet: Google cuts descriptions at about 155 characters. */
const metaDescription = `Explore ${entries.length} animated components built on Vercel's UI SDK. Customize colours, sizes and motion, then install with one command. Free and open source.`

export const metadata = pageMetadata({ absolute: "Keyframery: Animated UI SDK Components for React", description: metaDescription, path: "/" })

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
      <Faq />
      <Closing />
    </div>
  )
}
