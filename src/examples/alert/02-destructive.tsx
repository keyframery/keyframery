// Destructive
// `variant="destructive"` tints the icon tile, the title and the hairline for something that went wrong.
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AlertDestructive() {
  return (
    <Alert variant="destructive" className="max-w-[420px]">
      <CircleAlert />
      <AlertTitle>Payment declined</AlertTitle>
      <AlertDescription>Your bank turned down the card ending 0412. Try another card or call them.</AlertDescription>
    </Alert>
  )
}
