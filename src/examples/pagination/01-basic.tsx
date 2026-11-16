// Basic
// Give it `total` and `pageSize` and it works out the pages, with ellipses for the long gaps.
import * as React from "react"

import { Pagination, PaginationList } from "@/components/ui/pagination"

export default function PaginationBasic() {
  const [page, setPage] = React.useState(4)
  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination aria-label="Results pages" total={240} pageSize={20} page={page} onPageChange={setPage}>
        <PaginationList />
      </Pagination>
      <span className="text-[12px] text-muted-foreground tabular-nums">Page {page} of 12</span>
    </div>
  )
}
