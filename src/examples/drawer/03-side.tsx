// From the side
// `side="right"` slides it in from the edge, for a cart or a details panel.
import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

export default function DrawerSide() {
  return (
    <Drawer side="right">
      <DrawerTrigger>Open cart</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Your cart</DrawerTitle>
        </DrawerHeader>
        <p className="px-5 py-4 text-[13px] text-muted-foreground">2 items, £48.00</p>
        <div className="px-5">
          <DrawerClose variant="primary">Check out</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
