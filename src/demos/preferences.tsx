import { createPreference } from "@ui-sdk/core"

import { createMotionStyle, MotionStyleSwitcher, Preferences, PreferenceSwitcher } from "@/components/ui/preferences"

export const meta = { name: "Preferences", group: "Motion" }

/* Scoped and not saved in the lab, so the rest of the page keeps its own settings. In an app, add
   `storage: createLocalStorage("density")` to remember the choice, and `global: true` to put the
   attribute on <html>. */
const density = createPreference({
  values: ["comfortable", "compact"],
  defaultValue: "comfortable",
  attribute: "data-density",
})
const demoMotion = createMotionStyle({ global: false, storageKey: null })

const pick = (label: string, n: number) => `[aria-label="${label}"] [data-slot="segmented-control-item"]:nth-of-type(${n})`

/* The list tightens and loosens, and each time the motion style changes first, so the same
   change of density is felt calm, then playful, then springy. */
export const play = [
  { click: pick("Density", 2), wait: 1500 },
  { click: pick("Motion style", 1), wait: 800 },
  { click: pick("Density", 1), wait: 1700 },
  { click: pick("Motion style", 4), wait: 800 },
  { click: pick("Density", 2), wait: 1500 },
  { click: pick("Motion style", 2), wait: 800 },
  { click: pick("Density", 1), wait: 1700 },
]

const walks = [
  { name: "Seven Sisters cliff path", route: "Seaford to Eastbourne", km: 22, photo: "/demo/coast-1.jpg" },
  { name: "Regent's Canal towpath", route: "Little Venice to Limehouse", km: 14, photo: "/demo/canal.jpg" },
  { name: "Derwentwater loop", route: "From Keswick", km: 16, photo: "/demo/lake.jpg" },
  { name: "Durdle Door and back", route: "From Lulworth Cove", km: 5, photo: "/demo/coast-3.jpg" },
]

/* Everything a preference changes eases to its new value on the house spring, at the page's speed. */
const eased = "duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none"

export default function PreferencesDemo() {
  return (
    <Preferences preferences={[density, demoMotion]}>
      <div className="@container w-full max-w-[400px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[15px] font-semibold tracking-tight">Saved walks</div>
          <PreferenceSwitcher preference={density} aria-label="Density" />
        </div>

        <ul className={`mt-4 flex flex-col gap-2.5 transition-[gap] in-data-[density=compact]:gap-0.5 ${eased}`}>
          {walks.map((walk) => (
            <li key={walk.name} className={`flex items-center gap-3 transition-[gap] in-data-[density=compact]:gap-2 ${eased}`}>
              <img
                src={walk.photo}
                alt=""
                className={`size-11 shrink-0 rounded-[10px] bg-muted object-cover transition-[width,height,border-radius] in-data-[density=compact]:size-6 in-data-[density=compact]:rounded-[6px] ${eased}`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium">{walk.name}</div>
                {/* The second line folds away when the list is compact. */}
                <div className={`grid grid-rows-[1fr] transition-[grid-template-rows,opacity] in-data-[density=compact]:grid-rows-[0fr] in-data-[density=compact]:opacity-0 ${eased}`}>
                  <div className="min-h-0 overflow-hidden truncate text-[12px] text-muted-foreground">{walk.route}</div>
                </div>
              </div>
              <div className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{walk.km} km</div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 @max-[22rem]:flex-col @max-[22rem]:items-start">
          <div className="text-[12px] text-muted-foreground">Motion</div>
          <MotionStyleSwitcher preference={demoMotion} />
        </div>
      </div>
    </Preferences>
  )
}
