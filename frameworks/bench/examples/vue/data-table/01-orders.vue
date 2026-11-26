<script setup lang="ts">
// A list screen
// Search, filters with counts, sortable headers, selection, a row menu and a bulk bar, all from `data` and `columns`.

import { h } from "vue"
import { Download } from "@lucide/vue"

import { Badge } from "@/components/keyframery/badge"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/keyframery/data-table"
import { MenuItem } from "@/components/keyframery/menu"

type Member = { id: string; name: string; team: string; role: "Owner" | "Editor" | "Viewer"; trips: number }

const people = ["Maya Chen", "Tom Okafor", "Ines Duarte", "Sam Price", "Lena Brandt", "Joe Walsh", "Aiko Mori", "Ravi Shah", "Clara Ruiz", "Ola Nord", "Ben Carter", "Nia Evans"]
const teams = ["Lisbon", "Leeds", "Berlin"]
const roles = ["Owner", "Editor", "Viewer"] as const
const members: Member[] = people.map((name, i) => ({ id: String(i + 1), name, team: teams[i % 3], role: roles[(i * 7) % 3], trips: (i * 5) % 13 }))

const columns: DataTableColumnDef<Member>[] = [
  { id: "name", header: "Name", searchable: true, hideable: false, sticky: true, cell: (m) => h("span", { class: "font-medium" }, m.name) },
  { id: "team", header: "Team", filter: { options: teams.map((value) => ({ value })) } },
  { id: "role", header: "Role", filter: { options: roles.map((value) => ({ value })) }, cell: (m) => h(Badge, { variant: m.role === "Owner" ? "default" : "secondary" }, () => m.role) },
  { id: "trips", header: "Trips", align: "end", hideBelow: "sm" },
]
</script>

<template>
  <DataTable
    label="Team members"
    class="w-full max-w-[720px]"
    :data="members"
    :columns="columns"
    :default-page-size="5"
    :page-sizes="[5, 10, 20]"
    search-placeholder="Search people"
  >
    <template #row-actions>
      <MenuItem value="edit">Edit</MenuItem>
      <MenuItem value="remove" destructive>Remove</MenuItem>
    </template>
    <template #bulk-actions>
      <DataTableBulkAction label="Export">
        <template #icon>
          <Download :size="16" :stroke-width="1.75" aria-hidden="true" />
        </template>
      </DataTableBulkAction>
    </template>
  </DataTable>
</template>
