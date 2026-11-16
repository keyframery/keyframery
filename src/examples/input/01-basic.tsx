// Basic
// Any native input type. Pair it with a `label`, or use it inside a [Field](/docs/components/field).
import { Input } from "@/components/ui/input"

export default function InputBasic() {
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Email
        <Input type="email" placeholder="you@example.com" />
      </label>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Password
        <Input type="password" />
      </label>
    </div>
  )
}
