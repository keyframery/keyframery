// Inline
// The area picks saturation and brightness, the slider picks hue, and the input takes a hex value.
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@/components/ui/color-picker"

export default function ColorPickerInline() {
  return (
    <ColorPicker defaultValue="#7c5cff" format="hex" aria-label="Accent colour" className="w-[240px]">
      <ColorPickerArea>
        <ColorPickerAreaThumb />
      </ColorPickerArea>
      <ColorPickerSlider channel="hue">
        <ColorPickerSliderThumb />
      </ColorPickerSlider>
      <div className="flex items-center gap-2">
        <ColorPickerInput aria-label="Hex" className="uppercase" />
        <ColorPickerEyeDropper aria-label="Pick from screen" />
      </div>
    </ColorPicker>
  )
}
