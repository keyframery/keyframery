// Controlled and invalid
// Pass `value` and `onValueChange` to own the choice, and `invalid` to mark it wrong. A change from code moves like a pick.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export default function NativeSelectControlled() {
  const [seat, setSeat] = React.useState("aisle")
  return (
    <div className="flex flex-col items-start gap-3">
      <NativeSelect aria-label="Seat" value={seat} onValueChange={setSeat} invalid={seat === "exit"}>
        <NativeSelectOption value="window">Window</NativeSelectOption>
        <NativeSelectOption value="aisle">Aisle</NativeSelectOption>
        <NativeSelectOption value="exit">Exit row</NativeSelectOption>
      </NativeSelect>
      <Button size="sm" onClick={() => setSeat("window")}>
        Pick a window seat
      </Button>
    </div>
  )
}
