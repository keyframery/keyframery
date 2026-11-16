// With a value
// `SliderValue` shows the number, and `format` takes `Intl.NumberFormat` options.
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@/components/ui/slider"

export default function SliderBasic() {
  return (
    <Slider defaultValue={0.6} max={1} step={0.05} format={{ style: "percent" }} className="w-full max-w-[280px]">
      <div className="flex justify-between text-[13px]">
        <span id="volume-label" className="font-medium">
          Volume
        </span>
        <SliderValue className="text-muted-foreground" />
      </div>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-labelledby="volume-label" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  )
}
