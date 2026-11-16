// Range
// Pass two values for two thumbs. `minStepsBetweenThumbs` keeps them apart.
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@/components/ui/slider"

export default function SliderRange() {
  return (
    <Slider
      defaultValue={[80, 240]}
      min={0}
      max={400}
      step={10}
      minStepsBetweenThumbs={2}
      format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
      className="w-full max-w-[280px]"
    >
      <div className="flex justify-between text-[13px]">
        <span className="font-medium">Price per night</span>
        <SliderValue className="text-muted-foreground" />
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb index={0} aria-label="Minimum price" />
          <SliderThumb index={1} aria-label="Maximum price" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  )
}
