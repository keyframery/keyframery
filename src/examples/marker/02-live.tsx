// A status that finishes
// `live` makes the marker a status that screen readers read out. While `pending`, a light sweeps
// across the words; when it turns off, the finished text rises in.
import { Check, LoaderCircle } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export default function MarkerLive() {
  const [pending, setPending] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className="flex w-full max-w-[360px] flex-col items-start gap-4">
      <Marker live pending={pending}>
        <MarkerIcon key={String(pending)}>{pending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" /> : <Check />}</MarkerIcon>
        <MarkerContent>{pending ? "Exporting 214 invoices" : "Export ready, 214 invoices"}</MarkerContent>
      </Marker>
      <Button
        size="sm"
        onClick={() => {
          setPending(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setPending(false), 2400)
        }}
      >
        Export again
      </Button>
    </div>
  )
}
