// A bar of filters, controlled
// The value is always a list of strings. Reset slides in while any filter in the bar is active and clears them all.
import * as React from "react"

import { Filter, FilterBar, FilterBarReset } from "@/components/ui/filter"

const tasks = [
  { title: "Renew SSL certificate", status: "todo", owner: "ana" },
  { title: "Ship invoice export", status: "done", owner: "leo" },
  { title: "Fix checkout tax", status: "doing", owner: "ana" },
  { title: "Draft holiday email", status: "todo", owner: "sam" },
]

export default function FilterBarExample() {
  const [status, setStatus] = React.useState<string[]>([])
  const [owner, setOwner] = React.useState<string[]>([])
  const count = (key: "status" | "owner", value: string) =>
    tasks.filter((task) => task[key] === value && (key === "status" ? !owner.length || owner.includes(task.owner) : !status.length || status.includes(task.status))).length
  const shown = tasks.filter((task) => (!status.length || status.includes(task.status)) && (!owner.length || owner.includes(task.owner)))

  return (
    <div className="flex w-full max-w-md flex-col gap-3 text-[13px]">
      <FilterBar>
        <Filter
          label="Status"
          value={status}
          onValueChange={setStatus}
          options={["todo", "doing", "done"].map((value) => ({ value, label: { todo: "To do", doing: "In progress", done: "Done" }[value]!, count: count("status", value) }))}
        />
        <Filter
          label="Owner"
          value={owner}
          onValueChange={setOwner}
          options={["ana", "leo", "sam"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1), count: count("owner", value) }))}
        />
        <FilterBarReset />
      </FilterBar>
      <ul className="text-muted-foreground">
        {shown.map((task) => (
          <li key={task.title}>{task.title}</li>
        ))}
      </ul>
    </div>
  )
}
