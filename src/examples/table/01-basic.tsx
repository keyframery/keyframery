// Basic
// A header, a body, a footer for totals and a caption. Rows cascade in when the table first shows.
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const invoices = [
  { id: "INV-001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: 150 },
  { id: "INV-003", status: "Paid", method: "Bank transfer", amount: 350 },
  { id: "INV-004", status: "Paid", method: "Card", amount: 450 },
]

const euro = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "EUR" })

export default function TableBasic() {
  return (
    <Table className="w-full max-w-[520px]">
      <TableCaption>Your recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-medium">{inv.id}</TableCell>
            <TableCell>{inv.status}</TableCell>
            <TableCell>{inv.method}</TableCell>
            <TableCell className="text-right">{euro(inv.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">{euro(1200)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
