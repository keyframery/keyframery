// Speed
// `speed` changes how fast it moves. Click each one and watch the label make way for the spinner.
import { Button } from "@/components/ui/button"

const wait = () => new Promise((resolve) => setTimeout(resolve, 1400))

export default function ButtonSpeed() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button speed="fast" onClick={wait}>
        Fast
      </Button>
      <Button onClick={wait}>Normal</Button>
      <Button speed="slow" onClick={wait}>
        Slow
      </Button>
    </div>
  )
}
