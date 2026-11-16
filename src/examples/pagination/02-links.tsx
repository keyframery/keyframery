// As links
// `getHref` makes every page a real link, so each page has its own URL and works without JavaScript.
import { Pagination, PaginationList } from "@/components/ui/pagination"

export default function PaginationLinks() {
  return (
    <Pagination aria-label="Blog pages" pageCount={8} defaultPage={2} getHref={(page) => `#page-${page}`}>
      <PaginationList />
    </Pagination>
  )
}
