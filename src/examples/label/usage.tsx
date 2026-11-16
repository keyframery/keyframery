import { Input } from "@/components/ui/input"
import { Label, LabelMarker } from "@/components/ui/label"

export default function Usage() {
  return (
    <>
      <Label htmlFor="name">
        Name <LabelMarker>Required</LabelMarker>
      </Label>
      <Input id="name" required />
    </>
  )
}
