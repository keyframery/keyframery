// Required and optional
// `LabelMarker` adds a quiet note after the text.
import { Input } from "@/components/ui/input"
import { Label, LabelMarker } from "@/components/ui/label"

export default function LabelBasic() {
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full-name">
          Full name <LabelMarker>Required</LabelMarker>
        </Label>
        <Input id="full-name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company">
          Company <LabelMarker>Optional</LabelMarker>
        </Label>
        <Input id="company" />
      </div>
    </div>
  )
}
