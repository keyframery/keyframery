// Mentions
// Typing @ opens a list of people that filters as you keep typing. Enter or Tab inserts the name.
import { TriggerMenu, TriggerMenuContent, TriggerMenuEmpty, TriggerMenuInput, TriggerMenuItems, TriggerMenuList } from "@/components/ui/trigger-menu"

const people = [
  { value: "maya", label: "Maya Chen" },
  { value: "tom", label: "Tom Okafor" },
  { value: "ines", label: "Ines Duarte" },
  { value: "sam", label: "Sam Price" },
]

export default function TriggerMenuMentions() {
  return (
    <div className="w-full max-w-[360px]">
      <TriggerMenu triggers={[{ char: "@", items: people }]}>
        <TriggerMenuInput aria-label="Comment" placeholder="Type @ to mention someone" />
        <TriggerMenuContent className="w-56">
          <TriggerMenuEmpty>No one by that name</TriggerMenuEmpty>
          <TriggerMenuList>{(state) => <TriggerMenuItems items={state.items} />}</TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </div>
  )
}
