/* The controls a demo offers in the Customize panel under its preview.

   A demo declares them next to its `meta` and takes the same names as optional props:

     export const controls = {
       variant: { type: "select", label: "Variant", options: ["default", "primary"], default: "default" },
       disabled: { type: "switch", label: "Disabled", default: false },
       gap: { type: "slider", label: "Gap", min: 0, max: 24, step: 2, default: 8, unit: "px" },
       label: { type: "text", label: "Label", default: "Book trip" },
       fill: { type: "color", label: "Fill", default: "", group: "Colours" },
     } as const

     export default function ButtonDemo({ variant = "default", disabled = false, gap = 8, label = "Book trip", fill = "" }: {
       variant?: "default" | "primary"; disabled?: boolean; gap?: number; label?: string; fill?: string
     }) { … }

   A demo rendered with no props (the landing page, the gallery) falls back to the defaults, so the
   defaults in the function must match the ones here. The docs strip the `controls` block from the
   example code, which is why it is a plain object with no import.

   `group` records related controls for documentation. The compact panel keeps declaration order.
   A colour's default is "" when the component should keep its own theme colour until someone
   picks one: apply it only when it is not empty.

   Not declared here, because the panel adds it to every component: how long the motion takes. */
type Shared = { label: string; group?: string }

export type Control =
  | (Shared & { type: "slider"; min: number; max: number; step?: number; default: number; unit?: string })
  | (Shared & { type: "switch"; default: boolean })
  | (Shared & { type: "select"; options: readonly string[]; default: string })
  | (Shared & { type: "color"; default: string })
  | (Shared & { type: "text"; default: string })

export type Controls = Readonly<Record<string, Control>>

export type ControlValue = number | boolean | string

export type ControlValues = Record<string, ControlValue>

export function defaultValues(controls: Controls | undefined): ControlValues {
  return Object.fromEntries(Object.entries(controls ?? {}).map(([name, control]) => [name, control.default]))
}

/* "variant:primary,disabled:true,gap:12,fill:%23e5484d" from a URL, read against the demo's controls. */
export function parseValues(controls: Controls | undefined, text: string | null): ControlValues {
  const values = defaultValues(controls)
  for (const pair of (text ?? "").split(",")) {
    const at = pair.indexOf(":")
    if (at < 0) continue
    const name = pair.slice(0, at)
    const control = controls?.[name]
    if (!control) continue
    let raw: string
    try { raw = decodeURIComponent(pair.slice(at + 1)) }
    catch { continue }
    if (control.type === "slider") {
      const numeric = Number(raw)
      const value = Number.isFinite(numeric) ? numeric : control.default
      const step = control.step ?? 1
      const snapped = Number((control.min + Math.round((value - control.min) / step) * step).toFixed(10))
      values[name] = Math.min(control.max, Math.max(control.min, snapped))
    }
    else if (control.type === "switch") values[name] = raw === "true"
    else if (control.type === "select") values[name] = control.options.includes(raw) ? raw : control.default
    else values[name] = raw
  }
  return values
}
