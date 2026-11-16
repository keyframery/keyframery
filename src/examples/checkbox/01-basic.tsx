// Basic
// Wrap it in a `label` so the text toggles it too.
import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxBasic() {
  return (
    <div className="flex flex-col gap-3 text-[13px]">
      <label className="flex items-center gap-2.5">
        <Checkbox defaultChecked />
        Email me about replies
      </label>
      <label className="flex items-center gap-2.5">
        <Checkbox />
        Email me about new followers
      </label>
      <label className="flex items-center gap-2.5 text-muted-foreground">
        <Checkbox disabled />
        Weekly digest (paused)
      </label>
    </div>
  )
}
