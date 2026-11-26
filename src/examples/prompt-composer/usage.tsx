import { PromptComposer } from "@/components/ui/prompt-composer"

export default function Usage() {
  return <PromptComposer placeholder="Ask anything…" onSubmit={({ text, attachments }) => console.log(text, attachments)} />
}
