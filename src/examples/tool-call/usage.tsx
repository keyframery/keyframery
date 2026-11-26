import { ToolCall } from "@/components/ui/tool-call"

export default function Usage() {
  return (
    <ToolCall
      name="find_order"
      title="Looked up order #1048"
      status="done"
      input={{ order_id: "1048" }}
      output={{ status: "shipped", carrier: "Royal Mail" }}
      duration={420}
    />
  )
}
