// Basic
// The browser's own picker, in a Keyframery field. Each new choice rises into the field and the chevron dips.
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export default function NativeSelectBasic() {
  return (
    <div className="flex w-full max-w-[260px] flex-col gap-2">
      <Label htmlFor="ns-size">Shoe size</Label>
      <NativeSelect id="ns-size" name="size" defaultValue="" wrapperClassName="w-full">
        <NativeSelectOption value="" disabled>
          Choose a size
        </NativeSelectOption>
        <NativeSelectOption value="40">EU 40</NativeSelectOption>
        <NativeSelectOption value="41">EU 41</NativeSelectOption>
        <NativeSelectOption value="42">EU 42</NativeSelectOption>
        <NativeSelectOption value="43">EU 43</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}
