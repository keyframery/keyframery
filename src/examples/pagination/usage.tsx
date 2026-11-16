import { Pagination, PaginationList } from "@/components/ui/pagination"

export default function Usage() {
  return (
    <Pagination aria-label="Pages" total={120} pageSize={10}>
      <PaginationList />
    </Pagination>
  )
}
