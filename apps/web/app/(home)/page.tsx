import { Closing } from "@/components/home/closing"
import { Faq } from "@/components/home/faq"
import { Hero } from "@/components/home/hero"
import { InstallSteps } from "@/components/home/install-steps"
import { MotionProfiles } from "@/components/home/motion-profiles"
import { SixKinds } from "@/components/home/six-kinds"
import { WallSection } from "@/components/home/wall-section"
import { JsonLd, pageMetadata, projectData } from "@/lib/seo"

const description =
  "Add one line and your shadcn/ui app animates: dialogs grow from their button, tabs slide, lists and loading states move. Pick a motion theme. Open source, 7 KB."

export const metadata = pageMetadata({ absolute: "Keyframery: the shadcn/ui animation library, in one line", description, path: "/", markdown: "/index.md" })

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={projectData(description)} />
      <Hero />
      <SixKinds />
      <InstallSteps />
      <WallSection />
      <MotionProfiles />
      <Faq />
      <Closing />
    </main>
  )
}
