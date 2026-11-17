import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace"

export default function Usage() {
  return (
    <Trace>
      <TraceLine>
        <TraceIcon />
        <TraceTitle>Read the order history</TraceTitle>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon />
        <TraceTitle>Drafting the refund email</TraceTitle>
      </TraceLine>
    </Trace>
  )
}
