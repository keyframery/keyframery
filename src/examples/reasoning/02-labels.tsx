// Your own labels
// `thinkingLabel` and `doneLabel` on the trigger change its words; `doneLabel` gets the seconds. Set `autoClose={false}` to leave the thinking open once it ends.
import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ui/reasoning"

export default function ReasoningLabels() {
  return (
    <Reasoning className="max-w-[380px]" duration={14} defaultOpen autoClose={false}>
      <ReasoningTrigger thinkingLabel="Checking the menu…" doneLabel={(seconds) => `Checked the menu in ${seconds} seconds`} />
      <ReasoningContent>{"Two of the six mains are vegetarian, and the risotto can be made without butter. That covers *both* of your guests."}</ReasoningContent>
    </Reasoning>
  )
}
