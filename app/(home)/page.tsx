import { Inter } from "next/font/google"

import { ForceDark } from "@site/components/landing/scenes"
import { AgentView, ByHand, Closing, Faq, Hero, Moves, Skill, Styles, WhatItIs } from "@site/components/landing/sections"
import { entries } from "@site/lib/catalog"
import product from "../../content/product.json"
import { JsonLd, pageMetadata, projectData } from "@site/lib/seo"

// Inter with optical sizing: the Display cut at headline sizes. Only the landing uses it.
const display = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-lp-display", display: "swap" })

/* Both come from content/product.json, the one description of Keyframery that the README, package.json
   and funding.json are stamped from too. */
const description = `${product.name} is ${product.tagline.replace(/^The /, "the ").replace(/\.$/, "")}: ${entries.length} components. ${product.summary}`

/** The search snippet: Google cuts descriptions at about 155 characters, and product.json keeps it within 160. No counts. */
const metaDescription = product.description

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
