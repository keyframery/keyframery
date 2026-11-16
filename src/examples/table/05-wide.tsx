// Wide tables on a phone
// When the columns don't fit, the table scrolls sideways inside its container and the edge you can scroll toward fades. Narrow this window to see it.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const rows = [
  ["Lisbon", "Portugal", "545,000", "100 km²", "UTC+0", "Euro"],
  ["Kyoto", "Japan", "1,460,000", "828 km²", "UTC+9", "Yen"],
  ["Oslo", "Norway", "709,000", "454 km²", "UTC+1", "Krone"],
]

export default function TableWide() {
  return (
    <div className="w-full max-w-[340px] rounded-[12px] border">
      <Table>
        <TableHeader>
          <TableRow>
            {["City", "Country", "People", "Area", "Time zone", "Currency"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r[0]}>
              {r.map((cell, i) => (
                <TableCell key={i} className={i === 0 ? "font-medium" : undefined}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
