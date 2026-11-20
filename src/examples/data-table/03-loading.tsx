// Loading
// `loading` keeps the toolbar and headers and draws skeleton rows at the table's own geometry, one per row of the page.
import { DataTable, type DataTableColumnDef } from "@/components/ui/data-table"

type Invoice = { id: string; client: string; due: string; amount: number }

const columns: DataTableColumnDef<Invoice>[] = [
  { id: "id", header: "Invoice", searchable: true },
  { id: "client", header: "Client", searchable: true },
  { id: "due", header: "Due" },
  { id: "amount", header: "Amount", align: "end" },
]

export default function DataTableLoading() {
  return <DataTable label="Invoices" className="w-full max-w-[640px]" data={[]} columns={columns} loading defaultPageSize={5} />
}
