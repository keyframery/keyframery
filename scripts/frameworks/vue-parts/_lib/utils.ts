/* cn for Keyframery's Vue components: clsx + tailwind-merge, like shadcn's. */
import { twMerge } from "tailwind-merge"

export type ClassValue = string | number | bigint | null | boolean | undefined | ClassValue[] | Record<string, unknown>

function flatten(value: ClassValue, out: string[]) {
  if (!value) return
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") out.push(String(value))
  else if (Array.isArray(value)) for (const v of value) flatten(v, out)
  else if (typeof value === "object") for (const [k, v] of Object.entries(value)) if (v) out.push(k)
}

export function cn(...inputs: ClassValue[]) {
  const out: string[] = []
  flatten(inputs, out)
  return twMerge(out.join(" "))
}
