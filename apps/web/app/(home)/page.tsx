import { Hero } from "@/components/home/hero"
import { HomeStage } from "@/components/home/stage"

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <HomeStage />
    </main>
  )
}
