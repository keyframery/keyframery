import { Agents } from "@/components/home/agents"
import { Closing } from "@/components/home/closing"
import { HomeExamples } from "@/components/home/examples"
import { Faq } from "@/components/home/faq"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { ThemePreview } from "@/components/home/theme-preview"
import { JsonLd, pageMetadata, projectData } from "@/lib/seo"

const description =
  "Keyframery is an open-source shadcn/ui animation library. Add one line for dialogs, tabs and toasts, plus helpers for lists, values and loading states."

export const metadata = pageMetadata({ absolute: "Keyframery: the shadcn/ui animation library, in one line", description, path: "/", markdown: "/index.md" })

export default function Page() {
  return (
    <main className="landing-page flex flex-1 flex-col">
      <JsonLd data={projectData(description)} />
      <Hero />
      <HomeExamples />
      <ThemePreview />
      <HowItWorks />
      <Agents />
      <Faq />
      <Closing />
    </main>
  )
}
