// State in your hands
// Every piece of state is controlled or not: here the search, the filters, the sort and the page live in the page's own state, the way you would keep them in the URL.
import * as React from "react"

import { DataTable, type DataTableColumnDef, type DataTableFilterValues, type DataTableSort } from "@/components/ui/data-table"

type Trip = { id: string; city: string; month: string; nights: number }

const trips: Trip[] = ["Lisbon", "Porto", "Kyoto", "Oslo", "Seville", "Dublin", "Bristol", "Berlin"].flatMap((city, i) =>
  ["Mar", "Jun", "Sep"].map((month, j) => ({ id: `${city}-${month}`, city, month, nights: 2 + ((i + j * 3) % 6) })),
)

const columns: DataTableColumnDef<Trip>[] = [
  { id: "city", header: "City", searchable: true },
  { id: "month", header: "Month", filter: { options: ["Mar", "Jun", "Sep"].map((value) => ({ value })) }, sortValue: (t) => ["Mar", "Jun", "Sep"].indexOf(t.month) },
  { id: "nights", header: "Nights", align: "end" },
]

export default function DataTableControlled() {
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<DataTableFilterValues>({ month: ["Jun"] })
  const [sort, setSort] = React.useState<DataTableSort>({ id: "nights", direction: "descending" })
  const [page, setPage] = React.useState(1)
  return (
    <div className="flex w-full max-w-[560px] flex-col gap-3">
      <DataTable
        label="Trips"
        data={trips}
        columns={columns}
        selectable={false}
        defaultPageSize={5}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        page={page}
        onPageChange={setPage}
      />
      <code className="text-[12px] text-muted-foreground">
        ?q={search}&month={(filters.month ?? []).join(",")}&sort={sort ? `${sort.id}.${sort.direction}` : ""}&page={page}
      </code>
    </div>
  )
}
