import * as React from "react"

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

export const controls = {
  orientation: { type: "select", label: "Switcher orientation", default: "horizontal", options: ["horizontal", "vertical"] },
  disabled: { type: "switch", label: "Disable switchers", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: true, group: "Behaviour" },
  initialDensity: { type: "select", label: "Density", default: "comfortable", options: ["comfortable", "compact"] },
  title: { type: "text", label: "Heading", default: "Saved walks" },
  comfortable: { type: "text", label: "Comfortable label", default: "Comfortable" },
  compact: { type: "text", label: "Compact label", default: "Compact" },
  footer: { type: "text", label: "Footer label", default: "Motion" },
  items: { type: "slider", label: "Walks", default: 4, min: 1, max: 4, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", default: 400, min: 320, max: 480, step: 1, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Card padding", default: 20, min: 12, max: 28, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Switcher gap", default: 2, min: 0, max: 12, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Option height", default: 32, min: 28, max: 40, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Well corners", default: 12, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  track: { type: "color", label: "Well", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Selected key", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  selectedInk: { type: "color", label: "Selected text", default: "", group: "Colours" },
} as const

export default function PreferencesDemo({
  orientation = "horizontal",
  disabled = false,
  readOnly = false,
  required = false,
  loop = true,
  initialDensity = "comfortable",
  title = "Saved walks",
  comfortable = "Comfortable",
  compact = "Compact",
  footer = "Motion",
  items = 4,
  width = 400,
  padding = 20,
  gap = 2,
  height = 32,
  radius = 12,
  track = "",
  keyColour = "",
  ink = "",
  selectedInk = "",
}: {
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  loop?: boolean
  initialDensity?: "comfortable" | "compact"
  title?: string
  comfortable?: string
  compact?: string
  footer?: string
  items?: number
  width?: number
  padding?: number
  gap?: number
  height?: number
  radius?: number
  track?: string
  keyColour?: string
  ink?: string
  selectedInk?: string
}) {
  const theme = {
    "--preferences-height": `${height}px`,
    "--preferences-radius": `${radius}px`,
    "--preferences-key-radius": `${radius * 0.75}px`,
    "--preferences-gap": `${gap}px`,
    ...(selectedInk ? { "--preferences-selected-ink": selectedInk } : {}),
    ...(track ? { "--preferences-track": track } : {}),
    ...(keyColour ? { "--preferences-key": keyColour } : {}),
    ...(ink ? { "--preferences-ink": ink } : {}),
  } as React.CSSProperties
  React.useEffect(() => { density.set(initialDensity) }, [initialDensity])
  return (
    <Preferences preferences={[density, demoMotion]}>
      <div style={{ ...theme, maxWidth: width, padding }} className="@container w-full max-w-[400px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[15px] font-semibold tracking-tight">{title}</div>
          <PreferenceSwitcher preference={density} labels={{ comfortable, compact }} aria-label="Density" orientation={orientation} disabled={disabled} readOnly={readOnly} required={required} loop={loop} />
        </div>

        <ul className={`mt-4 flex flex-col gap-2.5 transition-[gap] in-data-[density=compact]:gap-0.5 ${eased}`}>
          {walks.slice(0, items).map((walk) => (
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

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 @max-[30rem]:flex-col @max-[30rem]:items-start">
          <div className="text-[12px] text-muted-foreground">{footer}</div>
          <MotionStyleSwitcher preference={demoMotion} className="@max-[24rem]:[--segmented-control-item-padding:0.5rem]" orientation={orientation} disabled={disabled} readOnly={readOnly} required={required} loop={loop} />
        </div>
      </div>
    </Preferences>
  )
}
