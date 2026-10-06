import { Hero } from "@/components/home/hero"
import { OneLine } from "@/components/home/one-line"
import { PaceSample } from "@/components/home/pace-sample"
import { SixKinds } from "@/components/home/six-kinds"
import { HomeStage } from "@/components/home/stage"
import { WaitlistForm } from "@/components/home/waitlist-form"

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <HomeStage />
      <OneLine />
      <SixKinds />
      <PaceSample />
      <section className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-24">
        <div className="grid gap-6 border-t pt-12 md:grid-cols-[1fr_1.15fr] md:items-end md:gap-12">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Get Pro when it opens</h2>
            <p className="mt-3 max-w-[60ch] text-muted-foreground">Ready-made app screens and page templates built on every cut. We&apos;ll email you once, on launch day.</p>
          </div>
          <WaitlistForm source="home" />
        </div>
      </section>
    </main>
  )
}
