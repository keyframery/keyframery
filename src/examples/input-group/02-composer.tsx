// Composer
// A textarea with a row under it (`block-end`). The count rolls as you type, and the send button, marked `data-show="filled"`, pops in with the first character.
import { ArrowUp } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupCount,
  InputGroupTextarea,
} from "@/components/ui/input-group"

export default function InputGroupComposer() {
  return (
    <InputGroup className="max-w-[380px]">
      <InputGroupTextarea aria-label="Reply" placeholder="Write a reply" maxLength={500} />
      <InputGroupAddon align="block-end">
        <InputGroupCount show="left" />
        <InputGroupButton variant="primary" size="icon-xs" aria-label="Send" data-show="filled" className="ms-auto rounded-full">
          <ArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
