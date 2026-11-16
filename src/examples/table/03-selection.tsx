// Selecting rows
// Put a [Checkbox](/docs/components/checkbox) in the first column and pass `selected` to the row. The header's checkbox shows a dash when only some are ticked.
import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const files = [
  { id: "1", name: "Brief.pdf", size: "1.2 MB" },
  { id: "2", name: "Moodboard.fig", size: "18.4 MB" },
  { id: "3", name: "Budget.xlsx", size: "320 KB" },
]

export default function TableSelection() {
  const [picked, setPicked] = React.useState<string[]>(["2"])
  const all = picked.length === files.length
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  return (
    <Table className="w-full max-w-[420px]">
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox
              aria-label="Select all files"
              checked={all ? true : picked.length ? "indeterminate" : false}
              onCheckedChange={() => setPicked(all ? [] : files.map((f) => f.id))}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((f) => (
          <TableRow key={f.id} selected={picked.includes(f.id)}>
            <TableCell>
              <Checkbox aria-label={`Select ${f.name}`} checked={picked.includes(f.id)} onCheckedChange={() => toggle(f.id)} />
            </TableCell>
            <TableCell className="font-medium">{f.name}</TableCell>
            <TableCell className="text-right text-muted-foreground">{f.size}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
