// Disabled and invalid
// `disabled` dims it. `aria-invalid` marks an error, in red.
import { Input } from "@/components/ui/input"

export default function InputStates() {
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <Input disabled defaultValue="Locked after payment" aria-label="Reference" />
      <Input aria-invalid defaultValue="maya@" aria-label="Email" />
    </div>
  )
}
