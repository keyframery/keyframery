// Basic
// Arrow keys move the choice within the group. Wrap each radio in a `label`.
import { Radio, RadioGroup } from "@/components/ui/radio"

export default function RadioBasic() {
  return (
    <RadioGroup aria-label="Notifications" defaultValue="mentions" className="text-[13px]">
      <label className="flex items-center gap-2.5">
        <Radio value="all" />
        Everything
      </label>
      <label className="flex items-center gap-2.5">
        <Radio value="mentions" />
        Only mentions
      </label>
      <label className="flex items-center gap-2.5">
        <Radio value="none" />
        Nothing
      </label>
    </RadioGroup>
  )
}
