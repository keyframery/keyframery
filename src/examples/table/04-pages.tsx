// With pages
// Give each row a stable `key`. When the page changes, the new rows cascade in; after a sort, rows that only moved stay still.
import * as React from "react"

import { Pagination, PaginationList } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const logs = Array.from({ length: 24 }, (_, i) => ({ id: 2400 - i, path: ["/", "/pricing", "/docs", "/blog", "/login"][i % 5], ms: 40 + ((i * 37) % 300) }))
const pageSize = 6

export default function TablePages() {
  const [page, setPage] = React.useState(1)
  const rows = logs.slice((page - 1) * pageSize, page * pageSize)
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead>Path</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">#{r.id}</TableCell>
              <TableCell className="font-medium">{r.path}</TableCell>
              <TableCell className="text-right">{r.ms} ms</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination aria-label="Log pages" total={logs.length} pageSize={pageSize} page={page} onPageChange={setPage} className="self-center">
        <PaginationList />
      </Pagination>
    </div>
  )
}
