/* Shared by the value parts whose React default content is a digit roll (chars.map): the static
   extraction keeps only the empty boxes, so swap them for the Roll in lib/keyframery.ts. */
export function useRoll(src, replace, { centered = false } = {}) {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { Roll } from "@/lib/keyframery"\nimport { cn } from "@/lib/utils"`)
  const from = src.slice(src.indexOf(`        <span class="sr-only" />`), src.indexOf(`      </slot>`))
  if (!from.includes("sr-only")) throw new Error("roll: generated value part changed")
  return replace(src, from, `        <Roll :text="String(scope?.state?.text ?? '')"${centered ? " centered" : ""} />\n`)
}
