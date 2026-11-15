import * as React from "react"

import { Pagination, PaginationList, PaginationRoll } from "@/components/ui/pagination"

export const meta = { name: "Pagination", group: "Navigation" }

const total = 186
const pageSize = 4

const names = [
  "Casa Alfama", "Hotel Lumen", "The Tagus Rooms", "Pátio 32", "Bairro Loft", "Rua Nova Suites",
  "Miradouro House", "Hotel Ribeira", "Azulejo Inn", "Chiado Studios", "Belém Garden", "Casa do Largo",
]
const areas = ["Alfama", "Baixa", "Chiado", "Belém", "Príncipe Real", "Graça"]

function resultsFor(page: number) {
  return Array.from({ length: Math.min(pageSize, total - (page - 1) * pageSize) }, (_, i) => {
    const n = (page - 1) * pageSize + i
    return {
      name: names[(n * 7) % names.length],
      area: areas[(n * 5) % areas.length],
      rating: (8 + ((n * 13) % 19) / 10).toFixed(1),
      price: 84 + ((n * 37) % 160),
    }
  })
}

/* The demo plays itself: the key glides one page, then far across the gap, then home. */
export const play = [
  { click: '[data-slot="pagination-next"]', wait: 1200 },
  { click: 'nav li:nth-last-child(2) [data-slot="pagination-link"]', wait: 1600 },
  { click: '[data-slot="pagination-previous"]', wait: 1200 },
  { click: 'nav li:nth-child(2) [data-slot="pagination-link"]', wait: 1600 },
  { click: 'nav li:nth-child(4) [data-slot="pagination-link"]', wait: 1600 },
]

export default function PaginationDemo() {
  const [page, setPage] = React.useState(3)
  const first = (page - 1) * pageSize + 1

  return (
    <div className="flex w-[420px] flex-col">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">Stays in Lisbon</h3>
        <span className="text-[12px] text-muted-foreground tabular-nums">
          <PaginationRoll value={first} /> to <PaginationRoll value={Math.min(first + pageSize - 1, total)} /> of {total}
        </span>
      </div>
      <ul className="mt-3 h-[236px] divide-y divide-border">
        {resultsFor(page).map((stay) => (
          <li key={`${page}-${stay.name}`} className="flex items-center gap-3 py-2.5 text-[13px]">
            <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-muted text-[12px] font-semibold text-muted-foreground tabular-nums">
              {stay.rating}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{stay.name}</span>
              <span className="block text-[12px] text-muted-foreground">{stay.area}</span>
            </span>
            <span className="font-medium tabular-nums">€{stay.price}</span>
          </li>
        ))}
      </ul>
      <Pagination
        aria-label="Results pages"
        total={total}
        pageSize={pageSize}
        page={page}
        onPageChange={setPage}
        className="mt-4 self-center"
      >
        <PaginationList />
      </Pagination>
    </div>
  )
}
