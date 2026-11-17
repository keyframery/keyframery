import { type Controls, type ControlValues, parseValues } from "@/lib/controls"

export const previewPreferencesKey = (slug: string) => `keyframery:playground:v1:${slug}`

/** Restore only settings that still exist in this component's current controls. */
export function readPreviewPreferences(text: string | null, controls: Controls | undefined): { values: ControlValues; speed: number } {
  const empty = { values: {}, speed: 1 }
  if (!text) return empty
  try {
    const saved: unknown = JSON.parse(text)
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return empty
    const { values, speed } = saved as { values?: Record<string, unknown>; speed?: unknown }
    const pairs = Object.entries(controls ?? {}).flatMap(([name, control]) => {
      const value = values?.[name]
      if (typeof value !== typeof control.default) return []
      if (control.type === "slider" && !Number.isFinite(value)) return []
      if (control.type === "color" && value !== "" && !/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(String(value))) return []
      return [`${name}:${encodeURIComponent(String(value))}`]
    })
    const parsed = parseValues(controls, pairs.join(","))
    return {
      values: Object.fromEntries(Object.entries(parsed).filter(([name, value]) => value !== controls?.[name]?.default)),
      speed: typeof speed === "number" && Number.isFinite(speed) ? Math.max(0.4, Math.min(2, speed)) : 1,
    }
  } catch {
    return empty
  }
}

/** Empty settings remove the saved override, so Reset remains reset after another load. */
export function writePreviewPreferences(values: ControlValues, controls: Controls | undefined, speed: number): string | null {
  const changed = Object.fromEntries(Object.entries(controls ?? {}).flatMap(([name, control]) => {
    const value = values[name]
    return value !== undefined && value !== control.default ? [[name, value]] : []
  }))
  return Object.keys(changed).length || speed !== 1 ? JSON.stringify({ values: changed, speed }) : null
}
