import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"

export default function Usage() {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Weekly backup</ItemTitle>
        <ItemDescription>Every Sunday at 2am</ItemDescription>
      </ItemContent>
      <ItemActions>On</ItemActions>
    </Item>
  )
}
