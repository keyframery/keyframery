import { TypeTable } from "fumadocs-ui/components/type-table"
import * as React from "react"

/* A part's props, read from its types by scripts/lib/props.mjs. Descriptions are plain text with
   `code` in backticks. */
type Row = { name: string; type: string; full?: string; default?: string | null; description?: string; required?: boolean }

function inline(text: string) {
  return text.split(/(`[^`]+`)/g).map((bit, i) => (bit.startsWith("`") && bit.endsWith("`") ? <code key={i}>{bit.slice(1, -1)}</code> : bit))
}

export function PropsTable({ rows }: { rows: Row[] }) {
  const type = Object.fromEntries(
    rows.map((row) => [
      row.name,
      {
        type: row.type,
        typeDescription: row.full && row.full !== row.type ? <code className="whitespace-pre-wrap break-words">{row.full}</code> : undefined,
        default: row.default ?? undefined,
        description: row.description ? <>{inline(row.description)}</> : undefined,
        required: row.required,
      },
    ]),
  )
  return <TypeTable type={type} />
}
