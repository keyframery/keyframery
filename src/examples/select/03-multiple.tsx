// Several values
// `multiple` keeps it open while you pick. The trigger lists the choices, and `maxLabels` shortens a long list to “and 2 more”.
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectTrigger, SelectValue } from "@/components/ui/select"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function SelectMultiple() {
  return (
    <Select multiple defaultValue={["Monday", "Wednesday"]} placeholder="Choose days">
      <SelectTrigger aria-label="Days" className="w-[260px]">
        <SelectValue maxLabels={2} />
      </SelectTrigger>
      <SelectContent>
        {days.map((day) => (
          <SelectItem key={day} value={day}>
            <SelectItemText>{day}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
