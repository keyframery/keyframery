import { Closing } from "@/components/home/closing"
import { Faq } from "@/components/home/faq"
import { Hero } from "@/components/home/hero"
import { InstallSteps } from "@/components/home/install-steps"
import { PaceSample } from "@/components/home/pace-sample"
import { SixKinds } from "@/components/home/six-kinds"
import { WallSection } from "@/components/home/wall-section"

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <SixKinds />
      <InstallSteps />
      <WallSection />
      <PaceSample />
      <Faq />
      <Closing />
    </main>
  )
}
