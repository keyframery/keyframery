import { TriggerMenu, TriggerMenuContent, TriggerMenuInput, TriggerMenuItems, TriggerMenuList } from "@/components/ui/trigger-menu"

const people = [{ value: "maya", label: "Maya Chen" }]

export default function Usage() {
  return (
    <TriggerMenu triggers={[{ char: "@", items: people }]}>
      <TriggerMenuInput aria-label="Message" />
      <TriggerMenuContent>
        <TriggerMenuList>{(state) => <TriggerMenuItems items={state.items} />}</TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  )
}
