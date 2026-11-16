// Basic
// With a label, a placeholder and a check on the chosen item.
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

const fruits = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]

export default function SelectBasic() {
  return (
    <div className="w-full max-w-[220px]">
      <Select placeholder="Pick a fruit">
        <SelectLabel>Fruit</SelectLabel>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fruits.map((fruit) => (
            <SelectItem key={fruit} value={fruit}>
              <SelectItemText>{fruit}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
