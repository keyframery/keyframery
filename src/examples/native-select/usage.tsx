import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

export default function Usage() {
  return (
    <NativeSelect aria-label="Status" defaultValue="todo">
      <NativeSelectOption value="todo">To do</NativeSelectOption>
      <NativeSelectOption value="doing">In progress</NativeSelectOption>
      <NativeSelectOption value="done">Done</NativeSelectOption>
    </NativeSelect>
  )
}
