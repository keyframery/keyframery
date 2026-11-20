// A list screen
// Search, filters with counts, sortable headers, selection, a row menu and a bulk bar, all from `data` and `columns`.
import { Download } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/ui/data-table"
import { MenuItem } from "@/components/ui/menu"

type Member = { id: string; name: string; team: string; role: "Owner" | "Editor" | "Viewer"; trips: number }

const people = ["Maya Chen", "Tom Okafor", "Ines Duarte", "Sam Price", "Lena Brandt", "Joe Walsh", "Aiko Mori", "Ravi Shah", "Clara Ruiz", "Ola Nord", "Ben Carter", "Nia Evans"]
const teams = ["Lisbon", "Leeds", "Berlin"]
const roles = ["Owner", "Editor", "Viewer"] as const
const members: Member[] = people.map((name, i) => ({ id: String(i + 1), name, team: teams[i % 3], role: roles[(i * 7) % 3], trips: (i * 5) % 13 }))

const columns: DataTableColumnDef<Member>[] = [
  { id: "name", header: "Name", searchable: true, hideable: false, sticky: true, cell: (m) => <span className="font-medium">{m.name}</span> },
  { id: "team", header: "Team", filter: { options: teams.map((value) => ({ value })) } },
  { id: "role", header: "Role", filter: { options: roles.map((value) => ({ value })) }, cell: (m) => <Badge variant={m.role === "Owner" ? "default" : "secondary"}>{m.role}</Badge> },
  { id: "trips", header: "Trips", align: "end", hideBelow: "sm" },
]

export default function DataTableMembers() {
  return (
    <DataTable
      label="Team members"
      className="w-full max-w-[720px]"
      data={members}
      columns={columns}
      defaultPageSize={5}
      pageSizes={[5, 10, 20]}
      searchPlaceholder="Search people"
      rowActions={() => (
        <>
          <MenuItem value="edit">Edit</MenuItem>
          <MenuItem value="remove" destructive>
            Remove
          </MenuItem>
        </>
      )}
      bulkActions={() => <DataTableBulkAction icon={<Download size={16} strokeWidth={1.75} aria-hidden />} label="Export" />}
    />
  )
}
