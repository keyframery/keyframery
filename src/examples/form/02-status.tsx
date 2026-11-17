// Following the submission
// `onStatusChange` reports `submitting`, `success` and `error` with a reason. A rejected
// `submit` shows its message in `FormStatus`, read out as an alert.
import * as React from "react"

import { Form, FormItem, FormLabel, FormMessage, FormStatus, FormSubmit } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

export default function FormStatusExample() {
  const [status, setStatus] = React.useState("idle")
  return (
    <Form
      className="w-full max-w-[360px]"
      onStatusChange={(next) => setStatus(next)}
      submit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        throw new Error("The kitchen closed for orders at 21:30. Try again tomorrow from 11:00.")
      }}
    >
      <FormItem name="note">
        <FormLabel>Note for the kitchen</FormLabel>
        <Textarea required defaultValue="No coriander, please." />
        <FormMessage />
      </FormItem>
      <div className="flex items-center gap-3">
        <FormSubmit pendingLabel="Sending" successLabel="Sent">
          Send order
        </FormSubmit>
        <span className="text-[12px] text-muted-foreground tabular-nums">{status}</span>
      </div>
      <FormStatus />
    </Form>
  )
}
