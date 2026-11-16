// Vertical
// `orientation="vertical"` stands it up, for an equaliser or a zoom control.
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@/components/ui/slider"

export default function SliderVertical() {
  return (
    <div className="flex h-[160px] gap-6">
      {[40, 70, 55, 30].map((value, i) => (
        <Slider key={i} defaultValue={value} orientation="vertical" aria-label={`Band ${i + 1}`}>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      ))}
    </div>
  )
}
