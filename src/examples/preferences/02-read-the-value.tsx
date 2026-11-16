// Read the value
// `usePreference` gives a component the current value, so it can render differently, not only restyle.
import { createPreference } from "@ui-sdk/core"

import { Preferences, PreferenceSwitcher, usePreference } from "@/components/ui/preferences"

const units = createPreference({
  values: ["km", "miles"],
  defaultValue: "km",
  attribute: "data-units",
})

const walks = [
  { name: "Seven Sisters cliff path", km: 22 },
  { name: "Derwentwater loop", km: 16 },
]

function Distance({ km }: { km: number }) {
  const { value } = usePreference(units)
  return <span className="text-muted-foreground tabular-nums">{value === "km" ? `${km} km` : `${(km * 0.621).toFixed(1)} mi`}</span>
}

export default function PreferencesReadTheValue() {
  return (
    <Preferences preferences={[units]}>
      <div className="flex w-full max-w-[300px] flex-col gap-3 text-[13.5px]">
        <PreferenceSwitcher preference={units} labels={{ km: "Kilometres", miles: "Miles" }} aria-label="Units" />
        {walks.map((walk) => (
          <div key={walk.name} className="flex items-center justify-between gap-3">
            <span>{walk.name}</span>
            <Distance km={walk.km} />
          </div>
        ))}
      </div>
    </Preferences>
  )
}
