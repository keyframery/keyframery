// A call that fails
// With `status="error"` the card opens on its own and shows `error` in place of the output. `openOnError={false}` keeps it closed; `onOpenChange` hears `details.reason === "status-error"`.
import { ToolCall } from "@/components/ui/tool-call"

export default function ToolCallFailure() {
  return (
    <ToolCall
      className="max-w-[420px]"
      name="track_parcel"
      title="Couldn't reach the courier"
      status="error"
      input={{ carrier: "royal_mail", tracking: "RM 2048 1196 GB" }}
      error="Royal Mail's tracking page didn't answer within 10 seconds."
    />
  )
}
