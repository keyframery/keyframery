// Groups and sizes
// `NativeSelectOptGroup` labels a set of options. `size="sm"` makes a 32px field for toolbars and tables.
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"

export default function NativeSelectGroups() {
  return (
    <NativeSelect aria-label="Time zone" size="sm" defaultValue="europe/lisbon">
      <NativeSelectOptGroup label="Europe">
        <NativeSelectOption value="europe/london">London</NativeSelectOption>
        <NativeSelectOption value="europe/lisbon">Lisbon</NativeSelectOption>
        <NativeSelectOption value="europe/berlin">Berlin</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Americas">
        <NativeSelectOption value="america/new_york">New York</NativeSelectOption>
        <NativeSelectOption value="america/mexico_city">Mexico City</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}
