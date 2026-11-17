import type { ControlValues } from "@/lib/controls"

/** Build-time positions in the real example. Only literal defaults change in the browser. */
export type PreviewSource = {
  code: string
  bindings: Record<string, [number, number]>
  root: [number, number]
  importOffset: number
}

export function previewCode(source: PreviewSource, values: ControlValues, speed = 1): string {
  const edits: { start: number; end: number; text: string }[] = []
  for (const [name, [start, end]] of Object.entries(source.bindings)) {
    const value = values[name]
    if (value === undefined || (typeof value === "number" && !Number.isFinite(value))) continue
    edits.push({ start, end, text: JSON.stringify(value) })
  }
  if (Number.isFinite(speed) && speed > 0 && speed !== 1) {
    edits.push({ start: source.importOffset, end: source.importOffset, text: '\nimport { Speed as KeyframerySpeed } from "@/lib/keyframery"\n' })
    edits.push({ start: source.root[0], end: source.root[0], text: `<KeyframerySpeed speed={${speed}}>{` })
    edits.push({ start: source.root[1], end: source.root[1], text: "}</KeyframerySpeed>" })
  }
  let code = source.code
  for (const edit of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end)
  return code
}
