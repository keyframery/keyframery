// Sortable columns
// Give a header `sort` and `onSort` and it becomes a button with an arrow that turns over on a spring. It sets `aria-sort` for screen readers.
import * as React from "react"

import { type SortDirection, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const people = [
  { name: "Maya Chen", team: "Design", joined: 2021 },
  { name: "Tom Okafor", team: "Engineering", joined: 2019 },
  { name: "Ines Duarte", team: "Product", joined: 2023 },
  { name: "Sam Price", team: "Engineering", joined: 2022 },
]

type Key = "name" | "joined"

export default function TableSortable() {
  const [sort, setSort] = React.useState<{ key: Key; dir: Exclude<SortDirection, "none"> }>({ key: "name", dir: "ascending" })
  const rows = [...people].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0
    return sort.dir === "ascending" ? order : -order
  })
  const by = (key: Key) => () => setSort((s) => ({ key, dir: s.key === key && s.dir === "ascending" ? "descending" : "ascending" }))
  return (
    <Table className="w-full max-w-[460px]">
      <TableHeader>
        <TableRow>
          <TableHead sort={sort.key === "name" ? sort.dir : "none"} onSort={by("name")}>
            Name
          </TableHead>
          <TableHead>Team</TableHead>
          <TableHead sort={sort.key === "joined" ? sort.dir : "none"} onSort={by("joined")}>
            Joined
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.name}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell>{p.team}</TableCell>
            <TableCell>{p.joined}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
