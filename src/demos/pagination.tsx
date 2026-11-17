import * as React from "react"

import { Pagination, PaginationEllipsis, PaginationFirst, PaginationLast, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationList, PaginationRoll } from "@/components/ui/pagination"

export const meta = { name: "Pagination", group: "Navigation" }


const names = [
  "Casa Alfama", "Hotel Lumen", "The Tagus Rooms", "Pátio 32", "Bairro Loft", "Rua Nova Suites",
  "Miradouro House", "Hotel Ribeira", "Azulejo Inn", "Chiado Studios", "Belém Garden", "Casa do Largo",
]
const areas = ["Alfama", "Baixa", "Chiado", "Belém", "Príncipe Real", "Graça"]

function resultsFor(page: number, pageSize: number, total: number) {
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

export const controls = {
  total: { type: "slider", label: "Total stays", default: 186, min: 20, max: 400, step: 1, unit: "", group: "Results" },
  pageSize: { type: "slider", label: "Results per page", default: 4, min: 1, max: 6, step: 1, unit: "", group: "Results" },
  initialPage: { type: "slider", label: "Starting page", default: 3, min: 1, max: 10, step: 1, unit: "", group: "Results" },
  siblings: { type: "slider", label: "Sibling pages", default: 1, min: 0, max: 2, step: 1, unit: "", group: "Behaviour" },
  boundaries: { type: "slider", label: "Boundary pages", default: 1, min: 0, max: 2, step: 1, unit: "", group: "Behaviour" },
  edges: { type: "switch", label: "First and last buttons", default: false, group: "Behaviour" },
  showCount: { type: "switch", label: "Result count", default: true, group: "Behaviour" },
  title: { type: "text", label: "Heading", default: "Stays in Lisbon" },
  previousLabel: { type: "text", label: "Previous label", default: "" },
  nextLabel: { type: "text", label: "Next label", default: "" },
  width: { type: "slider", label: "Width", default: 420, min: 320, max: 600, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Page gap", default: 2, min: 0, max: 8, step: 1, unit: "px", group: "Layout" },
  size: { type: "slider", label: "Page size", default: 32, min: 28, max: 40, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Well corners", default: 12, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  keyRadius: { type: "slider", label: "Page corners", default: 9, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  track: { type: "color", label: "Well", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Current page", default: "", group: "Colours" },
  ink: { type: "color", label: "Labels", default: "", group: "Colours" },
  selectedInk: { type: "color", label: "Current label", default: "", group: "Colours" },
} as const

export default function PaginationDemo({
  total = 186,
  pageSize = 4,
  initialPage = 3,
  siblings = 1,
  boundaries = 1,
  edges = false,
  showCount = true,
  title = "Stays in Lisbon",
  previousLabel = "",
  nextLabel = "",
  width = 420,
  gap = 2,
  size = 32,
  radius = 12,
  keyRadius = 9,
  track = "",
  keyColour = "",
  ink = "",
  selectedInk = "",
}: {
  total?: number
  pageSize?: number
  initialPage?: number
  siblings?: number
  boundaries?: number
  edges?: boolean
  showCount?: boolean
  title?: string
  previousLabel?: string
  nextLabel?: string
  width?: number
  gap?: number
  size?: number
  radius?: number
  keyRadius?: number
  track?: string
  keyColour?: string
  ink?: string
  selectedInk?: string
}) {
  const theme = {
    "--pagination-size": `${size}px`,
    "--pagination-radius": `${radius}px`,
    "--pagination-key-radius": `${keyRadius}px`,
    "--pagination-gap": `${gap}px`,
    ...(selectedInk ? { "--pagination-selected-ink": selectedInk } : {}),
    ...(track ? { "--pagination-track": track } : {}),
    ...(keyColour ? { "--pagination-key": keyColour } : {}),
    ...(ink ? { "--pagination-ink": ink } : {}),
  } as React.CSSProperties
  const [page, setPage] = React.useState(initialPage)
  React.useEffect(() => setPage(Math.min(initialPage, Math.ceil(total / pageSize))), [initialPage, total, pageSize])
  const first = (page - 1) * pageSize + 1

  return (
    <div style={{ ...theme, maxWidth: width }} className="flex w-full max-w-[420px] flex-col">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <span hidden={!showCount} className="text-[12px] text-muted-foreground tabular-nums">
          <PaginationRoll value={first} /> to <PaginationRoll value={Math.min(first + pageSize - 1, total)} /> of {total}
        </span>
      </div>
      <ul style={{ height: pageSize * 59 }} className="mt-3 h-[236px] divide-y divide-border">
        {resultsFor(page, pageSize, total).map((stay) => (
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
        siblings={siblings}
        boundaries={boundaries}
        page={page}
        onPageChange={setPage}
        className="mt-4 self-center"
      >
        <PaginationList>
          {({ items }) => <>
            {edges && <PaginationItem><PaginationFirst /></PaginationItem>}
            <PaginationItem><PaginationPrevious>{previousLabel || undefined}</PaginationPrevious></PaginationItem>
            {items.map((item) => <PaginationItem key={item}>{typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}</PaginationItem>)}
            <PaginationItem><PaginationNext>{nextLabel || undefined}</PaginationNext></PaginationItem>
            {edges && <PaginationItem><PaginationLast /></PaginationItem>}
          </>}
        </PaginationList>
      </Pagination>
    </div>
  )
}
