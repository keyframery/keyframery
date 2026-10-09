import { Agents } from "@/components/home/agents"
import { Closing } from "@/components/home/closing"
import { ComponentExplorer } from "@/components/home/component-explorer"
import { Faq } from "@/components/home/faq"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { SixKinds } from "@/components/home/six-kinds"
import { TryIt } from "@/components/home/try-it"
import { WallSection } from "@/components/home/wall-section"
import { JsonLd, pageMetadata, projectData } from "@/lib/seo"

const description =
  "Add one line and every shadcn/ui component animates: dialogs grow from their button, tabs slide, ticks draw, lists move. Pick a motion theme. Open source."

export const metadata = pageMetadata({ absolute: "Keyframery: the shadcn/ui animation library, in one line", description, path: "/", markdown: "/index.md" })

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={projectData(description)} />
      {/* What it is, how it works, what moves, how to change it, then everything else. */}
      <Hero />
      <HowItWorks />
      <SixKinds />
      <TryIt />
      <ComponentExplorer />
      <WallSection />
      <Agents />
      <Faq />
      <Closing />
    </main>
  )
}
