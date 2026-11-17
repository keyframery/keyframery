import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Usage() {
  return (
    <Alert>
      <CircleAlert />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Your card expires at the end of the month.</AlertDescription>
    </Alert>
  )
}
