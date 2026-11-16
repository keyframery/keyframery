// With an icon and a clear button
// `InputGroup` lays an icon or text over the input's edges. `InputClear` empties it and appears only when there's something to clear.
import { Search } from "lucide-react"

import { Input, InputClear, InputGroup } from "@/components/ui/input"

export default function InputWithGroup() {
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <InputGroup>
        <Search />
        <Input aria-label="Search" defaultValue="Lisbon" placeholder="Search" />
        <InputClear aria-label="Clear" />
      </InputGroup>
      <InputGroup className="gap-0">
        <span>acme.com/</span>
        <Input aria-label="Page address" defaultValue="pricing" spellCheck={false} />
      </InputGroup>
    </div>
  )
}
