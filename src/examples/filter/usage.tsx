import { Filter } from "@/components/ui/filter"

export default function Usage() {
  return (
    <Filter
      label="Status"
      options={[
        { value: "paid", label: "Paid", count: 12 },
        { value: "pending", label: "Pending", count: 4 },
      ]}
    />
  )
}
