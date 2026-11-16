import { createLocalStorage, createPreference } from "@ui-sdk/core"

import { Preferences, PreferenceSwitcher } from "@/components/ui/preferences"

const view = createPreference({
  values: ["list", "grid"],
  defaultValue: "list",
  attribute: "data-view",
  storage: createLocalStorage("files-view"),
})

export default function Usage() {
  return (
    <Preferences preferences={[view]}>
      <PreferenceSwitcher preference={view} aria-label="View" />
      <ul className="grid gap-2 in-data-[view=grid]:grid-cols-2">
        <li>Q3 roadmap.pdf</li>
        <li>Launch checklist.md</li>
      </ul>
    </Preferences>
  )
}
