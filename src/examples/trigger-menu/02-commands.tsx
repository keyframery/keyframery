// Slash commands
// Each trigger has its own list. `insert` decides the text that goes in.
import { TriggerMenu, TriggerMenuContent, TriggerMenuInput, TriggerMenuItems, TriggerMenuList } from "@/components/ui/trigger-menu"

const people = [
  { value: "maya", label: "Maya Chen" },
  { value: "tom", label: "Tom Okafor" },
]
const commands = [
  { value: "date", label: "date" },
  { value: "todo", label: "todo" },
  { value: "table", label: "table" },
]

export default function TriggerMenuCommands() {
  return (
    <div className="w-full max-w-[360px]">
      <TriggerMenu
        triggers={[
          { char: "@", items: people },
          { char: "/", items: commands, insert: (item) => `/${item.label} ` },
        ]}
      >
        <TriggerMenuInput aria-label="Note" placeholder="Type / for commands or @ for people" />
        <TriggerMenuContent className="w-56">
          <TriggerMenuList>{(state) => <TriggerMenuItems items={state.items} />}</TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </div>
  )
}
