// Rolling count
// `PaginationRoll` rolls a number to its new value, for a “21 to 40 of 240” line.
import * as React from "react"

import { Pagination, PaginationList, PaginationRoll } from "@/components/ui/pagination"

const total = 240
const pageSize = 20

export default function PaginationCount() {
  const [page, setPage] = React.useState(2)
  const first = (page - 1) * pageSize + 1
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[13px] text-muted-foreground tabular-nums">
        <PaginationRoll value={first} /> to <PaginationRoll value={Math.min(first + pageSize - 1, total)} /> of {total}
      </span>
      <Pagination aria-label="Results pages" total={total} pageSize={pageSize} page={page} onPageChange={setPage}>
        <PaginationList />
      </Pagination>
    </div>
  )
}
