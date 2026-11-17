// Header and footer
// `ItemHeader` and `ItemFooter` take a full line above and below the row, for a picture or a status.
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from "@/components/ui/item"

export default function ItemHeaderExample() {
  return (
    <Item variant="muted" className="w-full max-w-[280px]">
      <ItemHeader>
        <img src="/demo/coast-2.jpg" alt="" className="aspect-[16/9] w-full rounded-[8px] object-cover" />
      </ItemHeader>
      <ItemContent>
        <ItemTitle>Porthcurno, Cornwall</ItemTitle>
        <ItemDescription>Cliff path to the Minack Theatre, 4.2 km</ItemDescription>
      </ItemContent>
      <ItemFooter className="text-[12px] text-muted-foreground">
        <span>Walked 2 Nov</span>
        <span className="tabular-nums">1 h 20 min</span>
      </ItemFooter>
    </Item>
  )
}
