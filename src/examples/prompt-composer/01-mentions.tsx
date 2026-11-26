// Mentions and commands
// `mentions` open at the caret after @ and `commands` after / at the start of the message. Each item can carry an icon, a detail and a group; choosing one inserts its label.
import { PromptComposer, type PromptComposerItem } from "@/components/ui/prompt-composer"

const mentions: PromptComposerItem[] = [
  { value: "4821", label: "Order #4821", description: "Shipped", group: "Orders" },
  { value: "4819", label: "Order #4819", description: "Packing", group: "Orders" },
  { value: "amara", label: "Amara Okafor", description: "3 orders", group: "Customers" },
]

const commands: PromptComposerItem[] = [
  { value: "track", label: "track", description: "Where a parcel is" },
  { value: "refund", label: "refund", description: "Start a refund" },
]

export default function PromptComposerMentions() {
  return (
    <PromptComposer
      className="max-w-[480px]"
      placeholder="Type @ for an order, / for a command"
      mentions={mentions}
      commands={commands}
      accept={false}
      counter="none"
    />
  )
}
