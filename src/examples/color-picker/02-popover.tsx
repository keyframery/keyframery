// In a popover
// Wrap the parts in `ColorPickerPopover`. The trigger shows the current colour with `ColorPickerSwatch`.
import * as React from "react"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerInput,
  ColorPickerPopover,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker"

export default function ColorPickerInPopover() {
  const [color, setColor] = React.useState("#0090ff")
  return (
    <ColorPicker value={color} onValueChange={setColor} format="hex" aria-label="Label colour">
      <ColorPickerPopover>
        <ColorPickerTrigger aria-label="Change colour">
          <ColorPickerSwatch />
          <span className="tabular-nums uppercase">{color}</span>
        </ColorPickerTrigger>
        <ColorPickerContent>
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>
          <ColorPickerSlider channel="hue">
            <ColorPickerSliderThumb />
          </ColorPickerSlider>
          <ColorPickerInput aria-label="Hex" className="uppercase" />
        </ColorPickerContent>
      </ColorPickerPopover>
    </ColorPicker>
  )
}
