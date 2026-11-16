// A saved choice
// The text size goes on a `data-size` attribute and the paragraph styles by it. Storage keeps the choice, so it is still there after a reload.
import { createLocalStorage, createPreference } from "@ui-sdk/core"

import { Preferences, PreferenceSwitcher } from "@/components/ui/preferences"

const size = createPreference({
  values: ["small", "medium", "large"],
  defaultValue: "medium",
  attribute: "data-size",
  storage: createLocalStorage("kf-example-text-size"),
})

export default function PreferencesSavedChoice() {
  return (
    <Preferences preferences={[size]}>
      <div className="flex w-full max-w-[340px] flex-col items-center gap-4">
        <PreferenceSwitcher preference={size} aria-label="Text size" />
        <p className="text-center text-[14px] leading-[1.5] transition-[font-size] duration-[calc(380ms*var(--kf-speed,1))] ease-spring in-data-[size=large]:text-[17px] in-data-[size=small]:text-[12px] motion-reduce:transition-none">
          The path climbs out of Seaford and follows the cliff edge all the way to Birling Gap.
        </p>
      </div>
    </Preferences>
  )
}
