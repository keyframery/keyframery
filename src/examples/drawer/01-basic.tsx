// Basic
// Slides up from the bottom. Drag the grip down, press Escape or tap outside to close it.
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerGrip,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export default function DrawerBasic() {
  return (
    <Drawer>
      <DrawerTrigger>Filters</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerGrip />
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow down 248 homes.</DrawerDescription>
        </DrawerHeader>
        <div className="px-5 py-4 text-[13px] text-muted-foreground">Price, bedrooms and more go here.</div>
        <DrawerFooter>
          <DrawerClose>Reset</DrawerClose>
          <DrawerClose variant="primary">Show homes</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
